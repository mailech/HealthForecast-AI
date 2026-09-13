import pytest

from .services.readmission_prediction import (
    readmission_prediction_service,
)


# ============================================================
# TEST DATA
# ============================================================

def sample_patient_data():
    """
    Representative post-discharge clinical assessment data
    matching the features used by the deployed readmission model.
    """

    return {
        "race": "Caucasian",
        "gender": "Male",

        "admission_type_id": 1,
        "discharge_disposition_id": 1,
        "admission_source_id": 7,
        "time_in_hospital": 4,

        "num_lab_procedures": 40,
        "num_procedures": 1,
        "num_medications": 12,

        "number_outpatient": 0,
        "number_emergency": 0,
        "number_inpatient": 0,
        "number_diagnoses": 5,

        "max_glu_serum": None,
        "A1Cresult": None,

        "metformin": "No",
        "repaglinide": "No",
        "nateglinide": "No",
        "chlorpropamide": "No",
        "glimepiride": "No",
        "acetohexamide": "No",
        "glipizide": "No",
        "glyburide": "No",
        "tolbutamide": "No",
        "pioglitazone": "No",
        "rosiglitazone": "No",
        "acarbose": "No",
        "miglitol": "No",
        "troglitazone": "No",
        "tolazamide": "No",
        "insulin": "No",

        "glyburide-metformin": "No",
        "glipizide-metformin": "No",
        "glimepiride-pioglitazone": "No",
        "metformin-rosiglitazone": "No",
        "metformin-pioglitazone": "No",

        "change": "No",
        "diabetesMed": "Yes",

        "age_numeric": 65,

        "diag_1_category": "Diabetes",
        "diag_2_category": "Other",
        "diag_3_category": "Other",
    }


# ============================================================
# MODEL INITIALIZATION TESTS
# ============================================================

def test_model_loaded():
    """
    Verify that the trained readmission model is loaded.
    """

    assert readmission_prediction_service.model is not None


def test_model_has_feature_columns():
    """
    Verify that the deployed model has a valid feature schema.
    """

    feature_columns = (
        readmission_prediction_service.feature_columns
    )

    assert feature_columns is not None
    assert len(feature_columns) > 0


def test_decision_threshold_is_valid():
    """
    Verify that the optimized decision threshold is valid.
    """

    threshold = (
        readmission_prediction_service.decision_threshold
    )

    assert 0 < threshold < 1


# ============================================================
# PREDICTION TESTS
# ============================================================

def test_prediction_returns_result():
    """
    Verify that the ML service can generate a prediction.
    """

    result = readmission_prediction_service.predict(
        sample_patient_data()
    )

    assert result is not None
    assert isinstance(result, dict)


def test_prediction_probability_is_valid():
    """
    Verify that readmission probability is between 0 and 1.
    """

    result = readmission_prediction_service.predict(
        sample_patient_data()
    )

    probability = result["readmission_probability"]

    assert 0 <= probability <= 1


def test_prediction_contains_required_fields():
    """
    Verify that the prediction response contains the fields
    required by the backend API and frontend.
    """

    result = readmission_prediction_service.predict(
        sample_patient_data()
    )

    required_fields = {
        "readmission_probability",
        "decision_threshold",
        "predicted_class",
        "predicted_outcome",
        "risk_level",
        "clinical_interpretation",
        "recommended_action",
    }

    assert required_fields.issubset(result.keys())


def test_prediction_threshold_matches_model():
    """
    Verify that the prediction response exposes the same
    optimized threshold used by the deployed model.
    """

    result = readmission_prediction_service.predict(
        sample_patient_data()
    )

    assert result["decision_threshold"] == pytest.approx(
        readmission_prediction_service.decision_threshold
    )


def test_prediction_risk_level_is_valid():
    """
    Verify that the generated risk category is one of the
    application's supported risk levels.
    """

    result = readmission_prediction_service.predict(
        sample_patient_data()
    )

    assert result["risk_level"] in {
        "Low",
        "Moderate",
        "High",
    }


def test_prediction_outcome_is_valid():
    """
    Verify that the model returns a valid readmission outcome.
    """

    result = readmission_prediction_service.predict(
        sample_patient_data()
    )

    assert result["predicted_outcome"] in {
        "Readmitted",
        "Not Readmitted",
    }


# ============================================================
# INPUT VALIDATION TEST
# ============================================================

def test_invalid_input_is_rejected():
    """
    Verify that incomplete prediction data is rejected
    instead of silently producing a prediction.
    """

    with pytest.raises(ValueError):
        readmission_prediction_service.predict({})