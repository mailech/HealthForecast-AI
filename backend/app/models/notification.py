from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    target_role: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True, default="all")
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'high_risk', 'appointment', 'reminder', 'report', 'system'
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    related_entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # 'patient', 'prediction', 'appointment', 'report'
    related_entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_key: Mapped[str | None] = mapped_column(String(200), unique=True, nullable=True, index=True)

