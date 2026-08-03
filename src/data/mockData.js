// HealthForecast AI - Master Mock Dataset & System Data

// Access Matrix matching Page 6 of PDF Requirements
export const ACCESS_MATRIX = [
  {
    feature: "Patient Records",
    doctor: "Assigned Patients Only",
    admin: "View Only",
    researcher: "Anonymized Only",
    sysadmin: "Full Access"
  },
  {
    feature: "Medical History",
    doctor: "Assigned Patients Only",
    admin: "View Only",
    researcher: "Anonymized Only",
    sysadmin: "Full Access"
  },
  {
    feature: "Risk Prediction Reports",
    doctor: "Yes",
    admin: "Yes",
    researcher: "Aggregated Only",
    sysadmin: "Yes"
  },
  {
    feature: "Readmission Forecasts",
    doctor: "Yes",
    admin: "Yes",
    researcher: "Aggregated Only",
    sysadmin: "Yes"
  },
  {
    feature: "Treatment Effectiveness Reports",
    doctor: "Yes",
    admin: "Yes",
    researcher: "Yes",
    sysadmin: "Yes"
  },
  {
    feature: "Hospital Analytics Dashboard",
    doctor: "Limited",
    admin: "Full Access",
    researcher: "Aggregated Only",
    sysadmin: "Full Access"
  },
  {
    feature: "Population Health Reports",
    doctor: "No",
    admin: "Yes",
    researcher: "Yes",
    sysadmin: "Yes"
  },
  {
    feature: "Research Dataset Export",
    doctor: "No",
    admin: "No",
    researcher: "Yes",
    sysadmin: "Yes"
  },
  {
    feature: "User Management",
    doctor: "No",
    admin: "No",
    researcher: "No",
    sysadmin: "Yes"
  },
  {
    feature: "Model Management",
    doctor: "No",
    admin: "No",
    researcher: "No",
    sysadmin: "Yes"
  }
];

// Operational User Roles Definition (PDF Page 3-5)
export const ROLES = {
  DOCTOR: {
    id: "doctor",
    name: "Dr. Sarah Jenkins, MD",
    title: "Attending Cardiologist / Diabetologist",
    roleLabel: "Doctor",
    department: "Endocrinology & Internal Medicine",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250",
    badgeColor: "cyan",
    assignedPatientsOnly: true,
  },
  ADMIN: {
    id: "admin",
    name: "Marcus Vance, MHA",
    title: "Chief Operating Officer & Hospital Admin",
    roleLabel: "Hospital Administrator",
    department: "Executive Operations",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    badgeColor: "emerald",
    assignedPatientsOnly: false,
  },
  RESEARCHER: {
    id: "researcher",
    name: "Dr. Elena Rostova, PhD",
    title: "Principal Healthcare Data Scientist",
    roleLabel: "Healthcare Researcher",
    department: "Clinical Epidemiology & AI Research",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    badgeColor: "purple",
    assignedPatientsOnly: false,
    anonymizedView: true
  },
  SYSADMIN: {
    id: "sysadmin",
    name: "Alex Thorne",
    title: "Lead Platform Engineer & SysAdmin",
    roleLabel: "System Administrator",
    department: "IT Infrastructure & Security",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    badgeColor: "amber",
    assignedPatientsOnly: false
  }
};

