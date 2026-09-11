# HealthForecast AI: Treatment Effectiveness & Patient Outcome Analytics Documentation

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Phase**: Milestone 3 — Step 1: Backend Treatment Effectiveness & Patient Outcome Analytics  
**Authoritative Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Date**: September 2026  

---

## 1. Methodology & Data Science Safeguards

The Treatment Effectiveness and Patient Outcome Analytics module computes observational outcome statistics across treatment, medication, and polypharmacy cohorts within historical inpatient records.

### 1.1 Mandatory Analytical Safeguards:
1. **Observational Association Only**: Results represent retrospective correlations in historical hospital data. They do **NOT** establish causal effectiveness (i.e. claiming a medication "caused" or "prevented" readmission).
2. **Sample Size Disclosure**: Every cohort displays its explicit sample size (\( n \)) and percentage of the total valid dataset.
3. **Immutability**: `dataset/diabetic_data.csv` and trained machine learning models (`xgboost_model.joblib`) remain 100% read-only and unchanged. Zero synthetic data generated.
4. **Target Exclusion in Predictors**: Readmission status (`readmitted`) is used strictly as the dependent outcome metric, never as an input predictor.
5. **Cohort Filtering**: 2,423 expired/hospice encounters (`discharge_disposition_id` in 11, 13, 14, 19, 20, 21) are filtered out, leaving **99,343 valid clinical encounters**.

---

## 2. Cohort Definitions & Analytics Metrics

### 2.1 Evaluated Treatment Cohorts:
1. **Diabetes Medication Prescribed (`diabetesMed`)**:
   - `diabetesMed = Yes`: Prescribed at least 1 diabetes medication (\( n = 75,350 \), 75.85% of dataset).
   - `diabetesMed = No`: No diabetes medication prescribed (\( n = 23,993 \), 24.15% of dataset).
2. **Medication Regimen Change (`change`)**:
   - `change = Ch`: Dosage adjusted or medication added/removed during hospitalization (\( n = 45,699 \), 46.00%).
   - `change = No`: No medication dosage modification (\( n = 53,644 \), 54.00%).
3. **Major Drug Class Groups**:
   - **Insulin Therapy**: \( n = 52,476 \) (52.82%). Sub-cohorts: `Insulin Up` (\( n = 11,623 \)), `Insulin Down` (\( n = 11,810 \)), `Insulin Steady` (\( n = 29,043 \)).
   - **Metformin Therapy**: \( n = 19,418 \) (19.55%).
   - **Sulfonylurea Therapy** (Glipizide, Glyburide, Glimepiride): \( n = 31,529 \) (31.74%).
   - **Thiazolidinedione (TZD) Therapy** (Pioglitazone, Rosiglitazone): \( n = 12,392 \) (12.47%).
4. **Treatment Complexity**:
   - `Monotherapy`: Exactly 1 active diabetes drug (\( n = 31,540 \), 31.75%).
   - `Combination Therapy`: 2 or more active diabetes drugs (\( n = 22,784 \), 22.94%).
   - `No Diabetes Meds`: 0 active diabetes drugs (\( n = 45,019 \), 45.31%).
5. **Polypharmacy Brackets**:
   - `Low Polypharmacy` (1–5 total medications): \( n = 12,960 \) (13.05%).
   - `Moderate Polypharmacy` (6–11 total medications): \( n = 36,047 \) (36.29%).
   - `High Polypharmacy` (12–19 total medications): \( n = 33,524 \) (33.75%).
   - `Severe Polypharmacy` (20+ total medications): \( n = 16,812 \) (16.92%).

---

## 3. Key Analytical Findings & Outcome Trends

