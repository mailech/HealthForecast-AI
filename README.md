# 🏥 HealthForecast AI
## Hospital Readmission Prediction & Patient Risk Intelligence System

HealthForecast AI is an AI-powered healthcare analytics and decision-support platform designed to help healthcare organizations identify patients at higher risk of hospital readmission, analyze treatment outcomes, monitor healthcare trends, and support proactive patient care planning.

The platform combines **Machine Learning, Healthcare Analytics, Patient Management, Role-Based Access Control, Clinical Decision Support, Treatment Analytics, Privacy-Aware Research Access, and Cloud Deployment** into one integrated application.

> **Note:** HealthForecast AI is a project/academic decision-support system. It is not intended to replace professional medical judgment or provide autonomous medical decisions.

---

## 📌 Project Overview

Hospital readmission is an important healthcare challenge because repeated hospitalizations can increase healthcare costs, consume hospital resources, and indicate that additional follow-up or care coordination may be required.

Healthcare organizations collect large amounts of information such as:

- Patient demographics
- Medical history
- Diagnoses
- Treatments
- Admissions
- Clinical assessments
- Medication information
- Previous healthcare interactions

HealthForecast AI uses this information to provide a centralized platform where healthcare users can manage patient information, generate AI-based readmission risk predictions, analyze treatment outcomes, and view healthcare analytics.

The system is designed around the following workflow:

```text
Patient Data
     ↓
Clinical Assessment
     ↓
Machine Learning Model
     ↓
Readmission Probability
     ↓
Risk Classification
     ↓
Clinical Decision Support
     ↓
Healthcare Analytics & Reports
```

---

# 🎯 Project Objectives

The main objectives of HealthForecast AI are to:

- Build a secure healthcare application.
- Implement Role-Based Access Control.
- Manage patient information and clinical records.
- Store medical history, treatment and admission information.
- Develop a machine-learning-based readmission prediction system.
- Generate patient readmission probabilities.
- Classify patients into project-defined risk categories.
- Provide clinical decision-support information.
- Analyze treatment effectiveness.
- Analyze medication outcomes.
- Provide healthcare analytics dashboards.
- Provide anonymized data access for researchers.
- Generate downloadable healthcare reports.
- Containerize the application using Docker.
- Deploy the application to the cloud.
- Demonstrate an end-to-end AI-powered healthcare workflow.

---

# 💡 Project Use Case

HealthForecast AI provides different capabilities based on the user's role.

### 👨‍⚕️ Doctor

Doctors can:

- View assigned patients.
- Manage patient information.
- View medical history.
- View treatment and admission information.
- Generate readmission risk predictions.
- Review risk levels and probabilities.
- Access Clinical Decision Support.
- Review analytics and reports.

### 🏥 Hospital Admin

Hospital administrators can:

- View hospital-wide analytics.
- Monitor readmission statistics.
- Analyze risk distributions.
- Review treatment effectiveness.
- Analyze medication outcomes.
- Generate healthcare reports.

### 🔬 Healthcare Researcher

Researchers can:

- Access anonymized patient information.
- Analyze population-level healthcare data.
- Study treatment outcomes.
- Analyze healthcare trends.
- Work with aggregate analytics.

Researchers are restricted from identifiable patient workflows.

### ⚙️ System Admin

System administrators can manage broader platform functionality including:

- Users
- Roles
- Patients
- Analytics
- Reports
- AI/model-related administration
- System configuration

---

# 🔐 Role-Based Access Control

HealthForecast AI implements four application roles:

| Role | Main Access |
|---|---|
| Doctor | Assigned patients, clinical records, predictions, CDS |
| Hospital Admin | Hospital-wide analytics and reports |
| Healthcare Researcher | Anonymized and aggregate research data |
| System Admin | Broad platform administration |

Authorization is enforced on the backend rather than relying only on frontend restrictions.

---

# 🚀 Core Features

## 1. Authentication & Security

- JWT-based authentication
- Password hashing
- Role-Based Access Control
- Protected API routes
- Role-aware frontend routing
- Role mismatch protection
- Environment-based API configuration

---

## 2. Patient Management

Doctors and authorized administrators can work with patient records including:

