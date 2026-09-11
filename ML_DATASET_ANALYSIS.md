# HealthForecast AI: Milestone 2 ML Dataset Audit & Feature Analysis Report

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Phase**: Milestone 2 — Step 1: Pre-Training Dataset Audit & Feature Selection Report  
**Date**: September 2026  

---

## 1. Executive Summary & Audit Mandate

This report provides a comprehensive, empirical audit of the **Diabetes 130-US Hospitals dataset** (`dataset/diabetic_data.csv`) comprising 101,766 clinical encounters across 130 US hospitals.

As mandated by the Milestone 2 requirements:
- **No models have been trained yet.**
- **The original CSV file has not been modified or replaced.**
- **No synthetic data has been generated.**
- **All 50 columns have been audited for data types, unique value counts, missing values (`?`), data leakage, and prediction-time availability.**

---

## 2. Complete 50-Column Audit Matrix

The dataset contains **101,766 rows** and **50 columns**. Below is the complete empirical analysis of all 50 columns:

| # | Column Name | Data Type | Unique Values | Missing (`?` / NaN) | Missing % | Sample Values | Categorization |
| :-: | :--- | :---: | :-: | :-: | :-: | :--- | :--- |
| 1 | `encounter_id` | `int64` | 101,766 | 0 | 0.00% | 2278392, 149190, 64410 | **Identifier (Row ID)** |
| 2 | `patient_nbr` | `int64` | 71,518 | 0 | 0.00% | 8222157, 55629189, 86047875 | **Identifier (Patient ID)** |
| 3 | `race` | `object` | 6 | 2,273 | 2.23% | Caucasian, AfricanAmerican, ? | Categorical Predictor |
| 4 | `gender` | `object` | 3 | 0 (3 Unknown) | 0.00% | Female, Male, Unknown/Invalid | Categorical Predictor |
| 5 | `age` | `object` | 10 | 0 | 0.00% | [0-10), [10-20), [20-30) | Categorical/Ordinal Predictor |
| 6 | `weight` | `object` | 10 | 98,569 | **96.86%** | ?, [75-100), [50-75) | **High Missingness (Exclude)** |
| 7 | `admission_type_id` | `int64` | 8 | 0 | 0.00% | 6, 1, 2 | Categorical Predictor |
| 8 | `discharge_disposition_id` | `int64` | 26 | 0 | 0.00% | 25, 1, 3 | Categorical Predictor (Filter Expired) |
| 9 | `admission_source_id` | `int64` | 17 | 0 | 0.00% | 1, 7, 2 | Categorical Predictor |
| 10 | `time_in_hospital` | `int64` | 14 | 0 | 0.00% | 1, 3, 2 | Numerical Predictor |
| 11 | `payer_code` | `object` | 18 | 40,256 | **39.56%** | ?, MC, MD | Categorical Predictor (Impute Unknown) |
| 12 | `medical_specialty` | `object` | 73 | 49,949 | **49.08%** | Pediatrics-Endocrinology, ? | Categorical Predictor (Impute Unknown) |
| 13 | `num_lab_procedures` | `int64` | 118 | 0 | 0.00% | 41, 59, 11 | Numerical Predictor |
| 14 | `num_procedures` | `int64` | 7 | 0 | 0.00% | 0, 5, 1 | Numerical Predictor |
| 15 | `num_medications` | `int64` | 75 | 0 | 0.00% | 1, 18, 13 | Numerical Predictor |
| 16 | `number_outpatient` | `int64` | 39 | 0 | 0.00% | 0, 2, 1 | Numerical Predictor |
| 17 | `number_emergency` | `int64` | 33 | 0 | 0.00% | 0, 1, 2 | Numerical Predictor |
| 18 | `number_inpatient` | `int64` | 21 | 0 | 0.00% | 0, 1, 2 | Numerical Predictor |
| 19 | `diag_1` | `object` | 717 | 21 | 0.02% | 250.83, 276, 648 | Categorical Predictor (ICD-9 Grouping) |
| 20 | `diag_2` | `object` | 749 | 358 | 0.35% | ?, 250.01, 250 | Categorical Predictor (ICD-9 Grouping) |
| 21 | `diag_3` | `object` | 790 | 1,423 | 1.40% | ?, 255, V27 | Categorical Predictor (ICD-9 Grouping) |
| 22 | `number_diagnoses` | `int64` | 16 | 0 | 0.00% | 1, 9, 6 | Numerical Predictor |
| 23 | `max_glu_serum` | `object` | 3 | 96,420 | 94.75% (None) | >300, Norm, >200 | Categorical Predictor (None=Unmeasured) |
| 24 | `A1Cresult` | `object` | 3 | 84,748 | 83.28% (None) | >7, >8, Norm | Categorical Predictor (None=Unmeasured) |
| 25 | `metformin` | `object` | 4 | 0 | 0.00% | No, Steady, Up | Medication Predictor |
| 26 | `repaglinide` | `object` | 4 | 0 | 0.00% | No, Up, Steady | Medication Predictor |
| 27 | `nateglinide` | `object` | 4 | 0 | 0.00% | No, Steady, Down | Medication Predictor |
| 28 | `chlorpropamide` | `object` | 4 | 0 | 0.00% | No, Steady, Down | Medication Predictor |
| 29 | `glimepiride` | `object` | 4 | 0 | 0.00% | No, Steady, Down | Medication Predictor |
| 30 | `acetohexamide` | `object` | 2 | 0 | 0.00% | No, Steady (1 Steady) | **Zero-Variance (Exclude)** |
| 31 | `glipizide` | `object` | 4 | 0 | 0.00% | No, Steady, Up | Medication Predictor |
| 32 | `glyburide` | `object` | 4 | 0 | 0.00% | No, Steady, Up | Medication Predictor |
| 33 | `tolbutamide` | `object` | 2 | 0 | 0.00% | No, Steady (23 Steady) | Medication Predictor |
| 34 | `pioglitazone` | `object` | 4 | 0 | 0.00% | No, Steady, Up | Medication Predictor |
| 35 | `rosiglitazone` | `object` | 4 | 0 | 0.00% | No, Steady, Up | Medication Predictor |
| 36 | `acarbose` | `object` | 4 | 0 | 0.00% | No, Steady, Up | Medication Predictor |
| 37 | `miglitol` | `object` | 4 | 0 | 0.00% | No, Steady, Down | Medication Predictor |
| 38 | `troglitazone` | `object` | 2 | 0 | 0.00% | No, Steady (3 Steady) | **Zero-Variance (Exclude)** |
| 39 | `tolazamide` | `object` | 3 | 0 | 0.00% | No, Steady, Up | Medication Predictor |
| 40 | `examide` | `object` | 1 | 0 | 0.00% | No (100% No) | **Zero-Variance (Exclude)** |
| 41 | `citoglipton` | `object` | 1 | 0 | 0.00% | No (100% No) | **Zero-Variance (Exclude)** |
| 42 | `insulin` | `object` | 4 | 0 | 0.00% | No, Up, Steady | Medication Predictor |
| 43 | `glyburide-metformin` | `object` | 4 | 0 | 0.00% | No, Steady, Down | Medication Predictor |
| 44 | `glipizide-metformin` | `object` | 2 | 0 | 0.00% | No, Steady (13 Steady) | Medication Predictor |
| 45 | `glimepiride-pioglitazone` | `object` | 2 | 0 | 0.00% | No, Steady (1 Steady) | **Zero-Variance (Exclude)** |
| 46 | `metformin-rosiglitazone` | `object` | 2 | 0 | 0.00% | No, Steady (2 Steady) | **Zero-Variance (Exclude)** |
| 47 | `metformin-pioglitazone` | `object` | 2 | 0 | 0.00% | No, Steady (1 Steady) | **Zero-Variance (Exclude)** |
| 48 | `change` | `object` | 2 | 0 | 0.00% | No, Ch | Categorical Predictor |
| 49 | `diabetesMed` | `object` | 2 | 0 | 0.00% | No, Yes | Categorical Predictor |
| 50 | `readmitted` | `object` | 3 | 0 | 0.00% | NO, >30, <30 | **TARGET VARIABLE** |

