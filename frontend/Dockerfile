# -------------------------------
# Stage 1: Build React application
# -------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY package*.json ./

RUN npm ci

# Copy frontend source
COPY . .

# Build-time API URL
ARG VITE_API_BASE_URL=http://127.0.0.1:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Create production build
RUN npm run build


# -------------------------------
# Stage 2: Serve with Nginx
# -------------------------------
FROM nginx:alpine

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy React production build
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Frontend HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]