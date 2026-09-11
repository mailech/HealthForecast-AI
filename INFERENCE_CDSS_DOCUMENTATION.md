# HealthForecast AI: Inference API & Clinical Decision Support System (CDSS) Documentation

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Phase**: Milestone 2 — Step 4: Inference REST API & Rules-Based Clinical Decision Support System (CDSS)  
**Primary Production Model**: Validated XGBoost Classifier (`backend/ml/models/xgboost_model.joblib`)  
**Fitted Preprocessor**: `backend/ml/models/preprocessor.joblib`  
**Date**: September 2026  

---

## 1. System Architecture & Inference Workflow

```mermaid
flowchart TD
    Client["Client / Doctor Station"] -->|POST /api/v1/predictions/predict| API["FastAPI Endpoint (JWT Auth & RBAC)"]
    API -->|Raw Clinical JSON| Engine["HealthForecastInferenceEngine"]
    Engine -->|Pandas DataFrame| Preprocessor["Fitted Preprocessor (187 Safe Features)"]
    Preprocessor -->|Transformed X_matrix| Model["Validated XGBoost Model"]
    Model -->|P(Readmission <30d)| RiskCalc["Risk Score & Threshold Evaluator"]
    RiskCalc -->|Probability & Category| CDSS["Clinical Decision Support Engine"]
    CDSS -->|Rule Triggers| Recs["Non-Diagnostic Clinical Recommendations"]
    Recs -->|Response Payload| Client
```

---

## 2. Risk Categories & Threshold System

Risk categories are computed from the continuous model readmission probability \( P(\text{Readmission} < 30\text{d}) \):

| Risk Category | Model Probability Range | Risk Percentage Range | Clinical Operational Focus |
| :--- | :---: | :---: | :--- |
| **Low Risk** | \( P < 0.30 \) | 0.0% – 29.9% | Standard routine post-discharge care protocols. |
| **Medium Risk** | \( 0.30 \le P < 0.60 \) | 30.0% – 59.9% | Targeted medication reconciliation, glucose monitoring, and follow-up within 14 days. |
| **High Risk** | \( P \ge 0.60 \) | 60.0% – 100.0% | Multidisciplinary care coordination, early follow-up (7–10 days), and intensive discharge planning. |

> [!IMPORTANT]
> **Clinical Classification Disclaimer**: Risk categories are statistical probability bands output by a machine learning model, NOT medical diagnoses. They indicate statistical risk relative to baseline hospital readmission patterns.

---

## 3. Clinical Decision Support System (CDSS) Rules

For Medium and High risk encounters, the CDSS engine evaluates patient clinical indicators to trigger evidence-grounded, non-diagnostic decision-support suggestions:

| Rule ID | Category | Trigger Criteria | Non-Diagnostic Recommendation Suggestion |
| :--- | :--- | :--- | :--- |
| `CDSS_MED_REC` | **Medication Safety** | Medication regimen changed (`change == 'Ch'`), diabetes medication prescribed, or `num_medications > 10`. | Perform comprehensive post-discharge medication reconciliation, particularly for modified diabetes regimens. |
| `CDSS_FOLLOW_UP` | **Care Continuity** | Risk Category is Medium/High or prior inpatient admission (`number_inpatient > 0`). | Schedule an outpatient clinical follow-up appointment within 7–14 days of hospital discharge. |
| `CDSS_DIABETES_EDU` | **Patient Education** | Diabetes diagnosis assigned (`diag_1/2/3_group == 'Diabetes'`), `max_glu_serum >200/>300`, or `A1Cresult >7/>8`. | Provide structured diabetes self-management training, glucose monitoring instructions, and hypoglycemia prevention guidelines. |
| `CDSS_UTILIZATION_REV` | **Utilization Review** | Prior 12-month inpatient (`number_inpatient > 0`) or emergency (`number_emergency > 0`) visits. | Review the patient's prior 12-month inpatient and emergency hospitalizations to address root drivers of frequent readmission. |
| `CDSS_GLYCEMIC_MON` | **Clinical Monitoring** | Serum glucose >200/>300 mg/dL or A1C >7%/>8%. | Re-evaluate elevated serum glucose/A1C lab results and consider endocrinology consult prior to discharge. |
| `CDSS_CARE_COORD` | **Care Management** | `num_medications >= 12`, `number_diagnoses >= 6`, or hospital stay `time_in_hospital >= 5` days. | Assign a clinical care coordinator to oversee complex discharge planning for multi-morbid care transitions. |

