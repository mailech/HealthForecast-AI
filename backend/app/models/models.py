from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Doctor") # Doctor, Hospital Administrator, Healthcare Researcher
    hospital_name = Column(String, default="MetroHealth General Hospital")
    created_at = Column(DateTime, default=datetime.utcnow)

class PatientDB(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    department = Column(String, nullable=False) # Cardiology, Pulmonology, Endocrinology, Nephrology, Internal Medicine
    primary_diagnosis = Column(String, nullable=False)
    admission_date = Column(String, nullable=False)
    discharge_date = Column(String, nullable=True)
    status = Column(String, default="Admitted") # Admitted, Discharged, Outpatient
    
    # Clinical Metrics
    prior_admissions = Column(Integer, default=0)
    emergency_visits = Column(Integer, default=0)
    length_of_stay = Column(Integer, default=1)
    charlson_index = Column(Integer, default=1)
    lace_index = Column(Integer, default=5)
    hba1c = Column(Float, default=6.5)
    serum_sodium = Column(Float, default=138.0)
    creatinine = Column(Float, default=1.0)
    polypharmacy_count = Column(Integer, default=3)
    
    # Risk Score & Probability
    readmission_risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Low") # Low, Medium, High
    last_assessed = Column(DateTime, default=datetime.utcnow)
    
    predictions = relationship("PredictionDB", back_populates="patient", cascade="all, delete-orphan")

class PredictionDB(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    key_factors = Column(Text, nullable=False) # JSON or comma-separated string
    recommendations = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientDB", back_populates="predictions")

class ReportDB(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    report_type = Column(String, nullable=False) # Monthly Audit, High Risk Summary, Readmission Trends
    department = Column(String, default="All Departments")
    generated_by = Column(String, nullable=False)
    file_format = Column(String, default="PDF")
    created_at = Column(DateTime, default=datetime.utcnow)
