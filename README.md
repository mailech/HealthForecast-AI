# HealthForecast AI

## Hospital Readmission Risk Prediction & Patient Risk Intelligence System

---

## Project Overview

**HealthForecast AI** is an AI-powered clinical decision-support web application developed as part of the **Infosys Virtual Internship** program.

The system uses a trained **XGBoost** machine learning model loaded directly inside a high-performance **FastAPI** backend to estimate 30-day hospital readmission risk for diabetic patients. Risk predictions are computed dynamically using `model.predict_proba()` based on clinical encounter data, demographic profiles, laboratory metrics, and medication regimens. 

The application features a 4-tier Role-Based Access Control (RBAC) system, real-time clinical insight generation, persistent SQLite storage, anonymized population health analytics, system audit logging, and in-app notifications.

---

## User Roles & Credentials

The system implements strict 4-tier Role-Based Access Control (RBAC):

| Role | Responsibilities & Access Scope | Seeded Demo Account |
| :--- | :--- | :--- |
| **Doctor** | Evaluate patient risk, run real-time predictions, view dynamic clinical insights, view personal prediction history, and view role-scoped clinical statistics. | `doctor@hospital.com` / `doctor123` |
| **Hospital Administrator** | View hospital-wide analytics, monitor overall patient risk distributions, inspect global prediction history, and manage patient records. | `admin@hospital.com` / `admin123` |
| **Healthcare Researcher** | Access anonymized, aggregated population health analytics, demographic risk breakdowns, and readmission rates. (Patient PII strictly hidden). | `researcher@hospital.com` / `researcher123` |
| **System Administrator** | Monitor system health telemetry, inspect audit logs, view total user metrics, and manage user accounts and active status. | `sysadmin@hospital.com` / `sysadmin123` |

---

## Key Features

- **JWT Authentication & Security**: Secure user login with PyJWT Bearer tokens and bcrypt password hashing.
- **Complete Role-Based Access Control (RBAC)**: Route-level authorization guards enforcing role boundaries across all 4 primary roles.
- **Direct ML Inference**: Pre-trained **XGBoost** model loaded directly within the FastAPI process for low-latency `predict_proba()` evaluation.
- **Dynamic Risk Classification**: Automated categorization into **LOW**, **MEDIUM**, **HIGH**, and **CRITICAL** readmission risk levels based on probability thresholds.
- **Clinical Insights Engine**: Feature-derived recommendations (e.g., medication reconciliation, discharge coordination, follow-up timelines) generated dynamically from patient features.
- **Patient Registry**: Store, retrieve, and manage patient encounter data using SQLite and SQLAlchemy ORM.
- **Prediction History & Sequential S.No**: Persistent prediction logs with user-friendly sequential display serial numbers (`1, 2, 3...`) preserving internal database IDs.
- **Researcher Analytics**: Anonymized, aggregated population statistics (readmission rates, risk distribution, age/gender breakdowns) protecting patient privacy.
- **System Telemetry & Audit Logging**: Real-time health monitoring and immutable audit logging for administrative oversight.
- **In-App Notification Center**: Alert feed for clinical warnings and system-wide notifications.

---

## Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend Framework** | Python 3.12, FastAPI, Pydantic v2 |
| **Database & ORM** | SQLite (PostgreSQL compatible), SQLAlchemy |
| **Authentication & Security** | PyJWT, bcrypt, OAuth2 Password Bearer |
| **Machine Learning** | XGBoost, Scikit-Learn, Pandas, NumPy, Joblib |
| **Frontend Framework** | React 18, Vite, JavaScript (ES6+), Axios, Lucide Icons |
| **Styling & Design System** | Modern Vanilla CSS (Glassmorphism, Dark/Light palettes, Responsive Layouts) |
| **Containerization** | Docker, Docker Compose |
| **Automated Testing** | Pytest, FastAPI TestClient |

---

## System Architecture

```text
React 18 + Vite Frontend Client
            │
            ▼  HTTP / REST (JWT Bearer Token)
FastAPI Backend Application
            │
            ├── SQLite Database (SQLAlchemy ORM)
            │      ├── users
            │      ├── patients
            │      ├── predictions
            │      ├── audit_logs
            │      └── notifications
            │
            └── XGBoost ML Model Pipeline (Loaded Directly in FastAPI)
                   │
                   ▼
            model.predict_proba()
                   │
                   ▼
            Readmission Probability Score (%)
                   │
                   ▼
            Risk Stratification (LOW / MEDIUM / HIGH / CRITICAL)
                   │
                   ▼
            Dynamic Feature-Based Clinical Insights
```

---

## Machine Learning Pipeline & Dataset

- **Dataset**: Diabetes 130-US Hospitals (1999–2008) dataset from the UCI Machine Learning Repository.
- **Target Variable**: 30-day hospital readmission (binary classification).
- **Features Processed (46 Total Raw Features)**:
  - Demographics (3): `race`, `gender`, `age`
  - Encounter & Stay (6): `admission_type_id`, `discharge_disposition_id`, `admission_source_id`, `time_in_hospital`, `payer_code`, `medical_specialty`
  - Utilization Counts (7): `num_lab_procedures`, `num_procedures`, `num_medications`, `number_outpatient`, `number_emergency`, `number_inpatient`, `number_diagnoses`
  - Lab Tests & Rx Changes (4): `max_glu_serum`, `A1Cresult`, `change`, `diabetesMed`
  - Diagnosis Groups (3): `diag_1_group`, `diag_2_group`, `diag_3_group`
  - Diabetic Medications (23): `metformin`, `insulin`, `glipizide`, `glyburide`, and 19 others

