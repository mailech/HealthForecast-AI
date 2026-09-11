import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.core.config import settings

DATASET_PATH = settings.DATASET_PATH
EXPIRED_DISPOSITIONS = [11, 13, 14, 19, 20, 21]

ANALYTICS_DISCLAIMER = (
    "Observational Association Disclaimer: All analytics represent historical correlations "
    "within the Diabetes 130-US Hospitals dataset. These metrics describe observational patterns "
    "and must NOT be interpreted as causal treatment efficacy or proof that a medication prevented/caused readmission."
)

HOSPITAL_ANONYMITY_DISCLAIMER = (
    "Hospital Anonymity & System-Level Analytics Note: The dataset represents encounters from 130 US hospitals (1999-2008), "
    "but does NOT provide individual hospital-name identifiers. All performance metrics are presented at the aggregate healthcare system level."
)

_df_cache = None

def load_analytics_dataframe() -> pd.DataFrame:
    """Load diabetic_data.csv and apply standard non-expired filtering."""
    global _df_cache
    if _df_cache is not None:
        return _df_cache

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset missing at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    # Filter out expired / hospice patient encounters
    df_clean = df[~df['discharge_disposition_id'].isin(EXPIRED_DISPOSITIONS)].copy()
    _df_cache = df_clean
    return _df_cache

def map_icd9_category(code: Any) -> str:
    """Group ICD-9 diagnosis code into organ system categories."""
    if pd.isna(code) or str(code).strip() == '?':
        return 'Other'
    code_str = str(code).strip()
    if code_str.startswith('250'):
        return 'Diabetes'
    try:
        val = float(code_str)
        if (390 <= val <= 459) or val == 785:
            return 'Circulatory'
        elif (460 <= val <= 519) or val == 786:
            return 'Respiratory'
        elif (520 <= val <= 579) or val == 787:
            return 'Digestive'
        elif (580 <= val <= 629) or val == 788:
            return 'Genitourinary'
        elif (140 <= val <= 239):
            return 'Neoplasms'
        elif (800 <= val <= 999):
            return 'Injury'
        elif (710 <= val <= 739):
            return 'Musculoskeletal'
        else:
            return 'Other'
    except ValueError:
        return 'Other'

def calculate_cohort_metrics(cohort_df: pd.DataFrame, total_dataset_count: int, name: str) -> Dict[str, Any]:
    """Calculate sample size, readmission rates, and relative risk for a given cohort."""
    n = len(cohort_df)
    if n == 0:
        return {
            "cohort_name": name,
            "sample_size": 0,
            "cohort_percentage": 0.0,
            "early_readmit_count": 0,
            "early_readmit_rate": 0.0,
            "late_readmit_rate": 0.0,
            "no_readmit_rate": 0.0,
            "relative_risk_vs_baseline": 0.0
        }

    c_30 = int((cohort_df['readmitted'] == '<30').sum())
    c_gt30 = int((cohort_df['readmitted'] == '>30').sum())
    c_no = int((cohort_df['readmitted'] == 'NO').sum())

    rate_30 = round((c_30 / n) * 100, 2)
    rate_gt30 = round((c_gt30 / n) * 100, 2)
    rate_no = round((c_no / n) * 100, 2)
    
    # Baseline early readmit rate = 11.19%
    baseline = 11.19
    relative_risk = round(rate_30 / baseline, 2) if baseline > 0 else 1.0

    return {
        "cohort_name": name,
        "sample_size": n,
        "cohort_percentage": round((n / total_dataset_count) * 100, 2),
        "early_readmit_count": c_30,
        "early_readmit_rate": rate_30,
        "late_readmit_rate": rate_gt30,
        "no_readmit_rate": rate_no,
        "relative_risk_vs_baseline": relative_risk
    }

