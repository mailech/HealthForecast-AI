# Milestone 4, Step 1: Prediction Accuracy & Healthcare Analytics Validation Report

**Project**: HealthForecast AI  
**Milestone**: Milestone 4 — Step 1 (Validation Only)  
**Status**: COMPLETED & VERIFIED  

---

## 1. PDF Requirement Addressed
This report fulfills **Milestone 4, Step 1** of the HealthForecast AI project specification PDF:
- Validate prediction accuracy of machine learning models (XGBoost, Random Forest).
- Validate healthcare analytics quality, internal mathematical consistency, and descriptive safeguards.
- Verify zero data leakage (temporal & patient-level isolation).
- Verify dataset and ML artifact integrity.
- Run complete backend test suite and frontend production build.

---

## 2. Model Validation Methodology
- **Validation Pipeline**: Raw dataset load -> Expired patient filtering -> `GroupShuffleSplit` on `patient_nbr` -> Feature extraction & preprocessing (fitted strictly on training split) -> Test set evaluation.
- **Evaluation Set**: Completely untouched 19,802 test encounters (~20% test split).
- **Isolation Principle**: Train and test sets share 0 patients (`GroupShuffleSplit`). Preprocessing transformers (scaling & encoding) fit only on train split.

---

## 3. Dataset Details
- **File**: `dataset/diabetic_data.csv`
- **Total Encounters**: 101,766 raw records
- **Total Features**: 50 columns
- **Expired / Hospice Filter**: 2,423 encounters removed (`discharge_disposition_id` in `[11, 13, 14, 19, 20, 21]`)
- **Total Eligible Encounters**: 99,343 non-expired encounters

---

## 4. Target Definition
- **Target Feature**: `readmitted`
- **Binary Conversion**: `<30` days = `1` (Early Readmission), `>30` / `NO` = `0` (No Early Readmission)
- **Positive Prevalence**: 11,314 / 99,343 eligible encounters (~11.39%)

---

## 5. Train / Test Methodology
- **Splitting Method**: `sklearn.model_selection.GroupShuffleSplit`
- **Group Column**: `patient_nbr`
- **Split Ratio**: 80% Train / 20% Test (random_state=42)
- **Train Encounters**: 79,541
- **Test Encounters**: 19,802
- **Patient Isolation Result**: 0 patient overlap between train and test sets.

---

## 6. Data Leakage Prevention
- **Temporal Leakage Audit (`discharge_disposition_id`)**: Explicitly removed from feature matrix because final disposition is recorded at/after discharge execution.
- **Target Leakage Audit (`readmitted`)**: Excluded from feature matrix; used solely to define target `y`.
- **Row & Group Identifiers (`encounter_id`, `patient_nbr`)**: Excluded from prediction features.
- **Post-Discharge Data**: Excluded from prediction features.
- **Preprocessing Isolation**: `StandardScaler` and `OneHotEncoder` fitted exclusively on training set.

---

## 7. Model Metrics Summary

| Metric | XGBoost | Random Forest |
| :--- | :---: | :---: |
| **Accuracy** | 65.08% | 69.35% |
| **Precision** | 17.07% | 17.70% |
| **Recall / Sensitivity** | **54.96%** | 47.65% |
| **F1-Score** | **26.05%** | 25.81% |
| **ROC-AUC** | **64.71%** | 64.49% |
| **PR-AUC** | **20.67%** | 19.20% |
| **Specificity** | 66.36% | 72.08% |
| **False Positive Rate** | 33.64% | 27.92% |
| **Confusion Matrix (TN, FP, FN, TP)** | (11670, 5916, 998, 1218) | (12676, 4910, 1160, 1056) |

---

## 8. Model Comparison & Candidate Selection
- **Selected Production Candidate**: **XGBoost Classifier** (`xgboost_model.joblib`)
- **Justification**: XGBoost yields significantly higher Recall / Sensitivity (54.96% vs 47.65%), detecting **162 more high-risk early readmission cases** than Random Forest. It also achieves higher F1-score (26.05% vs 25.81%), ROC-AUC (64.71% vs 64.49%), and PR-AUC (20.67% vs 19.20%).

