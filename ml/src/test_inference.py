from pathlib import Path

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "final_threshold_optimized_readmission_model.joblib"
)

DATA_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "cleaned_diabetic_data.csv"
)


print("=" * 70)
print("HealthForecast AI - Final Model Inference Test")
print("=" * 70)


# ---------------------------------------------------------
# 1. Load final model bundle
# ---------------------------------------------------------

print("\nLoading final model...")

bundle = joblib.load(MODEL_PATH)

model = bundle["model"]
preprocessor = bundle["preprocessor"]
feature_columns = bundle["feature_columns"]
threshold = bundle["decision_threshold"]
class_mapping = bundle["class_mapping"]


print("Model loaded successfully.")
print(f"Model type       : {type(model).__name__}")
print(f"Feature count    : {len(feature_columns)}")
print(f"Decision threshold: {threshold:.2f}")
print(f"Class mapping    : {class_mapping}")


# ---------------------------------------------------------
# 2. Load processed dataset
# ---------------------------------------------------------

print("\nLoading processed dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset shape    : {df.shape}")


# ---------------------------------------------------------
# 3. Select one real patient record
# ---------------------------------------------------------

sample = df.iloc[[0]].copy()

actual_target = sample["readmitted"].iloc[0]

X_sample = sample.drop(
    columns=["readmitted"],
    errors="ignore"
)


# ---------------------------------------------------------
# 4. Make sure feature columns match training
# ---------------------------------------------------------

missing_features = [
    column
    for column in feature_columns
    if column not in X_sample.columns
]

if missing_features:
    raise ValueError(
        "Missing model features:\n"
        + "\n".join(missing_features)
    )


X_sample = X_sample[feature_columns]


print("\nInput feature matrix:")
print(f"Shape            : {X_sample.shape}")


# ---------------------------------------------------------
# 5. Apply saved preprocessing
# ---------------------------------------------------------

print("\nApplying saved preprocessing...")

X_processed = preprocessor.transform(X_sample)

print("Preprocessing completed.")
print(f"Processed shape   : {X_processed.shape}")


# ---------------------------------------------------------
# 6. Generate probability
# ---------------------------------------------------------

print("\nGenerating readmission probability...")

probability = model.predict_proba(X_processed)[0, 1]


# ---------------------------------------------------------
# 7. Apply optimized threshold
# ---------------------------------------------------------

prediction = int(probability >= threshold)


# ---------------------------------------------------------
# 8. Display result
# ---------------------------------------------------------

prediction_label = class_mapping[prediction]

print("\n" + "=" * 70)
print("PREDICTION RESULT")
print("=" * 70)

print(f"Actual dataset label       : {actual_target}")
print(f"Readmission probability    : {probability:.4f}")
print(f"Decision threshold         : {threshold:.2f}")
print(f"Predicted class            : {prediction}")
print(f"Predicted outcome          : {prediction_label}")

print("=" * 70)
print("Inference test completed successfully.")
print("=" * 70)