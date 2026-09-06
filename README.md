# HealthForecast AI

**Hospital Readmission Prediction & Patient Risk Intelligence System**

An AI-powered healthcare analytics platform that predicts hospital readmissions, identifies high-risk patients, evaluates treatment effectiveness, and supports proactive patient care planning.

## Milestones Completed

### Milestone 1 (Week 1-2)
- Project initialization and architecture setup
- Authentication & Role-Based Access Control (RBAC)
- Patient management workflows
- Diabetes 130-US Hospitals dataset integration

### Milestone 2 (Week 3-4)
- Patient risk prediction model (Random Forest)
- Risk scoring and categorization (High / Medium / Low)
- Readmission forecasting workflows
- Risk Prediction dashboard (frontend)

### Milestone 3 (Week 5-6)
- Treatment Effectiveness Analysis (per-patient treatment tracking + outcomes)
- Clinical Decision Support (AI-generated care recommendations)
- Healthcare Analytics Dashboard (hospital-wide stats: total patients, high-risk count, readmission rate, diagnosis breakdown)

### Milestone 4 (Week 7-8) — In Progress
- Docker containerization
- Deployment

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | React 19, Vite, Tailwind CSS |
| Database | PostgreSQL |
| ML | scikit-learn (RandomForestClassifier) |
| Auth | JWT |
| Charts | Recharts |

## Quick Start

### Prerequisites
- Python 3.10 (venv)
- Node.js 20+
- PostgreSQL 17

### Backend

\`\`\`bash
cd backend
python -m venv venv
.\venv\Scripts\activate          # Windows
pip install -r requirements.txt
python create_tables.py          # create DB tables
python -m uvicorn main:app --reload
\`\`\`

Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend (new terminal)

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend runs at `http://localhost:5173`.

### Environment Variables

Create a `.env` file inside `backend/` with your PostgreSQL connection string and JWT secret key.

## Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Doctor | doctor@example.com | TestPass123 |
| Hospital Administrator | hospitaladmin@example.com | (set during signup) |
| Healthcare Researcher | researcher@example.com | (set during signup) |
| System Administrator | admin@example.com | (set during signup) |

## User Roles & Permissions

| Feature | Doctor | Hospital Admin | Researcher | System Admin |
|---|---|---|---|---|
| Patient Records | Assigned only | View only | Anonymized only | Full |
| Risk Predictions | Yes | Yes | Aggregated only | Yes |
| Treatment Effectiveness | Yes | Yes | Yes | Yes |
| Analytics Dashboard | Limited | Full | Aggregated only | Full |
| Research Dataset Export | No | No | Yes | Yes |
| Model Management | No | No | No | Yes |
| User Management | No | No | No | Yes |

## API Endpoints

### Authentication
- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login, returns JWT access token
- `GET /me` — Current logged-in user

### Patients
- `GET /patients/` — List patients (role-based visibility)
- `POST /patients/` — Create patient (Hospital Admin / System Admin only)

### Risk Prediction
- `POST /risk/predict` — Generate readmission risk score from clinical inputs

### Treatments
- `GET /treatments/` — List treatments
- `POST /treatments/` — Create a treatment record (Doctor / System Admin)
- `GET /treatments/effectiveness-summary` — Aggregate treatment outcome stats

### Clinical Decision Support
- `POST /decision-support/recommend` — Generate a care recommendation for a given risk category + diagnosis
- `GET /decision-support/patient-recommendations` — AI-generated recommendations for a sample of patients

### Analytics
- `GET /analytics/summary` — Hospital-wide stats: total patients, total treatments, high-risk patient count, readmission rate, treatment outcomes, diagnosis breakdown

### Model Management
- `GET /model/info` — Model type, training data, features used, performance metrics (System Admin only)

## Project Structure

\`\`\`
HealthForecast-AI/
├── backend/
│   ├── app/
│   │   ├── auth.py              # Signup / login / JWT
│   │   ├── security.py          # Password hashing, role checks
│   │   ├── models.py            # SQLAlchemy models (User, Patient, Treatment)
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── database.py          # DB connection/session setup
│   │   ├── patients.py          # Patient CRUD + role-based visibility
│   │   ├── risk.py              # Risk prediction endpoint
│   │   ├── treatments.py        # Treatment CRUD + effectiveness summary
│   │   ├── decision_support.py  # Care recommendation logic
│   │   ├── analytics.py         # Hospital-wide analytics summary
│   │   └── model_management.py  # Model metadata endpoint
│   ├── main.py                  # FastAPI app entrypoint
│   ├── create_tables.py         # DB table creation script
│   ├── train_model.py           # Model training script
│   ├── risk_model.pkl           # Trained model
│   ├── age_encoder.pkl          # Label encoder for age buckets
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/client.js        # Backend API calls
        ├── pages/                # Login, Dashboard, Patients, Risk Prediction,
        │                         # Care Recommendations, Reports
        └── components/           # Header, Sidebar, PatientModal
\`\`\`

## Dataset

Uses the **Diabetes 130-US Hospitals (1999–2008)** dataset (101,766 records) from the UCI Machine Learning Repository. Target variable: 30-day readmission (`readmitted == "<30"`, binary).

## Model Performance

| Metric | Value |
|---|---|
| Accuracy | 0.89 |
| Precision | 0.40 |
| Recall | 0.013 |
| F1-Score | 0.025 |
| ROC-AUC | 0.60 |

Risk categories are derived per-patient from treatment outcomes as a practical proxy where live clinical-feature scoring isn't available:
- **High**: at least one "Worsened" treatment outcome
- **Medium**: at least one "No Change" outcome, no "Worsened"
- **Low**: all treatment outcomes "Improved"
