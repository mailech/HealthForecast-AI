from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# ============================================================
# PATHS
# ============================================================

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

MODEL_DIR.mkdir(parents=True, exist_ok=True)
EVALUATION_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# CONFIGURATION
# ============================================================

RANDOM_STATE = 42

TARGET_COLUMN = "readmitted"

VALIDATION_SIZE = 0.15
TEST_SIZE = 0.15

BEST_PARAMS = {
    "learning_rate": 0.05,
    "max_iter": 300,
    "max_leaf_nodes": 31,
    "min_samples_leaf": 50,
    "l2_regularization": 1.0,
}


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("HealthForecast AI - Readmission Threshold Optimization")
print("=" * 70)

print("\nLoading processed dataset...")
print(DATA_PATH)

df = pd.read_csv(DATA_PATH)

print(f"\nDataset shape: {df.shape}")


# ============================================================
# CREATE BINARY TARGET
# ============================================================

df["readmission_binary"] = (
    df[TARGET_COLUMN]
    .apply(lambda value: 0 if value == "NO" else 1)
)

X = df.drop(
    columns=[TARGET_COLUMN, "readmission_binary"]
)

y = df["readmission_binary"]


# ============================================================
# THREE-WAY SPLIT
# ============================================================

print("\nCreating train / validation / test split...")

X_train, X_temp, y_train, y_temp = train_test_split(
    X,
    y,
    test_size=(VALIDATION_SIZE + TEST_SIZE),
    random_state=RANDOM_STATE,
    stratify=y,
)

X_validation, X_test, y_validation, y_test = train_test_split(
    X_temp,
    y_temp,
    test_size=(
        TEST_SIZE
        / (VALIDATION_SIZE + TEST_SIZE)
    ),
    random_state=RANDOM_STATE,
    stratify=y_temp,
)

print("\nDataset split:")
print(f"Training samples   : {len(X_train)}")
print(f"Validation samples : {len(X_validation)}")
print(f"Testing samples    : {len(X_test)}")


# ============================================================
# FEATURE TYPES
# ============================================================

numerical_features = X.select_dtypes(
    include=["number"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object"]
).columns.tolist()

print(f"\nNumerical features  : {len(numerical_features)}")
print(f"Categorical features: {len(categorical_features)}")


# ============================================================
# PREPROCESSOR
# ============================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            Pipeline(
                steps=[
                    (
                        "imputer",
                        SimpleImputer(
                            strategy="median"
                        ),
                    )
                ]
            ),
            numerical_features,
        ),
        (
            "categorical",
            Pipeline(
                steps=[
                    (
                        "imputer",
                        SimpleImputer(
                            strategy="most_frequent"
                        ),
                    ),
                    (
                        "onehot",
                        OneHotEncoder(
                            handle_unknown="ignore",
                            sparse_output=False,
                        ),
                    ),
                ]
            ),
            categorical_features,
        ),
    ],
    remainder="drop",
)


# ============================================================
# FIT ON TRAINING DATA ONLY
# ============================================================

print("\nFitting preprocessing pipeline...")

X_train_processed = preprocessor.fit_transform(
    X_train
)

X_validation_processed = preprocessor.transform(
    X_validation
)

X_test_processed = preprocessor.transform(
    X_test
)

print("Preprocessing completed.")

print(
    f"Training matrix   : {X_train_processed.shape}"
)

print(
    f"Validation matrix : {X_validation_processed.shape}"
)

print(
    f"Testing matrix    : {X_test_processed.shape}"
)


# ============================================================
# TRAIN MODEL USING TRAINING DATA ONLY
# ============================================================

print("\n" + "=" * 70)
print("TRAINING MODEL FOR THRESHOLD OPTIMIZATION")
print("=" * 70)

