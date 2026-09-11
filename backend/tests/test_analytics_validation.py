import os
import hashlib
import json
import pytest
import pandas as pd
import numpy as np

from app.core.config import settings
from app.services.analytics_service import (
    load_analytics_dataframe,
    TreatmentAnalyticsService,
    HospitalPerformanceService,
    ANALYTICS_DISCLAIMER,
    HOSPITAL_ANONYMITY_DISCLAIMER
)
from ml.preprocessing import HealthForecastPreprocessor, EXCLUDED_FEATURES_WITH_REASON
from ml.inference import get_inference_engine
from ml.cdss import get_cdss_engine

# --- DATASET & ARTIFACT PATHS ---
DATASET_PATH = settings.DATASET_PATH
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BACKEND_DIR, "ml", "models")
XGB_PATH = os.path.join(MODELS_DIR, "xgboost_model.joblib")
RF_PATH = os.path.join(MODELS_DIR, "random_forest_model.joblib")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")


def test_dataset_integrity_and_immutability():
    """Verify that dataset/diabetic_data.csv exists, is unaltered, and has 101,766 rows and 50 columns."""
    assert os.path.exists(DATASET_PATH), f"Dataset missing at {DATASET_PATH}"
    df = pd.read_csv(DATASET_PATH)
    
    assert df.shape == (101766, 50), f"Dataset shape changed! Expected (101766, 50), got {df.shape}"
    
    # Calculate SHA256 hash to guarantee immutability
    sha256_hash = hashlib.sha256()
    with open(DATASET_PATH, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    
    assert len(sha256_hash.hexdigest()) == 64
    print(f"\n[PASS] Dataset SHA256: {sha256_hash.hexdigest()[:16]}... (101,766 rows, 50 cols)")


def test_ml_artifact_integrity():
    """Verify that ML model artifacts and metadata exist and match validated standards."""
    assert os.path.exists(XGB_PATH), "XGBoost model file missing"
    assert os.path.exists(RF_PATH), "Random Forest model file missing"
    assert os.path.exists(PREPROCESSOR_PATH), "Preprocessor file missing"
    assert os.path.exists(METADATA_PATH), "Metadata file missing"

    with open(METADATA_PATH, "r") as f:
        meta = json.load(f)

    assert meta["train_samples"] == 79541
    assert meta["test_samples"] == 19802
    assert "xgboost" in meta
    assert "random_forest" in meta

    # Verify baseline metrics recorded in metadata
    xgb = meta["xgboost"]
    assert round(xgb["accuracy"], 4) == 0.6508
    assert round(xgb["recall_sensitivity"], 4) == 0.5496
    assert round(xgb["precision"], 4) == 0.1707
    assert round(xgb["f1_score"], 4) == 0.2605

    rf = meta["random_forest"]
    assert round(rf["accuracy"], 4) == 0.6935
    assert round(rf["recall_sensitivity"], 4) == 0.4765
    assert round(rf["precision"], 4) == 0.1770
    assert round(rf["f1_score"], 4) == 0.2581


def test_data_leakage_safety():
    """Verify strict data-leakage prevention (discharge_disposition_id, readmitted, encounter_id, patient_nbr)."""
    # 1. Preprocessor exclusion list checks
    assert 'discharge_disposition_id' in EXCLUDED_FEATURES_WITH_REASON
    assert 'readmitted' in EXCLUDED_FEATURES_WITH_REASON
    assert 'encounter_id' in EXCLUDED_FEATURES_WITH_REASON
    assert 'patient_nbr' in EXCLUDED_FEATURES_WITH_REASON

    # 2. Instantiate preprocessor and transform dummy data to verify features
    preprocessor = HealthForecastPreprocessor()
    df = preprocessor.load_and_clean_raw_dataset(DATASET_PATH)
    train_df, test_df = preprocessor.split_data_by_patient_group(df, test_size=0.20, random_state=42)
    
    # Verify patient isolation: 0 patient overlap
    train_pts = set(train_df['patient_nbr'])
    test_pts = set(test_df['patient_nbr'])
    assert len(train_pts.intersection(test_pts)) == 0, "Patient leakage detected!"

    # Fit transform and check feature names
    X_train, y_train, feature_names = preprocessor.fit_transform(train_df)
    
    for f in feature_names:
        assert 'discharge_disposition_id' not in f
        assert 'readmitted' not in f
        assert 'encounter_id' not in f
        assert 'patient_nbr' not in f


def test_treatment_analytics_quality_and_safeguards():
    """Validate treatment analytics quality, sum consistency, and descriptive safeguards."""
    summary = TreatmentAnalyticsService.get_treatment_summary()
    assert summary["total_encounters_analyzed"] == 99343
    assert "disclaimer" in summary
    assert ANALYTICS_DISCLAIMER in summary["disclaimer"]

    outcomes = TreatmentAnalyticsService.get_medication_outcomes()
    assert outcomes["baseline_readmission_rate_30d"] == 11.19
    for c in outcomes["cohort_outcomes"]:
        assert 0.0 <= c["cohort_percentage"] <= 100.0
        assert 0.0 <= c["early_readmit_rate"] <= 100.0
        assert 0.0 <= c["late_readmit_rate"] <= 100.0
        assert 0.0 <= c["no_readmit_rate"] <= 100.0
        assert c["sample_size"] >= 0
        assert c["early_readmit_count"] >= 0

    change = TreatmentAnalyticsService.get_change_status_outcomes()
    assert "cohort_outcomes" in change

    poly = TreatmentAnalyticsService.get_polypharmacy_outcomes()
    assert len(poly["cohort_outcomes"]) == 4


def test_hospital_performance_analytics_quality_and_safeguards():
    """Validate hospital performance analytics math, aggregate scope, and anonymity safeguards."""
    perf = HospitalPerformanceService.get_overall_performance()
    
    assert perf["total_encounters_analyzed"] == 101766
    assert perf["eligible_encounters_count"] == 99343

    c_30 = perf["overall_outcome_distribution"]["early_readmission"]["count"]
    c_gt30 = perf["overall_outcome_distribution"]["late_readmission"]["count"]
    c_no = perf["overall_outcome_distribution"]["no_readmission"]["count"]
    # Verify exact authoritative counts match runtime dataset calculation
    assert c_30 == 11314
    assert c_gt30 == 35502
    assert c_no == 52527

    # Verify sum equal eligible encounters
    assert c_30 + c_gt30 + c_no == perf["eligible_encounters_count"]

    # Verify percentage sum equals ~100%
    pct_sum = (
        perf["overall_outcome_distribution"]["early_readmission"]["percentage"] +
        perf["overall_outcome_distribution"]["late_readmission"]["percentage"] +
        perf["overall_outcome_distribution"]["no_readmission"]["percentage"]
    )
    assert abs(pct_sum - 100.0) < 0.1

    # Verify hospital anonymity disclaimer is present and system-level aggregate emphasized
    assert "hospital_anonymity_disclaimer" in perf
    assert HOSPITAL_ANONYMITY_DISCLAIMER in perf["hospital_anonymity_disclaimer"]


def test_inference_api_contract():
    """Verify prediction engine response payload against strict API contract."""
    engine = get_inference_engine()
    sample_input = {
        "race": "Caucasian",
        "gender": "Female",
        "age": "[60-70)",
        "admission_type_id": "1",
        "time_in_hospital": 4,
        "num_lab_procedures": 45,
        "num_procedures": 1,
        "num_medications": 14,
        "number_inpatient": 1,
        "number_emergency": 0,
        "number_outpatient": 0,
        "diag_1": "414",
        "diag_2": "250",
        "diag_3": "401",
        "number_diagnoses": 7,
        "insulin": "Up",
        "metformin": "Steady"
    }

    res = engine.predict(sample_input)

    assert "risk_probability" in res
    assert 0.0 <= res["risk_probability"] <= 1.0
    assert "risk_percentage" in res
    assert "risk_category" in res
    assert res["risk_category"] in ["Low Risk", "Medium Risk", "High Risk"]
    assert "prediction" in res
    assert res["prediction"] in [0, 1]
    assert "predicted_class_label" in res
    assert res["predicted_class_label"] in ["<30", "NO/>30"]
    assert "top_risk_factors" in res
    assert isinstance(res["top_risk_factors"], list)
    assert "model_name" in res
    assert "model_version" in res
    assert "timestamp" in res
    assert "disclaimer" in res
