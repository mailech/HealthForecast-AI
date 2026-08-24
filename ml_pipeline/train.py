import sys
import json
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

    model = load_model()

    if isinstance(patient_data, dict):
        patient_data = pd.DataFrame([patient_data])

    elif not isinstance(patient_data, pd.DataFrame):
        raise TypeError(
            "patient_data must be a dictionary or pandas DataFrame."
        )

    # Make prediction
    prediction = model.predict(patient_data)
    predicted_class = int(prediction[0])

    risk_category = RISK_LABELS.get(
        predicted_class,
        "Unknown"
    )

    # Prediction probabilities
    probabilities = model.predict_proba(patient_data)[0]

    probability_map = {
        "Low": round(float(probabilities[0]) * 100, 2),
        "Medium": round(float(probabilities[1]) * 100, 2),
        "High": round(float(probabilities[2]) * 100, 2)
    }

    risk_score = round(
        float(max(probabilities)) * 100,
        2
    )

    return {
        "prediction": predicted_class,
        "risk_category": risk_category,
        "risk_score": risk_score,
        "probabilities": probability_map
    }


# --------------------------------------------------
# Command-line input
# --------------------------------------------------

def main():

    # Node.js will send patient data as JSON
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Patient data was not provided."
        }))
        sys.exit(1)

    try:
        patient_data = json.loads(sys.argv[1])

        result = predict_patient_risk(patient_data)

        # IMPORTANT:
        # Only JSON is printed so Node.js can read it.
        print(json.dumps(result))

    except Exception as error:

        print(json.dumps({
            "error": str(error)
        }))

        sys.exit(1)


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":
    main()