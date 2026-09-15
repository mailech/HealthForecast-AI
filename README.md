# HealthForecast-AI 🏥⚡

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-v3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-v8.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System** is a full-stack, enterprise-grade Clinical Decision Support System (CDSS) designed to predict 30-day diabetic hospital readmissions, manage patient cohorts, track treatment/care plans, stream simulated real-time vitals telemetry, and deliver real-time clinical analytics.

---

## 📌 Executive Summary & Clinical Scope

HealthForecast-AI combines machine learning predictive inference with secure hospital management workflows. By evaluating multi-factor clinical inputs—including length of stay, prior inpatient admissions, lab test volume, and glycemic control markers—the system stratifies post-discharge readmission risk into actionable risk tiers (`LOW`, `MEDIUM`, `HIGH`).

> [!WARNING]
> ### ⚠️ Clinical Scope & Advisory Notice
> HealthForecast-AI is an **academic and research prototype** designed as a clinical decision-support reference tool for healthcare professionals and care coordinators.
> - **Input Scope**: Evaluates post-discharge clinical features (`time_in_hospital`, prior inpatient visits, laboratory test frequency, diagnostic count). It operates as a **discharge-time readmission risk index** rather than an acute admission diagnostic engine.
> - **Medical Disclaimer**: Model outputs represent statistical risk estimations derived from historical hospital data and **do not** constitute medical advice, formal clinical diagnosis, or a substitute for direct physician oversight.

---

## 🏛️ System Architecture

HealthForecast-AI employs a modern 4-tier microservice architecture decoupling the web presentation layer, core REST application server, database persistence layer, and Python ML predictive microservice.

```text
                                ┌─────────────────────────────────────────┐
                                │           React 18 + Vite SPA           │
                                │   (Lucide Icons, Glassmorphism, CSS3)   │
                                └────────────────────┬────────────────────┘
                                                     │
                                             HTTP REST / WebSockets
                                                     │
                                                     v
                                ┌─────────────────────────────────────────┐
                                │        Node.js + Express Backend        │
                                │    (JWT Auth, RBAC, Socket.io, ExcelJS) │
                                └──────────┬───────────────────┬──────────┘
                                           │                   │
                                     Mongoose ORM              │  HTTP POST /predict
                                           │                   │  HTTP GET /health
                                           v                   v
             ┌──────────────────────────────────┐         ┌──────────────────────────────────┐
             │   MongoDB Atlas Cloud Database   │         │    Python FastAPI ML Microservice│
             │   (Patients, Plans, Audit Logs)  │         │   (RandomForest & Feature Scale) │
             └──────────────────────────────────┘         └──────────────────────────────────┘
```

---

## 📁 Repository & Folder Structure

