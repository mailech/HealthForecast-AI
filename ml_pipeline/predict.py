import joblib
import pandas as pd
from pathlib import Path


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "patient_risk_model.joblib"


# --------------------------------------------------
# Risk labels
# --------------------------------------------------

RISK_LABELS = {
    0: "Low",
    1: "Medium",
    2: "High"
}


# --------------------------------------------------
# Load trained model
# --------------------------------------------------

def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


# --------------------------------------------------
# Predict patient risk
# --------------------------------------------------

def predict_patient_risk(patient_data):
    """
    Predict the readmission risk of a patient.

    patient_data can be a dictionary or a pandas DataFrame.
    """

    model = load_model()

    # Convert dictionary to DataFrame
    if isinstance(patient_data, dict):
        patient_data = pd.DataFrame([patient_data])

    elif not isinstance(patient_data, pd.DataFrame):
        raise TypeError(
            "patient_data must be a dictionary or pandas DataFrame."
        )

    # Make prediction
    prediction = model.predict(patient_data)

    predicted_class = int(prediction[0])

    # Convert prediction into risk category
    risk_category = RISK_LABELS.get(
        predicted_class,
        "Unknown"
    )

    # Get prediction probabilities
    probabilities = model.predict_proba(patient_data)[0]

    probability_map = {
        "Low": round(float(probabilities[0]) * 100, 2),
        "Medium": round(float(probabilities[1]) * 100, 2),
        "High": round(float(probabilities[2]) * 100, 2)
    }

    # Highest probability as risk score
    risk_probability = round(
        float(max(probabilities)) * 100,
        2
    )

    return {
        "prediction": predicted_class,
        "risk_category": risk_category,
        "risk_score": risk_probability,
        "probabilities": probability_map
    }


# --------------------------------------------------
# Test prediction
# --------------------------------------------------

if __name__ == "__main__":

    print("Loading patient risk prediction model...")

    model = load_model()

    print("Model loaded successfully.")
    print(f"Model path: {MODEL_PATH}")