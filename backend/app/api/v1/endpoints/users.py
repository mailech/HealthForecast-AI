from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserCreate
from app.crud.crud_user import create_user, get_user_by_email
from app.api.deps import require_roles

router = APIRouter()

@router.get("", response_model=List[UserRead])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["System Administrator"]))
):
    result = await db.execute(select(User).options(selectinload(User.role)))
    return list(result.scalars().all())

@router.post("", response_model=UserRead)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["System Administrator"]))
):
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail=f"User with email {user_in.email} already exists.")
    user = await create_user(db, user_in)
    return user