```text
HealthForecast-AI/
├── backend/
│   ├── data/
│   │   └── diabetic_data.csv        # Primary UCI 130-US Hospitals dataset (101,766 records)
│   ├── scripts/
│   │   ├── atlasUpload.js           # Bulk dataset uploader to MongoDB Atlas
│   │   ├── seed.js                  # System user roles and sample patient seeder
│   │   └── seedDataset.js           # CSV stream parser & MongoDB batch insert script
│   ├── src/
│   │   ├── config/                  # MongoDB Mongoose database connection (db.js)
│   │   ├── controllers/             # API request handlers (auth, patient, analytics, etc.)
│   │   ├── middleware/              # JWT auth, RBAC role guard, rate limiters, error handling
│   │   ├── models/                  # Mongoose models (User, Patient, TreatmentPlan, etc.)
│   │   ├── routes/                  # Express route declarations
│   │   ├── utils/                   # Helpers & utilities (sendEmail.js, cryptoUtils.js, auditLogger.js)
│   │   ├── socket.js                # Socket.io real-time telemetry WebSocket server
│   │   └── server.js                # Main Express HTTP server entry point
│   ├── tests/                       # Jest backend API integration test suite
│   ├── .env.example                 # Backend environment variable template
│   ├── Dockerfile                   # Node.js backend Docker build instructions
│   └── package.json                 # Backend dependencies & script definitions
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI widgets (Header, SpotlightCard, Modals)
│   │   ├── context/                 # AuthContext, SocketContext, RoleContext state providers
│   │   ├── layouts/                 # SPA page layout templates (MainLayout)
│   │   ├── pages/                   # Main views (Dashboard, Patients, Prediction, Analytics, etc.)
│   │   ├── services/                # Axios HTTP client configuration (api.js)
│   │   └── styles/                  # Design tokens & global CSS styles
│   ├── Dockerfile                   # Frontend Nginx production container specification
│   ├── package.json                 # Frontend dependencies & Vite build scripts
│   └── vite.config.js               # Vite bundler configuration
├── ml_service/
│   ├── models/                      # ML binary artifacts & metadata
│   │   ├── model.pkl                # Trained scikit-learn RandomForestClassifier
│   │   ├── scaler.pkl               # Trained StandardScaler pipeline
│   │   └── model_version.json       # Version metadata & performance benchmark metrics
│   ├── tests/                       # Pytest ML microservice test suite (test_model.py)
│   ├── app.py                       # FastAPI predictive inference microservice
│   ├── preprocessing.py             # Shared feature parsing & array vectorization engine
│   ├── train_model.py               # Model training script on diabetic_data.csv
│   ├── requirements.txt             # Python ML microservice dependencies
│   └── Dockerfile                   # FastAPI Docker container specification
├── e2e/
│   └── clinical-flow.spec.js        # Playwright end-to-end integration test spec
├── .env.example                     # Root environment variable template
├── .gitignore                       # Repository git exclusion rules
├── docker-compose.yml               # Multi-container orchestration specification
├── Dockerfile                       # Root container configuration
├── LICENSE                          # MIT License file
├── README.md                        # Project documentation
└── render.yaml                      # Render cloud deployment blueprint
```

---

## 🤖 Machine Learning Model & Predictive Engine

### **Model Specification**
- **Algorithm**: Scikit-Learn `RandomForestClassifier` (`n_estimators=120`, `max_depth=10`, `random_state=42`)
- **Dataset**: Diabetes 130-US Hospitals Dataset (`backend/data/diabetic_data.csv`)
- **Feature Count**: 10 clinical features
- **Normalization**: `StandardScaler` fitted on training split feature matrix

### **Evaluated Model Metrics (v3.0.0)**
Evaluated on test split derived from `diabetic_data.csv`:

| Evaluation Metric | Benchmark Score | Description |
| :--- | :--- | :--- |
| **Accuracy** | `68.01%` (`0.6801`) | Overall classification accuracy across all evaluation records |
| **Readmission Recall** | `47.41%` (`0.4741`) | Sensitivity / True Positive Rate for detecting 30-day readmissions |
| **Precision** | `17.20%` (`0.1720`) | Positive predictive value for 30-day readmission outcome |
| **F1-Score (Readmitted <30)** | `25.24%` (`0.2524`) | Harmonic mean of precision and recall for positive readmission class |
| **ROC-AUC Score** | `63.48%` (`0.6348`) | Area under Receiver Operating Characteristic curve |

#### **Confusion Matrix (Test Evaluation Split)**
```text
                  Predicted Negative    Predicted Positive
Actual Negative         12,439                 5,167
Actual Positive          1,190                 1,073
```

### **Clinical Features & Importance Weights**
Model predictions are driven by 10 clinical features with explicit feature importances:

| Feature ID | Feature Description | Model Weight |
| :--- | :--- | :--- |
| `number_inpatient` | Inpatient hospital admissions in past 12 months | `33.62%` |
| `num_lab_procedures` | Number of laboratory tests performed during stay | `13.68%` |
| `num_medications` | Number of distinct prescribed medications | `12.46%` |
| `time_in_hospital` | Length of hospital stay (days) | `9.98%` |
| `age_num` | Patient age midpoint value | `9.10%` |
| `number_diagnoses` | Number of recorded clinical diagnoses | `7.69%` |
| `number_emergency` | Emergency room visits in past 12 months | `6.28%` |
| `A1Cresult` | Glycated hemoglobin test result (`None`, `Norm`, `>7`, `>8`) | `3.01%` |
| `diabetesMed` | Prescribed diabetes medication (`Yes`/`No`) | `2.29%` |
| `max_glu_serum` | Serum glucose test result (`None`, `Norm`, `>200`, `>300`) | `1.90%` |

