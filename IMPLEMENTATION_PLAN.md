# HealthForecast AI: Full Project Implementation Plan

**Project Title**: HealthForecast AI  
**Domain**: Clinical Decision-Support System & Hospital Readmission Risk Prediction  
**Program**: Infosys Virtual Internship Project  
**Tech Stack**: Python 3.12, FastAPI, XGBoost, Scikit-Learn, SQLite, SQLAlchemy, React 18, Vite, Docker  

---

## 1. System Overview & Architecture

HealthForecast AI provides healthcare professionals (Doctors & Hospital Administrators) with real-time 30-day readmission risk estimates for diabetic patients based on clinical encounters, demographic factors, lab results, and medication regimens.

### 1.1 End-to-End Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 18 + Vite Frontend Client                      │
│   - Role-Based Access Portals (Doctor Dashboard & Admin Analytics)     │
│   - Clinical Prediction Input Form (46 Features + 1-Click Presets)     │
│   - Patient Risk History, Stratification Badges & Analytics            │
│   - Modern CSS Design System (Glassmorphic, Responsive, Dark Mode)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Bearer Token)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Engine                          │
│   - Auth & RBAC (OAuth2 Bearer, Bcrypt Password Hashing, JWT Tokens)   │
│   - Pydantic v2 Validation Schemas & Data Serialization                │
│   - ML Inference Dispatcher & Feature Preprocessing Engine             │
│   - SQLAlchemy ORM Data Access Layer                                   │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────┐┌────────────────────────────────────┐
│      SQLite Database Layer       ││     XGBoost ML Model Pipeline      │
│   - users (Doctors & Admins)     ││   - One-Hot Categorical Encoder    │
│   - patients (Clinical Registry) ││   - Standard Numerical Scaler      │
│   - predictions (Risk & History) ││   - Trained XGBoost Classifier     │
└──────────────────────────────────┘└────────────────────────────────────┘
```

---

## 2. Multi-Phase Implementation Roadmap

```
Phase 1: Machine Learning & Preprocessing Pipeline
  ├── 1.1 Data Exploration & Cleansing (UCI 130-US Hospitals Dataset)
  ├── 1.2 Feature Engineering (46 Raw Clinical Features)
  │      ├── 38 Categorical Features ──► OneHotEncoder (188 cols)
  │      └── 8 Numerical Features    ──► StandardScaler (8 cols)
  ├── 1.3 XGBoost Model Training & Hyperparameter Tuning
  └── 1.4 Serialization of Pipeline Artifacts (model.pkl, encoder.pkl, scaler.pkl)

Phase 2: FastAPI Backend & RBAC Security Layer
  ├── 2.1 Database Schema Modeling (SQLAlchemy: users, patients, predictions)
  ├── 2.2 JWT Authentication & Password Hashing (Bcrypt + OAuth2 Bearer)
  ├── 2.3 Role-Based Authorization (Doctor vs. Hospital Administrator)
  ├── 2.4 ML Inference Dispatcher Integration (/predict)
  └── 2.5 Analytics & Patient Registry APIs (/admin/stats, /patients, /predictions)

Phase 3: React 18 + Vite Frontend Application
  ├── 3.1 Design System, Glassmorphic UI & Dark Theme
  ├── 3.2 Authentication Context & Protected Routing
  ├── 3.3 Doctor Clinical Portal with 1-Click Presets (High-Risk, Low-Risk)
  ├── 3.4 Interactive Form (Demographics, Hospital Stay, Counts, Medications)
  ├── 3.5 Risk Gauge Visualizer & Metric Breakdown
  └── 3.6 Hospital Administrator Analytics & Patient Registry Table

Phase 4: Containerization, Testing & Documentation
  ├── 4.1 Automated Backend Pytest Suite (100% Pass Rate across 7 Core Tests)
  ├── 4.2 Dockerfile & Multi-Container docker-compose Orchestration
  └── 4.3 Technical Report & Project Documentation
