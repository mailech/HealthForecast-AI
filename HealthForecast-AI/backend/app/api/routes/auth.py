from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models import AuditLog, User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Public registration. Self-registered accounts are always doctors.

    Privileged roles must be created by a System Administrator through /users.
    Passwords are stored only as bcrypt hashes, never as plain text.
    """
    email = payload.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role="doctor",
        hospital=payload.hospital.strip(),
        is_active=True,
    )
    db.add(user)
    db.flush()
    db.add(AuditLog(user_id=user.id, action="REGISTER", details="Self-registration completed"))
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    db.add(AuditLog(user_id=user.id, action="LOGIN", details="Successful login"))
    db.commit()
    return {
        "access_token": create_access_token(str(user.id), user.role),
        "user": user,
    }


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return user
