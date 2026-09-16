# HealthForecast AI

## AI-Powered Hospital Readmission Prediction & Patient Risk Intelligence System

HealthForecast AI is a full-stack healthcare application for patient record management, medical-history storage, hospital readmission-risk prediction, prediction history, role-based dashboards, research-oriented data access, and PDF report generation.

The system connects a **React + Vite frontend**, **FastAPI backend**, **MongoDB database**, and a dual-model **Random Forest + XGBoost** prediction pipeline.

> **Disclaimer:** This is an academic/software demonstration and clinical decision-support project. AI predictions are not a medical diagnosis, prescription, or substitute for professional clinical judgment.

---

## 1. Problem Statement

Hospital readmissions increase healthcare workload and resource requirements. HealthForecast AI uses available patient and clinical information to estimate the probability of hospital readmission and classify the result into software-defined Low, Medium, or High risk.

The platform combines:

- Patient information
- Medical history
- Clinical measurements
- Diagnostic information
- Healthcare-utilization features
- Medication-related features
- Machine-learning prediction
- Risk classification
- Prediction history
- PDF reports
- Research and analysis access

---

## 2. Objectives

1. Manage patient records.
2. Store medical-history information.
3. Accept clinical inputs for prediction.
4. Transform clinical inputs into model features.
5. Predict hospital readmission probability.
6. Classify risk as Low, Medium, or High.
7. Store prediction results as history.
8. Generate downloadable prediction reports.
9. Provide role-specific dashboards.
10. Provide read-only research access to existing patient and prediction data.
11. Allow Hospital Administrators to manage patient records.
12. Allow Doctors to generate predictions and manage treatment plans where implemented.
13. Protect resources using JWT authentication and RBAC.

---

## 3. User Roles and Permissions

The system supports **four roles**:

- Hospital Administrator
- Doctor
- Healthcare Researcher
- System Administrator

> **Implementation note:** The System Administrator role is included in the system design and RBAC documentation. If the current frontend System Administrator dashboard is not fully implemented, the backend permissions and UI should be verified before describing that dashboard as production-ready.

| Feature | Hospital Administrator | Doctor | Healthcare Researcher | System Administrator |
|---|---|---|---|---|
| Dashboard | Yes | Yes | Yes | Yes |
| View patients | Yes | Yes | Yes | As authorized |
| Add patient | Yes | No | No | No |
| Edit patient | Yes | No | No | No |
| Delete patient | Yes | No | No | No |
| Create AI prediction | No | Yes | No | No |
| View prediction information | Yes | Yes | Yes | As authorized |
| Prediction history | View | Full clinical workflow | View | As authorized |
| Download prediction/history | Where enabled | Yes | Yes | As authorized |
| Treatment plans | No | Yes, where enabled | No | No |
| Research/analysis | No | Clinical workflow | Yes | No |
| User management | No | No | No | Yes |
| Role management | No | No | No | Yes |
| Audit/Security monitoring | No | No | No | Yes / Where implemented |

### Hospital Administrator

The Hospital Administrator manages the patient registry and monitors existing prediction information.

**Access:**
- Dashboard
- Patient list
- Add patient
- Edit patient
- Delete patient
- View patient details
- View prediction information
- Access available reports

**Restriction:** The Hospital Administrator does **not** create AI predictions.

### Doctor

The Doctor is the primary user of the clinical prediction workflow.

**Access:**
- Dashboard
- Patients
- Medical history
- Clinical prediction
- Prediction result
- Prediction history
- PDF reports
- Treatment plans where implemented

**Workflow:**

```text
Select Patient
     ↓
Enter Clinical Information
     ↓
Generate Prediction
     ↓
Random Forest + XGBoost
     ↓
Probability
     ↓
Risk Level
     ↓
Save Prediction
     ↓
PDF / Treatment Plan
```

### Healthcare Researcher

The Researcher role is **read-only** and is intended for research and analysis.

**Access:**
- Dashboard
- Existing patient/data information
- Prediction history
- Downloadable prediction/history information
- Research and analysis

