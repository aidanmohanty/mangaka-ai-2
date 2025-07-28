# Mangaka.ai Development Context

## Project Overview
Mangaka.ai is a full-stack web application for AI-powered manga translation and colorization. The platform uses machine learning to detect, translate, and optionally colorize manga pages while preserving original artwork style and layout.

## Architecture
- **Frontend**: React TypeScript app (`client/`) with modern UI/UX
- **Backend**: Node.js Express server (`server/`) for API and file handling  
- **AI Service**: Python Flask service (`ai-service/`) for OCR, translation, and AI processing
- **Database**: MongoDB for user data, payment tracking, and processing history
- **Payments**: Stripe integration for subscription management

## Development Commands
- `npm run dev` - Start all services (frontend, backend, AI service)
- `npm run lint` - Run ESLint on server and client code
- `npm run format` - Format code with Prettier
- `npm test` - Run client tests
- `npm run build` - Build production client
- `npm run docker:build` - Build Docker container

## Key Technologies
- React 18 with TypeScript
- Node.js/Express backend
- Python Flask AI service
- MongoDB with Mongoose
- Socket.io for real-time updates
- Stripe for payments
- OpenCV & EasyOCR for image processing
- Stable Diffusion for AI coloring

## Development Guidelines
1. **Code Quality**: Always run lint and format before commits
2. **Testing**: Use `npm test` to verify client functionality  
3. **AI Service**: Ensure Python dependencies are installed (`pip install -r ai-service/requirements.txt`)
4. **Environment**: Copy `.env.example` to `.env` and configure API keys
5. **Database**: Run `npm run setup` to initialize MongoDB collections

## File Structure
```
├── client/          # React TypeScript frontend
├── server/          # Node.js Express backend
├── ai-service/      # Python Flask AI service
├── scripts/         # Database and deployment scripts
└── uploads/         # File upload directory
```

## Common Issues
- Ensure all three services are running for full functionality
- GPU recommended for AI coloring (CPU fallback available)
- Large image uploads may require increased server timeouts
- WebSocket connections needed for real-time processing updates

## Deployment
- Production-ready with Docker support
- Vercel/Railway deployment scripts included
- Environment variables required for external APIs (Google Translate, OpenAI, Stripe)