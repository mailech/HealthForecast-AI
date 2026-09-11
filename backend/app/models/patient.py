from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_nbr = Column(String(50), unique=True, nullable=False, index=True)
    gender = Column(String(20), nullable=True)
    age_group = Column(String(20), nullable=True)
    race = Column(String(50), nullable=True)
    weight_group = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    encounters = relationship("Encounter", back_populates="patient", cascade="all, delete-orphan")
