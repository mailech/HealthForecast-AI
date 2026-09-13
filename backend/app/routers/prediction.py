from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.clinical_assessment import ClinicalAssessment
from ..models.patient import Patient
from ..models.user import User
from ..services.readmission_prediction import (
    readmission_prediction_service,
)
from ..utils.security import get_current_user


router = APIRouter(
    prefix="/predictions",
    tags=["ML Predictions"],
)


# ============================================================
# REQUEST / RESPONSE SCHEMAS
# ============================================================

class ReadmissionPredictionRequest(BaseModel):
    patient_data: dict[str, Any]


class ReadmissionPredictionResponse(BaseModel):
    readmission_probability: float
    decision_threshold: float
    predicted_class: int
    predicted_outcome: str
    risk_level: str
    clinical_interpretation: str
    recommended_action: str


# ============================================================
# ACCESS CONTROL
# ============================================================

def check_prediction_access(
    patient: Patient,
    current_user: User,
):
    """
    Check whether the logged-in user is allowed to
    generate a prediction for this patient.
    """

    role = current_user.role.value

    # --------------------------------------------------------
    # System Administrator
    # --------------------------------------------------------

    if role == "system_admin":
        return

    # --------------------------------------------------------
    # Doctor
    # --------------------------------------------------------

    if role == "doctor":
        if patient.assigned_doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this patient",
            )

        return

    # --------------------------------------------------------
    # Hospital Administrator
    # --------------------------------------------------------

    if role == "hospital_admin":
        return

    # --------------------------------------------------------
    # Healthcare Researcher
    # --------------------------------------------------------

    if role == "healthcare_researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Healthcare researchers cannot access "
                "identifiable patient prediction workflows"
            ),
        )

    # --------------------------------------------------------
    # Unknown role
    # --------------------------------------------------------

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to generate predictions",
    )


# ============================================================
# PATIENT LOOKUP
# ============================================================

def get_patient_or_404(
    patient_id: int,
    db: Session,
) -> Patient:
    """
    Retrieve a patient or return HTTP 404.
    """

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return patient


# ============================================================
# GENERIC MODEL TESTING ENDPOINT
# ============================================================

