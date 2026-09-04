from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, func, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    admission_number = Column(String(50), unique=True, nullable=False, index=True)
    admission_date = Column(Date, nullable=False)
    discharge_date = Column(Date)
    admission_type = Column(String(50))
    department = Column(String(100))
    room_number = Column(String(20))
    attending_physician = Column(String(255))
    diagnosis = Column(String(500))
    discharge_diagnosis = Column(String(500))
    length_of_stay = Column(Integer)
    readmission_flag = Column(String(10), default='No')
    readmission_reason = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("Patient", backref="admissions")
