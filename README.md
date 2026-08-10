# HealthForecast AI

Hospital Readmission Prediction & Patient Risk Intelligence System.

## Stack

- **Backend**: FastAPI (Python), SQLAlchemy + Alembic, PostgreSQL, JWT auth
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **ML**: scikit-learn / XGBoost readmission risk model
- **Infra**: Docker Compose (backend, frontend, Postgres)

## Project layout

```
healthforecast-ai/
├── backend/
│   ├── app/
│   │   ├── core/         # config, security (JWT/bcrypt), RBAC
│   │   ├── db/           # session, seed script
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── api/routes/   # auth, users, patients, risk
│   │   ├── services/     # risk_prediction.py (model inference)
│   │   ├── ml/           # dataset loader + training script
│   │   └── main.py
│   ├── alembic/
│   └── requirements.txt
├── frontend/
│   ├── app/               # login, dashboard (Next.js App Router)
│   ├── components/        # Sidebar, StatCard, RiskIndicator
│   └── lib/                # api client, auth context
└── docker-compose.yml
```

## Running locally

```bash
# 1. Copy env file
cp backend/.env.example backend/.env

# 2. Start everything (Postgres + API + frontend)
docker compose up --build

# Backend:  http://localhost:8000/api/docs  (Swagger UI)
# Frontend: http://localhost:3000
```

The backend seed step creates a default System Administrator:
`admin@healthforecast.ai` / `ChangeMe123!` (change `SEED_ADMIN_PASSWORD` in
`.env` before any real deployment). Log in as admin, then use
`POST /api/v1/users` to create Doctor / Hospital Administrator / Researcher
accounts.

## Loading the training dataset

1. Download `diabetic_data.csv` from the
   [UCI Diabetes 130-US Hospitals dataset](https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008)
   (also mirrored on Kaggle).
2. From inside the backend container (or a local venv with `requirements.txt`
   installed):
   ```bash
   python -m app.ml.load_diabetes_dataset --csv diabetic_data.csv --limit 5000
   ```
3. Train the risk model:
   ```bash
   python -m app.ml.train_readmission_model
   ```
   This writes `app/ml/artifacts/readmission_xgb.joblib`, which
   `app/services/risk_prediction.py` picks up automatically on the next
   request — no code changes needed. Until this file exists, the API serves
   predictions from a documented heuristic so every endpoint stays testable.

## Roles & access control

Enforced server-side via `app/core/rbac.py` (`require_roles(...)` on every
route) — matches the Access Matrix in the project spec exactly:

| Role | Patient records | Risk predictions | User mgmt | Model mgmt |
|---|---|---|---|---|
| Doctor | Assigned only | Yes | No | No |
| Hospital Administrator | View only, all | Yes | No | No |
| Healthcare Researcher | Anonymized only | Aggregated only | No | No |
| System Administrator | Full | Full | Yes | Yes |

## Status / roadmap

Matches the spec's milestone structure:

- [x] **Milestone 1** — auth, RBAC, patient management, dashboard shell, dataset loader
- [ ] **Milestone 2** — train and validate the readmission model on the full dataset; wire prediction results into per-patient dashboard views
- [ ] **Milestone 3** — treatment effectiveness workflows, hospital-wide analytics dashboard, trend visualizations
- [ ] **Milestone 4** — testing, cloud deployment (AWS/Azure), final documentation & demo

## Notes on production-readiness

This scaffold is built to extend cleanly, not as a toy:
- Business rules (role scoping, anonymization) are enforced in the API layer, not just hidden in the UI
- The ML service has a stable interface so swapping the heuristic for a trained model requires zero changes above the service layer
- Alembic is wired in from day one instead of relying on `create_all` in anything but local dev
- Secrets are read from environment variables only — nothing hardcoded

Still needed before a real deployment: rate limiting, refresh-token rotation
endpoint, structured logging/monitoring, HTTPS termination, and a proper
CI pipeline (lint + tests + build) — good candidates for Milestone 4.
