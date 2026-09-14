# HealthForecast-AI 🏥⚡

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-v3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-v8.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade **Clinical Decision Support System (CDSS)** and predictive healthcare intelligence platform. **HealthForecast-AI** ingests large-scale clinical dataset cohorts (100,000+ patient records), streams real-time vitals telemetry, calculates 30-day diabetic readmission risk indexes using machine learning, and delivers dynamic cohort analytics via an interactive clinical dashboard.

---

## 🏛️ System Architecture

```text
                               ┌─────────────────────────────────────────┐
                               │           React + Vite Frontend         │
                               │  (Tailwind CSS, Glassmorphism, Charts)  │
                               └────────────────────┬────────────────────┘
                                                    │
                                            HTTP / WebSockets
                                                    │
                                                    v
                               ┌─────────────────────────────────────────┐
                               │        Node.js + Express Backend        │
                               │    (JWT Auth, HIPAA Audit, Socket.io)   │
                               └──────────┬───────────────────┬──────────┘
                                          │                   │
                     Mongoose / BSON      │                   │  REST API (HTTP POST)
                                          v                   v
            ┌──────────────────────────────────┐         ┌──────────────────────────────────┐
            │   MongoDB Atlas Cloud Database   │         │    Python FastAPI ML Microservice│
            │   (101,766 Patient Clinical DB)  │         │   (RandomForest & Feature Scale) │
            └──────────────────────────────────┘         └──────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend Microservice**
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS3 + Tailwind CSS, Dark Mode, Glassmorphism design system
- **State & Routing**: React Router v6, Context API (`RoleContext`, `AuthContext`)
- **Visualizations**: Dynamic Recharts, Lucide Icons, Framer Motion micro-animations

### **Backend Core Microservice**
- **Runtime & Framework**: Node.js v20, Express v5
- **Database**: MongoDB Atlas Cloud DB with Mongoose ORM
- **Security & Compliance**: AES-256-CBC PHI field encryption at rest, JWT (JSON Web Tokens) with refresh flow, express-rate-limit
- **Communications**: Socket.io WebSockets for live telemetry broadcasts, Brevo API / Nodemailer for transactional credentials & alert emails
- **Document Generation**: PDFKit stream generator for automated HIPAA Clinical Care Plans

### **Machine Learning Microservice**
- **Framework**: Python 3.12, FastAPI, Uvicorn
- **Predictive Engine**: Scikit-Learn `RandomForestClassifier` (120 decision estimators)
- **Feature Scaling**: `StandardScaler` pipeline normalization
- **Explainability**: Custom SHAP-style risk contribution scoring per clinical feature

---

## 📁 Repository Structure

```text
HealthForecast-AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection & env loaders (db.js)
│   │   ├── controllers/     # API request handlers (patient, analytics, auth, user, etc.)
│   │   ├── middleware/      # Auth verification, rate-limiting & error middleware
│   │   ├── models/          # Mongoose data schemas (Patient.js, User.js, AuditLog.js)
│   │   ├── routes/          # Express REST endpoints
│   │   ├── utils/           # AES-256 encryption, HIPAA logger & Brevo email dispatch
│   │   ├── socket.js        # Socket.io WebSocket server handler
│   │   └── server.js        # Main Express application entry point
│   ├── scripts/             # Migration & seed scripts (seedDataset.js, seed.js, atlasUpload.js)
│   ├── data/                # Clinical dataset storage (diabetic_data.csv)
│   ├── tests/               # Jest integration unit test suite
│   ├── package.json         # Backend scripts & dependency manifest
│   └── Dockerfile           # Backend containerization configuration
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static logos, avatars & media
│   │   ├── components/      # Reusable UI elements (Header, SSOModal, Skeletons, SpotlightCard)
│   │   ├── context/         # Auth & Role Context state providers
│   │   ├── layouts/         # Page layout wrappers (MainLayout, AuthLayout)
│   │   ├── pages/           # Clinical view pages (Dashboard, Patients, Analytics, Login, etc.)
│   │   ├── services/        # Axios API client instances
│   │   ├── styles/          # Design tokens & CSS stylesheets
│   │   └── utils/           # Client-side helpers & formatters
│   ├── package.json         # Frontend dependencies
│   └── Dockerfile           # Frontend Nginx production container
├── ml_service/
│   ├── models/              # Trained ML model pickles (model.pkl, scaler.pkl, model_version.json)
│   ├── app.py               # FastAPI predictive inference microservice
│   ├── train_model.py       # Model training & synthetic data generation pipeline
│   ├── requirements.txt     # Python microservice dependencies
│   └── Dockerfile           # ML service Docker container
├── docker-compose.yml       # Full stack container orchestration
├── README.md                # Project documentation
└── .gitignore               # Version control exclusion rules
```

---

## 🌟 Core Platform Features

1. **Large-Scale Clinical Dataset Streaming**:
   - Native streaming ingestion script (`npm run seed:dataset`) that parses 101,766 patient records from UCI Diabetic Data.
   - Batch-inserts documents into MongoDB Atlas using chunked `Patient.insertMany()` in under 2 minutes.

2. **AI-Powered 30-Day Readmission Risk Forecasting**:
   - Evaluates multi-factor clinical attributes (age, glucose levels, blood pressure, BMI, emergency visits, prior admissions, ICD-9 primary diagnostic codes).
   - Generates readmission risk scores (0–100), risk levels (`LOW`, `MEDIUM`, `HIGH`), and SHAP-style feature importance weight explanations.

3. **Real-Time Clinical Telemetry & Cohort Analytics**:
   - Live 24-hour telemetry generation for heart rate, blood pressure, and blood glucose.
   - Dynamic aggregation curves broken down by major clinical cohorts (*Type 2 Diabetes*, *Congestive Heart Failure (CHF)*, *COPD*, *Hypertension*, *Chronic Kidney Disease*).

4. **HIPAA Security & Role-Based Access Control (RBAC)**:
   - Encrypts sensitive Personal Health Information (PHI) fields at rest using AES-256-CBC algorithms.
   - Role-based permissions across 4 distinct clinical roles: `SYS_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, and `RESEARCHER`.
   - Comprehensive audit logging for all patient record access events.

