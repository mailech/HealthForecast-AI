# ==============================================================================
# HealthForecast AI - Frontend Dockerfile
# Multi-stage build with Node.js and optimized Nginx Alpine runtime
# ==============================================================================

# --- Stage 1: Build Application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with clean cache
COPY package.json package-lock.json ./
RUN npm ci || npm install

# Copy source code
COPY . .

# Build argument for API base URL (defaults to /api for reverse proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the optimized production bundle
RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:1.27-alpine AS production

# Remove default Nginx site configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web server port
EXPOSE 80

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
