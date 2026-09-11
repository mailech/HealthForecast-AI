# HealthForecast AI — Cloud Deployment Specification & Guide

**Project**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Phase**: Milestone 4 — Step 3: Cloud Deployment Architecture & Readiness  
**Date**: September 2026  

---

## 1. Cloud Deployment Architecture

HealthForecast AI is fully containerized and designed for cloud-native deployment on serverless container platforms or managed Kubernetes clusters:

```
                          +-----------------------------------+
                          |     CDN / Cloud Load Balancer     |
                          +-----------------+-----------------+
                                            |
                                 HTTPS (Port 443 / SSL)
                                            |
                                            v
                          +-----------------------------------+
                          |      Frontend Container Service   |
                          |        (Nginx SPA Reverse Proxy)  |
                          +-----------------+-----------------+
                                            |
                                   Internal HTTP Proxy
                                   /api/v1 -> Backend
                                            |
                                            v
                          +-----------------------------------+
                          |      Backend Container Service    |
                          |        (FastAPI / Uvicorn ASGI)   |
                          +--------+----------------+---------+
                                   |                |
                     Read-Only Mount                | Async SQLAlchemy
                                   |                v
                    +--------------+--+   +-------------------+
                    | diabetic_data.csv|   | Managed Cloud DB  |
                    | & ML Joblib     |   | (PostgreSQL 15)   |
                    +-----------------+   +-------------------+
```

### Supported Cloud Environments:
- **Google Cloud Platform (GCP)**: Cloud Run (Frontend & Backend) + Cloud SQL for PostgreSQL.
- **Amazon Web Services (AWS)**: Elastic Container Service (ECS Fargate) + AWS RDS for PostgreSQL.
- **Microsoft Azure**: Azure Container Apps + Azure Database for PostgreSQL.

---

## 2. Environment Variables & Secret Management

All sensitive secrets and environment-specific settings must be injected into cloud container services via environment variables or secret managers (e.g., GCP Secret Manager, AWS Secrets Manager, Azure Key Vault).

| Environment Variable | Production Cloud Value / Pattern | Required / Optional | Description |
| :--- | :--- | :---: | :--- |
| `POSTGRES_DB` | `healthforecast` | Required | PostgreSQL database name |
| `POSTGRES_USER` | `cloud_db_user` | Required | Database username |
| `POSTGRES_PASSWORD` | `<SecretFromVault>` | Required | Database password |
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@db-host:5432/healthforecast` | Required | Async SQLAlchemy DB connection string |
| `SECRET_KEY` | `<Random256BitHexKey>` | Required | JWT secret signature key |
| `ALGORITHM` | `HS256` | Optional (Default: `HS256`) | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Optional (Default: `1440`) | Token validity (minutes) |
| `VITE_API_BASE_URL` | `/api/v1` | Required | Relative reverse-proxy API prefix |
| `BACKEND_CORS_ORIGINS` | `["https://your-domain.com"]` | Required | Authorized CORS domain origins |

---

## 3. Step-by-Step Cloud Deployment Process

### Step 3.1: Build & Push Images to Container Registry
Using GCP Artifact Registry (or AWS ECR / Azure ACR):

```bash
# Set environment variables
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export REGISTRY="us-central1-docker.pkg.dev/$PROJECT_ID/healthforecast-repo"

# Authenticate Docker to Container Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build & Push Backend Container Image
docker build -t $REGISTRY/backend:v1.0.0 ./backend
docker push $REGISTRY/backend:v1.0.0

# Build & Push Frontend Container Image
docker build --build-arg VITE_API_BASE_URL=/api/v1 -t $REGISTRY/frontend:v1.0.0 ./frontend
docker push $REGISTRY/frontend:v1.0.0
```

### Step 3.2: Provision Managed PostgreSQL Database
1. Provision a PostgreSQL 15 instance (e.g. GCP Cloud SQL / AWS RDS).
2. Create database `healthforecast` and user `cloud_db_user`.
3. Obtain connection string: `postgresql+asyncpg://cloud_db_user:<password>@<db-private-ip>:5432/healthforecast`.

### Step 3.3: Deploy Backend Container Service
Deploy backend image to Cloud Run / ECS Fargate:
- **Port**: `8000`
- **Memory**: 2 GB RAM
- **CPU**: 1 vCPU
- **Environment Variables**: Set `DATABASE_URL`, `SECRET_KEY`, `BACKEND_CORS_ORIGINS`.
- **Health Check Path**: `/api/v1/system/status`

### Step 3.4: Deploy Frontend Container Service
Deploy frontend image to Cloud Run / ECS Fargate:
- **Port**: `80`
- **Nginx Proxy Target**: Set `proxy_pass` in `nginx.conf` to target the deployed Backend Service URL.

---

## 4. Database Configuration & Schema Migration

On container startup, the FastAPI lifespan event executes:
```python
await init_db()
```
This automatically runs `Base.metadata.create_all`, initializing all database tables (`users`, `patients`, `encounters`, `predictions`, `audit_logs`) and seeding initial default roles and demonstration administrative accounts upon first deployment.

---

## 5. Security & Isolation Safeguards

1. **Zero Hardcoded Secrets**: Secrets are injected strictly through environment variables.
2. **Dataset Immutability**: The raw dataset (`dataset/diabetic_data.csv`) is read-only.
3. **ML Artifact Preservation**: Model files (`xgboost_model.joblib`, `random_forest_model.joblib`, `preprocessor.joblib`) are embedded in the backend container image.
4. **Role-Based Access Control (RBAC)**: All sensitive prediction and patient endpoints enforce JWT authorization and role verification.

---

## 6. Exact Deployment Status & Prerequisites

### Current Status: **PREPARED & LOCALLY VALIDATED**
- **Docker Multi-Container Deployment**: Fully configured and verified via Docker Compose (`docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`).
- **Cloud Architecture**: Container manifests and build scripts prepared.

### Live Cloud Deployment Prerequisites (Required from User for Cloud Launch):
1. **Cloud Provider Account & Credentials**: GCP Service Account Key / AWS IAM Credentials / Azure Service Principal.
2. **Target Container Registry URI**: E.g., `gcr.io/<project-id>` or `us-central1-docker.pkg.dev/<project-id>/repo`.
3. **Managed Database Instance / Host Details**: Provisioned Cloud SQL / RDS PostgreSQL host IP, database name, and password.
