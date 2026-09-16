# Healthcare Researcher Module Documentation

## 1. Executive Summary & PDF Requirements
This document details the implementation of all PDF-specified Healthcare Researcher modules for the **HealthForecast AI** system, adhering strictly to the uploaded specification document *AI_Hospital Readmission Prediction & Patient Risk Intelligence System*.

The specification mandates a dedicated, privacy-enforced workspace for Healthcare Researchers to perform epidemiological studies, clinical outcome evaluations, treatment effectiveness research, and population-level health trends analysis without compromising patient privacy or exposing Personally Identifiable Information (PII).

---

## 2. Researcher Responsibilities & Permissions Matrix

### PDF-Defined Responsibilities
1. **Healthcare Analytics Research**: Multi-dimensional macro-level cohort analysis.
2. **Clinical Outcome Analysis**: Retrospective evaluation of patient stay durations, readmission ratios, and clinical stability.
3. **Population Health Studies**: Epidemiological distribution analysis by age groups, admission categories, and primary diagnoses.
4. **Treatment Effectiveness Evaluation**: Observational assessment of medication regimen efficacy and therapeutic changes.

### PDF Access Permission Matrix Compliance
| Module / Capability | Researcher Permission | PDF Compliance Status |
| :--- | :--- | :--- |
| **Patient Records** | Anonymized Only | ✅ Enforced (Direct PII & raw patient endpoints strictly blocked) |
| **Medical History** | Anonymized Only | ✅ Enforced (Aggregated cohort attributes only) |
| **Risk Prediction Reports** | Aggregated Only | ✅ Enforced (No individual patient CDSS access) |
| **Readmission Forecasts** | Aggregated Only | ✅ Enforced (Historical trend analytics only) |
| **Treatment Effectiveness Reports** | Full Access | ✅ Enforced |
| **Hospital Analytics Dashboard** | Aggregated Only | ✅ Enforced |
| **Population Health Reports** | Full Access | ✅ Enforced |
| **Research Dataset Export** | Full Access | ✅ Enforced (Server-side scrubbed CSV generation) |
| **User Management** | No | 🚫 Blocked (HTTP 403) |
| **AI Model Management** | No | 🚫 Blocked (HTTP 403) |

---

## 3. Strict Restrictions & Privacy Safeguards

### PDF-Mandated Restrictions
1. **Zero Access to Direct Identifiers**: Cannot view `patient_nbr`, `encounter_id`, patient names, email, phone, SSN, or address.
2. **No Record Modifications**: Cannot create, edit, or delete patient records.
3. **No Clinical Decision Approvals**: Restricted from clinical approval workflows and individual patient prediction engines.

### Anonymization Design Pattern
- **Server-Side scrubbing**: Anonymization is strictly enforced in `backend/app/api/v1/endpoints/researcher.py` using `PROHIBITED_IDENTIFIER_COLUMNS`. Filtering out sensitive columns happens prior to payload returning or CSV file creation.
- **Aggregated Cohorts**: If fine-grained de-identification is insufficient, population-level cohorts are used to prevent re-identification attacks.

---

## 4. Frontend Modules & Navigation Architecture

### Sidebar Navigation (`frontend/src/components/layout/Sidebar.jsx`)
Healthcare Researchers are presented with a dedicated, isolated navigation menu:
- 📊 **Research Dashboard** (`/researcher/dashboard`)
- 👥 **Anonymized Patient Data** (`/researcher/patients`)
- 📈 **Aggregated Analytics** (`/researcher/analytics`)
- 🧪 **Treatment Effectiveness** (`/researcher/treatment`)
- 📉 **Readmission Trends** (`/researcher/readmission-trends`)
- 🏥 **Population Health** (`/researcher/population-health`)
- 📁 **Research Dataset** (`/researcher/research-dataset`)
- 📑 **Analytical Reports** (`/researcher/reports`)

