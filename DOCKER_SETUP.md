# HealthForecast AI: Docker Containerization & Deployment Guide

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Phase**: Milestone 4 — Step 3: Docker Containerization & Cloud Deployment  
**Authoritative Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Date**: September 2026  

---

## 1. Executive Overview & Container Architecture

This guide provides operational instructions for building, executing, and orchestrating the multi-container Docker deployment of **HealthForecast AI**. The platform uses Docker Compose to orchestrate three containerized microservices:

1. **PostgreSQL Database (`healthforecast-postgres`)**:
   - Image: `postgres:15-alpine`
   - Purpose: Relational database storing system users, role-based permissions, patient registries, encounter histories, prediction logs, and audit trails.
   - Volume: `postgres_data` (local driver for persistent data storage across restarts).
   - Healthcheck: `pg_isready -U postgres -d healthforecast`.

2. **FastAPI Backend Service (`healthforecast-backend`)**:
   - Base Image: `python:3.11-slim`
   - Engine: Uvicorn ASGI server executing FastAPI endpoints, XGBoost model inference (`xgboost_model.joblib`), CDSS clinical rules, and analytics pipelines.
   - Volume: Mounts `dataset/diabetic_data.csv` read-only (`:ro`) at `/app/dataset/diabetic_data.csv`.
   - Healthcheck: `curl -f http://localhost:8000/api/v1/system/status || exit 1`.

3. **React / Vite Frontend Nginx Server (`healthforecast-frontend`)**:
   - Base Image: Multi-stage build (`node:20-alpine` builder $\rightarrow$ `nginx:alpine` runtime).
   - Purpose: Serves production SPA bundle via Nginx with client-side route fallback (`try_files $uri $uri/ /index.html`) and reverse-proxies `/api/` requests to `http://backend:8000/api/`.

---

## 2. Prerequisites & Environment Setup

- **Docker Desktop** (or Docker Engine v20.10+)
- **Docker Compose** (v2.0+)
- Minimum System Resources: 4 GB RAM, 10 GB disk space

### Environment Configuration (`.env`):
Copy `.env.example` to create `.env` before running Docker Compose:

```bash
cp .env.example .env
```

| Environment Variable | Default Value | Description |
| :--- | :--- | :--- |
| `POSTGRES_DB` | `healthforecast` | Database name |
| `POSTGRES_USER` | `postgres` | Database administrator username |
| `POSTGRES_PASSWORD` | `postgres_safe_password_change_me` | Database administrator password |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres_safe_password_change_me@postgres:5432/healthforecast` | Async SQLAlchemy connection string |
| `SECRET_KEY` | `super-secret-key-change-in-production-healthforecast-2026-btech` | JWT secret signature key |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT expiration (24 hours) |
| `VITE_API_BASE_URL` | `/api/v1` | Nginx reverse proxy API path |

---

## 3. Docker Compose Execution Commands

### 3.1 Validate Configuration Syntax
```bash
docker compose config
```

### 3.2 Build All Container Images
```bash
docker compose build
```
To force a clean build without cache:
```bash
docker compose build --no-cache
```

### 3.3 Launch Container Stack (Detached Mode)
```bash
docker compose up -d
```

### 3.4 Verify Container Health & Status
```bash
docker compose ps
```

### 3.5 Stream Service Logs
```bash
# Stream all logs
docker compose logs -f

# Stream specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 3.6 Stop Container Stack
```bash
# Stop containers (preserves database volume)
docker compose down

# Stop containers AND wipe persistent database volume (CAUTION)
docker compose down -v
```

---

## 4. Service Endpoints & Verification

When `docker compose up -d` reports healthy containers:

| Service | Access URL / Port | Description |
| :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:80` (or `http://localhost`) | Production React SPA UI |
| **Backend REST API** | `http://localhost:8000` | FastAPI Backend |
| **Interactive OpenAPI Docs** | `http://localhost:8000/docs` | Swagger UI Documentation |
| **System Status Endpoint** | `http://localhost:8000/api/v1/system/status` | Backend Health Check |
| **PostgreSQL Database** | `localhost:5432` | Relational Database |

---

## 5. Security & Immutability Rules

1. **Secrets via Environment**: Database credentials and JWT secrets must be set via `.env` and never hardcoded in source code or committed to git repositories.
2. **Dataset Immutability**: `dataset/diabetic_data.csv` (101,766 records, 50 columns) is mounted read-only (`:ro`).
3. **ML Model Preservation**: Validated artifacts (`xgboost_model.joblib`, `random_forest_model.joblib`, `preprocessor.joblib`) are copied inside the backend container image and loaded without retraining.
