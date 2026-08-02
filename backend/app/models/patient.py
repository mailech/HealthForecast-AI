from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_nbr = Column(Integer, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    race = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(String, nullable=False)  # e.g., '[70-80)'
    weight = Column(String, nullable=True)
    payer_code = Column(String, nullable=True)
    assigned_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assigned_doctor = relationship("User", back_populates="patients")
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
