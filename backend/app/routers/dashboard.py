from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Patient


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
):
    total_patients = (
        db.query(Patient).count()
    )

    high_risk = (
        db.query(Patient)
        .filter(Patient.risk == "High")
        .count()
    )

    total_doctors = (
        db.query(User)
        .filter(User.role == "doctor")
        .count()
    )

    total_users = db.query(User).count()

    return {
        "patients": total_patients,
        "high_risk": high_risk,
        "doctors": total_doctors,
        "users": total_users,
    }