- Patient information
- Date of birth
- Gender
- Contact information
- Blood group
- Assigned doctor
- Medical history
- Treatments
- Admissions
- Clinical assessments

---

## 3. AI Readmission Prediction

The platform uses a trained machine learning model to generate:

- Readmission probability
- Predicted outcome
- Risk level
- Model interpretation
- Recommended follow-up action

---

## 4. Clinical Decision Support

The Clinical Decision Support module presents model results in a more understandable format.

It provides:

- Patient risk
- Readmission probability
- Risk category
- Interpretation
- Suggested follow-up action

The purpose is to support clinical review rather than replace healthcare professionals.

---

## 5. Healthcare Analytics

The analytics dashboard provides aggregate information such as:

- Total patients
- Assessed patients
- AI-scored patients
- Average readmission probability
- Risk distribution
- Predicted outcomes
- Treatment effectiveness
- Medication outcomes
- Average treatment duration

---

## 6. Treatment Analytics

The platform analyzes recorded treatment outcomes using project-defined categories:

- Favorable
- Unfavorable
- Ongoing
- Not Recorded

It provides:

- Total treatments
- Treatment effectiveness rate
- Average treatment duration
- Treatment-level performance
- Medication outcome analytics

---

## 7. Privacy-Aware Research Access

Researchers use a dedicated anonymized workflow.

The research interface focuses on:

- Anonymized records
- Aggregate statistics
- Population-level trends
- Treatment analysis

Identifiable patient information is restricted from the researcher workflow.

---

## 8. Reports

The platform provides downloadable reports including:

### Patient Population Report

Provides:

- Total patients
- Assessed patients
- AI-scored patients
- Assessment coverage
- AI scoring coverage
- Model information

### Readmission Risk Report

Provides:

- Average readmission probability
- Risk distribution
- Predicted outcomes
- Decision threshold
- Model information

### Healthcare Analytics Report

Combines:

- Patient analytics
- Readmission analytics
- Treatment analytics
- Treatment performance
- Medication outcomes

---

# 🤖 Machine Learning

## Dataset

The project uses the **Diabetes 130-US Hospitals Dataset**.

Dataset size:

- **101,766 records**
- **50 original columns**

The original target variable contains:

```text
NO
<30
>30
```

For the application, it was converted into a binary classification problem:

```text
NO   → 0
<30  → 1
>30  → 1
```

Therefore:

- `0` = Not Readmitted
- `1` = Readmitted

### Original Target Distribution

| Target | Records | Percentage |
|---|---:|---:|
| NO | 54,864 | 53.91% |
| >30 | 35,545 | 34.93% |
| <30 | 11,357 | 11.16% |

### Binary Target Distribution

| Class | Records | Percentage |
|---|---:|---:|
| Not Readmitted | 54,864 | 53.91% |
| Readmitted | 46,902 | 46.09% |

---

# 🧹 Data Processing

The ML pipeline includes:

- Data loading
- Missing-value analysis
- Data cleaning
- Feature preparation
- Categorical feature processing
- Numerical feature processing
- Target transformation
- Train/validation/test split
- Model training
- Model evaluation
- Decision threshold optimization
- Final model serialization

The preprocessing pipeline and trained model are stored together so the same processing logic can be reused during prediction.

---

# 🧠 Machine Learning Model

The final application model uses:

## HistGradientBoosting

HistGradientBoosting was selected because the problem is based on structured/tabular healthcare data and the model provided a good balance between performance, complexity and maintainability.

Other models considered as alternatives include:

- Logistic Regression
- Random Forest
- XGBoost
- Neural Networks

The final model was selected based on validation performance.

---

# 📊 Model Performance

Final model performance:

| Metric | Result |
|---|---:|
| Accuracy | ~64.7% |
| Macro F1 | ~64.3% |
| Weighted F1 | ~64.3% |
| ROC-AUC | ~70.8% |
| Readmitted Recall | ~58.7% |
| Readmitted F1 | ~60.5% |
| Decision Threshold | 0.48 |

The decision threshold was optimized instead of relying only on the default `0.50` threshold.

---

# ⚠️ Important ML Consideration

The current feature set includes discharge-time information such as:

```text
discharge_disposition_id
```

