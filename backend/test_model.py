import joblib
import json
import os

MODEL_DIR = "ml_model"

model = joblib.load(os.path.join(MODEL_DIR, "xgboost_readmission_model.pkl"))
encoder = joblib.load(os.path.join(MODEL_DIR, "onehot_encoder.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "standard_scaler.pkl"))

with open(os.path.join(MODEL_DIR, "feature_columns.json")) as f:
    feature_info = json.load(f)

print("Model loaded successfully:", type(model).__name__)
print("Encoder loaded successfully:", type(encoder).__name__)
print("Scaler loaded successfully:", type(scaler).__name__)
print("Number of categorical columns:", len(feature_info['categorical_cols']))
print("Number of numerical columns:", len(feature_info['numerical_cols']))
print("Total final features expected:", len(feature_info['final_feature_names']))