```

---

## 3. Detailed Component Specifications

### 3.1 Machine Learning Pipeline & Schema

* **Dataset Source**: Diabetes 130-US Hospitals (1999–2008) Dataset from UCI ML Repository.
* **Input Schema (46 Features)**:
  1. **Demographics (3)**: `race`, `gender`, `age`.
  2. **Admission & Stay (6)**: `admission_type_id`, `discharge_disposition_id`, `admission_source_id`, `time_in_hospital`, `payer_code`, `medical_specialty`.
  3. **Encounter Utilization & Procedures (7)**: `num_lab_procedures`, `num_procedures`, `num_medications`, `number_outpatient`, `number_emergency`, `number_inpatient`, `number_diagnoses`.
  4. **Lab Tests & Diabetes Rx (4)**: `max_glu_serum`, `A1Cresult`, `change`, `diabetesMed`.
  5. **ICD-9 Diagnosis Groups (3)**: `diag_1_group`, `diag_2_group`, `diag_3_group`.
  6. **Diabetic Medications (23)**: `metformin`, `repaglinide`, `nateglinide`, `chlorpropamide`, `glimepiride`, `acetohexamide`, `glipizide`, `glyburide`, `tolbutamide`, `pioglitazone`, `rosiglitazone`, `acarbose`, `miglitol`, `troglitazone`, `tolazamide`, `examide`, `citoglipton`, `insulin`, `glyburide_metformin`, `glipizide_metformin`, `glimepiride_pioglitazone`, `metformin_rosiglitazone`, `metformin_pioglitazone`.

* **Feature Transformation**:
  - `OneHotEncoder(handle_unknown='ignore')` applied to 38 categorical columns.
  - `StandardScaler()` applied to 8 numeric columns.
  - Concatenated into a unified **196-dimensional input vector**.

* **Risk Stratification Matrix**:
  | Risk Level | Probability Range | Recommended Clinical Action |
  | :--- | :--- | :--- |
  | **LOW** | $P < 30\%$ | Standard post-discharge follow-up care. |
  | **MEDIUM** | $30\% \le P < 50\%$ | Telehealth follow-up consultation within 14 days. |
  | **HIGH** | $50\% \le P < 70\%$ | In-person review & medication reconciliation within 7 days. |
  | **CRITICAL** | $P \ge 70\%$ | Transitional care manager assigned before hospital discharge. |

---

### 3.2 Database Models & Entity Relations

```
┌─────────────────────────┐         ┌─────────────────────────┐
│          users          │         │        patients         │
├─────────────────────────┤         ├─────────────────────────┤
│ id (PK, Integer)        │         │ id (PK, Integer)        │
│ username (String, Unique│         │ patient_name (String)   │
│ password_hash (String)  │         │ [46 clinical columns]   │
│ role (Doctor / Admin)   │         │ created_at (DateTime)   │
│ created_at (DateTime)   │         └───────────┬─────────────┘
└───────────┬─────────────┘                     │
            │                                   │
            │ 1:N                               │ 1:N
            ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                         predictions                         │
├─────────────────────────────────────────────────────────────┤
│ id (PK, Integer)                                            │
│ patient_id (FK -> patients.id)                              │
│ probability (Float)                                         │
│ risk_class (String: LOW / MEDIUM / HIGH / CRITICAL)         │
│ prediction (String)                                         │
│ created_by (FK -> users.id)                                 │
│ created_at (DateTime)                                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.3 Backend API Catalog

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | System status and model performance metrics |
| `GET` | `/health` | Public | Healthcheck for DB and ML model readiness |
| `POST` | `/auth/login` | Public | Validates credentials, returns JWT bearer token |
| `POST` | `/auth/register` | Admin | Registers new staff accounts |
| `GET` | `/auth/me` | Authenticated | Returns current authenticated user profile |
| `POST` | `/predict` | Doctor, Admin | Runs inference, stratifies risk, saves record |
| `GET` | `/predictions` | Doctor, Admin | Returns paginated risk prediction history |
| `GET` | `/patients` | Doctor, Admin | Lists registered patient records |
| `POST` | `/patients` | Doctor, Admin | Registers a new patient |
| `GET` | `/admin/stats` | Admin, Doctor | Aggregate analytics (totals, risk breakdown) |

---

### 3.4 Frontend Architecture & User Experience

* **Doctor Portal**:
  - **Quick Presets**: 1-click loading for instant demonstration (High-Risk complex diabetic case, Low-Risk baseline case).
  - **Modular Input**: Grouped accordion sections for Demographics, Admission Data, Encounter Counts, and Medications.
  - **Real-Time Visuals**: Dynamic risk gauge with color gradients and percentage readouts.
* **Admin Portal**:
  - Aggregate statistics dashboard with real-time patient counts, risk distribution breakdowns, and audit logs.
* **Security**:
  - JWT token saved securely with automatic header attachment via Axios interceptors and route guarding.

---

### 3.5 Verification & Testing

#### Pytest Automated Test Matrix
Run via: `pytest tests/test_backend.py -v`

| Test Case | Purpose | Result |
| :--- | :--- | :--- |
| `test_root_endpoint` | Validates API metadata and status | **PASSED** |
| `test_health_endpoint` | Checks DB and model pipeline health | **PASSED** |
| `test_login_doctor_and_admin` | Verifies JWT generation for valid credentials | **PASSED** |
| `test_register_new_user` | Verifies user creation via Admin route | **PASSED** |
| `test_protected_routes_without_token` | Asserts `401 Unauthorized` for missing JWT | **PASSED** |
| `test_predict_and_sqlite_persistence` | Tests inference + SQLite storage | **PASSED** |
| `test_admin_stats` | Tests aggregate computation of metrics | **PASSED** |

---

## 4. How to Run & Deploy

### Quick Start (Local Development)

```bash
# 1. Start Backend API
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. Start Frontend App (in another terminal)
cd frontend
npm run dev

# 3. Run Automated Tests
pytest
```

### Docker Multi-Container Deployment

```bash
docker-compose up --build
```
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:8000`
* **Swagger API Docs**: `http://localhost:8000/docs`
