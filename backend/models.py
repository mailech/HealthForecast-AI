from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

# ==========================================================
# Valid roles: "Doctor", "Hospital Administrator",
#              "Healthcare Researcher", "System Administrator"
# ==========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(200), default="")
    email = Column(String(200), default="")
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    predictions = relationship("Prediction", back_populates="creator")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(150), default="Anonymous Patient", index=True)
    
    # Demographic and Encounter data
    race = Column(String(50), default="Caucasian")
    gender = Column(String(50), default="Female")
    age = Column(String(50), default="[50-60)")
    admission_type_id = Column(String(10), default="1")
    discharge_disposition_id = Column(String(10), default="1")
    admission_source_id = Column(String(10), default="1")
    time_in_hospital = Column(Integer, default=3)
    payer_code = Column(String(50), default="MC")
    medical_specialty = Column(String(100), default="InternalMedicine")
    
    # Numerical clinical counts
    num_lab_procedures = Column(Integer, default=30)
    num_procedures = Column(Integer, default=0)
    num_medications = Column(Integer, default=10)
    number_outpatient = Column(Integer, default=0)
    number_emergency = Column(Integer, default=0)
    number_inpatient = Column(Integer, default=0)
    number_diagnoses = Column(Integer, default=5)
    
    # Lab results
    max_glu_serum = Column(String(50), default="None")
    A1Cresult = Column(String(50), default="None")
    
    # Medications
    metformin = Column(String(50), default="No")
    repaglinide = Column(String(50), default="No")
    nateglinide = Column(String(50), default="No")
    chlorpropamide = Column(String(50), default="No")
    glimepiride = Column(String(50), default="No")
    acetohexamide = Column(String(50), default="No")
    glipizide = Column(String(50), default="No")
    glyburide = Column(String(50), default="No")
    tolbutamide = Column(String(50), default="No")
    pioglitazone = Column(String(50), default="No")
    rosiglitazone = Column(String(50), default="No")
    acarbose = Column(String(50), default="No")
    miglitol = Column(String(50), default="No")
    troglitazone = Column(String(50), default="No")
    tolazamide = Column(String(50), default="No")
    examide = Column(String(50), default="No")
    citoglipton = Column(String(50), default="No")
    insulin = Column(String(50), default="No")
    glyburide_metformin = Column(String(50), default="No")
    glipizide_metformin = Column(String(50), default="No")
    glimepiride_pioglitazone = Column(String(50), default="No")
    metformin_rosiglitazone = Column(String(50), default="No")
    metformin_pioglitazone = Column(String(50), default="No")
    change = Column(String(50), default="No")
    diabetesMed = Column(String(50), default="No")
    
    # Diagnostic groups
    diag_1_group = Column(String(100), default="Circulatory")
    diag_2_group = Column(String(100), default="Diabetes")
    diag_3_group = Column(String(100), default="Other")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    predictions = relationship("Prediction", back_populates="patient")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    probability = Column(Float, nullable=False)
    risk_class = Column(String(50), nullable=False)  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    prediction = Column(String(100), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="predictions")
    creator = relationship("User", back_populates="predictions")


class AuditLog(Base):
    """Tracks important system events for System Administrator review."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    detail = Column(Text, default="")
    ip_address = Column(String(50), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Notification(Base):
    """In-app notifications for clinical alerts and system events."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null = broadcast
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="info")  # "info", "warning", "critical", "system"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