**Restrictions:**
- Cannot add patients
- Cannot edit patients
- Cannot delete patients
- Cannot create predictions
- Cannot modify predictions
- Cannot create treatment plans
- Cannot manage users

The Researcher workflow is:

```text
Dashboard
    ↓
View Existing Data
    ↓
Prediction History
    ↓
Download
    ↓
Research / Analysis
```

---

### System Administrator

The System Administrator is responsible for system-level administration and security-related operations.

**Intended access:**
- System administration dashboard
- User management
- Role management
- Account activation/deactivation
- System monitoring
- Audit-log monitoring where implemented
- System configuration where implemented

**Restrictions:**
- Does not create clinical AI predictions as part of the normal clinical workflow.
- Does not modify patient clinical data unless a specifically authorized administrative function exists.
- Does not create treatment plans as a Doctor.

**Workflow:**

```text
Login
  ↓
System Administration Dashboard
  ↓
Users / Roles / System Monitoring
  ↓
Audit & Security Monitoring
```

## 4. Main Functional Modules

### 4.1 Authentication

- Login
- Password verification
- JWT generation and validation
- Session persistence
- Logout
- Protected routes
- Role-based authorization

Main endpoint:

```text
POST /api/v1/auth/login
```

### 4.2 Patient Management

Patient records contain demographic and hospital-related information.

Hospital Administrators can add, edit, delete, search, filter, and view patients.

Researchers can view available data but cannot modify it.

### 4.3 Medical History

Medical-history information can include:

- Primary diagnosis
- Secondary diagnoses
- Allergies
- Previous surgeries
- Smoking status
- Alcohol consumption
- Other historical clinical information

Medical history is associated with a patient using `patient_id`.

### 4.4 AI Prediction

Clinical information passes through validation, feature engineering, preprocessing, trained models, probability generation, and risk classification.

```text
Clinical Input
      ↓
Frontend Validation
      ↓
FastAPI
      ↓
Pydantic Validation
      ↓
Feature Engineering
      ↓
Preprocessing
      ↓
Random Forest + XGBoost
      ↓
Readmission Probability
      ↓
Risk Classification
      ↓
Prediction History
      ↓
PDF Report
```

### 4.5 Prediction History

Stored prediction information can include:

- Prediction ID
- Patient ID
- Patient name
- Prediction date
- Doctor who generated the prediction
- Model 1 probability
- Model 2 probability
- Final risk score
- Risk level
- Features used

Doctors use history for their clinical workflow. Hospital Administrators can monitor prediction information. Researchers can view and download prediction history for analysis.

### 4.6 PDF Reports

Reports are generated using **ReportLab** and can contain:

- Patient information
- Prediction date
- Model probabilities
- Final risk score
- Risk level
- Feature information
- Clinical interpretation where implemented
- Disclaimer

---

## 5. System Architecture

```text
                    User Browser
                 React + Vite
                       |
                     Axios
                       |
                       v
                FastAPI Backend
              Python REST APIs
                JWT + RBAC
                 /       \
                /         \
               v           v
          MongoDB       AI Pipeline
                           |
                    Random Forest
                           +
                        XGBoost
                           |
                           v
                  Readmission Probability
                           |
                           v
                    Risk Classification
                           |
                           v
                   Prediction History
                           |
                           v
                      PDF Report
```

The backend follows a layered design:

```text
Routes
  ↓
Schemas / Validation
  ↓
Services
  ↓
Database / AI / Reports
```

---

## 6. Technology Stack

### Frontend

- React 19
- React DOM
- Vite
- Material UI (MUI)
- React Router
- Axios
- React Hook Form
- Chart.js
- react-chartjs-2
- Context API

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic
- PyMongo
- Motor where configured
- NumPy
- Pandas
- Scikit-learn
- XGBoost
- Joblib
- Pickle
- Python-Jose
- Passlib / bcrypt
- ReportLab
- Pytest
- HTTPX

### Database

```text
MongoDB
Database: health_forecast_db
```

### AI / ML

- Random Forest
- XGBoost
- Scikit-learn
- Pandas
- NumPy

---

## 7. Project Structure