Therefore, the current model should be described as supporting **post-discharge/discharge-time readmission risk assessment**, rather than purely admission-time forecasting.

This limitation is important when interpreting the model.

---

# 📈 Risk Classification

The application converts prediction probabilities into project-defined risk bands.

```text
Probability >= 0.48
        ↓
High Risk

Probability >= 0.30
        ↓
Moderate Risk

Probability < 0.30
        ↓
Low Risk
```

These thresholds are application/model design choices and should not be interpreted as universal clinical thresholds.

---

# 🏗️ System Architecture

```text
                    HEALTHFORECAST AI
                           |
                           ↓
                 React + Vite Frontend
                           |
                           ↓
                   FastAPI Backend
                           |
          +----------------+----------------+
          |                |                |
          ↓                ↓                ↓
     PostgreSQL       ML Prediction     Analytics
          |                |                |
          |                ↓                |
          |       HistGradientBoosting      |
          |                |                |
          +----------------+----------------+
                           |
                           ↓
              Clinical Decision Support
                           |
                           ↓
                  Reports & Dashboards
```

---

# 🔄 Application Workflow

```text
User
 ↓
Login
 ↓
JWT Authentication
 ↓
Role Verification
 ↓
Role-Based Dashboard
 ↓
Patient / Analytics Workflow
 ↓
Clinical Assessment
 ↓
ML Prediction
 ↓
Readmission Probability
 ↓
Risk Classification
 ↓
Clinical Decision Support
 ↓
Analytics & Reports
```

---

# 🗄️ Database Architecture

The production application uses PostgreSQL.

The major entities are:

```text
User
 |
 +---- Patient
          |
          +---- Medical History
          |
          +---- Treatment
          |
          +---- Admission
          |
          +---- Clinical Assessment
```

SQLAlchemy is used as the ORM layer between the FastAPI backend and PostgreSQL.

---

# 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Python |
| API Framework | FastAPI |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Authentication | JWT |
| Machine Learning | scikit-learn |
| ML Model | HistGradientBoosting |
| Data Processing | Pandas |
| Numerical Computing | NumPy |
| Model Storage | Joblib |
| Containerization | Docker |
| Multi-Service Development | Docker Compose |
| Cloud Platform | Render |
| Version Control | Git |
| Repository | GitHub |
| API Testing/Documentation | FastAPI Swagger/OpenAPI |

---

# 🤔 Why These Technologies?

## React + Vite

React provides a component-based architecture suitable for dashboards and role-specific interfaces.

Vite provides a fast and lightweight development and build environment.

### Alternatives

- Next.js
- Angular
- Vue

React + Vite was preferred because this project primarily requires an interactive dashboard application rather than server-side rendering.

---

## FastAPI

FastAPI was selected because:

- The backend is API-focused.
- It integrates naturally with Python ML libraries.
- It provides automatic Swagger/OpenAPI documentation.
- It supports request validation.
- It provides clean dependency injection.
- It works well with JWT authentication.

### Alternatives

- Flask
- Django

Flask is lightweight but requires more manual API structure.

Django provides a larger ecosystem and built-in features, but FastAPI was a better fit for this ML/API-focused project.

---

## PostgreSQL

PostgreSQL was selected because the application contains strongly related entities such as patients, treatments, admissions and medical histories.

### Alternatives

- SQLite
- MySQL
- MongoDB

SQLite was useful for local development but PostgreSQL was more suitable for the production environment.

MongoDB would provide flexible document storage, but the relational structure of the healthcare records made PostgreSQL a better fit.

---

## scikit-learn

scikit-learn was selected because the project uses structured/tabular data.

It provides:

- Preprocessing
- Classification algorithms
- Model evaluation
- Pipelines
- Cross-validation
- Model persistence support

### Alternatives

- XGBoost
- LightGBM
- TensorFlow
- PyTorch

Deep learning frameworks were not necessary for the current tabular classification problem.

---

## Docker

Docker provides reproducible application environments and makes local and cloud deployment easier.

The project includes Docker support for the frontend and backend.

---

## Render

Render was selected because it provides a straightforward deployment workflow for:

- React frontend
- FastAPI backend
- PostgreSQL

### Alternatives

