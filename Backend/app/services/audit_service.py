from datetime import datetime
from typing import List, Optional
from app.database import db

audit_collection = db["audit_logs"]

class AuditService:
    @staticmethod
    def log_event(
        user_id: Optional[str],
        user_email: str,
        user_role: str,
        action: str,
        target_resource: Optional[str] = None,
        details: Optional[str] = None
    ):
        try:
            doc = {
                "user_id": str(user_id) if user_id else None,
                "user_email": user_email,
                "user_role": user_role,
                "action": action,
                "target_resource": target_resource,
                "details": details,
                "timestamp": datetime.utcnow()
            }
            audit_collection.insert_one(doc)
        except Exception as e:
            print(f"Failed to record audit log: {e}")

    @staticmethod
    def get_logs(skip: int = 0, limit: int = 100) -> List[dict]:
        logs = list(audit_collection.find().sort("timestamp", -1).skip(skip).limit(limit))
        for item in logs:
            item["_id"] = str(item["_id"])
            if hasattr(item.get("timestamp"), "isoformat"):
                item["timestamp"] = item["timestamp"].isoformat()
        return logs