model = HistGradientBoostingClassifier(
    learning_rate=BEST_PARAMS["learning_rate"],
    max_iter=BEST_PARAMS["max_iter"],
    max_leaf_nodes=BEST_PARAMS["max_leaf_nodes"],
    min_samples_leaf=BEST_PARAMS["min_samples_leaf"],
    l2_regularization=BEST_PARAMS[
        "l2_regularization"
    ],
    early_stopping=True,
    validation_fraction=0.10,
    random_state=RANDOM_STATE,
)

print("\nTraining model...")

model.fit(
    X_train_processed,
    y_train,
)

print("Training completed.")


# ============================================================
# VALIDATION PROBABILITIES
# ============================================================

print("\nGenerating validation probabilities...")

validation_probabilities = model.predict_proba(
    X_validation_processed
)[:, 1]


validation_auc = roc_auc_score(
    y_validation,
    validation_probabilities,
)

print(
    f"Validation ROC-AUC: "
    f"{validation_auc:.4f}"
)


# ============================================================
# THRESHOLD SEARCH
# ============================================================

print("\n" + "=" * 70)
print("SEARCHING FOR OPTIMAL THRESHOLD")
print("=" * 70)

thresholds = np.arange(
    0.20,
    0.81,
    0.01,
)

threshold_results = []

best_threshold = 0.50
best_macro_f1 = -1.0


for threshold in thresholds:

    predictions = (
        validation_probabilities >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        y_validation,
        predictions,
    )

    macro_f1 = f1_score(
        y_validation,
        predictions,
        average="macro",
    )

    weighted_f1 = f1_score(
        y_validation,
        predictions,
        average="weighted",
    )

    precision = precision_score(
        y_validation,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_validation,
        predictions,
        zero_division=0,
    )

    readmitted_f1 = f1_score(
        y_validation,
        predictions,
        pos_label=1,
    )

    threshold_results.append(
        {
            "threshold": round(
                float(threshold),
                2,
            ),
            "accuracy": accuracy,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "readmitted_precision": precision,
            "readmitted_recall": recall,
            "readmitted_f1": readmitted_f1,
        }
    )

    if macro_f1 > best_macro_f1:
        best_macro_f1 = macro_f1
        best_threshold = float(threshold)


threshold_df = pd.DataFrame(
    threshold_results
)

threshold_df = threshold_df.sort_values(
    by="macro_f1",
    ascending=False,
)

threshold_results_path = (
    EVALUATION_DIR
    / "readmission_threshold_analysis.csv"
)

threshold_df.to_csv(
    threshold_results_path,
    index=False,
)


# ============================================================
# BEST THRESHOLD
# ============================================================

print("\n" + "=" * 70)
print("OPTIMAL THRESHOLD")
print("=" * 70)

print(
    f"\nSelected threshold: "
    f"{best_threshold:.2f}"
)

print(
    f"Validation Macro F1: "
    f"{best_macro_f1:.4f}"
)

best_threshold_row = threshold_df[
    threshold_df["threshold"]
    == round(best_threshold, 2)
].iloc[0]

print(
    f"Validation Accuracy: "
    f"{best_threshold_row['accuracy']:.4f}"
)

print(
    f"Readmitted Precision: "
    f"{best_threshold_row['readmitted_precision']:.4f}"
)

print(
    f"Readmitted Recall: "
    f"{best_threshold_row['readmitted_recall']:.4f}"
)

print(
    f"Readmitted F1: "
    f"{best_threshold_row['readmitted_f1']:.4f}"
)


# ============================================================
# REFIT FINAL MODEL ON TRAIN + VALIDATION
# ============================================================

print("\n" + "=" * 70)
print("REFITTING FINAL MODEL")
print("=" * 70)

X_train_final = pd.concat(
    [X_train, X_validation],
    axis=0,
)

y_train_final = pd.concat(
    [y_train, y_validation],
    axis=0,
)

print(
    f"\nFinal training samples: "
    f"{len(X_train_final)}"
)


# ============================================================
# FINAL PREPROCESSOR
# ============================================================

