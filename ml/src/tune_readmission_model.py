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
    f1_score,
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

TRAIN_SIZE = 0.70
VALIDATION_SIZE = 0.15
TEST_SIZE = 0.15

TARGET_COLUMN = "readmitted"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("HealthForecast AI - Validation-Based HGB Tuning")
print("=" * 70)

print("\nLoading processed dataset...")
print(DATA_PATH)

df = pd.read_csv(DATA_PATH)

print(f"\nDataset shape: {df.shape}")


# ============================================================
# CREATE BINARY TARGET
# ============================================================

print("\nCreating binary readmission target...")

df["readmission_binary"] = (
    df[TARGET_COLUMN]
    .apply(lambda value: 0 if value == "NO" else 1)
)

X = df.drop(
    columns=[TARGET_COLUMN, "readmission_binary"]
)

y = df["readmission_binary"]


print("\nBinary target distribution:")
print(y.value_counts())

print("\nBinary target percentages:")
print(
    y.value_counts(normalize=True)
    .mul(100)
    .round(2)
)


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
# PREPROCESSING
# ============================================================

numerical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median"),
        )
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent"),
        ),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False,
            ),
        ),
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            numerical_pipeline,
            numerical_features,
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features,
        ),
    ],
    remainder="drop",
)


# ============================================================
# FIT PREPROCESSOR ON TRAINING DATA ONLY
# ============================================================

print("\nFitting preprocessing pipeline on training data...")

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
    f"Processed training matrix   : "
    f"{X_train_processed.shape}"
)

print(
    f"Processed validation matrix : "
    f"{X_validation_processed.shape}"
)

print(
    f"Processed testing matrix    : "
    f"{X_test_processed.shape}"
)


# ============================================================
# HYPERPARAMETER CONFIGURATIONS
# ============================================================

parameter_configs = [
    {
        "learning_rate": 0.05,
        "max_iter": 200,
        "max_leaf_nodes": 31,
        "min_samples_leaf": 50,
        "l2_regularization": 0.0,
    },
    {
        "learning_rate": 0.05,
        "max_iter": 300,
        "max_leaf_nodes": 31,
        "min_samples_leaf": 50,
        "l2_regularization": 1.0,
    },
    {
        "learning_rate": 0.05,
        "max_iter": 300,
        "max_leaf_nodes": 63,
        "min_samples_leaf": 50,
        "l2_regularization": 1.0,
    },
    {
        "learning_rate": 0.03,
        "max_iter": 300,
        "max_leaf_nodes": 31,
        "min_samples_leaf": 50,
        "l2_regularization": 1.0,
    },
    {
        "learning_rate": 0.08,
        "max_iter": 250,
        "max_leaf_nodes": 31,
        "min_samples_leaf": 50,
        "l2_regularization": 1.0,
    },
    {
        "learning_rate": 0.05,
        "max_iter": 250,
        "max_leaf_nodes": 15,
        "min_samples_leaf": 50,
        "l2_regularization": 1.0,
    },
    {
        "learning_rate": 0.05,
        "max_iter": 300,
        "max_leaf_nodes": 31,
        "min_samples_leaf": 100,
        "l2_regularization": 1.0,
    },
]


# ============================================================
# VALIDATION-BASED MODEL SELECTION
# ============================================================

results = []

best_model = None
best_params = None

best_macro_f1 = -1.0
best_roc_auc = -1.0


for index, params in enumerate(
    parameter_configs,
    start=1,
):

    print("\n" + "=" * 70)
    print(
        f"Experiment {index}/{len(parameter_configs)}"
    )
    print("=" * 70)

    print("Parameters:")

    for key, value in params.items():
        print(f"  {key}: {value}")

    model = HistGradientBoostingClassifier(
        learning_rate=params["learning_rate"],
        max_iter=params["max_iter"],
        max_leaf_nodes=params["max_leaf_nodes"],
        min_samples_leaf=params["min_samples_leaf"],
        l2_regularization=params["l2_regularization"],
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

    validation_predictions = model.predict(
        X_validation_processed
    )

    validation_probabilities = model.predict_proba(
        X_validation_processed
    )[:, 1]

    accuracy = accuracy_score(
        y_validation,
        validation_predictions,
    )

    macro_f1 = f1_score(
        y_validation,
        validation_predictions,
        average="macro",
    )

    weighted_f1 = f1_score(
        y_validation,
        validation_predictions,
        average="weighted",
    )

    roc_auc = roc_auc_score(
        y_validation,
        validation_probabilities,
    )

    report = classification_report(
        y_validation,
        validation_predictions,
        output_dict=True,
    )

    readmitted_precision = report["1"]["precision"]
    readmitted_recall = report["1"]["recall"]
    readmitted_f1 = report["1"]["f1-score"]

    print("\nValidation results:")

    print(
        f"Accuracy            : "
        f"{accuracy:.4f}"
    )

    print(
        f"Macro F1            : "
        f"{macro_f1:.4f}"
    )

    print(
        f"Weighted F1         : "
        f"{weighted_f1:.4f}"
    )

    print(
        f"ROC-AUC             : "
        f"{roc_auc:.4f}"
    )

    print(
        f"Readmitted Precision: "
        f"{readmitted_precision:.4f}"
    )

    print(
        f"Readmitted Recall   : "
        f"{readmitted_recall:.4f}"
    )

    print(
        f"Readmitted F1       : "
        f"{readmitted_f1:.4f}"
    )

    results.append(
        {
            **params,
            "accuracy": accuracy,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "roc_auc": roc_auc,
            "readmitted_precision": readmitted_precision,
            "readmitted_recall": readmitted_recall,
            "readmitted_f1": readmitted_f1,
        }
    )

    # --------------------------------------------------------
    # MODEL SELECTION
    # Primary metric: Macro F1
    # Tie-breaker: ROC-AUC
    # --------------------------------------------------------

    if (
        macro_f1 > best_macro_f1
        or (
            np.isclose(
                macro_f1,
                best_macro_f1,
            )
            and roc_auc > best_roc_auc
        )
    ):
        best_macro_f1 = macro_f1
        best_roc_auc = roc_auc
        best_model = model
        best_params = params.copy()


# ============================================================
# SAVE VALIDATION RESULTS
# ============================================================

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by=["macro_f1", "roc_auc"],
    ascending=False,
)

