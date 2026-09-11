from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Encounter(Base):
    __tablename__ = "encounters"
    
    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(String(50), unique=True, nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    admission_type_id = Column(Integer, nullable=True)
    discharge_disposition_id = Column(Integer, nullable=True)
    admission_source_id = Column(Integer, nullable=True)
    time_in_hospital = Column(Integer, nullable=False)
    payer_code = Column(String(50), nullable=True)
    medical_specialty = Column(String(100), nullable=True, index=True)
    
    num_lab_procedures = Column(Integer, default=0)
    num_procedures = Column(Integer, default=0)
    num_medications = Column(Integer, default=0)
    number_outpatient = Column(Integer, default=0)
    number_emergency = Column(Integer, default=0)
    number_inpatient = Column(Integer, default=0)
    
    diag_1 = Column(String(50), nullable=True)
    diag_2 = Column(String(50), nullable=True)
    diag_3 = Column(String(50), nullable=True)
    number_diagnoses = Column(Integer, default=0)
    
    max_glu_serum = Column(String(20), nullable=True)
    a1c_result = Column(String(20), nullable=True)
    
    # 23 Medication features
    metformin = Column(String(20), default="No")
    repaglinide = Column(String(20), default="No")
    nateglinide = Column(String(20), default="No")
    chlorpropamide = Column(String(20), default="No")
    glimepiride = Column(String(20), default="No")
    acetohexamide = Column(String(20), default="No")
    glipizide = Column(String(20), default="No")
    glyburide = Column(String(20), default="No")
    tolbutamide = Column(String(20), default="No")
    pioglitazone = Column(String(20), default="No")
    rosiglitazone = Column(String(20), default="No")
    acarbose = Column(String(20), default="No")
    miglitol = Column(String(20), default="No")
    troglitazone = Column(String(20), default="No")
    tolazamide = Column(String(20), default="No")
    examide = Column(String(20), default="No")
    citoglipton = Column(String(20), default="No")
    insulin = Column(String(20), default="No")
    glyburide_metformin = Column(String(20), default="No")
    glipizide_metformin = Column(String(20), default="No")
    glimepiride_pioglitazone = Column(String(20), default="No")
    metformin_rosiglitazone = Column(String(20), default="No")
    metformin_pioglitazone = Column(String(20), default="No")
    
    change_status = Column(String(20), default="No")
    diabetes_med = Column(String(20), default="No")
    actual_readmitted = Column(String(20), nullable=True, index=True) # '<30', '>30', 'NO'
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="encounters")
    predictions = relationship("ReadmissionPrediction", back_populates="encounter", cascade="all, delete-orphan")
