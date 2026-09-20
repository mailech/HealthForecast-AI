from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    patient_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True
    )

    uploaded_by_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    file_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    extracted_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
