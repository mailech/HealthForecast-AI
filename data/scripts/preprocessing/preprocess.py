"""
HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System
Stage 1 - Data Cleaning & Preprocessing (Diabetes 130-US Hospitals Dataset)
"""

import pandas as pd
import numpy as np
import sys

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding="utf-8")

# ─────────────────────────────────────────────
# 1. Load dataset — treat "?" as NaN immediately
# ─────────────────────────────────────────────
import os
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
RAW_PATH = os.path.join(ROOT, "data", "raw", "diabetic_data.csv")
df_raw = pd.read_csv(RAW_PATH, na_values="?", low_memory=False)

print("=" * 60)
print("STEP 2 — INITIAL DATASET OVERVIEW")
print("=" * 60)
print(f"Shape          : {df_raw.shape[0]} rows x {df_raw.shape[1]} columns")
print(f"\nColumn names:\n{df_raw.columns.tolist()}")
print(f"\nData types:\n{df_raw.dtypes}")
print(f"\nFirst 5 rows:\n{df_raw.head()}")

missing_before = df_raw.isnull().sum()
missing_pct    = (missing_before / len(df_raw) * 100).round(2)
print("\nMissing value count & % per column:")
print(pd.concat([missing_before, missing_pct], axis=1,
                keys=["missing_count", "missing_%"]).to_string())

print("\nUnique value count per column:")
print(df_raw.nunique().to_string())

# ─────────────────────────────────────────────
# 2. Work on a copy — never overwrite raw data
# ─────────────────────────────────────────────
df = df_raw.copy()

# ─────────────────────────────────────────────
# 3. Decide which columns to drop
# ─────────────────────────────────────────────
COLS_TO_DROP = []
drop_reasons = {}

# Identifier columns — not ML features
for col in ["encounter_id", "patient_nbr"]:
    COLS_TO_DROP.append(col)
    drop_reasons[col] = "Identifier column — not an ML feature"

# weight: 96.86% missing — imputation would invent clinical values
weight_pct = missing_pct.get("weight", 0)
print(f"\n'weight' missing: {weight_pct}%")
if weight_pct > 40:
    COLS_TO_DROP.append("weight")
    drop_reasons["weight"] = f"{weight_pct}% missing — too sparse to impute without inventing clinical values"

# payer_code: ~39.56% missing — not a clinical predictor
if "payer_code" in df.columns and missing_pct.get("payer_code", 0) > 35:
    COLS_TO_DROP.append("payer_code")
    drop_reasons["payer_code"] = f"{missing_pct['payer_code']}% missing — not a clinical predictor"

# max_glu_serum: 94.75% missing — too sparse; keep as "None" category is misleading at this rate
if "max_glu_serum" in df.columns and missing_pct.get("max_glu_serum", 0) > 90:
    COLS_TO_DROP.append("max_glu_serum")
    drop_reasons["max_glu_serum"] = f"{missing_pct['max_glu_serum']}% missing — too sparse to be a reliable feature"

# A1Cresult: 83.28% missing — same reasoning; >80% missing makes it unreliable
if "A1Cresult" in df.columns and missing_pct.get("A1Cresult", 0) > 80:
    COLS_TO_DROP.append("A1Cresult")
    drop_reasons["A1Cresult"] = f"{missing_pct['A1Cresult']}% missing — too sparse to be a reliable feature"

df.drop(columns=COLS_TO_DROP, inplace=True, errors="ignore")
print(f"\nDropped columns: {COLS_TO_DROP}")

# ─────────────────────────────────────────────
# 4. Handle remaining missing values
# ─────────────────────────────────────────────

# Categorical: fill with "Unknown" — preserves the column as a feature without
# inventing a clinical value; downstream encoder can treat "Unknown" as its own category
cat_fill_unknown = ["race", "medical_specialty", "diag_1", "diag_2", "diag_3"]
for col in cat_fill_unknown:
    if col in df.columns:
        df[col] = df[col].fillna("Unknown")

