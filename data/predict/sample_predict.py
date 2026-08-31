import sys, os
sys.stdout.reconfigure(encoding="utf-8")

import pandas as pd
import pickle

BASE    = os.path.dirname(os.path.abspath(__file__))
ROOT    = os.path.abspath(os.path.join(BASE, ".."))
MODELS  = os.path.join(ROOT, "models")
SPLITS  = os.path.join(ROOT, "data", "splits")

with open(os.path.join(MODELS, "patient_risk_model.pkl"), "rb") as f:
    risk_model = pickle.load(f)
with open(os.path.join(MODELS, "preprocessor.pkl"), "rb") as f:
    risk_prep = pickle.load(f)
with open(os.path.join(MODELS, "readmission_model.pkl"), "rb") as f:
    read_model = pickle.load(f)
with open(os.path.join(MODELS, "readmission_preprocessor.pkl"), "rb") as f:
    read_prep = pickle.load(f)

X_train_full   = pd.read_csv(os.path.join(SPLITS, "X_train.csv"))
X_readmit_full = pd.read_csv(os.path.join(SPLITS, "readmission_X_train.csv"), nrows=1)

zero_var_cols = [c for c in X_train_full.columns if X_train_full[c].nunique() <= 1]
risk_cols     = [c for c in X_train_full.columns if c not in zero_var_cols]
readmit_cols  = X_readmit_full.columns.tolist()

AGE_ORDER = {
    "[0-10)":0,"[10-20)":1,"[20-30)":2,"[30-40)":3,
    "[40-50)":4,"[50-60)":5,"[60-70)":6,"[70-80)":7,
    "[80-90)":8,"[90-100)":9,
}

MED_COLS = [
    "metformin","repaglinide","nateglinide","chlorpropamide","glimepiride",
    "acetohexamide","glipizide","glyburide","tolbutamide","pioglitazone",
    "rosiglitazone","acarbose","miglitol","troglitazone","tolazamide",
    "examide","citoglipton","insulin","glyburide-metformin",
    "glipizide-metformin","glimepiride-pioglitazone",
    "metformin-rosiglitazone","metformin-pioglitazone",
]

def icd9_group(code):
    if pd.isna(code): return "Unknown"
    code = str(code).strip()
    if code.startswith("E"): return "External_Injury"
    if code.startswith("V"): return "Supplementary"
    try: num = float(code)
    except: return "Other"
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

# Sample patient input
raw = {
    "race": "Caucasian", "gender": "Female", "age": "[50-60)",
    "admission_type_id": 1, "discharge_disposition_id": 1, "admission_source_id": 7,
    "time_in_hospital": 3, "num_lab_procedures": 40, "num_procedures": 1,
    "num_medications": 15, "number_outpatient": 0, "number_emergency": 0,
    "number_inpatient": 0, "diag_1": "250.01", "diag_2": "401", "diag_3": "272",
    "number_diagnoses": 9, "medical_specialty": "InternalMedicine",
    "change": "No", "diabetesMed": "Yes",
}
for m in MED_COLS:
    raw[m] = "No"
raw["metformin"] = "Steady"
raw["insulin"]   = "Steady"

df = pd.DataFrame([raw])
df["age"]         = df["age"].map(AGE_ORDER)
df["change"]      = (df["change"]      == "Ch").astype(int)
df["diabetesMed"] = (df["diabetesMed"] == "Yes").astype(int)
for col in ["diag_1", "diag_2", "diag_3"]:
    df[col] = df[col].apply(icd9_group)

X1_arr = risk_prep.transform(df)
X1_df  = pd.DataFrame(X1_arr, columns=X_train_full.columns)
X1_df  = X1_df[risk_cols]
p1     = risk_model.predict_proba(X1_df)[0, 1]
l1     = "HIGH RISK (readmission < 30 days)" if p1 >= 0.5 else "LOW RISK"

X2_arr = read_prep.transform(df)
X2_df  = pd.DataFrame(X2_arr, columns=readmit_cols)
p2     = read_model.predict_proba(X2_df)[0, 1]
l2     = "LIKELY READMISSION" if p2 >= 0.5 else "NO READMISSION EXPECTED"

print("=" * 60)
print("  SAMPLE PATIENT INPUT SUMMARY")
print("=" * 60)
print("  Race                  : Caucasian")
print("  Gender                : Female")
print("  Age                   : [50-60)")
print("  Admission Type        : 1 (Emergency)")
print("  Days in Hospital      : 3")
print("  Lab Procedures        : 40")
print("  Medications           : 15")
print("  Primary Diagnosis     : 250.01 -> Endocrine_Metabolic (Diabetes)")
print("  Secondary Diagnosis   : 401    -> Circulatory (Hypertension)")
print("  Tertiary Diagnosis    : 272    -> Endocrine_Metabolic (Hyperlipidemia)")
print("  Metformin             : Steady")
print("  Insulin               : Steady")
print("  Diabetes Medication   : Yes")
print("  Medication Change     : No")
print()
print("=" * 60)
print("  PREDICTION RESULTS")
print("=" * 60)
print()
print("  Model 1 - Patient Risk Prediction")
print(f"    Probability : {p1*100:.2f}%")
print(f"    Prediction  : {l1}")
print()
print("  Model 2 - Hospital Readmission Prediction")
print(f"    Probability : {p2*100:.2f}%")
print(f"    Prediction  : {l2}")
print()
print("  Clinical Interpretation:")
if p1 >= 0.5 and p2 >= 0.5:
    print("    HIGH ALERT: Patient is at high risk AND likely to be readmitted.")
    print("    Recommend immediate care plan review and follow-up scheduling.")
elif p1 >= 0.5:
    print("    Patient is high risk for early readmission (<30 days).")
    print("    Consider enhanced discharge planning.")
elif p2 >= 0.5:
    print("    Patient is likely to be readmitted (any timeframe).")
    print("    Consider outpatient follow-up and medication review.")
else:
    print("    Patient appears low risk for readmission.")
print("=" * 60)
