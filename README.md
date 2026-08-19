# HealthForecast AI

**Hospital Readmission Prediction & Patient Risk Intelligence System**

An AI-powered healthcare analytics platform that predicts hospital readmissions, identifies high-risk patients, and supports proactive patient care planning.

## Milestones Completed

### Milestone 1 (Week 1-2)
- Project initialization and architecture setup
- Authentication & Role-Based Access Control (RBAC)
- Patient management workflows
- Healthcare dashboard
- Diabetes 130-US Hospitals dataset integration

### Milestone 2 (Week 3-4)
- Patient risk prediction models (Random Forest, XGBoost)
- Risk scoring and categorization (High/Medium/Low)
- Readmission forecasting workflows
- Forecasting report generation
- Clinical insights module

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| Frontend | React.js, Vite, Tailwind CSS |
| Database | PostgreSQL, MongoDB |
| ML | Scikit-learn, XGBoost, Pandas |
| Auth | JWT |
| Charts | Recharts |
| DevOps | Docker, Docker Compose |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OR: Python 3.11+, Node.js 20+, PostgreSQL

### Option 1: Docker (Recommended)

```bash
# Download dataset first
cd backend
pip install httpx
python download_dataset.py
cd ..

# Start all services
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
python download_dataset.py
python seed.py
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Doctor | doctor1 | doctor123 |
| Hospital Admin | admin1 | admin123 |
| Healthcare Researcher | researcher1 | research123 |
| System Administrator | sysadmin | sysadmin123 |

## User Roles & Permissions

| Feature | Doctor | Hospital Admin | Researcher | System Admin |
|---------|--------|----------------|------------|--------------|
| Patient Records | Assigned Only | View Only | Anonymized | Full |
| Risk Predictions | Yes | Yes | Aggregated | Yes |
| Readmission Forecasts | Yes | Yes | Aggregated | Yes |
| Clinical Insights | Yes | Yes | Yes | Yes |
| Model Management | No | No | No | Yes |
| User Management | No | No | No | Yes |

## API Endpoints

### Authentication
- `POST /api/auth/login/json` — Login
- `GET /api/auth/me` — Current user

### Patients
- `GET /api/patients/` — List patients
- `GET /api/patients/{id}` — Patient details
- `POST /api/patients/` — Create patient

### Predictions
- `POST /api/predictions/risk` — Generate risk score
- `POST /api/predictions/forecast` — Generate readmission forecast
- `GET /api/predictions/clinical-insights/{id}` — Clinical insights
- `GET /api/predictions/dashboard/stats` — Dashboard statistics
- `GET /api/predictions/models/metrics` — Model performance
- `POST /api/predictions/models/train` — Train ML models

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT & RBAC
│   │   ├── ml/            # ML models & clinical insights
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API routes
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── data/              # Dataset storage
│   ├── models/            # Trained ML models
│   ├── seed.py            # Database seeding
│   └── download_dataset.py
├── frontend/
│   └── src/
│       ├── components/    # Layout, shared UI
│       ├── pages/         # Dashboard, Patients, etc.
│       └── services/      # API client
└── docker-compose.yml
```

## Dataset

Uses the **Diabetes 130-US Hospitals for years 1999-2008** dataset from UCI ML Repository.
Target variable: 30-day readmission (`readmitted == "<30"`).

## Model Performance

Models are evaluated using:
- Accuracy, Precision, Recall, F1-Score, ROC-AUC

Risk categories:
- **High**: Risk score >= 70%
- **Medium**: Risk score 40-69%
- **Low**: Risk score < 40%