---

## 🎯 Prediction Semantics & Risk Stratification

1. **Positive Class**: 30-day hospital readmission (`1`).
2. **Readmission Probability**: Raw output probability of positive class derived from Random Forest ensemble decision trees ($P \in [0, 1]$).
3. **Risk Score**: Integer index derived directly from readmission probability ($\text{Score} = \text{round}(P \times 100)$).
4. **Project Risk Tiers**: The project-defined risk tiers are contextualized against the dataset's baseline positive-class prevalence of 11.39%:
   - **`HIGH`** ($\text{Score} \ge 40$): High risk category ($\approx 4\times$ baseline prevalence). Produces high-priority risk-based care recommendations for clinical review.
   - **`MEDIUM`** ($20 \le \text{Score} < 40$): Moderate risk category ($\approx 2\times$ baseline prevalence). Produces moderate-risk care recommendations for clinical review.
   - **`LOW`** ($\text{Score} < 20$): Baseline low risk category. Produces standard care recommendations for clinical review.

---

## 🔒 Authentication & Role-Based Access Control (RBAC)

All endpoints (except public authentication) enforce HTTP Bearer JWT token verification via `authMiddleware.js` and role authorization via `rbacMiddleware.js`.

### **Supported System Roles**
- **`SYS_ADMIN`**: System-wide administrative privileges, user approval, credential management, full audit trail access.
- **`HOSPITAL_ADMIN`**: Hospital operational management, patient registration, doctor assignment, report exports.
- **`DOCTOR`**: Clinical practitioner access, assigned patient cohort management, risk predictions, treatment plan creation/updating.
- **`RESEARCHER`**: Read-only analytical access to anonymized patient statistics, cohort trends, and prediction history.

### **Doctor Patient Cohort Security**
- Patients feature an `assignedDoctor` field linked to a `User` ObjectId.
- `DOCTOR` role accounts are strictly restricted by `patientController.js` to viewing and managing patients in their assigned cohort (or unassigned patients).

---

## 📋 Persistent Modules & Core Capabilities

### **1. Patient Management**
- Full CRUD operations with soft deletion (`isDeleted: true`).
- Search by name, age, primary condition, and risk level filtering.
- Patient history, vitals, diagnostic summaries, and assigned doctor tracking.

### **2. Treatment & Care Plan System**
- Persistent MongoDB Mongoose schema (`TreatmentPlan`) storing diagnosis, goals, prescribed medications, clinical interventions, care recommendations, start/target dates, status (`Active`, `Completed`, `Cancelled`), and outcome notes.
- Soft cancellation support preserving audit integrity.

### **3. Real MongoDB Analytics**
- Real-time aggregations calculated directly from MongoDB `Patient` and `PredictionHistory` collections.
- Displays active vs. discharged counts, average length of stay, high-risk counts, risk distribution breakdowns, and prediction trends.
- **Data Integrity**: If a metric is not persisted (e.g. medication compliance adherence field), the API explicitly returns `null` with `medicationComplianceAvailable: false` rather than presenting fabricated statistics.

### **4. Document Generation & Export**
- **Care Plan PDF Reports**: On-demand dynamic PDF generation streamed via `pdfkit`.
- **Clinical Outcome Reports**: Multi-format exports in PDF, CSV, or genuine binary OpenXML Excel workbooks (`.xlsx`) generated using `ExcelJS`.

### **5. Telemetry & WebSockets**
- Real-time Socket.io streaming of simulated patient vitals for dashboard demonstration (heart rate, blood pressure, blood glucose).

---

## 📡 API Endpoint Reference

