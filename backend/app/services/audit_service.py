from sqlalchemy.orm import Session
from app.models.models import AuditLogDB, UserDB

def log_action(db: Session, user: UserDB, action: str, resource: str, status: str = "SUCCESS"):
    log = AuditLogDB(
        user_email=user.email,
        role=user.role,
        action=action,
        resource=resource,
        status=status
    )
    db.add(log)
    db.commit()
