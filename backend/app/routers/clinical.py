from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.patient import Patient
from app.models.prediction import Prediction

router = APIRouter(prefix="/clinical", tags=["Clinical Decision Support"])


@router.get("/summary/{patient_id}")
async def get_clinical_summary(patient_id: int, db: AsyncSession = Depends(get_db)):
    """Build a clinical insight from the patient's latest model result."""
    patient = await db.scalar(select(Patient).where(Patient.id == patient_id))
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    prediction = await db.scalar(
        select(Prediction)
        .where(Prediction.patient_id == patient_id)
        .order_by(Prediction.created_at.desc())
    )
    if prediction is None:
        return {
            "patient_id": patient_id,
            "patient_name": f"{patient.first_name} {patient.last_name}",
            "status": "awaiting_prediction",
            "summary": "No readmission forecast is available for this patient yet.",
            "insights": [],
        }

    category = prediction.risk_category.lower()
    if category == "high":
        summary = "The model indicates elevated near-term readmission risk and warrants clinical review."
        insights = [
            "Review discharge readiness and medication reconciliation.",
            "Arrange follow-up contact and escalation criteria before discharge.",
        ]
    elif category == "medium":
        summary = "The model indicates moderate readmission risk; reinforce transition-of-care planning."
        insights = [
            "Confirm follow-up appointment and patient understanding of the care plan.",
            "Monitor unresolved clinical and medication concerns.",
        ]
    else:
        summary = "The model indicates lower near-term readmission risk under the submitted patient profile."
        insights = ["Continue routine discharge education and standard follow-up."]

    return {
        "patient_id": patient_id,
        "patient_name": f"{patient.first_name} {patient.last_name}",
        "status": "ready",
        "risk_score": prediction.readmission_risk_score,
        "risk_category": prediction.risk_category,
        "model_version": prediction.model_version,
        "prediction_id": prediction.id,
        "summary": summary,
        "insights": insights,
    }