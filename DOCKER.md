# HealthForecast AI - Docker Deployment Guide

This guide describes how to build, run, and manage **HealthForecast AI** using Docker and Docker Compose.

---

## Architecture Overview

```
+-----------------------------------------------------------+
|                      Client Browser                       |
+-----------------------------------------------------------+
        |                                       |
        | (Port 3000)                           | (Port 8000)
        v                                       v
+-----------------------+               +-----------------------+
|  healthforecast-       |   /api/*      |  healthforecast-      |
|  frontend (Nginx)     | ------------> |  backend (FastAPI)    |
|  SPA static files     | (Internal Net)|  Uvicorn + ML Engine  |
+-----------------------+               +-----------------------+
                                                    |
                                                    v
                                        +-----------------------+
                                        |  Volume: backend-data |
                                        |  SQLite DB & Cache    |
                                        +-----------------------+
```

- **Backend Container**: Python 3.11-slim with FastAPI, Uvicorn, Scikit-Learn, and XGBoost dependencies.
- **Frontend Container**: Multi-stage build with Node.js 20 build step and production-grade Nginx Alpine serving assets, handling SPA routing, and reverse-proxying `/api` requests.
- **Docker Compose**: Orchestrates multi-container networking, persistent storage volumes, and healthcheck dependencies.

---

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) (v20.10+) or [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

---

## Quick Start (Production Mode)

### 1. Build and Launch Containers

Run the following command from the project root directory:

```bash
docker compose up --build -d
```

### 2. Verify Service Health

Check container status and health:

```bash
docker compose ps
```

You should see both `healthforecast-backend` (healthy) and `healthforecast-frontend` (running).

### 3. Access the Application

- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## Local Development Mode (with Hot Reloading)

If you want live code changes reflected inside the containers without rebuilding:

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend runs at: [http://localhost:5173](http://localhost:5173)
- Backend runs at: [http://localhost:8000](http://localhost:8000)

---

## Common Commands

### View Container Logs
```bash
# Follow logs from all services
docker compose logs -f

# Follow logs from backend only
docker compose logs -f backend

# Follow logs from frontend only
docker compose logs -f frontend
```

### Stop Containers
```bash
# Stop containers without removing volumes
docker compose down

# Stop containers and remove volumes (resets SQLite database)
docker compose down -v
```

### Restart Services
```bash
docker compose restart
```

### Run Commands Inside Containers
```bash
# Open interactive shell in backend container
docker compose exec backend /bin/bash

# Inspect SQLite database inside backend container
docker compose exec backend python -c "from app.database import engine; print(engine)"
```

---

## Environment Configuration

You can customize environment variables by creating a `.env` file in the root directory or passing them directly to Docker Compose:

| Variable | Description | Default in Docker |
|---|---|---|
| `SECRET_KEY` | JWT signing secret key | Secure fallback key |
| `DATABASE_URL` | SQLAlchemy database connection URI | `sqlite:////app/data/healthforecast.db` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifespan in minutes | `120` |
| `CORS_ORIGINS` | JSON list of allowed origins | `["http://localhost:3000", ...]` |
| `SEED_DEMO_DATA` | Automatically seed demo clinician and patient data on boot | `True` |

---

## Troubleshooting

### Port Conflicts
If port `3000` or `8000` is already in use on your host machine, change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3001:80"  # Changes host frontend port to 3001
```

### Database Persistence
The SQLite database file is stored safely inside the Docker volume `backend-data`. To inspect or backup the volume:
```bash
docker volume inspect healthforecast-ai_backend-data
```
