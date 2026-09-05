import json
from typing import Any, Dict, List, Optional

import pandas as pd
from sqlalchemy.orm import Session

from app.config import settings
from app.models.patient import Admission, MedicalHistory, Patient, Treatment
from app.models.user import User, UserRole
from app.ml.clinical_insights import ClinicalInsightsEngine
from app.ml.predictor import DataPreprocessor, ModelTrainer, PredictionEngine
from app.models.prediction import ReadmissionForecast, RiskPrediction
from app.services.names import generate_patient_name


def patient_to_dict(patient: Patient) -> Dict[str, Any]:
    return {
        "race": patient.race,
        "gender": patient.gender,
        "age": patient.age,
        "admission_type_id": patient.admission_type_id,
        "discharge_disposition_id": patient.discharge_disposition_id,
        "admission_source_id": patient.admission_source_id,
        "time_in_hospital": patient.time_in_hospital,
        "num_lab_procedures": patient.num_lab_procedures,
        "num_procedures": patient.num_procedures,
        "num_medications": patient.num_medications,
        "number_outpatient": patient.number_outpatient,
        "number_emergency": patient.number_emergency,
        "number_inpatient": patient.number_inpatient,
        "number_diagnoses": patient.number_diagnoses,
        "max_glu_serum": patient.max_glu_serum,
        "a1cresult": patient.a1cresult,
        "change": patient.change,
        "diabetes_med": patient.diabetes_med,
    }


def anonymize_patient(patient: Patient) -> Dict[str, Any]:
    return {
        "id": patient.id,
        "patient_id": f"ANON-{patient.id:06d}",
        "full_name": None,
        "age": patient.age,
        "gender": patient.gender,
        "time_in_hospital": patient.time_in_hospital,
        "num_medications": patient.num_medications,
        "number_diagnoses": patient.number_diagnoses,
        "readmitted": patient.readmitted,
        "created_at": patient.created_at,
    }


def backfill_patient_names(db: Session) -> int:
    patients = db.query(Patient).all()
    updated = 0
    for patient in patients:
        if not patient.full_name:
            patient.full_name = generate_patient_name(patient.patient_id, patient.gender)
            updated += 1
    if updated:
        db.commit()
    return updated


class DatasetService:
    @staticmethod
    def load_and_import(db: Session, limit: Optional[int] = 500) -> Dict[str, int]:
        path = settings.dataset_path
        df = DataPreprocessor.load_dataset(path)
        if limit:
            df = df.head(limit)

        imported = 0
        for _, row in df.iterrows():
            existing = db.query(Patient).filter(Patient.patient_id == str(row["encounter_id"])).first()
            if existing:
                continue

            def val(key, default=None):
                v = row.get(key, default)
                if v is None or (isinstance(v, float) and pd.isna(v)):
                    return default
                if pd.isna(v):
                    return default
                return v

            def intval(key):
                v = val(key)
                if v is None:
                    return None
                try:
                    return int(v)
                except (TypeError, ValueError):
                    return None

            patient = Patient(
                patient_id=str(row["encounter_id"]),
                full_name=generate_patient_name(str(row["encounter_id"]), val("gender")),
                race=val("race"),
                gender=val("gender"),
                age=val("age"),
                weight=val("weight"),
                admission_type_id=intval("admission_type_id"),
                discharge_disposition_id=intval("discharge_disposition_id"),
                admission_source_id=intval("admission_source_id"),
                time_in_hospital=intval("time_in_hospital"),
                payer_code=str(val("payer_code") or ""),
                medical_specialty=str(val("medical_specialty") or ""),
                num_lab_procedures=intval("num_lab_procedures"),
                num_procedures=intval("num_procedures"),
                num_medications=intval("num_medications"),
                number_outpatient=intval("number_outpatient"),
                number_emergency=intval("number_emergency"),
                number_inpatient=intval("number_inpatient"),
                number_diagnoses=intval("number_diagnoses"),
                max_glu_serum=str(val("max_glu_serum") or ""),
                a1cresult=str(val("A1Cresult") or ""),
                change=str(val("change") or ""),
                diabetes_med=str(val("diabetesMed") or ""),
                readmitted=str(val("readmitted") or ""),
                diag_1=str(val("diag_1") or ""),
                diag_2=str(val("diag_2") or ""),
                diag_3=str(val("diag_3") or ""),
            )
            db.add(patient)
            db.flush()

            if patient.diag_1:
                db.add(MedicalHistory(
                    patient_id=patient.id,
                    condition="Primary Diagnosis",
                    diagnosis_code=patient.diag_1,
                ))

            db.add(Admission(
                patient_id=patient.id,
                admission_type=f"Type {patient.admission_type_id}",
                length_of_stay=patient.time_in_hospital or 0,
                readmitted_within_30=patient.readmitted == "<30",
            ))

            imported += 1

        db.commit()
        backfill_patient_names(db)
        return {"imported": imported, "total_in_dataset": len(df)}


