export const USERS = [
  { id: 1, name: 'Dr. Sarah Mitchell', email: 'sarah@hospital.com', password: 'password', role: 'doctor', department: 'Cardiology', status: 'active', phone: '+1 555-0101', joinDate: '2022-03-15' },
  { id: 2, name: 'James Carter', email: 'admin@hospital.com', password: 'password', role: 'hospital_admin', department: 'Administration', status: 'active', phone: '+1 555-0102', joinDate: '2021-07-20' },
  { id: 3, name: 'Dr. Emily Chen', email: 'researcher@hospital.com', password: 'password', role: 'researcher', department: 'Research', status: 'active', phone: '+1 555-0103', joinDate: '2023-01-10' },
  { id: 4, name: 'Alex Turner', email: 'sysadmin@hospital.com', password: 'password', role: 'system_admin', department: 'IT', status: 'active', phone: '+1 555-0104', joinDate: '2020-11-05' },
];

export const ROLE_LABELS = {
  doctor: 'Doctor',
  hospital_admin: 'Hospital Administrator',
  researcher: 'Healthcare Researcher',
  system_admin: 'System Administrator',
};

export const ROLE_COLORS = {
  doctor: 'blue',
  hospital_admin: 'purple',
  researcher: 'green',
  system_admin: 'orange',
};

export const PATIENTS = [
  { id: 'P001', name: 'John Anderson', age: 67, gender: 'Male', diagnosis: 'Heart Failure', riskScore: 87, riskLevel: 'high', admissionDate: '2024-06-01', doctor: 'Dr. Sarah Mitchell', department: 'Cardiology', status: 'admitted' },
  { id: 'P002', name: 'Maria Garcia', age: 54, gender: 'Female', diagnosis: 'Diabetes Type 2', riskScore: 62, riskLevel: 'medium', admissionDate: '2024-06-03', doctor: 'Dr. Sarah Mitchell', department: 'Endocrinology', status: 'admitted' },
  { id: 'P003', name: 'Robert Kim', age: 72, gender: 'Male', diagnosis: 'COPD', riskScore: 91, riskLevel: 'critical', admissionDate: '2024-05-28', doctor: 'Dr. Sarah Mitchell', department: 'Pulmonology', status: 'critical' },
  { id: 'P004', name: 'Linda Thompson', age: 45, gender: 'Female', diagnosis: 'Hypertension', riskScore: 34, riskLevel: 'low', admissionDate: '2024-06-05', doctor: 'Dr. Sarah Mitchell', department: 'Cardiology', status: 'stable' },
  { id: 'P005', name: 'David Wilson', age: 61, gender: 'Male', diagnosis: 'Pneumonia', riskScore: 75, riskLevel: 'high', admissionDate: '2024-06-04', doctor: 'Dr. Sarah Mitchell', department: 'Pulmonology', status: 'admitted' },
  { id: 'P006', name: 'Susan Lee', age: 58, gender: 'Female', diagnosis: 'Kidney Disease', riskScore: 55, riskLevel: 'medium', admissionDate: '2024-06-02', doctor: 'Dr. Sarah Mitchell', department: 'Nephrology', status: 'stable' },
];

export const APPOINTMENTS = [
  { id: 1, patient: 'John Anderson', time: '09:00 AM', type: 'Follow-up', status: 'confirmed' },
  { id: 2, patient: 'Maria Garcia', time: '10:30 AM', type: 'Consultation', status: 'confirmed' },
  { id: 3, patient: 'Linda Thompson', time: '11:00 AM', type: 'Check-up', status: 'pending' },
  { id: 4, patient: 'David Wilson', time: '02:00 PM', type: 'Review', status: 'confirmed' },
  { id: 5, patient: 'Susan Lee', time: '03:30 PM', type: 'Follow-up', status: 'cancelled' },
];

export const RISK_ALERTS = [
  { id: 1, patient: 'Robert Kim', message: 'Critical readmission risk detected (91%)', severity: 'critical', time: '2 min ago' },
  { id: 2, patient: 'John Anderson', message: 'High readmission risk — review recommended', severity: 'high', time: '15 min ago' },
  { id: 3, patient: 'David Wilson', message: 'Elevated risk score — monitor closely', severity: 'high', time: '1 hr ago' },
];

export const RECENT_ACTIVITY = [
  { id: 1, action: 'Patient Robert Kim marked as critical', time: '2 min ago', type: 'alert' },
  { id: 2, action: 'Prediction run for John Anderson', time: '10 min ago', type: 'predict' },
  { id: 3, action: 'Appointment confirmed with Maria Garcia', time: '30 min ago', type: 'calendar' },
  { id: 4, action: 'New patient Linda Thompson admitted', time: '1 hr ago', type: 'user' },
  { id: 5, action: 'Report generated for Cardiology dept.', time: '2 hr ago', type: 'report' },
];

export const HOSPITAL_KPIS = {
  totalPatients: 1284,
  admissionsToday: 23,
  readmissionRate: 14.2,
  avgStayDays: 4.7,
  bedOccupancy: 78,
  criticalPatients: 12,
};

export const DEPARTMENT_STATS = [
  { name: 'Cardiology', patients: 234, readmissions: 28, performance: 88 },
  { name: 'Pulmonology', patients: 187, readmissions: 31, performance: 74 },
  { name: 'Endocrinology', patients: 156, readmissions: 19, performance: 91 },
  { name: 'Nephrology', patients: 143, readmissions: 22, performance: 82 },
  { name: 'Neurology', patients: 128, readmissions: 17, performance: 86 },
  { name: 'Orthopedics', patients: 112, readmissions: 11, performance: 93 },
];