---

## 3. Duplicate Rows & Patient Encounter Pattern Analysis

* **Exact Duplicate Rows**: **0** (All 101,766 rows are distinct encounter records).
* **Unique Encounters**: **101,766**
* **Unique Patients**: **71,518**
* **Multiple Admission Pattern**:
  - **16,773 patients (23.45%)** have 2 or more recorded hospital stays.
  - Maximum admissions for a single patient in the dataset: **40 hospital encounters**.

> [!CAUTION]
> **CRITICAL DATA LEAKAGE RISK — PATIENT CLUSTERING**:
> Performing a naive random row-wise train/test split will cause encounters of the **same patient** to be split across both training and test sets. The model will memorize patient-specific patterns rather than general clinical predictors.
> **Mandatory Rule**: Model validation and train/test splits MUST use **Patient-Grouped Stratified Splitting** (`GroupShuffleSplit` or `GroupKFold` on `patient_nbr`).

---

## 4. Target Variable Analysis (`readmitted`)

The target variable `readmitted` records post-discharge readmission outcomes:

```text
NO      : 54,864 encounters (53.91%)  — No readmission recorded
>30     : 35,545 encounters (34.93%)  — Readmitted after 30 days of discharge
<30     : 11,357 encounters (11.16%)  — Readmitted within 30 days of discharge
```

