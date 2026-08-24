from sqlalchemy import Float, String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id"), nullable=False)
    readmission_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_category: Mapped[str] = mapped_column(String(50), nullable=False)  # High, Medium, Low
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)