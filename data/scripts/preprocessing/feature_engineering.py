"""
Stage 2: Feature Engineering and Data Preparation
Project: HealthForecast AI -- Patient Risk Prediction
Target: risk_target (1 = readmitted <30 days, 0 = otherwise)
"""

import os
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
PROCESSED = os.path.join(ROOT, "data", "processed")
SPLITS    = os.path.join(ROOT, "data", "splits")
MODELS    = os.path.join(ROOT, "models")
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

# -----------------------------------------------
# TASK 1 -- LOAD DATA
# -----------------------------------------------
df = pd.read_csv(os.path.join(PROCESSED, "diabetes_cleaned.csv"))

print("=" * 60)
print("TASK 1 -- DATASET OVERVIEW")
print("=" * 60)
print(f"Shape          : {df.shape}")
print(f"\nColumn names:\n{df.columns.tolist()}")
print(f"\nData types:\n{df.dtypes.to_string()}")
print(f"\nTarget distribution (readmitted):\n{df['readmitted'].value_counts()}")
print(f"\nFirst 5 rows:\n{df.head()}")

# -----------------------------------------------
# TASK 2 -- CREATE BINARY RISK TARGET
# <30 -> 1 (High Risk), NO / >30 -> 0 (Low Risk)
# -----------------------------------------------
df["risk_target"] = (df["readmitted"] == "<30").astype(int)

print("\n" + "=" * 60)
print("TASK 2 -- RISK TARGET")
print("=" * 60)
counts = df["risk_target"].value_counts()
total = len(df)
print(f"High-risk patients (1): {counts[1]:,}  ({counts[1]/total*100:.2f}%)")
print(f"Low-risk  patients (0): {counts[0]:,}  ({counts[0]/total*100:.2f}%)")

# -----------------------------------------------
# TASK 3 -- REMOVE IDENTIFIER COLUMNS
# encounter_id and patient_nbr must not be features
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 3 -- IDENTIFIER COLUMNS")
print("=" * 60)
id_cols = ["encounter_id", "patient_nbr"]
present_ids = [c for c in id_cols if c in df.columns]
if present_ids:
    df.drop(columns=present_ids, inplace=True)
    print(f"Removed: {present_ids}")
else:
    print("encounter_id and patient_nbr are NOT present -- already removed during cleaning.")

# -----------------------------------------------
# TASK 4 -- PREVENT DATA LEAKAGE
# X excludes 'readmitted' and 'risk_target' (confirmed when building X below)
# -----------------------------------------------

# -----------------------------------------------
# TASK 5 -- FEATURE GROUPING
# -----------------------------------------------
MED_COLS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide",
    "glimepiride", "acetohexamide", "glipizide", "glyburide",
    "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
    "miglitol", "troglitazone", "tolazamide", "examide",
    "citoglipton", "insulin", "glyburide-metformin",
    "glipizide-metformin", "glimepiride-pioglitazone",
    "metformin-rosiglitazone", "metformin-pioglitazone",
]
MED_COLS = [c for c in MED_COLS if c in df.columns]

print("\n" + "=" * 60)
print("TASK 5 -- FEATURE GROUPS")
print("=" * 60)
groups = {
    "Patient":                ["race", "gender", "age"],
    "Admission/Hospital":     ["admission_type_id", "discharge_disposition_id",
                               "admission_source_id", "time_in_hospital"],
    "Healthcare Utilization": ["number_outpatient", "number_emergency", "number_inpatient"],
    "Clinical":               ["num_lab_procedures", "num_procedures", "num_medications",
                               "number_diagnoses", "diag_1", "diag_2", "diag_3"],
    "Medication":             MED_COLS,
}
for grp, cols in groups.items():
    present = [c for c in cols if c in df.columns]
    print(f"  {grp}: {present}")

# -----------------------------------------------
# TASK 6 -- AGE ORDINAL ENCODING
# Age brackets have a natural order -> map to integers 0-9.
# Preserves ordinal relationship without implying exact numeric distance.
# -----------------------------------------------
AGE_ORDER = {
    "[0-10)": 0, "[10-20)": 1, "[20-30)": 2, "[30-40)": 3,
    "[40-50)": 4, "[50-60)": 5, "[60-70)": 6, "[70-80)": 7,
    "[80-90)": 8, "[90-100)": 9,
}
df["age"] = df["age"].map(AGE_ORDER)

print("\n" + "=" * 60)
print("TASK 6 -- AGE ORDINAL ENCODING")
print("=" * 60)
print("Mapping: [0-10)=0 ... [90-100)=9  (ordinal, preserves order)")
print(df["age"].value_counts().sort_index())

