import pandas as pd
import joblib

from pathlib import Path

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
    classification_report
)


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = BASE_DIR / "dataset" / "processed_diabetes.csv"

MODELS_DIR = BASE_DIR / "models"

MODEL_PATH = MODELS_DIR / "patient_risk_model.joblib"


# --------------------------------------------------
# Load processed dataset
# --------------------------------------------------

def load_data():

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Processed dataset not found: {DATASET_PATH}"
        )

    data = pd.read_csv(DATASET_PATH)

    return data


# --------------------------------------------------
# Train model
# --------------------------------------------------

def train_model():

    print("Loading processed dataset...")

    data = load_data()

    print(f"Dataset shape: {data.shape}")


    # --------------------------------------------------
    # Separate features and target
    # --------------------------------------------------

    X = data.drop(columns=["readmitted"])

    y = data["readmitted"]


    # --------------------------------------------------
    # Identify categorical and numerical columns
    # --------------------------------------------------

    categorical_columns = X.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    numerical_columns = X.select_dtypes(
        include=["number"]
    ).columns.tolist()


    print(
        f"Categorical columns: {len(categorical_columns)}"
    )

    print(
        f"Numerical columns: {len(numerical_columns)}"
    )


    # --------------------------------------------------
    # Numerical preprocessing
    # --------------------------------------------------

    numerical_transformer = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="median")
            )
        ]
    )


    # --------------------------------------------------
    # Categorical preprocessing
    # --------------------------------------------------

    categorical_transformer = Pipeline(
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


    # --------------------------------------------------
    # Combine preprocessing
    # --------------------------------------------------

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                numerical_transformer,
                numerical_columns
            ),

            (
                "cat",
                categorical_transformer,
                categorical_columns
            )
        ]
    )


    # --------------------------------------------------
    # Random Forest model
    # --------------------------------------------------

    model = RandomForestClassifier(

        n_estimators=200,

        random_state=42,

        class_weight="balanced",

        n_jobs=-1
    )


    # --------------------------------------------------
    # Full ML pipeline
    # --------------------------------------------------

    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor
            ),

            (
                "model",
                model
            )
        ]
    )


    # --------------------------------------------------
    # Train / Test split
    # --------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(

        X,

        y,

        test_size=0.20,

        random_state=42,

        stratify=y
    )


    print()
    print("Training model...")
    print()


    # --------------------------------------------------
    # Train
    # --------------------------------------------------

    pipeline.fit(
        X_train,
        y_train
    )


    # --------------------------------------------------
    # Predictions
    # --------------------------------------------------

    predictions = pipeline.predict(
        X_test
    )


    # --------------------------------------------------
    # Evaluation
    # --------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )


    print("Model Performance")
    print("-------------------------")

    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print(
        f"Precision: {precision:.4f}"
    )

    print(
        f"Recall: {recall:.4f}"
    )

    print(
        f"F1 Score: {f1:.4f}"
    )


    print()
    print("Classification Report")
    print("-------------------------")

    print(
        classification_report(
            y_test,
            predictions
        )
    )


    # --------------------------------------------------
    # Save model
    # --------------------------------------------------

    MODELS_DIR.mkdir(
        exist_ok=True
    )

    joblib.dump(
        pipeline,
        MODEL_PATH
    )


    print()
    print("Model training completed successfully!")

    print(
        f"Model saved to: {MODEL_PATH}"
    )


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    train_model()