| Module | Method | Endpoint | Authorization Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/test` | Public | Operational health check endpoint |
| **Auth** | `POST` | `/api/auth/login` | Public | User authentication & JWT issuance |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user account |
| **Auth** | `POST` | `/api/auth/request-credentials` | Public | Submit clinical staff credential access request |
| **Auth** | `GET` | `/api/auth/me` | Protected (`Any User`) | Fetch current authenticated profile |
| **Users** | `GET` | `/api/users/pending` | Protected (`SYS_ADMIN`, `HOSPITAL_ADMIN`) | Fetch pending user credential requests |
| **Users** | `PUT` | `/api/users/:id/approve` | Protected (`SYS_ADMIN`, `HOSPITAL_ADMIN`) | Approve access request & assign role |
| **Patients** | `GET` | `/api/patients` | Protected (`All Roles`) | Fetch paginated patients (filtered by cohort for Doctors) |
| **Patients** | `POST` | `/api/patients` | Protected (`Admin`, `Doctor`) | Register new patient record |
| **Patients** | `GET` | `/api/patients/:id` | Protected (`All Roles`) | Fetch patient medical record by ID |
| **Patients** | `PUT` | `/api/patients/:id/assign-doctor` | Protected (`Admin`) | Assign doctor to patient record |
| **Patients** | `GET` | `/api/patients/:id/download-pdf` | Protected (`All Roles`) | Stream PDF Care Plan document |
| **Prediction** | `POST` | `/api/prediction/predict` | Protected (`All Roles`) | Execute ML readmission risk inference |
| **Prediction** | `GET` | `/api/prediction/history` | Protected (`All Roles`) | Retrieve historical predictions |
| **Treatment** | `GET` | `/api/treatment-plans` | Protected (`All Roles`) | List persistent treatment plans |
| **Treatment** | `POST` | `/api/treatment-plans` | Protected (`Admin`, `Doctor`) | Create new persistent treatment plan |
| **Treatment** | `PUT` | `/api/treatment-plans/:id` | Protected (`Admin`, `Doctor`) | Update treatment plan status/outcome |
| **Analytics** | `GET` | `/api/analytics` | Protected (`All Roles`) | Retrieve real MongoDB analytics aggregations |
| **Reports** | `GET` | `/api/reports/download?format=XLSX` | Protected (`All Roles`) | Export clinical outcome report in PDF/CSV/XLSX |
| **Audit** | `GET` | `/api/audit-logs` | Protected (`Admin`, `Doctor`) | Retrieve HIPAA compliance audit trail |
| **ML Engine** | `GET` | `http://localhost:8000/health` | Public | ML service operational health status |
| **ML Engine** | `GET` | `http://localhost:8000/model-info` | Public | ML model metadata & metric benchmarks |

---

## 🛠️ Technology Stack

| Architecture Layer | Key Technologies & Libraries |
| :--- | :--- |
| **Frontend SPA** | React 18, Vite 8, React Router v6, Axios, Lucide React, Recharts, Framer Motion, Vanilla CSS3 |
| **Backend Core** | Node.js v20, Express v5, Socket.io, Mongoose ORM, JSON Web Tokens (JWT), BcryptJS, ExcelJS, PDFKit |
| **ML Microservice** | Python 3.12, FastAPI, Scikit-Learn, Pandas, NumPy, Joblib, Uvicorn, Pydantic v2 |
| **Database** | MongoDB Atlas / MongoDB v8.0 |
| **Deployment & Orchestration** | Docker, Docker Compose, Render Blueprint (`render.yaml`) |
| **Testing** | Jest (Backend API integration), Pytest (ML microservice unit testing) |

---

## 💻 Local Installation & Setup Guide

### **Prerequisites**
- **Node.js**: v20.x or higher
- **Python**: v3.10 or v3.12
- **Database**: Local MongoDB server or MongoDB Atlas cluster URI
- **Git**: Installed on system

---

### **Step 1: Clone Repository & Setup Environment**
```bash
git clone https://github.com/your-username/HealthForecast-AI.git
cd HealthForecast-AI
```

Create `.env` inside `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthforecast
JWT_SECRET=your_super_secret_jwt_key_here
ML_SERVICE_URL=http://localhost:8000
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@healthforecast.ai
```

---

### **Step 2: Seed Dataset & Initialize Database**
```bash
cd backend
npm install

# Seed administrative accounts and sample data:
npm run seed

# (Optional) Seed full 101,766-record UCI dataset into MongoDB:
npm run seed:dataset
```

---

### **Step 3: Launch ML Microservice**
```bash
cd ../ml_service
pip install -r requirements.txt

# Start FastAPI Inference Microservice:
python app.py
```
> Microservice starts on **`http://localhost:8000`** (OpenAPI documentation available at `http://localhost:8000/docs`).

---

