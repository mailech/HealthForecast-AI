"""
HealthForecast AI - Database Layer & Realistic Clinical Seed Engine
Using SQLite for zero-configuration, robust persistence.
"""

import sqlite3
import hashlib
import json
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "healthforecast.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    """Standard SHA-256 password hash for internal demonstration."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,  -- 'doctor', 'hospital_admin', 'researcher', 'system_admin'
        department TEXT NOT NULL,
        avatar_initials TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Patients table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mrn TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        blood_type TEXT NOT NULL,
        assigned_doctor_id INTEGER,
        assigned_doctor_name TEXT NOT NULL,
        ward TEXT NOT NULL,  -- 'Endocrinology Wing', 'Cardiology Step-Down', 'ICU Critical Care', 'General Medicine'
        bed_number TEXT NOT NULL,
        status TEXT NOT NULL, -- 'Admitted', 'Under Evaluation', 'Discharge Pending', 'Discharged'
        admission_date TEXT NOT NULL,
        primary_diagnosis TEXT NOT NULL,
        secondary_diagnosis TEXT NOT NULL,
        vitals_bp TEXT NOT NULL,
        vitals_hr INTEGER NOT NULL,
        vitals_spo2 INTEGER NOT NULL,
        vitals_temp REAL NOT NULL
    )
    """)

    # 3. Encounters table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS encounters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        encounter_date TEXT NOT NULL,
        time_in_hospital INTEGER NOT NULL,
        num_lab_procedures INTEGER NOT NULL,
        num_procedures INTEGER NOT NULL,
        num_medications INTEGER NOT NULL,
        number_outpatient INTEGER NOT NULL,
        number_emergency INTEGER NOT NULL,
        number_inpatient INTEGER NOT NULL,
        number_diagnoses INTEGER NOT NULL,
        max_glu_serum TEXT NOT NULL,
        a1c_result TEXT NOT NULL,
        high_glucose INTEGER NOT NULL,
        high_a1c INTEGER NOT NULL,
        insulin_changed INTEGER NOT NULL,
        diabetes_med INTEGER NOT NULL,
        comorbidity_circulatory INTEGER NOT NULL,
        comorbidity_renal INTEGER NOT NULL,
        comorbidity_respiratory INTEGER NOT NULL,
        medication_list TEXT NOT NULL,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    )
    """)

    # 4. Predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        encounter_id INTEGER,
        risk_score REAL NOT NULL,
        risk_category TEXT NOT NULL,
        readmission_window TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        treatment_effectiveness_score REAL NOT NULL,
        color_code TEXT NOT NULL,
        risk_drivers_json TEXT NOT NULL,
        protective_factors_json TEXT NOT NULL,
        organ_risks_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    )
    """)

    # 5. Clinical Recommendations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        category TEXT NOT NULL, -- 'Medication', 'Follow-up', 'Monitoring', 'Lifestyle'
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL, -- 'URGENT', 'HIGH', 'MEDIUM', 'ROUTINE'
        status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'DISMISSED'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    )
    """)

    # 6. Audit Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT DEFAULT '127.0.0.1',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

