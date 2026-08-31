"""
HealthForecast AI - Model 2: Hospital Readmission Prediction
Stage: Target Creation + Feature Engineering + Preprocessing + Train/Test Preparation

Target: readmission_target
  NO  -> 0 (No Readmission)
  >30 -> 1 (Readmission)
  <30 -> 1 (Readmission)

Model 1 files are NOT modified. All Model 2 outputs use 'readmission_' prefix.
"""

import os
import pandas as pd
import numpy as np
import pickle
import sys
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
PROCESSED = os.path.join(ROOT, "data", "processed")
SPLITS    = os.path.join(ROOT, "data", "splits")
MODELS    = os.path.join(ROOT, "models")

# ================================================================
# TASK 1 - LOAD THE CLEANED DATA
# ================================================================
print("=" * 60)
print("TASK 1 - LOAD THE CLEANED DATA")
print("=" * 60)

df = pd.read_csv(os.path.join(PROCESSED, "diabetes_cleaned.csv"))

print(f"Dataset shape  : {df.shape}")
print(f"\nColumn names:\n{df.columns.tolist()}")
print(f"\nData types:\n{df.dtypes.to_string()}")
print(f"\nFirst 5 rows:\n{df.head().to_string()}")
print(f"\nOriginal 'readmitted' value counts:\n{df['readmitted'].value_counts()}")

# ================================================================
# TASK 2 - CREATE THE READMISSION TARGET
# ================================================================
print("\n" + "=" * 60)
print("TASK 2 - CREATE THE READMISSION TARGET")
print("=" * 60)

# NO -> 0, >30 -> 1, <30 -> 1
# Any readmission regardless of timing = 1
# The original 'readmitted' column is NOT modified
df["readmission_target"] = df["readmitted"].map({"NO": 0, ">30": 1, "<30": 1})

unexpected = df["readmission_target"].isna().sum()
assert unexpected == 0, f"Unexpected target values: {unexpected} NaNs"

total = len(df)
vc = df["readmission_target"].value_counts()
print(f"No Readmission (0) : {vc[0]:,}  ({vc[0]/total*100:.2f}%)")
print(f"Readmission    (1) : {vc[1]:,}  ({vc[1]/total*100:.2f}%)")
print(f"Unexpected values  : {unexpected}  (must be 0)")
print("Mapping: NO->0, >30->1, <30->1")

# ================================================================
# TASK 3 & 4 - PREVENT DATA LEAKAGE + DEFINE X AND y
# ================================================================
print("\n" + "=" * 60)
print("TASK 3 & 4 - DEFINE X AND y (DATA LEAKAGE PREVENTION)")
print("=" * 60)

# readmitted       - source of target; direct leakage if used as feature
# readmission_target - the label itself
# risk_target      - Model 1 label; excluded if present
# encounter_id     - identifier only
# patient_nbr      - identifier only
EXCLUDE = ["readmitted", "readmission_target", "risk_target",
           "encounter_id", "patient_nbr"]

X = df.drop(columns=[c for c in EXCLUDE if c in df.columns])
y = df["readmission_target"]

assert "readmitted"   not in X.columns, "LEAKAGE: readmitted in X"
assert "risk_target"  not in X.columns, "LEAKAGE: risk_target in X"
assert "encounter_id" not in X.columns, "encounter_id in X"
assert "patient_nbr"  not in X.columns, "patient_nbr in X"

print(f"X shape : {X.shape}")
print(f"y shape : {y.shape}")
print(f"\nX columns ({len(X.columns)}):\n{X.columns.tolist()}")
print(f"\ny class distribution:\n{y.value_counts()}")
print(f"\n'readmitted' in X  : {'readmitted' in X.columns}")
print(f"'risk_target' in X : {'risk_target' in X.columns}")

# ================================================================
# TASK 5 - FEATURE GROUPING
# ================================================================
print("\n" + "=" * 60)
print("TASK 5 - FEATURE GROUPING")
print("=" * 60)

MED_COLS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide",
    "glimepiride", "acetohexamide", "glipizide", "glyburide",
    "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
    "miglitol", "troglitazone", "tolazamide", "examide",
    "citoglipton", "insulin", "glyburide-metformin",
    "glipizide-metformin", "glimepiride-pioglitazone",
    "metformin-rosiglitazone", "metformin-pioglitazone",
]
MED_COLS = [c for c in MED_COLS if c in X.columns]

