# HealthForecast-AI

HealthForecast-AI is an AI-assisted healthcare management system designed to help healthcare professionals manage patient records and assess patient readmission risk.

## Features

- Doctor/User authentication
- Healthcare dashboard
- Patient management
- Add, edit and delete patients
- Patient search
- Health risk prediction
- Readmission risk assessment
- Risk probability visualization
- Patient admission charts
- Recent patient records
- Responsive healthcare dashboard
- Settings and logout

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Recharts
- Axios
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic

## Project Structure

```text
HealthForecast-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── api/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
│
└── README.md
