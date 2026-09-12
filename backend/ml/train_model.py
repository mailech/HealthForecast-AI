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
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)


# =========================================================
# CONFIGURATION
# =========================================================

DATASET_NAME = (
    "mkaur1141/"
    "diabetes-130-us-hospitals-for-years-1999-2008"
)

TARGET = "readmitted"

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model.pkl"
)


# =========================================================
# SELECTED IMPORTANT FEATURES
# =========================================================
#
# These features are selected from the actual
# Diabetes 130-US Hospitals dataset.
#
# They cover:
# - Patient demographics
# - Admission information
# - Hospital utilization
# - Clinical/laboratory information
# - Diabetes treatment information
#
# The PDF requires patient risk prediction and
# readmission forecasting, but does not prescribe
# an exact feature list.
# =========================================================

SELECTED_FEATURES = [
    # Patient / demographic information
    "race",
    "gender",
    "age",

    # Admission / hospitalization information
    "admission_type_id",
    "discharge_disposition_id",
    "admission_source_id",
    "time_in_hospital",

    # Hospital utilization
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",

    # Clinical / laboratory information
    "max_glu_serum",
    "a1cresult",

    # Diabetes treatment information
    "insulin",
    "change",
    "diabetesmed",
]


# =========================================================
# 1. DOWNLOAD DATASET
# =========================================================

print("\n========================================")
print("DOWNLOADING DIABETES HOSPITAL DATASET")
print("========================================")

dataset_path = kagglehub.dataset_download(
    DATASET_NAME
)

print("\nDataset path:")
print(dataset_path)


# =========================================================
# 2. FIND CSV FILE
# =========================================================

csv_files = glob.glob(
    os.path.join(
        dataset_path,
        "*.csv"
    )
)

if not csv_files:
    raise FileNotFoundError(
        "No CSV file found in the downloaded dataset."
    )

csv_path = csv_files[0]

print("\nCSV file:")
print(csv_path)


# =========================================================
# 3. LOAD DATASET
# =========================================================

print("\nLoading dataset...")

df = pd.read_csv(
    csv_path,
    low_memory=False
)

print("Dataset loaded successfully.")
print("Rows:", len(df))
print("Columns:", len(df.columns))


# =========================================================
# 4. CLEAN COLUMN NAMES
# =========================================================

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)

print("\nColumns cleaned successfully.")


# =========================================================
# 5. CHECK TARGET
# =========================================================

if TARGET not in df.columns:
    raise ValueError(
        f"Target column '{TARGET}' not found."
    )

print("\nOriginal target distribution:")
print(
    df[TARGET].value_counts(
        dropna=False
    )
)


# =========================================================
# 6. CREATE BINARY 30-DAY READMISSION TARGET
# =========================================================
#
# <30 = Readmitted within 30 days -> 1
# >30 = Readmitted after 30 days  -> 0
# NO  = Not readmitted             -> 0
#
# Therefore the model specifically predicts
# 30-day hospital readmission.
# =========================================================

print("\nCreating binary 30-day readmission target...")

df["readmission_30_days"] = (
    df[TARGET]
    .astype(str)
    .str.strip()
    .eq("<30")
    .astype(int)
)

print("\n30-day readmission distribution:")
print(
    df["readmission_30_days"].value_counts()
)

print("\n0 = No readmission within 30 days")
print("1 = Readmitted within 30 days")


# =========================================================
# 7. CHECK SELECTED FEATURES
# =========================================================

missing_features = [
    feature
    for feature in SELECTED_FEATURES
    if feature not in df.columns
]

if missing_features:
    raise ValueError(
        "The following selected features are missing "
        f"from the dataset: {missing_features}"
    )


# =========================================================
# 8. CREATE INPUT DATA
# =========================================================

X = df[
    SELECTED_FEATURES
].copy()

y = df[
    "readmission_30_days"
].copy()


print("\n========================================")
print("SELECTED MODEL FEATURES")
print("========================================")

for feature in SELECTED_FEATURES:
    print("-", feature)

print(
    "\nTotal selected features:",
    len(SELECTED_FEATURES)
)


# =========================================================
# 9. CLEAN UNKNOWN VALUES
# =========================================================

X = X.replace(
    "?",
    np.nan
)

X = X.replace(
    "Unknown/Invalid",
    np.nan
)


# =========================================================
# 10. IDENTIFY NUMERIC FEATURES
# =========================================================

numeric_features = X.select_dtypes(
    include=[
        "int64",
        "float64",
        "int32",
        "float32"
    ]
).columns.tolist()


# =========================================================
# 11. IDENTIFY CATEGORICAL FEATURES
# =========================================================

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
# 12. NUMERIC PREPROCESSING
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


# =========================================================
# 13. CATEGORICAL PREPROCESSING
# =========================================================

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


# =========================================================
# 14. COMBINE PREPROCESSING
# =========================================================

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
# 15. TRAIN / VALIDATION / TEST SPLIT
# =========================================================

print("\nCreating dataset splits...")

# 80% temporary
# 20% final test

X_temp, X_test, y_temp, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# Remaining 80%:
# 75% -> training = 60% total
# 25% -> validation = 20% total

