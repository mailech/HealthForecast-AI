from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.patient import PatientCreate, PatientResponse
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.services.patient_service import PatientService
from app.models.patient import Patient
from app.models.user import UserRole

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.get(
    "/",
    dependencies=[
        Depends(
            RoleChecker([
                UserRole.DOCTOR,
                UserRole.HOSPITAL_ADMIN,
                UserRole.RESEARCHER,
                UserRole.SYSTEM_ADMIN
            ])
        )
    ]
)
async def list_patients(db: AsyncSession = Depends(get_db)):
    """Fetch patients for the authenticated clinical team."""
    result = await db.execute(select(Patient).order_by(Patient.id))
    return result.scalars().all()


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    _: UserRole = Depends(RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    patient = await PatientService.get_patient_by_id(db, patient_id)
    if patient is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_in: PatientCreate,
    _: UserRole = Depends(RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Create a patient record."""
    return await PatientService.create_patient(db, patient_in)