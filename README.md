# HealthForecast AI — Patient Readmission Risk Prediction & Healthcare Analytics Platform

**HealthForecast AI** is an end-to-end, AI-driven clinical decision support and healthcare analytics platform designed to forecast 30-day patient readmission risks, stratify cohort clinical severity, and provide role-specific operational dashboards for doctors, hospital administrators, healthcare researchers, and system administrators.

---

## 🌟 Key Architecture & Multi-Role Modules

The platform enforces **Role-Based Access Control (RBAC)** across 4 specialized user roles, each equipped with dedicated, non-duplicative screens and tailored workflow tools:

### 1. 🩺 Doctor Module
* **Doctor Dashboard (`/dashboard/doctor`)**: Provides physicians with immediate clinical overview metrics (Assigned Patients, High-Risk Watchlist count, 30-Day Readmission Probability, Avg Length of Stay), real-time patient risk table, and readmission breakdown.
* **Assigned Patients (`/patients`)**: Clinical registry for assigned patients, complete with search, risk filters, and quick profile inspection.
* **Risk Intelligence & AI Analytics (`/analytics/risk`)**: Deep clinical risk analytics featuring:
  * High-Risk Cohort Count & AI Model Confidence Score (94.8%).
  * Cohort Readmission Risk Stratification Pie Chart (<30 Days vs >30 Days vs Low Risk).
  * Demographic Risk Bracket Breakdown.
  * AI Predictive Feature Drivers (Prior Inpatient visits, HbA1c elevation, Glucose serum, Hospital stay).
  * Stratified Patient Risk Intelligence Matrix Table.

### 2. 🏥 Hospital Administrator Module
* **Hospital Overview (`/dashboard/admin`)**: High-level hospital operational metrics, total admission tracking, readmission rate benchmarks, and age distribution analysis.
* **Patient Directory (`/patients`)**: Centralized patient records directory.
* **Hospital Performance (`/analytics/performance`)**: Departmental throughput analytics, specialty volume share pie chart, and specialty performance quality scorecard table.

### 3. 🔬 Healthcare Researcher Module
* **Research Analytics (`/dashboard/researcher`)**: De-identified encounter metrics and HIPAA-compliant dataset CSV exporter.
* **Anonymized Datasets (`/patients`)**: Fully anonymized patient dataset directory (PII stripped).
* **Population Trends (`/analytics/trends`)**: Epidemiological age group distribution, racial/ethnic representation, and demographic stratification matrix.

### 4. 🛡️ System Administrator Module
* **System Dashboard (`/dashboard/sysadmin`)**: Real-time microservices monitoring (FastAPI backend core, SQLite ORM engine, AI scoring engine, JWT auth service), latency tracking, and uptime logs.
* **User Management (`/users`)**: Comprehensive user governance tool equipped with:
  * **Interactive User Creation Modal (`+ Create New Admin / User`)**: Allows creating new System Admins, Hospital Admins, Doctors, and Researchers.
  * **Role Assignment Dropdowns**: Dynamically modify user permissions in real-time.
  * **Account Deactivation & Re-Activation**: Deactivate accounts or re-enable deactivated accounts with a single click (**`Activate Account`**).
* **All Patients (`/patients`)**: Platform-wide patient encounter database.
* **Platform Analytics (`/analytics/performance`)**: System-wide performance and department analytics.

---

## 🧠 AI Clinical Risk Scoring Engine

The backend incorporates a clinical risk calculation engine that evaluates encounter features to compute a continuous risk score (0–100%) and categorizes patients into **High**, **Medium**, or **Low** risk strata:

$$\text{Base Score} = (\text{Inpatient Visits} \times 18.0) + (\text{Lab Procedures} \times 0.4) + (\text{Medications} \times 1.5)$$

* **HbA1c Factor**: $+12\%$ for $>8\%$, $+6\%$ for $>7\%$
* **Glucose Serum Factor**: $+10\%$ for $>200\text{ mg/dL}$ or $>300\text{ mg/dL}$
* **Hospitalization Duration**: $+8\%$ for $\ge 7\text{ days}$

---

## 🛠️ Technology Stack

* **Frontend**:
  * **Framework**: React 18 (Vite)
  * **Routing**: React Router v6
  * **Charts**: Recharts
  * **Icons**: Lucide React
  * **Styling**: Modern Vanilla CSS with CSS Variables & Responsive Grids
* **Backend**:
  * **Framework**: Python FastAPI
  * **Database**: SQLite with SQLAlchemy ORM
  * **Security**: Passlib (Bcrypt password hashing), PyJWT (JSON Web Tokens)
  * **API Standard**: RESTful JSON API with OpenAPI auto-docs (`/docs`)

---

## 🚀 Running Locally

### Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtualenv (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
The API server will run at `http://localhost:8000` (Interactive API docs at `http://localhost:8000/docs`).

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 📌 Repository & Branch Information

* **GitHub Repository**: [https://github.com/mailech/HealthForecast-AI.git](https://github.com/mailech/HealthForecast-AI.git)
* **Branch**: `nandanGogari`