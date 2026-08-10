import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # doctor | hospital_admin | researcher | system_admin  (see app.core.rbac.Role)
    role: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # For doctors: which hospital/department they're scoped to (drives
    # "assigned patients only" restriction from the Access Matrix).
    hospital_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    # For role=patient only: which Patient record this login belongs to.
    # A patient account can only ever see their own data via this link.
    patient_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True
    )

    # For role=patient only: the mobile number they sign in with, copied from
    # their Patient record at signup time so login doesn't need a join.
    phone_number: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    assigned_patients = relationship(
        "PatientAssignment", back_populates="doctor", cascade="all, delete-orphan"
    )