final_preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            Pipeline(
                steps=[
                    (
                        "imputer",
                        SimpleImputer(
                            strategy="median"
                        ),
                    )
                ]
            ),
            numerical_features,
        ),
        (
            "categorical",
            Pipeline(
                steps=[
                    (
                        "imputer",
                        SimpleImputer(
                            strategy="most_frequent"
                        ),
                    ),
                    (
                        "onehot",
                        OneHotEncoder(
                            handle_unknown="ignore",
                            sparse_output=False,
                        ),
                    ),
                ]
            ),
            categorical_features,
        ),
    ],
    remainder="drop",
)


print("\nFitting final preprocessing pipeline...")

X_train_final_processed = (
    final_preprocessor.fit_transform(
        X_train_final
    )
)

X_test_final_processed = (
    final_preprocessor.transform(
        X_test
    )
)


# ============================================================
# FINAL MODEL
# ============================================================

final_model = HistGradientBoostingClassifier(
    learning_rate=BEST_PARAMS["learning_rate"],
    max_iter=BEST_PARAMS["max_iter"],
    max_leaf_nodes=BEST_PARAMS["max_leaf_nodes"],
    min_samples_leaf=BEST_PARAMS["min_samples_leaf"],
    l2_regularization=BEST_PARAMS[
        "l2_regularization"
    ],
    early_stopping=True,
    validation_fraction=0.10,
    random_state=RANDOM_STATE,
)


print("\nTraining final model...")

final_model.fit(
    X_train_final_processed,
    y_train_final,
)

print("Final model training completed.")


# ============================================================
# FINAL TEST EVALUATION WITH OPTIMIZED THRESHOLD
# ============================================================

print("\n" + "=" * 70)
print("FINAL TEST EVALUATION WITH OPTIMIZED THRESHOLD")
print("=" * 70)

test_probabilities = final_model.predict_proba(
    X_test_final_processed
)[:, 1]


# Standard 0.50 threshold
test_predictions_default = (
    test_probabilities >= 0.50
).astype(int)


# Optimized threshold
test_predictions_optimized = (
    test_probabilities >= best_threshold
).astype(int)


# ------------------------------------------------------------
# Default threshold metrics
# ------------------------------------------------------------

default_accuracy = accuracy_score(
    y_test,
    test_predictions_default,
)

default_macro_f1 = f1_score(
    y_test,
    test_predictions_default,
    average="macro",
)

default_readmitted_precision = precision_score(
    y_test,
    test_predictions_default,
    zero_division=0,
)

default_readmitted_recall = recall_score(
    y_test,
    test_predictions_default,
    zero_division=0,
)

default_readmitted_f1 = f1_score(
    y_test,
    test_predictions_default,
)


# ------------------------------------------------------------
# Optimized threshold metrics
# ------------------------------------------------------------

optimized_accuracy = accuracy_score(
    y_test,
    test_predictions_optimized,
)

optimized_macro_f1 = f1_score(
    y_test,
    test_predictions_optimized,
    average="macro",
)

optimized_weighted_f1 = f1_score(
    y_test,
    test_predictions_optimized,
    average="weighted",
)

optimized_precision = precision_score(
    y_test,
    test_predictions_optimized,
    zero_division=0,
)

optimized_recall = recall_score(
    y_test,
    test_predictions_optimized,
    zero_division=0,
)

optimized_f1 = f1_score(
    y_test,
    test_predictions_optimized,
)

optimized_roc_auc = roc_auc_score(
    y_test,
    test_probabilities,
)


# ============================================================
# PRINT COMPARISON
# ============================================================

print("\nDefault threshold = 0.50")

print(
    f"Accuracy             : "
    f"{default_accuracy:.4f}"
)

print(
    f"Macro F1             : "
    f"{default_macro_f1:.4f}"
)

print(
    f"Readmitted Precision : "
    f"{default_readmitted_precision:.4f}"
)