- AWS
- Microsoft Azure
- Google Cloud
- Railway
- Fly.io

AWS and Azure would be stronger choices for large enterprise healthcare infrastructure, while Render provided a simpler and practical deployment platform for this project.

---

# 🔐 Security

Security features implemented include:

- JWT authentication
- Password hashing
- Role-Based Access Control
- Protected backend endpoints
- Role-aware frontend routing
- Role mismatch protection
- Environment variables for configuration
- Restricted researcher access to anonymized data

The backend remains the primary authorization layer.

---

# 🔬 Research Privacy

Healthcare information may contain sensitive personal information.

HealthForecast AI separates researcher access from identifiable patient workflows.

Researchers receive anonymized/aggregate information rather than direct access to identifiable patient records.

This demonstrates the principle of:

```text
Useful Healthcare Analytics
          +
Reduced PII Exposure
          =
Privacy-Aware Research
```

---

# 📦 Docker Architecture

The project supports containerized deployment.

```text
Docker Compose
      |
      +-------------------+
      |                   |
      ↓                   ↓
Frontend Container   Backend Container
      |                   |
      ↓                   ↓
React/Vite             FastAPI
                          |
                          ↓
                     ML Model
```

The production backend uses PostgreSQL for persistent database storage.

---

# ☁️ Cloud Deployment

The production architecture is:

```text
React Frontend
      ↓
Render Static Site
      ↓
FastAPI Backend
      ↓
Render Web Service
      ↓
PostgreSQL
```

The ML model is included with the backend deployment.

---

# 📊 Production Demonstration

The current production demonstration database contains:

| Data | Count |
|---|---:|
| Patients | 19 |
| Clinical Assessments | 19 |
| AI-Scored Patients | 19 |
| Treatments | 33 |
| Medical Histories | 19 |
| Admissions | 19 |

Current demonstration analytics:

| Metric | Value |
|---|---:|
| Average Readmission Probability | 57.4% |
| High Risk | 11 |
| Moderate Risk | 2 |
| Low Risk | 6 |
| Predicted Readmitted | 11 |
| Predicted Not Readmitted | 8 |
| Treatment Effectiveness | 75.0% |
| Average Treatment Duration | 61.3 days |

> These values are based on seeded demonstration data and do not represent real-world hospital statistics or clinical prevalence.

---

# 🧪 Testing & Validation

Testing was performed at multiple levels.

## Machine Learning Tests

The automated prediction-service test suite completed successfully:

```text
10 passed
```

The tests cover important prediction-service functionality such as:

- Model loading
- Prediction generation
- Probability handling
- Threshold behavior
- Risk classification
- Prediction output structure

## API Testing

The backend was tested using FastAPI Swagger/OpenAPI.

Validated areas include:

- Authentication
- Protected routes
- Patient access
- Patient APIs
- Prediction APIs
- Prediction analytics
- Treatment analytics
- Research anonymization

## End-to-End Testing

The deployed application was tested for:

- Login
- Logout
- Role selection
- Role mismatch handling
- Role-specific navigation
- Dashboard
- Patients
- Analytics
- Clinical Decision Support
- Reports
- Production API connectivity
- PostgreSQL-backed data

---

# 🧩 Major Challenges & Solutions

## 1. Localhost API in Production

### Problem

The deployed frontend initially attempted to communicate with the local backend:

```text
http://127.0.0.1:8000
```

### Solution

The API URL was moved to:

```text
VITE_API_BASE_URL
```

This allows different API endpoints for local and production environments.

---

## 2. SQLite to PostgreSQL

### Problem

SQLite was suitable for local development but was not ideal for persistent production storage.

### Solution

The production environment was migrated to PostgreSQL.

---

## 3. Docker ML Model Path

### Problem

The ML model path inside Docker differed from the local development environment.

### Solution

The Docker configuration was updated so that the ML model is available at the correct runtime path.

---

## 4. Dependency Compatibility

### Problem

A bcrypt/password-hashing compatibility issue occurred during deployment.

### Solution

The compatible bcrypt version was pinned to ensure stable authentication behavior.

---

## 5. Role-Based Security

### Problem

Different users require different levels of access.

### Solution

Authorization was implemented at the backend level, with additional role-aware navigation in the frontend.

