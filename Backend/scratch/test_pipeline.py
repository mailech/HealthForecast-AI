import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.ai.predictor import predictor_instance

def build_pred_data(patient_id, vitals, conditions, patient_dob="1970-01-01", patient_gender="Female", active_meds=None):
    active_meds = active_meds or []
    bp_sys = vitals.get('bp_systolic')
    bp_dia = vitals.get('bp_diastolic')
    glucose = vitals.get('blood_glucose')
    hba1c = vitals.get('hba1c')
    hr = vitals.get('heart_rate')
    spo2 = vitals.get('spo2')
    bmi = vitals.get('bmi')
    cholesterol = vitals.get('cholesterol')

    has_diabetes = bool(conditions.get('has_diabetes') or (glucose and glucose >= 180) or (hba1c and hba1c >= 7.0))
    has_hypertension = bool(conditions.get('has_hypertension') or (bp_sys and bp_sys >= 140) or (bp_dia and bp_dia >= 90))
    has_heart_disease = bool(conditions.get('has_heart_disease') or (hr and hr >= 100 and bp_sys and bp_sys >= 150))

    # Diagnoses
    if has_diabetes or (glucose and glucose >= 180) or (hba1c and hba1c >= 7.0):
        diag_1 = "250.01"
    elif has_heart_disease or (bp_sys and bp_sys >= 160):
        diag_1 = "410"
    elif has_hypertension or (bp_sys and bp_sys >= 140):
        diag_1 = "401"
    elif cholesterol and cholesterol >= 240:
        diag_1 = "272"
    elif spo2 and spo2 <= 92:
        diag_1 = "460"
    else:
        diag_1 = "401"

    diag_2 = "401" if (has_hypertension or (bp_sys and bp_sys >= 140)) else ("250.01" if has_diabetes else "272")
    diag_3 = "410" if has_heart_disease else ("272" if (cholesterol and cholesterol >= 240) else ("460" if (spo2 and spo2 <= 94) else "V58"))

    # Number of diagnoses
    diag_count = 1
    if has_diabetes or (glucose and glucose >= 140) or (hba1c and hba1c >= 6.5): diag_count += 1
    if has_hypertension or (bp_sys and bp_sys >= 130) or (bp_dia and bp_dia >= 85): diag_count += 1
    if has_heart_disease or (hr and hr >= 90): diag_count += 1
    if bmi and bmi >= 30: diag_count += 1
    if cholesterol and cholesterol >= 200: diag_count += 1
    if spo2 and spo2 <= 95: diag_count += 1
    if conditions.get('other'): diag_count += 1
    if (bp_sys and bp_sys >= 160) or (glucose and glucose >= 250) or (hba1c and hba1c >= 9.0) or (spo2 and spo2 <= 91): diag_count += 2
    number_diagnoses = min(max(diag_count, 2), 16)

    # Time in hospital
    stay = 2
    if (bp_sys and bp_sys >= 160) or (bp_dia and bp_dia >= 100): stay += 2
    if (glucose and glucose >= 250) or (hba1c and hba1c >= 9.0): stay += 2
    if (spo2 and spo2 <= 92): stay += 2
    if has_heart_disease: stay += 1
    if has_diabetes and has_hypertension: stay += 1
    time_in_hospital = min(max(stay, 1), 14)

    # Lab procedures
    labs = 25
    if glucose is not None: labs += 10
    if hba1c is not None: labs += 10
    if cholesterol is not None: labs += 10
    if spo2 is not None: labs += 10
    if (glucose and glucose >= 200) or (hba1c and hba1c >= 8.5): labs += 15
    if (bp_sys and bp_sys >= 160): labs += 10
    if has_heart_disease: labs += 10
    num_lab_procedures = min(max(labs, 15), 150)

    # Procedures & Prior utilization
    num_procedures = 2 if (has_heart_disease and bp_sys and bp_sys >= 160) else (1 if (has_heart_disease or (bp_sys and bp_sys >= 150)) else 0)

    severity_flags = sum([
        bool(bp_sys and bp_sys >= 160),
        bool(glucose and glucose >= 220),
        bool(hba1c and hba1c >= 8.5),
        bool(spo2 and spo2 <= 92),
        bool(has_heart_disease and has_diabetes)
    ])
    num_inpatient = 2 if severity_flags >= 3 else (1 if severity_flags >= 2 else 0)
    num_emergency = 1 if severity_flags >= 3 else 0

    # Medications
    med_cols = {m: "No" for m in [
        "metformin", "repaglinide", "nateglinide", "chlorpropamide", "glimepiride",
        "acetohexamide", "glipizide", "glyburide", "tolbutamide", "pioglitazone",
        "rosiglitazone", "acarbose", "miglitol", "troglitazone", "tolazamide",
        "examide", "citoglipton", "insulin", "glyburide-metformin",
        "glipizide-metformin", "glimepiride-pioglitazone",
        "metformin-rosiglitazone", "metformin-pioglitazone"
    ]}

    num_meds = len(active_meds)
    if num_meds == 0 and has_diabetes:
        med_cols["metformin"] = "Steady"
        num_meds = 1

    if (glucose and glucose >= 220) or (hba1c and hba1c >= 8.5):
        med_cols["insulin"] = "Up"
        med_cols["metformin"] = "Steady"
        num_meds = max(num_meds, 2)

    change = "Ch" if (severity_flags >= 2 or (glucose and glucose >= 200) or (hba1c and hba1c >= 8.0) or (bp_sys and bp_sys >= 150)) else "No"
    diabetes_med = "Yes" if (has_diabetes or (glucose and glucose >= 180) or (hba1c and hba1c >= 7.0)) else "No"

    pred_data = {
        "patient_id": patient_id,
        "race": "Caucasian",
        "gender": patient_gender,
        "age": "[50-60)",
        "admission_type_id": 1,
        "discharge_disposition_id": 1,
        "admission_source_id": 7,
        "time_in_hospital": time_in_hospital,
        "num_lab_procedures": num_lab_procedures,
        "num_procedures": num_procedures,
        "num_medications": max(num_meds, 3),
        "number_outpatient": 0,
        "number_emergency": num_emergency,
        "number_inpatient": num_inpatient,
        "diag_1": diag_1,
        "diag_2": diag_2,
        "diag_3": diag_3,
        "number_diagnoses": number_diagnoses,
        "medical_specialty": "InternalMedicine",
        "change": change,
        "diabetesMed": diabetes_med,
    }
    pred_data.update(med_cols)
    return pred_data

