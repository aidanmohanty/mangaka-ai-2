# Multi-stage Docker build for mangaka.ai
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

FROM node:18-alpine AS backend-build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server/ ./server/
COPY scripts/ ./scripts/

FROM python:3.11-slim AS ai-service

WORKDIR /app/ai-service
COPY ai-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY ai-service/ ./

# Final production image
FROM node:18-alpine

WORKDIR /app

# Install Python for AI service
RUN apk add --no-cache python3 py3-pip

# Copy backend
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/server ./server
COPY --from=backend-build /app/scripts ./scripts
COPY --from=backend-build /app/package.json ./

# Copy frontend build
COPY --from=frontend-build /app/client/build ./client/build

# Copy AI service
COPY --from=ai-service /app/ai-service ./ai-service

# Create uploads directory
RUN mkdir -p uploads temp

# Expose ports
EXPOSE 5000 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start both services
CMD ["sh", "-c", "python3 ai-service/app.py & node server/index.js"]