from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.object_id import PyObjectId

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str  # Doctor, Researcher, Admin, SysAdmin
    hospital: Optional[str] = "General Hospital"
    is_active: bool = True
    must_change_password: bool = False
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    hospital: Optional[str] = None
    is_active: Optional[bool] = None
    must_change_password: Optional[bool] = None
    profile_picture: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            PyObjectId: str
        }
    }