def seed_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if users already exist
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # Seed Default Users for all 4 Roles
    users = [
        ("doctor@healthforecast.ai", hash_password("doctor123"), "Dr. Elena Vance, MD", "doctor", "Endocrinology & Cardiology", "EV"),
        ("admin@healthforecast.ai", hash_password("admin123"), "Marcus Sterling, MHA", "hospital_admin", "Executive Operations", "MS"),
        ("researcher@healthforecast.ai", hash_password("research123"), "Dr. Aris Thorne, PhD", "healthcare_researcher", "Epidemiology & Biostatistics", "AT"),
        ("sysadmin@healthforecast.ai", hash_password("sysadmin123"), "Alex Mercer", "system_admin", "Healthcare IT & Infrastructure", "AM")
    ]
    cursor.executemany("""
    INSERT INTO users (email, password_hash, full_name, role, department, avatar_initials)
    VALUES (?, ?, ?, ?, ?, ?)
    """, users)

    # Seed 20 Inpatient Clinical Profiles
    patients_data = [
        ("MRN-89421", "Robert Chen", 68, "Male", "A+", 1, "Dr. Elena Vance, MD", "Endocrinology Wing", "BED-101", "Admitted", "2026-09-10", "Type 2 Diabetes with Hyperosmolar State (ICD 250.2)", "Congestive Heart Failure (ICD 428.0)", "148/92", 84, 95, 37.1),
        ("MRN-89422", "Eleanor Davies", 74, "Female", "O+", 1, "Dr. Elena Vance, MD", "Endocrinology Wing", "BED-102", "Under Evaluation", "2026-09-12", "Type 2 Diabetes with Diabetic Ketoacidosis (ICD 250.1)", "Chronic Kidney Disease Stage 3 (ICD 585.3)", "156/96", 92, 94, 37.4),
        ("MRN-89423", "David Kowalski", 54, "Male", "B+", 1, "Dr. Elena Vance, MD", "Cardiology Step-Down", "BED-201", "Admitted", "2026-09-08", "Coronary Atherosclerosis (ICD 414.0)", "Type 2 Diabetes Mellitus without Complication", "138/84", 78, 97, 36.8),
        ("MRN-89424", "Maria Rodriguez", 62, "Female", "AB-", 1, "Dr. Elena Vance, MD", "General Medicine", "BED-301", "Discharge Pending", "2026-09-11", "Diabetic Polyneuropathy (ICD 250.6)", "Essential Hypertension (ICD 401.9)", "128/80", 72, 98, 36.6),
        ("MRN-89425", "James Thorne", 81, "Male", "O-", 1, "Dr. Elena Vance, MD", "ICU Critical Care", "BED-ICU-01", "Admitted", "2026-09-13", "Acute Myocardial Infarction (ICD 410.1)", "Uncontrolled Type 2 Diabetes with Nephropathy", "162/100", 104, 91, 38.0),
        ("MRN-89426", "Sophia Patel", 46, "Female", "A-", 1, "Dr. Elena Vance, MD", "Endocrinology Wing", "BED-103", "Admitted", "2026-09-14", "Gestational Diabetes Post-Partum Surveillance", "Mild Hypokalemia", "118/74", 68, 99, 36.7),
        ("MRN-89427", "Arthur Pendelton", 71, "Male", "B-", 1, "Dr. Elena Vance, MD", "Cardiology Step-Down", "BED-202", "Under Evaluation", "2026-09-09", "Hypertensive Heart Disease (ICD 402.9)", "Diabetic Peripheral Angiopathy", "144/88", 80, 96, 36.9),
        ("MRN-89428", "Clara Oswald", 59, "Female", "O+", 1, "Dr. Elena Vance, MD", "General Medicine", "BED-302", "Discharged", "2026-09-05", "Type 2 Diabetes Well Controlled (ICD 250.00)", "Hyperlipidemia", "122/78", 70, 98, 36.5),
        ("MRN-89429", "William Hayes", 65, "Male", "A+", 1, "Dr. Elena Vance, MD", "Endocrinology Wing", "BED-104", "Admitted", "2026-09-13", "Severe Hypoglycemia secondary to Insulin Overdose", "Type 1 Diabetes Mellitus", "110/68", 96, 96, 36.4),
        ("MRN-89430", "Beatrice Campbell", 77, "Female", "O+", 1, "Dr. Elena Vance, MD", "ICU Critical Care", "BED-ICU-02", "Admitted", "2026-09-14", "Diabetic Ketoacidosis with Sepsis (ICD 250.13)", "Pneumonia Organism Unspecified (ICD 486)", "150/94", 112, 89, 38.6),
        ("MRN-89431", "Lucas Zimmerman", 52, "Male", "B+", 1, "Dr. Elena Vance, MD", "General Medicine", "BED-303", "Admitted", "2026-09-12", "Type 2 Diabetes uncontrolled", "Peripheral Vascular Disease", "134/82", 76, 97, 36.8),
        ("MRN-89432", "Grace Hopper-Lin", 69, "Female", "AB+", 1, "Dr. Elena Vance, MD", "Cardiology Step-Down", "BED-203", "Under Evaluation", "2026-09-10", "Atrial Fibrillation (ICD 427.31)", "Type 2 Diabetes Mellitus", "140/86", 88, 96, 36.7),
        ("MRN-89433", "Samuel Jackson", 58, "Male", "O-", 1, "Dr. Elena Vance, MD", "General Medicine", "BED-304", "Discharge Pending", "2026-09-07", "Cellulitis of Lower Extremity with Diabetic Foot Ulcer", "Obesity Class II", "130/82", 74, 98, 37.0),
        ("MRN-89434", "Dorothy Gale", 83, "Female", "A-", 1, "Dr. Elena Vance, MD", "Endocrinology Wing", "BED-105", "Admitted", "2026-09-13", "End-Stage Renal Disease with Type 2 Diabetes", "Chronic Anemia", "146/90", 82, 94, 36.6),
        ("MRN-89435", "Vikram Sethi", 61, "Male", "B+", 1, "Dr. Elena Vance, MD", "Cardiology Step-Down", "BED-204", "Admitted", "2026-09-11", "Ischemic Cardiomyopathy", "Type 2 Diabetes Mellitus with Neuropathy", "136/84", 80, 97, 36.8),
        ("MRN-89436", "Hannah Arendt", 50, "Female", "O+", 1, "Dr. Elena Vance, MD", "General Medicine", "BED-305", "Admitted", "2026-09-15", "Newly Diagnosed Type 2 Diabetes with Polydipsia", "Vitamin D Deficiency", "120/76", 72, 99, 36.6)
    ]

    cursor.executemany("""
    INSERT INTO patients (
        mrn, full_name, age, gender, blood_type, assigned_doctor_id, assigned_doctor_name,
        ward, bed_number, status, admission_date, primary_diagnosis, secondary_diagnosis,
        vitals_bp, vitals_hr, vitals_spo2, vitals_temp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, patients_data)

    # Seed Encounters matching Diabetes 130-US Hospitals feature schema
    encounters_data = [
        # (patient_id, date, stay, labs, procs, meds, outpat, emerg, inpat, diag_cnt, glu, a1c, high_glu, high_a1c, ins_chg, diab_med, circ, renal, resp, med_list)
        (1, "2026-09-10", 7, 68, 2, 22, 1, 3, 2, 9, ">200", ">8", 1, 1, 1, 1, 1, 0, 0, "Insulin Glargine, Metformin 1000mg, Lisinopril 20mg, Atorvastatin 40mg, Furosemide 40mg"),
        (2, "2026-09-12", 5, 74, 1, 26, 0, 4, 3, 11, ">300", ">8", 1, 1, 1, 1, 0, 1, 0, "Insulin Lispro, Insulin Glargine, Losartan 50mg, Torsemide 20mg, Sodium Bicarbonate"),
        (3, "2026-09-08", 4, 42, 3, 14, 2, 0, 1, 6, "Norm", "Norm", 0, 0, 0, 1, 1, 0, 0, "Metformin 500mg, Clopidogrel 75mg, Metoprolol Tartrate 50mg, Rosuvastatin 20mg"),
        (4, "2026-09-11", 3, 31, 0, 8, 1, 0, 0, 4, "Norm", ">7", 0, 0, 0, 1, 0, 0, 0, "Metformin 850mg, Gabapentin 300mg, Amlodipine 5mg"),
        (5, "2026-09-13", 8, 89, 4, 28, 0, 5, 4, 14, ">200", ">8", 1, 1, 1, 1, 1, 1, 1, "Insulin Infusion, Ticagrelor 90mg, Carvedilol 25mg, Bumetanide 2mg, Spironolactone 25mg"),
        (6, "2026-09-14", 2, 28, 0, 6, 0, 0, 0, 3, "Norm", "Norm", 0, 0, 0, 1, 0, 0, 0, "Insulin Aspart Low-Dose, Prenatal Multivitamin, Iron Supplement"),
        (7, "2026-09-09", 6, 52, 2, 19, 2, 1, 1, 8, ">200", ">7", 1, 0, 1, 1, 1, 0, 0, "Insulin NPH, Glimepiride 4mg, Valsartan 160mg, Hydrochlorothiazide 25mg"),
        (8, "2026-09-05", 2, 24, 0, 5, 3, 0, 0, 3, "Norm", "Norm", 0, 0, 0, 1, 0, 0, 0, "Metformin 1000mg ER, Simvastatin 20mg"),
        (9, "2026-09-13", 3, 61, 1, 15, 0, 2, 1, 5, "Norm", ">8", 0, 1, 1, 1, 0, 0, 0, "Dextrose 50% bolus, Glargine dose-reduced, Glucagon emergency kit"),
        (10, "2026-09-14", 9, 95, 3, 32, 1, 4, 3, 13, ">300", ">8", 1, 1, 1, 1, 1, 1, 1, "Ceftriaxone IV, Azithromycin IV, Regular Insulin IV, Norepinephrine, Enoxaparin"),
        (11, "2026-09-12", 4, 38, 1, 12, 1, 1, 0, 6, ">200", ">7", 1, 0, 0, 1, 0, 0, 0, "Empagliflozin 25mg, Metformin 1000mg, Cilostazol 100mg"),
        (12, "2026-09-10", 5, 49, 1, 18, 2, 1, 1, 7, "Norm", "Norm", 0, 0, 0, 1, 1, 0, 0, "Apixaban 5mg, Diltiazem 180mg, Sitagliptin 100mg, Atorvastatin 20mg"),
        (13, "2026-09-07", 6, 58, 2, 17, 0, 1, 1, 6, "Norm", ">7", 0, 0, 1, 1, 0, 0, 0, "Ampicillin-Sulbactam IV, Insulin regular sliding scale, Pregabalin 75mg"),
        (14, "2026-09-13", 7, 82, 2, 24, 1, 3, 3, 12, ">200", ">8", 1, 1, 1, 1, 1, 1, 0, "Epoetin alfa, Sevelamer 800mg, Insulin Degludec, Amlodipine 10mg"),
        (15, "2026-09-11", 5, 46, 2, 16, 1, 0, 1, 7, "Norm", ">7", 0, 0, 0, 1, 1, 0, 0, "Sacubitril/Valsartan 49/51mg, Metformin 500mg, Bisoprolol 5mg"),
        (16, "2026-09-15", 2, 30, 0, 4, 0, 0, 0, 2, ">200", ">8", 1, 1, 0, 1, 0, 0, 0, "Metformin 500mg titration, Diabetic educator referral")
    ]

    cursor.executemany("""
    INSERT INTO encounters (
        patient_id, encounter_date, time_in_hospital, num_lab_procedures, num_procedures,
        num_medications, number_outpatient, number_emergency, number_inpatient,
        number_diagnoses, max_glu_serum, a1c_result, high_glucose, high_a1c,
        insulin_changed, diabetes_med, comorbidity_circulatory, comorbidity_renal,
        comorbidity_respiratory, medication_list
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, encounters_data)

    # Seed Initial Recommendations
    recs = [
        (1, "Medication", "Titrate Basal Insulin Post-Discharge", "Schedule tele-health nurse check at Day 3 to monitor fasting glucose and titrate glargine from 24u to 28u as tolerated.", "HIGH"),
        (1, "Follow-up", "Cardiology Clinic Encounter within 7 Days", "Patient has concurrent CHF (ICD 428.0) and elevated NT-proBNP; 7-day follow-up reduces 30-day readmission hazard by 34%.", "URGENT"),
        (1, "Monitoring", "Continuous Glucose Monitoring (CGM) Sensor Setup", "Equip patient with Abbott Freestyle Libre 3 sensor prior to discharge with automated telemetry alerts.", "MEDIUM"),
        (2, "Medication", "Renal Dose Adjustment for Metformin / SGLT2", "Patient eGFR is 41 mL/min. Discontinue Metformin; switch to Linagliptin 5mg daily to protect remaining nephron function.", "URGENT"),
        (2, "Follow-up", "Nephrology + Diabetic Foot Assessment", "Schedule dual appointment within 10 days post-discharge.", "HIGH"),
        (5, "Monitoring", "Post-PCI Telemetry & Fluid Balance Protocol", "Strict daily dry weight recording. Patient should call clinic if weight increases by >3 lbs in 48 hours.", "URGENT")
    ]
    cursor.executemany("""
    INSERT INTO recommendations (patient_id, category, title, description, priority)
    VALUES (?, ?, ?, ?, ?)
    """, recs)

    # Seed Initial System Audit Logs
    audit_entries = [
        ("system", "system_admin", "SYSTEM_INIT", "HealthForecast AI platform initialized with Diabetes 130-US Hospitals schema."),
        ("doctor@healthforecast.ai", "doctor", "PATIENT_REVIEW", "Dr. Elena Vance reviewed patient Robert Chen (MRN-89421) readmission risk profile."),
        ("admin@healthforecast.ai", "hospital_admin", "REPORT_GENERATED", "Marcus Sterling exported Executive Readmission & Bed Capacity Summary."),
        ("researcher@healthforecast.ai", "healthcare_researcher", "COHORT_QUERY", "Dr. Aris Thorne generated anonymized cohort query for HbA1c > 8.0% diabetic patients."),
        ("sysadmin@healthforecast.ai", "system_admin", "MODEL_BENCHMARK", "Alex Mercer benchmarked RandomForest vs GradientBoosting models. Active model set to RandomForest.")
    ]
    cursor.executemany("""
    INSERT INTO audit_logs (user_email, role, action, details)
    VALUES (?, ?, ?, ?)
    """, audit_entries)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    seed_db()
    print("Database initialized and seeded successfully!")
