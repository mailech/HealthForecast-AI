"""
Interactive Model Tester - HealthForecast AI
Tests both:
  Model 1: Patient Risk Prediction (patient_risk_model.pkl)
  Model 2: Hospital Readmission Prediction (readmission_model.pkl)
"""

import pandas as pd
import numpy as np
import pickle
import os

# ── Load models and preprocessors ──────────────────────────────
BASE    = os.path.dirname(os.path.abspath(__file__))
ROOT    = os.path.abspath(os.path.join(BASE, ".."))
MODELS  = os.path.join(ROOT, "models")
SPLITS  = os.path.join(ROOT, "data", "splits")

with open(os.path.join(MODELS, "patient_risk_model.pkl"), "rb") as f:
    risk_model = pickle.load(f)

with open(os.path.join(MODELS, "preprocessor.pkl"), "rb") as f:
    risk_preprocessor = pickle.load(f)

with open(os.path.join(MODELS, "readmission_model.pkl"), "rb") as f:
    readmission_model = pickle.load(f)

with open(os.path.join(MODELS, "readmission_preprocessor.pkl"), "rb") as f:
    readmission_preprocessor = pickle.load(f)

# ── ICD-9 grouping (same as training) ──────────────────────────
def icd9_group(code):
    if pd.isna(code) or str(code).strip().upper() in ("", "UNKNOWN", "?"):
        return "Unknown"
    code = str(code).strip()
    if code.startswith("E"): return "External_Injury"
    if code.startswith("V"): return "Supplementary"
    try:
        num = float(code)
    except ValueError:
        return "Other"
    if   1 <= num < 140:  return "Infectious"
    if 140 <= num < 240:  return "Neoplasms"
    if 240 <= num < 280:  return "Endocrine_Metabolic"
    if 280 <= num < 290:  return "Blood"
    if 290 <= num < 320:  return "Mental"
    if 320 <= num < 390:  return "Nervous_System"
    if 390 <= num < 460:  return "Circulatory"
    if 460 <= num < 520:  return "Respiratory"
    if 520 <= num < 580:  return "Digestive"
    if 580 <= num < 630:  return "Genitourinary"
    if 630 <= num < 680:  return "Pregnancy"
    if 680 <= num < 710:  return "Skin"
    if 710 <= num < 740:  return "Musculoskeletal"
    if 740 <= num < 760:  return "Congenital"
    if 760 <= num < 780:  return "Perinatal"
    if 780 <= num < 800:  return "Symptoms_Signs"
    if 800 <= num < 1000: return "Injury_Poisoning"
    return "Other"

AGE_ORDER = {
    "[0-10)": 0, "[10-20)": 1, "[20-30)": 2, "[30-40)": 3,
    "[40-50)": 4, "[50-60)": 5, "[60-70)": 6, "[70-80)": 7,
    "[80-90)": 8, "[90-100)": 9,
}

MED_COLS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide",
    "glimepiride", "acetohexamide", "glipizide", "glyburide",
    "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
    "miglitol", "troglitazone", "tolazamide", "examide",
    "citoglipton", "insulin", "glyburide-metformin",
    "glipizide-metformin", "glimepiride-pioglitazone",
    "metformin-rosiglitazone", "metformin-pioglitazone",
]

# ── Input helper ───────────────────────────────────────────────
def ask(prompt, default=None, choices=None):
    hint = f" [{default}]" if default is not None else ""
    if choices:
        hint += f" ({'/'.join(str(c) for c in choices)})"
    while True:
        val = input(f"  {prompt}{hint}: ").strip()
        if val == "" and default is not None:
            return default
        if choices and val not in [str(c) for c in choices]:
            print(f"    Please enter one of: {choices}")
            continue
        return val