### **Step 4: Launch Express Backend Server**
```bash
cd ../backend
npm run dev
```
> Backend starts on **`http://localhost:5000`**.

---

### **Step 5: Launch React Frontend Application**
```bash
cd ../frontend
npm install
npm run dev
```
> Frontend web application opens on **`http://localhost:5173`**.

---

### **🐳 Single-Command Docker Deployment**
To launch all services in isolated Docker containers:
```bash
docker-compose up --build
```
- **Frontend SPA**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **ML Service**: `http://localhost:8000`

---

## 🧪 Automated Testing & Verification

The repository includes complete test suites verifying API contracts, authentication, database logic, and ML model inference.

### **1. Backend Integration Test Suite (Jest)**
```bash
cd backend
npm test
```
- **Test Result**: `43 passed, 43 total` across 7 test suites.
- **Coverage**: Auth, patient CRUD, doctor cohort security, prediction endpoints, analytics aggregations, treatment plans, and ExcelJS/PDF report exports.

### **2. ML Service Unit Test Suite (Pytest)**
```bash
cd ml_service
pytest tests/test_model.py
```
- **Test Result**: `7 passed, 7 total` in 5.42s.
- **Coverage**: Model artifact loading, `/health` status, `/model-info` metadata, valid prediction vector transformation, decision threshold risk banding, edge cases, and Pydantic validation errors.

### **3. Frontend Production Build Verification**
```bash
cd frontend
npm run build
```
- **Build Result**: Built cleanly in `2.14s` with zero errors (`dist/` generated).

---

## 📊 Requirement Coverage (Project Specification Mapping)

Audit of current codebase implementation against the project requirement specification:

| Module / Requirement | Implementation Status | Current Implementation Notes |
| :--- | :--- | :--- |
| **1. 30-Day Readmission Model** | ✅ Complete | Scikit-Learn `RandomForestClassifier` trained on `diabetic_data.csv` returning readmission score, risk level, feature explanations, and care recommendations. |
| **2. Patient Cohort & Management** | ✅ Complete | Persistent Mongoose `Patient` model with full CRUD, search, filtering, and doctor assignment tracking. |
| **3. Doctor Cohort Access Security** | ✅ Complete | Role-based restriction in `patientController.js` enforcing doctor access to assigned patient cohorts. |
| **4. Treatment & Care Plan System** | ✅ Complete | Persistent `TreatmentPlan` Mongoose schema with CRUD operations, status management, and soft cancellation. |
| **5. Real Database Analytics** | ✅ Complete | Real MongoDB pipeline aggregating patient metrics, readmission trends, and risk distributions without mock data. |
| **6. Authentication & RBAC** | ✅ Complete | Secure JWT Bearer authentication with 4 roles (`SYS_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `RESEARCHER`) and 401/403 protection. |
| **7. Multi-Format Report Export** | ✅ Complete | Dynamic PDF care plan generation via `pdfkit` and binary OpenXML Excel export (`.xlsx`) via `ExcelJS`. |
| **8. Vitals Telemetry & WebSockets** | ✅ Complete | Real-time Socket.io streaming of simulated patient vitals for dashboard demonstration. |
| **9. Microservices & Docker** | ✅ Complete | Decoupled Express, React, and FastAPI microservices orchestrated via `docker-compose.yml` and `render.yaml`. |

---

## 📌 Limitations & Future Work

### **Current Limitations**
- **Academic Scope**: Model trained on historical hospital data (1999–2008). Performance metrics reflect real-world clinical data challenges (imbalanced positive readmission class).
- **Risk Thresholds**: LOW/MEDIUM/HIGH risk bands are project-defined based on baseline population prevalence ($11.39\%$).
- **Clinical Actionability**: Intended solely as a clinical decision-support reference tool; requires formal clinical trial validation before hospital deployment.

### **Future Work**
- **Advanced Explainability**: Integrate SHAP / LIME Python explainer libraries into the FastAPI inference pipeline.
- **EHR System Integration**: Implement HL7 / FHIR protocol interoperability for direct hospital EHR data pipelines.
- **Deep Learning Architecture**: Benchmark ensemble Gradient Boosting (XGBoost/LightGBM) and deep neural network classifiers.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE). Built for clinical research and decision support system demonstrations.