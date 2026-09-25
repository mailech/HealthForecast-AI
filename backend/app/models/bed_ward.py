from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Ward(Base):
    __tablename__ = "wards"

    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    department: Mapped[str] = mapped_column(String(100), nullable=False)

    beds = relationship("Bed", back_populates="ward", cascade="all, delete-orphan")


class Bed(Base):
    __tablename__ = "beds"

    bed_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Available")
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    ward = relationship("Ward", back_populates="beds")
    patient = relationship("Patient")
