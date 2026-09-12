from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from .. import models
from ..auth import require_roles


router = APIRouter(
    prefix="/research",
    tags=["Research"]
)


@router.get("/summary")
def research_summary(
    current_user=Depends(
        require_roles("admin", "doctor")
    ),
    db: Session = Depends(get_db)
):
    total_patients = db.query(
        models.Patient
    ).count()

    high_risk = db.query(
        models.Patient
    ).filter(
        models.Patient.risk.ilike("high")
    ).count()

    predictions = db.query(
        models.Prediction
    ).count()

    avg_risk = db.query(
        func.avg(models.Prediction.risk_score)
    ).scalar()

    return {
        "total_patients": total_patients,
        "high_risk_patients": high_risk,
        "total_predictions": predictions,
        "average_risk_score": round(
            float(avg_risk or 0),
            4
        )
    }