# -----------------------------------------------
# TASK 7 -- DIAGNOSIS CODE GROUPING (ICD-9)
# Raw ICD-9 codes have hundreds of unique values.
# Grouping into clinical chapters avoids arbitrary integer assignment
# and reduces dimensionality. Ranges follow standard ICD-9 chapters.
# -----------------------------------------------
def icd9_group(code):
    """Map an ICD-9 code string to a clinical category."""
    if pd.isna(code) or str(code).strip().upper() in ("", "UNKNOWN", "?"):
        return "Unknown"
    code = str(code).strip()
    if code.startswith("E"):
        return "External_Injury"
    if code.startswith("V"):
        return "Supplementary"
    try:
        num = float(code)
    except ValueError:
        return "Other"
    if 1   <= num < 140:  return "Infectious"
    if 140 <= num < 240:  return "Neoplasms"
    if 240 <= num < 280:  return "Endocrine_Metabolic"   # includes diabetes 250.xx
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

for col in ["diag_1", "diag_2", "diag_3"]:
    df[col] = df[col].apply(icd9_group)

print("\n" + "=" * 60)
print("TASK 7 -- DIAGNOSIS CODE GROUPING")
print("=" * 60)
print("ICD-9 codes grouped into clinical chapters (standard ranges).")
print(f"diag_1 categories: {sorted(df['diag_1'].unique())}")

# -----------------------------------------------
# TASK 8 -- MEDICATION ENCODING
# Values: No / Steady / Up / Down
# No clinically justified ordinal relationship -> One-Hot Encoding via pipeline.
# change / diabetesMed are binary -> label-encoded directly.
# -----------------------------------------------
df["change"]      = (df["change"]      == "Ch").astype(int)   # Ch=1, No=0
df["diabetesMed"] = (df["diabetesMed"] == "Yes").astype(int)  # Yes=1, No=0

print("\n" + "=" * 60)
print("TASK 8 -- MEDICATION ENCODING")
print("=" * 60)
print("Medication columns (No/Steady/Up/Down) -> One-Hot Encoding (applied in pipeline).")
print("'change': Ch=1, No=0  |  'diabetesMed': Yes=1, No=0")

# -----------------------------------------------
# TASK 9 -- CHECK FEATURE VARIANCE
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 9 -- FEATURE VARIANCE CHECK")
print("=" * 60)
feature_cols = [c for c in df.columns if c not in ("readmitted", "risk_target")]
nunique = df[feature_cols].nunique()
constant      = nunique[nunique == 1].index.tolist()
near_constant = nunique[nunique == 2].index.tolist()
print(f"Constant columns (1 unique value)      : {constant}")
print(f"Near-constant columns (2 unique values): {near_constant}")
print("\nUnique value counts per feature:")
print(nunique.sort_values().to_string())

# -----------------------------------------------
# TASK 10 -- CLASS IMBALANCE CHECK
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 10 -- CLASS IMBALANCE")
print("=" * 60)
vc = df["risk_target"].value_counts()
ratio = vc[0] / vc[1]
print(f"Class 0 (Low Risk) : {vc[0]:,}  ({vc[0]/total*100:.2f}%)")
print(f"Class 1 (High Risk): {vc[1]:,}  ({vc[1]/total*100:.2f}%)")
print(f"Imbalance ratio    : {ratio:.2f}:1  (Low:High)")
print(">> Class imbalance EXISTS. SMOTE / class weighting will be handled in Stage 3.")

# -----------------------------------------------
# TASK 11 -- TRAIN / TEST SPLIT
# X excludes readmitted (leakage prevention) and risk_target (label)
# -----------------------------------------------
X = df.drop(columns=["readmitted", "risk_target"])
y = df["risk_target"]

assert "readmitted"    not in X.columns, "LEAKAGE: readmitted found in X"
assert "encounter_id"  not in X.columns, "encounter_id found in X"
assert "patient_nbr"   not in X.columns, "patient_nbr found in X"

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("\n" + "=" * 60)
print("TASK 11 -- TRAIN / TEST SPLIT")
print("=" * 60)
print(f"X_train: {X_train.shape}  |  y_train: {y_train.shape}")
print(f"X_test : {X_test.shape}   |  y_test : {y_test.shape}")
print(f"Train class dist:\n{y_train.value_counts(normalize=True).round(4)}")
print(f"Test  class dist:\n{y_test.value_counts(normalize=True).round(4)}")

