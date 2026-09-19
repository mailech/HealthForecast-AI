import json
import logging
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User, UserRole

logger = logging.getLogger("healthforecast_ai.notifications")


class NotificationService:
    @staticmethod
    async def create_notification(
        db: AsyncSession,
        type: str,
        title: str,
        message: str,
        user_id: int | None = None,
        target_role: str | None = "all",
        related_entity_type: str | None = None,
        related_entity_id: int | None = None,
        metadata: dict | None = None,
        event_key: str | None = None,
    ) -> Notification | None:
        """Create a notification if event_key is unique, avoiding duplicates."""
        try:
            if event_key:
                existing = await db.scalar(
                    select(Notification).where(Notification.event_key == event_key)
                )
                if existing:
                    return existing

            notif = Notification(
                user_id=user_id,
                target_role=target_role,
                type=type,
                title=title,
                message=message,
                is_read=False,
                related_entity_type=related_entity_type,
                related_entity_id=related_entity_id,
                metadata_json=json.dumps(metadata) if metadata else None,
                event_key=event_key,
            )
            db.add(notif)
            await db.flush()
            return notif
        except Exception as e:
            logger.error(f"Error creating notification: {e}", exc_info=True)
            return None

    @staticmethod
    async def check_and_generate_appointment_reminders(db: AsyncSession):
        """Scan scheduled appointments and generate approaching reminders without duplicates."""
        try:
            today = date.today()
            # Fetch appointments scheduled for today or tomorrow
            stmt = select(Appointment).where(
                and_(
                    Appointment.status == "scheduled",
                    Appointment.appointment_date >= today,
                    Appointment.appointment_date <= today + timedelta(days=1),
                )
            )
            result = await db.execute(stmt)
            appointments = result.scalars().all()

            now = datetime.now()

            for appt in appointments:
                # Combine appointment date and time into a datetime object
                appt_dt = datetime.combine(appt.appointment_date, appt.appointment_time)
                
                # If appointment has already passed, skip
                if appt_dt < now:
                    continue

                diff_minutes = (appt_dt - now).total_seconds() / 60.0

                # Determine trigger threshold from reminder_timing
                timing_str = (appt.reminder_timing or "At appointment time").lower()
                threshold_minutes = 60  # default 1 hour before

                if "15" in timing_str:
                    threshold_minutes = 15
                elif "30" in timing_str:
                    threshold_minutes = 30
                elif "1 hour" in timing_str or "60" in timing_str:
                    threshold_minutes = 60
                elif "2 hour" in timing_str:
                    threshold_minutes = 120
                elif "1 day" in timing_str or "24" in timing_str:
                    threshold_minutes = 1440
                elif "at appointment" in timing_str:
                    threshold_minutes = 30

                # If within the window
                if 0 <= diff_minutes <= threshold_minutes:
                    event_key = f"reminder:appointment_{appt.id}:{threshold_minutes}m"
                    
                    # Check if already generated
                    existing = await db.scalar(
                        select(Notification).where(Notification.event_key == event_key)
                    )
                    if not existing:
                        patient = await db.scalar(
                            select(Patient).where(Patient.id == appt.patient_id)
                        )
                        doctor = await db.scalar(
                            select(User).where(User.id == appt.doctor_id)
                        )
                        patient_name = (
                            f"{patient.first_name} {patient.last_name}"
                            if patient
                            else f"Patient #{appt.patient_id}"
                        )
                        doctor_name = doctor.full_name if doctor else f"Doctor #{appt.doctor_id}"

                        time_str = appt.appointment_time.strftime("%I:%M %p")
                        date_str = appt.appointment_date.strftime("%d %B %Y")

                        await NotificationService.create_notification(
                            db=db,
                            type="reminder",
                            title="Appointment Reminder",
                            message=f"Upcoming appointment with {patient_name} scheduled for {date_str} at {time_str}.",
                            user_id=appt.doctor_id,
                            target_role="Doctor",
                            related_entity_type="appointment",
                            related_entity_id=appt.id,
                            metadata={
                                "appointment_id": appt.id,
                                "patient_id": appt.patient_id,
                                "patient_name": patient_name,
                                "doctor_id": appt.doctor_id,
                                "doctor_name": doctor_name,
                                "appointment_date": date_str,
                                "appointment_time": time_str,
                                "status": appt.status,
                                "reminder_timing": appt.reminder_timing,
                            },
                            event_key=event_key,
                        )
        except Exception as e:
            logger.error(f"Error checking appointment reminders: {e}", exc_info=True)

