from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=False)
    medication_name = Column(String, nullable=False) # e.g. Metformin, Insulin, Glipizide
    dosage_status = Column(String, nullable=False, default="Steady") # Up, Down, Steady, No

    admission = relationship("Admission", back_populates="medications")