# Test Case A: Low Risk
vitals_a = {'bp_systolic': 118, 'bp_diastolic': 75, 'blood_glucose': 95, 'hba1c': 5.2, 'heart_rate': 70, 'spo2': 99, 'bmi': 22, 'cholesterol': 170}
conds_a = {'has_diabetes': False, 'has_hypertension': False, 'has_heart_disease': False}
res_a = predictor_instance.predict(build_pred_data("P001", vitals_a, conds_a))
print("Case A (Low Risk):", res_a['risk_level'], f"{res_a['readmission_risk_score']*100:.1f}%")

# Test Case B: Moderate Risk
vitals_b = {'bp_systolic': 145, 'bp_diastolic': 92, 'blood_glucose': 170, 'hba1c': 7.5, 'heart_rate': 88, 'spo2': 95, 'bmi': 28, 'cholesterol': 225}
conds_b = {'has_diabetes': True, 'has_hypertension': True, 'has_heart_disease': False}
res_b = predictor_instance.predict(build_pred_data("P002", vitals_b, conds_b))
print("Case B (Moderate Risk):", res_b['risk_level'], f"{res_b['readmission_risk_score']*100:.1f}%")

# Test Case C: High Risk (User's exact example)
vitals_c = {'bp_systolic': 170, 'bp_diastolic': 105, 'blood_glucose': 280, 'hba1c': 9.5, 'heart_rate': 110, 'spo2': 91, 'bmi': 32, 'cholesterol': 260}
conds_c = {'has_diabetes': True, 'has_hypertension': True, 'has_heart_disease': True}
res_c = predictor_instance.predict(build_pred_data("P003", vitals_c, conds_c))
print("Case C (High Risk):", res_c['risk_level'], f"{res_c['readmission_risk_score']*100:.1f}%")