---

## 9. Healthcare Analytics Validation
- All analytics queries execute on eligible non-expired encounters (99,343 records).
- Mathematical integrity verified:
  - `early_readmit_count + late_readmit_count + no_readmit_count == eligible_encounters`
  - Percentages sum to 100% (within floating point precision).
  - No negative counts.
  - Percentages bounded in `[0.0, 100.0]`.

---

## 10. Treatment Analytics Validation
- **Medication Outcomes**: Analyzed insulin, metformin, sulfonylureas, TZDs, monotherapy vs combination therapy.
- **Regimen Change Outcomes**: Stratified by `change` ('Ch' vs 'No') and `diabetesMed` ('Yes' vs 'No').
- **Polypharmacy Outcomes**: Stratified by 1-5, 6-11, 12-19, and 20+ medications.
- **Descriptive Safeguards Verified**: `ANALYTICS_DISCLAIMER` attached to responses, ensuring all metrics are described as observational associations without causal claims.

---

## 11. Hospital Performance Validation
- **Total Raw Encounters Analyzed**: 101,766
- **Eligible Encounters Analyzed**: 99,343
- **Aggregate Scope**: Dataset contains records across 130 US hospitals (1999–2008). No hospital names exist in the raw dataset.
- **Hospital Anonymity Safeguards Verified**: `HOSPITAL_ANONYMITY_DISCLAIMER` attached to responses. No hospital rankings, fake names, or A vs B comparisons are created.

---

## 12. Healthcare Trend Validation
- System utilization trends, prior inpatient/emergency visit trends, length-of-stay trends, and admission source/type trends accurately reflect historical dataset distributions.

---

## 13. Dataset Integrity
- **File**: `dataset/diabetic_data.csv`
- **Rows**: 101,766
- **Columns**: 50
- **Immutability Result**: VERIFIED UNCHANGED (File size and structure untouched; 0 synthetic records added).

---

## 14. ML Artifact Integrity
- **Artifacts Verified**:
  - `backend/ml/models/xgboost_model.joblib`
  - `backend/ml/models/random_forest_model.joblib`
  - `backend/ml/models/preprocessor.joblib`
  - `backend/ml/models/model_metadata.json`
- **Result**: VERIFIED INTACT & UNMODIFIED.

---

## 15. API Validation
- **Endpoints Validated**:
  - `POST /api/v1/predictions/predict`
  - `POST /api/v1/predictions/predict/{encounter_id}`
  - `GET /api/v1/predictions/encounter/{encounter_id}`
- **Payload Contract Verification**: All required fields (`risk_probability`, `risk_percentage`, `risk_category`, `prediction`, `predicted_class_label`, `top_risk_factors`, `cdss_recommendations`, `model_name`, `model_version`, `timestamp`, `disclaimer`) are present and schema-valid.

---

## 16. Test Results

### Backend Pytest Suite
- **Command**: `$env:PYTHONPATH="."; .\venv\Scripts\pytest.exe`
- **Passed Tests**: **45 / 45 passed** (39 existing tests + 6 new automated analytics/model validation tests).
- **Pass Rate**: **100%**

### Frontend Production Build
- **Command**: `npm run build`
- **Result**: **SUCCESSFUL BUILD** (0 errors, dist output generated cleanly).

---

## 17. Limitations & Clinical Scope
- Retrospective observational dataset (130 US hospitals, 1999–2008).
- Imbalanced dataset (~11.19% positive prevalence).
- Clinical decision support tool ONLY — not an automated medical diagnostic system.

---

## 18. Final Validation Conclusion
Milestone 4, Step 1 (Prediction Accuracy & Healthcare Analytics Validation) has been **100% completed and validated**. All AI models, data-leakage safeguards, analytics quality rules, dataset integrity checks, API contracts, backend unit tests, and frontend build pipeline are fully verified and operational.
