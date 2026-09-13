from pathlib import Path

import numpy as np
import pandas as pd


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_DATA_PATH = PROJECT_ROOT / "ml" / "data" / "raw" / "diabetic_data.csv"
PROCESSED_DIR = PROJECT_ROOT / "ml" / "data" / "processed"
PROCESSED_DATA_PATH = PROCESSED_DIR / "cleaned_diabetic_data.csv"


# ---------------------------------------------------------
# Dataset configuration
# ---------------------------------------------------------

TARGET_COLUMN = "readmitted"

# Columns that identify an encounter/patient rather than
# representing useful predictive characteristics.
IDENTIFIER_COLUMNS = [
    "encounter_id",
    "patient_nbr",
]

# Extremely sparse / non-informative fields for our baseline.
DROP_COLUMNS = [
    "weight",
    "payer_code",
    "medical_specialty",
    "examide",
    "citoglipton",
]


# Diabetes medication columns
MEDICATION_COLUMNS = [
    "metformin",
    "repaglinide",
    "nateglinide",
    "chlorpropamide",
    "glimepiride",
    "acetohexamide",
    "glipizide",
    "glyburide",
    "tolbutamide",
    "pioglitazone",
    "rosiglitazone",
    "acarbose",
    "miglitol",
    "troglitazone",
    "tolazamide",
    "insulin",
    "glyburide-metformin",
    "glipizide-metformin",
    "glimepiride-pioglitazone",
    "metformin-rosiglitazone",
    "metformin-pioglitazone",
]


# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------

def convert_age_to_numeric(age_series: pd.Series) -> pd.Series:
    """
    Convert age ranges such as [70-80) into their midpoint.
    """

    age_map = {
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

    return age_series.map(age_map)


def normalize_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Replace dataset-specific '?' values with NaN.
    """

    df = df.copy()

    object_columns = df.select_dtypes(include=["object"]).columns

    for column in object_columns:
        df[column] = df[column].replace("?", np.nan)

    return df


def extract_diagnosis_category(value):
    """
    Convert ICD-9 diagnosis codes into broad diagnostic groups.

    This reduces the very high cardinality of the original
    diagnosis-code fields while preserving clinical grouping.
    """

    if pd.isna(value):
        return "Unknown"

    value = str(value).strip()

    if value.startswith("V"):
        return "Supplementary"

    if value.startswith("E"):
        return "External_Cause"

    try:
        code = float(value)
    except ValueError:
        return "Other"

    if 390 <= code <= 459:
        return "Circulatory"

    if 460 <= code <= 519:
        return "Respiratory"

    if 520 <= code <= 579:
        return "Digestive"

    if 580 <= code <= 629:
        return "Genitourinary"

    if 630 <= code <= 679:
        return "Pregnancy"

    if 680 <= code <= 709:
        return "Skin"

    if 710 <= code <= 739:
        return "Musculoskeletal"

    if 740 <= code <= 759:
        return "Congenital"

    if 760 <= code <= 779:
        return "Perinatal"

    if 780 <= code <= 799:
        return "Symptoms"

    if 800 <= code <= 999:
        return "Injury_Poisoning"

    if 250 <= code < 251:
        return "Diabetes"

    return "Other"


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create clinically meaningful aggregate features.
    """

    df = df.copy()

    # Age midpoint
    df["age_numeric"] = convert_age_to_numeric(df["age"])

    # Broad ICD-9 diagnostic categories
    for column in ["diag_1", "diag_2", "diag_3"]:
        df[f"{column}_category"] = df[column].apply(
            extract_diagnosis_category
        )

    # Total prior healthcare utilization
    df["prior_utilization"] = (
        df["number_outpatient"]
        + df["number_emergency"]
        + df["number_inpatient"]
    )

    # Medication count
    available_medication_columns = [
        column
        for column in MEDICATION_COLUMNS
        if column in df.columns
    ]

    df["medication_count"] = (
        df[available_medication_columns]
        .isin(["Steady", "Up", "Down"])
        .sum(axis=1)
    )

    # Whether medication was changed during the encounter
    df["medication_changed"] = (
        df["change"]
        .map({"Ch": 1, "No": 0})
        .fillna(0)
        .astype(int)
    )

    # Whether diabetes medication was prescribed
    df["diabetes_medication"] = (
        df["diabetesMed"]
        .map({"Yes": 1, "No": 0})
        .fillna(0)
        .astype(int)
    )

    # Combined clinical activity
    df["clinical_activity"] = (
        df["num_lab_procedures"]
        + df["num_procedures"]
        + df["num_medications"]
    )

    return df


# ---------------------------------------------------------
# Main preprocessing pipeline
# ---------------------------------------------------------

def preprocess_dataset() -> pd.DataFrame:
    print("=" * 60)
    print("HealthForecast AI - Dataset Preprocessing")
    print("=" * 60)

    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at: {RAW_DATA_PATH}"
        )

    print(f"\nLoading dataset:")
    print(RAW_DATA_PATH)

    df = pd.read_csv(RAW_DATA_PATH)

    print(f"\nOriginal shape: {df.shape}")

    # Validate target
    if TARGET_COLUMN not in df.columns:
        raise ValueError(
            f"Target column '{TARGET_COLUMN}' not found."
        )

    # Replace '?' with NaN
    df = normalize_missing_values(df)

    # Feature engineering
    df = add_engineered_features(df)

    # Remove identifier columns
    df = df.drop(
        columns=[
            column
            for column in IDENTIFIER_COLUMNS
            if column in df.columns
        ]
    )

    # Remove extremely sparse / non-informative fields
    df = df.drop(
        columns=[
            column
            for column in DROP_COLUMNS
            if column in df.columns
        ]
    )

    # Remove original age/diagnosis columns after engineering
    # because we will use the engineered representations.
    df = df.drop(
        columns=[
            "age",
            "diag_1",
            "diag_2",
            "diag_3",
        ],
        errors="ignore",
    )

    # Remove rows with missing target, if any
    df = df.dropna(subset=[TARGET_COLUMN])

    # Save processed dataset
    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        PROCESSED_DATA_PATH,
        index=False
    )

    print(f"\nProcessed shape: {df.shape}")

    print("\nTarget distribution:")
    print(df[TARGET_COLUMN].value_counts())

    print("\nTarget percentages:")
    print(
        df[TARGET_COLUMN]
        .value_counts(normalize=True)
        .mul(100)
        .round(2)
    )

    print("\nRemaining missing values:")
    missing = (
        df.isna()
        .sum()
        .sort_values(ascending=False)
    )

    print(missing[missing > 0].head(15))

    print(f"\nSaved processed dataset:")
    print(PROCESSED_DATA_PATH)

    print("\nPreprocessing completed successfully.")
    print("=" * 60)

    return df


if __name__ == "__main__":
    preprocess_dataset()