// Diabetes 130-US Hospitals Dataset sample (Page 8 Requirement)
export const PATIENT_RECORDS = [
  {
    id: "PT-10492",
    encounterId: "ENC-884021",
    name: "Eleanor Vance",
    ageGroup: "[70-80)",
    gender: "Female",
    admissionType: "Emergency",
    timeInHospital: 7,
    numLabProcedures: 64,
    numProcedures: 3,
    numMedications: 22,
    numberEmergency: 2,
    numberInpatient: 3,
    primaryDiagnosis: "Diabetes Mellitus type 2 with hyperosmolar coma (ICD-9: 250.2)",
    secondaryDiagnosis: "Congestive Heart Failure (428.0)",
    a1cResult: ">8 (Abnormal)",
    glucoseTest: ">300",
    insulinChange: "Up",
    diabetesMed: "Yes",
    assignedDoctor: "Dr. Sarah Jenkins, MD",
    readmissionScore: 87, // Percentage
    riskLevel: "High",
    predictedReadmissionDays: 14,
    readmissionHistoryCount: 3,
    status: "Inpatient",
    bedNumber: "ICU-302",
    vitalSigns: {
      bloodPressure: "148/92 mmHg",
      heartRate: "88 bpm",
      oxygenSat: "94%",
      temp: "98.6 °F"
    },
    aiRiskFactors: [
      { factor: "High A1C Level (>8%)", impact: "+24%", status: "critical" },
      { factor: "Frequent Emergency Visits (2 in last 6 months)", impact: "+21%", status: "critical" },
      { factor: "Multiple Inpatient Stays (>3)", impact: "+18%", status: "high" },
      { factor: "Complex Polypharmacy (22 medications)", impact: "+14%", status: "medium" },
      { factor: "Insulin Dose Increase during Encounter", impact: "+10%", status: "medium" }
    ],
    careRecommendations: [
      "Schedule 48-hour post-discharge telehealth follow-up",
      "Deploy Remote Patient Monitoring (RPM) for daily blood glucose",
      "Assign Clinical Pharmacist for 1-on-1 medication reconciliation",
      "Enroll in High-Risk Diabetic Outpatient Management Program"
    ]
  },
  {
    id: "PT-20914",
    encounterId: "ENC-992140",
    name: "Arthur Pendelton",
    ageGroup: "[60-70)",
    gender: "Male",
    admissionType: "Urgent",
    timeInHospital: 4,
    numLabProcedures: 48,
    numProcedures: 1,
    numMedications: 14,
    numberEmergency: 0,
    numberInpatient: 1,
    primaryDiagnosis: "Hypertensive Chronic Kidney Disease (ICD-9: 403.91)",
    secondaryDiagnosis: "Diabetes Mellitus without complication (250.0)",
    a1cResult: "Norm",
    glucoseTest: "Norm",
    insulinChange: "No",
    diabetesMed: "Yes",
    assignedDoctor: "Dr. Sarah Jenkins, MD",
    readmissionScore: 62,
    riskLevel: "Medium",
    predictedReadmissionDays: 28,
    readmissionHistoryCount: 1,
    status: "Inpatient",
    bedNumber: "ROOM-412",
    vitalSigns: {
      bloodPressure: "135/84 mmHg",
      heartRate: "76 bpm",
      oxygenSat: "97%",
      temp: "98.4 °F"
    },
    aiRiskFactors: [
      { factor: "Chronic Kidney Disease Comorbidities", impact: "+22%", status: "high" },
      { factor: "Prior Inpatient Admission in 12 months", impact: "+18%", status: "medium" },
      { factor: "Age Group (60-70 years)", impact: "+12%", status: "medium" }
    ],
    careRecommendations: [
      "Nephrology outpatient consultation within 7 days",
      "Dietary consult for renal & diabetic sodium-restricted regimen",
      "Confirm outpatient lab requisition for serum creatinine & eGFR"
    ]
  },
  {
    id: "PT-30219",
    encounterId: "ENC-771923",
    name: "Sophia Martinez",
    ageGroup: "[50-60)",
    gender: "Female",
    admissionType: "Elective",
    timeInHospital: 2,
    numLabProcedures: 29,
    numProcedures: 2,
    numMedications: 8,
    numberEmergency: 0,
    numberInpatient: 0,
    primaryDiagnosis: "Atherosclerotic Heart Disease (ICD-9: 414.01)",
    secondaryDiagnosis: "Essential Hypertension (401.9)",
    a1cResult: "None",
    glucoseTest: "Norm",
    insulinChange: "Steady",
    diabetesMed: "No",
    assignedDoctor: "Dr. Robert Chen, MD",
    readmissionScore: 24,
    riskLevel: "Low",
    predictedReadmissionDays: 90,
    readmissionHistoryCount: 0,
    status: "Discharged",
    bedNumber: "Discharged",
    vitalSigns: {
      bloodPressure: "118/75 mmHg",
      heartRate: "68 bpm",
      oxygenSat: "99%",
      temp: "98.2 °F"
    },
    aiRiskFactors: [
      { factor: "Elective Admission Baseline", impact: "-15%", status: "low" },
      { factor: "Zero Recent Inpatient/Emergency Visits", impact: "-20%", status: "low" }
    ],
    careRecommendations: [
      "Routine 30-day cardiology checkup",
      "Standard discharge medication education"
    ]
  },
  {
    id: "PT-40182",
    encounterId: "ENC-661092",
    name: "Jameson Blake",
    ageGroup: "[80-90)",
    gender: "Male",
    admissionType: "Emergency",
    timeInHospital: 9,
    numLabProcedures: 78,
    numProcedures: 4,
    numMedications: 28,
    numberEmergency: 3,
    numberInpatient: 4,
    primaryDiagnosis: "Acute Myocardial Infarction (ICD-9: 410.71)",
    secondaryDiagnosis: "Uncontrolled Type 2 Diabetes (250.02)",
    a1cResult: ">8 (Abnormal)",
    glucoseTest: ">300",
    insulinChange: "Up",
    diabetesMed: "Yes",
    assignedDoctor: "Dr. Sarah Jenkins, MD",
    readmissionScore: 92,
    riskLevel: "High",
    predictedReadmissionDays: 8,
    readmissionHistoryCount: 4,
    status: "ICU Care",
    bedNumber: "ICU-308",
    vitalSigns: {
      bloodPressure: "156/98 mmHg",
      heartRate: "94 bpm",
      oxygenSat: "91%",
      temp: "99.1 °F"
    },
    aiRiskFactors: [
      { factor: "Advanced Age (>80) + STEMI Complication", impact: "+30%", status: "critical" },
      { factor: "High Frequency Readmission (>3 in past year)", impact: "+26%", status: "critical" },
      { factor: "Uncontrolled Blood Glucose (>300 mg/dL)", impact: "+20%", status: "high" }
    ],
    careRecommendations: [
      "Immediate multidisciplinary discharge committee review",
      "Home Health Nursing visits 3x weekly",
      "Direct phone triage with Cardiologist within 24 hours of discharge"
    ]
  },
  {
    id: "PT-50821",
    encounterId: "ENC-551829",
    name: "Clara Oswald",
    ageGroup: "[40-50)",
    gender: "Female",
    admissionType: "Emergency",
    timeInHospital: 3,
    numLabProcedures: 35,
    numProcedures: 1,
    numMedications: 11,
    numberEmergency: 1,
    numberInpatient: 0,
    primaryDiagnosis: "Asthma Exacerbation (ICD-9: 493.92)",
    secondaryDiagnosis: "Allergic Rhinitis (477.9)",
    a1cResult: "Norm",
    glucoseTest: "Norm",
    insulinChange: "No",
    diabetesMed: "No",
    assignedDoctor: "Dr. Robert Chen, MD",
    readmissionScore: 38,
    riskLevel: "Low",
    predictedReadmissionDays: 65,
    readmissionHistoryCount: 1,
    status: "Observation",
    bedNumber: "ROOM-204",
    vitalSigns: {
      bloodPressure: "122/78 mmHg",
      heartRate: "72 bpm",
      oxygenSat: "98%",
      temp: "98.6 °F"
    },
    aiRiskFactors: [
      { factor: "Single Emergency Encounter", impact: "+10%", status: "low" },
      { factor: "Stable Metabolic Panel", impact: "-10%", status: "low" }
    ],
    careRecommendations: [
      "Pulmonology follow-up in 14 days",
      "Inhaler technique verification before discharge"
    ]
  }
];