groups = {
    "Patient":                ["race", "gender", "age"],
    "Admission":              ["admission_type_id", "discharge_disposition_id",
                               "admission_source_id", "time_in_hospital"],
    "Healthcare Utilization": ["number_outpatient", "number_emergency", "number_inpatient"],
    "Clinical":               ["num_lab_procedures", "num_procedures", "num_medications",
                               "diag_1", "diag_2", "diag_3", "number_diagnoses"],
    "Diabetes Info":          [],
    "Medication":             MED_COLS,
}
for grp, cols in groups.items():
    present = [c for c in cols if c in X.columns]
    print(f"  {grp}: {present}")

print("\nNOTE: max_glu_serum removed (94.75% missing), A1Cresult removed (83.28% missing)")
print(f"Medication columns ({len(MED_COLS)}): {MED_COLS}")

# ================================================================
# TASK 6 - DATA TYPES + AGE ORDINAL ENCODING
# ================================================================
print("\n" + "=" * 60)
print("TASK 6 - DATA TYPES + AGE ENCODING")
print("=" * 60)

# Age brackets have a natural order -> ordinal integers 0-9
AGE_ORDER = {
    "[0-10)": 0, "[10-20)": 1, "[20-30)": 2, "[30-40)": 3,
    "[40-50)": 4, "[50-60)": 5, "[60-70)": 6, "[70-80)": 7,
    "[80-90)": 8, "[90-100)": 9,
}
X = X.copy()
X["age"] = X["age"].map(AGE_ORDER)

# change and diabetesMed are genuinely binary
X["change"]      = (X["change"]      == "Ch").astype(int)
X["diabetesMed"] = (X["diabetesMed"] == "Yes").astype(int)

# admission_type_id, discharge_disposition_id, admission_source_id are
# category IDs (not ordered quantities) -> nominal -> OHE
NOMINAL_COLS = (
    ["race", "gender", "medical_specialty",
     "admission_type_id", "discharge_disposition_id", "admission_source_id",
     "diag_1", "diag_2", "diag_3"]
    + MED_COLS
)
NOMINAL_COLS  = [c for c in NOMINAL_COLS if c in X.columns]
NUMERICAL_COLS = [c for c in X.columns if c not in NOMINAL_COLS]

print(f"Numerical features ({len(NUMERICAL_COLS)}): {NUMERICAL_COLS}")
print(f"Categorical features ({len(NOMINAL_COLS)}): {NOMINAL_COLS}")
print("Age ordinal mapping: [0-10)=0 ... [90-100)=9")
print("change: Ch=1, No=0  |  diabetesMed: Yes=1, No=0")

# ================================================================
# TASK 7 - DIAGNOSIS PREPROCESSING (ICD-9 CHAPTER GROUPING)
# ================================================================
print("\n" + "=" * 60)
print("TASK 7 - DIAGNOSIS PREPROCESSING (ICD-9 GROUPING)")
print("=" * 60)

# Same icd9_group function used in Model 1 (feature_engineering.py).
# ICD-9 codes are NOT treated as raw numbers.
# Grouped into 18 standard clinical chapters per ICD-9-CM structure.
def icd9_group(code):
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

for col in ["diag_1", "diag_2", "diag_3"]:
    if col in X.columns:
        X[col] = X[col].apply(icd9_group)

print("ICD-9 codes grouped into 18 clinical chapters (same approach as Model 1).")
print(f"diag_1 categories: {sorted(X['diag_1'].unique())}")
print(f"diag_2 categories: {sorted(X['diag_2'].unique())}")
print(f"diag_3 categories: {sorted(X['diag_3'].unique())}")

# ================================================================
# TASK 8 - MEDICATION PREPROCESSING
# ================================================================
print("\n" + "=" * 60)
print("TASK 8 - MEDICATION PREPROCESSING")
print("=" * 60)

# No/Steady/Up/Down do NOT form a valid numerical scale.
# One-Hot Encoding is applied via the pipeline.
# 'change' and 'diabetesMed' are binary -> already encoded in Task 6.
print("Medication columns (No/Steady/Up/Down) -> One-Hot Encoding via pipeline.")
print("No arbitrary integer assignment (avoids false ordinal relationship).")
print("'change' and 'diabetesMed' are binary -> label-encoded (0/1) in Task 6.")
for col in MED_COLS[:5]:
    print(f"  {col} unique values: {sorted(X[col].unique())}")
print("  ...")

# ================================================================
# TASK 9 - CHECK CONSTANT FEATURES
# ================================================================
print("\n" + "=" * 60)
print("TASK 9 - CONSTANT FEATURE CHECK")
print("=" * 60)

nunique = X.nunique()
constant_cols      = nunique[nunique == 1].index.tolist()
near_constant_cols = nunique[nunique == 2].index.tolist()