class PredictionService:
    def __init__(self):
        self.engine = PredictionEngine()
        self.insights_engine = ClinicalInsightsEngine()

    def predict_risk(self, db: Session, patient: Patient, model_type: str = "random_forest") -> RiskPrediction:
        result = self.engine.predict(patient_to_dict(patient), model_type)
        insights = self.insights_engine.generate_insights(
            patient,
            result["risk_score"],
            result["risk_category"],
            result["readmission_probability"],
            result.get("feature_importance", {}),
        )

        prediction = RiskPrediction(
            patient_id=patient.id,
            risk_score=result["risk_score"],
            risk_category=result["risk_category"],
            readmission_probability=result["readmission_probability"],
            model_used=result["model_used"],
            feature_importance=json.dumps(result.get("feature_importance", {})),
            clinical_insights=json.dumps(insights["clinical_insights"]),
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction

    def forecast_readmission(
        self, db: Session, patient: Patient, period_days: int = 30
    ) -> ReadmissionForecast:
        result = self.engine.predict(patient_to_dict(patient), "random_forest")
        insights = self.insights_engine.generate_insights(
            patient,
            result["risk_score"],
            result["risk_category"],
            result["readmission_probability"],
            result.get("feature_importance", {}),
        )

        report = self.insights_engine.generate_forecast_report(
            patient,
            result["readmission_probability"],
            insights["key_risk_factors"],
            insights["care_recommendations"],
            period_days,
        )

        forecast = ReadmissionForecast(
            patient_id=patient.id,
            forecast_period_days=period_days,
            readmission_probability=result["readmission_probability"],
            confidence_score=min(result["readmission_probability"] + 0.1, 0.99),
            risk_factors=json.dumps(insights["key_risk_factors"]),
            recommendations=json.dumps(insights["care_recommendations"]),
            forecast_report=report,
        )
        db.add(forecast)
        db.commit()
        db.refresh(forecast)
        return forecast

    def get_dashboard_stats(self, db: Session, user: User) -> Dict[str, Any]:
        query = db.query(Patient)
        if user.role == UserRole.DOCTOR:
            query = query.filter(Patient.assigned_doctor_id == user.id)

        patients = query.all()
        total = len(patients)

        latest_predictions = (
            db.query(RiskPrediction)
            .join(Patient)
            .order_by(RiskPrediction.created_at.desc())
            .limit(100)
            .all()
        )

        if user.role == UserRole.DOCTOR:
            patient_ids = {p.id for p in patients}
            latest_predictions = [p for p in latest_predictions if p.patient_id in patient_ids]

        high = sum(1 for p in latest_predictions if p.risk_category == "High")
        medium = sum(1 for p in latest_predictions if p.risk_category == "Medium")
        low = sum(1 for p in latest_predictions if p.risk_category == "Low")

        avg_prob = (
            sum(p.readmission_probability for p in latest_predictions) / len(latest_predictions)
            if latest_predictions else 0
        )

        readmitted = sum(1 for p in patients if p.readmitted == "<30")
        readmission_rate = (readmitted / total * 100) if total else 0

        metrics = PredictionEngine.load_metrics("random_forest") or {}

        return {
            "total_patients": total,
            "high_risk_patients": high,
            "medium_risk_patients": medium,
            "low_risk_patients": low,
            "avg_readmission_probability": round(avg_prob * 100, 2),
            "readmission_rate": round(readmission_rate, 2),
            "recent_predictions": len(latest_predictions),
            "model_accuracy": metrics.get("accuracy", 0) * 100,
        }
