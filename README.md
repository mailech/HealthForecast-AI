# HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System
### 🏥 Infosys Internship Capstone Project | 3D Spatial Clinical Digital Twin & Deep Learning Engine

HealthForecast AI is an AI-powered healthcare analytics platform that predicts 30-day hospital readmissions, classifies patient risk profiles, evaluates treatment protocol effectiveness, and provides clinical decision support. Built with a high-performance **FastAPI backend** and a futuristic **Three.js 3D Cyber-Medical UI**.

---

## 🌟 Key Features & 3D Spatial Architecture

1. **3D Holographic Patient Digital Twin (`PatientBodyTwin3D.jsx`)**:
   - 3D wireframe humanoid anatomical mannequin with ambient bio-particles and real-time rotating bio-scan rings.
   - Dynamic aura color shifting based on readmission risk: Cyan (Low Risk), Amber (Moderate), Pulsing Crimson (Critical Readmission Hazard >60%).
   - Interactive 3D Organ Nodes (Heart, Pancreas, Kidneys, Lungs, Brain) with real-time biometric telemetry inspection on click.

2. **3D Hospital Facility & Smart Ward Digital Twin (`HospitalWard3D.jsx`)**:
   - Isometric 3D hospital facility with distinct inpatient units (Endocrinology Wing, Cardiology Step-Down, ICU Critical Care, General Medicine).
   - 16 interactive 3D patient beds with hovering risk status halos and real-time intake/transfer flow particles.
   - Click any bed to immediately inspect the patient's clinical intelligence profile.

3. **3D Patient Cohort Constellation Manifold (`CohortConstellation3D.jsx`)**:
   - Interactive 3D particle universe mapping 400+ patient encounters across clinical axes: X = Length of Stay, Y = Lab Complexity, Z = Prior Emergency Encounters.
   - Filter by High-Risk Readmission, HbA1c > 8.0%, or Rapid Recovery clusters.

4. **3D AI Neural Decision Matrix (`NeuralNetwork3D.jsx`)**:
   - Visualizes feature input layers, ensemble decision trees, and output probabilities with traveling signal pulses.

5. **Real-Time "What-If" Clinical Risk Simulator**:
   - Real-time interactive parameter sliders (Hospital Stay, Emergency Visits, HbA1c levels, Medication Burden, Insulin Regimen) allowing physicians to observe instant changes in readmission probability.

6. **Role-Based Access Control (RBAC) Workspaces**:
   - **Doctor**: Inpatient roster, 3D anatomical twin, What-If simulator, clinical decision checklist, and printable discharge mitigation report.
   - **Hospital Administrator**: 3D smart ward, 30-day readmission rate KPIs, cost savings, department performance metrics.
   - **Healthcare Researcher**: Anonymized cohorts (PII scrubbed), 3D cohort manifold, treatment effectiveness benchmarks, CSV/JSON data export.
   - **System Administrator**: AI model governance (Random Forest, Gradient Boosting, Logistic Regression), ROC-AUC metrics, 1-click retraining, RBAC user accounts, audit logs.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Launch Backend API
```bash
cd backend
python main.py
# Or run with uvicorn:
uvicorn main:app --reload --port 8000
```
Backend will be available at `http://localhost:8000`
Swagger API Documentation: `http://localhost:8000/docs`

### 2. Launch Frontend 3D Application
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`

---

## 🔑 Demo Role Credentials

Use the convenient 1-click role switcher in the top navigation bar, or log in with:
- **Doctor**: `doctor@healthforecast.ai` (Password: `doctor123`)
- **Hospital Administrator**: `admin@healthforecast.ai` (Password: `admin123`)
- **Healthcare Researcher**: `researcher@healthforecast.ai` (Password: `research123`)
- **System Administrator**: `sysadmin@healthforecast.ai` (Password: `sysadmin123`)

---

## 📊 AI & Machine Learning Pipeline
- **Dataset**: Diabetes 130-US Hospitals (1999-2008) clinical encounter schema.
- **Algorithms**: Random Forest (120 Estimators), Gradient Boosting, Calibrated Logistic Regression.
- **Explainability**: SHAP-style risk driver decomposition (emergency frequency, HbA1c severity, polypharmacy, length of stay, cardiorenal comorbidities).
- **Evaluation Metrics**: Accuracy (~65-72%), Precision, Recall, F1-Score, ROC-AUC (~0.81).