```text
HealthForecast-AI/
│
├── Backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── model_loader.py
│   │   │   └── predictor.py
│   │   ├── middleware/
│   │   │   ├── logging_middleware.py
│   │   │   └── error_handler.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── patients.py
│   │   │   ├── history.py
│   │   │   ├── prediction.py
│   │   │   ├── dashboard.py
│   │   │   ├── reports.py
│   │   │   ├── treatments.py
│   │   │   └── audit.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── patient_service.py
│   │   │   ├── history_service.py
│   │   │   ├── prediction_service.py
│   │   │   ├── dashboard_service.py
│   │   │   ├── pdf_service.py
│   │   │   └── treatment_service.py
│   │   ├── utils/
│   │   │   └── security.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── tests/
│   ├── seed_data.py
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── ResearcherDashboard.jsx
│   │   │   ├── Patients.jsx
│   │   │   ├── EditPatient.jsx
│   │   │   ├── Prediction.jsx
│   │   │   ├── PredictionHistory.jsx
│   │   │   ├── PredictionResult.jsx
│   │   │   └── Treatments.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   ├── raw/
│   ├── models/
│   └── scripts/
│
└── README.md
```

---

## 8. Database Design

MongoDB collections:

```text
health_forecast_db
│
├── users
├── patients
├── medical_histories
├── predictions
├── treatments
└── audit_logs
```

### users

```text
_id
email
full_name
role
hospital
hashed_password
is_active
must_change_password
created_at
```

### patients

```text
_id
patient_id
first_name
last_name
date_of_birth
gender
hospital
phone
email
address
created_at
updated_at
```

### medical_histories

```text
_id
history_id
patient_id
primary_diagnosis
secondary_diagnoses
allergies
previous_surgeries
smoking_status
alcohol_consumption
created_at
```

### predictions

```text
_id
prediction_id
patient_id
patient_name
predicted_by
prediction_date
model1_probability
model1_prediction
model2_probability
model2_prediction
readmission_risk_score
risk_level
clinical_interpretation
features_used
```

### treatments

```text
_id
treatment_id
patient_id
prediction_id
doctor_id
treatment_plan
diagnosis
status
start_date
end_date
follow_up_date
medications
monitoring_parameters
notes
```

### audit_logs

```text
event_id
user_id
user_email
action
target_resource
timestamp
```

---

## 9. Dataset

The documented training dataset is the **Diabetes 130-US Hospitals Dataset**.

Documented characteristics:

- 101,766 clinical encounters
- 130 US hospitals
- Approximately 10 years of inpatient data
- 50 raw features
- Demographics
- Admission information
- Diagnostic codes
- Laboratory procedure counts
- Medication information

Original target:

```text
<30
>30
NO
```

Binary target:

```text
risk_target

1 → readmission within <30 days
0 → >30 days or NO readmission
```

The dataset represents inpatient diabetic patient encounters, so model performance may vary for populations that differ from the training data.

---

## 10. Data Preprocessing

The documented preprocessing includes:

### Removed highly incomplete fields

```text
weight
payer_code
max_glu_serum
A1Cresult
```

### Missing categorical values

```text
Unknown
```

### Gender

Gender is imputed using the dataset mode.

### Constant features

Zero-variance features are removed where applicable.

Examples:

```text
acetohexamide_No
troglitazone_No
examide_No
citoglipton_No
```

---

## 11. Feature Engineering

Features used by the documented pipeline include:

```text
time_in_hospital
num_lab_procedures
num_procedures
num_medications
number_inpatient
number_emergency
number_diagnoses
diag_1
diag_2
diag_3
change
diabetesMed
insulin
metformin
glipizide
admission_type_id
admission_source_id
```

The application also derives project-specific clinical severity and utilization features.

Documented software conditions include:

```text
Systolic BP >= 160
Diastolic BP >= 100
Blood Glucose >= 220
HbA1c >= 8.5
SpO2 <= 92
```

These are **software feature-engineering rules**, not medical guidelines.

---

## 12. Clinical Notes Feature Extraction

The project uses keyword-based extraction from clinical notes.

Recognized examples include:

