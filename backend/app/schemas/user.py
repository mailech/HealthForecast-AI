from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleRead(RoleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role_name: str
    department: Optional[str] = None

class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: RoleRead
    department: Optional[str] = None
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