# ── Collect raw patient input ───────────────────────────────────
def collect_patient():
    print("\n" + "=" * 60)
    print("  PATIENT INFORMATION  (press Enter to use default)")
    print("=" * 60)

    race = ask("Race", "Caucasian",
               ["Caucasian", "AfricanAmerican", "Hispanic", "Asian", "Other", "Unknown"])
    gender = ask("Gender", "Female", ["Male", "Female"])
    age_bracket = ask("Age bracket", "[50-60)",
                      list(AGE_ORDER.keys()))
    admission_type_id = int(ask("Admission type ID (1=Emergency,2=Urgent,3=Elective)", "1",
                                 ["1","2","3","4","5","6","7","8"]))
    discharge_disposition_id = int(ask("Discharge disposition ID (1=Home,3=SNF,6=Home Health)", "1"))
    admission_source_id = int(ask("Admission source ID (1=Physician,7=Emergency Room)", "7"))
    time_in_hospital = int(ask("Days in hospital (1-14)", "3"))
    num_lab_procedures = int(ask("Number of lab procedures", "40"))
    num_procedures = int(ask("Number of procedures", "1"))
    num_medications = int(ask("Number of medications", "15"))
    number_outpatient = int(ask("Number of outpatient visits (prior year)", "0"))
    number_emergency = int(ask("Number of emergency visits (prior year)", "0"))
    number_inpatient = int(ask("Number of inpatient visits (prior year)", "0"))
    diag_1_raw = ask("Primary diagnosis ICD-9 code (e.g. 250.01)", "250.01")
    diag_2_raw = ask("Secondary diagnosis ICD-9 code", "401")
    diag_3_raw = ask("Tertiary diagnosis ICD-9 code", "272")
    number_diagnoses = int(ask("Number of diagnoses", "9"))
    medical_specialty = ask("Medical specialty", "InternalMedicine")
    change = ask("Medication change during visit?", "No", ["Ch", "No"])
    diabetesMed = ask("On diabetes medication?", "Yes", ["Yes", "No"])

    print("\n  Medication dosage status (No/Steady/Up/Down):")
    meds = {}
    defaults = {m: "No" for m in MED_COLS}
    defaults["metformin"] = "Steady"
    defaults["insulin"] = "Steady"
    for med in MED_COLS:
        meds[med] = ask(f"  {med}", defaults[med], ["No", "Steady", "Up", "Down"])

    return {
        "race": race,
        "gender": gender,
        "age": age_bracket,
        "admission_type_id": admission_type_id,
        "discharge_disposition_id": discharge_disposition_id,
        "admission_source_id": admission_source_id,
        "time_in_hospital": time_in_hospital,
        "num_lab_procedures": num_lab_procedures,
        "num_procedures": num_procedures,
        "num_medications": num_medications,
        "number_outpatient": number_outpatient,
        "number_emergency": number_emergency,
        "number_inpatient": number_inpatient,
        "diag_1": diag_1_raw,
        "diag_2": diag_2_raw,
        "diag_3": diag_3_raw,
        "number_diagnoses": number_diagnoses,
        "medical_specialty": medical_specialty,
        "change": change,
        "diabetesMed": diabetesMed,
        **meds,
    }

# ── Preprocess raw input ────────────────────────────────────────
def preprocess_input(raw):
    df = pd.DataFrame([raw])

    # Ordinal age
    df["age"] = df["age"].map(AGE_ORDER)

    # Binary
    df["change"]      = (df["change"]      == "Ch").astype(int)
    df["diabetesMed"] = (df["diabetesMed"] == "Yes").astype(int)

    # ICD-9 grouping
    for col in ["diag_1", "diag_2", "diag_3"]:
        df[col] = df[col].apply(icd9_group)

    return df

# ── Feature alignment constants ────────────────────────────────
# Load full X_train column list once at startup
_X_train_full   = pd.read_csv(os.path.join(SPLITS, "X_train.csv"))
_ZERO_VAR_COLS  = [c for c in _X_train_full.columns if _X_train_full[c].nunique() <= 1]
_RISK_FEAT_COLS = [c for c in _X_train_full.columns if c not in _ZERO_VAR_COLS]  # 261 cols

_X_readmit_full  = pd.read_csv(os.path.join(SPLITS, "readmission_X_train.csv"), nrows=1)
_READMIT_FEAT_COLS = _X_readmit_full.columns.tolist()  # 266 cols

