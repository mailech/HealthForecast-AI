# Multi-stage Frontend Dockerfile for HealthForecast AI
# Stage 1: Build React/Vite Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install npm dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Set build-time API URL argument (defaults to relative /api/v1 for Nginx reverse proxy)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle
RUN npm run build

# Stage 2: Serve Production Assets via Lightweight Nginx Web Server
FROM nginx:alpine

# Copy built SPA assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
