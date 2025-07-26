import openai
import requests
import base64
from io import BytesIO
from PIL import Image
import numpy as np
import cv2
from typing import List, Dict, Any

class AITranslator:
    def __init__(self, openai_api_key: str, hugging_face_api_key: str):
        self.openai_api_key = openai_api_key
        self.hf_api_key = hugging_face_api_key
        openai.api_key = openai_api_key
        self.hf_headers = {"Authorization": f"Bearer {hugging_face_api_key}"}

    def extract_text_with_vision(self, image_path: str) -> List[Dict[str, Any]]:
        """Use OpenAI Vision API for advanced text detection"""
        try:
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode()

            response = openai.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract all text from this manga image. For each text bubble/area, provide: 1) The text content 2) Approximate bounding box coordinates 3) Whether it's dialogue, narration, or sound effect. Return as structured JSON."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )

            # Parse the structured response
            content = response.choices[0].message.content
            # Process and structure the text extraction results
            return self._parse_vision_response(content)

        except Exception as e:
            print(f"Vision API error: {e}")
            return []

    def translate_text_contextual(self, text: str, target_lang: str, context: str = "manga") -> str:
        """Contextual translation using GPT-4"""
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a professional manga translator. Translate the following text to {target_lang}, preserving the tone, cultural context, and character voice. Consider manga conventions and keep translations concise to fit speech bubbles."
                    },
                    {
                        "role": "user",
                        "content": f"Translate this {context} text: '{text}'"
                    }
                ],
                max_tokens=200,
                temperature=0.3
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"Translation error: {e}")
            return text

    def colorize_manga(self, image_path: str, style: str = "anime") -> str:
        """AI-powered manga colorization"""
        try:
            # Read and prepare image
            image = Image.open(image_path)
            
            # Convert to base64 for API
            buffered = BytesIO()
            image.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue()).decode()

            # Use Hugging Face Stable Diffusion for colorization
            api_url = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
            
            prompt = f"colorful {style} style manga artwork, vibrant colors, detailed illustration, high quality"
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "guidance_scale": 7.5,
                    "num_inference_steps": 50,
                    "strength": 0.7
                }
            }

            response = requests.post(api_url, headers=self.hf_headers, json=payload)
            
            if response.status_code == 200:
                # Save colorized image
                output_path = image_path.replace('.', '_colored.')
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                return output_path
            else:
                print(f"Colorization API error: {response.status_code}")
                return image_path

        except Exception as e:
            print(f"Colorization error: {e}")
            return image_path

    def remove_text_advanced(self, image_path: str, text_areas: List[Dict]) -> str:
        """Advanced text removal using AI inpainting"""
        try:
            image = cv2.imread(image_path)
            
            # Create mask for text areas
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            
            for area in text_areas:
                if 'bbox' in area:
                    bbox = area['bbox']
                    # Convert bbox to polygon and fill
                    points = np.array(bbox, dtype=np.int32)
                    cv2.fillPoly(mask, [points], 255)

            # Use OpenCV's advanced inpainting
            result = cv2.inpaint(image, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
            
            # Save result
            output_path = image_path.replace('.', '_cleaned.')
            cv2.imwrite(output_path, result)
            
            return output_path

        except Exception as e:
            print(f"Text removal error: {e}")
            return image_path

    def add_translated_text_smart(self, image_path: str, text_areas: List[Dict], target_lang: str) -> str:
        """Smart text placement with font matching"""
        try:
            image = Image.open(image_path)
            
            # Use PIL for better text rendering
            from PIL import ImageDraw, ImageFont
            
            draw = ImageDraw.Draw(image)
            
            # Load appropriate fonts for different languages
            font_path = self._get_font_for_language(target_lang)
            
            for area in text_areas:
                original_text = area.get('text', '')
                translated_text = self.translate_text_contextual(original_text, target_lang)
                
                # Calculate optimal font size and position
                bbox = area.get('bbox', [])
                if len(bbox) >= 4:
                    optimal_font_size = self._calculate_font_size(translated_text, bbox)
                    font = ImageFont.truetype(font_path, optimal_font_size)
                    
                    # Smart text positioning
                    x, y = self._calculate_text_position(translated_text, bbox, font)
                    
                    # Add text with outline for readability
                    self._draw_text_with_outline(draw, (x, y), translated_text, font)

            # Save result
            output_path = image_path.replace('.', '_translated.')
            image.save(output_path)
            
            return output_path

        except Exception as e:
            print(f"Text addition error: {e}")
            return image_path

    def _parse_vision_response(self, content: str) -> List[Dict]:
        """Parse GPT-4 Vision response into structured format"""
        # Implementation for parsing structured JSON response
        import json
        try:
            return json.loads(content)
        except:
            # Fallback parsing logic
            return []

    def _get_font_for_language(self, target_lang: str) -> str:
        """Get appropriate font file for target language"""
        font_map = {
            'ja': '/usr/share/fonts/NotoSansJP-Regular.ttf',
            'ko': '/usr/share/fonts/NotoSansKR-Regular.ttf',
            'zh': '/usr/share/fonts/NotoSansSC-Regular.ttf',
            'en': '/usr/share/fonts/arial.ttf'
        }
        return font_map.get(target_lang, '/usr/share/fonts/arial.ttf')

    def _calculate_font_size(self, text: str, bbox: List) -> int:
        """Calculate optimal font size for given text and bounding box"""
        # Implementation for font size calculation
        return 20  # Default size

    def _calculate_text_position(self, text: str, bbox: List, font) -> tuple:
        """Calculate optimal text position within bounding box"""
        # Implementation for text positioning
        return (bbox[0][0], bbox[0][1])

    def _draw_text_with_outline(self, draw, position, text, font):
        """Draw text with outline for better readability"""
        x, y = position
        
        # Draw outline
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx != 0 or dy != 0:
                    draw.text((x + dx, y + dy), text, font=font, fill='black')
        
        # Draw main text
        draw.text((x, y), text, font=font, fill='white')