| Treatment Cohort | Sample Size (\( n \)) | `<30`d Readmission Rate (%) | `>30`d Readmission Rate (%) | Relative Risk vs Baseline (11.19%) | Key Observational Finding |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Baseline Dataset Total** | **99,343** | **11.19%** | **35.31%** | **1.00x** | Global 30-day early readmission baseline prevalence. |
| **Insulin Therapy (All Doses)** | 52,476 | **12.63%** | 37.38% | **1.13x** | Insulin users show higher early readmission correlation due to underlying diabetes severity. |
| **Insulin Dosage Increased (`Up`)** | 11,623 | **14.33%** | 38.89% | **1.28x** | Patients requiring upward insulin titration correlate with highest early readmission risk. |
| **Metformin Therapy** | 19,418 | **9.19%** | 33.39% | **0.82x** | Metformin users correlate with lower early readmission rates (-2.00% vs baseline). |
| **Sulfonylurea Therapy** | 31,529 | **10.15%** | 35.80% | **0.91x** | Oral sulfonylurea therapy shows lower early readmission than insulin therapy. |
| **Monotherapy (1 Drug)** | 31,540 | **10.19%** | 35.10% | **0.91x** | Single-drug therapy correlates with lower early readmission than combination therapy. |
| **Combination Therapy (2+ Drugs)**| 22,784 | **12.06%** | 37.49% | **1.08x** | Multi-drug regimens correlate with higher early readmission risk due to disease complexity. |
| **Regimen Changed (`change = Ch`)** | 45,699 | **12.50%** | 37.45% | **1.12x** | Medication dosage adjustments correlate with higher early readmission risk (+2.42% vs unchanged). |
| **Regimen Unchanged (`change = No`)**| 53,644 | **10.08%** | 33.49% | **0.90x** | Stable dosage regimens correlate with lower early readmission rates. |
| **Low Polypharmacy (1–5 Meds)** | 12,960 | **7.57%** | 28.53% | **0.68x** | Lowest early readmission risk cohort (-3.62% vs baseline). |
| **Severe Polypharmacy (20+ Meds)** | 16,812 | **14.28%** | 39.42% | **1.28x** | Highest early readmission risk cohort (+3.09% vs baseline). |

---

## 4. API Endpoints Specification

All endpoints are hosted under `/api/v1/analytics` and protected by JWT Bearer authentication:

### 4.1 `GET /api/v1/analytics/treatment-summary`
Returns global medication usage prevalence, `diabetesMed` count & %, `change` count & %, and top prescribed drugs.

#### Sample Response:
```json
{
  "total_encounters_analyzed": 99343,
  "diabetes_med_prescribed": {
    "count": 75350,
    "percentage": 75.85
  },
  "regimen_changed": {
    "count": 45699,
    "percentage": 46.0
  },
  "top_prescribed_medications": [
    {
      "medication_name": "Insulin",
      "user_count": 52476,
      "prevalence_percentage": 52.82
    },
    {
      "medication_name": "Metformin",
      "user_count": 19418,
      "prevalence_percentage": 19.55
    },
    {
      "medication_name": "Glipizide",
      "user_count": 12411,
      "prevalence_percentage": 12.49
    }
  ],
  "disclaimer": "Observational Association Disclaimer: All analytics represent historical correlations within the Diabetes 130-US Hospitals dataset..."
}
```

### 4.2 `GET /api/v1/analytics/medication-outcomes`
Returns 30-day readmission outcome rates across major drug classes and treatment complexity.

### 4.3 `GET /api/v1/analytics/change-status-outcomes`
Returns readmission outcome rates by medication change status (`Ch` vs `No`) and `diabetesMed`.

### 4.4 `GET /api/v1/analytics/polypharmacy-outcomes`
Returns readmission outcome rates stratified by medication count brackets (1-5, 6-11, 12-19, 20+).

---

## 5. Limitations & Interpretation Guidelines

1. **Retrospective Hospital Data**: Findings reflect hospital admissions in the US from 1999–2008.
2. **Confounding by Indication**: Patients prescribed insulin or multiple medications often have higher baseline disease severity, higher HbA1c levels, or longer disease duration, which drives higher readmission risk independent of drug efficacy.
3. **No Direct Causal Claims**: Avoid asserting that a drug caused or prevented readmission. Always frame findings as observational correlations.
