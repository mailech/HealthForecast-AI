import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, users_collection
from app.utils.security import verify_password, get_password_hash

init_db()

demo_emails = [
    "doctor@hospital.com",
    "researcher@hospital.com",
    "admin@hospital.com",
    "sysadmin@hospital.com"
]

print("Checking demo accounts in MongoDB:")
for email in demo_emails:
    u = users_collection.find_one({"email": email})
    if not u:
        print(f"FAILED: User {email} NOT FOUND in MongoDB")
    else:
        pw_ok = verify_password("Password123", u.get("hashed_password", ""))
        is_active = u.get("is_active", True)
        role = u.get("role", "")
        print(f"User: {email} | Role: {role} | Active: {is_active} | Password 'Password123' Valid: {pw_ok}")

        # Reset password to Password123 if not valid
        if not pw_ok or not is_active:
            users_collection.update_one(
                {"email": email},
                {"$set": {
                    "hashed_password": get_password_hash("Password123"),
                    "is_active": True,
                    "must_change_password": False,
                    "role": "Doctor" if "doctor" in email else ("Researcher" if "researcher" in email else ("Admin" if "admin" in email and "sys" not in email else "SysAdmin"))
                }}
            )
            print(f"RESET password and status for {email} -> Password123, is_active=True")
