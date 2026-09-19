from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.user import (
    UserCreate, UserResponse, Token, UserUpdate,
    ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.core.rbac import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """User Registration Endpoint."""
    return await AuthService.register_user(db, user_in)


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """OAuth2 Compatible Login Endpoint."""
    return await AuthService.login_user(db, form_data)


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Request Password Recovery OTP for a registered email."""
    return await AuthService.request_password_reset(db, req.email)


@router.post("/verify-otp")
async def verify_otp(req: VerifyOtpRequest):
    """Verify 6-digit OTP code."""
    return await AuthService.verify_otp(req.email, req.otp)


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset Password using a verified Reset Token."""
    return await AuthService.reset_password_with_token(db, req.reset_token, req.new_password)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get Current Authenticated User Info."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update editable fields for the authenticated user."""
    editable_data = user_in.model_dump(
        exclude_unset=True,
        exclude={"role", "is_active"},
    )
    return await UserService.update(
        db,
        current_user.id,
        UserUpdate(**editable_data),
    )