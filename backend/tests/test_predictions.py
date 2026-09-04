import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.prediction_service import ClinicalRiskEngine
from app.schemas.prediction import PredictionRequest
from app.core.database import SessionLocal

client = TestClient(app)


def test_clinical_risk_engine_calculation():
    db = SessionLocal()
    try:
        engine = ClinicalRiskEngine(db)
        req = PredictionRequest(
            age=72,
            time_in_hospital=8,
            num_lab_procedures=65,
            num_procedures=3,
            num_medications=20,
            number_inpatient=2,
            number_emergency=1,
            a1c_result=">8"
        )
        res = engine.calculate_risk(req)
        
        assert res["risk_score"] > 50.0
        assert res["risk_level"] in ["High", "Medium"]
        assert res["readmission_probability"] >= 0.5
        assert len(res["risk_factors"]) > 0
        assert len(res["clinical_recommendations"]) > 0
    finally:
        db.close()


def test_evaluate_model_performance():
    db = SessionLocal()
    try:
        engine = ClinicalRiskEngine(db)
        metrics = engine.evaluate_model_performance()
        
        assert metrics.overall_accuracy >= 0.70
        assert metrics.roc_auc >= 0.70
        assert metrics.confusion_matrix.true_positive >= 0
        assert len(metrics.feature_importances) > 0
        assert len(metrics.model_benchmarks) >= 3
    finally:
        db.close()


def test_readmission_forecasting_trends():
    db = SessionLocal()
    try:
        engine = ClinicalRiskEngine(db)
        forecast = engine.get_readmission_forecasting()
        
        assert forecast["baseline_readmission_rate"] > 0
        assert forecast["projected_readmission_rate"] < forecast["baseline_readmission_rate"]
        assert len(forecast["monthly_trends"]) == 6
        assert len(forecast["department_forecasting"]) >= 3
    finally:
        db.close()


def test_clinical_insights_correlations():
    db = SessionLocal()
    try:
        engine = ClinicalRiskEngine(db)
        insights = engine.get_clinical_insights()
        
        assert len(insights["biomarker_correlations"]) >= 3
        assert len(insights["intervention_success_rates"]) >= 3
        assert len(insights["active_clinical_red_flags"]) >= 1
    finally:
        db.close()


def test_pdf_report_generation():
    db = SessionLocal()
    try:
        engine = ClinicalRiskEngine(db)
        pdf_bytes = engine.generate_pdf_report()
        
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF")
    finally:
        db.close()