# -----------------------------------------------
# TASK 12 -- PREPROCESSING PIPELINE
# Fitted ONLY on X_train to prevent data leakage.
#
# Numerical cols  -> median impute + StandardScaler
# Nominal cols    -> mode impute + OneHotEncoder
#
# admission_type_id / discharge_disposition_id / admission_source_id
# are category IDs (not ordered quantities) -> treated as nominal -> OHE.
# -----------------------------------------------
NOMINAL_COLS = (
    ["race", "gender", "medical_specialty",
     "admission_type_id", "discharge_disposition_id", "admission_source_id",
     "diag_1", "diag_2", "diag_3"]
    + MED_COLS
)
NOMINAL_COLS = [c for c in NOMINAL_COLS if c in X_train.columns]

# Numerical: everything else (age=int 0-9, change/diabetesMed=0/1)
NUMERICAL_COLS = [c for c in X_train.columns if c not in NOMINAL_COLS]

print("\n" + "=" * 60)
print("TASK 12 -- PREPROCESSING PIPELINE")
print("=" * 60)
print(f"Numerical columns ({len(NUMERICAL_COLS)}): {NUMERICAL_COLS}")
print(f"Nominal  columns  ({len(NOMINAL_COLS)}): {NOMINAL_COLS}")

num_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler",  StandardScaler()),
])

cat_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("ohe",     OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
])

preprocessor = ColumnTransformer([
    ("num", num_pipeline, NUMERICAL_COLS),
    ("cat", cat_pipeline, NOMINAL_COLS),
], remainder="drop")

# Fit ONLY on training data
preprocessor.fit(X_train)

X_train_processed = preprocessor.transform(X_train)
X_test_processed  = preprocessor.transform(X_test)

# Recover feature names after OHE expansion
ohe_feature_names = (
    preprocessor.named_transformers_["cat"]
    .named_steps["ohe"]
    .get_feature_names_out(NOMINAL_COLS)
    .tolist()
)
all_feature_names = NUMERICAL_COLS + ohe_feature_names

X_train_df = pd.DataFrame(X_train_processed, columns=all_feature_names)
X_test_df  = pd.DataFrame(X_test_processed,  columns=all_feature_names)

print(f"Features after encoding: {X_train_df.shape[1]}")

# -----------------------------------------------
# TASK 13 -- SAVE PREPARED DATA
# -----------------------------------------------
X_train_df.to_csv(os.path.join(SPLITS, "X_train.csv"), index=False)
X_test_df.to_csv(os.path.join(SPLITS, "X_test.csv"),   index=False)
y_train.reset_index(drop=True).to_csv(os.path.join(SPLITS, "y_train.csv"), index=False)
y_test.reset_index(drop=True).to_csv(os.path.join(SPLITS, "y_test.csv"),   index=False)

with open(os.path.join(MODELS, "preprocessor.pkl"), "wb") as f:
    pickle.dump(preprocessor, f)

print("\nSaved: splits/X_train.csv, X_test.csv, y_train.csv, y_test.csv, models/preprocessor.pkl")

# -----------------------------------------------
# TASK 14 -- FINAL REPORT
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 14 -- FINAL REPORT")
print("=" * 60)
print(f"  1.  Original cleaned dataset shape       : {df.shape}")
print(f"  2.  Features before preprocessing        : {X.shape[1]}")
print(f"  3.  Features after encoding              : {X_train_df.shape[1]}")
print(f"  4.  Risk target -- High(1): {vc[1]:,} | Low(0): {vc[0]:,}")
print(f"  5.  Training set size                    : {X_train_df.shape[0]:,} rows")
print(f"  6.  Testing  set size                    : {X_test_df.shape[0]:,} rows")
print(f"  7.  Categorical features (pre-OHE)       : {len(NOMINAL_COLS)}")
print(f"  8.  Numerical features                   : {len(NUMERICAL_COLS)}")
removed_note = f", {present_ids}" if present_ids else " (encounter_id/patient_nbr absent)"
print(f"  9.  Columns removed from X               : readmitted, risk_target{removed_note}")
print(f" 10.  Feature transformations               :")
print(f"        age          -> ordinal int 0-9")
print(f"        change       -> binary 0/1")
print(f"        diabetesMed  -> binary 0/1")
print(f"        numerical    -> median impute + StandardScaler")
print(f"        nominal/meds -> mode impute + OneHotEncoder")
print(f" 11.  Diagnosis preprocessing               : ICD-9 grouped into 18 clinical chapters")
print(f" 12.  Medication preprocessing              : No/Steady/Up/Down -> One-Hot Encoded")
print(f" 13.  'readmitted' in X                     : {'readmitted' in X.columns}")
print(f" 14.  'encounter_id'/'patient_nbr' in X     : {'encounter_id' in X.columns} / {'patient_nbr' in X.columns}")
print(f" 15.  Preprocessor fitted on training only  : True")
print("=" * 60)
print("Stage 2 complete. Data is ready for Stage 3 model training.")