- Fever
- Low oxygen / hypoxia
- Tachycardia
- Uncontrolled diabetes
- Cardiac symptoms
- Chest discomfort
- Shortness of breath

Example:

```text
"fever, tachycardia, low oxygen and chest discomfort"
```

This is keyword-based feature extraction, not a general-purpose medical NLP model.

---

## 13. ICD-9 Mapping

Documented examples:

```text
250.02 → severe uncontrolled diabetes
410    → acute cardiac/hypertension presentation
460    → respiratory/fever presentation
```

These mappings are converted into model-related features.

---

## 14. Admission Feature Encoding

Documented project-specific examples:

### Severe acute presentation

```text
admission_type_id = 1
admission_source_id = 7
```

### Routine presentation

```text
admission_type_id = 3
admission_source_id = 1
```

These values are project-specific feature encodings.

---

## 15. Medication Feature Encoding

Example derived values for a diabetic/hyperglycemic case:

```text
diabetesMed = "Yes"
insulin = "Up"
metformin = "Steady"
glipizide = "Steady"
change = "Ch"
```

Exact values depend on the implemented preprocessing and patient information.

---

## 16. Machine Learning Models

HealthForecast AI uses two documented prediction models.

### Model 1 — Random Forest

Purpose:

```text
Early readmission prediction
readmitted == "<30"
```

Configuration:

```text
n_estimators = 200
max_depth = 15
```

Random Forest combines multiple decision trees.

Simplified classification:

\[
\hat{y}=mode(T_1(x),T_2(x),...,T_n(x))
\]

Probability estimation is obtained using:

```python
model.predict_proba(X)
```

### Model 2 — XGBoost

Purpose:

```text
General readmission prediction
readmitted != "NO"
```

Configuration:

```text
n_estimators = 200
max_depth = 6
```

XGBoost uses gradient-boosted decision trees.

Conceptually:

\[
\hat{y}(x)=\sum_{k=1}^{K} f_k(x)
\]

where `K` is the number of boosting rounds and `f_k` is a tree function.

---

## 17. Feature Scaling

Where required by the trained pipeline, standardization is:

\[
z=\frac{x-\mu}{\sigma}
\]

Where:

- `x` = original feature value
- `μ` = training-set mean
- `σ` = training-set standard deviation
- `z` = standardized feature value

The scaler used during inference must match the scaler used during training.

---

## 18. BMI Formula

If BMI is calculated from height and weight:

\[
BMI=\frac{Weight_{kg}}{Height_m^2}
\]

Example:

```text
Weight = 70 kg
Height = 1.75 m
```

\[
BMI=\frac{70}{1.75^2}\approx22.86
\]

If BMI is directly supplied by the application, the supplied value can be used.

---

## 19. Sigmoid Function

The documented older/default training path uses the sigmoid function:

\[
\sigma(x)=\frac{1}{1+e^{-x}}
\]

Properties:

```text
x → +∞  => 1
x = 0   => 0.5
x → -∞  => 0
```

---

## 20. Risk Probability and Classification

For a binary classifier:

\[
P(Readmission=1\mid X)
\]

Risk percentage:

\[
RiskPercentage=P(Readmission=1\mid X)\times100
\]

Example:

```text
0.7248 × 100 = 72.48%
```

### Software Risk Thresholds

```text
p >= 0.65       → High
0.35 <= p < 0.65 → Medium
p < 0.35        → Low
```

Mathematically:

\[
RiskLevel=
\begin{cases}
High, & p\ge0.65\\
Medium, & 0.35\le p<0.65\\
Low, & p<0.35
\end{cases}
\]

These thresholds are software classification rules and **not clinical guidelines**.

---

## 21. Model Output Examples

### Normal Test Case

```text
Systolic BP   = 118
Diastolic BP  = 78
Blood glucose = 95
HbA1c         = 5.4
Heart rate    = 72
SpO2          = 98
Temperature   = 36.8
BMI           = 22.5
Cholesterol   = 170
Diabetes      = No
Hypertension  = No
Heart disease = No
```

Documented output:

