from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class PatientRiskPrediction(Base):
    __tablename__ = "patient_risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=True)
    
    risk_score = Column(Float, nullable=False)  # 0.0 to 100.0
    risk_level = Column(String(20), nullable=False)  # High, Medium, Low
    readmission_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    model_name = Column(String(100), default="RandomForestClassifier")
    
    # Stored as JSON strings
    risk_factors = Column(Text, nullable=True)  # JSON array of factors & weights
    clinical_recommendations = Column(Text, nullable=True)  # JSON array of recommendations
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient")
    admission = relationship("Admission")