// AI Model Performance Metrics (PDF Page 11-12 Requirement)
export const MODEL_METRICS = {
  currentModel: "XGBoost Readmission Classifier v2.4",
  lastTrained: "2026-07-28 14:30 UTC",
  accuracy: "92.4%",
  precision: "89.1%",
  recall: "91.5%",
  f1Score: "90.3%",
  rocAuc: "0.942",
  confusionMatrix: {
    truePositive: 1420,
    falsePositive: 165,
    falseNegative: 132,
    trueNegative: 16480
  },
  featureImportances: [
    { feature: "Prior 12m Inpatient Admissions", importance: 0.28 },
    { feature: "HbA1c Serum Test Level (>8%)", importance: 0.22 },
    { feature: "Number of Medications Prescribed", importance: 0.16 },
    { feature: "Emergency Department Visits", importance: 0.14 },
    { feature: "Length of Hospital Stay (Days)", importance: 0.11 },
    { feature: "Primary Diagnosis Category (Cardiac/Diabetic)", importance: 0.09 }
  ],
  benchmarkComparison: [
    { algorithm: "XGBoost (Active Production)", accuracy: 92.4, ror: 0.942, f1: 90.3, status: "Active" },
    { algorithm: "Random Forest Classifier", accuracy: 89.8, ror: 0.915, f1: 88.1, status: "Standby" },
    { algorithm: "TensorFlow Deep Neural Net", accuracy: 91.2, ror: 0.931, f1: 89.5, status: "Standby" },
    { algorithm: "Logistic Regression Baseline", accuracy: 81.5, ror: 0.820, f1: 78.4, status: "Legacy" }
  ]
};

// Hospital Readmission & Healthcare Analytics Trends
export const HOSPITAL_ANALYTICS = {
  overallReadmissionRate: "14.2%",
  targetRate: "11.5%",
  monthlyReadmissionTrend: [
    { month: "Jan", actual: 16.8, predicted: 16.5, benchmark: 18.0 },
    { month: "Feb", actual: 15.9, predicted: 15.7, benchmark: 17.8 },
    { month: "Mar", actual: 15.2, predicted: 15.0, benchmark: 17.5 },
    { month: "Apr", actual: 14.8, predicted: 14.5, benchmark: 17.2 },
    { month: "May", actual: 14.3, predicted: 14.1, benchmark: 17.0 },
    { month: "Jun", actual: 13.9, predicted: 13.8, benchmark: 16.8 },
    { month: "Jul", actual: 14.2, predicted: 14.0, benchmark: 16.5 }
  ],
  departmentMetrics: [
    { department: "Cardiology", totalPatients: 420, highRisk: 84, readmissions: 58, rate: "13.8%" },
    { department: "Endocrinology", totalPatients: 680, highRisk: 196, readmissions: 112, rate: "16.4%" },
    { department: "Nephrology", totalPatients: 310, highRisk: 78, readmissions: 49, rate: "15.8%" },
    { department: "General Surgery", totalPatients: 510, highRisk: 42, readmissions: 35, rate: "6.8%" },
    { department: "Pulmonology", totalPatients: 290, highRisk: 55, readmissions: 31, rate: "10.6%" }
  ],
  treatmentEffectiveness: [
    { treatment: "Insulin Intensification + RPM", cohortSize: 340, readmissionReduction: "-38.5%", recoveryRate: "88.2%" },
    { treatment: "Standard Metformin Oral Protocol", cohortSize: 520, readmissionReduction: "-18.2%", recoveryRate: "76.4%" },
    { treatment: "Post-Discharge 48h Telehealth Call", cohortSize: 610, readmissionReduction: "-29.4%", recoveryRate: "84.1%" },
    { treatment: "Multidisciplinary Care Coordination", cohortSize: 280, readmissionReduction: "-42.1%", recoveryRate: "91.5%" }
  ]
};

// Registered Platform Users (PDF Page 2-3 User Management)
export const PLATFORM_USERS = [
  { id: "USR-001", name: "Dr. Sarah Jenkins, MD", email: "s.jenkins@healthforecast.ai", role: "Doctor", department: "Cardiology", status: "Active", lastActive: "2 mins ago" },
  { id: "USR-002", name: "Marcus Vance, MHA", email: "m.vance@healthforecast.ai", role: "Hospital Administrator", department: "Operations", status: "Active", lastActive: "1 hour ago" },
  { id: "USR-003", name: "Dr. Elena Rostova, PhD", email: "e.rostova@healthforecast.ai", role: "Healthcare Researcher", department: "AI & Epidemiology", status: "Active", lastActive: "15 mins ago" },
  { id: "USR-004", name: "Alex Thorne", email: "a.thorne@healthforecast.ai", role: "System Administrator", department: "IT Security", status: "Active", lastActive: "Just now" },
  { id: "USR-005", name: "Dr. Robert Chen, MD", email: "r.chen@healthforecast.ai", role: "Doctor", department: "Endocrinology", status: "Active", lastActive: "3 hours ago" }
];