@router.post(
    "/readmission",
    response_model=ReadmissionPredictionResponse,
)
def predict_readmission(
    request: ReadmissionPredictionRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate a readmission prediction from explicitly
    supplied model features.

    This endpoint is useful for:
        - Swagger testing
        - Postman testing
        - Model API testing

    The application UI uses the patient-specific endpoint
    below instead.
    """

    role = current_user.role.value

    if role not in {
        "doctor",
        "hospital_admin",
        "system_admin",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only doctors, hospital administrators, "
                "and system administrators can generate "
                "readmission predictions"
            ),
        )

    try:
        result = readmission_prediction_service.predict(
            request.patient_data
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(exc)}",
        )


# ============================================================
# PATIENT-SPECIFIC PREDICTION
# ============================================================

@router.post(
    "/readmission/{patient_id}",
    response_model=ReadmissionPredictionResponse,
)
def predict_patient_readmission(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a readmission prediction for a specific
    application patient.

    Data flow:

        Patient
            +
        ClinicalAssessment
            ↓
        Feature Preparation
            ↓
        Readmission Model
            ↓
        Risk Assessment
    """

    # --------------------------------------------------------
    # 1. Get patient
    # --------------------------------------------------------

    patient = get_patient_or_404(
        patient_id,
        db,
    )

    # --------------------------------------------------------
    # 2. Check access
    # --------------------------------------------------------

    check_prediction_access(
        patient,
        current_user,
    )

    # --------------------------------------------------------
    # 3. Get clinical assessment
    # --------------------------------------------------------

    assessment = (
        db.query(ClinicalAssessment)
        .filter(
            ClinicalAssessment.patient_id == patient.id
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Clinical assessment not found for this patient. "
                "Please create a clinical assessment before "
                "generating a readmission prediction."
            ),
        )

    # --------------------------------------------------------
    # 4. Calculate patient age
    # --------------------------------------------------------

    from datetime import date

    age_numeric = None

    if patient.date_of_birth:
        today = date.today()

        age_numeric = (
            today.year
            - patient.date_of_birth.year
            - (
                (today.month, today.day)
                < (
                    patient.date_of_birth.month,
                    patient.date_of_birth.day,
                )
            )
        )

        age_numeric = max(age_numeric, 0)

    # --------------------------------------------------------
    # 5. Build model input
    # --------------------------------------------------------
    #
    # Demographic information comes from Patient.
    #
    # Clinical information comes from ClinicalAssessment.
    #
    # Engineered features such as:
    #
    #   prior_utilization
    #   medication_count
    #   medication_changed
    #   diabetes_medication
    #   clinical_activity
    #
    # are calculated inside the ML service so that inference
    # remains consistent with training-time feature engineering.
    # --------------------------------------------------------

    patient_data: dict[str, Any] = {

        # ----------------------------------------------------
        # Demographics
        # ----------------------------------------------------

        "race": assessment.race,

        "gender": (
            patient.gender
            if patient.gender
            else "Unknown/Invalid"
        ),

        "age_numeric": age_numeric,

        # ----------------------------------------------------
        # Admission Information
        # ----------------------------------------------------

        "admission_type_id":
            assessment.admission_type_id,

        "discharge_disposition_id":
            assessment.discharge_disposition_id,

        "admission_source_id":
            assessment.admission_source_id,

        "time_in_hospital":
            assessment.time_in_hospital,

        # ----------------------------------------------------
        # Clinical Activity
        # ----------------------------------------------------

        "num_lab_procedures":
            assessment.num_lab_procedures,

        "num_procedures":
            assessment.num_procedures,

        "num_medications":
            assessment.num_medications,

        # ----------------------------------------------------
        # Previous Healthcare Utilization
        # ----------------------------------------------------

        "number_outpatient":
            assessment.number_outpatient,

        "number_emergency":
            assessment.number_emergency,

        "number_inpatient":
            assessment.number_inpatient,

        "number_diagnoses":
            assessment.number_diagnoses,

        # ----------------------------------------------------
        # Laboratory Information
        # ----------------------------------------------------

        "max_glu_serum":
            assessment.max_glu_serum,

        "A1Cresult":
            assessment.A1Cresult,

        # ----------------------------------------------------
        # Diabetes Medications
        # ----------------------------------------------------

        "metformin":
            assessment.metformin,

        "repaglinide":
            assessment.repaglinide,

        "nateglinide":
            assessment.nateglinide,

        "chlorpropamide":
            assessment.chlorpropamide,

        "glimepiride":
            assessment.glimepiride,

        "acetohexamide":
            assessment.acetohexamide,

        "glipizide":
            assessment.glipizide,

        "glyburide":
            assessment.glyburide,

        "tolbutamide":
            assessment.tolbutamide,

        "pioglitazone":
            assessment.pioglitazone,

        "rosiglitazone":
            assessment.rosiglitazone,

        "acarbose":
            assessment.acarbose,

        "miglitol":
            assessment.miglitol,

        "troglitazone":
            assessment.troglitazone,

        "tolazamide":
            assessment.tolazamide,

        "insulin":
            assessment.insulin,

        # ----------------------------------------------------
        # Combination Medications
        # ----------------------------------------------------
        #
        # These use the original dataset names because the
        # ML service expects those names.
        # ----------------------------------------------------

        "glyburide-metformin":
            assessment.glyburide_metformin,

        "glipizide-metformin":
            assessment.glipizide_metformin,

        "glimepiride-pioglitazone":
            assessment.glimepiride_pioglitazone,

        "metformin-rosiglitazone":
            assessment.metformin_rosiglitazone,

        "metformin-pioglitazone":
            assessment.metformin_pioglitazone,

        # ----------------------------------------------------
        # Medication Status
        # ----------------------------------------------------

        "change":
            assessment.change,

        "diabetesMed":
            assessment.diabetesMed,

        # ----------------------------------------------------
        # Diagnosis Categories
        # ----------------------------------------------------

        "diag_1_category":
            assessment.diag_1_category,

        "diag_2_category":
            assessment.diag_2_category,

        "diag_3_category":
            assessment.diag_3_category,
    }

    # --------------------------------------------------------
    # 6. Generate prediction
    # --------------------------------------------------------

    try:

        result = readmission_prediction_service.predict(
            patient_data
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(exc)}",
        )

    # ============================================================
# HEALTHCARE ANALYTICS
# ============================================================

