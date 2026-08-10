"""
Import every model module here so Base.metadata is fully populated when
Alembic autogenerates migrations, and when create_all() runs in dev.
"""
from app.models.user import User  # noqa: F401
from app.models.patient import (  # noqa: F401
    Patient,
    PatientAssignment,
    MedicalHistoryEntry,
    Admission,
    RiskScore,
    TreatmentEvaluation,
    Bill,
)
