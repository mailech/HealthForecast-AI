import { User, Patient, AuditLog, ModelMetrics, AppNotification } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'USR-DOC-001',
    name: 'Dr. Anita Sharma',
    email: 'anita.sharma@stjudehealth.org',
    role: 'DOCTOR',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    title: 'Senior Endocrinologist & Attending Physician',
    department: 'Endocrinology',
    status: 'active',
    lastLogin: 'Today, 07:45 AM'
  },
  {
    id: 'USR-ADM-002',
    name: 'Dr. Katherine Vance',
    email: 'katherine.vance@stjudehealth.org',
    role: 'HOSPITAL_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    title: 'Chief Medical Officer & VP Clinical Quality',
    department: 'Hospital Administration',
    status: 'active',
    lastLogin: 'Today, 08:15 AM'
  },
  {
    id: 'USR-RES-003',
    name: 'Dr. Marcus Chen',
    email: 'marcus.chen@healthresearch.edu',
    role: 'HEALTHCARE_RESEARCHER',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256',
    title: 'Senior Healthcare Data Scientist & Epidemiologist',
    department: 'Population Health & Research',
    status: 'active',
    lastLogin: 'Yesterday, 04:30 PM'
  },
  {
    id: 'USR-SYS-004',
    name: 'Alex Mercer',
    email: 'alex.mercer@stjudehealth.org',
    role: 'SYSTEM_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    title: 'Lead Healthcare AI Systems Architect',
    department: 'Healthcare Informatics & IT',
    status: 'active',
    lastLogin: 'Today, 06:12 AM'
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'PT-10492',
    anonymizedId: 'PT-ANON-8812',
    name: 'Eleanor Vance',
    age: 71,
    gender: 'Female',
    dob: '1953-04-12',
    phone: '+1 (555) 234-8891',
    email: 'e.vance@fictionalmail.net',
    address: '428 Maple Ridge Blvd, Metro City',
    department: 'Endocrinology',
    primaryDiagnosis: 'Type 2 Diabetes Mellitus with Ketoacidosis',
    secondaryDiagnoses: ['Hypertension', 'Stage 3 Chronic Kidney Disease', 'Peripheral Neuropathy'],
    admissionDate: '2026-09-02',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'West Wing - 412B',
    riskScore: 88,
    riskLevel: 'HIGH',
    readmissionProbability: 0.84,
    recoveryScore: 42,
    lengthOfStay: 7,
    priorAdmissionsCount: 4,
    medicationCount: 11,
    hba1cLevel: '10.8%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 92,
    riskFactors: [
      { factor: 'Elevated HbA1c (>10%)', impactScore: 32, category: 'Laboratory', description: 'Severe glycemic dysregulation triggering microvascular stress' },
      { factor: 'Multiple Prior Admissions (4 in 12 mo)', impactScore: 28, category: 'Historical', description: 'Persistent cyclical decompensation pattern' },
      { factor: 'Renal Comorbidity (eGFR 38)', impactScore: 20, category: 'Clinical', description: 'Impairs medication clearance, elevates fluid imbalance' },
      { factor: 'Polypharmacy (11 active scripts)', impactScore: 12, category: 'Clinical', description: 'High adherence friction and drug-drug interaction profile' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 94 },
      { date: 'Day 3', score: 91 },
      { date: 'Day 5', score: 89 },
      { date: 'Day 7', score: 88 }
    ],
    medicalHistory: [
      { id: 'MH-1', date: '2025-11-14', diagnosis: 'Diabetic Hyperosmolar Hyperglycemic State', icd10: 'E11.01', notes: 'Required 4-day ICU stay with IV insulin titration.', physician: 'Dr. Anita Sharma', facility: 'St. Jude Metro' },
      { id: 'MH-2', date: '2026-03-22', diagnosis: 'Hypertensive Emergency with Dyspnea', icd10: 'I10', notes: 'Controlled with IV Nicardipine transition to oral regimens.', physician: 'Dr. James Rodriguez', facility: 'St. Jude Metro' },
      { id: 'MH-3', date: '2026-06-18', diagnosis: 'Acute Tubular Necrosis on CKD', icd10: 'N17.0', notes: 'Fluid overload post-infection, resolved prior to discharge.', physician: 'Dr. Anita Sharma', facility: 'St. Jude Metro' }
    ],
    admissions: [
      { id: 'ADM-2026-09', admissionDate: '2026-09-02', type: 'Emergency', department: 'Endocrinology', primaryDiagnosis: 'Diabetic Ketoacidosis', lengthOfStay: 7, dischargeDisposition: 'Pending' },
      { id: 'ADM-2026-06', admissionDate: '2026-06-18', dischargeDate: '2026-06-25', type: 'Urgent', department: 'Internal Medicine', primaryDiagnosis: 'Acute Kidney Injury', lengthOfStay: 7, dischargeDisposition: 'Home with VNA', readmittedWithin30Days: true }
    ],
    treatments: [
      { id: 'TX-1', treatmentName: 'Continuous IV Regular Insulin Protocol', category: 'Medication', startDate: '2026-09-02', endDate: '2026-09-05', outcome: 'Favorable', recoveryScore: 78, effectivenessPercentage: 86, medicationResponse: 'Blood glucose dropped from 480 mg/dL to stable 145 mg/dL', notes: 'Transitioned to subcutaneous basal-bolus regimen.', prescribingDoctor: 'Dr. Anita Sharma' },
      { id: 'TX-2', treatmentName: 'Empagliflozin SGLT2 Renal Dosing', category: 'Medication', startDate: '2026-09-06', outcome: 'Stable', recoveryScore: 65, effectivenessPercentage: 74, medicationResponse: 'Glucosuria monitored, eGFR stabilized at 38-41', notes: 'Careful hydration guidelines reinforced.', prescribingDoctor: 'Dr. Anita Sharma' }
    ],
    labResults: [
      { test: 'HbA1c', value: '10.8 %', reference: '< 5.7 %', status: 'critical', date: '2026-09-08' },
      { test: 'Serum Creatinine', value: '1.92 mg/dL', reference: '0.6 - 1.2 mg/dL', status: 'elevated', date: '2026-09-08' },
      { test: 'eGFR', value: '38 mL/min/1.73m²', reference: '> 60 mL/min', status: 'elevated', date: '2026-09-08' },
      { test: 'Serum Potassium', value: '4.6 mEq/L', reference: '3.5 - 5.0 mEq/L', status: 'normal', date: '2026-09-08' }
    ],
    recommendations: [
      { id: 'REC-1', category: 'Follow-up', priority: 'Urgent', recommendation: 'Schedule comprehensive endocrinology follow-up within 5 days of discharge', rationale: 'Critical window for insulin regimen reconciliation and ketone checks', timeframe: 'Within 5 days post-discharge' },
      { id: 'REC-2', category: 'Medication', priority: 'High', recommendation: 'Initiate home continuous glucose monitoring (CGM) sensor placement', rationale: 'Avoid recurrent hypoglycemia and nocturnal ketoacidosis swings', timeframe: 'Prior to discharge' },
      { id: 'REC-3', category: 'Monitoring', priority: 'High', recommendation: 'Order repeat basic metabolic panel (BMP) at day 3 post-discharge', rationale: 'Monitor eGFR and potassium response to modified SGLT2 dose', timeframe: 'Day 3 post-discharge' }
    ]
  },
  {
    id: 'PT-10518',
    anonymizedId: 'PT-ANON-7734',
    name: 'Robert C. Kowalski',
    age: 68,
    gender: 'Male',
    dob: '1956-08-20',
    phone: '+1 (555) 892-4412',
    email: 'r.kowalski@fictionalmail.net',
    address: '110 Riverbed Terrace, Metro City',
    department: 'Cardiology',
    primaryDiagnosis: 'Decompensated Congestive Heart Failure (NYHA Class III)',
    secondaryDiagnoses: ['Ischemic Cardiomyopathy', 'Atrial Fibrillation', 'Chronic Kidney Disease Stage 3'],
    admissionDate: '2026-09-04',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'Cardio Core - 304A',
    riskScore: 82,
    riskLevel: 'HIGH',
    readmissionProbability: 0.79,
    recoveryScore: 48,
    lengthOfStay: 5,
    priorAdmissionsCount: 3,
    medicationCount: 9,
    hba1cLevel: '7.4%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 89,
    riskFactors: [
      { factor: 'Elevated NT-proBNP (3,240 pg/mL)', impactScore: 30, category: 'Laboratory', description: 'Active ventricular stretch indicating ongoing volume overload' },
      { factor: '3 Heart Failure Readmissions within 6 Months', impactScore: 28, category: 'Historical', description: 'High disease velocity and treatment refractoriness' },
      { factor: 'Low Ejection Fraction (EF 28%)', impactScore: 22, category: 'Clinical', description: 'Substantial systolic impairment' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 89 },
      { date: 'Day 3', score: 85 },
      { date: 'Day 5', score: 82 }
    ],
    medicalHistory: [
      { id: 'MH-4', date: '2026-04-10', diagnosis: 'Acute Decompensated Heart Failure', icd10: 'I50.23', notes: 'Intensive IV Furosemide protocol, 4.2 kg fluid loss.', physician: 'Dr. James Rodriguez', facility: 'St. Jude Metro' }
    ],
    admissions: [
      { id: 'ADM-2026-09B', admissionDate: '2026-09-04', type: 'Emergency', department: 'Cardiology', primaryDiagnosis: 'Decompensated Heart Failure', lengthOfStay: 5, dischargeDisposition: 'Pending' }
    ],
    treatments: [
      { id: 'TX-3', treatmentName: 'IV Furosemide Diuresis + Sacubitril/Valsartan', category: 'Medication', startDate: '2026-09-04', outcome: 'Favorable', recoveryScore: 72, effectivenessPercentage: 80, medicationResponse: 'Negative fluid balance of 2.8L achieved in 48 hours', notes: 'Dyspnea significantly improved at rest.', prescribingDoctor: 'Dr. Anita Sharma' }
    ],
    labResults: [
      { test: 'NT-proBNP', value: '3,240 pg/mL', reference: '< 450 pg/mL', status: 'critical', date: '2026-09-08' },
      { test: 'Serum Creatinine', value: '1.65 mg/dL', reference: '0.7 - 1.3 mg/dL', status: 'elevated', date: '2026-09-08' },
      { test: 'Potassium', value: '4.2 mEq/L', reference: '3.5 - 5.0 mEq/L', status: 'normal', date: '2026-09-08' }
    ],
    recommendations: [
      { id: 'REC-4', category: 'Discharge', priority: 'Urgent', recommendation: 'Daily morning weight telemonitoring setup with cardiology alert threshold (±3 lbs in 24h)', rationale: 'Early fluid overload detection prevents acute emergency readmissions', timeframe: 'Day of discharge' },
      { id: 'REC-5', category: 'Follow-up', priority: 'High', recommendation: 'In-person Heart Failure Clinic visit at 7 days with electrolyte reassessment', rationale: 'Evaluate renal function stability after GDMT optimization', timeframe: 'Day 7 post-discharge' }
    ]
  },
  {
    id: 'PT-10384',
    anonymizedId: 'PT-ANON-6629',
    name: 'Marcus Brody',
    age: 59,
    gender: 'Male',
    dob: '1967-02-14',
    phone: '+1 (555) 773-1992',
    email: 'm.brody@fictionalmail.net',
    address: '89 Willow Creek Lane, Metro City',
    department: 'Internal Medicine',
    primaryDiagnosis: 'Severe Sepsis secondary to Pyelonephritis',
    secondaryDiagnoses: ['Uncontrolled Type 2 Diabetes', 'Morbid Obesity', 'Sleep Apnea'],
    admissionDate: '2026-09-03',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'North Wing - 208A',
    riskScore: 78,
    riskLevel: 'HIGH',
    readmissionProbability: 0.74,
    recoveryScore: 56,
    lengthOfStay: 6,
    priorAdmissionsCount: 2,
    medicationCount: 8,
    hba1cLevel: '9.2%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 87,
    riskFactors: [
      { factor: 'Recent Sepsis Recovery', impactScore: 29, category: 'Clinical', description: 'Post-sepsis syndrome with residual physical deconditioning' },
      { factor: 'Elevated Inflammatory Markers (CRP 48 mg/L)', impactScore: 24, category: 'Laboratory', description: 'Ongoing subclinical systemic inflammation' },
      { factor: 'HbA1c 9.2%', impactScore: 21, category: 'Laboratory', description: 'Immune compromise linked to sustained hyperglycemia' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 86 },
      { date: 'Day 3', score: 82 },
      { date: 'Day 6', score: 78 }
    ],
    medicalHistory: [
      { id: 'MH-5', date: '2026-01-18', diagnosis: 'Uncomplicated UTI with Hematuria', icd10: 'N39.0', notes: 'Treated outpatient with Ciprofloxacin.', physician: 'Dr. Anita Sharma', facility: 'St. Jude Metro' }
    ],
    admissions: [
      { id: 'ADM-2026-09C', admissionDate: '2026-09-03', type: 'Emergency', department: 'Internal Medicine', primaryDiagnosis: 'Severe Sepsis', lengthOfStay: 6, dischargeDisposition: 'Pending' }
    ],
    treatments: [
      { id: 'TX-4', treatmentName: 'IV Ceftriaxone 2g daily + Vigorous Crystalloid Resuscitation', category: 'Medication', startDate: '2026-09-03', outcome: 'Favorable', recoveryScore: 70, effectivenessPercentage: 88, medicationResponse: 'Afebrile for 48h, leukocytosis normalized from 18.4 to 8.9', notes: 'Culture sensitive to Cefpodoxime switch for oral step-down.', prescribingDoctor: 'Dr. Anita Sharma' }
    ],
    labResults: [
      { test: 'WBC Count', value: '8.9 K/uL', reference: '4.5 - 11.0 K/uL', status: 'normal', date: '2026-09-08' },
      { test: 'Lactate', value: '1.2 mmol/L', reference: '0.5 - 2.0 mmol/L', status: 'normal', date: '2026-09-08' },
      { test: 'Serum Creatinine', value: '1.28 mg/dL', reference: '0.7 - 1.3 mg/dL', status: 'normal', date: '2026-09-08' }
    ],
    recommendations: [
      { id: 'REC-6', category: 'Medication', priority: 'High', recommendation: 'Complete 10-day oral antibiotic course without missing doses', rationale: 'Prevent recurrent resistant bacteremia or relapse', timeframe: 'Next 10 days' },
      { id: 'REC-7', category: 'Follow-up', priority: 'Routine', recommendation: 'Primary care repeat urinalysis in 14 days', rationale: 'Confirm total microbiological clearance', timeframe: 'Day 14' }
    ]
  },
  {
    id: 'PT-10620',
    anonymizedId: 'PT-ANON-5511',
    name: 'Sophia Martinez',
    age: 63,
    gender: 'Female',
    dob: '1963-11-03',
    phone: '+1 (555) 349-9912',
    email: 's.martinez@fictionalmail.net',
    address: '77 Horizon Heights, Metro City',
    department: 'Pulmonology',
    primaryDiagnosis: 'Acute Exacerbation of Chronic Obstructive Pulmonary Disease (COPD)',
    secondaryDiagnoses: ['Cor Pulmonale', 'Nicotine Dependence', 'Osteoporosis'],
    admissionDate: '2026-09-05',
    status: 'Discharge Planning',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'East Wing - 118',
    riskScore: 72,
    riskLevel: 'HIGH',
    readmissionProbability: 0.68,
    recoveryScore: 64,
    lengthOfStay: 4,
    priorAdmissionsCount: 3,
    medicationCount: 7,
    hba1cLevel: '6.2%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 84,
    riskFactors: [
      { factor: 'Frequent Exacerbator Phenotype (>2/yr)', impactScore: 31, category: 'Historical', description: 'Baseline FEV1 < 40% predicted with repeated hospitalizations' },
      { factor: 'Home Oxygen Requirement (2L NC)', impactScore: 23, category: 'Clinical', description: 'Persistent hypoxemia and low physiological reserve' },
      { factor: 'Inhaler Technique Deficits', impactScore: 18, category: 'Clinical', description: 'Poor medication delivery into lower airways' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 79 },
      { date: 'Day 2', score: 76 },
      { date: 'Day 4', score: 72 }
    ],
    medicalHistory: [
      { id: 'MH-6', date: '2026-05-12', diagnosis: 'COPD Exacerbation with Hypercapnia', icd10: 'J44.1', notes: 'Managed with BiPAP for 24h, responded to steroids.', physician: 'Dr. Anita Sharma', facility: 'St. Jude Metro' }
    ],
    admissions: [
      { id: 'ADM-2026-09D', admissionDate: '2026-09-05', type: 'Urgent', department: 'Pulmonology', primaryDiagnosis: 'COPD Exacerbation', lengthOfStay: 4, dischargeDisposition: 'Home' }
    ],
    treatments: [
      { id: 'TX-5', treatmentName: 'Oral Prednisone 40mg taper + Duoneb nebulizations', category: 'Medication', startDate: '2026-09-05', outcome: 'Favorable', recoveryScore: 80, effectivenessPercentage: 85, medicationResponse: 'FEV1 improved by 220mL, wheezing resolved', notes: 'Ready for outpatient maintenance triple therapy.', prescribingDoctor: 'Dr. Anita Sharma' }
    ],
    labResults: [
      { test: 'Arterial pO2', value: '72 mmHg', reference: '80 - 100 mmHg', status: 'elevated', date: '2026-09-08' },
      { test: 'Arterial pCO2', value: '44 mmHg', reference: '35 - 45 mmHg', status: 'normal', date: '2026-09-08' }
    ],
    recommendations: [
      { id: 'REC-8', category: 'Education', priority: 'High', recommendation: 'Conduct teach-back inhaler technique session for Triple Therapy dry powder inhaler', rationale: 'Incorrect technique is the #1 preventable driver of 30-day COPD relapse', timeframe: 'Pre-discharge today' },
      { id: 'REC-9', category: 'Follow-up', priority: 'High', recommendation: 'Pulmonary Rehabilitation intake within 10 days', rationale: 'Significantly lowers all-cause 30-day hospitalization', timeframe: 'Day 10' }
    ]
  },
  {
    id: 'PT-10705',
    anonymizedId: 'PT-ANON-4490',
    name: 'David K. Henderson',
    age: 52,
    gender: 'Male',
    dob: '1974-05-30',
    phone: '+1 (555) 601-3829',
    email: 'd.henderson@fictionalmail.net',
    address: '512 Oakwood Court, Metro City',
    department: 'Cardiology',
    primaryDiagnosis: 'Non-ST Elevation Myocardial Infarction (NSTEMI)',
    secondaryDiagnoses: ['Hyperlipidemia', 'Essential Hypertension'],
    admissionDate: '2026-09-06',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-002',
    assignedDoctorName: 'Dr. James Rodriguez',
    roomNumber: 'Cardio West - 310',
    riskScore: 54,
    riskLevel: 'MEDIUM',
    readmissionProbability: 0.46,
    recoveryScore: 72,
    lengthOfStay: 3,
    priorAdmissionsCount: 1,
    medicationCount: 6,
    hba1cLevel: '5.9%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 91,
    riskFactors: [
      { factor: 'Recent Percutaneous Coronary Intervention (PCI)', impactScore: 28, category: 'Clinical', description: 'Drug-eluting stent placed in Left Anterior Descending' },
      { factor: 'Dual Antiplatelet Therapy (DAPT) Compliance', impactScore: 22, category: 'Medication', description: 'Stent thrombosis risk if clopidogrel is prematurely paused' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 62 },
      { date: 'Day 2', score: 58 },
      { date: 'Day 3', score: 54 }
    ],
    medicalHistory: [
      { id: 'MH-7', date: '2024-09-10', diagnosis: 'Unstable Angina', icd10: 'I20.0', notes: 'Managed with medical therapy and lifestyle changes.', physician: 'Dr. James Rodriguez', facility: 'St. Jude Metro' }
    ],
    admissions: [
      { id: 'ADM-2026-09E', admissionDate: '2026-09-06', type: 'Emergency', department: 'Cardiology', primaryDiagnosis: 'NSTEMI', lengthOfStay: 3, dischargeDisposition: 'Pending' }
    ],
    treatments: [
      { id: 'TX-6', treatmentName: 'Drug-Eluting Stent (DES) + Ticagrelor 90mg BID', category: 'Surgical', startDate: '2026-09-06', outcome: 'Favorable', recoveryScore: 88, effectivenessPercentage: 94, medicationResponse: 'TIMI-3 flow restored with zero residual stenosis', notes: 'Cardiac enzymes trending down nicely.', prescribingDoctor: 'Dr. James Rodriguez' }
    ],
    labResults: [
      { test: 'Troponin I', value: '0.14 ng/mL', reference: '< 0.04 ng/mL', status: 'elevated', date: '2026-09-08' },
      { test: 'Total Cholesterol', value: '235 mg/dL', reference: '< 200 mg/dL', status: 'elevated', date: '2026-09-07' }
    ],
    recommendations: [
      { id: 'REC-10', category: 'Medication', priority: 'Urgent', recommendation: 'Strict antiplatelet counseling - zero missed doses of Ticagrelor', rationale: 'Prevent acute stent thrombosis', timeframe: 'Daily x 12 months' },
      { id: 'REC-11', category: 'Follow-up', priority: 'Routine', recommendation: 'Cardiology post-PCI clinic review and cardiac rehab kickoff', rationale: 'Secondary prevention optimization', timeframe: 'Day 14' }
    ]
  },
  {
    id: 'PT-10782',
    anonymizedId: 'PT-ANON-3309',
    name: 'Margaret "Peggy" Olsen',
    age: 76,
    gender: 'Female',
    dob: '1949-12-09',
    phone: '+1 (555) 431-7781',
    email: 'm.olsen@fictionalmail.net',
    address: '320 Evergreen Way, Metro City',
    department: 'Geriatrics',
    primaryDiagnosis: 'Hypoglycemia with Recurrent Falls and Contusion',
    secondaryDiagnoses: ['Type 2 Diabetes (Over-basalized)', 'Mild Cognitive Impairment', 'Osteoarthritis'],
    admissionDate: '2026-09-05',
    status: 'Observation',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'Geriatric Unit - 104',
    riskScore: 68,
    riskLevel: 'MEDIUM',
    readmissionProbability: 0.62,
    recoveryScore: 59,
    lengthOfStay: 4,
    priorAdmissionsCount: 2,
    medicationCount: 10,
    hba1cLevel: '6.0% (Overtreated)',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 88,
    riskFactors: [
      { factor: 'Iatrogenic Hypoglycemia (Glucose 42 on admission)', impactScore: 34, category: 'Clinical', description: 'Overly stringent glycemic target in geriatric patient' },
      { factor: 'High Fall Risk Score (Morse 75)', impactScore: 26, category: 'Clinical', description: 'Gait instability and medication sedation' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 74 },
      { date: 'Day 3', score: 68 }
    ],
    medicalHistory: [
      { id: 'MH-8', date: '2026-02-14', diagnosis: 'Mechanical Fall with Wrist Sprain', icd10: 'W19.XXXA', notes: 'Negative for acute fracture.', physician: 'Dr. Anita Sharma', facility: 'St. Jude Metro' }
    ],
    admissions: [
      { id: 'ADM-2026-09F', admissionDate: '2026-09-05', type: 'Emergency', department: 'Geriatrics', primaryDiagnosis: 'Symptomatic Hypoglycemia', lengthOfStay: 4, dischargeDisposition: 'Pending' }
    ],
    treatments: [
      { id: 'TX-7', treatmentName: 'Deprescribing Sulfonylurea + Relaxed Glycemic Target (HbA1c 7.5-8.0%)', category: 'Medication', startDate: '2026-09-05', outcome: 'Favorable', recoveryScore: 76, effectivenessPercentage: 92, medicationResponse: 'Zero hypoglycemia episodes since Glimepiride discontinuation', notes: 'Patient and daughter educated on glucose goals.', prescribingDoctor: 'Dr. Anita Sharma' }
    ],
    labResults: [
      { test: 'Point of Care Glucose', value: '138 mg/dL', reference: '70 - 140 mg/dL', status: 'normal', date: '2026-09-08' },
      { test: 'HbA1c', value: '6.0 %', reference: '6.5 - 7.5 % (Geriatric)', status: 'low', date: '2026-09-05' }
    ],
    recommendations: [
      { id: 'REC-12', category: 'Medication', priority: 'Urgent', recommendation: 'Permanent discontinuation of Glimepiride; replace with low-dose DPP-4 inhibitor', rationale: 'Eliminate hypoglycemia and fall hazard', timeframe: 'Immediate' },
      { id: 'REC-13', category: 'Monitoring', priority: 'High', recommendation: 'Physical Therapy home safety and gait evaluation', rationale: 'Reduce readmissions driven by repeat mechanical falls', timeframe: 'Day 3 post-discharge' }
    ]
  },
  {
    id: 'PT-10830',
    anonymizedId: 'PT-ANON-2194',
    name: 'James L. Gallagher',
    age: 44,
    gender: 'Male',
    dob: '1981-10-18',
    phone: '+1 (555) 912-0041',
    email: 'j.gallagher@fictionalmail.net',
    address: '14 Elmira Drive, Metro City',
    department: 'Internal Medicine',
    primaryDiagnosis: 'Uncomplicated Community-Acquired Pneumonia',
    secondaryDiagnoses: ['Asthma (Mild Intermittent)'],
    admissionDate: '2026-09-07',
    status: 'Discharge Planning',
    assignedDoctorId: 'USR-DOC-003',
    assignedDoctorName: 'Dr. Emily Watson',
    roomNumber: 'West Wing - 202',
    riskScore: 24,
    riskLevel: 'LOW',
    readmissionProbability: 0.18,
    recoveryScore: 89,
    lengthOfStay: 2,
    priorAdmissionsCount: 0,
    medicationCount: 3,
    hba1cLevel: '5.2%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 95,
    riskFactors: [
      { factor: 'Younger demographic (Age 44)', impactScore: 10, category: 'Demographic', description: 'Strong physiologic reserve' },
      { factor: 'Zero prior admissions in 36 months', impactScore: 8, category: 'Historical', description: 'Low chronic utilization profile' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 32 },
      { date: 'Day 2', score: 24 }
    ],
    medicalHistory: [],
    admissions: [
      { id: 'ADM-2026-09G', admissionDate: '2026-09-07', type: 'Urgent', department: 'Internal Medicine', primaryDiagnosis: 'Pneumonia', lengthOfStay: 2, dischargeDisposition: 'Home' }
    ],
    treatments: [
      { id: 'TX-8', treatmentName: 'Azithromycin + Amoxicillin/Clavulanate oral', category: 'Medication', startDate: '2026-09-07', outcome: 'Favorable', recoveryScore: 92, effectivenessPercentage: 96, medicationResponse: 'Cough greatly decreased, lungs clear on auscultation', notes: 'Discharge safe today.', prescribingDoctor: 'Dr. Emily Watson' }
    ],
    labResults: [
      { test: 'WBC Count', value: '6.4 K/uL', reference: '4.5 - 11.0 K/uL', status: 'normal', date: '2026-09-08' }
    ],
    recommendations: [
      { id: 'REC-14', category: 'Discharge', priority: 'Routine', recommendation: 'Complete 5-day oral antibiotic course and rest at home', rationale: 'Complete resolution of residual consolidation', timeframe: 'Day 5' }
    ]
  },
  {
    id: 'PT-10891',
    anonymizedId: 'PT-ANON-1088',
    name: 'Carmen Delgado',
    age: 66,
    gender: 'Female',
    dob: '1960-03-25',
    phone: '+1 (555) 781-6623',
    email: 'c.delgado@fictionalmail.net',
    address: '900 Sunburst Ave, Metro City',
    department: 'Endocrinology',
    primaryDiagnosis: 'Diabetic Foot Ulcer with Cellulitis (Wagner Grade 2)',
    secondaryDiagnoses: ['Type 2 Diabetes Mellitus', 'Peripheral Artery Disease', 'Neuropathy'],
    admissionDate: '2026-09-03',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'North Wing - 315',
    riskScore: 76,
    riskLevel: 'HIGH',
    readmissionProbability: 0.72,
    recoveryScore: 54,
    lengthOfStay: 6,
    priorAdmissionsCount: 3,
    medicationCount: 8,
    hba1cLevel: '9.8%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 89,
    riskFactors: [
      { factor: 'Chronic Wound with Neuropathy', impactScore: 30, category: 'Clinical', description: 'High risk of reinfection, osteomyelitis, or amputation' },
      { factor: 'Poor Glycemic Control (HbA1c 9.8%)', impactScore: 28, category: 'Laboratory', description: 'Impairs microcirculation and tissue regeneration' },
      { factor: 'PVD (Peripheral Vascular Disease)', impactScore: 22, category: 'Clinical', description: 'Limited perfusion delay in healing' }
    ],
    historicalRisk: [
      { date: 'Day 1', score: 81 },
      { date: 'Day 3', score: 79 },
      { date: 'Day 6', score: 76 }
    ],
    medicalHistory: [
      { id: 'MH-9', date: '2025-08-19', diagnosis: 'Right Great Toe Debridement', icd10: 'L97.512', notes: 'Healed after 8 weeks wound clinic therapy.', physician: 'Dr. Anita Sharma', facility: 'St. Jude Metro' }
    ],
    admissions: [
      { id: 'ADM-2026-09H', admissionDate: '2026-09-03', type: 'Emergency', department: 'Endocrinology', primaryDiagnosis: 'Diabetic Foot Infection', lengthOfStay: 6, dischargeDisposition: 'Pending' }
    ],
    treatments: [
      { id: 'TX-9', treatmentName: 'Surgical Debridement + IV Ampicillin-Sulbactam', category: 'Surgical', startDate: '2026-09-04', outcome: 'Favorable', recoveryScore: 74, effectivenessPercentage: 82, medicationResponse: 'Granulation tissue forming, erythema receded 4 cm', notes: 'Wound VAC applied with wound care nurse.', prescribingDoctor: 'Dr. Anita Sharma' }
    ],
    labResults: [
      { test: 'ESR (Sed Rate)', value: '62 mm/hr', reference: '< 30 mm/hr', status: 'elevated', date: '2026-09-08' },
      { test: 'HbA1c', value: '9.8 %', reference: '< 5.7 %', status: 'critical', date: '2026-09-04' }
    ],
    recommendations: [
      { id: 'REC-15', category: 'Follow-up', priority: 'Urgent', recommendation: 'Wound Care Clinic appointment twice weekly starting within 48h of discharge', rationale: 'Prevent graft failure and rapid readmission for osteomyelitis', timeframe: 'Day 2 post-discharge' },
      { id: 'REC-16', category: 'Education', priority: 'High', recommendation: 'Diabetic off-loading orthotic boot compliance verification', rationale: 'Zero weight-bearing on active plantar ulcer site', timeframe: 'Immediate' }
    ]
  },
  // Additional patients for broad clinical representation
  {
    id: 'PT-10902',
    anonymizedId: 'PT-ANON-9011',
    name: 'Arthur Pendelton',
    age: 79,
    gender: 'Male',
    dob: '1947-01-15',
    phone: '+1 (555) 203-9182',
    email: 'a.pendelton@fictionalmail.net',
    address: '810 Heritage Trail, Metro City',
    department: 'Geriatrics',
    primaryDiagnosis: 'Post-Stroke Hemiparesis with Aspiration Risk',
    secondaryDiagnoses: ['Atrial Fibrillation', 'Hypertension', 'Dysphagia'],
    admissionDate: '2026-09-01',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-002',
    assignedDoctorName: 'Dr. James Rodriguez',
    roomNumber: 'Rehab Wing - 501',
    riskScore: 85,
    riskLevel: 'HIGH',
    readmissionProbability: 0.81,
    recoveryScore: 45,
    lengthOfStay: 8,
    priorAdmissionsCount: 4,
    medicationCount: 12,
    hba1cLevel: '6.8%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 93,
    riskFactors: [
      { factor: 'Dysphagia with Aspiration Pneumonia history', impactScore: 35, category: 'Clinical', description: 'Requires thickened liquids and speech therapy feeding protocols' },
      { factor: 'Anticoagulation for AFib with High Fall Risk', impactScore: 28, category: 'Clinical', description: 'Balancing bleeding risk vs ischemic stroke' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 92 }, { date: 'Day 4', score: 88 }, { date: 'Day 8', score: 85 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-10902', admissionDate: '2026-09-01', type: 'Emergency', department: 'Geriatrics', primaryDiagnosis: 'Ischemic Stroke', lengthOfStay: 8, dischargeDisposition: 'Subacute Rehab' }],
    treatments: [{ id: 'TX-10902', treatmentName: 'Intensive Physical & Occupational Therapy + Apixaban', category: 'Therapy', startDate: '2026-09-02', outcome: 'Stable', recoveryScore: 55, effectivenessPercentage: 70, medicationResponse: 'Swallowing reflex improved on puree diet', notes: 'Transfer to skilled nursing facility requested.', prescribingDoctor: 'Dr. James Rodriguez' }],
    labResults: [{ test: 'INR', value: '1.1', reference: '0.8 - 1.2', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-902', category: 'Follow-up', priority: 'Urgent', recommendation: 'Coordinate warm handoff with Subacute Rehab facility nursing staff', rationale: 'Prevent medication transition errors', timeframe: 'Pre-discharge' }]
  },
  {
    id: 'PT-10933',
    anonymizedId: 'PT-ANON-9334',
    name: 'Sarah Jenkins',
    age: 49,
    gender: 'Female',
    dob: '1977-07-11',
    phone: '+1 (555) 441-2890',
    email: 's.jenkins@fictionalmail.net',
    address: '29 Cloverdale St, Metro City',
    department: 'Endocrinology',
    primaryDiagnosis: 'Uncontrolled Type 1 Diabetes with Recurrent Hypoglycemia',
    secondaryDiagnoses: ['Gastroparesis', 'Retinopathy'],
    admissionDate: '2026-09-06',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'West Wing - 404',
    riskScore: 79,
    riskLevel: 'HIGH',
    readmissionProbability: 0.76,
    recoveryScore: 51,
    lengthOfStay: 3,
    priorAdmissionsCount: 3,
    medicationCount: 6,
    hba1cLevel: '11.4%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 90,
    riskFactors: [
      { factor: 'Erratic carbohydrate absorption due to gastroparesis', impactScore: 33, category: 'Clinical', description: 'Mismatch between prandial insulin bolus timing and gastric emptying' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 84 }, { date: 'Day 3', score: 79 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-10933', admissionDate: '2026-09-06', type: 'Emergency', department: 'Endocrinology', primaryDiagnosis: 'Severe Hypoglycemia', lengthOfStay: 3, dischargeDisposition: 'Pending' }],
    treatments: [{ id: 'TX-10933', treatmentName: 'Continuous Subcutaneous Insulin Infusion (Pump) readjustment', category: 'Medication', startDate: '2026-09-06', outcome: 'Favorable', recoveryScore: 78, effectivenessPercentage: 84, medicationResponse: 'Extended wave bolus configured', notes: 'Patient understands dual-wave delivery.', prescribingDoctor: 'Dr. Anita Sharma' }],
    labResults: [{ test: 'HbA1c', value: '11.4 %', reference: '< 5.7 %', status: 'critical', date: '2026-09-06' }],
    recommendations: [{ id: 'REC-933', category: 'Follow-up', priority: 'Urgent', recommendation: 'Consult clinical diabetes educator (CDCES) for post-meal insulin scheduling', rationale: 'Mitigate erratic post-prandial drops', timeframe: 'Day 3' }]
  },
  {
    id: 'PT-10955',
    anonymizedId: 'PT-ANON-9551',
    name: 'Benjamin Frank',
    age: 62,
    gender: 'Male',
    dob: '1964-09-14',
    phone: '+1 (555) 312-8874',
    email: 'b.frank@fictionalmail.net',
    address: '104 Beacon Ave, Metro City',
    department: 'Cardiology',
    primaryDiagnosis: 'Hypertensive Cardiomyopathy with Dyspnea',
    secondaryDiagnoses: ['Stage 2 Hypertension', 'Sleep Apnea'],
    admissionDate: '2026-09-05',
    status: 'Observation',
    assignedDoctorId: 'USR-DOC-002',
    assignedDoctorName: 'Dr. James Rodriguez',
    roomNumber: 'Cardio West - 302',
    riskScore: 52,
    riskLevel: 'MEDIUM',
    readmissionProbability: 0.45,
    recoveryScore: 68,
    lengthOfStay: 4,
    priorAdmissionsCount: 1,
    medicationCount: 5,
    hba1cLevel: '5.8%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 89,
    riskFactors: [
      { factor: 'Systolic BP fluctuations (>160 mmHg on exertion)', impactScore: 26, category: 'Clinical', description: 'Requires dual anti-hypertensive regimen adjustment' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 60 }, { date: 'Day 4', score: 52 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-10955', admissionDate: '2026-09-05', type: 'Urgent', department: 'Cardiology', primaryDiagnosis: 'Hypertensive Urgency', lengthOfStay: 4, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-10955', treatmentName: 'Amlodipine 10mg + Losartan 100mg combination', category: 'Medication', startDate: '2026-09-05', outcome: 'Favorable', recoveryScore: 82, effectivenessPercentage: 90, medicationResponse: 'BP reduced from 184/102 to 128/78 mmHg', notes: 'Well tolerated without peripheral edema.', prescribingDoctor: 'Dr. James Rodriguez' }],
    labResults: [{ test: 'Serum Creatinine', value: '1.05 mg/dL', reference: '0.7 - 1.3 mg/dL', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-955', category: 'Monitoring', priority: 'Routine', recommendation: 'Log home blood pressure twice daily in digital patient portal', rationale: 'Maintain BP < 130/80', timeframe: 'Daily' }]
  },
  {
    id: 'PT-10970',
    anonymizedId: 'PT-ANON-9702',
    name: 'Grace Hopper-Lee',
    age: 58,
    gender: 'Female',
    dob: '1968-04-02',
    phone: '+1 (555) 762-9901',
    email: 'g.hopperlee@fictionalmail.net',
    address: '612 Magnolia Court, Metro City',
    department: 'Pulmonology',
    primaryDiagnosis: 'Severe Persistent Asthma with Bronchospasm',
    secondaryDiagnoses: ['Allergic Rhinitis', 'Gastroesophageal Reflux Disease'],
    admissionDate: '2026-09-07',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-003',
    assignedDoctorName: 'Dr. Emily Watson',
    roomNumber: 'East Wing - 110',
    riskScore: 48,
    riskLevel: 'MEDIUM',
    readmissionProbability: 0.39,
    recoveryScore: 74,
    lengthOfStay: 2,
    priorAdmissionsCount: 1,
    medicationCount: 4,
    hba1cLevel: '5.5%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 92,
    riskFactors: [
      { factor: 'Recent allergen trigger exposure', impactScore: 20, category: 'Clinical', description: 'Seasonal exacerbation with nocturnal cough' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 55 }, { date: 'Day 2', score: 48 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-10970', admissionDate: '2026-09-07', type: 'Emergency', department: 'Pulmonology', primaryDiagnosis: 'Asthma Exacerbation', lengthOfStay: 2, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-10970', treatmentName: 'Budesonide/Formoterol SMART inhaler protocol', category: 'Medication', startDate: '2026-09-07', outcome: 'Favorable', recoveryScore: 86, effectivenessPercentage: 92, medicationResponse: 'Peak expiratory flow increased from 240 to 390 L/min', notes: 'Asthma action plan reviewed.', prescribingDoctor: 'Dr. Emily Watson' }],
    labResults: [{ test: 'Peak Flow', value: '390 L/min', reference: '> 380 L/min', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-970', category: 'Education', priority: 'Routine', recommendation: 'Review environmental allergen mitigation at home', rationale: 'Prevent bronchospasm recurrence', timeframe: 'Day 7' }]
  },
  {
    id: 'PT-10991',
    anonymizedId: 'PT-ANON-9918',
    name: 'Samuel T. Adams',
    age: 73,
    gender: 'Male',
    dob: '1953-06-19',
    phone: '+1 (555) 492-3321',
    email: 's.adams@fictionalmail.net',
    address: '405 Lexington Rd, Metro City',
    department: 'Cardiology',
    primaryDiagnosis: 'Atrial Flutter with Rapid Ventricular Response (RVR)',
    secondaryDiagnoses: ['Hypertension', 'Previous TIA'],
    admissionDate: '2026-09-04',
    status: 'Discharge Planning',
    assignedDoctorId: 'USR-DOC-002',
    assignedDoctorName: 'Dr. James Rodriguez',
    roomNumber: 'Cardio West - 308',
    riskScore: 61,
    riskLevel: 'MEDIUM',
    readmissionProbability: 0.54,
    recoveryScore: 71,
    lengthOfStay: 5,
    priorAdmissionsCount: 2,
    medicationCount: 6,
    hba1cLevel: '6.4%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 89,
    riskFactors: [
      { factor: 'CHA2DS2-VASc Score = 4 (High Stroke Risk)', impactScore: 30, category: 'Clinical', description: 'Requires lifelong therapeutic anticoagulation' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 72 }, { date: 'Day 3', score: 65 }, { date: 'Day 5', score: 61 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-10991', admissionDate: '2026-09-04', type: 'Emergency', department: 'Cardiology', primaryDiagnosis: 'Atrial Flutter', lengthOfStay: 5, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-10991', treatmentName: 'Direct-Current Cardioversion + Metoprolol Succinate', category: 'Surgical', startDate: '2026-09-05', outcome: 'Favorable', recoveryScore: 88, effectivenessPercentage: 95, medicationResponse: 'Sinus rhythm successfully restored, heart rate 68 bpm', notes: 'Patient tolerating oral beta-blocker.', prescribingDoctor: 'Dr. James Rodriguez' }],
    labResults: [{ test: 'ECG', value: 'Normal Sinus Rhythm', reference: 'NSR', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-991', category: 'Medication', priority: 'High', recommendation: 'Initiate Eliquis (Apixaban) 5mg BID with strict bleeding precautions', rationale: 'Stroke prevention post-cardioversion', timeframe: 'Day 1' }]
  },
  {
    id: 'PT-11004',
    anonymizedId: 'PT-ANON-1004',
    name: 'Fatima Al-Mansoor',
    age: 46,
    gender: 'Female',
    dob: '1980-09-02',
    phone: '+1 (555) 883-9112',
    email: 'f.almansoor@fictionalmail.net',
    address: '772 Cedar Crest, Metro City',
    department: 'Endocrinology',
    primaryDiagnosis: 'New-Onset Type 2 Diabetes with Glycemic Spikes',
    secondaryDiagnoses: ['Polycystic Ovary Syndrome', 'Dyslipidemia'],
    admissionDate: '2026-09-07',
    status: 'Observation',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'West Wing - 418',
    riskScore: 31,
    riskLevel: 'LOW',
    readmissionProbability: 0.22,
    recoveryScore: 88,
    lengthOfStay: 2,
    priorAdmissionsCount: 0,
    medicationCount: 2,
    hba1cLevel: '8.4%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 94,
    riskFactors: [
      { factor: 'New diagnosis learning curve', impactScore: 18, category: 'Demographic', description: 'Requires comprehensive diabetes self-management training' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 38 }, { date: 'Day 2', score: 31 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11004', admissionDate: '2026-09-07', type: 'Urgent', department: 'Endocrinology', primaryDiagnosis: 'Type 2 Diabetes', lengthOfStay: 2, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-11004', treatmentName: 'Metformin 500mg daily titration + Medical Nutrition Therapy', category: 'Medication', startDate: '2026-09-07', outcome: 'Favorable', recoveryScore: 90, effectivenessPercentage: 92, medicationResponse: 'Fasting glucose lowered to 122 mg/dL', notes: 'Patient eager to adopt low glycemic diet.', prescribingDoctor: 'Dr. Anita Sharma' }],
    labResults: [{ test: 'Fasting Glucose', value: '122 mg/dL', reference: '70 - 99 mg/dL', status: 'elevated', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-1004', category: 'Education', priority: 'Routine', recommendation: 'Enroll in 4-session Outpatient Diabetes Self-Management Education (DSME)', rationale: 'Proven 40% reduction in long-term diabetes readmissions', timeframe: 'Day 14' }]
  },
  {
    id: 'PT-11029',
    anonymizedId: 'PT-ANON-1029',
    name: 'George K. Ramirez',
    age: 65,
    gender: 'Male',
    dob: '1961-08-14',
    phone: '+1 (555) 334-1188',
    email: 'g.ramirez@fictionalmail.net',
    address: '19 Valley View Road, Metro City',
    department: 'Internal Medicine',
    primaryDiagnosis: 'Acute Pancreatitis (Biliary etiology, resolved)',
    secondaryDiagnoses: ['Cholelithiasis', 'Hypertension'],
    admissionDate: '2026-09-04',
    status: 'Discharge Planning',
    assignedDoctorId: 'USR-DOC-003',
    assignedDoctorName: 'Dr. Emily Watson',
    roomNumber: 'North Wing - 212',
    riskScore: 28,
    riskLevel: 'LOW',
    readmissionProbability: 0.20,
    recoveryScore: 86,
    lengthOfStay: 5,
    priorAdmissionsCount: 0,
    medicationCount: 3,
    hba1cLevel: '5.6%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 93,
    riskFactors: [
      { factor: 'Elective cholecystectomy pending', impactScore: 16, category: 'Clinical', description: 'Scheduled outpatient in 3 weeks to prevent recurrent pancreatitis' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 50 }, { date: 'Day 3', score: 38 }, { date: 'Day 5', score: 28 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11029', admissionDate: '2026-09-04', type: 'Emergency', department: 'Internal Medicine', primaryDiagnosis: 'Acute Pancreatitis', lengthOfStay: 5, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-11029', treatmentName: 'Fluid resuscitation + bowel rest + gradual low-fat oral refeeding', category: 'Therapy', startDate: '2026-09-04', outcome: 'Favorable', recoveryScore: 92, effectivenessPercentage: 96, medicationResponse: 'Lipase normalized from 1,420 to 52 U/L', notes: 'Tolerating regular solids with zero abdominal pain.', prescribingDoctor: 'Dr. Emily Watson' }],
    labResults: [{ test: 'Serum Lipase', value: '52 U/L', reference: '10 - 140 U/L', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-1029', category: 'Follow-up', priority: 'Routine', recommendation: 'Outpatient surgical consult for elective laparoscopic cholecystectomy', rationale: 'Eliminate risk of recurrent gallstone pancreatitis', timeframe: 'Within 3 weeks' }]
  },
  {
    id: 'PT-11048',
    anonymizedId: 'PT-ANON-1048',
    name: 'Helena Rostov',
    age: 82,
    gender: 'Female',
    dob: '1944-11-29',
    phone: '+1 (555) 776-5502',
    email: 'h.rostov@fictionalmail.net',
    address: '500 Silver Birch Manor, Metro City',
    department: 'Geriatrics',
    primaryDiagnosis: 'Subacute Delirium secondary to Polypharmacy & Dehydration',
    secondaryDiagnoses: ['Vascular Dementia', 'Osteoporosis', 'Chronic Constipation'],
    admissionDate: '2026-09-02',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'Geriatric Unit - 112',
    riskScore: 84,
    riskLevel: 'HIGH',
    readmissionProbability: 0.82,
    recoveryScore: 44,
    lengthOfStay: 7,
    priorAdmissionsCount: 4,
    medicationCount: 14,
    hba1cLevel: '7.1%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 91,
    riskFactors: [
      { factor: 'Beers Criteria Medications (Sedative & Anticholinergic burden)', impactScore: 36, category: 'Medication', description: 'Extreme vulnerability to drug-induced delirium' },
      { factor: 'Advanced Age (82) with Vascular Dementia', impactScore: 28, category: 'Demographic', description: 'Requires structured caregiver support' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 91 }, { date: 'Day 4', score: 87 }, { date: 'Day 7', score: 84 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11048', admissionDate: '2026-09-02', type: 'Emergency', department: 'Geriatrics', primaryDiagnosis: 'Delirium', lengthOfStay: 7, dischargeDisposition: 'Pending' }],
    treatments: [{ id: 'TX-11048', treatmentName: 'Comprehensive Geriatric Medication Reconciliation & Deprescribing', category: 'Medication', startDate: '2026-09-03', outcome: 'Favorable', recoveryScore: 68, effectivenessPercentage: 80, medicationResponse: 'CAM score negative for delirium for 48 consecutive hours', notes: '4 unnecessary psychoactive scripts discontinued.', prescribingDoctor: 'Dr. Anita Sharma' }],
    labResults: [{ test: 'Serum Sodium', value: '139 mEq/L', reference: '135 - 145 mEq/L', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-1048', category: 'Medication', priority: 'Urgent', recommendation: 'Provide updated medication reconciliation card to assisted living care director', rationale: 'Prevent reintroduction of discontinued anticholinergic sedatives', timeframe: 'Discharge day' }]
  },
  {
    id: 'PT-11065',
    anonymizedId: 'PT-ANON-1065',
    name: 'Victor W. Chen',
    age: 55,
    gender: 'Male',
    dob: '1971-05-18',
    phone: '+1 (555) 902-8814',
    email: 'v.chen@fictionalmail.net',
    address: '88 Skyline Blvd, Metro City',
    department: 'Endocrinology',
    primaryDiagnosis: 'Type 2 Diabetes Mellitus with Microalbuminuria',
    secondaryDiagnoses: ['Dyslipidemia', 'Moderate Sleep Apnea'],
    admissionDate: '2026-09-06',
    status: 'Observation',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'West Wing - 422',
    riskScore: 36,
    riskLevel: 'LOW',
    readmissionProbability: 0.25,
    recoveryScore: 84,
    lengthOfStay: 3,
    priorAdmissionsCount: 0,
    medicationCount: 4,
    hba1cLevel: '7.8%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 92,
    riskFactors: [
      { factor: 'Early nephropathy sign (Urine albumin/creatinine ratio 85 mg/g)', impactScore: 22, category: 'Laboratory', description: 'Requires ACE inhibitor protection' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 42 }, { date: 'Day 3', score: 36 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11065', admissionDate: '2026-09-06', type: 'Elective', department: 'Endocrinology', primaryDiagnosis: 'Type 2 Diabetes Workup', lengthOfStay: 3, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-11065', treatmentName: 'Lisinopril 10mg + Semaglutide 0.5mg weekly start', category: 'Medication', startDate: '2026-09-06', outcome: 'Favorable', recoveryScore: 88, effectivenessPercentage: 90, medicationResponse: 'Tolerating GLP-1 RA without nausea, glucose stabilizing', notes: 'Renoprotective and metabolic benefits discussed.', prescribingDoctor: 'Dr. Anita Sharma' }],
    labResults: [{ test: 'eGFR', value: '88 mL/min', reference: '> 60 mL/min', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-1065', category: 'Monitoring', priority: 'Routine', recommendation: 'Repeat urine microalbumin test at 3 months outpatient', rationale: 'Confirm antiproteinuric response to Lisinopril', timeframe: '3 months' }]
  },
  {
    id: 'PT-11082',
    anonymizedId: 'PT-ANON-1082',
    name: 'Chloe Bennett',
    age: 38,
    gender: 'Female',
    dob: '1988-12-04',
    phone: '+1 (555) 612-4499',
    email: 'c.bennett@fictionalmail.net',
    address: '144 Birchwood Drive, Metro City',
    department: 'Internal Medicine',
    primaryDiagnosis: 'Acute Uncomplicated Appendicitis (Post-Appendectomy Day 1)',
    secondaryDiagnoses: ['None'],
    admissionDate: '2026-09-08',
    status: 'Discharge Planning',
    assignedDoctorId: 'USR-DOC-003',
    assignedDoctorName: 'Dr. Emily Watson',
    roomNumber: 'North Wing - 204',
    riskScore: 12,
    riskLevel: 'LOW',
    readmissionProbability: 0.08,
    recoveryScore: 95,
    lengthOfStay: 1,
    priorAdmissionsCount: 0,
    medicationCount: 1,
    hba1cLevel: '5.1%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 98,
    riskFactors: [
      { factor: 'Uncomplicated laparoscopic surgical recovery', impactScore: 6, category: 'Clinical', description: 'Expected low morbidity' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 12 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11082', admissionDate: '2026-09-08', type: 'Emergency', department: 'Internal Medicine', primaryDiagnosis: 'Appendicitis', lengthOfStay: 1, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-11082', treatmentName: 'Laparoscopic Appendectomy', category: 'Surgical', startDate: '2026-09-08', outcome: 'Favorable', recoveryScore: 96, effectivenessPercentage: 99, medicationResponse: 'Incisions clean and dry, ambulating freely', notes: 'Oral analgesics only.', prescribingDoctor: 'Dr. Emily Watson' }],
    labResults: [{ test: 'WBC Count', value: '7.2 K/uL', reference: '4.5 - 11.0 K/uL', status: 'normal', date: '2026-09-09' }],
    recommendations: [{ id: 'REC-1082', category: 'Discharge', priority: 'Routine', recommendation: 'Routine surgical wound check in 10 days', rationale: 'Verify laparoscopic trocar closure', timeframe: 'Day 10' }]
  },
  {
    id: 'PT-11103',
    anonymizedId: 'PT-ANON-1103',
    name: 'Lawrence MacIntyre',
    age: 70,
    gender: 'Male',
    dob: '1956-02-28',
    phone: '+1 (555) 789-0144',
    email: 'l.macintyre@fictionalmail.net',
    address: '730 Highland Crest, Metro City',
    department: 'Cardiology',
    primaryDiagnosis: 'Aortic Valve Stenosis with Syncope on Exertion',
    secondaryDiagnoses: ['Coronary Artery Disease', 'Hypertension'],
    admissionDate: '2026-09-04',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-002',
    assignedDoctorName: 'Dr. James Rodriguez',
    roomNumber: 'Cardio West - 314',
    riskScore: 71,
    riskLevel: 'HIGH',
    readmissionProbability: 0.67,
    recoveryScore: 58,
    lengthOfStay: 5,
    priorAdmissionsCount: 2,
    medicationCount: 7,
    hba1cLevel: '6.3%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 89,
    riskFactors: [
      { factor: 'Severe Aortic Stenosis (Valve Area 0.7 cm²)', impactScore: 32, category: 'Clinical', description: 'High sudden cardiovascular event risk without valve replacement' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 78 }, { date: 'Day 3', score: 74 }, { date: 'Day 5', score: 71 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11103', admissionDate: '2026-09-04', type: 'Emergency', department: 'Cardiology', primaryDiagnosis: 'Syncope / Aortic Stenosis', lengthOfStay: 5, dischargeDisposition: 'Pending' }],
    treatments: [{ id: 'TX-11103', treatmentName: 'Heart Team TAVR Evaluation + telemetry monitoring', category: 'Therapy', startDate: '2026-09-05', outcome: 'Stable', recoveryScore: 70, effectivenessPercentage: 80, medicationResponse: 'Hemodynamics stabilized on telemetry', notes: 'Scheduled for Transcatheter Aortic Valve Replacement (TAVR) next week.', prescribingDoctor: 'Dr. James Rodriguez' }],
    labResults: [{ test: 'Mean Aortic Gradient', value: '46 mmHg', reference: '< 20 mmHg', status: 'critical', date: '2026-09-05' }],
    recommendations: [{ id: 'REC-1103', category: 'Discharge', priority: 'Urgent', recommendation: 'Strict avoidance of strenuous exertion pending TAVR procedure', rationale: 'Prevent recurrent exertional syncope or cardiac arrest', timeframe: 'Continuous' }]
  },
  {
    id: 'PT-11124',
    anonymizedId: 'PT-ANON-1124',
    name: 'Theresa Hopkins',
    age: 67,
    gender: 'Female',
    dob: '1959-10-14',
    phone: '+1 (555) 433-8991',
    email: 't.hopkins@fictionalmail.net',
    address: '228 Pinehurst Way, Metro City',
    department: 'Pulmonology',
    primaryDiagnosis: 'Bronchiectasis with Pseudomonas Bacterial Superinfection',
    secondaryDiagnoses: ['Bronchial Hyperresponsiveness', 'Sinusitis'],
    admissionDate: '2026-09-03',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-003',
    assignedDoctorName: 'Dr. Emily Watson',
    roomNumber: 'East Wing - 124',
    riskScore: 66,
    riskLevel: 'MEDIUM',
    readmissionProbability: 0.58,
    recoveryScore: 62,
    lengthOfStay: 6,
    priorAdmissionsCount: 2,
    medicationCount: 8,
    hba1cLevel: '5.7%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 87,
    riskFactors: [
      { factor: 'Pseudomonas colonization in airways', impactScore: 28, category: 'Laboratory', description: 'Requires targeted inhaled antibiotic eradication cycle' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 72 }, { date: 'Day 4', score: 68 }, { date: 'Day 6', score: 66 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11124', admissionDate: '2026-09-03', type: 'Urgent', department: 'Pulmonology', primaryDiagnosis: 'Bronchiectasis Exacerbation', lengthOfStay: 6, dischargeDisposition: 'Pending' }],
    treatments: [{ id: 'TX-11124', treatmentName: 'IV Cefepime + High-Frequency Chest Wall Oscillation (Vest)', category: 'Medication', startDate: '2026-09-03', outcome: 'Favorable', recoveryScore: 76, effectivenessPercentage: 85, medicationResponse: 'Sputum purulence resolved, airway clearance improved', notes: 'Inhaled Tobramycin maintenance arranged.', prescribingDoctor: 'Dr. Emily Watson' }],
    labResults: [{ test: 'Sputum Culture', value: 'Pseudomonas aeruginosa (Sensitive to Cefepime/Tobramycin)', reference: 'No growth', status: 'elevated', date: '2026-09-05' }],
    recommendations: [{ id: 'REC-1124', category: 'Follow-up', priority: 'High', recommendation: 'Deliver home high-frequency oscillation vest and train caregiver', rationale: 'Maintain mucus clearance and avoid lung collapse', timeframe: 'Discharge day' }]
  },
  {
    id: 'PT-11145',
    anonymizedId: 'PT-ANON-1145',
    name: 'Geraldine Cruz',
    age: 61,
    gender: 'Female',
    dob: '1965-07-22',
    phone: '+1 (555) 819-2033',
    email: 'g.cruz@fictionalmail.net',
    address: '390 Sycamore Lane, Metro City',
    department: 'Endocrinology',
    primaryDiagnosis: 'Uncontrolled Type 2 Diabetes with Recurrent Hyperglycemia',
    secondaryDiagnoses: ['Obesity Class 2', 'Nonalcoholic Fatty Liver Disease'],
    admissionDate: '2026-09-05',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'West Wing - 410',
    riskScore: 74,
    riskLevel: 'HIGH',
    readmissionProbability: 0.70,
    recoveryScore: 55,
    lengthOfStay: 4,
    priorAdmissionsCount: 3,
    medicationCount: 7,
    hba1cLevel: '10.2%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 90,
    riskFactors: [
      { factor: 'Persistent Severe Hyperglycemia (HbA1c > 10%)', impactScore: 30, category: 'Laboratory', description: 'Requires intensified basal-bolus insulin counseling' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 80 }, { date: 'Day 2', score: 76 }, { date: 'Day 4', score: 74 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11145', admissionDate: '2026-09-05', type: 'Urgent', department: 'Endocrinology', primaryDiagnosis: 'Hyperglycemia', lengthOfStay: 4, dischargeDisposition: 'Pending' }],
    treatments: [{ id: 'TX-11145', treatmentName: 'Glargine U-300 + Insulin Lispro before meals', category: 'Medication', startDate: '2026-09-05', outcome: 'Favorable', recoveryScore: 75, effectivenessPercentage: 84, medicationResponse: 'Pre-meal glucose controlled at 130-155 mg/dL', notes: 'Patient practiced self-injection without issue.', prescribingDoctor: 'Dr. Anita Sharma' }],
    labResults: [{ test: 'HbA1c', value: '10.2 %', reference: '< 5.7 %', status: 'critical', date: '2026-09-05' }],
    recommendations: [{ id: 'REC-1145', category: 'Follow-up', priority: 'High', recommendation: 'Nurse call check-in at 48 hours to assess insulin pen injection log', rationale: 'Catch dosage errors early', timeframe: 'Day 2' }]
  },
  {
    id: 'PT-11162',
    anonymizedId: 'PT-ANON-1162',
    name: 'Walter Whitehurst',
    age: 74,
    gender: 'Male',
    dob: '1952-03-09',
    phone: '+1 (555) 604-9821',
    email: 'w.whitehurst@fictionalmail.net',
    address: '150 Westwood Ave, Metro City',
    department: 'Internal Medicine',
    primaryDiagnosis: 'Acute Kidney Injury on Chronic Renal Disease Stage 4',
    secondaryDiagnoses: ['Hypertension', 'Gouty Arthritis'],
    admissionDate: '2026-09-04',
    status: 'Admitted',
    assignedDoctorId: 'USR-DOC-001',
    assignedDoctorName: 'Dr. Anita Sharma',
    roomNumber: 'North Wing - 218',
    riskScore: 81,
    riskLevel: 'HIGH',
    readmissionProbability: 0.77,
    recoveryScore: 49,
    lengthOfStay: 5,
    priorAdmissionsCount: 3,
    medicationCount: 9,
    hba1cLevel: '6.7%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 89,
    riskFactors: [
      { factor: 'Severely impaired renal baseline (eGFR 24 mL/min)', impactScore: 33, category: 'Clinical', description: 'Extremely vulnerable to dehydration and nephrotoxic exposures' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 86 }, { date: 'Day 3', score: 83 }, { date: 'Day 5', score: 81 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11162', admissionDate: '2026-09-04', type: 'Emergency', department: 'Internal Medicine', primaryDiagnosis: 'AKI on CKD', lengthOfStay: 5, dischargeDisposition: 'Pending' }],
    treatments: [{ id: 'TX-11162', treatmentName: 'Isotonic Saline Hydration + NSAID Discontinuation', category: 'Therapy', startDate: '2026-09-04', outcome: 'Favorable', recoveryScore: 68, effectivenessPercentage: 82, medicationResponse: 'Creatinine improved from 3.4 to 2.4 mg/dL', notes: 'Gout managed with Colchicine renal-adjusted dose.', prescribingDoctor: 'Dr. Anita Sharma' }],
    labResults: [{ test: 'Serum Creatinine', value: '2.4 mg/dL', reference: '0.7 - 1.3 mg/dL', status: 'elevated', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-1162', category: 'Follow-up', priority: 'Urgent', recommendation: 'Nephrology clinic review in 5 days with repeat creatinine and potassium', rationale: 'Verify stable recovery off IV fluids', timeframe: 'Day 5' }]
  },
  {
    id: 'PT-11188',
    anonymizedId: 'PT-ANON-1188',
    name: 'Isabella Rossi',
    age: 51,
    gender: 'Female',
    dob: '1975-06-14',
    phone: '+1 (555) 712-4099',
    email: 'i.rossi@fictionalmail.net',
    address: '614 Harbor Road, Metro City',
    department: 'Cardiology',
    primaryDiagnosis: 'Uncontrolled Hypertension with Blurred Vision',
    secondaryDiagnoses: ['Migraine with Aura', 'Thyroiditis'],
    admissionDate: '2026-09-07',
    status: 'Observation',
    assignedDoctorId: 'USR-DOC-002',
    assignedDoctorName: 'Dr. James Rodriguez',
    roomNumber: 'Cardio West - 320',
    riskScore: 42,
    riskLevel: 'MEDIUM',
    readmissionProbability: 0.35,
    recoveryScore: 80,
    lengthOfStay: 2,
    priorAdmissionsCount: 1,
    medicationCount: 4,
    hba1cLevel: '5.4%',
    predictionTimestamp: '2026-09-09 06:30 AM',
    modelVersion: 'XGBoost-HospReadmit-v2.4',
    confidenceScore: 91,
    riskFactors: [
      { factor: 'Medication Non-adherence due to side-effect concerns', impactScore: 24, category: 'Clinical', description: 'Patient discontinued beta-blocker prematurely' }
    ],
    historicalRisk: [{ date: 'Day 1', score: 51 }, { date: 'Day 2', score: 42 }],
    medicalHistory: [],
    admissions: [{ id: 'ADM-11188', admissionDate: '2026-09-07', type: 'Emergency', department: 'Cardiology', primaryDiagnosis: 'Hypertensive Urgency', lengthOfStay: 2, dischargeDisposition: 'Home' }],
    treatments: [{ id: 'TX-11188', treatmentName: 'Transition to Candesartan 16mg + Chlorthalidone 12.5mg', category: 'Medication', startDate: '2026-09-07', outcome: 'Favorable', recoveryScore: 88, effectivenessPercentage: 94, medicationResponse: 'Blood pressure controlled at 124/80 with zero fatigue', notes: 'Patient pleased with new regimen.', prescribingDoctor: 'Dr. James Rodriguez' }],
    labResults: [{ test: 'Blood Pressure', value: '124/80 mmHg', reference: '< 130/80 mmHg', status: 'normal', date: '2026-09-08' }],
    recommendations: [{ id: 'REC-1188', category: 'Education', priority: 'Routine', recommendation: 'Pharmacist consultation on medication tolerance and routine reminder app', rationale: 'Maintain 95%+ adherence rates', timeframe: 'Day 7' }]
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-8812', timestamp: '2026-09-09 07:46:12', userId: 'USR-DOC-001', userName: 'Dr. Anita Sharma', role: 'DOCTOR', action: 'VIEW_PATIENT_RECORD', module: 'Patient Management', ipAddress: '192.168.10.45', status: 'Success', details: 'Reviewed clinical risk profile for PT-10492 (Eleanor Vance)' },
  { id: 'LOG-8811', timestamp: '2026-09-09 07:40:02', userId: 'USR-DOC-001', userName: 'Dr. Anita Sharma', role: 'DOCTOR', action: 'GENERATE_CARE_PLAN', module: 'Clinical Decision Support', ipAddress: '192.168.10.45', status: 'Success', details: 'Approved 3 follow-up recommendations for PT-10492' },
  { id: 'LOG-8810', timestamp: '2026-09-09 07:15:33', userId: 'USR-ADM-002', userName: 'Dr. Katherine Vance', role: 'HOSPITAL_ADMIN', action: 'EXPORT_ANALYTICS_REPORT', module: 'Reports', ipAddress: '192.168.10.12', status: 'Success', details: 'Exported 30-Day Hospital Readmission Forecast Report (PDF/CSV)' },
  { id: 'LOG-8809', timestamp: '2026-09-09 06:45:19', userId: 'USR-RES-003', userName: 'Dr. Marcus Chen', role: 'HEALTHCARE_RESEARCHER', action: 'EXPORT_RESEARCH_DATASET', module: 'Healthcare Analytics', ipAddress: '192.168.14.88', status: 'Success', details: 'Extracted de-identified cohort of 1,200 diabetic patients (HIPAA safe-harbor)' },
  { id: 'LOG-8808', timestamp: '2026-09-09 06:30:00', userId: 'USR-SYS-004', userName: 'Alex Mercer', role: 'SYSTEM_ADMIN', action: 'RUN_BATCH_INFERENCE', module: 'AI Model Management', ipAddress: '10.0.4.19', status: 'Success', details: 'Executed XGBoost-HospReadmit-v2.4 batch scoring on 148 admitted patients' },
  { id: 'LOG-8807', timestamp: '2026-09-08 22:15:00', userId: 'USR-SYS-004', userName: 'Alex Mercer', role: 'SYSTEM_ADMIN', action: 'UPDATE_ROLE_PERMISSIONS', module: 'Administration', ipAddress: '10.0.4.19', status: 'Success', details: 'Validated RBAC matrix constraints for Healthcare Researcher role' },
  { id: 'LOG-8806', timestamp: '2026-09-08 18:30:11', userId: 'USR-DOC-002', userName: 'Dr. James Rodriguez', role: 'DOCTOR', action: 'VIEW_PATIENT_RECORD', module: 'Patient Management', ipAddress: '192.168.10.51', status: 'Success', details: 'Reviewed admission discharge planning for PT-10705' }
];

export const MOCK_MODEL_METRICS: ModelMetrics[] = [
  {
    version: 'XGBoost-HospReadmit-v2.4',
    name: 'Hospital 30-Day Readmission Risk Classifier',
    algorithm: 'Extreme Gradient Boosting (XGBoost)',
    status: 'Production',
    dataset: 'Diabetes 130-US Hospitals (1999-2008) + Institutional EHR',
    trainingDate: '2026-08-28',
    accuracy: 86.4,
    precision: 84.1,
    recall: 88.7,
    f1Score: 86.3,
    rocAuc: 0.912,
    totalInferences: 142850,
    avgLatencyMs: 38
  },
  {
    version: 'RandomForest-HospRisk-v2.1',
    name: 'Multi-Factor Clinical Deterioration Ensemble',
    algorithm: 'Random Forest Ensemble (500 trees)',
    status: 'Staging',
    dataset: 'Diabetes 130-US Hospitals Preprocessed (101,766 records)',
    trainingDate: '2026-08-15',
    accuracy: 84.8,
    precision: 82.3,
    recall: 86.1,
    f1Score: 84.1,
    rocAuc: 0.889,
    totalInferences: 8420,
    avgLatencyMs: 44
  },
  {
    version: 'LogisticRegression-Baseline-v1.0',
    name: 'L2-Regularized Baseline Classifier',
    algorithm: 'Logistic Regression (ElasticNet)',
    status: 'Archived',
    dataset: 'Benchmark Sample (25,000 records)',
    trainingDate: '2026-06-10',
    accuracy: 78.2,
    precision: 75.6,
    recall: 79.4,
    f1Score: 77.4,
    rocAuc: 0.824,
    totalInferences: 45000,
    avgLatencyMs: 12
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-1',
    title: 'Critical Readmission Risk Spike',
    message: 'Patient Eleanor Vance (PT-10492) scored 88% readmission risk following recent HbA1c lab update.',
    timestamp: '15 mins ago',
    type: 'critical',
    patientId: 'PT-10492',
    read: false
  },
  {
    id: 'NOTIF-2',
    title: 'Discharge Readiness Checklist Alert',
    message: 'Robert Kowalski (PT-10518) flagged for urgent heart failure telemonitoring kit order prior to discharge.',
    timestamp: '42 mins ago',
    type: 'warning',
    patientId: 'PT-10518',
    read: false
  },
  {
    id: 'NOTIF-3',
    title: 'AI Batch Inference Completed',
    message: 'Daily 06:00 AM risk scoring cycle finished across all 4 departments. 148 encounters refreshed.',
    timestamp: '2 hours ago',
    type: 'info',
    read: true
  },
  {
    id: 'NOTIF-4',
    title: 'Treatment Success Milestone',
    message: 'Department of Endocrinology achieved 86% recovery score target for severe DKA protocol.',
    timestamp: 'Yesterday',
    type: 'success',
    read: true
  }
];

export const READMISSION_TREND_DATA = [
  { date: 'Aug 10', actualRate: 18.4, predictedRate: 18.1, benchmark: 15.0 },
  { date: 'Aug 14', actualRate: 17.9, predictedRate: 17.5, benchmark: 15.0 },
  { date: 'Aug 18', actualRate: 17.2, predictedRate: 16.8, benchmark: 15.0 },
  { date: 'Aug 22', actualRate: 16.5, predictedRate: 16.2, benchmark: 15.0 },
  { date: 'Aug 26', actualRate: 15.8, predictedRate: 15.6, benchmark: 15.0 },
  { date: 'Aug 30', actualRate: 15.2, predictedRate: 15.0, benchmark: 15.0 },
  { date: 'Sep 03', actualRate: 14.8, predictedRate: 14.5, benchmark: 15.0 },
  { date: 'Sep 07', actualRate: 14.2, predictedRate: 13.9, benchmark: 15.0 },
  { date: 'Sep 09', actualRate: 13.8, predictedRate: 13.5, benchmark: 15.0 }
];

export const DEPARTMENT_METRICS = [
  { name: 'Endocrinology', patients: 58, readmitRate: 14.2, avgStay: 4.8, recoveryRate: 84.5, highRiskCount: 18 },
  { name: 'Cardiology', patients: 74, readmitRate: 16.1, avgStay: 5.2, recoveryRate: 81.2, highRiskCount: 26 },
  { name: 'Internal Medicine', patients: 62, readmitRate: 12.8, avgStay: 3.9, recoveryRate: 88.0, highRiskCount: 14 },
  { name: 'Pulmonology', patients: 45, readmitRate: 15.4, avgStay: 4.4, recoveryRate: 83.1, highRiskCount: 12 },
  { name: 'Geriatrics', patients: 38, readmitRate: 18.9, avgStay: 6.1, recoveryRate: 76.4, highRiskCount: 16 }
];

export const TREATMENT_OUTCOME_DATA = [
  { treatment: 'IV Insulin Protocol (DKA)', category: 'Diabetes Management', successRate: 89, readmissionRate: 11, avgStayDays: 4.2, recoveryScore: 82, sampleSize: 420 },
  { treatment: 'GDMT Optimization (Heart Failure)', category: 'Cardiology', successRate: 84, readmissionRate: 16, avgStayDays: 5.5, recoveryScore: 78, sampleSize: 580 },
  { treatment: 'COPD Steroid Taper + Nebulizers', category: 'Pulmonology', successRate: 82, readmissionRate: 18, avgStayDays: 4.8, recoveryScore: 75, sampleSize: 390 },
  { treatment: 'Direct Oral Anticoagulation (AFib)', category: 'Cardiology', successRate: 94, readmissionRate: 6, avgStayDays: 3.1, recoveryScore: 91, sampleSize: 610 },
  { treatment: 'Oral Antibiotic Step-Down (Pneumonia)', category: 'Pulmonology', successRate: 92, readmissionRate: 8, avgStayDays: 4.0, recoveryScore: 88, sampleSize: 450 },
  { treatment: 'Geriatric Polypharmacy Deprescribing', category: 'Geriatric Care', successRate: 86, readmissionRate: 14, avgStayDays: 6.2, recoveryScore: 80, sampleSize: 280 }
];

export const MOCK_REPORTS = [
  {
    id: 'RPT-2026-001',
    title: 'Hospital Readmission Risk & Quality Executive Summary',
    type: 'Readmission Forecast Report',
    generatedDate: '2026-09-08',
    generatedBy: 'Dr. Katherine Vance',
    department: 'All Departments',
    format: 'PDF' as const,
    fileSize: '3.4 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'RPT-2026-002',
    title: 'Endocrinology Diabetic Ketoacidosis Care Plan Audit',
    type: 'Patient Risk Summary Report',
    generatedDate: '2026-09-07',
    generatedBy: 'Dr. Anita Sharma',
    department: 'Endocrinology',
    format: 'Excel' as const,
    fileSize: '1.2 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'RPT-2026-003',
    title: 'Cardiology 30-Day GDMT Protocol Effectiveness Extract',
    type: 'Treatment Effectiveness Report',
    generatedDate: '2026-09-05',
    generatedBy: 'Dr. Marcus Chen',
    department: 'Cardiology',
    format: 'CSV' as const,
    fileSize: '920 KB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'RPT-2026-004',
    title: 'CMS HRRP Excess Readmission Ratio Risk Assessment',
    type: 'Hospital Performance Report',
    generatedDate: '2026-09-01',
    generatedBy: 'Alex Mercer',
    department: 'All Departments',
    format: 'PDF' as const,
    fileSize: '4.8 MB',
    status: 'Completed',
    downloadUrl: '#'
  }
];
