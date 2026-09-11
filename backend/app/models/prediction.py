from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ReadmissionPrediction(Base):
    __tablename__ = "readmission_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    readmission_risk_score = Column(Float, nullable=False) # 0.00 to 1.00
    risk_level = Column(String(20), nullable=False)       # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    predicted_readmitted = Column(String(20), nullable=False) # '<30' vs 'NO/>30'
    model_version = Column(String(50), nullable=False, default="v1.0-rules-baseline")
    
    top_risk_factors = Column(JSON, nullable=True)         # JSON list of factor dicts
    clinical_recommendations = Column(JSON, nullable=True)  # JSON list of recommendation strings
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    encounter = relationship("Encounter", back_populates="predictions")
    predicted_by_user = relationship("User", back_populates="predictions")