export const MONTHLY_ADMISSIONS = [
  { month: 'Jan', admissions: 210, readmissions: 32 },
  { month: 'Feb', admissions: 195, readmissions: 28 },
  { month: 'Mar', admissions: 230, readmissions: 35 },
  { month: 'Apr', admissions: 218, readmissions: 30 },
  { month: 'May', admissions: 245, readmissions: 38 },
  { month: 'Jun', admissions: 260, readmissions: 42 },
  { month: 'Jul', admissions: 238, readmissions: 36 },
  { month: 'Aug', admissions: 252, readmissions: 40 },
  { month: 'Sep', admissions: 241, readmissions: 37 },
  { month: 'Oct', admissions: 268, readmissions: 44 },
  { month: 'Nov', admissions: 255, readmissions: 41 },
  { month: 'Dec', admissions: 272, readmissions: 45 },
];

export const RISK_DISTRIBUTION = [
  { name: 'Low Risk', value: 42, color: '#22c55e' },
  { name: 'Medium Risk', value: 31, color: '#f59e0b' },
  { name: 'High Risk', value: 19, color: '#ef4444' },
  { name: 'Critical', value: 8, color: '#7c3aed' },
];

export const POPULATION_STATS = [
  { age: '18-30', count: 145, readmitted: 12 },
  { age: '31-45', count: 287, readmitted: 34 },
  { age: '46-60', count: 412, readmitted: 67 },
  { age: '61-75', count: 356, readmitted: 89 },
  { age: '76+', count: 184, readmitted: 62 },
];

export const TREND_DATA = [
  { week: 'W1', predicted: 38, actual: 35 },
  { week: 'W2', predicted: 42, actual: 40 },
  { week: 'W3', predicted: 35, actual: 37 },
  { week: 'W4', predicted: 48, actual: 45 },
  { week: 'W5', predicted: 44, actual: 46 },
  { week: 'W6', predicted: 51, actual: 49 },
  { week: 'W7', predicted: 47, actual: 50 },
  { week: 'W8', predicted: 55, actual: 53 },
];

export const ALL_USERS = [
  { id: 1, name: 'Dr. Sarah Mitchell', email: 'sarah@hospital.com', role: 'doctor', status: 'active', lastLogin: '2024-06-07 09:12' },
  { id: 2, name: 'James Carter', email: 'admin@hospital.com', role: 'hospital_admin', status: 'active', lastLogin: '2024-06-07 08:45' },
  { id: 3, name: 'Dr. Emily Chen', email: 'researcher@hospital.com', role: 'researcher', status: 'active', lastLogin: '2024-06-06 14:30' },
  { id: 4, name: 'Alex Turner', email: 'sysadmin@hospital.com', role: 'system_admin', status: 'active', lastLogin: '2024-06-07 07:00' },
  { id: 5, name: 'Dr. Michael Brown', email: 'mbrown@hospital.com', role: 'doctor', status: 'active', lastLogin: '2024-06-07 10:05' },
  { id: 6, name: 'Dr. Priya Patel', email: 'ppatel@hospital.com', role: 'doctor', status: 'inactive', lastLogin: '2024-06-01 11:20' },
  { id: 7, name: 'Lisa Nguyen', email: 'lisa@hospital.com', role: 'hospital_admin', status: 'active', lastLogin: '2024-06-07 09:55' },
  { id: 8, name: 'Dr. Kevin Park', email: 'kpark@hospital.com', role: 'researcher', status: 'active', lastLogin: '2024-06-05 16:40' },
];

export const SYSTEM_LOGS = [
  { id: 1, user: 'sarah@hospital.com', action: 'Ran readmission prediction', module: 'ML Engine', time: '2024-06-07 09:15', level: 'info' },
  { id: 2, user: 'admin@hospital.com', action: 'Updated department settings', module: 'Admin Panel', time: '2024-06-07 08:50', level: 'info' },
  { id: 3, user: 'sysadmin@hospital.com', action: 'User role updated', module: 'User Management', time: '2024-06-07 07:05', level: 'warning' },
  { id: 4, user: 'ppatel@hospital.com', action: 'Failed login attempt', module: 'Auth', time: '2024-06-06 18:30', level: 'error' },
  { id: 5, user: 'kpark@hospital.com', action: 'Exported dataset', module: 'Research', time: '2024-06-05 16:45', level: 'info' },
  { id: 6, user: 'lisa@hospital.com', action: 'Added new patient record', module: 'Patient Mgmt', time: '2024-06-07 10:00', level: 'info' },
];

export const PLATFORM_STATS = {
  totalUsers: 8,
  activeUsers: 7,
  totalPredictions: 3421,
  systemUptime: '99.8%',
  storageUsed: '42 GB',
  apiCalls: 18420,
};

export const NOTIFICATIONS = [
  { id: 1, title: 'Critical Risk Alert', message: 'Patient Robert Kim requires immediate attention', type: 'critical', time: '2 min ago', read: false },
  { id: 2, title: 'New Appointment', message: 'Appointment confirmed with Maria Garcia at 10:30 AM', type: 'info', time: '15 min ago', read: false },
  { id: 3, title: 'Report Ready', message: 'Monthly readmission report is ready for download', type: 'success', time: '1 hr ago', read: true },
  { id: 4, title: 'System Update', message: 'ML model updated to version 2.1.0', type: 'info', time: '3 hr ago', read: true },
];
