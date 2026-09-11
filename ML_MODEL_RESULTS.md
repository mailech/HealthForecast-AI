# HealthForecast AI: Milestone 2 Step 3 — Machine Learning Model Results & Final Temporal Audit Report

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Phase**: Milestone 2 — Step 3: Model Training, Temporal Audit & Final Retraining Evaluation (Random Forest vs XGBoost)  
**Date**: September 2026  

---

## 1. Final Temporal Audit & Prediction-Time Definition

### 1.1 Defined Prediction Point
The prediction point for *HealthForecast AI* is strictly defined as **AFTER the patient's hospitalization data has been recorded during the inpatient stay, and BEFORE discharge planning/execution is finalized**.

### 1.2 Feature Classification & Temporal Audit Findings

| Feature Category | Features Included | Temporal Availability Classification | Rationale & Action Taken |
| :--- | :--- | :--- | :--- |
| **Demographics** | `race`, `gender`, `age` (ordinal) | **Available Before Discharge** | Static baseline patient attributes known at admission. **[KEPT]** |
| **Prior History** | `number_outpatient`, `number_emergency`, `number_inpatient` | **Available Before Discharge** | Historical record of prior 12-month hospital utilization. **[KEPT]** |
| **Admission Context** | `admission_type_id`, `admission_source_id`, `payer_code`, `medical_specialty` | **Available Before Discharge** | Recorded at admission / early stay. **[KEPT]** |
| **Inpatient Stay** | `time_in_hospital`, `num_lab_procedures`, `num_procedures`, `num_medications`, `number_diagnoses`, `diag_1/2/3_group` | **Available Before Discharge** | Clinical activities and diagnoses established during the hospital stay prior to discharge. **[KEPT]** |
| **Medication Changes** | `change`, `diabetesMed`, 16 active medication dosage columns | **Available Before Discharge** | Formulatory medication adjustments ordered during hospitalization. **[KEPT]** |
| **Discharge Destination** | `discharge_disposition_id` | **Potentially Available Only At/After Discharge / Leakage** | **REMOVED**. In clinical practice, the final discharge disposition (e.g. SNF, Rehab, Home Health, Short-term hospital) is finalized at or after discharge execution. Including it creates post-planning temporal data leakage. |
| **Expired Status** | `discharge_disposition_id` in `(11, 13, 14, 19, 20, 21)` | **Post-Outcome / Patient Expiry** | **FILTERED**. Patients who expired in hospital or entered hospice cannot be readmitted. 2,423 expired encounters filtered out prior to training. |

### 1.3 Strict Preprocessing Safeguards & Retraining Setup
- **Target Column**: `readmitted` transformed into Binary Target (`<30` = 1, `NO` & `>30` = 0). Excluded from feature matrix.
- **Identifiers Excluded**: `encounter_id` and `patient_nbr` excluded from model inputs.
- **Patient Group Isolation**: `GroupShuffleSplit` on `patient_nbr` (**0 patient overlap** between 79,541 train encounters and 19,802 test encounters).
- **Preprocessing Safeguard**: `HealthForecastPreprocessor` fitted **strictly on training data** to eliminate data leakage.

---

## 2. Retrained Model Performance Comparison (Test Set: 19,802 Encounters, 187 Safe Pre-Discharge Features)

Both **Random Forest** and **XGBoost** were retrained on 187 purely pre-discharge features with class imbalance compensation (`class_weight='balanced'` for Random Forest, `scale_pos_weight=7.74` for XGBoost).

| Evaluation Metric | Random Forest Classifier | XGBoost Classifier | Winning Model & Clinical Advantage |
| :--- | :---: | :---: | :--- |
| **Accuracy** | **0.6935 (69.35%)** | 0.6508 (65.08%) | **Random Forest** (+4.27% higher overall accuracy) |
| **Recall / Sensitivity (`<30`d)** | 0.4765 (47.65%) | **0.5496 (54.96%)** | **XGBoost** (+7.31% higher early readmission detection) |
| **Precision (Class 1)** | **0.1770 (17.70%)** | 0.1707 (17.07%) | **Random Forest** (+0.63% higher precision) |
| **F1-Score (Class 1)** | 0.2581 | **0.2605** | **XGBoost** (+0.0024 higher F1) |
| **ROC-AUC** | 0.6449 | **0.6471** | **XGBoost** (+0.0022 higher discrimination) |
| **PR-AUC (Precision-Recall)** | 0.1920 | **0.2067** | **XGBoost** (+0.0147 higher over 0.1119 baseline) |
| **Specificity (True Negative Rate)** | **0.7208 (72.08%)** | 0.6636 (66.36%) | **Random Forest** (+5.72% higher specificity) |
| **False Positive Rate (FPR)** | **0.2792 (27.92%)** | 0.3364 (33.64%) | **Random Forest** (Lower false positive rate) |
| **True Positives (Caught `<30`d)** | 1,056 patients | **1,218 patients** | **XGBoost** (**+162 additional high-risk patients caught!**) |
| **False Negatives (Missed `<30`d)** | 1,160 patients | **998 patients** | **XGBoost** (**162 fewer missed readmissions!**) |

