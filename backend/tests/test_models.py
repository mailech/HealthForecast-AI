import os
import joblib
import numpy as np
import pytest
from app.core.config import settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")

@pytest.fixture(scope="session")
def model_artifacts():
    preprocessor_path = os.path.join(MODELS_DIR, "preprocessor.joblib")
    rf_path = os.path.join(MODELS_DIR, "random_forest_model.joblib")
    xgb_path = os.path.join(MODELS_DIR, "xgboost_model.joblib")
    
    assert os.path.exists(preprocessor_path), f"Preprocessor not found at {preprocessor_path}"
    assert os.path.exists(rf_path), f"RF model not found at {rf_path}"
    assert os.path.exists(xgb_path), f"XGB model not found at {xgb_path}"
    
    preprocessor = joblib.load(preprocessor_path)
    rf_model = joblib.load(rf_path)
    xgb_model = joblib.load(xgb_path)
    
    return {
        "preprocessor": preprocessor,
        "rf_model": rf_model,
        "xgb_model": xgb_model
    }

def test_models_exist(model_artifacts):
    assert model_artifacts["rf_model"] is not None
    assert model_artifacts["xgb_model"] is not None
    assert model_artifacts["preprocessor"] is not None

def test_preprocessor_transform(model_artifacts):
    preprocessor = model_artifacts["preprocessor"]
    raw_df = preprocessor.load_and_clean_raw_dataset(settings.DATASET_PATH)
    sample_df = raw_df.head(10)
    
    X_sample, y_sample = preprocessor.transform(sample_df)
    assert X_sample.shape[0] == 10
    assert X_sample.shape[1] == len(preprocessor.feature_names)

def test_model_inference_probabilities(model_artifacts):
    preprocessor = model_artifacts["preprocessor"]
    rf_model = model_artifacts["rf_model"]
    xgb_model = model_artifacts["xgb_model"]
    
    raw_df = preprocessor.load_and_clean_raw_dataset(settings.DATASET_PATH)
    sample_df = raw_df.head(10)
    X_sample, _ = preprocessor.transform(sample_df)
    
    rf_probs = rf_model.predict_proba(X_sample)[:, 1]
    xgb_probs = xgb_model.predict_proba(X_sample)[:, 1]
    
    assert len(rf_probs) == 10
    assert len(xgb_probs) == 10
    assert np.all((rf_probs >= 0.0) & (rf_probs <= 1.0))
    assert np.all((xgb_probs >= 0.0) & (xgb_probs <= 1.0))