@router.get("/analytics")
def get_prediction_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate aggregate readmission-risk analytics.

    Role-based visibility:

        Doctor
            -> Assigned patients only

        Hospital Administrator
            -> All hospital patients

        System Administrator
            -> All patients

        Healthcare Researcher
            -> Aggregate/anonymized analytics only

    No identifiable patient information is returned.
    """

    role = current_user.role.value

    if role not in {
        "doctor",
        "hospital_admin",
        "healthcare_researcher",
        "system_admin",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access analytics.",
        )

    # --------------------------------------------------------
    # 1. Get patients according to role
    # --------------------------------------------------------

    query = db.query(Patient)

    if role == "doctor":
        query = query.filter(
            Patient.assigned_doctor_id == current_user.id
        )

    patients = query.all()

    # --------------------------------------------------------
    # 2. Initialize analytics
    # --------------------------------------------------------

    total_patients = len(patients)

    assessed_patients = 0

    high_risk_count = 0
    moderate_risk_count = 0
    low_risk_count = 0

    predicted_readmitted_count = 0
    predicted_not_readmitted_count = 0

    probabilities = []

    decision_threshold = None

    # --------------------------------------------------------
    # 3. Generate predictions
    # --------------------------------------------------------

    for patient in patients:

        assessment = (
            db.query(ClinicalAssessment)
            .filter(
                ClinicalAssessment.patient_id == patient.id
            )
            .first()
        )

        # Patients without an assessment cannot be scored.
        if assessment is None:
            continue

        assessed_patients += 1

        # ----------------------------------------------------
        # Build model input
        # ----------------------------------------------------

        patient_data: dict[str, Any] = {
            "race": assessment.race,

            "gender": (
                patient.gender
                if patient.gender
                else "Unknown/Invalid"
            ),

            "age_numeric": None,

            "admission_type_id":
                assessment.admission_type_id,

            "discharge_disposition_id":
                assessment.discharge_disposition_id,

            "admission_source_id":
                assessment.admission_source_id,

            "time_in_hospital":
                assessment.time_in_hospital,

            "num_lab_procedures":
                assessment.num_lab_procedures,

            "num_procedures":
                assessment.num_procedures,

            "num_medications":
                assessment.num_medications,

            "number_outpatient":
                assessment.number_outpatient,

            "number_emergency":
                assessment.number_emergency,

            "number_inpatient":
                assessment.number_inpatient,

            "number_diagnoses":
                assessment.number_diagnoses,

            "max_glu_serum":
                assessment.max_glu_serum,

            "A1Cresult":
                assessment.A1Cresult,

            "metformin":
                assessment.metformin,

            "repaglinide":
                assessment.repaglinide,

            "nateglinide":
                assessment.nateglinide,

            "chlorpropamide":
                assessment.chlorpropamide,

            "glimepiride":
                assessment.glimepiride,

            "acetohexamide":
                assessment.acetohexamide,

            "glipizide":
                assessment.glipizide,

            "glyburide":
                assessment.glyburide,

            "tolbutamide":
                assessment.tolbutamide,

            "pioglitazone":
                assessment.pioglitazone,

            "rosiglitazone":
                assessment.rosiglitazone,

            "acarbose":
                assessment.acarbose,

            "miglitol":
                assessment.miglitol,

            "troglitazone":
                assessment.troglitazone,

            "tolazamide":
                assessment.tolazamide,

            "insulin":
                assessment.insulin,

            "glyburide-metformin":
                assessment.glyburide_metformin,

            "glipizide-metformin":
                assessment.glipizide_metformin,

            "glimepiride-pioglitazone":
                assessment.glimepiride_pioglitazone,

            "metformin-rosiglitazone":
                assessment.metformin_rosiglitazone,

            "metformin-pioglitazone":
                assessment.metformin_pioglitazone,

            "change":
                assessment.change,

            "diabetesMed":
                assessment.diabetesMed,

            "diag_1_category":
                assessment.diag_1_category,

            "diag_2_category":
                assessment.diag_2_category,

            "diag_3_category":
                assessment.diag_3_category,
        }

        # ----------------------------------------------------
        # Calculate age
        # ----------------------------------------------------

        if patient.date_of_birth:
            from datetime import date

            today = date.today()

            age = (
                today.year
                - patient.date_of_birth.year
                - (
                    (today.month, today.day)
                    < (
                        patient.date_of_birth.month,
                        patient.date_of_birth.day,
                    )
                )
            )

            patient_data["age_numeric"] = max(age, 0)

        # ----------------------------------------------------
        # Generate prediction
        # ----------------------------------------------------

        try:
            result = readmission_prediction_service.predict(
                patient_data
            )

        except Exception:
            # One invalid/incomplete assessment should not
            # prevent aggregate analytics for other patients.
            continue

        probability = float(
            result["readmission_probability"]
        )

        risk_level = result["risk_level"]

        predicted_outcome = result["predicted_outcome"]

        probabilities.append(probability)

        decision_threshold = float(
            result["decision_threshold"]
        )

        # ----------------------------------------------------
        # Risk distribution
        # ----------------------------------------------------

        if risk_level == "High":
            high_risk_count += 1

        elif risk_level == "Moderate":
            moderate_risk_count += 1

        else:
            low_risk_count += 1

        # ----------------------------------------------------
        # Predicted outcome distribution
        # ----------------------------------------------------

        if predicted_outcome == "Readmitted":
            predicted_readmitted_count += 1

        else:
            predicted_not_readmitted_count += 1

    # --------------------------------------------------------
    # 4. Aggregate calculations
    # --------------------------------------------------------

    scored_patients = len(probabilities)

    average_probability = (
        sum(probabilities) / scored_patients
        if scored_patients > 0
        else 0.0
    )

    # --------------------------------------------------------
    # 5. Return aggregate analytics
    # --------------------------------------------------------

    return {
        "total_patients": total_patients,
        "assessed_patients": assessed_patients,
        "scored_patients": scored_patients,

        "risk_distribution": {
            "high": high_risk_count,
            "moderate": moderate_risk_count,
            "low": low_risk_count,
        },

        "outcome_distribution": {
            "predicted_readmitted":
                predicted_readmitted_count,
            "predicted_not_readmitted":
                predicted_not_readmitted_count,
        },

        "average_readmission_probability":
            round(average_probability, 4),

        "decision_threshold":
            decision_threshold,

        "model": "HistGradientBoosting",

        "privacy": (
            "Aggregate analytics only. "
            "No identifiable patient information is returned."
        ),
    }