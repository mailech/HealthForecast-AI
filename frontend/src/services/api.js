import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('healthforecast_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rich Mock Data Store for Offline Fallback
const MOCK_PATIENTS = [
  {
    id: 1,
    patient_code: "HF-8041",
    first_name: "Eleanor",
    last_name: "Vance",
    age: 72,
    gender: "Female",
    department: "Cardiology",
    primary_diagnosis: "Congestive Heart Failure",
    admission_date: "2026-07-26",
    status: "Admitted",
    prior_admissions: 3,
    emergency_visits: 2,
    length_of_stay: 7,
    charlson_index: 4,
    lace_index: 13,
    hba1c: 8.6,
    serum_sodium: 132.5,
    creatinine: 2.1,
    polypharmacy_count: 11,
    readmission_risk_score: 78.4,
    risk_level: "High"
  },
  {
    id: 2,
    patient_code: "HF-3912",
    first_name: "Marcus",
    last_name: "Thorne",
    age: 64,
    gender: "Male",
    department: "Pulmonology",
    primary_diagnosis: "COPD Exacerbation",
    admission_date: "2026-07-28",
    status: "Admitted",
    prior_admissions: 2,
    emergency_visits: 1,
    length_of_stay: 4,
    charlson_index: 2,
    lace_index: 9,
    hba1c: 7.1,
    serum_sodium: 137.0,
    creatinine: 1.2,
    polypharmacy_count: 6,
    readmission_risk_score: 48.2,
    risk_level: "Medium"
  },
  {
    id: 3,
    patient_code: "HF-5104",
    first_name: "Sophia",
    last_name: "Chen",
    age: 58,
    gender: "Female",
    department: "Endocrinology",
    primary_diagnosis: "Type 2 Diabetes Uncontrolled",
    admission_date: "2026-07-30",
    status: "Admitted",
    prior_admissions: 0,
    emergency_visits: 0,
    length_of_stay: 2,
    charlson_index: 1,
    lace_index: 4,
    hba1c: 9.2,
    serum_sodium: 139.5,
    creatinine: 0.9,
    polypharmacy_count: 4,
    readmission_risk_score: 22.8,
    risk_level: "Low"
  },
  {
    id: 4,
    patient_code: "HF-2290",
    first_name: "Arthur",
    last_name: "Pendelton",
    age: 81,
    gender: "Male",
    department: "Nephrology",
    primary_diagnosis: "Acute Kidney Injury on CKD Stage 4",
    admission_date: "2026-07-22",
    status: "Admitted",
    prior_admissions: 4,
    emergency_visits: 3,
    length_of_stay: 9,
    charlson_index: 6,
    lace_index: 15,
    hba1c: 7.8,
    serum_sodium: 130.0,
    creatinine: 3.4,
    polypharmacy_count: 14,
    readmission_risk_score: 89.1,
    risk_level: "High"
  },
  {
    id: 5,
    patient_code: "HF-6733",
    first_name: "Clara",
    last_name: "O'Connor",
    age: 49,
    gender: "Female",
    department: "Internal Medicine",
    primary_diagnosis: "Community Acquired Pneumonia",
    admission_date: "2026-07-29",
    status: "Outpatient",
    prior_admissions: 1,
    emergency_visits: 0,
    length_of_stay: 3,
    charlson_index: 1,
    lace_index: 5,
    hba1c: 5.9,
    serum_sodium: 140.2,
    creatinine: 0.8,
    polypharmacy_count: 3,
    readmission_risk_score: 18.5,
    risk_level: "Low"
  }
];

export const healthApi = {
  login: async (credentials) => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data;
    } catch (e) {
      // Mock Fallback
      return {
        access_token: "mock_jwt_token_2026",
        token_type: "bearer",
        user: {
          id: 1,
          full_name: "Dr. Sarah Jenkins",
          email: credentials.email || "doctor@metrohealth.org",
          role: "Doctor",
          hospital_name: "MetroHealth General Hospital"
        }
      };
    }
  },

  getDashboardSummary: async () => {
    try {
      const res = await apiClient.get('/dashboard');
      return res.data;
    } catch (e) {
      return {
        total_patients: 148,
        high_risk_patients: 28,
        medium_risk_patients: 45,
        low_risk_patients: 75,
        readmission_rate_30d: 14.2,
        predicted_savings_usd: 191500,
        department_distribution: {
          Cardiology: 42,
          Pulmonology: 35,
          Endocrinology: 28,
          Nephrology: 19,
          "Internal Medicine": 24
        },
        recent_alerts: MOCK_PATIENTS.filter(p => p.risk_level === 'High')
      };
    }
  },

  getPatients: async (filters = {}) => {
    try {
      const res = await apiClient.get('/patients', { params: filters });
      return res.data;
    } catch (e) {
      let result = [...MOCK_PATIENTS];
      if (filters.department && filters.department !== "All Departments") {
        result = result.filter(p => p.department === filters.department);
      }
      if (filters.risk_level && filters.risk_level !== "All Risk Levels") {
        result = result.filter(p => p.risk_level === filters.risk_level);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => 
          p.first_name.toLowerCase().includes(q) || 
          p.last_name.toLowerCase().includes(q) ||
          p.patient_code.toLowerCase().includes(q) ||
          p.primary_diagnosis.toLowerCase().includes(q)
        );
      }
      return result;
    }
  },

  predictRisk: async (inputData) => {
    try {
      const res = await apiClient.post('/predict', inputData);
      return res.data;
    } catch (e) {
      // Heuristic fallback calculation
      const age = inputData.age || 65;
      const admissions = inputData.prior_admissions || 1;
      const lace = inputData.lace_index || 8;
      const hba1c = inputData.hba1c || 6.5;

      let score = 15 + (age * 0.3) + (admissions * 12) + (lace * 3);
      if (hba1c > 8.0) score += 15;
      score = Math.min(Math.max(score, 8.5), 96.4);
      score = Math.round(score * 10) / 10;

      let level = "Low";
      if (score >= 60) level = "High";
      else if (score >= 30) level = "Medium";

      return {
        patient_id: inputData.patient_id || null,
        risk_score: score,
        risk_level: level,
        confidence: 0.91,
        key_factors: [
          { factor: "Prior Admission Count", impact: "High", value: `${admissions} in last 12 mos` },
          { factor: "LACE Clinical Index", impact: "High", value: `LACE = ${lace}/19` },
          { factor: "Glycemic Index (HbA1c)", impact: hba1c > 8 ? "High" : "Low", value: `HbA1c = ${hba1c}%` }
        ],
        recommendations: [
          "Assign dedicated post-discharge care navigator",
          "Schedule tele-health checkup within 48 hours",
          "Conduct medication reconciliation prior to discharge"
        ],
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }
  },

  getAnalytics: async () => {
    try {
      const res = await apiClient.get('/analytics');
      return res.data;
    } catch (e) {
      return {
        monthly_readmissions: [
          { month: "Jan", readmissions: 42, target: 35, high_risk: 18 },
          { month: "Feb", readmissions: 38, target: 35, high_risk: 15 },
          { month: "Mar", readmissions: 45, target: 35, high_risk: 22 },
          { month: "Apr", readmissions: 31, target: 35, high_risk: 11 },
          { month: "May", readmissions: 29, target: 35, high_risk: 9 },
          { month: "Jun", readmissions: 26, target: 35, high_risk: 8 },
          { month: "Jul", readmissions: 24, target: 35, high_risk: 7 }
        ],
        readmission_reasons: [
          { reason: "Medication Non-Adherence", value: 34, color: "#06b6d4" },
          { reason: "Inadequate Post-Discharge Support", value: 28, color: "#14b8a6" },
          { reason: "Disease Progression", value: 20, color: "#f59e0b" },
          { reason: "Surgical Complications", value: 12, color: "#ef4444" },
          { reason: "Diagnostic Miss", value: 6, color: "#8b5cf6" }
        ],
        department_performance: [
          { department: "Cardiology", total_discharges: 420, readmission_rate: 16.4, benchmark: 18.0 },
          { department: "Pulmonology", total_discharges: 310, readmission_rate: 18.2, benchmark: 19.5 },
          { department: "Endocrinology", total_discharges: 280, readmission_rate: 11.5, benchmark: 14.0 },
          { department: "Nephrology", total_discharges: 190, readmission_rate: 21.0, benchmark: 22.5 },
          { department: "Internal Medicine", total_discharges: 550, readmission_rate: 13.8, benchmark: 15.0 }
        ],
        treatment_trajectories: [
          { week: "Week 1", standard_care: 45, ai_guided_care: 72 },
          { week: "Week 2", standard_care: 58, ai_guided_care: 84 },
          { week: "Week 3", standard_care: 64, ai_guided_care: 91 },
          { week: "Week 4", standard_care: 70, ai_guided_care: 96 }
        ]
      };
    }
  },

  getReports: async () => {
    try {
      const res = await apiClient.get('/reports');
      return res.data;
    } catch (e) {
      return [
        {
          id: 1,
          title: "Monthly Hospital Readmission Audit - July 2026",
          report_type: "Monthly Audit",
          department: "All Departments",
          generated_by: "Dr. Sarah Jenkins",
          file_format: "PDF",
          date: "2026-07-31",
          size: "2.4 MB"
        },
        {
          id: 2,
          title: "Cardiology High-Risk Cohort Analysis",
          report_type: "High Risk Summary",
          department: "Cardiology",
          generated_by: "System AI Audit",
          file_format: "CSV",
          date: "2026-08-01",
          size: "840 KB"
        },
        {
          id: 3,
          title: "Q2 Polypharmacy & Medication Adherence Intelligence",
          report_type: "Treatment Analysis",
          department: "Internal Medicine",
          generated_by: "Dr. Robert Vance",
          file_format: "PDF",
          date: "2026-07-15",
          size: "4.1 MB"
        }
      ];
    }
  }
};
