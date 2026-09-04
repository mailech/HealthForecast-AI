#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  Deploying HealthForecast AI Platform via Docker Compose"
echo "========================================================"

# Step 1: Build Docker images
echo "[1/4] Building container images..."
docker-compose build

# Step 2: Launch Containers
echo "[2/4] Starting services (PostgreSQL, Backend FastAPI, Frontend Nginx)..."
docker-compose up -d

# Step 3: Run Database Migrations & ML Seeding
echo "[3/4] Initializing database and seeding ML models..."
docker-compose exec -T backend python seed_ml_data.py

# Step 4: Healthcheck
echo "[4/4] Verifying endpoint availability..."
sleep 3
curl -f http://localhost:8000/health || (echo "Backend health check failed!" && exit 1)

echo "========================================================"
echo "  HealthForecast AI Platform successfully deployed!"
echo "  Frontend UI: http://localhost"
echo "  Backend API: http://localhost:8000"
echo "  Swagger Docs: http://localhost:8000/docs"
echo "========================================================"
