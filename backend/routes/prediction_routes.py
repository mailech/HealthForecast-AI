from fastapi import APIRouter, Depends, HTTPException

from auth import require_roles

from shared import (
    ReadmissionInput,
    RiskPredictionInput,
    get_ml_prediction,
    create_audit_log,
    READMISSION_THRESHOLD,
)


router = APIRouter()


# =========================================================
# READMISSION PREDICTION
# DOCTOR + SYSTEM ADMIN
# =========================================================


@router.post("/api/predict-readmission")
def predict_readmission(
    data: ReadmissionInput,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "System Administrator",
        )
    ),
):

    try:

        probability, prediction, risk = get_ml_prediction(
            data
        )

        create_audit_log(
            current_user,
            "READMISSION_PREDICTION",
            details={
                "risk_level": risk,
                "probability": probability,
            },
        )

        return {
            "prediction": (
                "Readmitted"
                if prediction == 1
                else "Not Readmitted"
            ),

            "readmission_probability": round(
                probability * 100,
                2,
            ),

            "risk_level": risk,

            "model_threshold": round(
                READMISSION_THRESHOLD,
                2,
            ),

            "message": (
                "Patient has a higher predicted risk of readmission within 30 days."
                if prediction == 1
                else
                "Patient has a lower predicted risk of readmission within 30 days."
            ),
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )


# =========================================================
# PATIENT RISK PREDICTION
# DOCTOR + SYSTEM ADMIN
# =========================================================


@router.post("/api/predict-risk")
def predict_risk(
    data: RiskPredictionInput,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "System Administrator",
        )
    ),
):

    try:

        probability, prediction, risk = get_ml_prediction(
            data
        )

        create_audit_log(
            current_user,
            "RISK_PREDICTION",
            details={
                "risk_level": risk,
                "probability": probability,
            },
        )

        return {
            "risk_score": round(
                probability * 100,
                2,
            ),

            "risk_level": risk,

            "readmission_probability": round(
                probability * 100,
                2,
            ),

            "prediction": (
                "Higher Risk"
                if prediction == 1
                else "Lower Risk"
            ),

            "message": (
                "Patient has a higher predicted risk of hospital readmission within 30 days."
                if prediction == 1
                else
                "Patient has a lower predicted risk of hospital readmission within 30 days."
            ),
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Risk prediction failed: {str(e)}",
        )