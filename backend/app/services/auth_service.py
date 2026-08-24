from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models.user import User
from app.schemas.user import UserCreate, Token
from app.services.user_service import UserService
from app.core.security import verify_password, create_access_token


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