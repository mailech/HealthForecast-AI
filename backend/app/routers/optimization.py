from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..auth import get_current_user


router = APIRouter(
    prefix="/optimization",
    tags=["Optimization"]
)


@router.get("/")
def optimization(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patients = db.query(models.Patient).all()

    high = [p for p in patients if p.risk and p.risk.lower() == "high"]
    medium = [p for p in patients if p.risk and p.risk.lower() == "medium"]

    actions = []

    if high:
        actions.append(
            f"Prioritize follow-up for {len(high)} high-risk patient(s)."
        )

    if medium:
        actions.append(
            f"Monitor {len(medium)} medium-risk patient(s)."
        )

    if not actions:
        actions.append("No immediate optimization action required.")

    return {
        "total_patients": len(patients),
        "high_risk": len(high),
        "medium_risk": len(medium),
        "priority": "High" if high else "Normal",
        "actions": actions,
    }