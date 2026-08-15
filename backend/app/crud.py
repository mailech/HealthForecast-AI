from sqlalchemy.orm import Session
from . import models


# =========================
# USER CRUD
# =========================

def create_user(db: Session, user):

    db_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password,
        role="doctor",
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_email(
    db: Session,
    email: str,
):
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )


# =========================
# PATIENT CRUD
# =========================

def create_patient(db: Session, patient):

    db_patient = models.Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        disease=patient.disease,
        risk=patient.risk,
        status=patient.status,
        admission_date=patient.admission_date,
        notes=patient.notes,
    )

    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)

    return db_patient 


def get_patients(
    db: Session,
):

    return (
        db.query(models.Patient)
        .order_by(models.Patient.id.desc())
        .all()
    )


def get_patient(
    db: Session,
    patient_id: int,
):

    return (
        db.query(models.Patient)
        .filter(
            models.Patient.id == patient_id
        )
        .first()
    )


def update_patient(
    db: Session,
    db_patient,
    patient,
):

    update_data = patient.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            db_patient,
            key,
            value,
        )

    db.commit()
    db.refresh(db_patient)

    return db_patient


def delete_patient(
    db: Session,
    db_patient,
):

    db.delete(db_patient)
    db.commit()

    return db_patient 
# =========================
# PREDICTION CRUD
# =========================

def create_prediction(
    db: Session,
    patient_id: int,
    risk_score: float,
    risk_level: str,
    recommendation: str,
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
    patient_id: int,
):

    return (
        db.query(models.Prediction)
        .filter(
            models.Prediction.patient_id
            == patient_id
        )
        .order_by(
            models.Prediction.id.desc()
        )
        .all()
    )