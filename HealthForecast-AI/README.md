# HealthForecast AI — Final Simple Project

AI-powered hospital readmission prediction and patient risk intelligence platform using the Diabetes 130-US Hospitals dataset.

## Python
Python 3.14.x only.

## Roles
- System Administrator — user/role management, dataset management, audit logs, and system settings.
- Hospital Administrator — hospital dashboard, patient outcomes, readmission forecasts, treatment effectiveness, hospital analytics/export, operational support.
- Doctor — assigned patient records, risk prediction, readmission forecasting, treatment effectiveness, reports, clinical decision support.
- Healthcare Researcher — anonymized dataset, treatment analysis, AI model results, research export, population health.

## Login accounts
- System Administrator: `systemadmin@gmail.com` / `SystemAdmin@123`
- Hospital Administrator: `hospitaladministration@gmail.com` / `HospitalAdmin@123`
- Doctor: `doctor@gmail.com` / `Doctor@123`
- Healthcare Researcher: `hospitalresearcher@gmail.com` / `Researcher@123`

The login form is intentionally blank. No email or password is pre-filled.

## Dataset
`data/diabetic_data.csv` — Diabetes 130-US Hospitals dataset (101,766 encounters)

`data/IDS_mapping.csv` — mapping file supplied with the dataset.

The seeded local database already contains the imported encounters and one model prediction for every encounter, so the dashboard and patient screens show risk values immediately.

## Model
Random Forest classifier for early readmission (`readmitted == '<30'`).

Metrics in `models/model_metrics.json`:
- Accuracy: 73.21%
- Precision: 18.25%
- Recall: 40.25%
- F1: 25.11%
- ROC-AUC: 63.48%

## Run locally
### Terminal 1 — backend
```powershell
py -3.14 -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
cd backend
uvicorn app.main:app --reload
```

Open: http://127.0.0.1:8000/docs

### Terminal 2 — frontend
```powershell
cd frontend
npm install
npm run dev
```

Open the localhost URL printed by Vite.

## Important
Use this project as a fresh folder. Do not mix files from previous HealthForecast AI ZIPs.

Predictions are educational decision-support outputs, not diagnoses or automatic treatment instructions.


### Frontend troubleshooting note
The frontend uses synchronous `useEffect` callbacks with inner async requests; this avoids React 19's `destroy is not a function` error. CORS permits both localhost:5173 and 127.0.0.1:5173 for local development.


### Login behavior
The application always opens on the login page when the browser application is opened or refreshed. Email and password fields are blank until the user enters credentials. A previous browser session is not automatically restored.
