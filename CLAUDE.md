# Claude Code Project Guide for Mangaka AI

## Project Overview
Mangaka AI is a web-based tool that uses AI to translate manga text and optionally colorize black & white manga pages. The application consists of a React TypeScript frontend, Node.js Express backend, and Python Flask AI service.

## Architecture
- **Frontend**: React TypeScript app (`client/`) with modern UI components
- **Backend**: Node.js Express server (`server/`) for API routing and file handling  
- **AI Service**: Python Flask service (`ai-service/`) for OCR, translation, and AI processing
- **Database**: MongoDB for user data and processing history
- **Payment**: Stripe integration for premium features

## Development Standards

### Code Style
- Use TypeScript for all frontend code
- Follow React functional components with hooks
- Use async/await for asynchronous operations
- Implement proper error handling and user feedback
- Follow RESTful API conventions

### File Structure
```
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── contexts/      # React context providers
│   │   └── App.tsx        # Main app component
├── server/                # Node.js Express backend
│   ├── index.js          # Main server file
│   ├── routes/           # API route handlers
│   └── services/         # Business logic services
├── ai-service/           # Python Flask AI service
│   ├── app.py           # Main Flask application
│   └── services/        # AI processing modules
└── scripts/             # Utility scripts
```

### Key Commands
- `npm run dev` - Start all services in development mode
- `npm run build` - Build production frontend
- `npm run test` - Run frontend tests
- `npm run lint` - Check code style with ESLint
- `npm run format` - Format code with Prettier

### Dependencies
- **Frontend**: React 18+, TypeScript, Tailwind CSS, Socket.io client
- **Backend**: Express, Socket.io, Mongoose, Stripe, JWT authentication
- **AI Service**: Flask, OpenCV, EasyOCR, Google Translate, Diffusers

### Environment Variables
Required environment variables should be documented in `.env.example`:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `ANTHROPIC_API_KEY` - For Claude Code integration
- `GOOGLE_TRANSLATE_API_KEY` - For translation service

### Testing
- Frontend tests use Jest and React Testing Library
- API endpoints should have integration tests
- AI service functions should have unit tests
- Use test data that doesn't contain real user information

### Security Considerations
- Never commit API keys or secrets to version control
- Validate and sanitize all user inputs
- Implement rate limiting on API endpoints
- Use HTTPS in production
- Sanitize file uploads and validate file types

### AI Integration Guidelines
- The AI service processes manga images through OCR → Translation → Optional Coloring
- Text detection uses EasyOCR for accuracy with Asian characters
- Translation supports multiple languages via Google Translate API
- AI coloring uses Stable Diffusion with manga-optimized prompts
- Always provide user feedback during long-running AI operations

### Deployment
- Frontend builds to `client/build/` directory
- Backend serves static frontend files in production
- AI service runs as separate Python Flask application
- Use Docker for containerized deployment
- Environment-specific configuration via environment variables

### Performance Optimization
- Implement caching for translated text and processed images
- Use image compression for uploads and outputs
- Implement pagination for history/results pages
- Use lazy loading for large image galleries
- Monitor and limit AI processing queue length

### Error Handling
- Provide clear error messages to users
- Log errors with appropriate detail for debugging
- Implement graceful fallbacks for AI service failures
- Use try-catch blocks for all async operations
- Validate inputs on both frontend and backend

### UI/UX Guidelines
- Maintain responsive design for mobile and desktop
- Use loading states for all async operations
- Provide clear feedback during file uploads and AI processing
- Implement drag-and-drop functionality for file uploads
- Use consistent color scheme and typography
- Ensure accessibility with proper ARIA labels

### When Adding New Features
1. Update this CLAUDE.md file with new patterns or conventions
2. Add appropriate tests for new functionality
3. Update API documentation if adding new endpoints
4. Consider impact on AI processing performance
5. Ensure new features work across all supported browsers
6. Add proper error handling and user feedback