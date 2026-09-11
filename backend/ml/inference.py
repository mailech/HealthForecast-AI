import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.joblib")
XGBOOST_MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_model.joblib")


RISK_THRESHOLDS = {
    "LOW_MAX": 0.30,
    "MEDIUM_MAX": 0.60
}

CLINICAL_DISCLAIMER = (
    "HealthForecast AI provides machine learning risk estimates and clinical decision-support "
    "suggestions ONLY. It is NOT a medical diagnostic tool or a substitute for professional clinical judgment."
)

class HealthForecastInferenceEngine:
    _instance = None

    def __init__(self):
        self.preprocessor = None
        self.model = None
        self.model_name = "XGBoost Readmission Classifier"
        self.model_version = "v1.0.0-xgb"
        self.load_artifacts()

    @classmethod
    def get_instance(cls) -> 'HealthForecastInferenceEngine':
        if cls._instance is None:
            cls._instance = HealthForecastInferenceEngine()
        return cls._instance

    def load_artifacts(self):
        """Load preprocessor and XGBoost model artifacts from disk."""
        if not os.path.exists(PREPROCESSOR_PATH):
            raise FileNotFoundError(f"Preprocessor artifact missing at {PREPROCESSOR_PATH}")
        if not os.path.exists(XGBOOST_MODEL_PATH):
            raise FileNotFoundError(f"XGBoost model artifact missing at {XGBOOST_MODEL_PATH}")
            
        self.preprocessor = joblib.load(PREPROCESSOR_PATH)
        self.model = joblib.load(XGBOOST_MODEL_PATH)
        # Cache feature importances array and feature names to avoid repeated property access
        self.feature_importances = getattr(self.model, "feature_importances_", None)
        self.feature_names = getattr(self.preprocessor, "feature_names", [])

    def determine_risk_category(self, probability: float) -> str:
        """Classify model readmission risk probability into configurable risk categories."""
        if probability < RISK_THRESHOLDS["LOW_MAX"]:
            return "Low Risk"
        elif probability < RISK_THRESHOLDS["MEDIUM_MAX"]:
            return "Medium Risk"
        else:
            return "High Risk"

    def format_input_dataframe(self, raw_data: Dict[str, Any]) -> pd.DataFrame:
        """Format input clinical dictionary into pandas DataFrame expected by preprocessor."""
        # Baseline schema dictionary matching raw dataset features
        record = {
            "race": str(raw_data.get("race", "Caucasian")),
            "gender": str(raw_data.get("gender", "Female")),
            "age": str(raw_data.get("age", "[50-60)")),
            "admission_type_id": str(raw_data.get("admission_type_id", "1")),
            "discharge_disposition_id": str(raw_data.get("discharge_disposition_id", "1")), # Filtered/Ignored by preprocessor
            "admission_source_id": str(raw_data.get("admission_source_id", "7")),
            "time_in_hospital": int(raw_data.get("time_in_hospital", 3)),
            "payer_code": str(raw_data.get("payer_code", "?")),
            "medical_specialty": str(raw_data.get("medical_specialty", "?")),
            "num_lab_procedures": int(raw_data.get("num_lab_procedures", 40)),
            "num_procedures": int(raw_data.get("num_procedures", 1)),
            "num_medications": int(raw_data.get("num_medications", 12)),
            "number_outpatient": int(raw_data.get("number_outpatient", 0)),
            "number_emergency": int(raw_data.get("number_emergency", 0)),
            "number_inpatient": int(raw_data.get("number_inpatient", 0)),
            "diag_1": str(raw_data.get("diag_1", "414")),
            "diag_2": str(raw_data.get("diag_2", "250")),
            "diag_3": str(raw_data.get("diag_3", "401")),
            "number_diagnoses": int(raw_data.get("number_diagnoses", 5)),
            "max_glu_serum": str(raw_data.get("max_glu_serum", "None")),
            "A1Cresult": str(raw_data.get("A1Cresult", "None")),
            "change": str(raw_data.get("change", "No")),
            "diabetesMed": str(raw_data.get("diabetesMed", "Yes")),
            "target": 0  # Dummy target required by preprocessor feature extraction interface
        }
        
        # Add 23 active medications (default 'No' if not supplied)
        meds = [
            'metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 'glimepiride',
            'acetohexamide', 'glipizide', 'glyburide', 'tolbutamide', 'pioglitazone',
            'rosiglitazone', 'acarbose', 'miglitol', 'troglitazone', 'tolazamide',
            'examide', 'citoglipton', 'insulin', 'glyburide-metformin',
            'glipizide-metformin', 'glimepiride-pioglitazone',
            'metformin-rosiglitazone', 'metformin-pioglitazone'
        ]
        for m in meds:
            record[m] = str(raw_data.get(m, "No"))

        return pd.DataFrame([record])

    def extract_top_risk_factors(self, X_row: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        """Identify top contributing feature importances for this specific prediction."""
        if self.feature_importances is None or len(self.feature_names) == 0:
            return []
            
        importances = self.feature_importances
        feature_names = self.feature_names
        
        # Multiply non-zero features in record by global importance weight
        contributions = []
        row_vals = X_row[0]
        for i, val in enumerate(row_vals):
            if val != 0:
                imp = float(importances[i])
                if imp > 0:
                    contributions.append({
                        "feature": feature_names[i],
                        "value": float(val),
                        "importance_weight": round(imp, 4)
                    })
                    
        # Sort by importance weight descending
        contributions.sort(key=lambda x: x["importance_weight"], reverse=True)
        return contributions[:top_k]

    def predict(self, raw_encounter_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate readmission prediction probability, risk score, risk level, and metadata."""
        df_input = self.format_input_dataframe(raw_encounter_data)
        X_trans, _ = self.preprocessor.transform(df_input)
        
        # Predict probability of class 1 (<30 days readmission)
        prob = float(self.model.predict_proba(X_trans)[0, 1])
        prob = max(0.0, min(1.0, prob))  # Bound between [0.0, 1.0]
        
        risk_percentage = round(prob * 100, 2)
        risk_category = self.determine_risk_category(prob)
        prediction_binary = 1 if prob >= 0.50 else 0
        predicted_class_label = "<30" if prediction_binary == 1 else "NO/>30"
        
        top_factors = self.extract_top_risk_factors(X_trans, top_k=5)
        
        return {
            "risk_probability": round(prob, 4),
            "risk_percentage": risk_percentage,
            "risk_category": risk_category,
            "prediction": prediction_binary,
            "predicted_class_label": predicted_class_label,
            "top_risk_factors": top_factors,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "disclaimer": CLINICAL_DISCLAIMER
        }

# Global singleton helper
def get_inference_engine() -> HealthForecastInferenceEngine:
    return HealthForecastInferenceEngine.get_instance()
