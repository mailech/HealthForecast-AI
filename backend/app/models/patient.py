from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Patient(Base):
    __tablename__ = "patients"

    mrn: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    gender: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    age: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    # NEW FIELDS
    diagnosis: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    department: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    admission_date: Mapped[Date | None] = mapped_column(
        Date,
        nullable=True
    )