class TreatmentAnalyticsService:

    @staticmethod
    def get_treatment_summary() -> Dict[str, Any]:
        """Global summary of diabetes medication prevalence and drug usage distributions."""
        df = load_analytics_dataframe()
        total_n = len(df)

        diabetes_med_yes = int((df['diabetesMed'] == 'Yes').sum())
        change_ch = int((df['change'] == 'Ch').sum())

        active_meds = [
            'insulin', 'metformin', 'glipizide', 'glyburide', 'pioglitazone',
            'rosiglitazone', 'glimepiride', 'repaglinide', 'nateglinide',
            'glyburide-metformin', 'acarbose'
        ]

        drug_prevalence = []
        for drug in active_meds:
            if drug in df.columns:
                users_cnt = int((df[drug] != 'No').sum())
                drug_prevalence.append({
                    "medication_name": drug.capitalize(),
                    "user_count": users_cnt,
                    "prevalence_percentage": round((users_cnt / total_n) * 100, 2)
                })

        drug_prevalence.sort(key=lambda x: x["user_count"], reverse=True)

        return {
            "total_encounters_analyzed": total_n,
            "diabetes_med_prescribed": {
                "count": diabetes_med_yes,
                "percentage": round((diabetes_med_yes / total_n) * 100, 2)
            },
            "regimen_changed": {
                "count": change_ch,
                "percentage": round((change_ch / total_n) * 100, 2)
            },
            "top_prescribed_medications": drug_prevalence,
            "disclaimer": ANALYTICS_DISCLAIMER
        }

    @staticmethod
    def get_medication_outcomes() -> Dict[str, Any]:
        """Comparative 30-day readmission outcomes across major medication groups."""
        df = load_analytics_dataframe()
        total_n = len(df)

        cohorts = []

        # 1. Insulin Users vs Non-Users
        insulin_users = df[df['insulin'] != 'No']
        insulin_non_users = df[df['insulin'] == 'No']
        cohorts.append(calculate_cohort_metrics(insulin_users, total_n, "Insulin Therapy (All Doses)"))
        cohorts.append(calculate_cohort_metrics(insulin_non_users, total_n, "No Insulin Therapy"))

        # 2. Insulin Dosage Dynamics (Up, Down, Steady)
        for dose in ['Up', 'Down', 'Steady']:
            sub = df[df['insulin'] == dose]
            cohorts.append(calculate_cohort_metrics(sub, total_n, f"Insulin Dosage: {dose}"))

        # 3. Metformin Users vs Non-Users
        met_users = df[df['metformin'] != 'No']
        met_non_users = df[df['metformin'] == 'No']
        cohorts.append(calculate_cohort_metrics(met_users, total_n, "Metformin Therapy"))
        cohorts.append(calculate_cohort_metrics(met_non_users, total_n, "No Metformin Therapy"))

        # 4. Sulfonylureas (Glipizide, Glyburide, Glimepiride)
        sulfo_mask = (df['glipizide'] != 'No') | (df['glyburide'] != 'No') | (df['glimepiride'] != 'No')
        cohorts.append(calculate_cohort_metrics(df[sulfo_mask], total_n, "Sulfonylurea Therapy"))

        # 5. Thiazolidinediones (TZDs: Pioglitazone, Rosiglitazone)
        tzd_mask = (df['pioglitazone'] != 'No') | (df['rosiglitazone'] != 'No')
        cohorts.append(calculate_cohort_metrics(df[tzd_mask], total_n, "TZD Therapy (Pioglitazone/Rosiglitazone)"))

        # 6. Monotherapy vs Combination Therapy vs No Meds
        med_cols = ['insulin', 'metformin', 'glipizide', 'glyburide', 'pioglitazone', 'rosiglitazone', 'glimepiride']
        active_drug_counts = (df[med_cols] != 'No').sum(axis=1)

        cohorts.append(calculate_cohort_metrics(df[active_drug_counts == 0], total_n, "No Diabetes Medications (0 Drugs)"))
        cohorts.append(calculate_cohort_metrics(df[active_drug_counts == 1], total_n, "Monotherapy (Exactly 1 Drug)"))
        cohorts.append(calculate_cohort_metrics(df[active_drug_counts >= 2], total_n, "Combination Therapy (2+ Drugs)"))

        return {
            "baseline_readmission_rate_30d": 11.19,
            "cohort_outcomes": cohorts,
            "disclaimer": ANALYTICS_DISCLAIMER
        }

    @staticmethod
    def get_change_status_outcomes() -> Dict[str, Any]:
        """Readmission outcomes by medication change status and diabetesMed status."""
        df = load_analytics_dataframe()
        total_n = len(df)

        cohorts = []

        # Change status
        change_ch = df[df['change'] == 'Ch']
        change_no = df[df['change'] == 'No']
        cohorts.append(calculate_cohort_metrics(change_ch, total_n, "Regimen Changed (change = Ch)"))
        cohorts.append(calculate_cohort_metrics(change_no, total_n, "Regimen Unchanged (change = No)"))

        # DiabetesMed status
        med_yes = df[df['diabetesMed'] == 'Yes']
        med_no = df[df['diabetesMed'] == 'No']
        cohorts.append(calculate_cohort_metrics(med_yes, total_n, "Diabetes Med Prescribed (diabetesMed = Yes)"))
        cohorts.append(calculate_cohort_metrics(med_no, total_n, "No Diabetes Med Prescribed (diabetesMed = No)"))

        # Cross-tabulation
        ch_yes = df[(df['change'] == 'Ch') & (df['diabetesMed'] == 'Yes')]
        no_yes = df[(df['change'] == 'No') & (df['diabetesMed'] == 'Yes')]
        no_no = df[(df['change'] == 'No') & (df['diabetesMed'] == 'No')]

        cohorts.append(calculate_cohort_metrics(ch_yes, total_n, "Changed & Prescribed Meds (Ch + Yes)"))
        cohorts.append(calculate_cohort_metrics(no_yes, total_n, "Unchanged & Prescribed Meds (No + Yes)"))
        cohorts.append(calculate_cohort_metrics(no_no, total_n, "Unchanged & No Meds (No + No)"))

        return {
            "baseline_readmission_rate_30d": 11.19,
            "cohort_outcomes": cohorts,
            "disclaimer": ANALYTICS_DISCLAIMER
        }

    @staticmethod
    def get_polypharmacy_outcomes() -> Dict[str, Any]:
        """Readmission outcomes stratified by total medication count brackets."""
        df = load_analytics_dataframe()
        total_n = len(df)

        cohorts = []

        b1 = df[df['num_medications'] <= 5]
        b2 = df[(df['num_medications'] >= 6) & (df['num_medications'] <= 11)]
        b3 = df[(df['num_medications'] >= 12) & (df['num_medications'] <= 19)]
        b4 = df[df['num_medications'] >= 20]

        cohorts.append(calculate_cohort_metrics(b1, total_n, "Low Polypharmacy (1-5 Medications)"))
        cohorts.append(calculate_cohort_metrics(b2, total_n, "Moderate Polypharmacy (6-11 Medications)"))
        cohorts.append(calculate_cohort_metrics(b3, total_n, "High Polypharmacy (12-19 Medications)"))
        cohorts.append(calculate_cohort_metrics(b4, total_n, "Severe Polypharmacy (20+ Medications)"))

        return {
            "baseline_readmission_rate_30d": 11.19,
            "cohort_outcomes": cohorts,
            "disclaimer": ANALYTICS_DISCLAIMER
        }

