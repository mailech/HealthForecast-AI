from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])

clinical_roles = RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN])


async def appointment_response(db: AsyncSession, appointment: Appointment) -> AppointmentResponse:
    patient = await db.scalar(select(Patient).where(Patient.id == appointment.patient_id))
    doctor = await db.scalar(select(User).where(User.id == appointment.doctor_id))
    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        status=appointment.status,
        notes=appointment.notes,
        patient_name=f"{patient.first_name} {patient.last_name}",
        doctor_name=doctor.full_name,
    )


@router.get("/", response_model=list[AppointmentResponse])
async def list_appointments(
    current_user: User = Depends(clinical_roles),
    db: AsyncSession = Depends(get_db),
    appointment_date: date | None = Query(None),
):
    query = select(Appointment).order_by(Appointment.appointment_date, Appointment.appointment_time)
    if current_user.role == UserRole.DOCTOR:
        query = query.where(Appointment.doctor_id == current_user.id)
    if appointment_date:
        query = query.where(Appointment.appointment_date == appointment_date)
    appointments = (await db.execute(query)).scalars().all()
    return [await appointment_response(db, item) for item in appointments]


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(clinical_roles),
    db: AsyncSession = Depends(get_db),
):
    if payload.appointment_date < date.today():
        raise HTTPException(status_code=422, detail="Appointment date cannot be in the past")
    patient = await db.scalar(select(Patient).where(Patient.id == payload.patient_id))
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = await db.scalar(select(User).where(User.id == payload.doctor_id))
    if doctor is None or doctor.role != UserRole.DOCTOR:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if current_user.role == UserRole.DOCTOR and payload.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Doctors may only schedule their own appointments")

    appointment = Appointment(**payload.model_dump(), status="scheduled")
    db.add(appointment)
    await db.flush()
    return await appointment_response(db, appointment)
