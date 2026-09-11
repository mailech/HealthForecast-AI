# HealthForecast AI: Hospital Performance Analytics & Healthcare Trends Frontend Documentation

**Project Name**: HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System  
**Phase**: Milestone 3 — Step 4: Frontend Hospital Performance Dashboard & Healthcare Trends UI  
**Authoritative Dataset**: Diabetes 130-US Hospitals Dataset (`dataset/diabetic_data.csv`)  
**Date**: September 2026  

---

## 1. Executive Purpose & Architecture

The **Hospital Performance Analytics & Healthcare Trends Dashboard** (`frontend/src/pages/admin/HospitalPerformanceDashboard.jsx`) provides executive-level healthcare intelligence, system-wide 30-day readmission benchmarks, length-of-stay duration analytics, and clinical context outcome breakdowns across historical US inpatient encounters.

### 1.1 Architectural Principles & Design System:
- **Core Technology Stack**: React 18, Vite 8, React Router v6, TailwindCSS, Lucide Icons, Recharts.
- **Glassmorphism Design Language**: Built on top of the project's established dark-mode aesthetics (`bg-slate-950`, `glass-panel`, `border-slate-800`, HSL cyan/emerald/rose accents).
- **Zero Mock / Synthetic Data**: All KPI cards, outcome charts, cohort tables, and risk gradients render real data returned by the backend analytics microservice.

---

## 2. API Endpoints Consumed

All requests are dispatched via the authenticated Axios client (`frontend/src/services/api.js`) attaching the JWT Bearer token:

1. `GET /api/v1/analytics/hospital-performance`
   - Supplies aggregate KPIs (101,766 total encounters, 99,343 eligible encounters, 11.39% early readmit rate, 35.31% late readmit rate, 53.30% no-readmit rate, 4.38 days avg stay, 43.20% high utilization, 26.68% extended stay) and the overall outcome distribution.
2. `GET /api/v1/analytics/admission-context-outcomes`
   - Supplies stratified 30-day early, late, and no readmission outcome metrics across Admission Types, Admission Sources, Age Groups, Medical Specialties, and Primary Diagnosis Categories.
3. `GET /api/v1/analytics/utilization-trends`
   - Supplies prior 12-month inpatient (0, 1, 2, 3+), emergency (0, 1, 2+), and outpatient (0, 1-2, 3+) visit risk gradients.
4. `GET /api/v1/analytics/length-of-stay-outcomes`
   - Supplies early readmission rates across stay duration brackets (Short: 1–2d, Moderate: 3–5d, Extended: 6–9d, Long: 10–14d).

---

## 3. Dashboard Sections & UI Features

### 3.1 Overall Performance KPI Grid (8 Metric Cards)
- **Total Encounters Analyzed**: `101,766`
- **Eligible Clinical Encounters**: `99,343` (Excludes 2,423 expired/hospice discharges)
- **30-Day Early Readmission Rate**: `11.39%` (11,314 encounters)
- **Late Readmission Rate (`>30`d)**: `35.31%`
- **No-Readmission Rate**: `53.30%` (52,947 encounters)
- **Average Length of Stay**: `4.38 Days`
- **High-Utilization Patient %**: `43.20%` (Prior inpatient/emergency > 0)
- **Extended Stay Rate (6+ Days)**: `26.68%`

### 3.2 System Outcome Distribution Chart
- **Visualization**: Recharts Donut / Pie Chart (`innerRadius={60}`, `outerRadius={95}`) displaying color-coded outcome slices:
  - *Rose (`#f43f5e`)*: Early Readmission (`<30`d: 11.39%, 11,314 encounters)
  - *Amber (`#f59e0b`)*: Late Readmission (`>30`d: 35.31%, 35,082 encounters)
  - *Emerald (`#10b981`)*: No Readmission (NO: 53.30%, 52,947 encounters)
- **Summary Cards**: Side-by-side card breakdown displaying exact encounter counts and rates.

### 3.3 Admission Context & Demographic Analytics
- **Interactive Sub-Tabs**: `[Admission Type, Admission Source, Age Group, Medical Specialty, Primary Diagnosis]`.
- **Recharts Grouped Bar Chart**: Comparative visual bar chart depicting Early Readmit Rate, Late Readmit Rate, and No Readmit Rate per category.
- **Detailed Data Table**: Displays Cohort Name, Sample Size (\(n\)), Cohort %, Early Readmissions, Early Rate %, Late Rate %, No Readmit Rate %, and Relative Risk vs Baseline (\(1.19\%\)).

### 3.4 Healthcare Utilization Trends
- **Sub-Tabs**: `[Inpatient Visits, Emergency Visits, Outpatient Visits]`.
- **Recharts Bar Chart**: Early readmission risk progression (e.g. Inpatient 0 Visits = 9.09% vs Inpatient 3+ Visits = 20.24%).
- **Observational Note Highlight**: Explains risk gradients using descriptive terminology.

### 3.5 Length of Stay Analysis
- **Duration Brackets**: Short (1–2d: 9.68%), Moderate (3–5d: 11.28%), Extended (6–9d: 13.06%), Long (10–14d: 15.01%).
- **Recharts Indigo Bar Chart**: Highlights duration risk escalation.

### 3.6 Key System Insights
- Dynamically rendered cards identifying top risk cohorts (Inpatient 3+ Visits = 20.24%, Emergency 2+ Visits = 21.80%, Long Stay 10–14d = 15.01%, Circulatory Diagnosis = 12.44%).

---

## 4. Dataset Limitations & Hospital Anonymity Display

> [!IMPORTANT]
> **Hospital Anonymity Implementation**:
> - A top banner and footer card explicitly state that encounters originate from **130 US hospitals (1999–2008)** without hospital-name identifiers.
> - The UI presents performance strictly at the aggregate **healthcare system level**.
> - Zero fake hospital names ("Hospital A", "Hospital B") or hospital ranking tables are generated.

---

## 5. Role-Based Access Control (RBAC) & Routing

- **Route**: `/admin/dashboard` & `/admin/hospital-performance`
- **Authorized Roles**:
  - `Hospital Administrator`
  - `Doctor`
  - `Healthcare Researcher`
  - `System Administrator`
- Enforced on the frontend via `<ProtectedRoute allowedRoles={["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]} />` and validated on the backend via JWT role verification.

---

## 6. Loading, Error & Responsive Behavior

- **Loading State**: Displays a cyan spinner animation and informational loading text during parallel API requests.
- **Error Handling**: Displays a rose-themed error card with a manual **Retry Analytics Data Request** button if network or server errors occur.
- **Responsive Layout**: Adapts gracefully across desktop, laptop, and tablet viewports via Tailwind grid system (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
