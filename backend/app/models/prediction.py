from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String(20), nullable=False)
    readmission_probability = Column(Float, nullable=False)
    model_used = Column(String(50))
    feature_importance = Column(Text)
    clinical_insights = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="risk_predictions")


class ReadmissionForecast(Base):
    __tablename__ = "readmission_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    forecast_period_days = Column(Integer, default=30)
    readmission_probability = Column(Float, nullable=False)
    confidence_score = Column(Float)
    risk_factors = Column(Text)
    recommendations = Column(Text)
    forecast_report = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="readmission_forecasts")
