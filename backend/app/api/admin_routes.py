from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import AuditLogDB, UserDB
from app.auth.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["System Administration"])

@router.get("/logs")
def get_audit_logs(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if current_user.role != "System Administrator":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    logs = db.query(AuditLogDB).order_by(AuditLogDB.timestamp.desc()).limit(100).all()
    return logs

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if current_user.role != "System Administrator":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(UserDB).all()
    return [{"id": u.id, "email": u.email, "role": u.role, "full_name": u.full_name, "hospital_name": u.hospital_name} for u in users]

@router.post("/users")
def create_user(user_data: dict, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if current_user.role != "System Administrator":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from app.auth.auth import get_password_hash
    from fastapi import HTTPException
    existing = db.query(UserDB).filter(UserDB.email == user_data['email']).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    pwd = user_data.get('password', 'password123')
    new_user = UserDB(
        full_name=user_data['full_name'],
        email=user_data['email'],
        role=user_data.get('role', 'Doctor'),
        hospital_name=user_data.get('hospital_name', 'MetroHealth General Hospital'),
        hashed_password=get_password_hash(pwd)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email, "role": new_user.role, "full_name": new_user.full_name, "hospital_name": new_user.hospital_name}

@router.put("/users/{user_id}")
def update_user(user_id: int, user_data: dict, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if current_user.role != "System Administrator":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
        
    if 'full_name' in user_data: user.full_name = user_data['full_name']
    if 'email' in user_data: user.email = user_data['email']
    if 'role' in user_data: user.role = user_data['role']
    if 'hospital_name' in user_data: user.hospital_name = user_data['hospital_name']
    
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "role": user.role, "full_name": user.full_name, "hospital_name": user.hospital_name}

@router.get("/system-status")
def get_system_status(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if current_user.role != "System Administrator":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Load model metadata
    import os
    import json
    metadata = {}
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    meta_path = os.path.join(base_dir, "ml", "metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            metadata = json.load(f)
            
    return {
        "status": "online",
        "database": "connected",
        "model_metadata": metadata
    }
