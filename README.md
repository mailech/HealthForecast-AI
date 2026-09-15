# HealthForecast AI

## Hospital Readmission Risk Prediction System

## Project Overview

**HealthForecast AI** is an AI-powered clinical decision-support web application developed as part of the **Infosys Virtual Internship** program.

The system uses a trained **XGBoost** machine learning model to estimate the 30-day hospital readmission risk for diabetic patients based on clinical encounters, demographic data, laboratory counts, and medication regimens. It assists healthcare practitioners by providing transparent risk scores, clinical guidance, and aggregate analytics.

---

## User Roles

| Role | Capabilities |
| :--- | :--- |
| **Doctor** | Login, run patient risk predictions, view personal prediction history, access dashboard statistics |
| **Hospital Administrator** | Login, run predictions, view all predictions across staff, manage patient registry, access hospital-wide analytics |

**Default Accounts** (seeded on startup):
- **Doctor**: `doctor@hospital.com` / `doctor123`
- **Hospital Administrator**: `admin@hospital.com` / `admin123`

---

## Main Features

- **Secure Authentication**: JWT Bearer token authentication with Bcrypt password hashing
- **Role-Based Access Control (RBAC)**: Doctor and Hospital Administrator roles with route-level authorization
- **Patient Management**: Create, list, and retrieve patient records stored in SQLite
- **AI Readmission Prediction**: XGBoost classifier processing 46 clinical features into a readmission probability score
- **Risk Stratification**: Automated classification into LOW / MEDIUM / HIGH / CRITICAL risk categories
- **Prediction History**: Persistent prediction logs with doctor-scoped and admin-wide views
- **Healthcare Analytics Dashboard**: Real-time patient counts, prediction totals, and risk distribution metrics
- **Clinical Presets**: 1-click high-risk and low-risk demo patient profiles for rapid evaluation
- **Clinical Disclaimer**: Academic decision-support disclaimer on every prediction result
- **Docker Containerization**: Multi-service deployment with Docker Compose

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, SQLite, Pydantic v2 |
| **Authentication** | JWT (python-jose), Bcrypt, OAuth2 Bearer |
| **Machine Learning** | XGBoost, Scikit-Learn, Pandas, NumPy, Joblib |
| **Frontend** | React 18, Vite, JavaScript, Axios, Lucide Icons |
| **Containerization** | Docker, Docker Compose, Nginx |
| **Testing** | Pytest, FastAPI TestClient |

---

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web App: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env.example`)
```
DATABASE_URL=sqlite:///./healthforecast.db
SECRET_KEY=healthforecast-ai-super-secret-production-key-change-in-prod-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

### Frontend (`frontend/.env.example`)
```
VITE_API_URL=http://127.0.0.1:8000
```

---

## API Endpoints

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | System status and model performance metrics |
| `GET` | `/health` | Public | Database connectivity and ML pipeline health |
| `POST` | `/auth/login` | Public | Authenticate user and issue JWT bearer token |
| `POST` | `/login` | Public | Login alias |
| `POST` | `/auth/register` | Public | Register new staff credentials |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile and role |
| `POST` | `/predict` | Doctor, Admin | Run XGBoost inference and persist result to SQLite |
| `GET` | `/predictions` | Doctor, Admin | Retrieve past prediction evaluations |
| `POST` | `/patients` | Doctor, Admin | Create patient record in registry |
| `GET` | `/patients` | Doctor, Admin | List registered patients |
| `GET` | `/patients/{patient_id}` | Doctor, Admin | Retrieve individual patient details |
| `GET` | `/admin/stats` | Admin, Doctor | Aggregate analytics (patient and risk counts) |

---

## Project Structure

