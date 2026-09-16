# HealthForecast AI: AI Model Management Module Documentation

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Phase**: Step 2 — AI Model Management Module Implementation  
**Target Role**: System Administrator (`System Administrator`)  
**Backend Endpoint**: `GET /api/v1/system/model-info`  
**Frontend Route**: `/sysadmin/model` (`<AIModelManagementPage />`)  
**Authoritative Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Date**: September 2026  

---

## 1. Overview & PDF Module Coverage

The **AI Model Management Module** fulfills Core Module 7 of the HealthForecast AI project specification. It provides the **System Administrator** with complete, real-time monitoring and administrative oversight of the production machine learning model, offline evaluation benchmarks, feature importance hierarchies, live prediction logging telemetry, and artifact deployment status.

### PDF Core Requirements Addressed:
1. **AI Model Deployment & Management**: Inspection of production candidate XGBoost model (`v1.0.0-xgb`) and preprocessor artifact status.
2. **Model Evaluation & Telemetry**: Empirical validation metrics (Accuracy, Precision, Recall/Sensitivity, F1-Score, ROC-AUC, PR-AUC, Specificity, Confusion Matrix) evaluated on the 19,802 holdout test set.
3. **Prediction Monitoring**: Database query logging metrics (`total_predictions_logged`), active service status (`Online`), and latest prediction timestamp tracking.
4. **Performance Optimization Telemetry**: Local CPU inference latency benchmarks (~80–95ms), concurrency handling status (Thread-safe singleton engine), and memory footprint (~474 KB model + ~11 KB preprocessor).
5. **Feature Importance Hierarchy**: Interactive Gini gain importance visualization for all 187 safe pre-discharge features.

---

## 2. Security & RBAC Enforcement

The AI Model Management Module is strictly isolated to **System Administrators**:

- **Backend API**: `GET /api/v1/system/model-info` enforces `Depends(require_roles(["System Administrator"]))`. Unauthorized requests from `Doctor`, `Hospital Administrator`, or `Healthcare Researcher` receive an **HTTP 403 Forbidden** response. Unauthenticated requests receive **HTTP 401 Unauthorized**.
- **Frontend Navigation**: The `AI Model Management` link in `Sidebar.jsx` is rendered **only** when `user.role.name === 'System Administrator'`.
- **Route Guarding**: `App.jsx` wraps route `/sysadmin/model` inside `<ProtectedRoute allowedRoles={["System Administrator"]} />`.
- **Management-Only Scope**: The view is read-only for monitoring and governance. It does NOT provide a button to retrain or overwrite production model artifacts.

---

## 3. Data Sources & Empirical Metric Grounding

All displayed metrics originate strictly from verified, empirical project artifacts and live database state. Zero synthetic or fake data is generated.

### 3.1 Empirical Metric Data Sources:
1. **Model Metadata File**: `backend/ml/models/model_metadata.json` (Stores offline test set metrics evaluated on 19,802 encounters).
2. **Production Model Artifact**: `backend/ml/models/xgboost_model.joblib` (~474 KB).
3. **Fitted Preprocessor Artifact**: `backend/ml/models/preprocessor.joblib` (~11 KB, 187 safe pre-discharge features).
4. **Prediction Audit Table**: `ReadmissionPrediction` DB model (`readmission_predictions` SQL table).

---

## 4. Validated Candidate Model Comparison

The module presents the empirical comparison between the winning production model (**XGBoost**) and the candidate baseline model (**Random Forest**):

| Evaluation Metric | XGBoost Classifier (Production Candidate) | Random Forest Candidate | Clinical & Model Rationale |
| :--- | :---: | :---: | :--- |
| **Model Version** | `v1.0.0-xgb` | `v1.0.0-rf` | Validated model artifacts in `backend/ml/models/`. |
| **Accuracy** | **65.08%** (0.6508) | **69.35%** (0.6935) | Random Forest has higher overall accuracy due to higher TN specificity. |
| **Recall / Sensitivity (`<30`d)** | **54.96%** (0.5496) | **47.65%** (0.4765) | **XGBoost Winner**: +7.31% higher recall, capturing **1,218 out of 2,216 early readmissions** (+162 high-risk patients caught). |
| **Precision** | **17.07%** (0.1707) | **17.70%** (0.1770) | Comparable precision on rare positive class (11.19% baseline prevalence). |
| **F1-Score** | **0.2605** | **0.2581** | XGBoost achieves higher balanced F1-score. |
| **ROC-AUC** | **0.6471** | **0.6449** | XGBoost exhibits superior overall risk discrimination. |
| **PR-AUC (Precision-Recall)** | **0.2067** | **0.1920** | XGBoost outperforms Random Forest across precision-recall curve. |
| **Specificity** | **66.36%** | **72.08%** | Random Forest correctly identifies more non-readmission cases. |
| **Missed Readmissions (FN)** | **998 patients** | **1,160 patients** | **XGBoost Winner**: 162 fewer missed high-cost readmissions (14.0% reduction in clinical oversights). |

---

## 5. Top 15 Feature Importances (XGBoost)

Extracted directly from `top_features_xgboost` in `model_metadata.json`:

