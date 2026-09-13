from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    ExtraTreesClassifier,
    HistGradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
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
EVALUATION_DIR = PROJECT_ROOT / "ml" / "evaluation"

BEST_MODEL_PATH = (
    MODEL_DIR / "best_binary_readmission_model.joblib"
)

COMPARISON_PATH = (
    EVALUATION_DIR / "binary_model_comparison.csv"
)


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

TARGET_COLUMN = "readmitted"

TEST_SIZE = 0.20
RANDOM_STATE = 42


# ---------------------------------------------------------
# Load dataset
# ---------------------------------------------------------

print("=" * 75)
print("HealthForecast AI - Binary Readmission Model Comparison")
print("=" * 75)

print("\nLoading processed dataset...")
print(DATA_PATH)

df = pd.read_csv(DATA_PATH)

print(f"\nOriginal dataset shape: {df.shape}")


# ---------------------------------------------------------
# Validate target
# ---------------------------------------------------------

if TARGET_COLUMN not in df.columns:
    raise ValueError(
        f"Target column '{TARGET_COLUMN}' was not found."
    )


# ---------------------------------------------------------
# Create binary target
# ---------------------------------------------------------

print("\nOriginal target distribution:")
print(df[TARGET_COLUMN].value_counts())


print("\nCreating binary readmission target...")

df["readmission_binary"] = (
    df[TARGET_COLUMN]
    .isin(["<30", ">30"])
    .astype(int)
)


print("\nBinary target distribution:")
print(
    df["readmission_binary"]
    .value_counts()
    .sort_index()
)


print("\nBinary target percentages:")
print(
    (
        df["readmission_binary"]
        .value_counts(normalize=True)
        .sort_index()
        * 100
    ).round(2)
)


# ---------------------------------------------------------
# Separate features and target
# ---------------------------------------------------------

X = df.drop(
    columns=[
        TARGET_COLUMN,
        "readmission_binary",
    ]
)

y = df["readmission_binary"]


# ---------------------------------------------------------
# Remove identifier columns
# ---------------------------------------------------------

identifier_columns = [
    "encounter_id",
    "patient_nbr",
]

existing_identifier_columns = [
    column
    for column in identifier_columns
    if column in X.columns
]

if existing_identifier_columns:

    print("\nRemoving identifier columns:")

    for column in existing_identifier_columns:
        print(f" - {column}")

    X = X.drop(
        columns=existing_identifier_columns
    )


# ---------------------------------------------------------
# Identify feature types
# ---------------------------------------------------------

numeric_features = X.select_dtypes(
    include=["int64", "float64"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object"]
).columns.tolist()


print(
    f"\nNumerical features   : "
    f"{len(numeric_features)}"
)

print(
    f"Categorical features : "
    f"{len(categorical_features)}"
)


# ---------------------------------------------------------
# Numerical preprocessing
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Categorical preprocessing
# ---------------------------------------------------------

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
                handle_unknown="ignore",
                sparse_output=True,
            ),
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
            numeric_features,
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features,
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
print(
    f"Training samples : {len(X_train)}"
)
print(
    f"Testing samples  : {len(X_test)}"
)


# ---------------------------------------------------------
# Fit preprocessing
# ---------------------------------------------------------

print("\nFitting preprocessing pipeline...")

X_train_processed = (
    preprocessor.fit_transform(X_train)
)

X_test_processed = (
    preprocessor.transform(X_test)
)

print("Preprocessing completed.")

print(
    f"Processed training matrix: "
    f"{X_train_processed.shape}"
)

print(
    f"Processed testing matrix : "
    f"{X_test_processed.shape}"
)


# ---------------------------------------------------------
# Define models
# ---------------------------------------------------------

models = {

    "Logistic Regression": LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=RANDOM_STATE,
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced_subsample",
        n_jobs=-1,
        random_state=RANDOM_STATE,
    ),

    "Extra Trees": ExtraTreesClassifier(
        n_estimators=200,
        class_weight="balanced",
        n_jobs=-1,
        random_state=RANDOM_STATE,
    ),

    "HistGradient Boosting":
        HistGradientBoostingClassifier(
            max_iter=150,
            learning_rate=0.08,
            max_leaf_nodes=31,
            random_state=RANDOM_STATE,
        ),
}


