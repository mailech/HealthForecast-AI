from fastapi import APIRouter, Depends, status, HTTPException

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.patient import PatientCreate, PatientResponse
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.services.patient_service import PatientService

from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.appointment import Appointment
from app.models.treatment import Treatment
from app.models.user import UserRole


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


# ============================================================
# GET ALL PATIENTS
# ============================================================
@router.get(
    "/",
    response_model=list[PatientResponse],
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
async def list_patients(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Patient).order_by(Patient.id)
    )

    patients = result.scalars().all()

    response_list = []

    for patient in patients:
        latest_pred = await db.scalar(
            select(Prediction)
            .where(
                Prediction.patient_id == patient.id
            )
            .order_by(
                Prediction.created_at.desc()
            )
        )

        response_list.append(
            PatientResponse(
                id=patient.id,
                mrn=patient.mrn,
                first_name=patient.first_name,
                last_name=patient.last_name,
                gender=patient.gender,
                age=patient.age,
                diagnosis=patient.diagnosis,
                department=patient.department,
                admission_date=patient.admission_date,
                risk_category=(
                    latest_pred.risk_category
                    if latest_pred
                    else None
                ),
                risk_score=(
                    latest_pred.readmission_risk_score
                    if latest_pred
                    else None
                ),
            )
        )

    return response_list


# ============================================================
# GET ONE PATIENT
# ============================================================
@router.get(
    "/{patient_id}",
    response_model=PatientResponse
)
async def get_patient(
    patient_id: int,

    _: UserRole = Depends(
        RoleChecker([
            UserRole.DOCTOR,
            UserRole.HOSPITAL_ADMIN,
            UserRole.RESEARCHER,
            UserRole.SYSTEM_ADMIN
        ])
    ),

    db: AsyncSession = Depends(get_db),
):
    patient = await PatientService.get_patient_by_id(
        db,
        patient_id
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    latest_pred = await db.scalar(
        select(Prediction)
        .where(
            Prediction.patient_id == patient.id
        )
        .order_by(
            Prediction.created_at.desc()
        )
    )

    return PatientResponse(
        id=patient.id,
        mrn=patient.mrn,
        first_name=patient.first_name,
        last_name=patient.last_name,
        gender=patient.gender,
        age=patient.age,
        diagnosis=patient.diagnosis,
        department=patient.department,
        admission_date=patient.admission_date,
        risk_category=(
            latest_pred.risk_category
            if latest_pred
            else None
        ),
        risk_score=(
            latest_pred.readmission_risk_score
            if latest_pred
            else None
        ),
    )


# ============================================================
# CREATE PATIENT
# ============================================================
@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_patient(
    patient_in: PatientCreate,

    _: UserRole = Depends(
        RoleChecker([
            UserRole.DOCTOR,
            UserRole.HOSPITAL_ADMIN,
            UserRole.SYSTEM_ADMIN
        ])
    ),

    db: AsyncSession = Depends(get_db),
):
    return await PatientService.create_patient(
        db,
        patient_in
    )


# ============================================================
# DELETE PATIENT PERMANENTLY
# ============================================================
@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_patient(
    patient_id: int,

    _: UserRole = Depends(
        RoleChecker([
            UserRole.DOCTOR,
            UserRole.HOSPITAL_ADMIN,
            UserRole.SYSTEM_ADMIN
        ])
    ),

    db: AsyncSession = Depends(get_db),
):
    # --------------------------------------------------------
    # Check whether patient exists
    # --------------------------------------------------------
    patient = await PatientService.get_patient_by_id(
        db,
        patient_id
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    try:
        # ----------------------------------------------------
        # 1. Get prediction IDs belonging to this patient
        # ----------------------------------------------------
        prediction_ids = (
            select(Prediction.id)
            .where(
                Prediction.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 2. Delete recommendations
        # Recommendations depend on predictions
        # ----------------------------------------------------
        await db.execute(
            delete(Recommendation)
            .where(
                Recommendation.prediction_id.in_(
                    prediction_ids
                )
            )
        )

        # ----------------------------------------------------
        # 3. Delete predictions
        # ----------------------------------------------------
        await db.execute(
            delete(Prediction)
            .where(
                Prediction.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 4. Delete appointments
        # ----------------------------------------------------
        await db.execute(
            delete(Appointment)
            .where(
                Appointment.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 5. Delete treatments
        # ----------------------------------------------------
        await db.execute(
            delete(Treatment)
            .where(
                Treatment.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 6. Delete patient
        # ----------------------------------------------------
        await db.delete(patient)

        # ----------------------------------------------------
        # 7. Commit permanent deletion
        # ----------------------------------------------------
        await db.commit()

        return None

    except Exception as e:
        # ----------------------------------------------------
        # Rollback if any deletion fails
        # ----------------------------------------------------
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete patient: {str(e)}"
        )