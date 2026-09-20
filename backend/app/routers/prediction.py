from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.prediction import PredictionCreate, PredictionResponse
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.user import UserRole
from app.services.ml_service import MLService


router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)


@router.post(
    "/predict",
    response_model=PredictionResponse
)
async def predict_readmission(
    payload: PredictionCreate,
    token=Depends(RoleChecker([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db),
):
    """Generate patient readmission risk using the trained ML model."""

    try:
        result = await MLService.predict_readmission_risk(payload)

        patient = await db.scalar(
            select(Patient).where(Patient.id == payload.patient_id)
        )
        if patient is None:
            raise HTTPException(status_code=404, detail="Patient not found")

        prior_val = payload.prior_admissions if payload.prior_admissions is not None else payload.number_inpatient
        los_val = payload.length_of_stay if payload.length_of_stay is not None else payload.time_in_hospital

        prediction = Prediction(
            patient_id=payload.patient_id,
            readmission_risk_score=result["readmission_risk_score"],
            risk_category=result["risk_category"],
            model_version=result["model_version"],
            prior_admissions=prior_val,
            length_of_stay=los_val,
        )
        db.add(prediction)
        await db.flush()

        # Trigger Real High Risk Alert Notification if patient is High risk
        if str(result.get("risk_category", "")).lower() == "high":
            from app.services.notification_service import NotificationService
            patient_name = f"{patient.first_name} {patient.last_name}"
            await NotificationService.create_notification(
                db=db,
                type="high_risk",
                title="High Risk Alert",
                message=f"High-risk assessment recorded for {patient_name}.",
                user_id=getattr(token, "id", None),
                target_role="Doctor",
                related_entity_type="patient",
                related_entity_id=patient.id,
                metadata={
                    "patient_id": patient.id,
                    "patient_name": patient_name,
                    "prediction_id": prediction.id,
                    "risk_category": "High",
                    "readmission_risk_score": result["readmission_risk_score"],
                    "risk_percentage": f"{result['readmission_risk_score']:.1f}%",
                },
                event_key=f"high_risk:prediction_{prediction.id}",
            )
            await db.commit()

        return PredictionResponse(
            id=prediction.id,
            patient_id=payload.patient_id,
            readmission_risk_score=result["readmission_risk_score"],
            risk_category=result["risk_category"],
            model_version=result["model_version"],
            probabilities=result["probabilities"],
            patient_name=f"{patient.first_name} {patient.last_name}",
            created_at=prediction.created_at.isoformat() if prediction.created_at else None,
            prior_admissions=prediction.prior_admissions,
            length_of_stay=prediction.length_of_stay,
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Prediction failed: {str(error)}"
        )


@router.get(
    "/patient/{patient_id}",
    response_model=list[PredictionResponse],
)
async def get_patient_prediction_history(
    patient_id: int,
    token=Depends(RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Return persisted prediction history for one patient."""
    patient = await db.scalar(select(Patient).where(Patient.id == patient_id))
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    result = await db.execute(
        select(Prediction)
        .where(Prediction.patient_id == patient_id)
        .order_by(Prediction.created_at.desc())
    )
    return [
        PredictionResponse(
            id=prediction.id,
            patient_id=prediction.patient_id,
            readmission_risk_score=prediction.readmission_risk_score,
            risk_category=prediction.risk_category,
            model_version=prediction.model_version,
            patient_name=f"{patient.first_name} {patient.last_name}",
            created_at=prediction.created_at.isoformat() if prediction.created_at else None,
            prior_admissions=prediction.prior_admissions,
            length_of_stay=prediction.length_of_stay,
        )
        for prediction in result.scalars().all()
    ]