print(
    f"Readmitted Recall    : "
    f"{default_readmitted_recall:.4f}"
)

print(
    f"Readmitted F1        : "
    f"{default_readmitted_f1:.4f}"
)


print(
    f"\nOptimized threshold = "
    f"{best_threshold:.2f}"
)

print(
    f"Accuracy             : "
    f"{optimized_accuracy:.4f}"
)

print(
    f"Macro F1             : "
    f"{optimized_macro_f1:.4f}"
)

print(
    f"Weighted F1          : "
    f"{optimized_weighted_f1:.4f}"
)

print(
    f"ROC-AUC              : "
    f"{optimized_roc_auc:.4f}"
)

print(
    f"Readmitted Precision  : "
    f"{optimized_precision:.4f}"
)

print(
    f"Readmitted Recall     : "
    f"{optimized_recall:.4f}"
)

print(
    f"Readmitted F1         : "
    f"{optimized_f1:.4f}"
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\nOptimized Threshold Confusion Matrix:")

print(
    confusion_matrix(
        y_test,
        test_predictions_optimized,
    )
)


print("\nOptimized Threshold Classification Report:")

print(
    classification_report(
        y_test,
        test_predictions_optimized,
    )
)


# ============================================================
# SAVE FINAL MODEL PACKAGE
# ============================================================

final_model_package = {
    "model": final_model,
    "preprocessor": final_preprocessor,
    "feature_columns": X.columns.tolist(),
    "target": "readmission_binary",
    "class_mapping": {
        0: "Not Readmitted",
        1: "Readmitted",
    },
    "best_parameters": BEST_PARAMS,
    "decision_threshold": best_threshold,
    "selection_metric": "validation_macro_f1",
    "validation_macro_f1": best_macro_f1,
    "validation_roc_auc": validation_auc,
    "test_accuracy": optimized_accuracy,
    "test_macro_f1": optimized_macro_f1,
    "test_weighted_f1": optimized_weighted_f1,
    "test_roc_auc": optimized_roc_auc,
    "test_readmitted_precision": optimized_precision,
    "test_readmitted_recall": optimized_recall,
    "test_readmitted_f1": optimized_f1,
    "random_state": RANDOM_STATE,
}


final_model_path = (
    MODEL_DIR
    / "final_threshold_optimized_readmission_model.joblib"
)


joblib.dump(
    final_model_package,
    final_model_path,
)


# ============================================================
# SAVE METRICS
# ============================================================

comparison_df = pd.DataFrame(
    [
        {
            "threshold_type": "default",
            "threshold": 0.50,
            "accuracy": default_accuracy,
            "macro_f1": default_macro_f1,
            "readmitted_precision":
                default_readmitted_precision,
            "readmitted_recall":
                default_readmitted_recall,
            "readmitted_f1":
                default_readmitted_f1,
        },
        {
            "threshold_type": "optimized",
            "threshold": best_threshold,
            "accuracy": optimized_accuracy,
            "macro_f1": optimized_macro_f1,
            "weighted_f1": optimized_weighted_f1,
            "roc_auc": optimized_roc_auc,
            "readmitted_precision":
                optimized_precision,
            "readmitted_recall":
                optimized_recall,
            "readmitted_f1":
                optimized_f1,
        },
    ]
)


comparison_path = (
    EVALUATION_DIR
    / "threshold_comparison.csv"
)

comparison_df.to_csv(
    comparison_path,
    index=False,
)


# ============================================================
# COMPLETION
# ============================================================

print("\n" + "=" * 70)
print("THRESHOLD OPTIMIZATION COMPLETED")
print("=" * 70)

print("\nSaved final model:")
print(final_model_path)

print("\nSaved threshold analysis:")
print(threshold_results_path)

print("\nSaved threshold comparison:")
print(comparison_path)

print(
    "\nThe final decision threshold was selected "
    "using validation data only."
)

print("=" * 70)