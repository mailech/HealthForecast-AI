# HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System
## Infosys Virtual Internship Project Report & Technical Documentation

---

### Executive Summary

**Project Title**: HealthForecast AI  
**Program**: Infosys Virtual Internship / AI & Full-Stack Development Track  
**Domain**: Healthcare Informatics, Machine Learning, Clinical Decision-Support Systems  
**Core Technologies**: Python 3.12, FastAPI, XGBoost, Scikit-Learn, SQLite, SQLAlchemy, React 18, Vite, Docker  
**Primary Goal**: Develop a reliable, interpretable local decision-support web application that estimates 30-day hospital readmission risk for diabetic patients using clinical, encounter, demographic, and pharmacological features, supported by a robust 4-tier Role-Based Access Control (RBAC) architecture.

---

## 1. Problem Statement & Clinical Motivation

Hospital readmission within 30 days of inpatient discharge represents a major challenge in modern healthcare systems:
- **Financial & Resource Burden**: Unplanned readmissions increase national healthcare spending and create operational congestion in emergency departments and hospital wards.
- **Clinical Transition Gaps**: High readmission rates frequently correlate with incomplete disease management, adverse medication changes, or insufficient post-discharge follow-up.
- **Decision-Support Opportunity**: Healthcare practitioners require predictive tools at the point of discharge to identify patients at elevated risk, enabling targeted discharge planning, real-time clinical insights, and follow-up interventions.

---

## 2. Project Objectives

1. **Deploy a Machine Learning Pipeline**: Integrate a trained **XGBoost** classifier capable of processing multi-dimensional clinical data (encounter history, lab counts, medication dosages, diagnosis groups) and generating dynamic clinical insights based on feature extraction.
2. **Implement Secure 4-Tier Role-Based Access (RBAC)**:
   - **Doctor Role**: Evaluate patients, generate real-time readmission risk scores, and review personal clinical history.
   - **Hospital Administrator Role**: Monitor hospital-wide statistics, inspect overall risk distributions, and manage patient registries.
   - **Healthcare Researcher Role**: Access anonymized, aggregated population health analytics (e.g., demographic risk distributions and readmission rates).
   - **System Administrator Role**: Manage system health, monitor audit logs, and administer user accounts and roles.
3. **Persist Records Locally**: Provide local SQLite persistence with SQLAlchemy ORM to log patients, historical prediction scores, audit logs, and user notifications.
4. **Develop an Intuitive User Interface**: Build a responsive React + Vite application with role-specific dashboards, notification centers, and 1-click clinical presets for rapid evaluation workflows.
5. **Containerize for Portability**: Provide Docker and Docker Compose definitions for modular deployment.

---

## 3. Machine Learning Methodology & Architecture

```text
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
   Readmission Probability (P ∈ [0.0, 1.0])
               │
               ▼
   Clinical Risk Stratification & Dynamic Insights
   ├── Probability < 30%  ──► LOW RISK
   ├── 30% ≤ Probability < 50% ──► MEDIUM RISK
   ├── 50% ≤ Probability < 70% ──► HIGH RISK
   └── Probability ≥ 70%  ──► CRITICAL RISK
```

### 3.1 Dataset Description
- **Dataset**: Diabetes 130-US Hospitals (1999–2008) dataset from the UCI Machine Learning Repository.
- **Volume**: Over 100,000 clinical inpatient encounters representing diverse diabetic patient demographics.

### 3.2 Real Measured Performance Metrics
- **ROC-AUC**: $\approx$ **0.658**
- **Positive-Class Recall**: $\approx$ **0.59** (30-day readmission detection)

---

## 4. Software Architecture & Database Design

### 4.1 System Architecture
```text
┌───────────────────────────────────────────────────────────┐
│              React 18 (Vite) Frontend UI                  │
│       (Role Dashboards / Predictions / Audit Logs)        │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTP / JSON (Axios + JWT)
                              ▼
┌───────────────────────────────────────────────────────────┐
│                 FastAPI Backend Service                   │
│   ├── JWT Security Layer (PyJWT + Bcrypt)                 │
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
│   ├── predictions           ││   └── feature_columns.json │
│   ├── audit_logs            │└────────────────────────────┘
│   └── notifications         │
└─────────────────────────────┘
```

