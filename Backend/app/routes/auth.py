from typing import Optional
from pydantic import BaseModel, Field
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.token import Token
from app.services.user_service import UserService
from app.services.audit_service import AuditService
from app.utils.security import verify_password, create_access_token, get_password_hash
from app.config import settings
from app.dependencies import get_current_user
from app.database import users_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    """
    Registers a new system user.
    """
    user = UserService.create_user(user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticates a user and returns a JWT access token.
    """
    user = UserService.get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.get("hashed_password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact your System Administrator.",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "role": user.get("role", ""),
            "user_id": str(user.get("_id", "")),
        },
        expires_delta=access_token_expires,
    )
    
    # Audit log login
    AuditService.log_event(
        user_id=str(user.get("_id")),
        user_email=user["email"],
        user_role=user.get("role", ""),
        action="LOGIN",
        details="User logged in successfully"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retrieves information about the currently logged in user.
    """
    return current_user

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """
    Updates the password for the current user (e.g. forced password change on first login).
    """
    user_id = current_user.get("_id")
    must_change = current_user.get("must_change_password", False)
    
    if not must_change and req.current_password:
        if not verify_password(req.current_password, current_user.get("hashed_password")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect."
            )
            
    new_hash = get_password_hash(req.new_password)
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"hashed_password": new_hash, "must_change_password": False}}
    )

    AuditService.log_event(
        user_id=str(user_id),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action="PASSWORD_CHANGED",
        details="User changed password"
    )

    return {"message": "Password updated successfully."}

@router.put("/me", response_model=UserResponse)
def update_my_profile(profile_in: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """
    Updates the profile of the currently authenticated user.
    """
    update_data = profile_in.model_dump(exclude_unset=True)
    if not update_data:
        return current_user
        
    user_id = str(current_user.get("_id"))
    updated_user = UserService.update_user(user_id, UserUpdate(**update_data))
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile."
        )
    return updated_user
