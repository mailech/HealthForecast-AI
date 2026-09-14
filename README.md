HealthForecast AI

Hospital Readmission Prediction & Patient Risk Intelligence System

HealthForecast AI is a full-stack healthcare analytics platform that combines patient management, role-based access control, machine-learning-based readmission risk prediction, treatment-effectiveness analytics, clinical decision support, and healthcare reporting in one web application.

The system is designed as a decision-support and analytics platform, not as a replacement for professional medical judgment.

Project objectives

Manage patient records securely with role-based access.

Generate post-discharge/readmission risk predictions from a trained ML model.

Classify patients into project-defined High, Moderate, and Low risk bands.

Provide aggregate hospital analytics and treatment outcome analysis.

Provide privacy-aware research access using anonymized/aggregate data.

Produce downloadable healthcare reports.

Demonstrate an end-to-end production deployment using Docker and cloud services.

Core modules

Module

Purpose

Authentication & RBAC

JWT-based authentication and role-specific access control

Patient Management

Patient records, medical history, treatments and admissions

Readmission Prediction

Probability, threshold, class, risk level and interpretation

Clinical Decision Support

Presents model-generated risk insights and suggested follow-up actions

Healthcare Analytics

Population, risk, assessment and treatment analytics

Treatment Effectiveness

Outcome classification, treatment performance and medication outcomes

Reports

Patient population, readmission risk and healthcare analytics reports

Research Workspace

Anonymized patient information and aggregate analytics

User roles

Doctor

Access assigned patients.

View patient information and clinical history.

Generate readmission predictions.

Use clinical decision-support insights.

Create patient, medical-history and treatment records.

Hospital Admin

View hospital-wide analytics.

Review readmission and treatment statistics.

Access reports.

No clinical-record/model modification privileges.

Healthcare Researcher

Access anonymized research records and aggregate analytics.

Analyze population-level patterns and treatment outcomes.

No personally identifiable patient access.

System Admin

Full platform administration.

Patient, user, analytics and model-management access.

ML pipeline

The readmission model uses the Diabetes 130-US Hospitals dataset.

Dataset:

101,766 records

50 original columns

Target: readmitted

Application target mapping:

NO → 0

<30 and >30 → 1

The final application model is a binary classifier for whether a patient is predicted to be readmitted.

Final model

HistGradientBoosting from scikit-learn.

Final evaluation:

Accuracy: ~64.7%

Macro F1: ~64.3%

Weighted F1: ~64.3%

ROC-AUC: ~70.8%

Optimized decision threshold: 0.48

Readmitted-class recall after threshold optimization: ~58.7%

Readmitted-class F1 after threshold optimization: ~60.5%

The threshold was optimized to improve identification of the positive/readmission class rather than relying only on the default 0.50 cutoff.

Important: the model includes discharge-time information such as discharge_disposition_id. Therefore, the application should be described as supporting post-discharge/discharge-time readmission risk assessment, not admission-time forecasting.

Technology stack

Layer

Technology

Why it was selected

Frontend

React + Vite

Component-based UI, fast development and build workflow

Styling

Tailwind CSS

Consistent responsive design without maintaining a large custom CSS layer

Backend

Python + FastAPI

Fast REST API development, validation and automatic OpenAPI/Swagger documentation

ORM

SQLAlchemy

Structured Python database access and model relationships

Database

PostgreSQL

Reliable relational storage for patient, user, treatment and assessment data

Authentication

JWT

Stateless API authentication and easy role-aware authorization

ML

scikit-learn

Mature tabular ML ecosystem and reproducible preprocessing/model pipeline

Model

HistGradientBoosting

Strong fit for structured/tabular data and good validation performance

Data processing

Pandas + NumPy

Data cleaning, transformation and numerical processing

Model persistence

Joblib

Simple persistence of the trained model bundle

Containers

Docker + Docker Compose

Reproducible local/runtime environments

Cloud

Render

Practical deployment of frontend, backend and managed PostgreSQL for this project

Version control

Git + GitHub

Source control, branching and deployment integration

