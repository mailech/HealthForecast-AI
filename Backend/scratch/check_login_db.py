import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, users_collection
from app.utils.security import verify_password, get_password_hash

init_db()

users = list(users_collection.find())
print(f"Total users in DB: {len(users)}")
for u in users:
    print("----------------------------------------")
    print(f"_id: {u.get('_id')}")
    print(f"email: {u.get('email')}")
    print(f"full_name: {u.get('full_name')}")
    print(f"role: {u.get('role')}")
    print(f"is_active: {u.get('is_active')}")
    print(f"hashed_password: {u.get('hashed_password')}")
    print(f"verify Password123: {verify_password('Password123', u.get('hashed_password', ''))}")
