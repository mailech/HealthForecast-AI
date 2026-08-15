from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/register")
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    existing = crud.get_user_by_email(
        db,
        user.email,
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    return crud.create_user(db, user)


@router.post("/login")
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(
        db,
        user.email,
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if db_user.password != user.password:
        raise HTTPException(
            status_code=401,
            detail="Wrong password",
        )

    return {
        "message": "Login Successful",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }