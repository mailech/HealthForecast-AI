from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class ClinicalAssessment(Base):
    __tablename__ = "clinical_assessments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False,
        unique=True
    )

    # ---------------- Admission Features ----------------

    admission_type_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    discharge_disposition_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    admission_source_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=7
    )

    time_in_hospital: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=4
    )

    # ---------------- Clinical Activity ----------------

    num_lab_procedures: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=40
    )

    num_procedures: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    num_medications: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=12
    )

    # ---------------- Previous Utilization ----------------

    number_outpatient: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    number_emergency: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    number_inpatient: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    number_diagnoses: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=5
    )

    # ---------------- Laboratory Results ----------------

    max_glu_serum: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    A1Cresult: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    # ---------------- Medication Information ----------------

    metformin: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    repaglinide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    nateglinide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    chlorpropamide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    glimepiride: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    acetohexamide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    glipizide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    glyburide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    tolbutamide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    pioglitazone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    rosiglitazone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    acarbose: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    miglitol: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    troglitazone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    tolazamide: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    insulin: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    # ---------------- Combination Medications ----------------

    glyburide_metformin: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    glipizide_metformin: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    glimepiride_pioglitazone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    metformin_rosiglitazone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    metformin_pioglitazone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    # ---------------- Medication Status ----------------

    change: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No"
    )

    diabetesMed: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Yes"
    )

    # ---------------- Engineered Features ----------------

    race: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Caucasian"
    )

    diag_1_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Diabetes"
    )

    diag_2_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Other"
    )

    diag_3_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Other"
    )

    prior_utilization: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    medication_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    medication_changed: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    diabetes_medication: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    clinical_activity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=53
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="clinical_assessment"
    )