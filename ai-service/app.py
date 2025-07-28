from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import easyocr
import os
import requests
from googletrans import Translator
import base64
import io
import json

app = Flask(__name__)
CORS(app)

class MangaProcessor:
    def __init__(self):
        self.ocr_reader = easyocr.Reader(['ja', 'en', 'ko', 'zh'])
        self.translator = Translator()
        
    def download_image(self, url):
        try:
            # Validate URL scheme to prevent SSRF attacks
            from urllib.parse import urlparse
            parsed_url = urlparse(url)
            
            if parsed_url.scheme not in ['http', 'https']:
                raise Exception("Only HTTP and HTTPS URLs are allowed")
            
            # Block private IP ranges and localhost
            import socket
            hostname = parsed_url.hostname
            if hostname:
                try:
                    ip = socket.gethostbyname(hostname)
                    # Block localhost, private networks, and link-local addresses
                    if (ip.startswith('127.') or 
                        ip.startswith('10.') or 
                        ip.startswith('192.168.') or 
                        ip.startswith('172.') or
                        ip.startswith('169.254.') or
                        ip == '0.0.0.0'):
                        raise Exception("Access to private/local addresses is not allowed")
                except socket.gaierror:
                    raise Exception("Invalid hostname")
            
            # Set timeout and size limits
            response = requests.get(
                url, 
                headers={'User-Agent': 'MangaAI-Bot/1.0'}, 
                timeout=10,
                stream=True
            )
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                raise Exception("URL does not point to a valid image")
            
            # Check file size (max 10MB)
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > 10 * 1024 * 1024:
                raise Exception("Image file too large (max 10MB)")
            
            # Download with size limit
            content = b''
            for chunk in response.iter_content(chunk_size=8192):
                content += chunk
                if len(content) > 10 * 1024 * 1024:  # 10MB limit
                    raise Exception("Image file too large (max 10MB)")
            
            image = Image.open(io.BytesIO(content))
            temp_path = f"temp/downloaded_{abs(hash(url))}.jpg"
            image.save(temp_path)
            return temp_path
        except Exception as e:
            raise Exception(f"Failed to download image: {str(e)}")
    
    def detect_text_areas(self, image_path):
        image = cv2.imread(image_path)
        results = self.ocr_reader.readtext(image)
        
        text_areas = []
        for (bbox, text, confidence) in results:
            if confidence > 0.5:
                text_areas.append({
                    'bbox': bbox,
                    'text': text,
                    'confidence': confidence
                })
        
        return text_areas, image
    
    def translate_text(self, text, target_lang='en'):
        try:
            result = self.translator.translate(text, dest=target_lang)
            return result.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def remove_text_from_image(self, image, text_areas):
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        
        for area in text_areas:
            bbox = np.array(area['bbox'], dtype=np.int32)
            cv2.fillPoly(mask, [bbox], 255)
        
        inpainted = cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)
        return inpainted
    
    def add_translated_text(self, image, text_areas, target_lang='en'):
        pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(pil_image)
        
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        for area in text_areas:
            original_text = area['text']
            translated_text = self.translate_text(original_text, target_lang)
            
            bbox = area['bbox']
            center_x = sum([point[0] for point in bbox]) / 4
            center_y = sum([point[1] for point in bbox]) / 4
            
            bbox_width = max([point[0] for point in bbox]) - min([point[0] for point in bbox])
            bbox_height = max([point[1] for point in bbox]) - min([point[1] for point in bbox])
            
            lines = self.wrap_text(translated_text, font, bbox_width - 10)
            
            total_height = len(lines) * 25
            start_y = center_y - total_height / 2
            
            for i, line in enumerate(lines):
                line_width = draw.textlength(line, font=font)
                x = center_x - line_width / 2
                y = start_y + i * 25
                
                draw.rectangle([x-2, y-2, x+line_width+2, y+22], fill='white', outline='black')
                draw.text((x, y), line, fill='black', font=font)
        
        return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    
    def wrap_text(self, text, font, max_width):
        words = text.split()
        lines = []
        current_line = ""
        
        for word in words:
            test_line = current_line + (" " if current_line else "") + word
            if hasattr(font, 'getlength'):
                width = font.getlength(test_line)
            else:
                width = len(test_line) * 10
                
            if width <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        
        if current_line:
            lines.append(current_line)
        
        return lines if lines else [text]
    
    def colorize_manga(self, image):
        try:
            from diffusers import StableDiffusionImg2ImgPipeline
            import torch
            
            pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
            
            if torch.cuda.is_available():
                pipe = pipe.to("cuda")
            
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            prompt = "colorful manga artwork, vibrant colors, anime style, detailed illustration"
            
            result = pipe(prompt=prompt, image=pil_image, strength=0.7).images[0]
            
            return cv2.cvtColor(np.array(result), cv2.COLOR_RGB2BGR)
            
        except Exception as e:
            print(f"Coloring error: {e}")
            return image

processor = MangaProcessor()

@app.route('/process', methods=['POST'])
def process_manga():
    try:
        data = request.json
        image_path = data.get('imagePath')
        target_language = data.get('targetLanguage', 'en')
        enable_coloring = data.get('enableColoring', False)
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image file not found'}), 400
        
        text_areas, original_image = processor.detect_text_areas(image_path)
        
        cleaned_image = processor.remove_text_from_image(original_image, text_areas)
        
        translated_image = processor.add_translated_text(cleaned_image, text_areas, target_language)
        
        if enable_coloring:
            translated_image = processor.colorize_manga(translated_image)
        
        output_path = f"temp/processed_{os.path.basename(image_path)}"
        cv2.imwrite(output_path, translated_image)
        
        with open(output_path, "rb") as img_file:
            img_base64 = base64.b64encode(img_file.read()).decode()
        
        return jsonify({
            'success': True,
            'processedImage': f"data:image/jpeg;base64,{img_base64}",
            'textAreas': len(text_areas),
            'outputPath': output_path
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/process-url', methods=['POST'])
def process_url():
    try:
        data = request.json
        url = data.get('url')
        target_language = data.get('targetLanguage', 'en')
        enable_coloring = data.get('enableColoring', False)
        
        image_path = processor.download_image(url)
        
        text_areas, original_image = processor.detect_text_areas(image_path)
        
        cleaned_image = processor.remove_text_from_image(original_image, text_areas)
        
        translated_image = processor.add_translated_text(cleaned_image, text_areas, target_language)
        
        if enable_coloring:
            translated_image = processor.colorize_manga(translated_image)
        
        output_path = f"temp/processed_url_{hash(url)}.jpg"
        cv2.imwrite(output_path, translated_image)
        
        with open(output_path, "rb") as img_file:
            img_base64 = base64.b64encode(img_file.read()).decode()
        
        return jsonify({
            'success': True,
            'processedImage': f"data:image/jpeg;base64,{img_base64}",
            'textAreas': len(text_areas),
            'outputPath': output_path
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs('temp', exist_ok=True)
    app.run(host='0.0.0.0', port=5001, debug=True)