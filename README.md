# HealthForecast AI - Hospital Readmission Prediction & Risk Intelligence System

HealthForecast AI is a MERN-stack healthcare analytics platform designed to predict patient hospital readmission risk, manage clinical files, support transitional care planning, and compile population-level research datasets. The platform incorporates a simulated AI prediction engine modeled after the characteristics of the **Diabetes 130-US Hospitals Dataset**.

## Tech Stack

- **Frontend:** React.js (Vite), React Router DOM, Axios, Plain CSS (CSS Variables, component scopes), Framer Motion, React Hook Form, React Icons, Recharts (analytics dashboards), React Hot Toast
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, Refresh Tokens, Secure HttpOnly Cookies, Role-Based Access Control (RBAC)

---

## Key Modules & Features

1. **User Authentication & RBAC (Authentication Module)**
   - Secure Login/Logout with HttpOnly Cookies and automatic JWT rotation interceptors.
   - Enforced access rules for 4 operational roles (Doctor, Hospital Administrator, Healthcare Researcher, System Administrator).

2. **Patient Records & Timelines (Patient Management Module)**
   - CRUD actions on demographics, allergies, chronic conditions, and admission logs.
   - Structured timeline tracking time in hospital, lab procedures count, medication modifications, and test metrics (glucose, HbA1c).

3. **AI Readmission Prediction (Risk Engine)**
   - Scoring algorithm calculating readmission probability (0-95%) using metrics derived from diabetes clinical datasets.
   - Outputs primary risk drivers (e.g. polypharmacy, comorbidity, high HbA1c without med changes).
   - Generates automated transitional care guidelines (e.g. PCP follow-up windows, home care enrollment).

4. **Hospital Analytics Dashboards (Hospital Admin Dashboard)**
   - Operational KPIs: total patients count, current occupancy estimation, active clinicians, overall readmission rate.
   - Recharts visual graphs: diagnosis readmissions, age brackets risk, recovery trends, medication adjustment outcomes.
   - Interactive report printing.

5. **Anonymized Research Hub (Researcher Dashboard)**
   - HIPAA-compliant database viewing that automatically redacts patient names, contact numbers, and precise visit dates.
   - Exports anonymized population datasets as CSV documents.

6. **MLOps Control & Security Auditing (System Admin Dashboard)**
   - User database control: toggle active status and alter user roles.
   - Security Audit logs: monitors operators, action codes, client IPs, and browser headers.
   - ML Panel: views AUC-ROC curves, triggers simulated retraining cycles, and configures learning rates.

---

## Folder Structure

```
hospital_management/
├── backend/
│   ├── config/          # db.js, constants.js
│   ├── controllers/     # auth, patients, predictions, analytics, users, model
│   ├── middleware/      # auth, error, rateLimiter
│   ├── models/          # User.js, Patient.js, Prediction.js, AuditLog.js
│   ├── routes/          # auth, patients, predictions, analytics, users, model
│   ├── services/        # aiPredictionService.js
│   └── utils/           # seeder.js
└── frontend/
    ├── src/
    │   ├── components/  # ProtectedRoute
    │   ├── contexts/    # AuthContext
    │   ├── layouts/     # DashboardLayout
    │   ├── pages/       # Login, DoctorDashboard, AdminDashboard, ResearcherDashboard, SystemAdminDashboard, PatientDetails
    │   ├── services/    # api.js
    │   └── styles/      # index.css
```

---

## Installation & Running Locally

### Prerequisites

- Node.js (v16+)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/hospital_management`) or MongoDB Atlas URI

### Setup Steps

1. **Clone or Navigate to Project:**
   ```bash
   cd D:\hospital_management
   ```

2. **Backend Configuration:**
   - In `backend/` folder, create `.env` using `.env.example` as a template.
   - Run install:
     ```bash
     cd backend
     npm install
     ```
   - Seed database:
     ```bash
     npm run seed   # Running 'node utils/seeder.js'
     ```
   - Start backend dev server:
     ```bash
     npm start      # Running 'node server.js'
     ```

3. **Frontend Configuration:**
   - Run install:
     ```bash
     cd ../frontend
     npm install
     ```
   - Start Vite frontend dev server:
     ```bash
     npm run dev
     ```

4. **Access UI:**
   - Open browser at `http://localhost:5173`.
   - Use **Demo Quick Logins** on the sign-in screen to instantly toggle between user roles.