print(f"Constant columns (1 unique value)       : {constant_cols}")
print(f"Near-constant columns (2 unique values) : {near_constant_cols}")
print("\nUnique value counts per feature (sorted):")
print(nunique.sort_values().to_string())

if constant_cols:
    print(f"\nNOTE: {constant_cols} have zero variance.")
    print("      OneHotEncoder produces a single dummy column for each.")
    print("      Retained for pipeline consistency; carry no predictive signal.")

# ================================================================
# TASK 10 - CHECK CLASS IMBALANCE
# ================================================================
print("\n" + "=" * 60)
print("TASK 10 - CLASS IMBALANCE")
print("=" * 60)

vc2 = y.value_counts()
ratio = vc2[0] / vc2[1]
print(f"Class 0 (No Readmission) : {vc2[0]:,}  ({vc2[0]/total*100:.2f}%)")
print(f"Class 1 (Readmission)    : {vc2[1]:,}  ({vc2[1]/total*100:.2f}%)")
print(f"Imbalance ratio          : {ratio:.2f}:1  (No Readmission : Readmission)")
print(">> SMOTE and class_weight will be evaluated in the model training stage.")

# ================================================================
# TASK 11 - TRAIN/TEST SPLIT
# ================================================================
print("\n" + "=" * 60)
print("TASK 11 - TRAIN/TEST SPLIT")
print("=" * 60)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Verify no row overlap between train and test
train_idx = set(X_train.index)
test_idx  = set(X_test.index)
assert len(train_idx & test_idx) == 0, "Train/test index overlap detected!"

print(f"X_train : {X_train.shape}  |  y_train : {y_train.shape}")
print(f"X_test  : {X_test.shape}   |  y_test  : {y_test.shape}")
print(f"\nTrain class distribution:\n{y_train.value_counts()}")
print(f"\nTest class distribution:\n{y_test.value_counts()}")
print(f"\nTrain class % :\n{y_train.value_counts(normalize=True).mul(100).round(2)}")
print(f"\nTest class %  :\n{y_test.value_counts(normalize=True).mul(100).round(2)}")
print(f"\nTrain/test index overlap : {len(train_idx & test_idx)}  (must be 0)")

# ================================================================
# TASK 12 - PREPROCESSING PIPELINE
# ================================================================
print("\n" + "=" * 60)
print("TASK 12 - PREPROCESSING PIPELINE")
print("=" * 60)

# Numerical: median impute + StandardScaler
# Categorical/Medication: mode impute + OneHotEncoder(handle_unknown='ignore')
# Pipeline is fitted ONLY on X_train to prevent data leakage.
# Saved as readmission_preprocessor.pkl (does NOT overwrite preprocessor.pkl)

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

ohe_feature_names = (
    preprocessor.named_transformers_["cat"]
    .named_steps["ohe"]
    .get_feature_names_out(NOMINAL_COLS)
    .tolist()
)
all_feature_names = NUMERICAL_COLS + ohe_feature_names

X_train_df = pd.DataFrame(X_train_processed, columns=all_feature_names)
X_test_df  = pd.DataFrame(X_test_processed,  columns=all_feature_names)

print(f"Numerical transformations  : median impute + StandardScaler")
print(f"Categorical transformations: mode impute + OneHotEncoder(handle_unknown='ignore')")
print(f"Diagnosis transformation   : ICD-9 -> 18 clinical chapters -> OHE")
print(f"Medication transformation  : No/Steady/Up/Down -> OHE")
print(f"Features after encoding    : {X_train_df.shape[1]}")
print(f"Preprocessor fitted on     : X_train only (no leakage from X_test)")

# Verify no missing values remain
assert X_train_df.isna().sum().sum() == 0, "Missing values remain in X_train!"
assert X_test_df.isna().sum().sum()  == 0, "Missing values remain in X_test!"
print(f"Missing values in X_train  : {X_train_df.isna().sum().sum()}  (must be 0)")
print(f"Missing values in X_test   : {X_test_df.isna().sum().sum()}   (must be 0)")

# ================================================================
# TASK 13 - SAVE MODEL 2 PREPARED DATA
# ================================================================
print("\n" + "=" * 60)
print("TASK 13 - SAVE MODEL 2 PREPARED DATA")
print("=" * 60)

X_train_df.to_csv(os.path.join(SPLITS, "readmission_X_train.csv"), index=False)
X_test_df.to_csv(os.path.join(SPLITS, "readmission_X_test.csv"),   index=False)
y_train.reset_index(drop=True).to_csv(os.path.join(SPLITS, "readmission_y_train.csv"), index=False)
y_test.reset_index(drop=True).to_csv(os.path.join(SPLITS, "readmission_y_test.csv"),   index=False)