IDE

VS Code

Integrated development, debugging and terminal workflow

No dedicated chart library is required for the final dashboard; several analytics visuals are implemented directly with React/Tailwind UI components.

Why these technologies instead of alternatives?

Backend

Alternatives: Flask, Django.
FastAPI was preferred because the project is API-first, needs typed request/response validation, and benefits from automatic Swagger/OpenAPI documentation. Django would provide a much larger framework and admin ecosystem than required; Flask is lightweight but would require more manual API structure.

Frontend

Alternatives: Next.js, Angular, Vue, plain HTML/CSS/JS.
React was preferred for reusable dashboard components and role-specific page composition. Vite provides a fast development/build experience for a client-side SPA. Next.js would be a strong choice for SSR/SEO-heavy applications, but those were not primary requirements here.

Database

Alternatives: MongoDB, MySQL, SQLite.
PostgreSQL was preferred because the domain contains strongly related entities: users, patients, assessments, treatments, admissions and histories. A relational schema provides clear foreign keys and transactional consistency. SQLite was useful for early local development but was not ideal as the production shared database. MongoDB would offer flexible documents but was unnecessary for these structured relationships.

ML

Alternatives: XGBoost, Random Forest, Logistic Regression, TensorFlow.
The problem is structured/tabular classification rather than image, speech or deep-learning workloads. scikit-learn provided a compact and reproducible pipeline. HistGradientBoosting was selected based on validation performance and suitability for tabular data. XGBoost and Random Forest remain viable alternatives for future benchmarking.

Authentication

Alternatives: server sessions, OAuth2/OpenID Connect, third-party identity providers.
JWT was chosen for a straightforward stateless REST API and role-aware access control. For a large enterprise healthcare deployment, OAuth2/OIDC with an enterprise identity provider would be a stronger next step.

Deployment

Alternatives: AWS, Azure, GCP, Railway, Fly.io, self-managed VPS.
Render was selected because it provides a simple path to deploy the React frontend, FastAPI backend and managed PostgreSQL without requiring a large cloud-infrastructure configuration. AWS/Azure would be stronger candidates for enterprise-scale healthcare infrastructure.

System flow

User opens the React frontend.

User selects a workspace and authenticates.

FastAPI validates credentials and issues a JWT.

The frontend stores the authenticated session information.

Role-aware routing controls accessible pages.

Authorized API calls reach FastAPI.

FastAPI reads/writes PostgreSQL through SQLAlchemy.

For prediction, clinical assessment data is transformed into the model feature schema.

The persisted ML bundle generates probability and class output.

The API converts the output into risk level, interpretation and suggested action.

Analytics endpoints aggregate risk, outcome and treatment information.

React renders dashboards and reports.

Privacy and safety

Researchers use anonymized/aggregate endpoints rather than identifiable patient endpoints.

Doctors are restricted to assigned patients.

Hospital administrators receive analytics/reporting access rather than clinical-record modification.

System administrators have broader administrative access.

Risk labels are model outputs intended to support review, not diagnoses.

Treatment effectiveness is a project-defined outcome classification and should not be interpreted as causal clinical efficacy.

The demonstration uses seeded/demo data and should not be treated as a production clinical record system.

Major challenges and solutions

Challenge

Solution

Local vs production API URL

Moved frontend API configuration to VITE_API_BASE_URL; corrected login to use the environment-based endpoint

CORS confusion during deployment

Identified the root cause as a hardcoded localhost login endpoint rather than immediately changing backend CORS settings

SQLite to production database

Migrated the deployed backend to managed PostgreSQL

Docker model path

Corrected the container model location to match the prediction service path

Empty container database

Connected production runtime to PostgreSQL instead of relying on a fresh SQLite container

Passlib/bcrypt compatibility

Pinned bcrypt==4.0.1 to maintain compatibility

Missing ML runtime dependency

Added required dependencies such as pandas to the backend environment

Role leakage

Implemented backend authorization as the source of truth and added role mismatch protection at login

Research privacy

