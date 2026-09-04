-- HealthForecast AI Seed Data
-- This script populates the database with initial data for testing

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('System Administrator', 'Full system access including user and role management'),
('Doctor', 'Access to patient records, medical history, and risk reports'),
('Hospital Administrator', 'Access to hospital dashboards, analytics, and reports'),
('Healthcare Researcher', 'Access to anonymized datasets and research reports');

-- Insert Users (passwords are bcrypt hashed)
-- System Administrator: admin@healthforecast.ai / Admin@123
INSERT INTO users (email, username, hashed_password, full_name, role_id, is_active) VALUES
('admin@healthforecast.ai', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eYKqPGqF6m2e', 'System Administrator', 1, TRUE),
-- Doctor: doctor@healthforecast.ai / Doctor@123
('doctor@healthforecast.ai', 'doctor', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eYKqPGqF6m2e', 'Dr. Sarah Johnson', 2, TRUE),
-- Hospital Administrator: hospital_admin@healthforecast.ai / Hospital@123
('hospital_admin@healthforecast.ai', 'hospital_admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eYKqPGqF6m2e', 'Michael Chen', 3, TRUE),
-- Healthcare Researcher: researcher@healthforecast.ai / Researcher@123
('researcher@healthforecast.ai', 'researcher', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eYKqPGqF6m2e', 'Dr. Emily Davis', 4, TRUE);

-- Insert Sample Patients
INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, is_active) VALUES
('PAT001', 'John', 'Smith', '1980-05-15', 'Male', '555-0101', 'john.smith@email.com', '123 Main St', 'Springfield', 'IL', '62701', 'Jane Smith', '555-0102', TRUE),
('PAT002', 'Mary', 'Johnson', '1975-08-22', 'Female', '555-0201', 'mary.johnson@email.com', '456 Oak Ave', 'Chicago', 'IL', '60601', 'Robert Johnson', '555-0202', TRUE),
('PAT003', 'James', 'Williams', '1990-12-10', 'Male', '555-0301', 'james.williams@email.com', '789 Pine Rd', 'Peoria', 'IL', '61601', 'Susan Williams', '555-0302', TRUE),
('PAT004', 'Patricia', 'Brown', '1985-03-18', 'Female', '555-0401', 'patricia.brown@email.com', '321 Elm St', 'Rockford', 'IL', '61101', 'Thomas Brown', '555-0402', TRUE),
('PAT005', 'Robert', 'Jones', '1978-07-25', 'Male', '555-0501', 'robert.jones@email.com', '654 Maple Dr', 'Naperville', 'IL', '60540', 'Linda Jones', '555-0502', TRUE),
('PAT006', 'Linda', 'Garcia', '1982-11-30', 'Female', '555-0601', 'linda.garcia@email.com', '987 Cedar Ln', 'Aurora', 'IL', '60502', 'Carlos Garcia', '555-0602', TRUE),
('PAT007', 'Michael', 'Miller', '1988-02-14', 'Male', '555-0701', 'michael.miller@email.com', '147 Birch Blvd', 'Joliet', 'IL', '60435', 'Jennifer Miller', '555-0702', TRUE),
('PAT008', 'Elizabeth', 'Davis', '1972-09-08', 'Female', '555-0801', 'elizabeth.davis@email.com', '258 Spruce Way', 'Waukegan', 'IL', '60085', 'William Davis', '555-0802', TRUE),
('PAT009', 'William', 'Rodriguez', '1995-06-20', 'Male', '555-0901', 'william.rodriguez@email.com', '369 Ash Ct', 'Schaumburg', 'IL', '60193', 'Maria Rodriguez', '555-0902', TRUE),
('PAT010', 'Barbara', 'Martinez', '1983-04-05', 'Female', '555-1001', 'barbara.martinez@email.com', '741 Willow Pl', 'Bloomington', 'IL', '61701', 'Jose Martinez', '555-1002', TRUE);

-- Insert Sample Medical History
INSERT INTO medical_history (patient_id, condition, diagnosis_date, status, notes) VALUES
(1, 'Type 2 Diabetes', '2018-03-10', 'Active', 'Managed with Metformin'),
(1, 'Hypertension', '2019-07-15', 'Active', 'Controlled with Lisinopril'),
(2, 'Atrial Fibrillation', '2020-01-20', 'Active', 'On anticoagulant therapy'),
(2, 'Chronic Kidney Disease Stage 3', '2021-05-12', 'Active', 'Regular monitoring required'),
(3, 'Asthma', '2015-09-25', 'Controlled', 'Uses inhaler as needed'),
(4, 'Osteoarthritis', '2019-11-30', 'Active', 'Knee and hip joints affected'),
(5, 'Coronary Artery Disease', '2017-08-18', 'Active', 'History of stent placement'),
(6, 'Depression', '2020-03-22', 'Active', 'Managed with therapy and medication'),
(7, 'Migraine', '2016-12-05', 'Episodic', 'Triggered by stress'),
(8, 'Rheumatoid Arthritis', '2014-06-15', 'Active', 'On biologic therapy'),
(9, 'Hyperlipidemia', '2019-02-28', 'Active', 'Statin therapy'),
(10, 'Hypothyroidism', '2018-10-10', 'Active', 'Levothyroxine replacement');

-- Insert Sample Admissions
INSERT INTO admissions (patient_id, admission_number, admission_date, discharge_date, admission_type, department, room_number, attending_physician, diagnosis, discharge_diagnosis, length_of_stay, readmission_flag, readmission_reason) VALUES
(1, 'ADM001', '2023-01-15', '2023-01-20', 'Emergency', 'Internal Medicine', '301', 'Dr. Sarah Johnson', 'Diabetic ketoacidosis', 'Resolved DKA', 5, 'No', NULL),
(1, 'ADM002', '2023-06-10', '2023-06-15', 'Elective', 'Cardiology', '402', 'Dr. Sarah Johnson', 'Chest pain evaluation', 'Stable angina', 5, 'Yes', 'Worsening angina'),
(2, 'ADM003', '2023-02-20', '2023-02-25', 'Emergency', 'Cardiology', '305', 'Dr. Sarah Johnson', 'Atrial fibrillation with rapid ventricular response', 'Rate controlled AF', 5, 'No', NULL),
(3, 'ADM004', '2023-03-10', '2023-03-12', 'Emergency', 'Pulmonology', '310', 'Dr. Sarah Johnson', 'Acute asthma exacerbation', 'Resolved exacerbation', 2, 'No', NULL),
(4, 'ADM005', '2023-04-05', '2023-04-10', 'Elective', 'Orthopedics', '415', 'Dr. Sarah Johnson', 'Total knee replacement', 'Post-op recovery', 5, 'No', NULL),
(5, 'ADM006', '2023-05-15', '2023-05-22', 'Emergency', 'Cardiology', '320', 'Dr. Sarah Johnson', 'Acute coronary syndrome', 'STEMI treated with PCI', 7, 'No', NULL),
(6, 'ADM007', '2023-07-01', '2023-07-05', 'Emergency', 'Psychiatry', '425', 'Dr. Sarah Johnson', 'Major depressive episode', 'Stabilized', 4, 'Yes', 'Medication non-compliance'),
(7, 'ADM008', '2023-08-10', '2023-08-13', 'Emergency', 'Neurology', '330', 'Dr. Sarah Johnson', 'Complex migraine', 'Resolved', 3, 'No', NULL),
(8, 'ADM009', '2023-09-20', '2023-09-25', 'Elective', 'Rheumatology', '435', 'Dr. Sarah Johnson', 'RA flare management', 'Improved', 5, 'No', NULL),
(9, 'ADM010', '2023-10-15', '2023-10-18', 'Emergency', 'Internal Medicine', '340', 'Dr. Sarah Johnson', 'Hypertensive urgency', 'BP controlled', 3, 'No', NULL);

-- Insert Sample Treatments
INSERT INTO treatments (patient_id, admission_id, treatment_name, treatment_type, start_date, end_date, dosage, frequency, prescribed_by, notes, outcome) VALUES
(1, 1, 'Insulin Therapy', 'Medication', '2023-01-15', '2023-01-20', 'Sliding scale', 'QID', 'Dr. Sarah Johnson', 'Blood glucose monitoring', 'Effective'),
(1, 1, 'IV Fluids', 'Procedure', '2023-01-15', '2023-01-20', 'Normal saline', 'Continuous', 'Dr. Sarah Johnson', 'Hydration', 'Effective'),
(1, 2, 'Aspirin', 'Medication', '2023-06-10', NULL, '81mg', 'Daily', 'Dr. Sarah Johnson', 'Antiplatelet', 'Ongoing'),
(2, 3, 'Anticoagulation', 'Medication', '2023-02-20', '2023-02-25', 'Heparin drip', 'Continuous', 'Dr. Sarah Johnson', 'AF rate control', 'Effective'),
(3, 4, 'Bronchodilators', 'Medication', '2023-03-10', '2023-03-12', 'Albuterol', 'Q4H PRN', 'Dr. Sarah Johnson', 'Asthma treatment', 'Effective'),
(4, 5, 'Physical Therapy', 'Therapy', '2023-04-06', '2023-04-10', 'Rehab protocol', 'BID', 'Dr. Sarah Johnson', 'Post-op rehab', 'Good progress'),
(5, 6, 'Antiplatelet Therapy', 'Medication', '2023-05-15', '2023-05-22', 'Dual therapy', 'Daily', 'Dr. Sarah Johnson', 'Post-PCI', 'Effective'),
(6, 7, 'Antidepressant Adjustment', 'Medication', '2023-07-01', '2023-07-05', 'SSRI', 'Daily', 'Dr. Sarah Johnson', 'Depression management', 'Improved'),
(7, 8, 'Migraine Protocol', 'Medication', '2023-08-10', '2023-08-13', 'Triptan', 'PRN', 'Dr. Sarah Johnson', 'Pain management', 'Effective'),
(8, 9, 'Biologic Therapy', 'Medication', '2023-09-20', '2023-09-25', 'TNF inhibitor', 'Weekly', 'Dr. Sarah Johnson', 'RA management', 'Improved'),
(9, 10, 'Antihypertensive', 'Medication', '2023-10-15', '2023-10-18', 'Multiple agents', 'Daily', 'BID', 'Dr. Sarah Johnson', 'BP control', 'Effective');

-- Insert Sample Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) VALUES
(1, 'CREATE_USER', 'User', 2, NULL, 'email=doctor@healthforecast.ai, username=doctor', '127.0.0.1', 'Mozilla/5.0'),
(1, 'CREATE_USER', 'User', 3, NULL, 'email=hospital_admin@healthforecast.ai, username=hospital_admin', '127.0.0.1', 'Mozilla/5.0'),
(1, 'CREATE_PATIENT', 'Patient', 1, NULL, 'patient_id=PAT001, name=John Smith', '127.0.0.1', 'Mozilla/5.0'),
(2, 'CREATE_ADMISSION', 'Admission', 1, NULL, 'admission_number=ADM001, patient_id=1', '192.168.1.100', 'Mozilla/5.0'),
(2, 'UPDATE_PATIENT', 'Patient', 1, 'phone=555-0101', 'phone=555-0199', '192.168.1.100', 'Mozilla/5.0'),
(1, 'DELETE_USER', 'User', 5, 'email=test@example.com', NULL, '127.0.0.1', 'Mozilla/5.0');

-- Verify data insertion
SELECT 'Roles inserted:' as status, COUNT(*) as count FROM roles;
SELECT 'Users inserted:' as status, COUNT(*) as count FROM users;
SELECT 'Patients inserted:' as status, COUNT(*) as count FROM patients;
SELECT 'Medical History inserted:' as status, COUNT(*) as count FROM medical_history;
SELECT 'Admissions inserted:' as status, COUNT(*) as count FROM admissions;
SELECT 'Treatments inserted:' as status, COUNT(*) as count FROM treatments;
SELECT 'Audit Logs inserted:' as status, COUNT(*) as count FROM audit_logs;
