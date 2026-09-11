# HealthForecast AI: Milestone 2 Step 2 — ML Preprocessing & Feature Engineering Report

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Phase**: Milestone 2 — Step 2: Preprocessing Pipeline & Feature Engineering  
**Date**: September 2026  

---

## 1. Preprocessing Summary & Execution Guarantee

The preprocessing pipeline for *HealthForecast AI* has been fully implemented in [`backend/ml/preprocessing.py`](file:///c:/Users/Soujanya%20Jilla/OneDrive/projects/AI-HealthForecast/backend/ml/preprocessing.py) and verified via automated pytest unit tests in [`backend/tests/test_preprocessing.py`](file:///c:/Users/Soujanya%20Jilla/OneDrive/projects/AI-HealthForecast/backend/tests/test_preprocessing.py).

### Compliance Checklist:
- **Raw CSV Protection**: Original `dataset/diabetic_data.csv` is 100% unchanged.
- **Approved Binary Target**: `<30` = 1 (High-Risk Early Readmission), `NO` & `>30` = 0.
- **Prediction Point Alignment**: Only uses clinical parameters available **prior to patient discharge**.
- **No Machine Learning Models Trained Yet**: Pipeline is ready for reuse by Random Forest and XGBoost in Step 3.

---

## 2. Train / Test Split Strategy & Patient Leakage Prevention

* **Split Algorithm**: `GroupShuffleSplit` on `patient_nbr` (80% Train, 20% Test, `random_state=42`).
* **Patient Data Leakage Prevention**:
  - Out of 71,518 unique patients, 16,773 patients have multiple hospital encounters in the dataset.
  - Using `GroupShuffleSplit(groups=patient_nbr)` guarantees that **all hospital encounters belonging to any given patient are assigned strictly to EITHER the training set OR the test set**.
* **Empirical Verification Test Result**:
  - `test_no_patient_overlap`: **0 patient overlap** (`len(set(train_patients) & set(test_patients)) == 0`).
  - Total Training Encounters: **79,328** (63,944 Unique Patients)
  - Total Test Encounters: **20,015** (16,070 Unique Patients)

---

## 3. Included Predictive Feature List

The preprocessor outputs a clean, numeric feature matrix ($X$) consisting of **187 total features** across 4 categories:

### 3.1 Numerical Features (8 Attributes — StandardScaled)
1. `time_in_hospital` (Days in hospital)
2. `num_lab_procedures` (Number of lab tests performed)
3. `num_procedures` (Number of non-lab clinical procedures)
4. `num_medications` (Number of distinct medications administered)
5. `number_outpatient` (Number of outpatient visits in prior year)
6. `number_emergency` (Number of emergency room visits in prior year)
7. `number_inpatient` (Number of inpatient admissions in prior year)
8. `number_diagnoses` (Number of recorded diagnosis codes)

### 3.2 Ordinal & Binary Features (19 Attributes)
1. `age_ordinal` (`[0-10)`=0, `[10-20)`=1, ..., `[90-100)`=9)
2. `change_binary` (`Ch`=1, `No`=0)
3. `diabetesMed_binary` (`Yes`=1, `No`=0)
4. **16 Active Diabetes Medication Regimens** (`No`=0, `Down`=1, `Steady`=2, `Up`=3):
   - `med_metformin`, `med_repaglinide`, `med_nateglinide`, `med_chlorpropamide`, `med_glimepiride`, `med_glipizide`, `med_glyburide`, `med_tolbutamide`, `med_pioglitazone`, `med_rosiglitazone`, `med_acarbose`, `med_miglitol`, `med_tolazamide`, `med_insulin`, `med_glyburide-metformin`, `med_glipizide-metformin`.

### 3.3 One-Hot Encoded Categorical Features (160 Expanded Features)
- `race` (Caucasian, AfricanAmerican, Hispanic, Asian, Other, Unknown_Race)
- `gender` (Female, Male, Unknown/Invalid)
- `admission_type_id` (Emergency, Urgent, Elective, Newborn, Trauma Center, Not Available, Null, Audit)
- `admission_source_id` (Physician Referral, Emergency Room, Transfer, etc.)
- `discharge_disposition_id` (Discharged to home, SNF, ICF, Rehab, etc.)
- `payer_code` (MC, MD, HM, UN, Self-Pay, Unknown_Payer)
- `medical_specialty` (InternalMedicine, Cardiology, Surgery, Pediatrics, Unknown_Specialty)
- `max_glu_serum` (`None`, `Norm`, `>200`, `>300`)
- `A1Cresult` (`None`, `Norm`, `>7`, `>8`)
- **ICD-9 Clinical Organ System Groups**:
  - `diag_1_group`, `diag_2_group`, `diag_3_group` mapped into 9 categories:
    1. *Diabetes* (`250.xx`)
    2. *Circulatory* (`390-459`, `785`)
    3. *Respiratory* (`460-519`, `786`)
    4. *Digestive* (`520-579`, `787`)
    5. *Genitourinary* (`580-629`, `788`)
    6. *Neoplasms* (`140-239`)
    7. *Injury* (`800-999`)
    8. *Musculoskeletal* (`710-739`)
    9. *Other*

---

## 4. Excluded Feature Matrix & Rationale

| Feature Name | Reason for Exclusion | Impact & Safeguard |
| :--- | :--- | :--- |
| `encounter_id` | **Identifier (Row PK)** | Excluded from model inputs to prevent ID memorization |
| `patient_nbr` | **Identifier (Patient ID)** | Excluded from model inputs; used exclusively for `GroupShuffleSplit` |
| `readmitted` | **Target Column** | Excluded from input matrix; converted to binary target (`<30` = 1, else = 0) |
| `weight` | **High Missingness (96.86%)** | Excluded due to >96% missing values (`?`) |
| `discharge_disposition_id` (`11,13,14,19,20,21`) | **Post-Outcome Leakage** | 2,423 expired/hospice patient encounters filtered out prior to training |
| `examide` | **Zero-Variance** | 100% `'No'` values across all 101,766 records |
| `citoglipton` | **Zero-Variance** | 100% `'No'` values across all 101,766 records |
| `glimepiride-pioglitazone` | **Near-Zero Variance** | Only 1 non-No value |
| `metformin-rosiglitazone` | **Near-Zero Variance** | Only 2 non-No values |
| `metformin-pioglitazone` | **Near-Zero Variance** | Only 1 non-No value |
| `acetohexamide` | **Near-Zero Variance** | Only 1 non-No value |
| `troglitazone` | **Near-Zero Variance** | Only 3 non-No values |

---

## 5. Automated Unit Test Verification Results

All 6 preprocessing unit tests in `backend/tests/test_preprocessing.py` executed successfully alongside the backend test suite:

```text
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Soujanya Jilla\OneDrive\projects\AI-HealthForecast\backend
collected 12 items

tests\test_milestone1.py ......                                          [ 50%]
tests\test_preprocessing.py ......                                       [100%]

============================= 12 passed in 48.62s =============================
```

### Verification Criteria Passed:
1. `test_no_patient_overlap`: Verified 0 patient overlap between train and test sets (`set(train_patients) & set(test_patients) == set()`).
2. `test_target_not_in_features`: Confirmed `readmitted` and `target` columns are absent from input feature list.
3. `test_excluded_features_not_used`: Confirmed `encounter_id`, `patient_nbr`, `weight`, and 7 zero-variance medications are absent.
4. `test_valid_numerical_model_input`: Confirmed preprocessed $X_{train}$ and $X_{test}$ contain 0 NaNs, 0 Infs, and match expected numeric dimensions.
5. `test_strict_train_test_isolation`: Confirmed preprocessor parameters (scaler means & scales) are unmodified during test set transformation.
6. `test_binary_target_distribution`: Confirmed target values consist exclusively of `{0, 1}`.

---

> [!IMPORTANT]
> **Status**: Milestone 2 Step 2 (Preprocessing Pipeline & Feature Engineering) is complete and verified. No Machine Learning models have been trained yet. Ready for user review and approval before proceeding to Step 3 (Random Forest & XGBoost Training).
