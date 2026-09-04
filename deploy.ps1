# PowerShell Deployment Script for HealthForecast AI
$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Deploying HealthForecast AI Platform via Docker Compose" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "[1/4] Building Docker images..." -ForegroundColor Yellow
docker-compose build

Write-Host "[2/4] Starting services (PostgreSQL, Backend FastAPI, Frontend Nginx)..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "[3/4] Initializing database and seeding ML models..." -ForegroundColor Yellow
docker-compose exec -T backend python seed_ml_data.py

Write-Host "[4/4] Verifying endpoint availability..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "========================================================" -ForegroundColor Green
Write-Host "  HealthForecast AI Platform successfully deployed!" -ForegroundColor Green
Write-Host "  Frontend UI: http://localhost" -ForegroundColor Green
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor Green
Write-Host "  Swagger Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