### Main Landing Page (`frontend/src/pages/researcher/ResearcherDashboard.jsx`)
Acts as the central command center featuring interactive module cards, metric highlights, privacy badges, and direct navigation links to all 7 researcher sub-modules.

### Frontend Route Protections (`frontend/src/App.jsx`)
All `/researcher/*` routes are protected using strict role enforcement:
```jsx
<Route element={<ProtectedRoute allowedRoles={["Healthcare Researcher"]} />}>
  <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
  <Route path="/researcher/patients" element={<AnonymizedPatientDataPage />} />
  <Route path="/researcher/analytics" element={<AggregatedAnalyticsPage />} />
  <Route path="/researcher/treatment" element={<TreatmentAnalyticsDashboard />} />
  <Route path="/researcher/readmission-trends" element={<ReadmissionTrendsPage />} />
  <Route path="/researcher/population-health" element={<PopulationHealthPage />} />
  <Route path="/researcher/research-dataset" element={<ResearchDatasetPage />} />
  <Route path="/researcher/reports" element={<AnalyticalReportsPage />} />
</Route>
```

---

## 5. Backend REST API Endpoints & RBAC Rules

Mounted under `/api/v1/researcher` with strict `require_roles(["Healthcare Researcher", "System Administrator"])`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/researcher/anonymized-patients` | Returns macro-level cohort distributions (age, gender, race, primary diagnoses, readmission categories). |
| `POST` | `/api/v1/researcher/research-dataset/generate` | Accepts cohort filter criteria and returns summary metrics & preview data with PII scrubbed. |
| `POST` | `/api/v1/researcher/research-dataset/export` | Generates and streams a de-identified CSV dataset file directly from backend. |
| `POST` | `/api/v1/researcher/analytical-report/export` | Generates aggregated report CSVs for treatment effectiveness, readmission trends, population health, patient outcomes, or overall analytics. |

---

## 6. Dataset Generation & Export Capabilities

1. **Research Dataset Generator** (`/researcher/research-dataset`):
   - Interactive filtering by Age Group, Admission Type, Medication Status, and Readmission Outcome.
   - Cohort preview displaying total matching encounters and safe sample records.
   - One-click server-side CSV download.

2. **Analytical Report Exporter** (`/researcher/reports`):
   - Pre-packaged analytical export categories corresponding to PDF requirements.
   - Server-side CSV formatting with clear observational disclaimers.

---

## 7. Verification & Testing Results

### Automated Test Suite Execution
- **Command**: `backend/venv/Scripts/python -m pytest`
- **Result**: **70 passed out of 70 tests (100% pass rate)**.
- **Dedicated Privacy Test Suite**: `backend/tests/test_researcher_privacy.py` verified all 12 privacy and RBAC assertions:
  1. Researcher accesses anonymized data (`/api/v1/researcher/anonymized-patients`).
  2. Researcher forbidden from raw `/patients`.
  3. Researcher forbidden from raw `/encounters`.
  4. Researcher forbidden from clinical predictions (`/api/v1/predictions/predict`).
  5. Researcher forbidden from user management (`/api/v1/users`).
  6. Researcher forbidden from model management (`/api/v1/system/model-info`).
  7. Export scrubbed of `patient_nbr`.
  8. Export scrubbed of `encounter_id`.
  9. Zero PII returned in researcher endpoints.
  10. Hospital Admin forbidden from researcher dataset generation.
  11. Doctor forbidden from researcher dataset generation.
  12. SysAdmin retains administrative capabilities where authorized.

### Frontend Build Verification
- **Command**: `npm run build` (inside `frontend/`)
- **Result**: **Clean build completed in 2.56s** with zero errors (`dist/assets/index-B7fmTfK2.js`).

---

## 8. Integrity Assertions
- **Dataset**: `dataset/diabetic_data.csv` was untouched.
- **ML Artifacts**: `xgboost_model.joblib` and feature preprocessors were untouched.
- **Existing Functionality**: Doctor, Hospital Administrator, and System Administrator functionality preserved intact.
