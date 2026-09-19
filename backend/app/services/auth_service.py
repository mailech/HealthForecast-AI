import secrets
import time
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models.user import User
from app.schemas.user import UserCreate, Token
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.core.security import verify_password, create_access_token, get_password_hash

# In-memory storage for OTPs and Reset Tokens
# Format: email -> {"code": "123456", "expires_at": timestamp}
_OTP_STORE = {}
# Format: token -> {"email": "sarah@hospital.com", "expires_at": timestamp}
_RESET_TOKEN_STORE = {}


def _mask_email(email: str) -> str:
    parts = email.split("@")
    if len(parts) != 2:
        return email
    name, domain = parts
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"


class AuthService:

    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
        return await UserService.create(db, user_in)

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
        user = await UserService.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password."
            )
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password."
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )
        return user

    @staticmethod
    async def login_user(db: AsyncSession, form_data: OAuth2PasswordRequestForm) -> Token:
        user = await AuthService.authenticate_user(db, form_data.username, form_data.password)
        access_token = create_access_token(subject=user.email, role=user.role.value)
        return Token(access_token=access_token, token_type="bearer")

    @staticmethod
    async def request_password_reset(db: AsyncSession, email: str) -> dict:
        user = await UserService.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account is registered with this email address."
            )

        # Generate secure 6-digit OTP
        otp_code = f"{secrets.randbelow(1000000):06d}"
        expires_at = time.time() + 600  # 10 minutes TTL

        _OTP_STORE[email.lower()] = {
            "code": otp_code,
            "expires_at": expires_at,
        }

        # Send email to the user's actual registered email address
        EmailService.send_otp_email(user.email, otp_code)

        return {
            "message": "Verification code sent to registered email address.",
            "masked_email": _mask_email(user.email),
            "email": user.email,
        }

    @staticmethod
    async def verify_otp(email: str, otp: str) -> dict:
        stored = _OTP_STORE.get(email.lower())
        if not stored:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No verification code was requested for this email address."
            )

        if time.time() > stored["expires_at"]:
            _OTP_STORE.pop(email.lower(), None)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new code."
            )

        if stored["code"] != otp.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code."
            )

        # OTP verified! Generate single-use reset token
        reset_token = secrets.token_urlsafe(32)
        _RESET_TOKEN_STORE[reset_token] = {
            "email": email.lower(),
            "expires_at": time.time() + 900,  # 15 minutes TTL
        }

        # Clear used OTP
        _OTP_STORE.pop(email.lower(), None)

        return {
            "message": "OTP verified successfully.",
            "reset_token": reset_token,
        }

    @staticmethod
    async def reset_password_with_token(db: AsyncSession, reset_token: str, new_password: str) -> dict:
        stored = _RESET_TOKEN_STORE.get(reset_token)
        if not stored or time.time() > stored["expires_at"]:
            _RESET_TOKEN_STORE.pop(reset_token, None)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset session has expired or is invalid. Please request a new verification code."
            )

        email = stored["email"]
        user = await UserService.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )

        # Update password in DB
        user.password_hash = get_password_hash(new_password)
        await db.commit()

        # Invalidate reset token
        _RESET_TOKEN_STORE.pop(reset_token, None)

        return {
            "message": "Password reset successfully.",
        }