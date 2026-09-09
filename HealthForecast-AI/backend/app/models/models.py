from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class User(Base):
    __tablename__="users"
    id:Mapped[int]=mapped_column(primary_key=True)
    full_name:Mapped[str]=mapped_column(String(120))
    email:Mapped[str]=mapped_column(String(255),unique=True,index=True)
    password_hash:Mapped[str]=mapped_column(String(255))
    role:Mapped[str]=mapped_column(String(40),default="doctor")
    hospital:Mapped[str]=mapped_column(String(120),default="Demo Hospital")
    is_active:Mapped[bool]=mapped_column(Boolean,default=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
    patients:Mapped[list["Patient"]]=relationship(back_populates="doctor")

class Patient(Base):
    __tablename__="patients"
    id:Mapped[int]=mapped_column(primary_key=True)
    mrn:Mapped[str]=mapped_column(String(40),unique=True,index=True)
    full_name:Mapped[str]=mapped_column(String(120))
    age:Mapped[int]=mapped_column(Integer)
    gender:Mapped[str]=mapped_column(String(20),default="Unknown")
    diagnosis:Mapped[str]=mapped_column(String(255),default="Diabetes")
    dataset_encounter_id:Mapped[str|None]=mapped_column(String(40),unique=True,index=True,nullable=True)
    dataset_patient_nbr:Mapped[str|None]=mapped_column(String(40),index=True,nullable=True)
    admission_type:Mapped[str|None]=mapped_column(String(120),nullable=True)
    discharge_disposition:Mapped[str|None]=mapped_column(String(255),nullable=True)
    admission_source:Mapped[str|None]=mapped_column(String(255),nullable=True)
    readmitted:Mapped[str|None]=mapped_column(String(10),nullable=True)
    a1c_result:Mapped[str|None]=mapped_column(String(20),nullable=True)
    diabetes_med:Mapped[str|None]=mapped_column(String(10),nullable=True)
    medication_change:Mapped[str|None]=mapped_column(String(10),nullable=True)
    insulin:Mapped[str|None]=mapped_column(String(20),nullable=True)
    doctor_id:Mapped[int|None]=mapped_column(ForeignKey("users.id"),nullable=True)
    hospital:Mapped[str]=mapped_column(String(120),default="Demo Hospital")
    time_in_hospital:Mapped[int]=mapped_column(Integer,default=3)
    num_lab_procedures:Mapped[int]=mapped_column(Integer,default=30)
    num_procedures:Mapped[int]=mapped_column(Integer,default=1)
    num_medications:Mapped[int]=mapped_column(Integer,default=8)
    number_outpatient:Mapped[int]=mapped_column(Integer,default=0)
    number_emergency:Mapped[int]=mapped_column(Integer,default=0)
    number_inpatient:Mapped[int]=mapped_column(Integer,default=0)
    number_diagnoses:Mapped[int]=mapped_column(Integer,default=3)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
    doctor:Mapped[User|None]=relationship(back_populates="patients")
    predictions:Mapped[list["Prediction"]]=relationship(back_populates="patient",cascade="all, delete-orphan")
    treatments:Mapped[list["Treatment"]]=relationship(back_populates="patient",cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__="predictions"
    id:Mapped[int]=mapped_column(primary_key=True)
    patient_id:Mapped[int]=mapped_column(ForeignKey("patients.id"))
    readmission_probability:Mapped[float]=mapped_column(Float)
    risk_category:Mapped[str]=mapped_column(String(30))
    model_version:Mapped[str]=mapped_column(String(50),default="demo-rf-v1")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
    patient:Mapped[Patient]=relationship(back_populates="predictions")

class Treatment(Base):
    __tablename__="treatments"
    id:Mapped[int]=mapped_column(primary_key=True)
    patient_id:Mapped[int]=mapped_column(ForeignKey("patients.id"))
    treatment_name:Mapped[str]=mapped_column(String(150))
    medication:Mapped[str]=mapped_column(String(150),default="")
    start_date:Mapped[str]=mapped_column(String(20))
    end_date:Mapped[str|None]=mapped_column(String(20),nullable=True)
    outcome:Mapped[str]=mapped_column(String(40),default="Ongoing")
    recovery_score:Mapped[float]=mapped_column(Float,default=0)
    effectiveness_score:Mapped[float]=mapped_column(Float,default=0)
    notes:Mapped[str]=mapped_column(Text,default="")
    patient:Mapped[Patient]=relationship(back_populates="treatments")

class AuditLog(Base):
    __tablename__="audit_logs"
    id:Mapped[int]=mapped_column(primary_key=True)
    user_id:Mapped[int|None]=mapped_column(ForeignKey("users.id"),nullable=True)
    action:Mapped[str]=mapped_column(String(120))
    details:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
