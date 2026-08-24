import pandas as pd
from pathlib import Path


# Project paths
BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "diabetes_130_us_hospitals.csv"
PROCESSED_PATH = BASE_DIR / "dataset" / "processed_diabetes.csv"


def load_dataset():
    """Load the original Diabetes 130-US Hospitals dataset."""
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    return pd.read_csv(DATASET_PATH)


def preprocess_data(df):
    """Clean and prepare the dataset for ML training."""

    data = df.copy()

    # Replace missing-value markers used in the dataset
    data = data.replace("?", pd.NA)

    # Remove columns that contain too much missing information
    columns_to_drop = [
        "weight",
        "payer_code",
        "medical_specialty"
    ]

    data = data.drop(
        columns=[col for col in columns_to_drop if col in data.columns],
        errors="ignore"
    )

    # Remove identifiers that should not be used as prediction features
    identifier_columns = [
        "encounter_id",
        "patient_nbr"
    ]

    data = data.drop(
        columns=[col for col in identifier_columns if col in data.columns],
        errors="ignore"
    )

    # Target column
    if "readmitted" not in data.columns:
        raise ValueError("Target column 'readmitted' not found.")

    # Convert readmission target into numeric classes
    # 0 = No readmission
    # 1 = Readmitted after 30 days
    # 2 = Readmitted within 30 days
    data["readmitted"] = data["readmitted"].map({
        "NO": 0,
        ">30": 1,
        "<30": 2
    })

    # Remove rows where target is missing
    data = data.dropna(subset=["readmitted"])

    # Separate categorical and numerical columns
    categorical_columns = data.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    numerical_columns = data.select_dtypes(
        include=["number"]
    ).columns.tolist()

    # Fill categorical missing values
    for column in categorical_columns:
        data[column] = data[column].fillna("Unknown")

    # Fill numerical missing values using median
    for column in numerical_columns:
        if column != "readmitted":
            data[column] = pd.to_numeric(
                data[column],
                errors="coerce"
            )
            data[column] = data[column].fillna(
                data[column].median()
            )

    return data


def save_processed_data(data):
    """Save the processed dataset."""
    data.to_csv(PROCESSED_PATH, index=False)
    return PROCESSED_PATH


def main():
    print("Loading dataset...")
    df = load_dataset()

    print(f"Original dataset shape: {df.shape}")

    print("Preprocessing dataset...")
    processed_data = preprocess_data(df)

    print(
        f"Processed dataset shape: {processed_data.shape}"
    )

    output_path = save_processed_data(processed_data)

    print(
        f"Processed dataset saved to: {output_path}"
    )


if __name__ == "__main__":
    main()