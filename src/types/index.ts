export type UserRole = 'DOCTOR' | 'HOSPITAL_ADMIN' | 'HEALTHCARE_RESEARCHER' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  department?: string;
  hospital?: string;
  npiNumber?: string;
  status: 'active' | 'inactive' | 'Active' | 'Inactive';
  lastLogin: string;
  isDemoAccount?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  hospital: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export type PlatformModule =
  | 'dashboard'
  | 'doctor-dashboard'
  | 'hospital-dashboard'
  | 'researcher-dashboard'
  | 'admin-dashboard'
  | 'patients'
  | 'risk-predictions'
  | 'readmission-forecasts'
  | 'treatment-effectiveness'
  | 'clinical-decision-support'
  | 'healthcare-analytics'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'admin-users'
  | 'admin-roles'
  | 'admin-datasets'
  | 'admin-models'
  | 'admin-audit';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface LabResult {
  test: string;
  value: string;
  reference: string;
  status: 'normal' | 'elevated' | 'critical' | 'low';
  date: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  icd10: string;
  notes: string;
  physician: string;
  facility: string;
}

export interface AdmissionRecord {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  type: 'Emergency' | 'Elective' | 'Urgent';
  department: string;
  primaryDiagnosis: string;
  lengthOfStay: number; // days
  dischargeDisposition: string;
  readmittedWithin30Days?: boolean;
}

export interface TreatmentRecord {
  id: string;
  treatmentName: string;
  category: 'Medication' | 'Therapy' | 'Surgical' | 'Lifestyle';
  startDate: string;
  endDate?: string;
  outcome: 'Favorable' | 'Stable' | 'Partial Response' | 'Adverse Reaction';
  recoveryScore: number; // 0-100
  effectivenessPercentage: number;
  medicationResponse: string;
  notes: string;
  prescribingDoctor: string;
}

export interface RiskFactor {
  factor: string;
  impactScore: number; // 0-100 impact weight
  category: 'Clinical' | 'Historical' | 'Demographic' | 'Laboratory' | 'Medication';
  description: string;
}

export interface ClinicalRecommendation {
  id: string;
  category: 'Follow-up' | 'Medication' | 'Monitoring' | 'Discharge' | 'Education';
  priority: 'Urgent' | 'High' | 'Routine';
  recommendation: string;
  rationale: string;
  timeframe: string;
  completed?: boolean;
}

export interface Patient {
  id: string;
  anonymizedId?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email: string;
  address: string;
  department: 'Endocrinology' | 'Cardiology' | 'Internal Medicine' | 'Pulmonology' | 'Geriatrics';
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  admissionDate: string;
  status: 'Admitted' | 'Discharge Planning' | 'Discharged' | 'Observation';
  assignedDoctorId: string;
  assignedDoctorName: string;
  roomNumber?: string;
  
  // AI Metrics
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  readmissionProbability: number; // 0.0 - 1.0 (e.g. 0.74 -> 74%)
  recoveryScore: number; // 0 - 100
  lengthOfStay: number; // days
  priorAdmissionsCount: number;
  medicationCount: number;
  hba1cLevel?: string;
  predictionTimestamp: string;
  modelVersion: string;
  confidenceScore: number; // 0 - 100
  
  // Historical & Clinical
  riskFactors: RiskFactor[];
  historicalRisk: { date: string; score: number }[];
  medicalHistory: MedicalRecord[];
  admissions: AdmissionRecord[];
  treatments: TreatmentRecord[];
  labResults: LabResult[];
  recommendations: ClinicalRecommendation[];
}

export interface HospitalKPIs {
  totalPatients: number;
  highRiskPatients: number;
  predictedReadmissions: number;
  avgReadmissionRisk: number;
  recoveryRate: number;
  cmsPenaltyRisk: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  role?: UserRole;
  userRole?: UserRole;
  action: string;
  module?: string;
  resource?: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Denied' | 'SUCCESS' | 'WARNING' | 'DENIED' | 'FAILED';
  details: string;
}

export interface ModelMetrics {
  id?: string;
  version: string;
  name: string;
  algorithm: string;
  status: 'Production' | 'Staging' | 'Archived' | 'Training' | 'Active' | 'Candidate';
  dataset: string;
  trainingDate: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  totalInferences?: number;
  inferenceTimeMs?: number;
  avgLatencyMs?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type?: 'critical' | 'warning' | 'info' | 'success';
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category?: 'Clinical' | 'System' | 'Model' | 'Administrative';
  patientId?: string;
  read: boolean;
}

export type Notification = AppNotification;

export interface Report {
  id: string;
  title: string;
  type: string;
  generatedDate: string;
  generatedBy: string;
  department: string;
  format: 'PDF' | 'Excel' | 'CSV';
  fileSize: string;
  status: string;
  downloadUrl?: string;
}
