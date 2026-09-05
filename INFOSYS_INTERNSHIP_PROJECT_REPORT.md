# HealthForecast AI: Hospital Readmission Risk Prediction System
## Infosys Virtual Internship Project Report & Technical Documentation

---

### Executive Summary

**Project Title**: HealthForecast AI  
**Program**: Infosys Virtual Internship / AI & Full-Stack Development Track  
**Domain**: Healthcare Informatics, Machine Learning, Clinical Decision-Support Systems  
**Core Technologies**: Python 3.12, FastAPI, XGBoost, Scikit-Learn, SQLite, SQLAlchemy, React 18, Vite, Docker  
**Primary Goal**: Develop a reliable, interpretable local decision-support web application that estimates 30-day hospital readmission risk for diabetic patients using clinical, encounter, demographic, and pharmacological features.

---

## 1. Problem Statement & Clinical Motivation

Hospital readmission within 30 days of inpatient discharge represents a major challenge in modern healthcare systems:
- **Financial & Resource Burden**: Unplanned readmissions increase national healthcare spending and create operational congestion in emergency departments and hospital wards.
- **Clinical Transition Gaps**: High readmission rates frequently correlate with incomplete disease management, adverse medication changes, or insufficient post-discharge follow-up.
- **Decision-Support Opportunity**: Healthcare practitioners require predictive tools at the point of discharge to identify patients at elevated risk, enabling targeted discharge planning and follow-up interventions.

---

## 2. Project Objectives

1. **Deploy a Machine Learning Pipeline**: Integrate a trained **XGBoost** classifier capable of processing multi-dimensional clinical data (encounter history, lab counts, medication dosages, diagnosis groups).
2. **Implement Secure Role-Based Access (RBAC)**:
   - **Doctor Role**: Evaluate patients, generate real-time readmission risk scores, and review personal clinical history.
   - **Hospital Administrator Role**: Monitor hospital-wide statistics, inspect overall risk distributions, and manage patient registries.
3. **Persist Records Locally**: Provide local SQLite persistence with SQLAlchemy ORM to log patients and historical prediction scores.
4. **Develop an Intuitive User Interface**: Build a responsive React + Vite application with 1-click clinical presets for rapid evaluation and demonstration workflows.
5. **Containerize for Portability**: Provide Docker and Docker Compose definitions for modular deployment.

---

## 3. Machine Learning Methodology & Architecture

```
Patient Clinical Inputs (46 raw features)
               │
               ▼
   Data Preprocessing Pipeline
   ├── Categorical Features (38 cols) ──► OneHotEncoder ──► 188 encoded cols
   └── Numerical Features (8 cols)    ──► StandardScaler ──► 8 normalized cols
               │
               ▼
   Combined Feature Vector (196 features)
               │
               ▼
   XGBoost Classification Engine
               │
               ▼
   Readmission Probability ($P \in [0.0, 1.0]$)
               │
               ▼
   Clinical Risk Stratification
   ├── Probability < 30%  ──► LOW RISK
   ├── 30% ≤ Probability < 50% ──► MEDIUM RISK
   ├── 50% ≤ Probability < 70% ──► HIGH RISK
   └── Probability ≥ 70%  ──► CRITICAL RISK
```

### 3.1 Dataset Description
- **Dataset**: Diabetes 130-US Hospitals (1999–2008) dataset from the UCI Machine Learning Repository.
- **Volume**: Over 100,000 clinical inpatient encounters representing diverse diabetic patient demographics.

### 3.2 Clinical Feature Schema (46 Inputs)
1. **Demographics (3)**: `race`, `gender`, `age`.
2. **Hospital & Admission Details (6)**: `admission_type_id`, `discharge_disposition_id`, `admission_source_id`, `time_in_hospital`, `payer_code`, `medical_specialty`.
3. **Encounter Utilization & Procedures (7)**: `num_lab_procedures`, `num_procedures`, `num_medications`, `number_outpatient`, `number_emergency`, `number_inpatient`, `number_diagnoses`.
4. **Laboratory Tests & Diabetes Prescriptions (4)**: `max_glu_serum`, `A1Cresult`, `change`, `diabetesMed`.
5. **Primary/Secondary/Tertiary Diagnoses (3)**: `diag_1_group`, `diag_2_group`, `diag_3_group`.
6. **Medication Dosages (23)**: `metformin`, `repaglinide`, `nateglinide`, `chlorpropamide`, `glimepiride`, `acetohexamide`, `glipizide`, `glyburide`, `tolbutamide`, `pioglitazone`, `rosiglitazone`, `acarbose`, `miglitol`, `troglitazone`, `tolazamide`, `examide`, `citoglipton`, `insulin`, `glyburide_metformin`, `glipizide_metformin`, `glimepiride_pioglitazone`, `metformin_rosiglitazone`, `metformin_pioglitazone`.

### 3.3 Real Measured Performance Metrics
- **ROC-AUC**: $\approx$ **0.658**
- **Positive-Class Recall**: $\approx$ **0.59** (30-day readmission detection)