---

## 6. Research Privacy

### Problem

Researchers require healthcare information without unnecessary exposure of personally identifiable information.

### Solution

A dedicated anonymized research endpoint was implemented.

---

## 7. ML Decision Threshold

### Problem

The default probability threshold did not provide the desired balance for identifying readmission cases.

### Solution

Threshold optimization was performed and the final application uses a threshold of `0.48`.

---

## 8. Production Configuration

### Problem

Local development and cloud deployment use different service URLs and environments.

### Solution

Environment-based configuration was introduced so the same application code can work in both environments.

---

# 📋 Project Milestones

## Milestone 1 — Foundation

Completed:

- Project setup
- Database
- Authentication
- JWT
- RBAC
- Patient management
- Medical history
- Treatment management
- Admission management
- Dashboard
- Healthcare analytics foundation
- Dataset preparation

## Milestone 2 — AI Risk Intelligence

Completed:

- Readmission prediction
- Risk scoring
- Probability generation
- Decision threshold optimization
- Prediction API
- Risk classification
- Clinical insights
- Clinical Decision Support
- Risk analytics

## Milestone 3 — Treatment & Analytics

Completed:

- Treatment effectiveness
- Medication outcomes
- Healthcare analytics
- Treatment performance
- Reports
- Aggregate analytics

## Milestone 4 — Validation & Deployment

Completed:

- ML testing
- API validation
- End-to-end testing
- Dockerization
- PostgreSQL production database
- Cloud backend
- Cloud frontend
- Production configuration
- Documentation
- Presentation

---

# 🔮 Future Enhancements

HealthForecast AI provides a foundation that can be extended into a more advanced healthcare AI platform.

Potential future improvements include:

### 🤖 Explainable AI

Integrate SHAP or similar explainability techniques to show the major factors contributing to an individual prediction.

### 📈 Model Monitoring

Add monitoring for:

- Data drift
- Prediction drift
- Model performance
- Data quality

### 🔄 Automated Model Retraining

Create an automated pipeline that retrains the model when sufficient validated data becomes available.

### 🧠 Model Registry

Maintain multiple model versions with:

- Version number
- Training dataset
- Metrics
- Threshold
- Training date
- Deployment status

### 🏥 Hospital-Specific Calibration

Allow models or calibration layers to adapt to different hospitals and patient populations.

### 📅 Temporal Risk Prediction

Use patient history over time rather than relying primarily on static features.

### 🚨 Real-Time Risk Alerts

Notify healthcare professionals when a patient's risk changes significantly.

### 📞 Follow-Up Planning

Extend Clinical Decision Support into a complete follow-up workflow with appointments, reminders and care coordination.

### 🔗 EHR/FHIR Integration

Integrate with Electronic Health Record systems using healthcare interoperability standards such as FHIR.

### 🔐 Advanced Privacy

Future versions could include:

- Data masking
- Pseudonymization
- Field-level access control
- Consent management
- Data retention policies

### 📝 Advanced Audit Logging

Track:

- User
- Action
- Resource
- Timestamp
- Result

for stronger accountability.

### ⚖️ Fairness & Bias Monitoring

Evaluate model performance across appropriate demographic groups to identify potential differences in model behavior.

### 📊 Advanced Analytics

Future dashboards could include:

- Department-level analytics
- Monthly trends
- Cohort analysis
- Length-of-stay analytics
- Risk trends
- Resource utilization

### 📄 Advanced Reporting

Support:

- PDF reports
- Excel reports
- Scheduled reports
- Email reports
- Custom date ranges
- Custom filters

### ☁️ Enterprise Cloud Scaling

Future deployments could introduce:

- Load balancing
- Horizontal scaling
- Cloud monitoring
- Managed caching
- Background job processing
- Kubernetes
- Disaster recovery

### 📱 Mobile Application

A mobile application could provide doctors and care teams with:

- Risk alerts
- Patient summaries
- Follow-up reminders
- Quick analytics

---

# ⚠️ Limitations

The current project has several limitations:

1. The model is trained using the Diabetes 130-US Hospitals dataset and may not generalize to every hospital or patient population.

2. The current feature set includes discharge-time information, so the model should not be presented as purely admission-time forecasting.

