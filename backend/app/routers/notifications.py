import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update, or_, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import get_current_user
from app.db.database import get_db
from app.models.notification import Notification
from app.models.user import User, UserRole
from app.schemas.notification import NotificationResponse, UnreadCountResponse, MarkReadResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def format_notification(n: Notification) -> NotificationResponse:
    metadata_dict = None
    if n.metadata_json:
        try:
            metadata_dict = json.loads(n.metadata_json)
        except Exception:
            metadata_dict = None

    return NotificationResponse(
        id=n.id,
        user_id=n.user_id,
        target_role=n.target_role,
        type=n.type,
        title=n.title,
        message=n.message,
        is_read=n.is_read,
        created_at=n.created_at,
        related_entity_type=n.related_entity_type,
        related_entity_id=n.related_entity_id,
        metadata=metadata_dict,
    )


def build_user_filter(current_user: User):
    if current_user.role == UserRole.SYSTEM_ADMIN:
        return True  # Sys admin can view all notifications
    
    role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    role_name = current_user.role.name if hasattr(current_user.role, 'name') else str(current_user.role)
    
    return or_(
        Notification.user_id == current_user.id,
        Notification.target_role.ilike(role_val),
        Notification.target_role.ilike(role_name),
        Notification.target_role == "all",
        Notification.target_role.is_(None),
    )


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all notifications for the authenticated user based on role and ID."""
    # Check approaching appointment reminders dynamically
    await NotificationService.check_and_generate_appointment_reminders(db)

    user_filter = build_user_filter(current_user)
    stmt = (
        select(Notification)
        .where(user_filter)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    notifications = result.scalars().all()

    return [format_notification(n) for n in notifications]


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the count of unread notifications for the current user."""
    user_filter = build_user_filter(current_user)
    stmt = (
        select(func.count(Notification.id))
        .where(and_(user_filter, Notification.is_read == False))
    )
    count = await db.scalar(stmt)
    return UnreadCountResponse(unread_count=count or 0)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an individual notification as read."""
    user_filter = build_user_filter(current_user)
    stmt = select(Notification).where(
        and_(Notification.id == notification_id, user_filter)
    )
    notif = await db.scalar(stmt)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied",
        )

    notif.is_read = True
    await db.commit()
    await db.refresh(notif)
    return format_notification(notif)


@router.patch("/mark-all-read", response_model=MarkReadResponse)
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all unread notifications belonging to the current user as read."""
    user_filter = build_user_filter(current_user)
    
    # Get matching unread ids
    stmt = select(Notification.id).where(
        and_(user_filter, Notification.is_read == False)
    )
    result = await db.execute(stmt)
    ids_to_update = result.scalars().all()

    if ids_to_update:
        update_stmt = (
            update(Notification)
            .where(Notification.id.in_(ids_to_update))
            .values(is_read=True)
        )
        await db.execute(update_stmt)
        await db.commit()

    return MarkReadResponse(success=True, marked_count=len(ids_to_update))


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification_detail(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full details of a specific notification."""
    user_filter = build_user_filter(current_user)
    stmt = select(Notification).where(
        and_(Notification.id == notification_id, user_filter)
    )
    notif = await db.scalar(stmt)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied",
        )

    return format_notification(notif)