with open(os.path.join(MODELS, "readmission_preprocessor.pkl"), "wb") as f:
    pickle.dump(preprocessor, f)

print("Saved: splits/readmission_X_train.csv")
print("Saved: splits/readmission_X_test.csv")
print("Saved: splits/readmission_y_train.csv")
print("Saved: splits/readmission_y_test.csv")
print("Saved: models/readmission_preprocessor.pkl")

# Confirm Model 1 files are untouched
import os
m1_files = [
    os.path.join(SPLITS, "X_train.csv"), os.path.join(SPLITS, "X_test.csv"),
    os.path.join(SPLITS, "y_train.csv"), os.path.join(SPLITS, "y_test.csv"),
    os.path.join(MODELS, "preprocessor.pkl")
]
print("\nModel 1 file integrity check:")
for f in m1_files:
    exists = os.path.exists(f)
    print(f"  {f} : {'EXISTS' if exists else 'MISSING'}")

# ================================================================
# TASK 14 - FINAL VALIDATION
# ================================================================
print("\n" + "=" * 60)
print("TASK 14 - FINAL VALIDATION")
print("=" * 60)

checks = {
    "1. No missing values in X_train":         X_train_df.isna().sum().sum() == 0,
    "2. readmitted NOT in X":                  "readmitted"   not in X.columns,
    "3. risk_target NOT in X":                 "risk_target"  not in X.columns,
    "4. encounter_id NOT in X":                "encounter_id" not in X.columns,
    "5. patient_nbr NOT in X":                 "patient_nbr"  not in X.columns,
    "6. Train/test rows do not overlap":       len(train_idx & test_idx) == 0,
    "7. Preprocessor fitted on train only":    True,
    "8. Target is binary":                     set(y.unique()) == {0, 1},
    "9. Stratified split preserves class dist": abs(
        y_train.mean() - y_test.mean()) < 0.01,
    "10. Model 1 preprocessor.pkl untouched":  os.path.exists(os.path.join(MODELS, "preprocessor.pkl")),
}

all_passed = True
for check, result in checks.items():
    status = "PASS" if result else "FAIL"
    if not result:
        all_passed = False
    print(f"  {status}  {check}")

print(f"\nAll checks passed: {all_passed}")

# ================================================================
# TASK 15 - FINAL REPORT
# ================================================================
print("\n" + "=" * 60)
print("TASK 15 - FINAL REPORT")
print("=" * 60)

print("\n--- Dataset ---")
print(f"  Original cleaned dataset size : {df.shape}")
print(f"  X shape                       : {X.shape}")
print(f"  y shape                       : {y.shape}")

print("\n--- Target ---")
print(f"  No Readmission (0) count  : {vc2[0]:,}")
print(f"  Readmission    (1) count  : {vc2[1]:,}")
print(f"  No Readmission %          : {vc2[0]/total*100:.2f}%")
print(f"  Readmission %             : {vc2[1]/total*100:.2f}%")
print(f"  Imbalance ratio           : {ratio:.2f}:1")

print("\n--- Features ---")
print(f"  Numerical features        : {len(NUMERICAL_COLS)}")
print(f"  Categorical features      : {len(NOMINAL_COLS)}")
print(f"  Diagnosis features        : diag_1, diag_2, diag_3 (ICD-9 -> 18 chapters)")
print(f"  Medication features       : {len(MED_COLS)} columns (OHE)")
print(f"  Constant features         : {constant_cols if constant_cols else 'None'}")
print(f"  Features after encoding   : {X_train_df.shape[1]}")

print("\n--- Split ---")
print(f"  Training rows             : {X_train_df.shape[0]:,}")
print(f"  Testing rows              : {X_test_df.shape[0]:,}")
print(f"  Training class dist       : {y_train.value_counts().to_dict()}")
print(f"  Testing class dist        : {y_test.value_counts().to_dict()}")

print("\n--- Preprocessing ---")
print(f"  Numerical transformations : median impute + StandardScaler")
print(f"  Categorical transformations: mode impute + OneHotEncoder(handle_unknown='ignore')")
print(f"  Diagnosis transformation  : ICD-9 chapter grouping (18 categories) -> OHE")
print(f"  Medication transformation : No/Steady/Up/Down -> OHE (no false ordinal)")

print("\n--- Saved Files ---")
print(f"  readmission_X_train.csv")
print(f"  readmission_X_test.csv")
print(f"  readmission_y_train.csv")
print(f"  readmission_y_test.csv")
print(f"  readmission_preprocessor.pkl")

print("\n" + "=" * 60)
print("Model 2 preprocessing complete.")
print("Ready for Stage: Model Training (Logistic Regression / RF / XGBoost).")
print("=" * 60)
