from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.services.user_service import UserService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/users", tags=["Users Management"])

# Enforce System Administrator permissions globally on this router
admin_dependency = Depends(RoleChecker(allowed_roles=["System Administrator"]))

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[admin_dependency])
def create_user(user_in: UserCreate):
    """
    Creates a new user account (Admin only).
    """
    user = UserService.create_user(user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    return user

@router.get("", response_model=List[UserResponse], dependencies=[admin_dependency])
def list_users(skip: int = 0, limit: int = 100):
    """
    Lists users in the system (Admin only).
    """
    return UserService.get_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse, dependencies=[admin_dependency])
def get_user(user_id: str):
    """
    Retrieves user details by ID (Admin only).
    """
    user = UserService.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return user

@router.put("/{user_id}", response_model=UserResponse, dependencies=[admin_dependency])
def update_user(user_id: str, user_in: UserUpdate):
    """
    Updates a user's details or credentials (Admin only).
    """
    user = UserService.update_user(user_id, user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or update failed."
        )
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[admin_dependency])
def delete_user(user_id: str):
    """
    Deletes a user account (Admin only).
    """
    success = UserService.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or delete failed."
        )