```
HealthForecast-AI/
├── backend/
│   ├── main.py              # FastAPI server & route handlers
│   ├── auth.py              # JWT generation & Bcrypt hashing
│   ├── database.py          # SQLAlchemy engine & session
│   ├── dependencies.py      # Role-based authorization dependencies
│   ├── models.py            # ORM models (User, Patient, Prediction)
│   ├── schemas.py           # Pydantic v2 validation schemas
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend container definition
│   ├── .env.example         # Environment variable template
│   └── ml_model/            # Trained XGBoost pipeline artifacts
│       ├── xgboost_readmission_model.pkl
│       ├── onehot_encoder.pkl
│       ├── standard_scaler.pkl
│       └── feature_columns.json
├── frontend/
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite build configuration
│   ├── Dockerfile           # Multi-stage frontend container
│   ├── nginx.conf           # Nginx reverse proxy config
│   ├── .env.example         # Frontend environment template
│   └── src/
│       ├── App.jsx          # Root component with protected routing
│       ├── main.jsx         # React entry point
│       ├── index.css        # Design system styles
│       ├── context/         # AuthContext (JWT state management)
│       ├── services/        # Axios API client with interceptors
│       ├── components/      # Navbar, ModelBanner, ResultCard
│       └── pages/           # Login, Dashboard, Prediction, History, Patients
├── ml_service/
│   ├── app.py               # Standalone ML inference microservice
│   ├── requirements.txt     # ML service dependencies
│   ├── Dockerfile           # ML service container
│   └── healthforecast_model/# Pre-trained model artifacts
├── tests/
│   └── test_backend.py      # Automated Pytest suite (8 tests)
├── docker-compose.yml       # Multi-container orchestration
├── pytest.ini               # Pytest configuration
├── IMPLEMENTATION_PLAN.md   # Technical implementation plan
└── INFOSYS_INTERNSHIP_PROJECT_REPORT.md  # Internship project report
```

---

## Dataset

- **Source**: Diabetes 130-US Hospitals (1999–2008) dataset from the UCI Machine Learning Repository
- **Volume**: Over 100,000 clinical inpatient encounters
- **Target**: 30-day hospital readmission (binary classification)
- **Clinical Input Features**: 46 total
  - Demographics (3): `race`, `gender`, `age`
  - Admission & Stay (6): `admission_type_id`, `discharge_disposition_id`, `admission_source_id`, `time_in_hospital`, `payer_code`, `medical_specialty`
  - Encounter Counts (7): `num_lab_procedures`, `num_procedures`, `num_medications`, `number_outpatient`, `number_emergency`, `number_inpatient`, `number_diagnoses`
  - Lab Tests (4): `max_glu_serum`, `A1Cresult`, `change`, `diabetesMed`
  - Diagnosis Groups (3): `diag_1_group`, `diag_2_group`, `diag_3_group`
  - Diabetic Medications (23): `metformin`, `insulin`, `glipizide`, `glyburide`, and 19 others

### Feature Engineering
- **Categorical (38 columns)** → `OneHotEncoder` → 188 binary features
- **Numerical (8 columns)** → `StandardScaler` → 8 normalized features
- **Total processed vector**: 196 dimensions

---

## Model Performance

| Metric | Value |
| :--- | :--- |
| **ROC-AUC** | ~0.658 |
| **Positive-Class Recall** | ~0.59 |

### Risk Stratification Thresholds

| Risk Level | Probability Range | Clinical Recommendation |
| :--- | :--- | :--- |
| **LOW** | P < 30% | Standard post-discharge follow-up |
| **MEDIUM** | 30% ≤ P < 50% | Follow-up consultation within 14 days |
| **HIGH** | 50% ≤ P < 70% | Clinical review & med reconciliation within 7 days |
| **CRITICAL** | P ≥ 70% | Transitional care coordinator before discharge |

---

## Testing

```bash
pytest
```

**Latest result**: 8 passed (100% pass rate)

| Test | Purpose |
| :--- | :--- |
| `test_root_endpoint` | GET / status and metrics |
| `test_health_endpoint` | GET /health database and model check |
| `test_login_doctor_and_admin` | JWT authentication for both roles |
| `test_register_new_user` | Staff registration |
| `test_protected_routes_without_token` | 401 Unauthorized enforcement |
| `test_predict_and_sqlite_persistence` | ML inference and database persistence |
| `test_patients_endpoints` | Patient create, list, get-by-id |
| `test_admin_stats` | Aggregate analytics |

---

## Docker / Deployment

```bash
docker-compose up --build
```

| Service | Port | Description |
| :--- | :--- | :--- |
| `backend` | 8000 | FastAPI backend |
| `frontend` | 5173 → 80 | React frontend via Nginx |
| `ml_service` | 8001 | XGBoost inference microservice |

---

## Internship Context

- **Organization**: Infosys
- **Program**: Infosys Virtual Internship
- **Project**: HealthForecast AI

---

## Disclaimer

> **Clinical Decision-Support Disclaimer**: HealthForecast AI is developed as part of the **Infosys Virtual Internship Program** for educational, machine learning research, and decision-support demonstration purposes. It is not a certified medical device and should never replace qualified clinical judgment, diagnosis, or treatment.