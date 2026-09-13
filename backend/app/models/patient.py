from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


# ============================================================
# Patient
# ============================================================

class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    gender: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    blood_group: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True
    )

    assigned_doctor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    assigned_doctor = relationship(
        "User",
        foreign_keys=[assigned_doctor_id]
    )

    medical_history = relationship(
        "MedicalHistory",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    treatments = relationship(
        "Treatment",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    admissions = relationship(
        "Admission",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    # One clinical assessment per patient
    clinical_assessment = relationship(
        "ClinicalAssessment",
        back_populates="patient",
        cascade="all, delete-orphan",
        uselist=False
    )


# ============================================================
# Medical History
# ============================================================

class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False
    )

    diagnosis: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    diagnosis_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="medical_history"
    )


# ============================================================
# Treatment
# ============================================================

class Treatment(Base):
    __tablename__ = "treatments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False
    )

    treatment_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    medication: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    dosage: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    outcome: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="treatments"
    )


# ============================================================
# Admission
# ============================================================

class Admission(Base):
    __tablename__ = "admissions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False
    )

    admission_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    discharge_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    admission_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    diagnosis: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    discharge_reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="admissions"
    )