1. `number_inpatient` (Prior inpatient admissions in past 12 months): **6.32%**
2. `number_diagnoses` (Total recorded diagnoses during stay): **1.20%**
3. `number_emergency` (Prior ER visits in past 12 months): **1.15%**
4. `age_ordinal` (Patient age bracket): **1.14%**
5. `max_glu_serum_>200` (Glucose serum > 200 mg/dL): **1.13%**
6. `diabetesMed_binary` (Prescribed diabetes medication): **1.09%**
7. `payer_code_MC` (Medicare primary payer): **1.09%**
8. `diag_1_group_Respiratory` (Primary diagnosis Respiratory): **1.07%**
9. `time_in_hospital` (Inpatient stay duration in days): **0.98%**
10. `medical_specialty_Cardiology` (Admitting/consulting specialty Cardiology): **0.96%**
11. `medical_specialty_ObstetricsandGynecology`: **0.96%**
12. `medical_specialty_Surgery-Cardiovascular/Thoracic`: **0.94%**
13. `diag_1_group_Circulatory` (Primary diagnosis Circulatory): **0.94%**
14. `medical_specialty_Oncology`: **0.93%**
15. `max_glu_serum_nan` (No serum glucose test performed): **0.91%**

---

## 6. API Endpoint Specification

### `GET /api/v1/system/model-info`

- **Authorization**: Bearer JWT (`System Administrator` only).
- **HTTP Method**: `GET`.
- **Response Format**: `application/json`.

#### Sample JSON Response:
```json
{
  "model_name": "XGBoost Readmission Classifier",
  "algorithm": "XGBoost (Extreme Gradient Boosting)",
  "model_version": "v1.0.0-xgb",
  "status": "Active / Deployed",
  "artifact_available": true,
  "preprocessor_available": true,
  "dataset": "Diabetes 130-US Hospitals (dataset/diabetic_data.csv)",
  "train_samples": 79541,
  "test_samples": 19802,
  "feature_count": 187,
  "evaluation_metrics": {
    "xgboost": {
      "accuracy": 0.6508433491566509,
      "precision": 0.17073170731707318,
      "recall_sensitivity": 0.5496389891696751,
      "f1_score": 0.2605347593582888,
      "roc_auc": 0.6470999427876047,
      "pr_auc": 0.20672219381702628,
      "specificity": 0.66359604230638,
      "confusion_matrix": {
        "tn": 11670,
        "fp": 5916,
        "fn": 998,
        "tp": 1218
      }
    },
    "random_forest": {
      "accuracy": 0.6934653065346935,
      "precision": 0.17700301709688232,
      "recall_sensitivity": 0.47653429602888087,
      "f1_score": 0.25812759716450745,
      "roc_auc": 0.6449357587119061,
      "pr_auc": 0.19197528658272356,
      "specificity": 0.7208006368702377,
      "confusion_matrix": {
        "tn": 12676,
        "fp": 4910,
        "fn": 1160,
        "tp": 1056
      }
    }
  },
  "top_features": {
    "number_inpatient": 0.06320501863956451,
    "number_diagnoses": 0.012006200850009918,
    "number_emergency": 0.011506903916597366,
    "age_ordinal": 0.011440188623964787,
    "max_glu_serum_>200": 0.011302710510790348
  },
  "prediction_monitoring": {
    "service_status": "Online",
    "total_predictions_logged": 14,
    "latest_prediction_timestamp": "2026-09-16T06:30:00Z",
    "prediction_service_endpoint": "/api/v1/predictions/predict"
  },
  "performance_benchmarks": {
    "inference_latency": "~80–95ms (local CPU benchmark)",
    "concurrency_handling": "Thread-safe singleton engine",
    "memory_footprint": "~474 KB (XGBoost) + ~11 KB (Preprocessor)"
  },
  "deployment_status": {
    "preprocessor_loaded": true,
    "model_loaded": true,
    "production_candidate": "XGBoost Classifier (v1.0.0-xgb)",
    "leakage_safeguards": "0 patient overlap (GroupShuffleSplit), pre-discharge features only"
  }
}
```

---

## 7. Verification & Test Suite Execution

### 7.1 Backend Pytest Verification
Executed complete backend test suite including new AI Model Management RBAC tests (`test_system_administrator_can_access_model_info` and `test_non_sysadmin_roles_forbidden_from_model_info`):

```text
============================= 59 passed in 34.25s =============================
```

### 7.2 Frontend Production Build Verification
Executed `npm run build` inside `frontend/`:

```text
✓ 2488 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-BrXojS0Y.css   51.21 kB │ gzip:   8.44 kB
dist/assets/index-MqytrNBn.js   832.19 kB │ gzip: 231.81 kB
✓ built in 3.64s
```

---

## 8. Preserved Safeguards & Immutability

1. **Dataset Integrity**: `dataset/diabetic_data.csv` remains 100% read-only and untouched.
2. **ML Model Artifacts**: `xgboost_model.joblib`, `preprocessor.joblib`, `random_forest_model.joblib` were not retrained or modified.
3. **Prediction & CDSS Logic**: Zero modifications made to `ml/inference.py` prediction algorithms or `ml/cdss.py` recommendation rules.
4. **Existing Frontend Modules**: Zero modifications made to Doctor, Hospital Administrator, or Healthcare Researcher views.