Added a dedicated anonymized researcher endpoint and restricted identifiable patient/prediction access

Analytics regression

Restored the Analytics page and revalidated the production build

Seed-data duplicates/placeholders

Added cleanup-aware seeding and final named demo records

Patient numbering

Kept database IDs for API correctness while presenting sequential patient numbers in the UI

Model threshold

Optimized the decision threshold to improve positive/readmission recall and F1

Testing and validation

Automated ML tests

The prediction service test suite completed successfully:

10 passed

API validation

The deployed FastAPI service was validated through Swagger/OpenAPI endpoints including:

Authentication

Patient access

Readmission prediction

Prediction analytics

Treatment effectiveness

Research anonymization

End-to-end validation

The deployed application was tested for:

Login/logout

Role-specific navigation

Dashboard loading

Patient access rules

Analytics

Reports

Clinical decision support

Production API connectivity

PostgreSQL-backed data retrieval

Deployment

Production architecture

React + Vite + Tailwind
        |
        v
Render Static Site
        |
        | HTTPS REST API
        v
FastAPI Backend
        |
        +------ SQLAlchemy ------> Render PostgreSQL
        |
        +------ ML Bundle -------> HistGradientBoosting

Docker is used for reproducible runtime environments and the project includes Docker Compose for local multi-service development.

Environment configuration

Frontend production variable:

VITE_API_BASE_URL=https://healthforecast-backend.onrender.com

Secrets and database credentials should be supplied through deployment environment variables rather than committed to Git.

Current demonstration data

The production demonstration database contains:

19 patients

19 clinical assessments

19 AI-scored patients

33 treatment records

19 medical histories

19 admissions

Current production analytics observed during final validation:

Average readmission probability: 57.4%

High risk: 11

Moderate risk: 2

Low risk: 6

Predicted readmitted: 11

Predicted not readmitted: 8

Treatment effectiveness rate: 75.0%

Average treatment duration: 61.3 days

These values describe the seeded demonstration dataset, not real-world clinical prevalence.

Project milestones

Milestone 1 — Foundation

Architecture and database setup

Authentication

RBAC

Patient management

Dashboard

Dataset integration and preprocessing

Milestone 2 — AI Risk Intelligence

Readmission prediction model

Risk scoring

Prediction API

Clinical insights

Real-time scoring workflow

Milestone 3 — Treatment & Analytics

Treatment effectiveness

Medication outcome analysis

Healthcare analytics

Performance reporting

Trend/aggregate monitoring

Milestone 4 — Validation & Deployment

Automated model testing

API/end-to-end validation

Docker

PostgreSQL cloud deployment

Frontend/backend deployment

Documentation and presentation

Limitations

The readmission model is trained on a diabetes-focused hospital dataset and may not generalize to every hospital or patient population.

Some application-level model features are defaulted when the patient-management database does not contain the original dataset field.

Because discharge-time features are used, the current system is not an admission-time prediction system.

Treatment effectiveness is based on recorded/project-defined outcome categories rather than causal inference.

The system is a prototype/academic decision-support platform and requires external clinical, privacy, security and regulatory validation before real clinical deployment.

Production healthcare systems would require stronger identity management, audit controls, encryption/key management, observability, backup/recovery and compliance processes.

Future enhancements

OAuth2/OIDC and enterprise identity management

Full audit logging and security monitoring

Feature-level explainability with SHAP

Time-aware/readmission history features

Hospital-specific model calibration

Model registry and controlled model deployment

Automated retraining and drift monitoring

More granular clinical input forms

Real-time notification workflows

Cloud-native scaling and managed observability

Stronger privacy controls and healthcare compliance validation

Repository and deployment

GitHub:
https://github.com/mailech/HealthForecast-AI

Frontend:
https://healthforecast-ai-tj73.onrender.com

Backend:
https://healthforecast-backend.onrender.com

Final note

HealthForecast AI demonstrates an end-to-end path from healthcare data preparation and machine learning to secure APIs, role-aware user experiences, analytics, reporting, containerization and cloud deployment.
