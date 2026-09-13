from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "cleaned_diabetic_data.csv"
)

MODEL_DIR = PROJECT_ROOT / "ml" / "models"

MODEL_PATH = MODEL_DIR / "readmission_logistic_regression.joblib"


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

TARGET_COLUMN = "readmitted"

TEST_SIZE = 0.20
RANDOM_STATE = 42


# ---------------------------------------------------------
# Load dataset
# ---------------------------------------------------------

print("=" * 60)
print("HealthForecast AI - Readmission Model Training")
print("=" * 60)

print("\nLoading processed dataset...")
print(DATA_PATH)

df = pd.read_csv(DATA_PATH)

print(f"\nDataset shape: {df.shape}")


# ---------------------------------------------------------
# Separate features and target
# ---------------------------------------------------------

if TARGET_COLUMN not in df.columns:
    raise ValueError(
        f"Target column '{TARGET_COLUMN}' was not found."
    )

X = df.drop(columns=[TARGET_COLUMN])
y = df[TARGET_COLUMN]


print("\nTarget classes:")
print(y.value_counts())


# ---------------------------------------------------------
# Identify feature types
# ---------------------------------------------------------

numeric_features = X.select_dtypes(
    include=["int64", "float64"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object"]
).columns.tolist()


print(f"\nNumerical features: {len(numeric_features)}")
print(f"Categorical features: {len(categorical_features)}")


# ---------------------------------------------------------
# Numerical preprocessing
# ---------------------------------------------------------

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        ),
        (
            "scaler",
            StandardScaler()
        ),
    ]
)


# ---------------------------------------------------------
# Categorical preprocessing
# ---------------------------------------------------------

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=True
            )
        ),
    ]
)


# ---------------------------------------------------------
# Combined preprocessing
# ---------------------------------------------------------

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
        ),
    ]
)


# ---------------------------------------------------------
# Model
# ---------------------------------------------------------

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced",
    random_state=RANDOM_STATE
)


# ---------------------------------------------------------
# Complete ML pipeline
# ---------------------------------------------------------

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "classifier",
            model
        ),
    ]
)


# ---------------------------------------------------------
# Train/test split
# ---------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y,
)


print("\nTrain/test split:")
print(f"Training samples: {len(X_train)}")
print(f"Testing samples : {len(X_test)}")


# ---------------------------------------------------------
# Train
# ---------------------------------------------------------

print("\nTraining Logistic Regression model...")

pipeline.fit(
    X_train,
    y_train
)

print("Training completed successfully.")


# ---------------------------------------------------------
# Predictions
# ---------------------------------------------------------

y_pred = pipeline.predict(X_test)


# ---------------------------------------------------------
# Evaluation
# ---------------------------------------------------------

accuracy = accuracy_score(
    y_test,
    y_pred
)

macro_f1 = f1_score(
    y_test,
    y_pred,
    average="macro"
)

weighted_f1 = f1_score(
    y_test,
    y_pred,
    average="weighted"
)


print("\n" + "=" * 60)
print("MODEL EVALUATION")
print("=" * 60)

print(f"\nAccuracy       : {accuracy:.4f}")
print(f"Macro F1-score : {macro_f1:.4f}")
print(f"Weighted F1    : {weighted_f1:.4f}")


print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        digits=4
    )
)


print("\nConfusion Matrix:")
print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# ---------------------------------------------------------
# Save model
# ---------------------------------------------------------

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    pipeline,
    MODEL_PATH
)

print("\nSaved trained model:")
print(MODEL_PATH)

print("\nModel training completed successfully.")
print("=" * 60)