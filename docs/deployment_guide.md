# HealthForecast AI: DevOps & Cloud Deployment Guide

## 1. Overview

This document provides step-by-step instructions for deploying HealthForecast AI using **Docker Compose** for single-host or local environments, and **Kubernetes** / **AWS ECS / Cloud Run** for cloud production deployments.

---

## 2. Docker Compose Deployment (Recommended for On-Prem / Local)

### Prerequisites
- Docker Engine 24.0+
- Docker Compose v2+

### Quick Start Deployment

1. **Clone repository & navigate to directory**:
   ```bash
   git clone https://github.com/organization/healthforecast-ai.git
   cd healthforecast-ai
   ```

2. **Execute automated deployment script**:
   - **Linux / macOS**:
     ```bash
     chmod +x deploy.sh
     ./deploy.sh
     ```
   - **Windows PowerShell**:
     ```powershell
     .\deploy.ps1
     ```

3. **Verify Deployment**:
   - Frontend UI: `http://localhost`
   - Backend API: `http://localhost:8000`
   - Interactive Swagger API Docs: `http://localhost:8000/docs`

---

## 3. Kubernetes Cloud Deployment (AWS EKS, GCP GKE, Azure AKS)

### Prerequisites
- `kubectl` CLI configured with cluster admin context
- Ingress NGINX controller installed on cluster

### Step-by-Step Deployment

1. **Create Namespace & Secrets**:
   ```bash
   kubectl create namespace healthforecast
   kubectl create secret generic healthforecast-secrets \
     --from-literal=db-password="HealthSecretPassword123!" \
     --from-literal=jwt-secret="prod-jwt-secret-key-998877" \
     -n healthforecast
   ```

2. **Apply Database StatefulSet**:
   ```bash
   kubectl apply -f k8s/postgres-deployment.yaml
   ```

3. **Apply Backend & Frontend Deployments**:
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

4. **Apply Ingress Configuration**:
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```

5. **Verify Pod Status**:
   ```bash
   kubectl get pods -n healthforecast
   ```

---

## 4. Monitoring & Healthchecks

- **Backend Health Check Endpoint**: `GET /health` (Returns HTTP 200 `{"status": "healthy"}`)
- **Container Logs**:
  ```bash
  docker-compose logs -f backend
  ```
