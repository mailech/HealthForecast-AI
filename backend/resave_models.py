import os
import joblib
import warnings

# Suppress the warnings during loading so we can resave cleanly
warnings.filterwarnings("ignore", category=UserWarning)

try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass

MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_model")

def resave():
    print("Loading models (warnings suppressed)...")
    model = joblib.load(os.path.join(MODEL_DIR, "xgboost_readmission_model.pkl"))
    encoder = joblib.load(os.path.join(MODEL_DIR, "onehot_encoder.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "standard_scaler.pkl"))
    
    print("Resaving models with current library versions...")
    joblib.dump(model, os.path.join(MODEL_DIR, "xgboost_readmission_model.pkl"))
    joblib.dump(encoder, os.path.join(MODEL_DIR, "onehot_encoder.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "standard_scaler.pkl"))
    print("Done. Models resaved.")

if __name__ == "__main__":
    resave()
