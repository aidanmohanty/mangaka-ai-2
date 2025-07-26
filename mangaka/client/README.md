# Manga AI Translator & Colorizer

A web-based tool that uses AI to translate manga text and optionally colorize black & white manga pages.

## Features

- **Text Translation**: Detects and translates Japanese/Korean/Chinese text to multiple languages
- **AI Coloring**: Optional manga colorization using Stable Diffusion
- **Text Replacement**: Preserves original panel layout and font styling
- **Multiple Input Methods**: Upload files or provide image URLs
- **Real-time Processing**: WebSocket updates for processing status

## Architecture

- **Frontend**: React TypeScript app with drag-and-drop interface
- **Backend**: Node.js Express server for API routing and file handling
- **AI Service**: Python Flask service for OCR, translation, and AI processing

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- CUDA-compatible GPU (recommended for AI coloring)

### Installation

1. **Install Node.js dependencies**:
```bash
npm install
```

2. **Set up Python AI service**:
```bash
cd ai-service
pip install -r requirements.txt
```

3. **Create required directories**:
```bash
mkdir uploads temp
```

### Running the Application

1. **Start the AI service**:
```bash
cd ai-service
python app.py
```

2. **Start the Node.js backend and React frontend**:
```bash
npm run dev
```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:5001

## Usage

1. Upload a manga image or provide an image URL
2. Select target language for translation
3. Enable AI coloring if desired
4. Click "Process Manga" and wait for results
5. Download the processed image

## Supported Languages

- English
- Spanish
- French
- German
- Korean
- Chinese

## Technical Details

### Text Processing Pipeline
1. **OCR Detection**: EasyOCR identifies text regions
2. **Text Removal**: OpenCV inpainting removes original text
3. **Translation**: Google Translate API converts text
4. **Text Replacement**: PIL adds translated text with formatting

### AI Coloring
- Uses Stable Diffusion img2img pipeline
- Optimized for manga/anime art style
- Preserves original line art structure

## Dependencies

### Node.js Backend
- Express.js for API server
- Multer for file uploads
- Socket.io for real-time updates
- Axios for HTTP requests

### Python AI Service
- Flask for web service
- OpenCV for image processing
- EasyOCR for text detection
- Google Translate for translation
- Diffusers for AI coloring

### React Frontend
- TypeScript for type safety
- Socket.io client for real-time updates
- Axios for API calls
- Modern CSS with backdrop filters