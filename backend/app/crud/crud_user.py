from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.user import User, Role
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(
        select(User).options(selectinload(User.role)).filter(User.email == email)
    )
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(
        select(User).options(selectinload(User.role)).filter(User.id == user_id)
    )
    return result.scalars().first()

async def get_role_by_name(db: AsyncSession, role_name: str) -> Optional[Role]:
    result = await db.execute(select(Role).filter(Role.name == role_name))
    return result.scalars().first()

async def get_all_roles(db: AsyncSession) -> List[Role]:
    result = await db.execute(select(Role))
    return list(result.scalars().all())

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    role = await get_role_by_name(db, user_in.role_name)
    if not role:
        raise ValueError(f"Role '{user_in.role_name}' does not exist.")
        
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role_id=role.id,
        department=user_in.department,
        is_active=True
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def seed_initial_roles_and_admin(db: AsyncSession):
    roles = [
        {"name": "Doctor", "description": "Clinical practitioner view & readmission risk forecasting"},
        {"name": "Hospital Administrator", "description": "Executive dashboard, bed allocation & operational analytics"},
        {"name": "Healthcare Researcher", "description": "Treatment efficacy analytics & cohort studies"},
        {"name": "System Administrator", "description": "User management, dataset ingestion, audit trail"}
    ]
    
    for r in roles:
        existing = await get_role_by_name(db, r["name"])
        if not existing:
            new_role = Role(name=r["name"], description=r["description"])
            db.add(new_role)
    await db.commit()
    
    # Create default demo accounts for each role if they don't exist
    demo_users = [
        ("admin@hospital.org", "Admin@123", "System Administrator", "System Administrator", "IT & Ops"),
        ("doctor@hospital.org", "Doctor@123", "Dr. Sarah Jenkins", "Doctor", "Endocrinology"),
        ("hospital_admin@hospital.org", "Admin@123", "Robert Vance (Director)", "Hospital Administrator", "Executive Management"),
        ("researcher@hospital.org", "Research@123", "Dr. Alan Turing", "Healthcare Researcher", "Clinical Analytics")
    ]
    
    for email, password, full_name, role_name, dept in demo_users:
        existing_user = await get_user_by_email(db, email)
        if not existing_user:
            user_in = UserCreate(
                email=email,
                password=password,
                full_name=full_name,
                role_name=role_name,
                department=dept
            )
            await create_user(db, user_in)