---

## 4. API Endpoint Specifications

### 4.1 `POST /api/v1/predictions/predict`
Predicts 30-day readmission risk for custom, un-persisted clinical input.

- **Security**: Bearer JWT (Doctor, Hospital Admin, Healthcare Researcher, System Admin).

#### Example Request:
```json
{
  "race": "Caucasian",
  "gender": "Female",
  "age": "[60-70)",
  "admission_type_id": 1,
  "admission_source_id": 7,
  "time_in_hospital": 5,
  "payer_code": "MC",
  "medical_specialty": "InternalMedicine",
  "num_lab_procedures": 55,
  "num_procedures": 2,
  "num_medications": 14,
  "number_outpatient": 1,
  "number_emergency": 1,
  "number_inpatient": 2,
  "diag_1": "250.02",
  "diag_2": "414",
  "diag_3": "401",
  "number_diagnoses": 7,
  "max_glu_serum": ">200",
  "A1Cresult": ">8",
  "change": "Ch",
  "diabetesMed": "Yes",
  "insulin": "Up",
  "metformin": "Steady"
}
```

#### Example Response:
```json
{
  "encounter_id": null,
  "patient_id": null,
  "risk_probability": 0.6542,
  "risk_percentage": 65.42,
  "risk_category": "High Risk",
  "prediction": 1,
  "predicted_class_label": "<30",
  "top_risk_factors": [
    {
      "feature": "number_inpatient",
      "value": 2.0,
      "importance_weight": 0.0632
    },
    {
      "feature": "number_diagnoses",
      "value": 7.0,
      "importance_weight": 0.012
    },
    {
      "feature": "number_emergency",
      "value": 1.0,
      "importance_weight": 0.0115
    }
  ],
  "cdss_recommendations": [
    {
      "rule_id": "CDSS_MED_REC",
      "category": "Medication Safety",
      "title": "Medication Reconciliation",
      "description": "Perform comprehensive post-discharge medication reconciliation, particularly for modified or complex diabetes regimens.",
      "disclaimer": "Clinical decision-support suggestion only. Not a substitute for clinician judgment."
    },
    {
      "rule_id": "CDSS_FOLLOW_UP",
      "category": "Care Continuity",
      "title": "Timely Outpatient Follow-Up",
      "description": "Schedule an outpatient clinical follow-up appointment within 7–14 days of hospital discharge.",
      "disclaimer": "Clinical decision-support suggestion only. Not a substitute for clinician judgment."
    }
  ],
  "model_name": "XGBoost Readmission Classifier",
  "model_version": "v1.0.0-xgb",
  "timestamp": "2026-09-05T22:42:00Z",
  "disclaimer": "HealthForecast AI provides machine learning risk estimates and clinical decision-support suggestions ONLY. It is NOT a medical diagnostic tool or a substitute for professional clinical judgment."
}
```

---

### 4.2 `POST /api/v1/predictions/predict/{encounter_id}`
Predicts readmission risk for a stored database encounter, saving a prediction audit log.

- **Security**: Bearer JWT.
- **Path Parameter**: `encounter_id` (string, e.g., `"22540"`).
- **Response**: Same structure as `PredictionResponse`, with `encounter_id` and `patient_id` populated.

---

### 4.3 `GET /api/v1/predictions/encounter/{encounter_id}`
Retrieves prediction history log for a specific encounter.

---

## 5. Clinical Safety & Limitations Statement

1. **Non-Diagnostic Tool**: HealthForecast AI is strictly designed to assist healthcare professionals in identifying patients who may benefit from post-discharge care planning. It does NOT diagnose medical conditions or mandate treatments.
2. **Clinician Precedence**: Clinicians must independently evaluate all recommendations and make final clinical decisions.
3. **Data Context**: Models were trained on the Diabetes 130-US Hospitals dataset. Performance on populations outside this demographic or setting should be validated prior to clinical deployment.