# ── Debug: verify feature counts at startup ─────────────────────
print("[DEBUG] Risk model expects          :", risk_model.n_features_in_)
print("[DEBUG] Risk preprocessor cols      :", len(_X_train_full.columns), "(before zero-var drop)")
print("[DEBUG] Zero-var cols dropped       :", _ZERO_VAR_COLS)
print("[DEBUG] Risk final feature count    :", len(_RISK_FEAT_COLS))
print("[DEBUG] Readmission model expects   :", readmission_model.n_features_in_)
print("[DEBUG] Readmission feature count   :", len(_READMIT_FEAT_COLS))
assert len(_RISK_FEAT_COLS) == risk_model.n_features_in_, \
    f"Risk feature mismatch: {len(_RISK_FEAT_COLS)} vs {risk_model.n_features_in_}"
assert len(_READMIT_FEAT_COLS) == readmission_model.n_features_in_, \
    f"Readmission feature mismatch: {len(_READMIT_FEAT_COLS)} vs {readmission_model.n_features_in_}"
print("[DEBUG] Feature counts validated OK")

# ── Predict with Model 1 (Risk) ─────────────────────────────────
def predict_risk(df_raw):
    # Step 1: transform (outputs 265 cols)
    X_arr = risk_preprocessor.transform(df_raw)
    # Step 2: assign all 265 column names
    X_df = pd.DataFrame(X_arr, columns=_X_train_full.columns)
    # Step 3: drop 4 zero-variance cols → 261 cols in correct order
    X_df = X_df[_RISK_FEAT_COLS]
    prob  = risk_model.predict_proba(X_df)[0, 1]
    label = "HIGH RISK (readmission < 30 days)" if prob >= 0.5 else "LOW RISK"
    return prob, label

# ── Predict with Model 2 (Readmission) ─────────────────────────
def predict_readmission(df_raw):
    # Transform outputs 266 cols — pass with feature names to suppress warning
    X_arr = readmission_preprocessor.transform(df_raw)
    X_df  = pd.DataFrame(X_arr, columns=_READMIT_FEAT_COLS)
    prob  = readmission_model.predict_proba(X_df)[0, 1]
    label = "LIKELY READMISSION" if prob >= 0.5 else "NO READMISSION EXPECTED"
    return prob, label

# ── Display results ─────────────────────────────────────────────
def show_results(risk_prob, risk_label, readmit_prob, readmit_label):
    print("\n" + "=" * 60)
    print("  PREDICTION RESULTS")
    print("=" * 60)
    print(f"\n  Model 1 — Patient Risk Prediction")
    print(f"    Probability : {risk_prob*100:.2f}%")
    print(f"    Prediction  : {risk_label}")

    print(f"\n  Model 2 — Hospital Readmission Prediction")
    print(f"    Probability : {readmit_prob*100:.2f}%")
    print(f"    Prediction  : {readmit_label}")

    print("\n  Clinical Interpretation:")
    if risk_prob >= 0.5 and readmit_prob >= 0.5:
        print("    ⚠  HIGH ALERT: Patient is at high risk AND likely to be readmitted.")
        print("       Recommend immediate care plan review and follow-up scheduling.")
    elif risk_prob >= 0.5:
        print("    ⚠  Patient is high risk for early readmission (<30 days).")
        print("       Consider enhanced discharge planning.")
    elif readmit_prob >= 0.5:
        print("    ⚠  Patient is likely to be readmitted (any timeframe).")
        print("       Consider outpatient follow-up and medication review.")
    else:
        print("    ✓  Patient appears low risk for readmission.")
    print("=" * 60)

# ── Main loop ───────────────────────────────────────────────────
def main():
    print("\n" + "=" * 60)
    print("  HealthForecast AI — Interactive Model Tester")
    print("  Models loaded: patient_risk_model.pkl | readmission_model.pkl")
    print("=" * 60)

    while True:
        raw = collect_patient()
        df_processed = preprocess_input(raw)

        try:
            risk_prob, risk_label = predict_risk(df_processed)
            readmit_prob, readmit_label = predict_readmission(df_processed)
            show_results(risk_prob, risk_label, readmit_prob, readmit_label)
        except Exception as e:
            print(f"\n  ERROR during prediction: {e}")
            import traceback; traceback.print_exc()

        again = input("\n  Test another patient? (yes/no) [yes]: ").strip().lower()
        if again in ("no", "n"):
            print("\n  Exiting. Goodbye!\n")
            break

if __name__ == "__main__":
    main()
