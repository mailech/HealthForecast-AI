import enum
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    HOSPITAL_ADMIN = "hospital_admin"
    RESEARCHER = "researcher"
    SYSTEM_ADMIN = "system_admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, native_enum=False), nullable=False, default=UserRole.DOCTOR)
    department = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_patients = relationship("Patient", back_populates="assigned_doctor")