# gender: tiny missingness (<0.01%) — mode fill is safe for a near-complete column
if "gender" in df.columns:
    df["gender"] = df["gender"].fillna(df["gender"].mode()[0])

# Numerical: median imputation — robust to skewed distributions and outliers
num_cols_with_missing = [
    c for c in df.select_dtypes(include=[np.number]).columns
    if df[c].isnull().any()
]
for col in num_cols_with_missing:
    median_val = df[col].median()
    df[col].fillna(median_val, inplace=True)
    print(f"  Median-imputed '{col}' ({int(missing_before[col])} NaNs) with {median_val}")

# ─────────────────────────────────────────────
# 5. Remove duplicate rows
# ─────────────────────────────────────────────
n_dupes = df.duplicated().sum()
df.drop_duplicates(inplace=True)
print(f"\nDuplicate rows removed: {n_dupes}")

# ─────────────────────────────────────────────
# 6. Validate categorical columns
# ─────────────────────────────────────────────
print("\n--- Categorical value checks ---")

if "gender" in df.columns:
    print(f"gender unique: {df['gender'].unique()}")
    # 'Unknown/Invalid' is clinically ambiguous — remove these rows
    invalid_mask = df["gender"] == "Unknown/Invalid"
    n_invalid = invalid_mask.sum()
    df = df[~invalid_mask].copy()
    print(f"  Removed {n_invalid} rows with gender='Unknown/Invalid'")

if "age" in df.columns:
    print(f"age unique: {sorted(df['age'].unique())}")

if "readmitted" in df.columns:
    print(f"readmitted unique: {df['readmitted'].unique()}")

# ─────────────────────────────────────────────
# 7. Validate numerical columns for impossible values
# ─────────────────────────────────────────────
print("\n--- Numerical sanity checks ---")
non_negative_cols = [
    "time_in_hospital", "num_lab_procedures", "num_procedures",
    "num_medications", "number_diagnoses",
    "number_outpatient", "number_emergency", "number_inpatient"
]
for col in non_negative_cols:
    if col in df.columns:
        n_neg = (df[col] < 0).sum()
        if n_neg > 0:
            print(f"  WARNING '{col}': {n_neg} negative values — re-imputing with median")
            df.loc[df[col] < 0, col] = np.nan
            df[col].fillna(df[col].median(), inplace=True)
        else:
            print(f"  OK '{col}': no negative values")

if "time_in_hospital" in df.columns:
    out_of_range = ((df["time_in_hospital"] < 1) | (df["time_in_hospital"] > 14)).sum()
    print(f"  time_in_hospital out of [1,14]: {out_of_range} rows")

# ─────────────────────────────────────────────
# 8. Save cleaned dataset
# ─────────────────────────────────────────────
OUTPUT_PATH = os.path.join(ROOT, "data", "processed", "diabetes_cleaned.csv")
df.to_csv(OUTPUT_PATH, index=False)
print(f"\nCleaned dataset saved -> {OUTPUT_PATH}")

# ─────────────────────────────────────────────
# 9. Final cleaning report
# ─────────────────────────────────────────────
missing_after = df.isnull().sum().sum()

print("\n" + "=" * 60)
print("FINAL CLEANING REPORT")
print("=" * 60)
print(f"Original rows              : {df_raw.shape[0]}")
print(f"Final rows                 : {df.shape[0]}")
print(f"Original columns           : {df_raw.shape[1]}")
print(f"Final columns              : {df.shape[1]}")
print(f"\nColumns removed ({len(COLS_TO_DROP)}):")
for col in COLS_TO_DROP:
    print(f"  - {col}: {drop_reasons[col]}")
print(f"\nMissing values BEFORE      : {missing_before.sum()}")
print(f"Missing values AFTER       : {missing_after}")
print(f"Duplicate rows removed     : {n_dupes}")
print(f"\nFinal data types:\n{df.dtypes.to_string()}")
print("=" * 60)
print("NOTE: 'readmitted' is preserved as-is for use as the target label.")
print("      No feature scaling, splitting, or model training in this stage.")