---

## 5. Suitability Comparison of Target Formulations

### 5.1 Three-Class Classification (`<30` vs `>30` vs `NO`)
* **Classes**:
  - Class 0: `NO` (53.91%)
  - Class 1: `>30` (34.93%)
  - Class 2: `<30` (11.16%)
* **Pros**: Preserves raw dataset labels and distinguishes late readmissions (>30 days) from non-readmitted patients.
* **Cons**:
  1. Severe class imbalance for early readmissions (`<30` is only 11.16%).
  2. Late readmissions (>30 days) are less clinically actionable and outside hospital HRRP financial penalty windows.
  3. Complicates clinical decision-support rules by diluting early high-risk warnings.

### 5.2 Binary Early Readmission Classification (`<30` = 1, `>30` & `NO` = 0) — **[RECOMMENDED]**
* **Classes**:
  - **Class 1 (High Risk — Early Readmission `<30`d)**: 11,357 encounters (**11.16%**)
  - **Class 0 (Low/Moderate Risk — No Early Readmission)**: 90,409 encounters (**88.84%**)
* **Why Binary Formulation is Recommended for HealthForecast AI**:
  1. **Direct Alignment with Project Objective**: The core goal of *HealthForecast AI* is early hospital readmission prediction to support proactive care planning and prevent 30-day readmissions.
  2. **US Healthcare Regulatory Alignment**: US Hospitals face severe financial penalties under Medicare's **Hospital Readmissions Reduction Program (HRRP)** specifically for readmissions within **30 days** of discharge.
  3. **Actionable Clinical Decision Support**: Clinical teams require clear binary risk alerts (High Risk vs Low Risk) at discharge to trigger targeted interventions (e.g. 48-hour post-discharge home visits, insulin reconciliation).
  4. **Model Optimization**: Allows optimizing Precision-Recall AUC, ROC-AUC, and Sensitivity (Recall) for Class 1 using class weighting (`scale_pos_weight` in XGBoost, `class_weight='balanced'` in Random Forest).

---

## 6. Identification of Data Leakage & Feature Exclusions

### 6.1 Expired & Hospice Patient Filtering (`discharge_disposition_id`)
* **Finding**: **2,423 encounters (2.38%)** have `discharge_disposition_id` values of `11`, `13`, `14`, `19`, `20`, or `21` (Expired in hospital, discharged to hospice, or expired at home).
* **Clinical Fact**: Expired patients physically **cannot** be readmitted within 30 days. Keeping them introduces false `'NO'` readmission labels for deceased patients and distorts probability calibration.
* **Mandatory Rule**: **Exclude all expired/hospice records** prior to model training, leaving **99,343 eligible encounters**.

