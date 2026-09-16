from sqlalchemy.orm import Session

from . import models, schemas
from .auth import hash_password


# ============================================================
# USER CRUD
# ============================================================

def get_user_by_email(
    db: Session,
    email: str
):
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )


def get_user(
    db: Session,
    user_id: int
):
    return (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )


def get_users(
    db: Session
):
    return (
        db.query(models.User)
        .order_by(models.User.id.desc())
        .all()
    )


# ============================================================
# ADMIN MANAGED USER
# ============================================================

def create_managed_user(
    db: Session,
    user: schemas.AdminUserCreate
):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# ============================================================
# PATIENT CRUD
# ============================================================

def get_patients(
    db: Session
):
    return (
        db.query(models.Patient)
        .order_by(models.Patient.id.desc())
        .all()
    )


def get_patient(
    db: Session,
    patient_id: int
):
    return (
        db.query(models.Patient)
        .filter(models.Patient.id == patient_id)
        .first()
    )


def create_patient(
    db: Session,
    patient: schemas.PatientCreate
):
    db_patient = models.Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        disease=patient.disease,
        risk=patient.risk,
        status=patient.status,
        admission_date=patient.admission_date,
        notes=patient.notes,
        user_id=patient.user_id,
    )

    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)

    return db_patient


def update_patient(
    db: Session,
    patient_id: int,
    patient: schemas.PatientUpdate
):
    db_patient = get_patient(
        db,
        patient_id
    )

    if not db_patient:
        return None

    update_data = patient.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            db_patient,
            key,
            value
        )

    db.commit()
    db.refresh(db_patient)

    return db_patient


def delete_patient(
    db: Session,
    patient_id: int
):
    db_patient = get_patient(
        db,
        patient_id
    )

    if not db_patient:
        return None

    db.delete(db_patient)
    db.commit()

    return db_patient


# ============================================================
# PREDICTION CRUD
# ============================================================

def create_prediction(
    db: Session,
    patient_id: int,
    risk_score: float,
    risk_level: str,
    recommendation: str
):
    db_prediction = models.Prediction(
        patient_id=patient_id,
        risk_score=risk_score,
        risk_level=risk_level,
        recommendation=recommendation,
    )

    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return db_prediction


def get_patient_predictions(
    db: Session,
    patient_id: int
):
    return (
        db.query(models.Prediction)
        .filter(
            models.Prediction.patient_id == patient_id
        )
        .order_by(
            models.Prediction.created_at.desc()
        )
        .all()
    ) 