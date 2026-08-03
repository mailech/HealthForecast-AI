# HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System

An AI-powered healthcare analytics platform that predicts hospital readmissions, identifies high-risk patients, evaluates treatment effectiveness, and supports proactive patient care planning.

---

## 🌟 Key Features & Core Modules

1. **User Management & Role-Based Access Control (RBAC)**
   - 4 Operational User Roles: **Doctor**, **Hospital Administrator**, **Healthcare Researcher**, **System Administrator**.
   - Dynamic Access Control Matrix enforcement (PDF Page 6 compliance).
   - Real-time role switcher toolbar in top navbar.

2. **Patient Data Management (Diabetes 130-US Hospitals Dataset)**
   - Clinical encounter directory filtered by Age Group, Gender, Admission Type, and Risk Levels.
   - Comprehensive Patient Profile Drawer with Vitals, HbA1c Lab Results, and Medical History.
   - Anonymized research dataset view for Healthcare Researchers.

3. **AI Risk Prediction & Readmission Forecasting**
   - Interactive live AI Readmission Calculator with parameter sliders (Length of Stay, Emergency Visits, Prior Inpatient Admissions, Medications, HbA1c, Insulin Change).
   - Dynamic 30-day readmission score calculation, risk level categorization (High / Medium / Low).
   - SHAP Value feature importance breakdown.

4. **Treatment Effectiveness & Recovery Monitoring**
   - Comparative evaluation of treatment pathways (Insulin Intensification, Metformin, Telehealth).
   - Medication outcome metrics and recovery tracking.

5. **Clinical Decision Support & Care Recommendation**
   - Actionable patient recommendations tailored to risk profile.
   - Interactive Discharge Readiness Checklist.

6. **Healthcare Analytics Dashboard**
   - Monthly hospital readmission rate trend charts vs AI forecasts and national benchmarks.
   - Departmental readmission rate breakdown.
   - One-click PDF & CSV report export simulation.

7. **AI Model Management & Governance**
   - Machine Learning metrics display (Accuracy: 92.4%, Precision: 89.1%, Recall: 91.5%, F1: 90.3%, ROC-AUC: 0.942).
   - Live Retrain simulator with real-time log terminal.
   - Model serving deployment toggle.

---

## 🚀 How to Run Locally

```bash
# 1. Navigate to project root
cd healthforecast-ai

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---