### 6.2 Zero-Variance Feature Exclusions
The following 7 medication columns have zero or near-zero variance across all 101,766 encounters and provide zero predictive signal:
- `examide` (100% `'No'`)
- `citoglipton` (100% `'No'`)
- `glimepiride-pioglitazone` (1 non-No)
- `metformin-rosiglitazone` (2 non-No)
- `metformin-pioglitazone` (1 non-No)
- `acetohexamide` (1 non-No)
- `troglitazone` (3 non-No)

### 6.3 High-Missingness Feature Exclusion
- `weight`: Missing in **96.86%** of records (`?`). **Excluded** to prevent introducing noise.

---

## 7. Final Safe Feature Separation Matrix

| Category | Columns | Reason / Handling |
| :--- | :--- | :--- |
| **Identifiers (Exclude from Training)** | `encounter_id`, `patient_nbr` | Used strictly for Patient-Grouped train/test splitting |
| **Target Column (Exclude from Predictors)** | `readmitted` | Transformed to Binary (`<30` = 1, else = 0) |
| **Leakage / Zero-Variance (Exclude)** | `weight`, `examide`, `citoglipton`, `glimepiride-pioglitazone`, `metformin-rosiglitazone`, `metformin-pioglitazone`, `acetohexamide`, `troglitazone` | High missingness (>95%) or 0 variance |
| **Safe Demographic & Admission Predictors** | `race`, `gender`, `age`, `admission_type_id`, `admission_source_id`, `discharge_disposition_id` | Realistically available at discharge |
| **Safe Clinical Utilization Predictors** | `time_in_hospital`, `num_lab_procedures`, `num_procedures`, `num_medications`, `number_outpatient`, `number_emergency`, `number_inpatient`, `number_diagnoses` | Recorded during hospital stay prior to discharge |
| **Safe Diagnosis Predictors** | `diag_1`, `diag_2`, `diag_3` | Mapped into 9 major ICD-9 clinical organ systems |
| **Safe Glycemic Control Predictors** | `max_glu_serum`, `A1Cresult` | Lab results recorded during stay (`None` = unmeasured) |
| **Safe Medication Regimen Predictors** | 16 active drugs (`metformin`, `insulin`, `glipizide`, `glyburide`, `pioglitazone`, `rosiglitazone`, etc.), `change`, `diabetesMed` | Active drug dosage changes during admission |

---

## 8. Summary of Preprocessing Recommendations for Step 2

1. **Target Formulation**: Binary Early Readmission (`<30` = 1, `>30`/`NO` = 0).
2. **Filter Ineligible Encounters**: Drop 2,423 expired/hospice patient records (`discharge_disposition_id` in `[11, 13, 14, 19, 20, 21]`).
3. **Grouped Split**: `GroupShuffleSplit` by `patient_nbr` (80% Train, 20% Test) to prevent patient leakage.
4. **ICD-9 Grouping**: Map `diag_1`, `diag_2`, `diag_3` into 9 clinical categories (Diabetes, Circulatory, Respiratory, Digestive, Injury, Musculoskeletal, Genitourinary, Neoplasms, Other).
5. **Feature Encoding**:
   - Ordinal Encoding for `age` and medication changes (`No`=0, `Down`=1, `Steady`=2, `Up`=3).
   - One-Hot Encoding for nominal attributes (`race`, `gender`, `admission_type_id`, `admission_source_id`, `discharge_disposition_id`, `diag_groups`).
   - Impute missing categories for `payer_code` (`'Unknown_Payer'`) and `medical_specialty` (`'Unknown_Specialty'`).
6. **Feature Scaling**: `StandardScaler` fitted strictly on the training fold.

---

> [!IMPORTANT]
> **Audit Status**: Completed. No ML models have been trained yet. Waiting for user approval of this report before proceeding to Step 2 (Feature Engineering & Pipeline Setup) and Step 3 (Random Forest & XGBoost Model Training).