---

## 4. Software Architecture & Database Design

### 4.1 System Architecture
```
┌───────────────────────────────────────────────────────────┐
│              React 18 (Vite) Frontend UI                  │
│       (Dashboard / Prediction Form / History Tables)       │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTP / JSON (Axios + JWT)
                              ▼
┌───────────────────────────────────────────────────────────┐
│                 FastAPI Backend Service                   │
│   ├── JWT Security Layer (OAuth2 Bearer + Bcrypt)         │
│   ├── Input Validation (Pydantic Models)                  │
│   ├── SQLAlchemy ORM Layer                                │
│   └── ML Inference Dispatcher                             │
└──────────────┬─────────────────────────────┬──────────────┘
               │                             │
               ▼                             ▼
┌─────────────────────────────┐┌────────────────────────────┐
│   SQLite Database Engine    ││   XGBoost ML Artifacts     │
│   (healthforecast.db)       ││   ├── model.pkl            │
│   ├── users                 ││   ├── encoder.pkl          │
│   ├── patients              ││   ├── scaler.pkl           │
│   └── predictions           ││   └── feature_columns.json │
└─────────────────────────────┘└────────────────────────────┘
```

### 4.2 Database Schema (SQLite via SQLAlchemy)
- **`users` Table**:
  - `id` (Integer, Primary Key)
  - `username` (String, Unique, Index)
  - `password_hash` (String, Bcrypt hash)
  - `role` (String: `"Doctor"` or `"Hospital Administrator"`)
  - `created_at` (DateTime)
- **`patients` Table**:
  - `id` (Integer, Primary Key)
  - `patient_name` (String)
  - All 46 demographic, encounter, and medication fields
  - `created_at` (DateTime)
- **`predictions` Table**:
  - `id` (Integer, Primary Key)
  - `patient_id` (Integer, Foreign Key $\rightarrow$ `patients.id`)
  - `probability` (Float, Readmission score)
  - `risk_class` (String: `"LOW"`, `"MEDIUM"`, `"HIGH"`, `"CRITICAL"`)
  - `prediction` (String, Clinical descriptive label)
  - `created_by` (Integer, Foreign Key $\rightarrow$ `users.id`)
  - `created_at` (DateTime)

---

## 5. API Catalog

| Method | Route | Access Role | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | System status and verified model metrics |
| `GET` | `/health` | Public | Database connectivity and ML pipeline health |
| `GET` | `/docs` | Public | OpenAPI / Swagger interactive documentation |
| `POST` | `/auth/login` | Public | Authenticate user and issue JWT bearer token |
| `POST` | `/auth/register` | Public / Admin | Register new staff credentials |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile and role |
| `POST` | `/predict` | Doctor, Admin | Run XGBoost inference and persist record to SQLite |
| `GET` | `/predictions` | Doctor, Admin | Retrieve past prediction evaluations |
| `POST` | `/patients` | Doctor, Admin | Create patient record in registry |
| `GET` | `/patients` | Doctor, Admin | List registered patients |
| `GET` | `/admin/stats` | Admin, Doctor | Aggregate analytics (patient & risk counts) |

---

## 6. Verification, Testing & QA Results

### 6.1 Automated Pytest Suite (`tests/test_backend.py`)
```
======================== 7 passed in 5.21s ========================
✓ test_root_endpoint                     [PASS]
✓ test_health_endpoint                   [PASS]
✓ test_login_doctor_and_admin            [PASS]
✓ test_register_new_user                 [PASS]
✓ test_protected_routes_without_token    [PASS]
✓ test_predict_and_sqlite_persistence    [PASS]
✓ test_admin_stats                       [PASS]
```

### 6.2 End-to-End User Verification
- **Doctor Workflow**: Login $\rightarrow$ Dashboard $\rightarrow$ 1-Click High-Risk Preset $\rightarrow$ Predict ($\rightarrow 61.45\%$ probability) $\rightarrow$ Persist $\rightarrow$ History Log $\rightarrow$ Sign Out.
- **Admin Workflow**: Login $\rightarrow$ Real-time Statistics ($\uparrow$ total predictions) $\rightarrow$ Registry Audit.

---

## 7. Project Reflection & Internship Outcomes

1. **Applied AI in Healthcare**: Successfully translated an academic machine learning model (XGBoost) into a production-style, containerized REST application.
2. **Full-Stack Competency**: Integrated modern FastAPI backend development, SQLAlchemy relational modeling, JWT role-based security, and React/Vite responsive design.
3. **Clinical Decision Support Alignment**: Designed user experience specifically tailored for clinical practitioners with clear disclaimers, risk categories, and 1-click evaluation presets.

---

## 8. Academic & Internship Disclaimer

> **Clinical Decision-Support Disclaimer**: HealthForecast AI is developed as part of the **Infosys Virtual Internship Program** for educational, machine learning research, and decision-support demonstration purposes. It is not a certified medical device and should never replace qualified clinical judgment, diagnosis, or treatment.
