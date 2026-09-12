from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.auth import require_roles
from backend.auth_database import (
    create_user,
    list_users,
    update_user_role,
    set_user_active,
    delete_user,
)


router = APIRouter(prefix="/users", tags=["User Management"])


class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=150)
    role: str


class RoleUpdateRequest(BaseModel):
    role: str


class ActiveUpdateRequest(BaseModel):
    is_active: bool


ALLOWED_ROLES = {
    "doctor",
    "hospital_admin",
    "healthcare_researcher",
    "system_admin",
}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_data: CreateUserRequest,
    current_user=Depends(require_roles("system_admin")),
):
    if user_data.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    try:
        user = create_user(
            username=user_data.username,
            password=user_data.password,
            full_name=user_data.full_name,
            role=user_data.role,
        )

        return {
            "message": "User created successfully",
            "user": user,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get("/")
def get_users(
    current_user=Depends(require_roles("system_admin")),
):
    return {
        "users": list_users()
    }


@router.put("/{user_id}/role")
def change_user_role(
    user_id: int,
    role_data: RoleUpdateRequest,
    current_user=Depends(require_roles("system_admin")),
):
    if role_data.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    updated = update_user_role(
        user_id,
        role_data.role
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User role updated successfully"
    }


@router.put("/{user_id}/status")
def change_user_status(
    user_id: int,
    status_data: ActiveUpdateRequest,
    current_user=Depends(require_roles("system_admin")),
):
    updated = set_user_active(
        user_id,
        status_data.is_active
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User status updated successfully"
    }


@router.delete("/{user_id}")
def remove_user(
    user_id: int,
    current_user=Depends(require_roles("system_admin")),
):
    deleted = delete_user(user_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User deleted successfully"
    }