X_train, X_validation, y_train, y_validation = train_test_split(
    X_temp,
    y_temp,
    test_size=0.25,
    random_state=42,
    stratify=y_temp
)


print("\nDataset split:")
print("Training:", len(X_train))
print("Validation:", len(X_validation))
print("Testing:", len(X_test))


# =========================================================
# 16. RANDOM FOREST CLASSIFIER
# =========================================================

print("\nCreating Random Forest model...")

classifier = RandomForestClassifier(
    n_estimators=400,
    max_depth=14,
    min_samples_leaf=4,
    class_weight="balanced_subsample",
    random_state=42,
    n_jobs=-1
)


# =========================================================
# 17. COMPLETE ML PIPELINE
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
# 18. TRAIN MODEL
# =========================================================

print("\n========================================")
print("TRAINING RANDOM FOREST")
print("========================================")

model.fit(
    X_train,
    y_train
)

print("\nTraining completed successfully!")


# =========================================================
# 19. VALIDATION PROBABILITIES
# =========================================================

print("\nGenerating validation probabilities...")

validation_probabilities = model.predict_proba(
    X_validation
)[:, 1]


# =========================================================
# 20. FIND BEST CLASSIFICATION THRESHOLD
# =========================================================

print("\nSearching for best prediction threshold...")

best_threshold = 0.50
best_f1 = 0.0

for threshold in np.arange(
    0.20,
    0.71,
    0.01
):

    validation_predictions = (
        validation_probabilities >= threshold
    ).astype(int)

    score = f1_score(
        y_validation,
        validation_predictions,
        zero_division=0
    )

    if score > best_f1:
        best_f1 = score
        best_threshold = threshold


print(
    f"\nBest threshold: "
    f"{best_threshold:.2f}"
)

print(
    f"Validation F1: "
    f"{best_f1:.4f}"
)


# =========================================================
# 21. FINAL TEST PREDICTIONS
# =========================================================

print("\nEvaluating final model on test data...")

test_probabilities = model.predict_proba(
    X_test
)[:, 1]

test_predictions = (
    test_probabilities >= best_threshold
).astype(int)


# =========================================================
# 22. CALCULATE REQUIRED METRICS
# =========================================================

accuracy = accuracy_score(
    y_test,
    test_predictions
)

precision = precision_score(
    y_test,
    test_predictions,
    zero_division=0
)

recall = recall_score(
    y_test,
    test_predictions,
    zero_division=0
)

f1 = f1_score(
    y_test,
    test_predictions,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    test_probabilities
)


# =========================================================
# 23. DISPLAY FINAL RESULTS
# =========================================================

print("\n========================================")
print("FINAL MODEL PERFORMANCE")
print("========================================")

print(
    f"Accuracy : {accuracy:.4f}"
)

print(
    f"Precision: {precision:.4f}"
)

print(
    f"Recall   : {recall:.4f}"
)

print(
    f"F1 Score : {f1:.4f}"
)

print(
    f"ROC-AUC  : {roc_auc:.4f}"
)

print(
    f"Threshold: {best_threshold:.2f}"
)


# =========================================================
# 24. CLASSIFICATION REPORT
# =========================================================

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        test_predictions,
        target_names=[
            "Not Readmitted Within 30 Days",
            "Readmitted Within 30 Days"
        ],
        zero_division=0
    )
)


# =========================================================
# 25. CONFUSION MATRIX
# =========================================================

print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        test_predictions
    )
)


# =========================================================
# 26. SAVE MODEL PACKAGE
# =========================================================

model_package = {

    "model": model,

    "threshold": float(
        best_threshold
    ),

    "features": SELECTED_FEATURES,

    "target": "readmission_30_days",

    "original_target": TARGET,

    "risk_thresholds": {
        "medium": 0.40,
        "high": 0.70
    },

    "dataset": (
        "Diabetes 130-US Hospitals "
        "for Years 1999-2008"
    ),

    "metrics": {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "roc_auc": float(roc_auc)
    }
}


joblib.dump(
    model_package,
    MODEL_PATH
)


# =========================================================
# 27. VERIFY MODEL FILE
# =========================================================

print("\n========================================")
print("MODEL SAVED SUCCESSFULLY")
print("========================================")

print("Model path:")
print(MODEL_PATH)


# =========================================================
# 28. SAMPLE PREDICTION
# =========================================================

sample_patient = X_test.iloc[
    [0]
]

sample_probability = model.predict_proba(
    sample_patient
)[0][1]

sample_prediction = int(
    sample_probability >= best_threshold
)


# Risk category
if sample_probability >= 0.70:
    risk = "HIGH"

elif sample_probability >= 0.40:
    risk = "MEDIUM"

else:
    risk = "LOW"


print("\n========================================")
print("SAMPLE PREDICTION")
print("========================================")

print(
    "30-Day Readmission Prediction:",
    "READMITTED"
    if sample_prediction == 1
    else "NOT READMITTED"
)

print(
    f"Readmission Probability: "
    f"{sample_probability * 100:.2f}%"
)

print(
    "Risk Level:",
    risk
)

print(
    "\nTotal model input features:",
    len(SELECTED_FEATURES)
)

print("\nTRAINING PROCESS COMPLETED")