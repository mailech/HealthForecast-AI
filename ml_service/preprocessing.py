import pandas as pd
import numpy as np
from typing import Dict, Any

# Feature Names expected by ML Model (10 features)
FEATURE_NAMES = [
    "age_num",
    "time_in_hospital",
    "num_lab_procedures",
    "num_medications",
    "number_inpatient",
    "number_emergency",
    "number_diagnoses",
    "max_glu_serum",
    "A1Cresult",
    "diabetesMed",
]

# Categorical mapping dictionaries
AGE_MAP = {
    "[0-10)": 5,
    "[10-20)": 15,
    "[20-30)": 25,
    "[30-40)": 35,
    "[40-50)": 45,
    "[50-60)": 55,
    "[60-70)": 65,
    "[70-80)": 75,
    "[80-90)": 85,
    "[90-100)": 95,
}

MAX_GLU_SERUM_MAP = {
    "None": 0,
    "none": 0,
    "?": 0,
    "Norm": 1,
    "norm": 1,
    ">200": 2,
    ">300": 3,
}

A1C_RESULT_MAP = {
    "None": 0,
    "none": 0,
    "?": 0,
    "Norm": 1,
    "norm": 1,
    ">7": 2,
    ">8": 3,
}

DIABETES_MED_MAP = {
    "No": 0,
    "no": 0,
    "N": 0,
    "Yes": 1,
    "yes": 1,
    "Y": 1,
}

def parse_age(age_val: Any) -> int:
    """Parse age bracket string or numeric age into age midpoint integer."""
    if pd.isna(age_val) or age_val is None:
        return 65
    if isinstance(age_val, (int, float)):
        val = float(age_val)
        if val <= 10: return 5
        elif val <= 20: return 15
        elif val <= 30: return 25
        elif val <= 40: return 35
        elif val <= 50: return 45
        elif val <= 60: return 55
        elif val <= 70: return 65
        elif val <= 80: return 75
        elif val <= 90: return 85
        else: return 95
    
    age_str = str(age_val).strip()
    return AGE_MAP.get(age_str, 65)

def parse_max_glu_serum(val: Any) -> int:
    if pd.isna(val) or val is None:
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    return MAX_GLU_SERUM_MAP.get(str(val).strip(), 0)

def parse_a1c_result(val: Any) -> int:
    if pd.isna(val) or val is None:
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    return A1C_RESULT_MAP.get(str(val).strip(), 0)

def parse_diabetes_med(val: Any) -> int:
    if pd.isna(val) or val is None:
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    return DIABETES_MED_MAP.get(str(val).strip(), 0)

def transform_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Transform raw diabetic_data.csv DataFrame into 10 numeric feature matrix."""
    transformed = pd.DataFrame()
    
    transformed["age_num"] = df["age"].apply(parse_age)
    transformed["time_in_hospital"] = pd.to_numeric(df["time_in_hospital"], errors="coerce").fillna(4).astype(int)
    transformed["num_lab_procedures"] = pd.to_numeric(df["num_lab_procedures"], errors="coerce").fillna(43).astype(int)
    transformed["num_medications"] = pd.to_numeric(df["num_medications"], errors="coerce").fillna(15).astype(int)
    transformed["number_inpatient"] = pd.to_numeric(df["number_inpatient"], errors="coerce").fillna(0).astype(int)
    transformed["number_emergency"] = pd.to_numeric(df["number_emergency"], errors="coerce").fillna(0).astype(int)
    transformed["number_diagnoses"] = pd.to_numeric(df["number_diagnoses"], errors="coerce").fillna(7).astype(int)
    transformed["max_glu_serum"] = df["max_glu_serum"].apply(parse_max_glu_serum)
    transformed["A1Cresult"] = df["A1Cresult"].apply(parse_a1c_result)
    transformed["diabetesMed"] = df["diabetesMed"].apply(parse_diabetes_med)
    
    return transformed[FEATURE_NAMES]

def transform_single_patient(patient_dict: Dict[str, Any]) -> np.ndarray:
    """Transform a single patient dict into a (1, 10) numpy array."""
    age_val = patient_dict.get("age_range") or patient_dict.get("age", "[60-70)")
    age_num = parse_age(age_val)
    
    time_in_hospital = int(patient_dict.get("time_in_hospital", 4))
    num_lab_procedures = int(patient_dict.get("num_lab_procedures", 45))
    num_medications = int(patient_dict.get("num_medications", 14))
    number_inpatient = int(patient_dict.get("number_inpatient", 0))
    number_emergency = int(patient_dict.get("number_emergency", 0))
    number_diagnoses = int(patient_dict.get("number_diagnoses", 8))
    
    max_glu_serum = parse_max_glu_serum(patient_dict.get("max_glu_serum", "None"))
    a1c_result = parse_a1c_result(patient_dict.get("A1Cresult", "None"))
    diabetes_med = parse_diabetes_med(patient_dict.get("diabetesMed", "Yes"))
    
    vector = np.array([[
        age_num,
        time_in_hospital,
        num_lab_procedures,
        num_medications,
        number_inpatient,
        number_emergency,
        number_diagnoses,
        max_glu_serum,
        a1c_result,
        diabetes_med
    ]], dtype=float)
    
    return vector
