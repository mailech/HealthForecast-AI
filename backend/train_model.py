import os
import json
import joblib
import pandas as pd

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


# ============================================================
# HEALTHFORECAST AI
# Model Training Pipeline
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "diabetic_data.csv"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "healthforecast_model.joblib"
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "model_metadata.json"
)


# ============================================================
# 1. FEATURES USED BY THE MODEL
# ============================================================

FEATURES = [
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
    "diag_1",
    "diag_2",
    "diag_3",
    "number_diagnoses",
    "max_glu_serum",
    "A1Cresult",
    "insulin",
    "change",
    "diabetesMed"
]


# ============================================================
# 2. CONVERT AGE RANGE INTO NUMERIC VALUE
# ============================================================

def convert_age(age_value):

    if pd.isna(age_value):
        return None

    age_value = str(age_value)

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
        "[90-100)": 95
    }

    return age_map.get(age_value, None)


# ============================================================
# 3. LOAD DATASET
# ============================================================

def load_dataset():

    print("Loading dataset...")

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Dataset not found at: {DATA_PATH}"
        )

    df = pd.read_csv(
        DATA_PATH,
        na_values=["?", "Unknown/Invalid", "None", ""]
    )

    print(f"Dataset loaded: {df.shape}")

    return df


# ============================================================
# 4. PREPARE DATA
# ============================================================

def prepare_data(df):

    print("Preparing dataset...")

    # Convert age ranges into numerical values
    df["age"] = df["age"].apply(convert_age)

    # Keep only required columns
    X = df[FEATURES].copy()

    # Target:
    #
    # <30  = readmission within 30 days
    # >30  = readmission after 30 days
    # NO   = no readmission
    #
    y = df["readmitted"].copy()

    # Remove rows where target is missing
    valid_rows = y.notna()

    X = X.loc[valid_rows]
    y = y.loc[valid_rows]

    return X, y


# ============================================================
# 5. IDENTIFY DATA TYPES
# ============================================================

def get_preprocessor(X):

    categorical_features = [
        "race",
        "gender",
        "diag_1",
        "diag_2",
        "diag_3",
        "max_glu_serum",
        "A1Cresult",
        "insulin",
        "change",
        "diabetesMed"
    ]

    numerical_features = [
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
        "number_diagnoses"
    ]

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="most_frequent")
            ),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore"
                )
            )
        ]
    )

    numerical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="median")
            )
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                categorical_pipeline,
                categorical_features
            ),
            (
                "numerical",
                numerical_pipeline,
                numerical_features
            )
        ]
    )

    return preprocessor


# ============================================================
# 6. BUILD ML MODEL
# ============================================================

def build_model(X):

    preprocessor = get_preprocessor(X)

    classifier = RandomForestClassifier(
        n_estimators=200,
        max_depth=18,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    model = Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor
            ),
            (
                "classifier",
                classifier
            )
        ]
    )

    return model


# ============================================================
# 7. TRAIN MODEL
# ============================================================

def train_model():

    df = load_dataset()

    X, y = prepare_data(df)

    print(f"Features: {X.shape}")
    print(f"Target distribution:")
    print(y.value_counts())

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")

    model = build_model(X)

    print("\nTraining Random Forest model...")
    model.fit(X_train, y_train)

    print("Training completed.")

    # ========================================================
    # 8. EVALUATION
    # ========================================================

    predictions = model.predict(X_test)

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

    print("\n==============================")
    print("MODEL PERFORMANCE")
    print("==============================")

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    # ========================================================
    # 9. SAVE MODEL
    # ========================================================

    joblib.dump(
        model,
        MODEL_PATH
    )

    print(
        f"\nModel saved to: {MODEL_PATH}"
    )

    # ========================================================
    # 10. SAVE MODEL METADATA
    # ========================================================

    metadata = {
        "model_name": "HealthForecast AI Random Forest",
        "algorithm": "Random Forest Classifier",
        "version": "1.0",
        "dataset_rows": int(len(df)),
        "feature_count": len(FEATURES),
        "features": FEATURES,
        "target": "readmitted",
        "classes": sorted(
            [str(x) for x in y.unique()]
        ),
        "metrics": {
            "accuracy": round(float(accuracy), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4)
        }
    }

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            metadata,
            file,
            indent=4
        )

    print(
        f"Metadata saved to: {METADATA_PATH}"
    )


# ============================================================
# PROGRAM ENTRY
# ============================================================

if __name__ == "__main__":

    train_model()
