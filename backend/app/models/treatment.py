from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    admission_id = Column(Integer, ForeignKey("admissions.id"))
    treatment_name = Column(String(255), nullable=False)
    treatment_type = Column(String(100))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    dosage = Column(String(100))
    frequency = Column(String(100))
    prescribed_by = Column(String(255))
    notes = Column(Text)
    outcome = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("Patient", backref="treatments")
    admission = relationship("Admission", backref="treatments")
