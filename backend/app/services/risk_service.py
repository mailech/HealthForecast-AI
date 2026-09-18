import os
import json
import joblib
import numpy as np
from datetime import datetime
from app.schemas.schemas import PredictionInput, PredictionResult, KeyFactor

class ClinicalRiskService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.metadata = {}
        self._load_artifacts()

    def _load_artifacts(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "ml", "readmission_model.joblib")
        scaler_path = os.path.join(base_dir, "ml", "scaler.joblib")
        meta_path = os.path.join(base_dir, "ml", "metadata.json")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                print(f"[+] Loaded ML Model from {model_path}")
            except Exception as e:
                print(f"[!] Warning: Failed to load model artifact ({e}).")

        if os.path.exists(meta_path):
            with open(meta_path, 'r') as f:
                self.metadata = json.load(f)

    def calculate_risk(self, data: PredictionInput) -> PredictionResult:
        features = np.array([[
            data.time_in_hospital,
            data.num_lab_procedures,
            data.num_procedures,
            data.num_medications,
            data.number_outpatient,
            data.number_emergency,
            data.number_inpatient,
            data.number_diagnoses
        ]])

        if self.model and self.scaler:
            try:
                scaled_features = self.scaler.transform(features)
                prob = float(self.model.predict_proba(scaled_features)[0][1])
                confidence = float(self.metadata.get("metrics", {}).get("roc_auc", 0.65))
            except Exception as e:
                print(f"Prediction error: {e}")
                prob = 0.5
                confidence = 0.5
        else:
            prob = 0.5
            confidence = 0.5

        risk_score = round(prob * 100, 1)

        # Load configurable thresholds from metadata
        thresholds = self.metadata.get("thresholds", {"low_medium": 0.4, "medium_high": 0.7})
        low_medium_thresh = thresholds["low_medium"] * 100
        medium_high_thresh = thresholds["medium_high"] * 100

        if risk_score >= medium_high_thresh:
            risk_level = "High"
        elif risk_score >= low_medium_thresh:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Explainability: Top contributing factors based on clinical rules
        key_factors = []
        recommendations = []

        if data.number_inpatient >= 2:
            key_factors.append(KeyFactor(
                factor="High Prior Inpatient Admissions",
                impact="High",
                value=f"{data.number_inpatient} recent inpatient visits"
            ))
            recommendations.append("Assign dedicated post-discharge care manager.")

        if data.number_emergency >= 2:
            key_factors.append(KeyFactor(
                factor="Frequent Emergency Visits",
                impact="High",
                value=f"{data.number_emergency} ER visits"
            ))
            recommendations.append("Schedule priority outpatient follow-up within 7 days.")

        if data.num_medications > 20:
            key_factors.append(KeyFactor(
                factor="High Number of Medications",
                impact="Moderate",
                value=f"{data.num_medications} medications prescribed"
            ))
            recommendations.append("Clinical pharmacist medication reconciliation.")

        if data.time_in_hospital > 7:
            key_factors.append(KeyFactor(
                factor="Extended Length of Stay",
                impact="Moderate",
                value=f"{data.time_in_hospital} days in hospital"
            ))
            recommendations.append("Ensure robust discharge support plan.")

        if not key_factors:
            key_factors.append(KeyFactor(
                factor="Standard Clinical Profile",
                impact="Low",
                value="Metrics within typical baseline ranges"
            ))
            recommendations.append("Standard discharge instruction checklist.")

        return PredictionResult(
            patient_id=data.patient_id,
            risk_score=risk_score,
            risk_level=risk_level,
            confidence=confidence,
            key_factors=key_factors,
            recommendations=recommendations,
            created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        )

risk_service = ClinicalRiskService()