```text
Model 1 probability = 0.3201
Model 2 probability = 0.2376
Final documented risk score = 0.3201
Risk level = Low
```

### Severe Test Case

```text
Systolic BP   = 180
Diastolic BP  = 110
Blood glucose = 300
HbA1c         = 10.0
Heart rate    = 120
SpO2          = 89
Temperature   = 39.0
BMI           = 35.0
Cholesterol   = 280
Diabetes      = Yes
Hypertension  = Yes
Heart disease = Yes
```

Documented output:

```text
Model 1 probability = 0.5537
Model 2 probability = 0.7248
Final documented risk score = 0.7248
Risk level = High
```

These are software verification examples, not medical recommendations.

---

## 22. Important Model Note

The supplied project documentation describes both an older/default training path and the current dual-model pipeline.

### Older/default path

```text
Synthetic/default records
        ↓
Weighted risk-score construction
        ↓
Sigmoid conversion
        ↓
Random Forest
```

### Current documented pipeline

```text
Clinical feature derivation
        ↓
Preprocessing
        ↓
Random Forest + XGBoost
        ↓
Probability prediction
        ↓
Risk classification
```

The exact mathematical rule used to combine Model 1 and Model 2 probabilities should be taken from the active implementation and saved model artifacts:

```text
Backend/app/ai/predictor.py
Backend/app/routes/prediction.py
```

This README intentionally does not invent an undocumented ensemble-combination formula.

---

## 23. Model Evaluation Metrics

### Confusion Matrix

```text
                    Actual
                 Positive Negative

Predicted
Positive            TP       FP
Negative            FN       TN
```

Where:

```text
TP = True Positive
TN = True Negative
FP = False Positive
FN = False Negative
```

### Accuracy

\[
Accuracy=\frac{TP+TN}{TP+TN+FP+FN}
\]

### Precision

\[
Precision=\frac{TP}{TP+FP}
\]

### Recall / Sensitivity

\[
Recall=\frac{TP}{TP+FN}
\]

### F1-score

\[
F1=2\times\frac{Precision\times Recall}{Precision+Recall}
\]

### Specificity

\[
Specificity=\frac{TN}{TN+FP}
\]

### False Positive Rate

\[
FPR=\frac{FP}{FP+TN}
\]

### True Positive Rate

\[
TPR=\frac{TP}{TP+FN}
\]

### ROC-AUC

ROC-AUC measures the model's ability to distinguish positive and negative classes across classification thresholds.

---

## 24. Performance and Complexity

### Random Forest Prediction

A simplified structural estimate is:

\[
O(n_{trees}\times depth)
\]

For the documented configuration:

```text
n_trees = 200
depth ≈ 15

O(200 × 15)
```

Actual runtime depends on the fitted tree structure, number of features, hardware, serialization, and library implementation.

### MongoDB Lookup

Without an appropriate index:

\[
O(n)
\]

With an appropriate index, lookup performance is approximately:

\[
O(\log n)
\]

Actual MongoDB performance depends on the query, index structure, storage engine, and workload.

### HTTP Processing Time

\[
ProcessTime_{ms}=(Time_{after}-Time_{before})\times1000
\]

The logging middleware can expose this as:

```text
X-Process-Time-Ms
```

---

## 25. RBAC and Security

RBAC is enforced on both frontend and backend.

```text
Request
   ↓
JWT Validation
   ↓
Current User
   ↓
Role Extraction
   ↓
Role Check
   ↓
Allowed?
  / \
Yes  No
 |    |
API  403
```

Security features include:

- JWT authentication
- bcrypt password hashing
- Role-Based Access Control
- Protected frontend routes
- Backend role validation
- Pydantic request validation
- Centralized error handling
- Environment-based secrets
- MongoDB access controls
- Audit logging where implemented

Frontend hiding alone is not sufficient; backend endpoints must also enforce permissions.

---

## 26. Password Security

Passwords are not stored as plain text.

```text
Plain Password
      ↓
bcrypt + salt
      ↓
Password Hash
      ↓
MongoDB
```

Password verification compares the submitted password against the stored hash.

---

## 27. JWT Authentication

Conceptually:

