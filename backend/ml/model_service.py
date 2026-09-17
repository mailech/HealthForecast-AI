import os
import joblib


MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "readmission_model.joblib"
)


_model = None


def load_model():
    global _model

    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"ML model not found:\n{MODEL_PATH}"
            )

        print("Loading readmission model...")
        _model = joblib.load(MODEL_PATH)
        print("Readmission model loaded successfully.")

    return _model


def get_model():
    if _model is None:
        raise RuntimeError(
            "ML model has not been loaded."
        )

    return _model


def predict_readmission(data):
    model = get_model()

    probabilities = model.predict_proba(data)

    risk_score = float(probabilities[0][1])

    if risk_score >= 0.40:
        risk_level = "High"
        recommendation = (
            "High predicted readmission risk. "
            "Monitor the patient closely and review "
            "follow-up requirements."
        )
    elif risk_score >= 0.20:
        risk_level = "Medium"
        recommendation = (
            "Moderate predicted readmission risk. "
            "Monitor the patient closely and review "
            "follow-up requirements."
        )
    else:
        risk_level = "Low"
        recommendation = (
            "Low predicted readmission risk. "
            "Continue routine monitoring and follow-up."
        )

    return {
        "risk_score": round(risk_score, 4),
        "risk_level": risk_level,
        "recommendation": recommendation,
    }  