### 4.2 Database Schema (SQLite via SQLAlchemy)
- **`users`**: `id`, `username`, `password_hash`, `full_name`, `role` (Doctor, Hospital Administrator, Healthcare Researcher, System Administrator), `is_active`, `created_at`
- **`patients`**: `id`, `patient_name`, 46 clinical fields, `created_at`
- **`predictions`**: `id`, `patient_id`, `probability`, `risk_class`, `prediction`, `created_by`, `created_at`
- **`audit_logs`**: `id`, `user_id`, `action`, `detail`, `ip_address`, `created_at`
- **`notifications`**: `id`, `user_id`, `title`, `message`, `category`, `is_read`, `created_at`

---

## 5. API Catalog

| Method | Route | Access Role | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Database connectivity and ML pipeline health |
| `POST` | `/auth/login` | Public | Authenticate user and issue JWT bearer token |
| `POST` | `/auth/register` | Public | Register new credentials |
| `GET` | `/auth/me` | Any Authenticated | Retrieve current user profile and role |
| `POST` | `/predict` | Doctor, Admin | Run XGBoost inference, persist record, generate insights |
| `GET` | `/predictions` | Doctor, Admin | Retrieve past prediction evaluations |
| `POST` | `/patients` | Doctor, Admin | Create patient record in registry |
| `GET` | `/patients` | Doctor, Admin | List registered patients |
| `GET` | `/admin/stats` | Admin, Doctor | Aggregate analytics (patient & risk counts) |
| `GET` | `/researcher/analytics` | Researcher | View anonymized demographic and risk distributions |
| `GET` | `/sysadmin/users` | SysAdmin | View all registered system users |
| `PATCH`| `/sysadmin/users/{id}` | SysAdmin | Modify user roles and active status |
| `GET` | `/sysadmin/audit-logs` | SysAdmin | View immutable system audit logs |
| `GET` | `/sysadmin/health` | SysAdmin | View detailed system telemetry |
| `GET` | `/notifications` | Any Authenticated | View user notification inbox |

---

## 6. Verification, Testing & QA Results

### 6.1 Automated Pytest Suite (`tests/test_backend.py`)
A comprehensive suite validating RBAC isolation, ML inference, and persistence.
```text
======================= 28 passed in 11.21s ========================
✓ test_root_endpoint
✓ test_health_endpoint
✓ test_login_doctor
✓ test_login_admin
✓ test_login_researcher
✓ test_login_sysadmin
... (22 more tests covering RBAC boundaries, PyJWT, and persistence)
```

### 6.2 Live API E2E Verification
```text
============================================================
HealthForecast AI — Live E2E Verification
============================================================
[PASS] Health endpoint returns 200
[PASS] Authentication — All 4 Roles
[PASS] RBAC Enforcement (Researcher blocked from predict, etc.)
[PASS] Real XGBoost ML Prediction (Probability: 0.6259, Risk: HIGH, Insights: 5)
[PASS] Prediction History & Persistence
[PASS] Patient Management
[PASS] Researcher Analytics (anonymized)
[PASS] System Administrator Features
[PASS] Notifications

RESULTS: 40 passed, 0 failed out of 40 checks
```

### 6.3 Frontend Production Build
```text
> vite build
vite v6.4.3 building for production...
✓ 1657 modules transformed.
dist/index.html                   0.78 kB
dist/assets/index-JVHMNStN.css    8.74 kB
dist/assets/index-D0mHWUE2.js   260.75 kB
✓ built in 3.05s
```

---

## 7. Project Reflection & Internship Outcomes

1. **Applied AI in Healthcare**: Successfully translated an academic machine learning model (XGBoost) into a production-style REST application featuring dynamic, rule-based clinical insight generation.
2. **Full-Stack Competency**: Integrated modern FastAPI backend development, SQLAlchemy relational modeling, PyJWT role-based security, and React/Vite responsive design.
3. **Enterprise Architecture**: Implemented an extensible, scalable RBAC system complete with audit logging, system telemetry, and a notification engine, suitable for multi-tenant clinical environments.

---

## 8. Academic & Internship Disclaimer

> **Clinical Decision-Support Disclaimer**: HealthForecast AI is developed as part of the **Infosys Virtual Internship Program** for educational, machine learning research, and decision-support demonstration purposes. It is not a certified medical device and should never replace qualified clinical judgment, diagnosis, or treatment.
