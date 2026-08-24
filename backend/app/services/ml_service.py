from pathlib import Path

import joblib
import pandas as pd


class MLService:
    """Service handling ML inference & risk prediction."""

    MODEL_PATH = (
        Path(__file__).resolve().parents[3]
        / "ml_pipeline"
        / "models"
        / "patient_risk_model.joblib"
    )

    RISK_LABELS = {
        0: "Low",
        1: "Medium",
        2: "High",
    }

    _model = None

    @classmethod
    def load_model(cls):
        """Load the trained ML pipeline."""

        if cls._model is None:
            if not cls.MODEL_PATH.exists():
                raise FileNotFoundError(
                    f"Trained model not found: {cls.MODEL_PATH}"
                )

            cls._model = joblib.load(cls.MODEL_PATH)

        return cls._model

    @classmethod
    async def predict_readmission_risk(cls, prediction_data):

        model = cls.load_model()

        data = prediction_data.model_dump()

        # patient_id is not an ML feature
        data.pop("patient_id", None)

        # Convert API field names to original dataset column names
        data["glyburide-metformin"] = data.pop(
            "glyburide_metformin"
        )
        data["glipizide-metformin"] = data.pop(
            "glipizide_metformin"
        )
        data["glimepiride-pioglitazone"] = data.pop(
            "glimepiride_pioglitazone"
        )
        data["metformin-rosiglitazone"] = data.pop(
            "metformin_rosiglitazone"
        )
        data["metformin-pioglitazone"] = data.pop(
            "metformin_pioglitazone"
        )

        patient_df = pd.DataFrame([data])

        prediction = model.predict(patient_df)
        predicted_class = int(prediction[0])

        probabilities = model.predict_proba(patient_df)[0]

        risk_category = cls.RISK_LABELS.get(
            predicted_class,
            "Unknown"
        )

        probability_map = {
            cls.RISK_LABELS.get(int(model_class), "Unknown"): round(float(probability) * 100, 2)
            for model_class, probability in zip(model.classes_, probabilities)
        }
        high_risk_probability = probability_map.get("High", 0.0)
        risk_score = round(
            high_risk_probability,
            2
        )

        return {
            "readmission_risk_score": risk_score,
            "risk_category": risk_category,
            "model_version": "patient-risk-model-v1.0.0",
            "probabilities": probability_map,
        }