# HealthForecast AI: Hospital Performance Analytics & Healthcare Trends Documentation

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Phase**: Milestone 3 — Step 3: Hospital Performance Analytics & Healthcare Trends  
**Authoritative Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Date**: September 2026  

---

## 1. Executive Overview & Methodology

The Hospital Performance Analytics & Healthcare Trends module calculates data-driven, system-wide healthcare performance metrics and readmission risk patterns across historical US inpatient encounters.

### 1.1 Methodological Principles & Data Science Safeguards:
1. **Cohort Filtering (Eligible Encounters)**: Out of 101,766 total raw encounters in `dataset/diabetic_data.csv`, 2,423 expired/hospice encounters (`discharge_disposition_id` in `[11, 13, 14, 19, 20, 21]`) are filtered out. Analytics are evaluated strictly on **99,343 eligible encounters**.
2. **Observational & Descriptive Nature**: All metrics represent retrospective correlations across US hospital admissions (1999–2008). They describe population-level trends and MUST NOT be interpreted as establishing direct causal impact.
3. **Dataset Immutability & Model Integrity**: `dataset/diabetic_data.csv`, the preprocessing pipeline, validated XGBoost, and Random Forest models remain 100% read-only and unchanged. Zero synthetic data generated.
4. **Target Exclusion**: Readmission status (`readmitted`) is used strictly as the target outcome metric, never as a predictive input.

---

## 2. Dataset Limitations & Hospital Anonymity

> [!IMPORTANT]
> **Lack of Hospital-Level Identifiers**:
> The Diabetes 130-US Hospitals dataset aggregates clinical encounters across 130 US hospitals over a 10-year period (1999–2008). However, the dataset **does NOT provide individual hospital-name identifiers** or hospital IDs.
>
> **Analytical Mandate**:
> - No hospital names are invented or simulated.
> - Performance metrics are presented strictly at the overall aggregate **healthcare system level**.
> - No claims are made regarding individual hospital rankings, nor is one named hospital implied to perform better or worse than another.

---

## 3. Key Performance Indicators (KPIs)

| Performance Indicator | Value | Description |
| :--- | :---: | :--- |
| **Total Encounters Analyzed** | **101,766** | Total raw inpatient records in dataset. |
| **Eligible Clinical Encounters** | **99,343** | Non-expired inpatient encounters. |
| **30-Day Early Readmission Count** | **11,314** | Encounters resulting in early readmission (`<30` days). |
| **30-Day Early Readmission Rate** | **11.39%** | Primary system-wide performance baseline. |
| **Late Readmission Rate (`>30`d)** | **35.31%** | Readmissions occurring after 30 days (\( n = 35,082 \)). |
| **No Readmission Rate** | **53.30%** | Encounters with no readmission recorded (\( n = 52,947 \)). |
| **Average Length of Stay** | **4.38 days** | Mean duration of inpatient hospitalization. |
| **High-Utilization Patient Proportion** | **43.20%** | Proportion of encounters with prior inpatient or emergency visits (\( n = 42,912 \)). |
| **Extended Stay Proportion (6+ days)** | **26.68%** | Encounters lasting 6 or more days (\( n = 26,505 \)). |

---

## 4. Cohort Definitions & Analytical Findings

### 4.1 Readmission Performance by Admission Context

| Dimension / Cohort | Sample Size (\( n \)) | `<30`d Readmit Rate (%) | `>30`d Readmit Rate (%) | Relative Risk vs Baseline (11.19%) | Key Observation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Emergency Admission** | 52,437 | **11.45%** | 35.80% | 1.02x | High-volume admission channel representing 52.8% of all encounters. |
| **Elective Admission** | 18,367 | **9.64%** | 33.15% | 0.86x | Lower 30-day early readmission risk (-1.75% vs baseline). |
| **Urgent Admission** | 18,172 | **11.53%** | 36.19% | 1.03x | Similar early readmission profile to emergency admissions. |
| **Physician Referral Source** | 28,683 | **10.51%** | 34.78% | 0.94x | Lower early readmission risk than emergency room transfers. |
| **Emergency Room Source** | 55,909 | **11.46%** | 35.63% | 1.02x | Largest referral source with typical baseline risk profile. |
| **Age Group: `[70-80)`** | 25,273 | **11.89%** | 36.63% | 1.06x | Peak prevalence age bracket; elevated readmission risk. |
| **Age Group: `[80-90)`** | 16,616 | **12.39%** | 36.08% | 1.11x | Elderly cohort demonstrating highest early readmission rate. |
| **Circulatory Diagnosis** | 29,481 | **12.44%** | 36.56% | 1.11x | Highest early readmission rate among primary organ systems. |
| **Diabetes Diagnosis** | 8,634 | **11.96%** | 35.15% | 1.07x | Primary diabetes code shows elevated 30-day readmission. |
| **Musculoskeletal Diagnosis** | 4,874 | **7.76%** | 30.69% | 0.69x | Lowest early readmission rate among primary diagnosis categories. |

### 4.2 Healthcare Utilization Trends (Prior 12 Months)

