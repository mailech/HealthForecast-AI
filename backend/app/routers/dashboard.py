from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # ============================================================
    # ADMIN / DOCTOR / STAFF
    # Hospital-wide dashboard
    # ============================================================

    if current_user.role in [
        "admin",
        "doctor",
        "staff",
    ]:

        patients = (
            db.query(models.Patient)
            .count()
        )

        high_risk = (
            db.query(models.Patient)
            .filter(
                models.Patient.risk.ilike("high")
            )
            .count()
        )

        doctors = (
            db.query(models.User)
            .filter(
                models.User.role == "doctor"
            )
            .count()
        )

        users = (
            db.query(models.User)
            .count()
        )

        return {
            "role": current_user.role,
            "patients": patients,
            "high_risk": high_risk,
            "doctors": doctors,
            "users": users,
        }


    # ============================================================
    # PATIENT
    # Only own health information
    # ============================================================

    if current_user.role == "patient":

        patient = (
            db.query(models.Patient)
            .filter(
                models.Patient.user_id ==
                current_user.id
            )
            .first()
        )

        if not patient:

            return {
                "role": "patient",
                "patients": 0,
                "high_risk": 0,
                "doctors": 0,
                "users": 0,
            }

        high_risk = (
            1
            if patient.risk and
            patient.risk.lower() == "high"
            else 0
        )

        return {
            "role": "patient",
            "patients": 1,
            "high_risk": high_risk,
            "doctors": 0,
            "users": 0,
        }


    # ============================================================
    # UNKNOWN ROLE
    # ============================================================

    return {
        "role": current_user.role,
        "patients": 0,
        "high_risk": 0,
        "doctors": 0,
        "users": 0,
    } 