---

## 3. Confusion Matrix Breakdown (Retrained Models)

### 3.1 Random Forest Confusion Matrix:
```text
                  Predicted No Readmit (<30d)    Predicted Readmit (<30d)
Actual No Readmit           12,676 (TN)                    4,910 (FP)
Actual Readmit (<30d)        1,160 (FN)                    1,056 (TP)
```

### 3.2 XGBoost Confusion Matrix:
```text
                  Predicted No Readmit (<30d)    Predicted Readmit (<30d)
Actual No Readmit           11,670 (TN)                    5,916 (FP)
Actual Readmit (<30d)          998 (FN)                    1,218 (TP)
```

---

## 4. Top 15 Feature Importances (Retrained XGBoost Model)

Following the removal of `discharge_disposition_id`, the top predictive features are pure pre-discharge clinical indicators:

1. `number_inpatient` (Prior Inpatient Admissions in past 12 months): **6.32%**
2. `number_diagnoses` (Total recorded diagnosis count during stay): **1.20%**
3. `number_emergency` (Prior Emergency Room visits in past 12 months): **1.15%**
4. `age_ordinal` (Patient age bracket): **1.14%**
5. `max_glu_serum_>200` (Glucose serum level > 200 mg/dL): **1.13%**
6. `diabetesMed_binary` (Prescribed diabetes medication during stay): **1.09%**
7. `payer_code_MC` (Medicare primary payer): **1.09%**
8. `diag_1_group_Respiratory` (Primary diagnosis in Respiratory system): **1.07%**
9. `time_in_hospital` (Inpatient stay duration in days): **0.98%**
10. `medical_specialty_Cardiology` (Admitting/consulting specialty Cardiology): **0.96%**
11. `medical_specialty_ObstetricsandGynecology`: **0.96%**
12. `medical_specialty_Surgery-Cardiovascular/Thoracic`: **0.94%**
13. `diag_1_group_Circulatory` (Primary diagnosis in Circulatory system): **0.94%**
14. `medical_specialty_Oncology`: **0.93%**
15. `max_glu_serum_nan` (No serum glucose test performed): **0.91%**

---

## 5. Clinical Healthcare Analysis & Recommended Production Model

### Recommended Production Model: **XGBoost Classifier**
Even after removing `discharge_disposition_id` to enforce 100% pre-discharge inference safety, **XGBoost is the recommended production model for HealthForecast AI** because:

1. **Superior High-Risk Patient Recall**: XGBoost achieves **54.96% Recall** (vs 47.65% for Random Forest), capturing **1,218 out of 2,216 early readmission cases** (+162 additional high-risk patients caught before discharge).
2. **Lower Clinical Miss Rate**: XGBoost reduces missed readmissions (False Negatives) from 1,160 to **998 patients** (a 14.0% reduction in high-cost clinical oversights).
3. **Higher PR-AUC**: XGBoost achieves **0.2067 PR-AUC** (vs 0.1920 for Random Forest), significantly outperforming the 11.19% baseline prevalence.
4. **Higher Discrimination (ROC-AUC)**: XGBoost achieves **0.6471 ROC-AUC** (vs 0.6449 for Random Forest).

---

## 6. Automated Test Suite Verification

All **15 backend unit tests** passed cleanly:
- `test_milestone1.py`: 6/6 passed (JWT Auth, RBAC, Patient/Encounter REST APIs)
- `test_preprocessing.py`: 6/6 passed (Patient Group isolation, 0 patient overlap, temporal exclusions)
- `test_models.py`: 3/3 passed (Model loading, prediction shapes, probability bounds)

---