results_path = (
    EVALUATION_DIR
    / "hgb_validation_tuning.csv"
)

results_df.to_csv(
    results_path,
    index=False,
)


# ============================================================
# BEST VALIDATION MODEL
# ============================================================

print("\n" + "=" * 70)
print("VALIDATION-BASED TUNING SUMMARY")
print("=" * 70)

print("\nRanked experiments:")

print(
    results_df[
        [
            "learning_rate",
            "max_iter",
            "max_leaf_nodes",
            "min_samples_leaf",
            "l2_regularization",
            "accuracy",
            "macro_f1",
            "roc_auc",
            "readmitted_recall",
            "readmitted_f1",
        ]
    ].to_string(index=False)
)


print("\n" + "=" * 70)
print("BEST HYPERPARAMETERS")
print("=" * 70)

for key, value in best_params.items():
    print(f"{key}: {value}")

print(
    f"\nBest Validation Macro F1: "
    f"{best_macro_f1:.4f}"
)

print(
    f"Best Validation ROC-AUC : "
    f"{best_roc_auc:.4f}"
)


# ============================================================
# REFIT FINAL MODEL ON TRAIN + VALIDATION
# ============================================================

print("\n" + "=" * 70)
print("REFITTING FINAL MODEL")
print("=" * 70)

print(
    "\nCombining training and validation data..."
)

X_train_final = pd.concat(
    [X_train, X_validation],
    axis=0,
)

y_train_final = pd.concat(
    [y_train, y_validation],
    axis=0,
)

print(
    f"Final training samples: "
    f"{len(X_train_final)}"
)


# ------------------------------------------------------------
# Rebuild preprocessing pipeline
# so it is fitted on TRAIN + VALIDATION only.
# ------------------------------------------------------------

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


print(
    "\nFitting final preprocessing pipeline..."
)

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

print(
    f"Final training matrix: "
    f"{X_train_final_processed.shape}"
)

print(
    f"Final testing matrix : "
    f"{X_test_final_processed.shape}"
)


# ------------------------------------------------------------
# Train final model
# ------------------------------------------------------------

final_model = HistGradientBoostingClassifier(
    learning_rate=best_params["learning_rate"],
    max_iter=best_params["max_iter"],
    max_leaf_nodes=best_params["max_leaf_nodes"],
    min_samples_leaf=best_params["min_samples_leaf"],
    l2_regularization=best_params[
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
# FINAL UNTOUCHED TEST EVALUATION
# ============================================================

print("\n" + "=" * 70)
print("FINAL UNTOUCHED TEST EVALUATION")
print("=" * 70)

test_predictions = final_model.predict(
    X_test_final_processed
)

test_probabilities = final_model.predict_proba(
    X_test_final_processed
)[:, 1]


test_accuracy = accuracy_score(
    y_test,
    test_predictions,
)

test_macro_f1 = f1_score(
    y_test,
    test_predictions,
    average="macro",
)

test_weighted_f1 = f1_score(
    y_test,
    test_predictions,
    average="weighted",
)

test_roc_auc = roc_auc_score(
    y_test,
    test_probabilities,
)

test_report = classification_report(
    y_test,
    test_predictions,
)


print(
    f"\nTest Accuracy    : "
    f"{test_accuracy:.4f}"
)

print(
    f"Test Macro F1    : "
    f"{test_macro_f1:.4f}"
)

print(
    f"Test Weighted F1 : "
    f"{test_weighted_f1:.4f}"
)

print(
    f"Test ROC-AUC     : "
    f"{test_roc_auc:.4f}"
)

print("\nFinal Classification Report:")

print(test_report)


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
    "best_parameters": best_params,
    "selection_metric": "validation_macro_f1",
    "validation_macro_f1": best_macro_f1,
    "validation_roc_auc": best_roc_auc,
    "test_accuracy": test_accuracy,
    "test_macro_f1": test_macro_f1,
    "test_weighted_f1": test_weighted_f1,
    "test_roc_auc": test_roc_auc,
    "random_state": RANDOM_STATE,
}


final_model_path = (
    MODEL_DIR
    / "final_binary_readmission_model.joblib"
)


joblib.dump(
    final_model_package,
    final_model_path,
)


# ============================================================
# SAVE FINAL TEST METRICS
# ============================================================

final_metrics = pd.DataFrame(
    [
        {
            "model": "HistGradientBoosting",
            "accuracy": test_accuracy,
            "macro_f1": test_macro_f1,
            "weighted_f1": test_weighted_f1,
            "roc_auc": test_roc_auc,
            "selection_metric":
                "validation_macro_f1",
        }
    ]
)

final_metrics_path = (
    EVALUATION_DIR
    / "final_readmission_model_metrics.csv"
)

final_metrics.to_csv(
    final_metrics_path,
    index=False,
)


# ============================================================
# COMPLETION
# ============================================================

print("\n" + "=" * 70)
print("FINAL MODEL SAVED")
print("=" * 70)

print("\nModel:")
print(final_model_path)

print("\nValidation tuning results:")
print(results_path)

print("\nFinal test metrics:")
print(final_metrics_path)

print(
    "\nValidation-based tuning and "
    "unbiased test evaluation completed successfully."
)

print("=" * 70)