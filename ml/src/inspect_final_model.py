from pathlib import Path

import joblib


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "final_threshold_optimized_readmission_model.joblib"
)


print("=" * 70)
print("HealthForecast AI - Final Model Inspection")
print("=" * 70)

print("\nModel path:")
print(MODEL_PATH)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Final model not found at: {MODEL_PATH}"
    )

print("\nLoading model...")
model_object = joblib.load(MODEL_PATH)

print("\nObject type:")
print(type(model_object))

print("\nObject representation:")
print(model_object)

print("\nInspection completed.")
print("=" * 70)