```text
Header.Payload.Signature
```

A token can contain:

```json
{
  "sub": "user@hospital.com",
  "role": "Doctor",
  "exp": "expiration time"
}
```

Documented default algorithm:

```text
HS256
```

Documented configuration:

```text
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

which represents 24 hours.

Authorization header:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## 28. API Structure

API prefix:

```text
/api/v1
```

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Patients

```text
POST   /api/v1/patients
GET    /api/v1/patients
GET    /api/v1/patients/{id}
PUT    /api/v1/patients/{id}
DELETE /api/v1/patients/{id}
```

Patient modification endpoints are protected by role permissions.

### Prediction

```text
POST /api/v1/prediction/simple-predict
```

### Dashboard

Dashboard endpoints provide role-specific statistics.

### History

Prediction-history endpoints provide stored prediction records according to role permissions.

### Reports

Report endpoints provide downloadable PDF reports where authorized.

---

## 29. Example Prediction Request

```json
{
  "patient_id": "PAT-83921",
  "blood_pressure_systolic": 158,
  "blood_pressure_diastolic": 96,
  "blood_glucose": 210.0,
  "hba1c": 8.4,
  "heart_rate": 92,
  "spo2": 95.0,
  "body_temperature": 37.2,
  "bmi": 31.5,
  "has_diabetes": true,
  "has_hypertension": true,
  "has_heart_disease": false,
  "symptoms_notes": "Patient reports recurrent fatigue and elevated morning blood sugar."
}
```

Request:

```text
POST /api/v1/prediction/simple-predict
```

Header:

```text
Authorization: Bearer <jwt_token>
```

---

## 30. Example Prediction Response

```json
{
  "patient_id": "PAT-83921",
  "patient_name": "Eleanor Vance",
  "predicted_by": "doctor@hospital.org",
  "model1_probability": 0.7245,
  "model1_prediction": "HIGH RISK (readmission < 30 days)",
  "model2_probability": 0.6812,
  "model2_prediction": "LIKELY READMISSION",
  "readmission_risk_score": 0.7245,
  "risk_level": "High"
}
```

The exact response fields depend on the active backend schema.

---

## 31. Dashboard Workflows

### Hospital Administrator

```text
Login
  ↓
Dashboard
  ↓
Patients
  ↓
Add / Edit / Delete / View
  ↓
Prediction Information
```

### Doctor

```text
Login
  ↓
Dashboard
  ↓
Patients / Medical History
  ↓
Clinical Inputs
  ↓
AI Prediction
  ↓
Prediction Result
  ↓
Prediction History
  ↓
PDF
  ↓
Treatment Plan
```

### Researcher

```text
Login
  ↓
Dashboard
  ↓
Existing Patient/Data
  ↓
Prediction History
  ↓
Download
  ↓
Research / Analysis
```

---

## 32. Error Handling

Typical HTTP responses:

```text
200 → Successful request
201 → Resource created
400 → Bad request
401 → Authentication required / invalid credentials
403 → Forbidden for current role
404 → Resource not found
422 → Validation error
500 → Internal server error
```

---

## 33. Frontend API Handling

The Axios client can attach the JWT automatically:

```text
Frontend Request
      ↓
Axios Interceptor
      ↓
Authorization: Bearer <JWT>
      ↓
FastAPI
```

This avoids manually adding the token to every protected request.

---

## 34. Development Environment

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

## 35. Environment Variables

Create:

```text
Backend/.env
```

Example:

```env
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=health_forecast_db
```

Never commit real secrets or database credentials to Git.

---

## 36. Installation

### Backend

```powershell
cd Backend

python -m venv venv

.\venv\Scripts\Activate.ps1

python -m pip install --upgrade pip

pip install -r requirements.txt
```

If seed data is required:

```powershell
python seed_data.py
```

### Frontend

```powershell
cd Frontend

