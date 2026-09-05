from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    race = Column(String(50))
    gender = Column(String(20))
    age = Column(String(20))
    weight = Column(String(20))
    admission_type_id = Column(Integer)
    discharge_disposition_id = Column(Integer)
    admission_source_id = Column(Integer)
    time_in_hospital = Column(Integer)
    payer_code = Column(String(20))
    medical_specialty = Column(String(100))
    num_lab_procedures = Column(Integer)
    num_procedures = Column(Integer)
    num_medications = Column(Integer)
    number_outpatient = Column(Integer)
    number_emergency = Column(Integer)
    number_inpatient = Column(Integer)
    number_diagnoses = Column(Integer)
    max_glu_serum = Column(String(20))
    a1cresult = Column(String(20))
    change = Column(String(10))
    diabetes_med = Column(String(10))
    readmitted = Column(String(20))
    diag_1 = Column(String(20))
    diag_2 = Column(String(20))
    diag_3 = Column(String(20))
    assigned_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_anonymized = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_doctor = relationship("User", back_populates="assigned_patients")
    medical_history = relationship("MedicalHistory", back_populates="patient", cascade="all, delete-orphan")
    treatments = relationship("Treatment", back_populates="patient", cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="patient", cascade="all, delete-orphan")
    readmission_forecasts = relationship(
        "ReadmissionForecast", back_populates="patient", cascade="all, delete-orphan"
    )


class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    condition = Column(String(255))
    diagnosis_code = Column(String(20))
    notes = Column(Text)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="medical_history")


class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medication = Column(String(100))
    dosage = Column(String(50))
    status = Column(String(20))
    outcome = Column(String(100))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="treatments")


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    admission_date = Column(DateTime, default=datetime.utcnow)
    discharge_date = Column(DateTime, nullable=True)
    admission_type = Column(String(50))
    discharge_disposition = Column(String(100))
    length_of_stay = Column(Integer)
    readmitted_within_30 = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="admissions")
