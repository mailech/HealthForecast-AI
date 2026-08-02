from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    admission_type = Column(String, nullable=False, default="Emergency")
    discharge_disposition = Column(String, nullable=False, default="Discharged to home")
    admission_source = Column(String, nullable=False, default="Emergency Room")
    time_in_hospital = Column(Integer, nullable=False) # days
    medical_specialty = Column(String, nullable=True)
    
    num_lab_procedures = Column(Integer, default=0)
    num_procedures = Column(Integer, default=0)
    num_medications = Column(Integer, default=0)
    number_outpatient = Column(Integer, default=0)
    number_emergency = Column(Integer, default=0)
    number_inpatient = Column(Integer, default=0)
    
    diag_1 = Column(String, nullable=True) # Primary ICD-9 or name
    diag_2 = Column(String, nullable=True)
    diag_3 = Column(String, nullable=True)
    number_diagnoses = Column(Integer, default=1)
    
    max_glu_serum = Column(String, default="None") # None, Norm, >200, >300
    A1Cresult = Column(String, default="None") # None, Norm, >7, >8
    change = Column(String, default="No") # No, Ch
    diabetesMed = Column(String, default="Yes") # Yes, No
    
    risk_score = Column(Float, default=0.0) # Calculated/Predicted risk score (0-100)
    risk_category = Column(String, default="Low") # Low, Medium, High
    readmitted = Column(String, default="NO") # NO, >30, <30
    
    admission_date = Column(DateTime, default=datetime.utcnow)
    discharge_date = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="admissions")
    medications = relationship("Medication", back_populates="admission", cascade="all, delete-orphan")
