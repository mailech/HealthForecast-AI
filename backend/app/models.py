from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
)

from sqlalchemy.sql import func

from .database import Base


# =========================
# USER MODEL
# =========================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(String)

    email = Column(
        String,
        unique=True,
        index=True
    )

    password = Column(String)

    role = Column(
        String,
        default="patient",
        nullable=False
    )


# =========================
# PATIENT MODEL
# =========================

class Patient(Base):

    __tablename__ = "patients"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Link patient record to a login user
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    name = Column(String)

    age = Column(Integer)

    gender = Column(String)

    disease = Column(String)

    risk = Column(String)

    status = Column(String)

    admission_date = Column(
        Date,
        nullable=True
    )

    notes = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


# =========================
# PREDICTION MODEL
# =========================

class Prediction(Base):

    __tablename__ = "predictions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    risk_score = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    recommendation = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    ) 

# =========================
# TREATMENT MODEL
# =========================

class TreatmentRecord(Base):

    __tablename__ = "treatment_records"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True
    )

    treatment_name = Column(String, nullable=False)

    outcome = Column(String, nullable=False)

    effectiveness_score = Column(
        Float,
        nullable=False,
        default=0
    )

    notes = Column(
        String,
        nullable=True
    )

    recorded_at = Column(
        DateTime,
        server_default=func.now()
    )


# =========================
# MEDICATION MODEL
# =========================

class MedicationRecord(Base):

    __tablename__ = "medication_records"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True
    )

    medication_name = Column(String, nullable=False)

    outcome = Column(String, nullable=False)

    effectiveness_score = Column(
        Float,
        nullable=False,
        default=0
    )

    notes = Column(
        String,
        nullable=True
    )

    recorded_at = Column(
        DateTime,
        server_default=func.now()
    )


# =========================
# RECOVERY MODEL
# =========================

class RecoveryRecord(Base):

    __tablename__ = "recovery_records"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True
    )

    recovery_stage = Column(String, nullable=False)

    recovery_score = Column(
        Float,
        nullable=False,
        default=0
    )

    days_to_recovery = Column(
        Integer,
        nullable=True
    )

    notes = Column(
        String,
        nullable=True
    )

    recorded_at = Column(
        DateTime,
        server_default=func.now()
    )    