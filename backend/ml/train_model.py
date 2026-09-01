import os
import glob
import joblib
import kagglehub
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_recall_curve,
    f1_score,
)


# =========================================================
# CONFIGURATION
# =========================================================

DATASET_NAME = (
    "siddharth0935/"
    "hospital-readmission-predictionsynthetic-dataset"
)

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model.pkl"
)


# =========================================================
# 1. DOWNLOAD DATASET
# =========================================================

print("\nDownloading dataset from Kaggle...")

dataset_path = kagglehub.dataset_download(
    DATASET_NAME
)

print("Dataset downloaded to:")
print(dataset_path)


# =========================================================
# 2. FIND CSV
# =========================================================

csv_files = glob.glob(
    os.path.join(
        dataset_path,
        "*.csv"
    )
)

if not csv_files:
    raise FileNotFoundError(
        "No CSV file found in the Kaggle dataset."
    )

csv_path = csv_files[0]

print("\nCSV file found:")
print(csv_path)


# =========================================================
# 3. LOAD DATA
# =========================================================

df = pd.read_csv(csv_path)

print("\nDataset loaded successfully.")

print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nColumns:")
print(df.columns.tolist())


# =========================================================
# 4. CLEAN COLUMN NAMES
# =========================================================

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)

print("\nCleaned columns:")
print(df.columns.tolist())


# =========================================================
# 5. TARGET
# =========================================================

TARGET = "readmitted_30_days"

if TARGET not in df.columns:
    raise ValueError(
        f"Target column '{TARGET}' not found."
    )


print("\nOriginal target distribution:")
print(
    df[TARGET].value_counts()
)


# =========================================================
# 6. CONVERT TARGET
# =========================================================

def convert_target(value):

    value = str(value).strip().lower()

    if value in [
        "yes",
        "1",
        "true"
    ]:
        return 1

    if value in [
        "no",
        "0",
        "false"
    ]:
        return 0

    return np.nan


df[TARGET] = df[TARGET].apply(
    convert_target
)

df = df.dropna(
    subset=[TARGET]
)

df[TARGET] = df[TARGET].astype(int)


print("\nConverted target distribution:")
print(
    df[TARGET].value_counts()
)


# =========================================================
# 7. REMOVE DUPLICATES
# =========================================================

before = len(df)

df = df.drop_duplicates()

print(
    "\nDuplicates removed:",
    before - len(df)
)


# =========================================================
# 8. FEATURES / TARGET
# =========================================================

X = df.drop(
    columns=[TARGET]
)

y = df[TARGET]


# =========================================================
# 9. REMOVE ID COLUMNS
# =========================================================

id_columns = []

for column in X.columns:

    name = column.lower()

    if (
        name == "id"
        or name.endswith("_id")
        or name in [
            "patient_id",
            "patientid",
            "encounter_id"
        ]
    ):
        id_columns.append(column)


if id_columns:

    print(
        "\nRemoving ID columns:"
    )

    print(id_columns)

    X = X.drop(
        columns=id_columns
    )


# =========================================================
# 10. IDENTIFY FEATURES
# =========================================================

numeric_features = X.select_dtypes(
    include=[
        "int64",
        "float64",
        "int32",
        "float32"
    ]
).columns.tolist()


categorical_features = X.select_dtypes(
    include=[
        "object",
        "category",
        "bool"
    ]
).columns.tolist()


print("\nNumeric features:")
print(numeric_features)

print("\nCategorical features:")
print(categorical_features)


# =========================================================
# 11. PREPROCESSING
# =========================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        )
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            )
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
            )
        )
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numeric_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


# =========================================================
# 12. TRAIN / VALIDATION / TEST SPLIT
# =========================================================

# First: 80% train+validation, 20% test

X_temp, X_test, y_temp, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# Then split the 80% into:
# 60% training
# 20% validation

X_train, X_validation, y_train, y_validation = train_test_split(
    X_temp,
    y_temp,
    test_size=0.25,
    random_state=42,
    stratify=y_temp
)


print("\nDataset split:")