3. Treatment effectiveness is a project-defined analytics metric and does not establish causal treatment effectiveness.

4. The current system is a project/academic prototype and requires further clinical validation before real-world clinical deployment.

5. Real healthcare deployment would require additional security, privacy, compliance, regulatory and clinical validation.

---

# 🌱 Responsible AI

HealthForecast AI follows the principle that AI should **support healthcare professionals rather than replace them**.

The system emphasizes:

- Human oversight
- Privacy-aware access
- Role-based authorization
- Transparent model limitations
- Responsible interpretation of predictions
- Anonymized research access
- No autonomous clinical decision-making

The intended workflow is:

```text
AI Prediction
     +
Healthcare Professional Review
     ↓
Better-Informed Decision Support
```

not:

```text
AI Prediction
     ↓
Automatic Medical Decision
```

---

# 📁 Project Structure

```text
HealthForecast-AI/
│
├── backend/
│   ├── app/
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── settings.py
│   │   └── test_prediction_service.py
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── ml/
│   ├── data/
│   ├── models/
│   └── preprocessing/
│
├── docker-compose.yml
└── README.md
```

---

# 🌐 Live Application

### Frontend

https://healthforecast-ai-tj73.onrender.com

### Backend

https://healthforecast-backend.onrender.com

### API Documentation

https://healthforecast-backend.onrender.com/docs

### GitHub Repository

https://github.com/mailech/HealthForecast-AI

---

# 🏆 Project Highlights

### Artificial Intelligence
- Real healthcare dataset
- Binary readmission classification
- HistGradientBoosting
- Optimized decision threshold
- Patient risk classification

### Full Stack
- React frontend
- FastAPI backend
- PostgreSQL database
- REST APIs
- Role-based dashboards

### Healthcare Analytics
- Readmission analytics
- Treatment effectiveness
- Medication outcomes
- Healthcare reports
- Research analytics

### Security & Privacy
- JWT authentication
- RBAC
- Protected APIs
- Anonymized researcher access
- Privacy-aware analytics

### Deployment
- Docker
- Docker Compose
- Render
- PostgreSQL
- Production frontend and backend

### Testing
- ML automated tests
- API validation
- Role validation
- End-to-end testing
- Production testing

---

# 🎓 What This Project Demonstrates

HealthForecast AI demonstrates the integration of multiple software engineering and AI concepts into a single real-world project:

- Machine Learning
- Data Preprocessing
- Model Evaluation
- Full-Stack Development
- REST API Development
- Database Design
- Authentication
- Authorization
- Role-Based Access Control
- Healthcare Analytics
- Privacy-Aware Data Access
- Clinical Decision Support
- Docker
- Cloud Deployment
- Testing
- Responsible AI

Rather than building only a machine learning model, the project demonstrates how an ML model can be integrated into a complete production-style software application.

---

# 🚀 Conclusion

HealthForecast AI provides an end-to-end foundation for AI-powered healthcare analytics and patient risk intelligence.

The platform connects:

```text
Healthcare Data
      ↓
Data Processing
      ↓
Machine Learning
      ↓
Readmission Prediction
      ↓
Risk Intelligence
      ↓
Clinical Decision Support
      ↓
Healthcare Analytics
      ↓
Reports
      ↓
Cloud Deployment
```

The current implementation provides a strong foundation that can be further enhanced with explainable AI, model monitoring, automated retraining, hospital-specific calibration, EHR/FHIR integration, real-time alerts, fairness monitoring and enterprise healthcare infrastructure.

---

## 📌 Final Note

HealthForecast AI is a demonstration and academic/project implementation.

It is **not a medical diagnosis system** and should not be used as a substitute for professional clinical judgment.

The production statistics shown in this README are based on seeded demonstration data and should not be interpreted as real-world clinical statistics.

Before real-world healthcare deployment, the system would require appropriate clinical validation, security assessment, privacy controls, regulatory review, fairness evaluation and model validation.

---

## 🛠️ Built With

**React • Vite • Tailwind CSS • FastAPI • Python • SQLAlchemy • PostgreSQL • scikit-learn • Pandas • NumPy • Joblib • Docker • Render • Git • GitHub**