class HospitalPerformanceService:

    @staticmethod
    def get_overall_performance() -> Dict[str, Any]:
        """System-wide aggregate performance KPIs across 130 US hospitals."""
        df = load_analytics_dataframe()
        total_n = len(df)

        c_30 = int((df['readmitted'] == '<30').sum())
        c_gt30 = int((df['readmitted'] == '>30').sum())
        c_no = int((df['readmitted'] == 'NO').sum())

        avg_stay = round(float(df['time_in_hospital'].mean()), 2)
        
        # High utilization patients: prior inpatient or emergency visits > 0
        high_util_mask = (df['number_inpatient'] > 0) | (df['number_emergency'] > 0)
        high_util_count = int(high_util_mask.sum())
        high_util_pct = round((high_util_count / total_n) * 100, 2)

        extended_stay_mask = df['time_in_hospital'] >= 6
        extended_stay_pct = round((int(extended_stay_mask.sum()) / total_n) * 100, 2)

        return {
            "total_encounters_analyzed": 101766,
            "eligible_encounters_count": total_n,
            "early_readmit_count": c_30,
            "early_readmit_rate_pct": round((c_30 / total_n) * 100, 2),
            "late_readmit_rate_pct": round((c_gt30 / total_n) * 100, 2),
            "no_readmit_rate_pct": round((c_no / total_n) * 100, 2),
            "overall_outcome_distribution": {
                "early_readmission": {
                    "count": c_30,
                    "percentage": round((c_30 / total_n) * 100, 2)
                },
                "late_readmission": {
                    "count": c_gt30,
                    "percentage": round((c_gt30 / total_n) * 100, 2)
                },
                "no_readmission": {
                    "count": c_no,
                    "percentage": round((c_no / total_n) * 100, 2)
                }
            },
            "average_length_of_stay_days": avg_stay,
            "high_utilization_patient_pct": high_util_pct,
            "extended_stay_rate_pct": extended_stay_pct,
            "dataset_hospital_system_count": 130,
            "dataset_time_span": "1999–2008",
            "hospital_anonymity_disclaimer": HOSPITAL_ANONYMITY_DISCLAIMER,
            "disclaimer": ANALYTICS_DISCLAIMER
        }

    @staticmethod
    def get_admission_context_outcomes() -> Dict[str, Any]:
        """Readmission outcomes stratified by Admission Type, Source, Age, Specialty, and Diagnosis Group."""
        df = load_analytics_dataframe()
        total_n = len(df)

        cohorts = []

        # 1. Admission Type
        adm_type_map = {1: "Emergency Admission", 2: "Urgent Admission", 3: "Elective Admission", 6: "Trauma Center Admission"}
        for tid, name in adm_type_map.items():
            sub = df[df['admission_type_id'] == tid]
            cohorts.append(calculate_cohort_metrics(sub, total_n, f"Admission Type: {name}"))

        # 2. Admission Source
        adm_src_map = {7: "Emergency Room Source", 1: "Physician Referral", 2: "Clinic Referral", 4: "Hospital Transfer"}
        for sid, name in adm_src_map.items():
            sub = df[df['admission_source_id'] == sid]
            cohorts.append(calculate_cohort_metrics(sub, total_n, f"Admission Source: {name}"))

        # 3. Age Groups
        age_groups = ["[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)", "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"]
        for age in age_groups:
            sub = df[df['age'] == age]
            if len(sub) > 0:
                cohorts.append(calculate_cohort_metrics(sub, total_n, f"Age Group: {age}"))

        # 4. Top Medical Specialties
        top_specs = ["InternalMedicine", "Cardiology", "GeneralSurgery", "Family/GeneralPractice", "Emergency/Trauma"]
        for spec in top_specs:
            sub = df[df['medical_specialty'] == spec]
            cohorts.append(calculate_cohort_metrics(sub, total_n, f"Specialty: {spec}"))

        # 5. Primary ICD-9 Diagnosis Group
        df_diag = df.copy()
        df_diag['diag_1_group'] = df_diag['diag_1'].apply(map_icd9_category)
        for cat in ["Circulatory", "Respiratory", "Digestive", "Genitourinary", "Diabetes", "Neoplasms", "Musculoskeletal", "Injury"]:
            sub = df_diag[df_diag['diag_1_group'] == cat]
            cohorts.append(calculate_cohort_metrics(sub, total_n, f"Primary Diagnosis: {cat}"))

        return {
            "baseline_readmission_rate_30d": 11.19,
            "cohort_outcomes": cohorts,
            "hospital_anonymity_disclaimer": HOSPITAL_ANONYMITY_DISCLAIMER,
            "disclaimer": ANALYTICS_DISCLAIMER
        }

    @staticmethod
    def get_utilization_trends() -> Dict[str, Any]:
        """Readmission risk trends by prior 12-month inpatient, emergency, and outpatient utilization."""
        df = load_analytics_dataframe()
        total_n = len(df)

        cohorts = []

        # Prior Inpatient Visits
        cohorts.append(calculate_cohort_metrics(df[df['number_inpatient'] == 0], total_n, "Prior Inpatient: 0 Visits"))
        cohorts.append(calculate_cohort_metrics(df[df['number_inpatient'] == 1], total_n, "Prior Inpatient: 1 Visit"))
        cohorts.append(calculate_cohort_metrics(df[df['number_inpatient'] == 2], total_n, "Prior Inpatient: 2 Visits"))
        cohorts.append(calculate_cohort_metrics(df[df['number_inpatient'] >= 3], total_n, "Prior Inpatient: 3+ Visits"))

        # Prior Emergency Visits
        cohorts.append(calculate_cohort_metrics(df[df['number_emergency'] == 0], total_n, "Prior Emergency: 0 Visits"))
        cohorts.append(calculate_cohort_metrics(df[df['number_emergency'] == 1], total_n, "Prior Emergency: 1 Visit"))
        cohorts.append(calculate_cohort_metrics(df[df['number_emergency'] >= 2], total_n, "Prior Emergency: 2+ Visits"))

        # Prior Outpatient Visits
        cohorts.append(calculate_cohort_metrics(df[df['number_outpatient'] == 0], total_n, "Prior Outpatient: 0 Visits"))
        cohorts.append(calculate_cohort_metrics(df[(df['number_outpatient'] >= 1) & (df['number_outpatient'] <= 2)], total_n, "Prior Outpatient: 1-2 Visits"))
        cohorts.append(calculate_cohort_metrics(df[df['number_outpatient'] >= 3], total_n, "Prior Outpatient: 3+ Visits"))

        return {
            "baseline_readmission_rate_30d": 11.19,
            "cohort_outcomes": cohorts,
            "hospital_anonymity_disclaimer": HOSPITAL_ANONYMITY_DISCLAIMER,
            "disclaimer": ANALYTICS_DISCLAIMER
        }

    @staticmethod
    def get_length_of_stay_outcomes() -> Dict[str, Any]:
        """Readmission risk stratified across length of hospital stay brackets."""
        df = load_analytics_dataframe()
        total_n = len(df)

        cohorts = []

        b1 = df[(df['time_in_hospital'] >= 1) & (df['time_in_hospital'] <= 2)]
        b2 = df[(df['time_in_hospital'] >= 3) & (df['time_in_hospital'] <= 5)]
        b3 = df[(df['time_in_hospital'] >= 6) & (df['time_in_hospital'] <= 9)]
        b4 = df[(df['time_in_hospital'] >= 10) & (df['time_in_hospital'] <= 14)]

        cohorts.append(calculate_cohort_metrics(b1, total_n, "Short Hospital Stay (1-2 Days)"))
        cohorts.append(calculate_cohort_metrics(b2, total_n, "Moderate Hospital Stay (3-5 Days)"))
        cohorts.append(calculate_cohort_metrics(b3, total_n, "Extended Hospital Stay (6-9 Days)"))
        cohorts.append(calculate_cohort_metrics(b4, total_n, "Long Hospital Stay (10-14 Days)"))

        return {
            "baseline_readmission_rate_30d": 11.19,
            "cohort_outcomes": cohorts,
            "hospital_anonymity_disclaimer": HOSPITAL_ANONYMITY_DISCLAIMER,
            "disclaimer": ANALYTICS_DISCLAIMER
        }