print(
    "Training:",
    len(X_train)
)

print(
    "Validation:",
    len(X_validation)
)

print(
    "Testing:",
    len(X_test)
)


# =========================================================
# 13. RANDOM FOREST
# =========================================================

classifier = RandomForestClassifier(
    n_estimators=400,
    max_depth=12,
    min_samples_leaf=5,
    class_weight="balanced_subsample",
    random_state=42,
    n_jobs=-1
)


# =========================================================
# 14. COMPLETE PIPELINE
# =========================================================

model = Pipeline(
    steps=[
        (
            "preprocessing",
            preprocessor
        ),
        (
            "classifier",
            classifier
        )
    ]
)


# =========================================================
# 15. TRAIN
# =========================================================

print(
    "\nTraining Random Forest..."
)

model.fit(
    X_train,
    y_train
)

print(
    "Training completed!"
)


# =========================================================
# 16. VALIDATION PROBABILITIES
# =========================================================

validation_probabilities = model.predict_proba(
    X_validation
)[:, 1]


# =========================================================
# 17. FIND BEST THRESHOLD
# =========================================================

best_threshold = 0.50
best_f1 = 0.0

print(
    "\nSearching for best prediction threshold..."
)


for threshold in np.arange(
    0.20,
    0.71,
    0.01
):

    validation_predictions = (
        validation_probabilities
        >= threshold
    ).astype(int)

    score = f1_score(
        y_validation,
        validation_predictions
    )

    if score > best_f1:

        best_f1 = score
        best_threshold = threshold


print(
    f"Best threshold: "
    f"{best_threshold:.2f}"
)

print(
    f"Validation F1: "
    f"{best_f1:.4f}"
)


# =========================================================
# 18. FINAL TEST
# =========================================================

test_probabilities = model.predict_proba(
    X_test
)[:, 1]


test_predictions = (
    test_probabilities
    >= best_threshold
).astype(int)


# =========================================================
# 19. METRICS
# =========================================================

accuracy = accuracy_score(
    y_test,
    test_predictions
)


roc_auc = roc_auc_score(
    y_test,
    test_probabilities
)


print(
    "\n===================================="
)

print(
    "FINAL MODEL PERFORMANCE"
)

print(
    "===================================="
)


print(
    f"Accuracy: {accuracy:.4f}"
)


print(
    f"ROC-AUC:  {roc_auc:.4f}"
)


print(
    f"Threshold: {best_threshold:.2f}"
)


print(
    "\nClassification Report:"
)


print(
    classification_report(
        y_test,
        test_predictions,
        zero_division=0
    )
)


print(
    "\nConfusion Matrix:"
)


print(
    confusion_matrix(
        y_test,
        test_predictions
    )
)


# =========================================================
# 20. SAVE MODEL + THRESHOLD
# =========================================================

model_package = {

    "model": model,

    "threshold": float(
        best_threshold
    ),

    "features": X.columns.tolist(),

    "target": TARGET
}


joblib.dump(
    model_package,
    MODEL_PATH
)


print(
    "\n===================================="
)

print(
    "MODEL SAVED SUCCESSFULLY"
)

print(
    "===================================="
)

print(
    MODEL_PATH
)


# =========================================================
# 21. SAMPLE PREDICTION
# =========================================================

sample_patient = X_test.iloc[
    [0]
]


sample_probability = model.predict_proba(
    sample_patient
)[0][1]


sample_prediction = int(
    sample_probability
    >= best_threshold
)


if sample_probability >= 0.70:

    risk = "HIGH"

elif sample_probability >= 0.40:

    risk = "MEDIUM"

else:

    risk = "LOW"


print(
    "\n===================================="
)

print(
    "SAMPLE PREDICTION"
)

print(
    "===================================="
)


print(
    "Prediction:",
    "READMITTED"
    if sample_prediction == 1
    else "NOT READMITTED"
)


print(
    f"Probability: "
    f"{sample_probability * 100:.2f}%"
)


print(
    "Risk:",
    risk
)


print(
    "\nTraining process completed!"
)