5. **Automated Care Plan PDF Stream Engine**:
   - Generates and streams downloadable, HIPAA-compliant patient care plan reports (`.pdf`) on demand using `pdfkit`.

---

## 🚀 Setup & Installation Guide

### **Prerequisites**
- **Node.js**: v20.x or higher
- **Python**: v3.10 or v3.12
- **Database**: MongoDB Atlas cloud cluster (or local MongoDB v7.0+)
- **Git**: Installed on system

---

### **Step 1: Clone Repository & Setup Environment**

```bash
git clone https://github.com/your-username/HealthForecast-AI.git
cd HealthForecast-AI
```

#### **Configure Backend `.env` File**
Create a `.env` file in the `backend/` directory:

```env
# Database & Server Config
MONGO_URI=mongodb+srv://db_user:<YOUR_PASSWORD>@healthforecastdb.t8d5xcz.mongodb.net/healthforecast?retryWrites=true&w=majority
PORT=5000

# Service Integrations
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Security Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Email Dispatcher (Brevo SMTP)
BREVO_API_KEY=xkeysib-your-brevo-api-key-here
SENDER_EMAIL=mounikavelam@gmail.com
```

---

### **Step 2: Seed Clinical Dataset into MongoDB**

```bash
cd backend
npm install
npm run seed:dataset
```
> **Output**: Stream-parses `backend/data/diabetic_data.csv` and inserts all **101,766 patient records** into MongoDB Atlas.

---

### **Step 3: Start Machine Learning Microservice**

```bash
cd ../ml_service
pip install -r requirements.txt

# (Optional) Train & update model artifacts:
python train_model.py

# Start FastAPI Inference Server:
python app.py
```
> Microservice starts on **`http://localhost:8000`** with OpenAPI docs at `http://localhost:8000/docs`.

---

### **Step 4: Start Express Backend API**

```bash
cd ../backend
npm run dev
```
> Server starts on **`http://localhost:5000`**.

---

### **Step 5: Start React Frontend Web App**

```bash
cd ../frontend
npm install
npm run dev
```
> Client starts on **`http://localhost:5173`**.

---

### **🐳 Docker Compose Deployment (Single Command)**

To launch all three microservices simultaneously via Docker:

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **ML Service**: `http://localhost:8000`

---

## 📡 API Endpoint Overview

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/test` | Operational health check endpoint |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & issue JWT tokens |
| **Auth** | `POST` | `/api/auth/forgot-password` | Initiate password reset email flow |
| **Auth** | `POST` | `/api/auth/request-credentials` | Submit clinical staff credential access request |
| **Patients** | `GET` | `/api/patients` | Paginated search, text filter, and risk query |
| **Patients** | `POST` | `/api/patients` | Register new patient record with HIPAA audit log |
| **Patients** | `GET` | `/api/patients/:id` | Fetch patient medical record details |
| **Patients** | `GET` | `/api/patients/:id/download-pdf` | Stream dynamic PDF Care Plan report |
| **Analytics**| `GET` | `/api/analytics?timeframe=30d` | Fetch aggregated KPIs, risk distributions & curves |
| **ML Engine**| `POST` | `/api/prediction/predict` | Proxy ML microservice readmission risk inference |
| **Audit** | `GET` | `/api/audit-logs` | Retrieve HIPAA compliance audit trail logs |

---

## 🧪 Running Integration Tests

```bash
cd backend
npm test
```
Executes Jest integration test suite covering API contracts, authentication flows, PDF streaming, and analytics handlers.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE). Built for clinical research and decision support system demonstrations.