# ---------------------------------------------------------
# Model comparison
# ---------------------------------------------------------

results = []

trained_models = {}

for model_name, model in models.items():

    print("\n" + "-" * 75)
    print(f"Training: {model_name}")
    print("-" * 75)

    model.fit(
        X_train_processed,
        y_train,
    )

    print("Training completed.")

    y_pred = model.predict(
        X_test_processed
    )

    y_probability = model.predict_proba(
        X_test_processed
    )[:, 1]

    accuracy = accuracy_score(
        y_test,
        y_pred,
    )

    macro_f1 = f1_score(
        y_test,
        y_pred,
        average="macro",
    )

    weighted_f1 = f1_score(
        y_test,
        y_pred,
        average="weighted",
    )

    roc_auc = roc_auc_score(
        y_test,
        y_probability,
    )

    results.append(
        {
            "model": model_name,
            "accuracy": accuracy,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "roc_auc": roc_auc,
        }
    )

    trained_models[model_name] = model

    print(
        f"\nAccuracy       : "
        f"{accuracy:.4f}"
    )

    print(
        f"Macro F1-score : "
        f"{macro_f1:.4f}"
    )

    print(
        f"Weighted F1    : "
        f"{weighted_f1:.4f}"
    )

    print(
        f"ROC-AUC        : "
        f"{roc_auc:.4f}"
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            y_pred,
            target_names=[
                "Not Readmitted",
                "Readmitted",
            ],
            digits=4,
        )
    )

    print("Confusion Matrix:")

    print(
        confusion_matrix(
            y_test,
            y_pred,
        )
    )


# ---------------------------------------------------------
# Create comparison table
# ---------------------------------------------------------

results_df = pd.DataFrame(
    results
)

results_df = results_df.sort_values(
    by="macro_f1",
    ascending=False,
).reset_index(drop=True)


print("\n" + "=" * 75)
print("BINARY MODEL COMPARISON")
print("=" * 75)

print(
    results_df.to_string(
        index=False,
        formatters={
            "accuracy": "{:.4f}".format,
            "macro_f1": "{:.4f}".format,
            "weighted_f1": "{:.4f}".format,
            "roc_auc": "{:.4f}".format,
        },
    )
)


# ---------------------------------------------------------
# Select best model
# ---------------------------------------------------------

best_model_name = (
    results_df.iloc[0]["model"]
)

best_model = trained_models[
    best_model_name
]


# ---------------------------------------------------------
# Save model package
# ---------------------------------------------------------

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

EVALUATION_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

model_package = {
    "model": best_model,
    "preprocessor": preprocessor,
    "target_column": "readmission_binary",
    "model_name": best_model_name,
    "feature_columns": X.columns.tolist(),
    "positive_class": "Readmitted",
    "negative_class": "Not Readmitted",
}


joblib.dump(
    model_package,
    BEST_MODEL_PATH,
)


# ---------------------------------------------------------
# Save comparison results
# ---------------------------------------------------------

results_df.to_csv(
    COMPARISON_PATH,
    index=False,
)


# ---------------------------------------------------------
# Final output
# ---------------------------------------------------------

print("\n" + "=" * 75)
print("BINARY MODEL SELECTION COMPLETE")
print("=" * 75)

print(
    f"\nSelected model: "
    f"{best_model_name}"
)

print(
    f"Best Macro F1: "
    f"{results_df.iloc[0]['macro_f1']:.4f}"
)

print(
    f"Best ROC-AUC: "
    f"{results_df.iloc[0]['roc_auc']:.4f}"
)

print("\nSaved model package:")
print(BEST_MODEL_PATH)

print("\nSaved comparison results:")
print(COMPARISON_PATH)

print(
    "\nBinary readmission model "
    "comparison completed successfully."
)

print("=" * 75)