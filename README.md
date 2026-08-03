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

## 🐙 Step-by-Step Instructions to Push Code into GitHub Branch

Follow these exact commands in your shell terminal:

```bash
# Step 1: Navigate to the project directory
cd C:\Users\mades\.gemini\antigravity\scratch\healthforecast-ai

# Step 2: Initialize a new Git repository
git init

# Step 3: Check status of files
git status

# Step 4: Stage all project files
git add .

# Step 5: Commit changes with a descriptive commit message
git commit -m "feat: complete HealthForecast AI frontend web app with RBAC and AI risk prediction"

# Step 6: Create and checkout your target GitHub feature branch
git checkout -b feature/healthforecast-ai-frontend

# Step 7: Connect your local repository to your remote GitHub repository
# Replace YOUR_GITHUB_USERNAME and YOUR_REPO_NAME with your GitHub credentials:
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# Step 8: Push the feature branch to GitHub
git push -u origin feature/healthforecast-ai-frontend
```

### 💡 Alternative: Push directly to `main` branch:
```bash
git branch -M main
git push -u origin main
```
