from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # doctor, hospital_admin, researcher, system_admin


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String, nullable=False)
    medical_record_number = Column(String, unique=True, index=True, nullable=False)
    diagnosis = Column(String, nullable=True)
    admission_date = Column(Date, nullable=True)
    discharge_date = Column(Date, nullable=True)
    assigned_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    treatment_name = Column(String, nullable=False)
    medication = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    outcome = Column(String, nullable=True)  # e.g. "Improved", "No Change", "Worsened"
    notes = Column(String, nullable=True)