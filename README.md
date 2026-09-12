# HealthForecast AI

### Hospital Readmission Prediction & Patient Risk Intelligence

HealthForecast AI is a full-stack healthcare intelligence platform designed to help hospitals analyze patient information, predict readmission risk, monitor clinical outcomes, and support healthcare workflow decisions.

The system combines a React frontend, FastAPI backend, PostgreSQL database, JWT authentication, role-based access control, and a machine-learning readmission prediction model.

---

## Features

### Authentication & Role-Based Access

* User registration and login
* JWT-based authentication
* Protected API endpoints
* Role-Based Access Control (RBAC)
* Four user roles:

  * Admin
  * Doctor
  * Staff
  * Patient

### Patient Management

* Add patient records
* View patient information
* Update patient records
* Delete patients
* Role-based patient access
* Patient-specific health view

### AI Readmission Prediction

* Machine-learning based readmission risk prediction
* Patient risk score generation
* High / Medium / Low risk classification
* Prediction history
* AI-assisted recommendations
* Clinical Decision Support

### Healthcare Analytics

* Treatment Effectiveness Analysis
* Medication Effectiveness Analysis
* Recovery Analysis
* Clinical Analytics dashboard
* Admission History
* Patient outcome monitoring

### Research & Optimization

* Research summary and healthcare statistics
* Patient risk analysis
* Prediction statistics
* AI-assisted Optimization Workflow
* Patient prioritization based on risk levels

### Notifications

* High-risk patient notifications
* New patient admission notifications

### Dashboard

* Total patients
* High-risk patients
* Doctors
* Registered users
* Patient risk information
* Recent patient activity

### Theme

* Light mode
* Dark mode
* System theme

---

## Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* Lucide React
* Recharts

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* bcrypt

### Database

* PostgreSQL

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* Joblib

### Dataset

**Diabetes 130-US Hospitals for Years 1999-2008**

The dataset is used for the hospital readmission prediction model.

---

## Project Structure

```text
HealthForecast-AI/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── users.py
│   │   │   ├── patients.py
│   │   │   ├── dashboard.py
│   │   │   ├── prediction.py
│   │   │   ├── notifications.py
│   │   │   ├── clinical.py
│   │   │   ├── research.py
│   │   │   └── optimization.py
│   │   │
│   │   ├── auth.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   ├── data/
│   │   └── diabetic_data.csv
│   │
│   └── ml/
│       ├── train_model.py
│       ├── model_service.py
│       └── readmission_model.joblib
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── layouts/
│       └── pages/
│
└── README.md
```

---

## Setup

### Prerequisites

* Python 3
* Node.js
* PostgreSQL
* Git
* VS Code

---

## Backend

Open a terminal in the project folder and run:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

Open a **new terminal** in the project folder and run:

```bash
cd frontend
```

Install the required packages:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

## Machine Learning Model

To train the readmission prediction model:

```bash
cd backend
python ml/train_model.py
```

The trained model is saved in:

```text
backend/ml/readmission_model.joblib
```

The prediction service is implemented in:

```text
backend/ml/model_service.py
```

---

## API Modules

The backend provides the following API modules:

```text
/users
/patients
/dashboard
/prediction
/notifications
/clinical
/research
/optimization
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Machine Learning Performance

| Metric   | Result |
| -------- | -----: |
| Accuracy | 67.15% |
| ROC-AUC  | 64.62% |

The model provides AI-assisted risk assessment and is intended to support healthcare decision-making.

---

## User Roles

| Role    | Access                                               |
| ------- | ---------------------------------------------------- |
| Admin   | Full system management                               |
| Doctor  | Patient management, prediction and clinical analysis |
| Staff   | Patient viewing and hospital workflow information    |
| Patient | Own health and clinical information                  |

---

## Application Workflow

```text
Login / Signup
      ↓
JWT Authentication
      ↓
Role-Based Access Control
      ↓
Dashboard
      ↓
Patient Management
      ↓
AI Readmission Prediction
      ↓
Clinical Decision Support
      ↓
Treatment / Medication / Recovery Analysis
      ↓
Research & Optimization
```
 
