from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Treatment(Base):
    __tablename__ = "treatments"

    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id"), nullable=False)
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    treatment_plan: Mapped[str] = mapped_column(Text, nullable=True)