npm install
```

---

## 37. Running the Application

### Start Backend

From `Backend/`:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Start Frontend

From `Frontend/`:

```powershell
npm run dev
```

Open:

```text
Frontend: http://localhost:5173
Backend:  http://127.0.0.1:8000
Swagger:  http://127.0.0.1:8000/docs
```

---

## 38. Testing

Run backend tests:

```powershell
cd Backend
.\venv\Scripts\pytest -v
```

Documented testing tools:

```text
pytest
httpx
```

---

## 39. Data Privacy

Healthcare data can be sensitive. For production deployment:

- Use HTTPS.
- Protect database credentials.
- Use strong JWT secrets.
- Apply least-privilege RBAC.
- Avoid unnecessary patient identifiers.
- Use anonymized or aggregated data for research where appropriate.
- Maintain audit logs for sensitive operations.
- Do not commit `.env` files containing secrets.
- Follow applicable privacy and healthcare requirements.

---

## 40. Limitations

1. Predictions depend on the training dataset and preprocessing pipeline.
2. A probability score is not a medical diagnosis.
3. The documented dataset represents inpatient diabetic patient encounters.
4. Performance may vary for different populations.
5. Risk thresholds are software rules, not medical guidelines.
6. Clinical-note processing is keyword-based.
7. Model performance should be validated on appropriate held-out data.
8. The exact active ensemble behavior must be verified against the current implementation and model artifacts.
9. Real-world clinical deployment requires additional validation, monitoring, security, privacy controls, and regulatory consideration.

---

## 41. Project Outcomes

HealthForecast AI demonstrates integration of:

- Artificial Intelligence
- Machine Learning
- Healthcare analytics
- React
- FastAPI
- REST APIs
- MongoDB
- JWT authentication
- RBAC
- Data validation
- Data preprocessing
- Feature engineering
- Random Forest
- XGBoost
- Probability-based classification
- Dashboard visualization
- PDF report generation
- Audit logging
- Error handling
- Full-stack application development

---

## 42. Quick Formula Reference

### BMI

\[
BMI=\frac{Weight_{kg}}{Height_m^2}
\]

### Standardization

\[
z=\frac{x-\mu}{\sigma}
\]

### Sigmoid

\[
\sigma(x)=\frac{1}{1+e^{-x}}
\]

### Readmission Probability

\[
P(Readmission=1\mid X)
\]

### Risk Percentage

\[
RiskPercentage=P(Readmission=1\mid X)\times100
\]

### Risk Classification

```text
p >= 0.65        → High
0.35 <= p < 0.65 → Medium
p < 0.35         → Low
```

### Accuracy

\[
Accuracy=\frac{TP+TN}{TP+TN+FP+FN}
\]

### Precision

\[
Precision=\frac{TP}{TP+FP}
\]

### Recall

\[
Recall=\frac{TP}{TP+FN}
\]

### F1

\[
F1=2\times\frac{Precision\times Recall}{Precision+Recall}
\]

### Specificity

\[
Specificity=\frac{TN}{TN+FP}
\]

### False Positive Rate

\[
FPR=\frac{FP}{FP+TN}
\]

### Processing Time

\[
ProcessTime_{ms}=(Time_{after}-Time_{before})\times1000
\]

---

## 43. Final Project Summary

```text
React + Vite
      ↓
FastAPI
      ↓
MongoDB
      ↓
Clinical Feature Engineering
      ↓
Random Forest + XGBoost
      ↓
Readmission Probability
      ↓
Low / Medium / High
      ↓
Prediction History
      ↓
PDF Report
```

### Current Role Separation

```text
Hospital Administrator
    → Manage Patients
    → View Predictions
    → Monitor Data

Doctor
    → View Patients
    → Enter Clinical Data
    → Generate AI Prediction
    → Save/View Prediction
    → Download PDF
    → Manage Treatment Plan

Healthcare Researcher
    → View Dashboard
    → View Existing Data
    → View Prediction History
    → Download Data/Reports
    → Research & Analysis

System Administrator
    → Manage Users
    → Manage Roles
    → Monitor System
    → Monitor Audit/Security Logs
```

This separation keeps **patient administration**, **clinical prediction**, and **research analysis** distinct while using the same healthcare data and AI platform.

---

## 44. License

If the project uses the MIT License:

```text
MIT License
```

See `LICENSE` for the complete license text.