### Pipeline Transformations
- Categorical features (38) transformed via `OneHotEncoder(handle_unknown='ignore')`.
- Numerical features (8) normalized via `StandardScaler()`.
- Pipeline concatenated into a **196-dimensional input vector** processed by the trained XGBoost model.

### Verified Model Metrics
- **ROC-AUC**: $\approx$ **0.658**
- **Positive-Class Recall**: $\approx$ **0.59** (30-day readmission detection)

### Risk Stratification Matrix

| Risk Level | Probability Range ($P$) | Clinical Guidance & Recommendation |
| :--- | :--- | :--- |
| **LOW** | $P < 30\%$ | Standard post-discharge follow-up care. |
| **MEDIUM** | $30\% \le P < 50\%$ | Telehealth follow-up consultation within 14 days. |
| **HIGH** | $50\% \le P < 70\%$ | In-person clinical review & medication reconciliation within 7 days. |
| **CRITICAL** | $P \ge 70\%$ | Dedicated transitional care coordinator assigned before discharge. |

---

## API Catalog Summary

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Root metadata & model metrics |
| `GET` | `/health` | Public | System status, database & model readiness |
| `POST` | `/auth/login` | Public | Authenticate user & issue JWT bearer token |
| `POST` | `/auth/register` | Public | Register new account credentials |
| `GET` | `/auth/me` | Any Authenticated | Retrieve authenticated user profile & role |
| `POST` | `/predict` | Doctor, Admin | Run XGBoost inference, store result & return clinical insights |
| `GET` | `/predictions` | Doctor, Admin | Retrieve role-scoped prediction history |
| `POST` | `/patients` | Doctor, Admin | Register a new patient in database |
| `GET` | `/patients` | Doctor, Admin | List registered patients |
| `GET` | `/admin/stats` | Admin, SysAdmin | Retrieve global hospital administrative statistics |
| `GET` | `/researcher/analytics` | Researcher | Retrieve anonymized population health metrics |
| `GET` | `/sysadmin/health` | SysAdmin | View detailed system telemetry |
| `GET` | `/sysadmin/users` | SysAdmin | View registered system users |
| `PATCH`| `/sysadmin/users/{id}` | SysAdmin | Update user role or active status |
| `GET` | `/sysadmin/audit-logs` | SysAdmin | Retrieve system audit log events |
| `GET` | `/notifications` | Any Authenticated | Retrieve user notification inbox |

---

## Project Repository Structure

```
HealthForecast-AI/
├── backend/
│   ├── main.py              # FastAPI application & route endpoints
│   ├── auth.py              # JWT authentication & bcrypt hashing
│   ├── database.py          # SQLAlchemy database engine & session maker
│   ├── dependencies.py      # OAuth2 & Role-Based Authorization guards
│   ├── models.py            # SQLAlchemy ORM models (User, Patient, Prediction, AuditLog, Notification)
│   ├── schemas.py           # Pydantic v2 input/output data schemas
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend container image definition
│   └── ml_model/            # Trained XGBoost pipeline artifacts
│       ├── xgboost_readmission_model.pkl
│       ├── onehot_encoder.pkl
│       ├── standard_scaler.pkl
│       └── feature_columns.json
├── frontend/
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite bundler configuration
│   ├── Dockerfile           # Frontend multi-stage Nginx container
│   ├── nginx.conf           # Nginx reverse proxy configuration
│   └── src/
│       ├── App.jsx          # Main application & protected route routing
│       ├── main.jsx         # React DOM entry point
│       ├── index.css        # Core design system & theme variables
│       ├── context/         # AuthContext (JWT state management)
│       ├── services/        # Axios client instance with auth interceptors
│       ├── components/      # Navbar, ModelBanner, ResultCard
│       └── pages/           # Role Dashboards, Prediction, History, Patients, Research, SysAdmin, Audit, Notifications
├── tests/
│   ├── test_backend.py      # Pytest automated test suite (29 tests)
│   └── test_healthforecast.db # Temporary isolated test database (auto-cleaned)
├── docker-compose.yml       # Multi-service container deployment
├── pytest.ini               # Pytest configuration
├── healthforecast.db        # SQLite database file
├── IMPLEMENTATION_PLAN.md   # System implementation plan
└── INFOSYS_INTERNSHIP_PROJECT_REPORT.md  # Infosys Virtual Internship Project Report
```

---

## Local Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Endpoint: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://127.0.0.1:5173`

---

## Automated Testing

Backend unit and integration tests run against an isolated temporary database (`test_healthforecast.db`) to protect production data:

```bash
pytest tests
```

**Pass Rate:** **29/29 tests passed (100%)**

---

## Docker Deployment

To deploy both frontend and backend services using Docker:

```bash
docker-compose up --build
```

---

## Internship Context

- **Organization**: Infosys
- **Program**: Infosys Virtual Internship Program
- **Project**: HealthForecast AI — Hospital Readmission Risk Prediction & Patient Risk Intelligence System

---

## Clinical Decision-Support Disclaimer

> **Clinical Decision-Support Disclaimer**: HealthForecast AI is developed as part of the **Infosys Virtual Internship Program** for educational, machine learning research, and decision-support demonstration purposes. It is an academic decision-support prototype and NOT a certified medical device. It should never replace qualified clinical judgment, medical diagnosis, or professional treatment.