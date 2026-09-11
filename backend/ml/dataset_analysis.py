import os
import sys
import pandas as pd
import numpy as np

# Path configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "diabetic_data.csv")

def perform_complete_audit():
    print("================================================================================")
    print("HEALTHFORECAST AI — COMPREHENSIVE ML DATASET AUDIT & FEATURE SELECTION REPORT")
    print("================================================================================")
    print(f"Dataset Path: {DATASET_PATH}\n")
    
    if not os.path.exists(DATASET_PATH):
        print(f"Error: {DATASET_PATH} not found.")
        sys.exit(1)
        
    df = pd.read_csv(DATASET_PATH)
    
    total_rows, total_cols = df.shape
    print(f"1. DATASET DIMENSIONS: {total_rows:,} rows (encounters) x {total_cols} columns\n")
    
    # 2. Complete Column Breakdown (All 50 Columns)
    print("2. COMPLETE COLUMN ANALYSIS (ALL 50 COLUMNS):")
    print("-" * 105)
    print(f"{'#':<3} {'Column Name':<28} {'Data Type':<10} {'Unique':<8} {'Missing (?)':<12} {'Missing %':<10} {'Sample Values'}")
    print("-" * 105)
    
    column_audit = []
    for idx, col in enumerate(df.columns, 1):
        dtype = str(df[col].dtype)
        unique_cnt = df[col].nunique()
        q_cnt = (df[col].astype(str).str.strip() == '?').sum()
        null_cnt = df[col].isnull().sum()
        tot_missing = q_cnt + null_cnt
        missing_pct = (tot_missing / total_rows) * 100
        
        sample_vals = df[col].dropna().unique()[:3]
        sample_str = ", ".join([str(v) for v in sample_vals])
        if len(sample_str) > 30:
            sample_str = sample_str[:27] + "..."
            
        column_audit.append({
            'num': idx,
            'name': col,
            'dtype': dtype,
            'unique': unique_cnt,
            'missing': tot_missing,
            'missing_pct': missing_pct,
            'samples': sample_str
        })
        
        print(f"{idx:<3} {col:<28} {dtype:<10} {unique_cnt:<8} {tot_missing:<12} {missing_pct:<9.2f}% {sample_str}")
        
    print("-" * 105)
    
    # 3. Column Type Classification
    identifiers = ['encounter_id', 'patient_nbr']
    target = ['readmitted']
    numerical_features = [
        'time_in_hospital', 'num_lab_procedures', 'num_procedures', 'num_medications',
        'number_outpatient', 'number_emergency', 'number_inpatient', 'number_diagnoses',
        'admission_type_id', 'discharge_disposition_id', 'admission_source_id'
    ]
    categorical_features = [c for c in df.columns if c not in identifiers + target + numerical_features]
    
    print("\n3. COLUMN CATEGORIZATION:")
    print(f"  - Identifiers ({len(identifiers)}): {identifiers}")
    print(f"  - Target ({len(target)}): {target}")
    print(f"  - Numerical Features ({len(numerical_features)}): {numerical_features}")
    print(f"  - Categorical Features ({len(categorical_features)}): {categorical_features}")
    
    # 4. Duplicate Rows and Patient Encounter Patterns
    exact_duplicates = df.duplicated().sum()
    unique_patients = df['patient_nbr'].nunique()
    encounters_per_patient = df.groupby('patient_nbr').size()
    multi_encounter_patients = (encounters_per_patient > 1).sum()
    
    print("\n4. DUPLICATE & PATTERN ANALYSIS:")
    print(f"  - Exact Duplicate Rows: {exact_duplicates}")
    print(f"  - Unique Encounters: {total_rows:,}")
    print(f"  - Unique Patients: {unique_patients:,}")
    print(f"  - Patients with multiple admissions: {multi_encounter_patients:,} ({(multi_encounter_patients/unique_patients)*100:.2f}%)")
    print(f"  - Max admissions per single patient: {encounters_per_patient.max()}")
    print(f"  - Grouping Impact: Random row splits cause GROUP DATA LEAKAGE across train/test folds!")
    
    # 5. Target Distribution Analysis
    print("\n5. READMITTED TARGET DISTRIBUTION:")
    target_counts = df['readmitted'].value_counts()
    target_pcts = df['readmitted'].value_counts(normalize=True) * 100
    for val, cnt in target_counts.items():
        print(f"  - '{val}': {cnt:,} ({target_pcts[val]:.2f}%)")
        
    early_cnt = target_counts.get('<30', 0)
    print(f"\n  Binary Formulation (<30 = 1, >30 & NO = 0):")
    print(f"    - Class 1 (Early Readmit <30d): {early_cnt:,} ({early_cnt/total_rows*100:.2f}%)")
    print(f"    - Class 0 (No Early Readmit)  : {total_rows - early_cnt:,} ({(total_rows - early_cnt)/total_rows*100:.2f}%)")

    # 6. Data Leakage & Expired Patients Check
    expired_dispositions = [11, 13, 14, 19, 20, 21] # Expired / Hospice IDs
    expired_mask = df['discharge_disposition_id'].isin(expired_dispositions)
    expired_count = expired_mask.sum()
    print("\n6. DATA LEAKAGE & EXPIRED PATIENTS AUDIT:")
    print(f"  - Expired / Hospice Care Encounters (disposition 11,13,14,19,20,21): {expired_count:,} ({expired_count/total_rows*100:.2f}%)")
    print(f"    Readmission outcomes for expired patients:\n{df[expired_mask]['readmitted'].value_counts().to_dict()}")
    print(f"    Clinical Leakage Note: Expired patients physically cannot be readmitted. They MUST be excluded from training.")

    # 7. Zero Variance / Single Value Medications
    medications = [
        'metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 'glimepiride',
        'acetohexamide', 'glipizide', 'glyburide', 'tolbutamide', 'pioglitazone',
        'rosiglitazone', 'acarbose', 'miglitol', 'troglitazone', 'tolazamide',
        'examide', 'citoglipton', 'insulin', 'glyburide-metformin', 'glipizide-metformin',
        'glimepiride-pioglitazone', 'metformin-rosiglitazone', 'metformin-pioglitazone'
    ]
    
    zero_var_meds = []
    for med in medications:
        vc = df[med].value_counts()
        if len(vc) <= 1 or (len(vc) > 1 and vc.iloc[1] <= 3):
            zero_var_meds.append((med, dict(vc)))
            
    print("\n7. ZERO / NEAR-ZERO VARIANCE MEDICATIONS (TO EXCLUDE):")
    for med, counts in zero_var_meds:
        print(f"  - {med}: {counts}")

    print("\n================================================================================")
    print("AUDIT COMPLETE — Findings ready for ML_DATASET_ANALYSIS.md documentation")
    print("================================================================================")

if __name__ == "__main__":
    perform_complete_audit()
