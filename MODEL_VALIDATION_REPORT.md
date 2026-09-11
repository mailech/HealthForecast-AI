# HealthForecast AI — Model Validation Report

## Executive Summary
This document presents the formal performance validation, data-leakage audit, and model candidate selection report for **HealthForecast AI**. All evaluation methodology strictly enforces patient-level isolation between training and testing splits to mirror prospective clinical deployment.

---

## 1. Dataset & Target Definition

### Dataset Specifications
- **Source**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)
- **Total Raw Encounters**: 101,766
- **Filter Criteria**: Encounters resulting in patient death or discharge to hospice (`discharge_disposition_id` in `[11, 13, 14, 19, 20, 21]`) are filtered out to remove non-eligible readmission risks.
- **Total Eligible Encounters**: 99,343
- **Total Features**: 50 raw attributes

### Target Definition
- **Primary Binary Target**: Early Readmission within 30 days (`readmitted == '<30'`).
  - **Class 1 (Positive)**: Readmitted `<30` days.
  - **Class 0 (Negative)**: Readmitted `>30` days or `NO` readmission recorded.
- **Target Distribution**:
  - **Eligible Cohort Prevalence**: 11,314 positive encounters (~11.39%) / 88,029 negative encounters (`>30` & `NO`: ~88.61%).

---

## 2. Train / Test Methodology & Patient-Group Isolation

To prevent data leakage caused by multiple hospital visits from the same patient across the 10-year observation period (1999–2008):
- **Grouping Key**: `patient_nbr`
- **Split Technique**: `GroupShuffleSplit` (n_splits=1, test_size=0.20, random_state=42)
- **Train Encounters**: 79,541 (80.07%)
- **Test Encounters**: 19,802 (19.93%)
- **Patient Isolation Audit**: 0 patient overlap detected between train and test sets (`len(set(train_pts) & set(test_pts)) == 0`).

---

## 3. Data Leakage Prevention Audit

| Potential Leakage Vector | Status | Mitigation Rationale |
| :--- | :---: | :--- |
| `discharge_disposition_id` | **EXCLUDED** | Recorded at/after discharge execution. Excluded to ensure 100% pre-discharge decision support. |
| `readmitted` | **EXCLUDED** | Target variable transformed into binary label (`<30` = 1, else = 0). Excluded from feature matrix. |
| `encounter_id` | **EXCLUDED** | Row primary key identifier. Non-predictive. |
| `patient_nbr` | **EXCLUDED** | Patient ID used strictly as group splitting column; excluded from feature matrix. |
| Preprocessing Fit | **ISOLATED** | `StandardScaler` and `OneHotEncoder` fitted strictly on `train_df`. `test_df` transformed only. |

---

## 4. Model Evaluation Metrics

Both models were evaluated on the completely untouched 19,802 test encounters.

### Performance Summary Table

| Metric | XGBoost (Production Candidate) | Random Forest Baseline | Winning Model | Rationale / Clinical Priority |
| :--- | :---: | :---: | :---: | :--- |
| **Accuracy** | 65.08% | **69.35%** | Random Forest | Overall correct predictions across both classes. |
| **Recall / Sensitivity (<30d)** | **54.96%** | 47.65% | **XGBoost** | **Primary Clinical Metric**: Maximizes detection of high-risk early readmissions. |
| **Precision (<30d)** | 17.07% | **17.70%** | Random Forest | Proportion of flagged high-risk patients who actually get readmitted. |
| **F1-Score (<30d)** | **26.05%** | 25.81% | **XGBoost** | Harmonic mean of Precision and Recall. |
| **ROC-AUC** | **64.71%** | 64.49% | **XGBoost** | Overall discriminative capability across all thresholds. |
| **PR-AUC** | **20.67%** | 19.20% | **XGBoost** | Performance under severe class imbalance (baseline = 11.19%). |
| **Specificity** | 66.36% | **72.08%** | Random Forest | True negative rate (correctly identifying low-risk cases). |
| **False Positive Rate** | 33.64% | **27.92%** | Random Forest | Rate of false alarms among non-readmitted cases. |

---

## 5. Detailed Confusion Matrices

### XGBoost Model (Selected Candidate)
- **True Negatives (TN)**: 11,670
- **False Positives (FP)**: 5,916
- **False Negatives (FN)**: 998
- **True Positives (TP)**: 1,218
- **Total Test Samples**: 19,802

### Random Forest Model
- **True Negatives (TN)**: 12,676
- **False Positives (FP)**: 4,910
- **False Negatives (FN)**: 1,160
- **True Positives (TP)**: 1,056
- **Total Test Samples**: 19,802

---

## 6. Selected Production Candidate & Decision Rationale

**Selected Candidate**: **XGBoost Classifier** (`xgboost_model.joblib`)

### Selection Rationale
In clinical risk prediction for 30-day hospital readmissions, **Recall (Sensitivity)** is the primary operational priority. A false negative (failing to identify an early readmission risk patient) carries significantly higher clinical risk than a false positive (which simply prompts extra clinical review or discharge planning).

XGBoost achieved:
1. **7.31 percentage point higher Recall** (54.96% vs 47.65%), successfully identifying **162 additional high-risk encounters** compared to Random Forest.
2. Higher **F1-Score** (26.05% vs 25.81%).
3. Higher **ROC-AUC** (0.6471 vs 0.6449).
4. Higher **PR-AUC** (0.2067 vs 0.1920), nearly doubling random chance baseline performance (11.19%).

---

## 7. Operational Limitations & Scope

1. **Class Imbalance Impact**: Due to the ~11.19% baseline prevalence of 30-day readmissions, precision across both models remains in the ~17-18% range at default decision thresholds.
2. **Observational Baseline**: Models are trained on historical encounter data (1999–2008) from 130 US hospitals.
3. **CDSS Scope**: Predictions serve as decision-support risk estimates to aid clinicians, not automated medical diagnoses.
