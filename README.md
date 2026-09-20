# HealthForecast AI

## Hospital Readmission Prediction & Patient Risk Intelligence System
Live Demo: https://health-forecast-ai-fdxg.vercel.app/

HealthForecast AI is an AI-powered healthcare analytics platform designed to predict hospital readmission risk, identify high-risk patients, support treatment and follow-up workflows, and provide healthcare analytics and reporting.

## Key Features

- Patient management
- JWT authentication and Role-Based Access Control (RBAC)
- Hospital readmission prediction
- Patient risk scoring: Low / Medium / High
- Treatment and follow-up management
- Clinical outcome analysis
- Hospital and department analytics
- Population health analytics
- Readmission analytics
- Healthcare research dashboard
- Patient outcome and operational reports
- PDF report generation
- Analytics export
- Dataset management
- Audit logging
- Docker and Docker Compose deployment

## User Roles

### Doctor
- Manage assigned patients
- Predict patient risk
- View readmission information
- Manage treatment and follow-ups
- Generate patient outcome reports

### Hospital Administrator
- View hospital patients
- Monitor hospital analytics
- View readmission statistics
- Analyze department performance
- Generate reports
- Export analytics

### Healthcare Researcher
- Access research analytics
- View population health statistics
- Analyze readmission trends
- View clinical outcomes
- Access research dataset information
- Export research data

### System Administrator
- Manage users and roles
- Manage datasets and system settings
- View audit logs
- Access system-wide analytics

## Dataset

**Diabetes 130-US Hospitals Dataset**

- Records: 101,766
- Features: approximately 50
- Target: readmitted
- Source: UCI Machine Learning Repository

The dataset is used for readmission prediction and healthcare analytics.

## Machine Learning

The system uses a **Random Forest Classifier** for readmission risk prediction.

Selected features include:
id, race, gender, age,
admission_type_id,
discharge_disposition_id,
admission_source_id,
time_in_hospital,
num_lab_procedures,
num_procedures,
num_medications,
number_outpatient,
number_emergency,
number_inpatient,
number_diagnoses,
max_glu_serum,
a1cresult,
insulin,
change,
diabetesmed

## Technology Stack

**Frontend**
* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts

**Backend**
* Python
* FastAPI
* Uvicorn
* PyMongo
* JWT
* bcrypt

**Machine Learning**
* Scikit-learn
* Random Forest
* Pandas
* NumPy
* Joblib

**Database**
* MongoDB Atlas

**Reporting**
* ReportLab

**Deployment**
* Docker
* Docker Compose

## Project Structure

health forecast/
├── backend/
│   ├── database/
│   ├── ml/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── Dockerfile
│   ├── main.py
│   ├── shared.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yaml
├── .dockerignore
├── .gitignore
└── README.md

## Running with Docker

Make sure Docker Desktop is running.

Application:

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:8000`
* API Documentation: `http://localhost:8000/docs`

## Security

* JWT-based authentication
* bcrypt password hashing
* Role-based access control
* Protected API endpoints
* Doctor-specific patient access
* Audit logging
* Environment-based secret management


## Disclaimer

HealthForecast AI is an academic/research project. Its predictions and analytics are not intended to replace professional medical diagnosis, treatment, or clinical judgment.
