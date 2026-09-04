# HealthForecast AI: User Operational Manual

## 1. Introduction

HealthForecast AI provides customized clinical and administrative workflows tailored to specific healthcare roles.

---

## 2. Default Login Credentials

| Role | Email | Default Password | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@healthforecast.ai` | `Admin@123` | `/dashboard/admin` |
| **Doctor** | `doctor@healthforecast.ai` | `Admin@123` | `/dashboard/doctor` |
| **Hospital Administrator** | `hospital_admin@healthforecast.ai` | `Admin@123` | `/dashboard/hospital-admin` |
| **Healthcare Researcher** | `researcher@healthforecast.ai` | `Admin@123` | `/dashboard/researcher` |

---

## 3. Role-Based Guides

### 3.1 Doctor Workflow
1. **High-Risk Triage**: Log in as Doctor to view the prioritized High-Risk Patient Triage table.
2. **AI Risk Simulation**: Click **Run Simulation** or **AI Risk Calculator** to open the interactive calculator. Adjust parameters (age, A1C level, prior ER visits) to view immediate risk probabilities and clinical recommendations.
3. **Patient Management**: Access patient profiles, medical history, and record new admissions.

### 3.2 Hospital Administrator Workflow
1. **Hospital Analytics**: View real-time patient turnover, bed occupancy, and overall readmission rates.
2. **Model Accuracy Verification**: Navigate to **Model Validation** to inspect accuracy metrics (91.5% accuracy, 0.942 ROC-AUC).
3. **Reports**: Generate patient outcome and department performance reports.

### 3.3 Healthcare Researcher Workflow
1. **Dataset Access**: Inspect anonymized UCI Diabetes 130-US Hospitals dataset.
2. **Model Benchmarks**: Compare performance between RandomForest, GradientBoosting, and LogisticRegression baseline.
3. **Data Export**: Export anonymized datasets for clinical research.

### 3.4 System Administrator Workflow
1. **User Management**: Add, update, activate, or deactivate platform users and roles.
2. **Audit Logging**: View system action audit logs for compliance.
3. **Dataset Import**: Execute batch dataset imports and retrain ML pipelines.
