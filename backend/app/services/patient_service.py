from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient import Patient


class PatientService:
    """Service handling Patient CRUD & Management."""

    @staticmethod
    async def get_patient_by_id(
        db: AsyncSession,
        patient_id: int
    ):
        """Fetch a patient by database ID."""

        result = await db.execute(
            select(Patient).where(
                Patient.id == patient_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create_patient(
        db: AsyncSession,
        patient_data
    ):
        """Create a new patient record."""

        patient = Patient(
            **patient_data.model_dump()
        )

        db.add(patient)

        await db.commit()
        await db.refresh(patient)

        return patient