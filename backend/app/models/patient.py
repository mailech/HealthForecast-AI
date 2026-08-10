import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Patient(Base):
    """Core demographic + identity record. PII lives only here so it can be
    excluded cleanly for the Researcher role (Access Matrix: 'Anonymized Only')."""

    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mrn: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # medical record number
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    race: Mapped[str | None] = mapped_column(String(50), nullable=True)
    hospital_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    # Mobile number collected at intake — lets the patient later self-register
    # a portal login (see /auth/patient/signup) without needing an admin to
    # create their account manually.
    phone_number: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
    medical_history = relationship("MedicalHistoryEntry", back_populates="patient", cascade="all, delete-orphan")
    assignments = relationship("PatientAssignment", back_populates="patient", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="patient", cascade="all, delete-orphan")


class PatientAssignment(Base):
    """Which doctor is responsible for which patient — enforces the
    'Assigned Patients Only' restriction from the Access Matrix."""

    __tablename__ = "patient_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="assignments")
    doctor = relationship("User", back_populates="assigned_patients")


class MedicalHistoryEntry(Base):
    __tablename__ = "medical_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    condition: Mapped[str] = mapped_column(String(255), nullable=False)
    diagnosed_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="medical_history")


class Admission(Base):
    """One hospital stay/encounter. Mirrors the feature shape of the
    Diabetes 130-US Hospitals dataset so historical + live data share a schema."""

    __tablename__ = "admissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)

    admitted_on: Mapped[date] = mapped_column(Date, nullable=False)
    discharged_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    admission_type: Mapped[str | None] = mapped_column(String(100), nullable=True)  # emergency, elective, urgent
    discharge_disposition: Mapped[str | None] = mapped_column(String(100), nullable=True)
    primary_diagnosis: Mapped[str | None] = mapped_column(String(255), nullable=True)

    time_in_hospital: Mapped[int | None] = mapped_column(Integer, nullable=True)
    num_lab_procedures: Mapped[int | None] = mapped_column(Integer, nullable=True)
    num_procedures: Mapped[int | None] = mapped_column(Integer, nullable=True)
    num_medications: Mapped[int | None] = mapped_column(Integer, nullable=True)
    number_outpatient: Mapped[int | None] = mapped_column(Integer, nullable=True)
    number_emergency: Mapped[int | None] = mapped_column(Integer, nullable=True)
    number_inpatient: Mapped[int | None] = mapped_column(Integer, nullable=True)
    number_diagnoses: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Ground truth label (used for training/eval; null for live/未知 cases)
    was_readmitted_30d: Mapped[bool | None] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="admissions")
    risk_score = relationship("RiskScore", back_populates="admission", uselist=False)
    treatment_evaluations = relationship("TreatmentEvaluation", back_populates="admission")


class RiskScore(Base):
    """Output of the readmission prediction model for a given admission."""

    __tablename__ = "risk_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    admission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("admissions.id"), nullable=False, unique=True, index=True
    )

    readmission_probability: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 - 1.0
    risk_category: Mapped[str] = mapped_column(String(20), nullable=False)  # low | medium | high
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="risk_scores")
    admission = relationship("Admission", back_populates="risk_score")


class TreatmentEvaluation(Base):
    __tablename__ = "treatment_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("admissions.id"), nullable=False, index=True)
    treatment_name: Mapped[str] = mapped_column(String(255), nullable=False)
    outcome_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # e.g. recovery/effectiveness index
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    evaluated_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    admission = relationship("Admission", back_populates="treatment_evaluations")


class Bill(Base):
    """Hospital bill for a single admission. Kept 1:1 with Admission so the
    bill always reflects one specific hospital stay, matching how real
    hospital billing works (itemized per encounter, not per patient)."""

    __tablename__ = "bills"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    admission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("admissions.id"), nullable=False, unique=True, index=True
    )

    room_charges: Mapped[float] = mapped_column(Float, default=0)
    procedure_charges: Mapped[float] = mapped_column(Float, default=0)
    medication_charges: Mapped[float] = mapped_column(Float, default=0)
    lab_charges: Mapped[float] = mapped_column(Float, default=0)
    other_charges: Mapped[float] = mapped_column(Float, default=0)

    insurance_covered: Mapped[float] = mapped_column(Float, default=0)
    # status: pending | paid | overdue
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    issued_on: Mapped[date] = mapped_column(Date, nullable=False)
    due_on: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    patient = relationship("Patient")
    admission = relationship("Admission")

    @property
    def total_amount(self) -> float:
        return self.room_charges + self.procedure_charges + self.medication_charges + self.lab_charges + self.other_charges

    @property
    def patient_responsibility(self) -> float:
        return max(0.0, self.total_amount - self.insurance_covered)