| Prior Utilization Bracket | Sample Size (\( n \)) | `<30`d Readmit Rate (%) | `>30`d Readmit Rate (%) | Relative Risk vs Baseline | Key Risk Pattern |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Inpatient: 0 Visits** | 66,242 | **9.09%** | 33.72% | **0.81x** | Low-risk baseline cohort (-2.30% vs baseline). |
| **Inpatient: 1 Visit** | 19,003 | **13.62%** | 37.94% | **1.22x** | Single prior admission increases early risk by +4.53%. |
| **Inpatient: 2 Visits** | 6,861 | **17.20%** | 39.51% | **1.54x** | Substantial risk escalation (+8.11% vs baseline). |
| **Inpatient: 3+ Visits** | 7,237 | **20.24%** | 40.54% | **1.81x** | **Highest risk cohort**: >1 in 5 patients readmitted within 30 days. |
| **Emergency: 0 Visits** | 88,102 | **10.63%** | 35.08% | **0.95x** | Baseline non-emergency patient cohort. |
| **Emergency: 1 Visit** | 7,617 | **15.22%** | 36.63% | **1.36x** | Significant risk elevation (+4.03% vs no ER visits). |
| **Emergency: 2+ Visits** | 3,624 | **21.80%** | 38.00% | **1.95x** | Severe risk escalation for frequent ER utilizers. |
| **Outpatient: 0 Visits** | 82,906 | **11.23%** | 35.18% | **1.00x** | Baseline outpatient cohort. |
| **Outpatient: 3+ Visits** | 6,052 | **12.33%** | 36.78% | **1.10x** | Mildly elevated early readmission correlation. |

### 4.3 Length of Stay Analysis

| Stay Duration Group | Sample Size (\( n \)) | `<30`d Readmit Rate (%) | `>30`d Readmit Rate (%) | Relative Risk vs Baseline | Interpretation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Short Stay (1–2 Days)** | 35,463 | **9.68%** | 33.15% | **0.86x** | Lowest readmission rate (-1.71% vs baseline). |
| **Moderate Stay (3–5 Days)** | 37,375 | **11.28%** | 35.91% | **1.01x** | Near dataset baseline early readmission rate. |
| **Extended Stay (6–9 Days)** | 19,531 | **13.06%** | 37.38% | **1.17x** | Complex inpatient cases showing elevated early risk. |
| **Long Stay (10–14 Days)** | 6,974 | **15.01%** | 37.24% | **1.34x** | Severe illness complexity correlating with +3.62% higher early readmission. |

---

## 5. API Endpoints Specification

All endpoints are hosted under `/api/v1/analytics` and require JWT Bearer Authentication (`Doctor`, `Hospital Administrator`, `Healthcare Researcher`, `System Administrator` roles):

### 5.1 `GET /api/v1/analytics/hospital-performance`
Returns system-wide aggregate KPIs, overall outcome distribution, stay duration metrics, and anonymity disclaimers.

#### Sample JSON Response:
```json
{
  "total_encounters_analyzed": 101766,
  "eligible_encounters_count": 99343,
  "early_readmit_count": 11314,
  "early_readmit_rate_pct": 11.39,
  "late_readmit_rate_pct": 35.31,
  "no_readmit_rate_pct": 53.30,
  "overall_outcome_distribution": {
    "early_readmission": {
      "count": 11314,
      "percentage": 11.39
    },
    "late_readmission": {
      "count": 35082,
      "percentage": 35.31
    },
    "no_readmission": {
      "count": 52947,
      "percentage": 53.30
    }
  },
  "average_length_of_stay_days": 4.38,
  "high_utilization_patient_pct": 43.20,
  "extended_stay_rate_pct": 26.68,
  "dataset_hospital_system_count": 130,
  "dataset_time_span": "1999–2008",
  "hospital_anonymity_disclaimer": "Hospital Anonymity & System-Level Analytics Note: The dataset represents encounters from 130 US hospitals (1999-2008), but does NOT provide individual hospital-name identifiers...",
  "disclaimer": "Observational Association Disclaimer: All analytics represent historical correlations..."
}
```

### 5.2 `GET /api/v1/analytics/admission-context-outcomes`
Returns 30-day early, late, and no readmission outcome rates across admission types, sources, age groups, medical specialties, and primary ICD-9 diagnosis groups.

### 5.3 `GET /api/v1/analytics/utilization-trends`
Returns early readmission risk gradients across prior 12-month inpatient, emergency, and outpatient visit brackets.

### 5.4 `GET /api/v1/analytics/length-of-stay-outcomes`
Returns readmission outcome distributions across hospital stay duration brackets (Short, Moderate, Extended, Long).

---

## 6. Observational Guidelines & Statistical Interpretation

1. **Prior Utilization is the Strongest Predictor**: Patients with 3+ prior inpatient visits exhibit a **20.24% 30-day readmission rate** (1.81x baseline), while patients with 2+ prior emergency visits reach **21.80%** (1.95x baseline).
2. **Length of Stay Correlation**: Hospital stays extending past 10 days show a **15.01% 30-day readmission rate**, reflecting underlying severity and comorbidity burden.
3. **No Named Hospital Comparisons**: The absence of individual hospital identifiers ensures that analytics evaluate overall healthcare population patterns without making unwarranted assertions about individual hospital quality.
