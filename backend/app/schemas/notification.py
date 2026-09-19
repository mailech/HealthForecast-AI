import json
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, field_validator


class NotificationResponse(BaseModel):
    id: int
    user_id: int | None = None
    target_role: str | None = None
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    related_entity_type: str | None = None
    related_entity_id: int | None = None
    metadata: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)


class UnreadCountResponse(BaseModel):
    unread_count: int


class MarkReadResponse(BaseModel):
    success: bool
    marked_count: int

