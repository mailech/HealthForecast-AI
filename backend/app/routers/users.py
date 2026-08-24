from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.services.user_service import UserService
from app.core.rbac import RoleChecker
from app.models.user import UserRole

router = APIRouter(prefix="/users", tags=["User Management"])

# Admin Access Requirement
allow_admin_only = RoleChecker([UserRole.SYSTEM_ADMIN, UserRole.HOSPITAL_ADMIN])


@router.get("/", response_model=List[UserResponse], dependencies=[Depends(allow_admin_only)])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    role: Optional[UserRole] = Query(None, description="Filter users by role"),
    search: Optional[str] = Query(None, description="Search users by name or email"),
    db: AsyncSession = Depends(get_db)
):
    """List users with Search and Role Filter support (Admins only)."""
    return await UserService.get_all(db, skip=skip, limit=limit, role=role, search=search)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin_only)])
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create new user manually (Admins only)."""
    return await UserService.create(db, user_in)


@router.get("/{user_id}", response_model=UserResponse, dependencies=[Depends(allow_admin_only)])
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get user by ID (Admins only)."""
    user = await UserService.get_by_id(db, user_id)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse, dependencies=[Depends(allow_admin_only)])
async def update_user(user_id: int, user_in: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update user by ID (Admins only)."""
    return await UserService.update(db, user_id, user_in)


@router.delete("/{user_id}", response_model=UserResponse, dependencies=[Depends(allow_admin_only)])
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Delete user by ID (Admins only)."""
    return await UserService.delete(db, user_id)


@router.post("/{user_id}/activate", response_model=UserResponse, dependencies=[Depends(allow_admin_only)])
async def activate_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Activate a user account (Admins only)."""
    from app.schemas.user import UserUpdate
    return await UserService.update(db, user_id, UserUpdate(is_active=True))


@router.post("/{user_id}/deactivate", response_model=UserResponse, dependencies=[Depends(allow_admin_only)])
async def deactivate_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Deactivate a user account (Admins only)."""
    from app.schemas.user import UserUpdate
    return await UserService.update(db, user_id, UserUpdate(is_active=False))