from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatusUpdate,
    AppointmentReschedule,
)

router = APIRouter(prefix="/appointments", tags=["Appointments"])

clinical_roles = RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN])
ALLOWED_STATUSES = {"scheduled", "completed", "missed", "cancelled"}


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
        reminder_timing=appointment.reminder_timing or "At appointment time",
        notes=appointment.notes,
        patient_name=f"{patient.first_name} {patient.last_name}" if patient else f"Patient #{appointment.patient_id}",
        doctor_name=doctor.full_name if doctor else f"Doctor #{appointment.doctor_id}",
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

    # Trigger Real New Appointment Notification
    from app.services.notification_service import NotificationService
    patient_name = f"{patient.first_name} {patient.last_name}"
    time_str = appointment.appointment_time.strftime("%I:%M %p")
    date_str = appointment.appointment_date.strftime("%d %B %Y")
    
    await NotificationService.create_notification(
        db=db,
        type="appointment",
        title="New Appointment",
        message=f"Appointment with {patient_name} is scheduled for {date_str} at {time_str}.",
        user_id=appointment.doctor_id,
        target_role="Doctor",
        related_entity_type="appointment",
        related_entity_id=appointment.id,
        metadata={
            "appointment_id": appointment.id,
            "patient_id": patient.id,
            "patient_name": patient_name,
            "doctor_id": doctor.id,
            "doctor_name": doctor.full_name,
            "appointment_date": date_str,
            "appointment_time": time_str,
            "status": "scheduled",
            "reminder_timing": appointment.reminder_timing,
        },
        event_key=f"new_appointment:appointment_{appointment.id}",
    )
    await db.commit()

    return await appointment_response(db, appointment)


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    current_user: User = Depends(clinical_roles),
    db: AsyncSession = Depends(get_db),
):
    status_lower = payload.status.lower()
    if status_lower not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{payload.status}'. Allowed values: {', '.join(sorted(ALLOWED_STATUSES))}"
        )

    appointment = await db.scalar(select(Appointment).where(Appointment.id == appointment_id))
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.role == UserRole.DOCTOR and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Doctors may only update their own appointments")

    appointment.status = status_lower
    await db.flush()

    # Trigger notification on status change if relevant
    from app.services.notification_service import NotificationService
    patient = await db.scalar(select(Patient).where(Patient.id == appointment.patient_id))
    patient_name = f"{patient.first_name} {patient.last_name}" if patient else f"Patient #{appointment.patient_id}"
    date_str = appointment.appointment_date.strftime("%d %B %Y")

    await NotificationService.create_notification(
        db=db,
        type="appointment",
        title=f"Appointment {status_lower.capitalize()}",
        message=f"Appointment for {patient_name} on {date_str} has been marked as {status_lower}.",
        user_id=appointment.doctor_id,
        target_role="Doctor",
        related_entity_type="appointment",
        related_entity_id=appointment.id,
        event_key=f"status_update:appointment_{appointment.id}:{status_lower}",
    )
    await db.commit()
    await db.refresh(appointment)
    return await appointment_response(db, appointment)


@router.post("/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: int,
    payload: AppointmentReschedule,
    current_user: User = Depends(clinical_roles),
    db: AsyncSession = Depends(get_db),
):
    if payload.appointment_date < date.today():
        raise HTTPException(status_code=422, detail="New appointment date cannot be in the past")

    appointment = await db.scalar(select(Appointment).where(Appointment.id == appointment_id))
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.role == UserRole.DOCTOR and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Doctors may only reschedule their own appointments")

    # Ensure original appointment status is preserved as missed
    if appointment.status != "missed":
        appointment.status = "missed"

    # Create linked new scheduled appointment
    new_appointment = Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        reminder_timing=payload.reminder_timing or appointment.reminder_timing,
        notes=payload.notes if payload.notes is not None else appointment.notes,
        status="scheduled",
    )
    db.add(new_appointment)
    await db.flush()

    # Trigger Notification for Reschedule
    from app.services.notification_service import NotificationService
    patient = await db.scalar(select(Patient).where(Patient.id == new_appointment.patient_id))
    patient_name = f"{patient.first_name} {patient.last_name}" if patient else f"Patient #{new_appointment.patient_id}"
    time_str = new_appointment.appointment_time.strftime("%I:%M %p")
    date_str = new_appointment.appointment_date.strftime("%d %B %Y")

    await NotificationService.create_notification(
        db=db,
        type="appointment",
        title="Appointment Rescheduled",
        message=f"Appointment with {patient_name} has been rescheduled to {date_str} at {time_str}.",
        user_id=new_appointment.doctor_id,
        target_role="Doctor",
        related_entity_type="appointment",
        related_entity_id=new_appointment.id,
        event_key=f"reschedule:appointment_{new_appointment.id}:{date_str}_{time_str}",
    )
    await db.commit()
    await db.refresh(new_appointment)
    return await appointment_response(db, new_appointment)


@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(clinical_roles),
    db: AsyncSession = Depends(get_db),
):
    appointment = await db.scalar(select(Appointment).where(Appointment.id == appointment_id))
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.role == UserRole.DOCTOR and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Doctors may only cancel their own appointments")

    appointment.status = "cancelled"
    await db.commit()
    await db.refresh(appointment)
    return await appointment_response(db, appointment)


