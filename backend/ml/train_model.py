import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "diabetic_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "readmission_model.joblib"
)


# ============================================================
# LOAD DATA
# ============================================================

print("\n========================================")
print(" HealthForecast AI - ML Model Training")
print("========================================\n")

print("Dataset:")
print(DATA_PATH)

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"Dataset not found:\n{DATA_PATH}"
    )

df = pd.read_csv(DATA_PATH)

print("\nDataset loaded successfully.")
print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")


# ============================================================
# TARGET
# ============================================================

# Predict early readmission within 30 days.
#
# <30  -> 1
# >30  -> 0
# NO   -> 0

df = df[
    df["readmitted"].isin(
        ["<30", ">30", "NO"]
    )
].copy()

df["target"] = (
    df["readmitted"] == "<30"
).astype(int)


# ============================================================
# FEATURES
# ============================================================

features = [
    "race",
    "gender",
    "age",
    "admission_type_id",
    "discharge_disposition_id",
    "admission_source_id",
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
    "max_glu_serum",
    "A1Cresult",
    "insulin",
    "change",
    "diabetesMed",
]


missing_features = [
    column
    for column in features
    if column not in df.columns
]

if missing_features:
    raise ValueError(
        "Missing dataset columns:\n"
        + "\n".join(missing_features)
    )


X = df[features].copy()
y = df["target"].copy()


# ============================================================
# CLEAN SPECIAL VALUES
# ============================================================

X = X.replace(
    ["?", "Unknown/Invalid", "None"],
    pd.NA
)


# ============================================================
# FEATURE TYPES
# ============================================================

categorical_features = [
    "race",
    "gender",
    "age",
    "max_glu_serum",
    "A1Cresult",
    "insulin",
    "change",
    "diabetesMed",
]

numeric_features = [
    column
    for column in features
    if column not in categorical_features
]


# ============================================================
# PREPROCESSING
# ============================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="median"
            ),
        ),
        (
            "scaler",
            StandardScaler(),
        ),
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            ),
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
        ),
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numeric_features,
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features,
        ),
    ]
)


# ============================================================
# MODEL
# ============================================================

model = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor,
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ]
)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


print("\nTraining model...")

model.fit(
    X_train,
    y_train
)


# ============================================================
# EVALUATION
# ============================================================

predictions = model.predict(
    X_test
)

probabilities = model.predict_proba(
    X_test
)[:, 1]


accuracy = accuracy_score(
    y_test,
    predictions
)

try:
    auc = roc_auc_score(
        y_test,
        probabilities
    )
except ValueError:
    auc = 0.0


print("\n========================================")
print(" MODEL RESULTS")
print("========================================")

print(
    f"\nAccuracy: {accuracy:.4f}"
)

print(
    f"ROC-AUC : {auc:.4f}"
)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

joblib.dump(
    model,
    MODEL_PATH
)

print("\n========================================")
print("Model saved successfully!")
print("========================================")
print(MODEL_PATH)
print()