from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.database import users_collection
from app.schemas.user import UserCreate, UserUpdate
from app.utils.security import get_password_hash

class UserService:
    @staticmethod
    def create_user(user_in: UserCreate) -> Optional[dict]:
        # Check if email already exists
        if users_collection.find_one({"email": user_in.email}):
            return None
        
        user_dict = user_in.model_dump()
        password = user_dict.pop("password")
        user_dict["hashed_password"] = get_password_hash(password)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["is_active"] = True
        
        res = users_collection.insert_one(user_dict)
        user_dict["_id"] = res.inserted_id
        return user_dict

    @staticmethod
    def get_by_id(user_id: str) -> Optional[dict]:
        try:
            return users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def get_by_email(email: str) -> Optional[dict]:
        return users_collection.find_one({"email": email})

    @staticmethod
    def get_users(skip: int = 0, limit: int = 100) -> List[dict]:
        return list(users_collection.find().skip(skip).limit(limit))

    @staticmethod
    def get_doctors() -> List[dict]:
        return list(users_collection.find({"role": "Doctor", "is_active": True}, {"email": 1, "full_name": 1, "hospital": 1}))

    @staticmethod
    def update_user(user_id: str, user_in: UserUpdate) -> Optional[dict]:
        try:
            update_data = {k: v for k, v in user_in.model_dump(exclude_unset=True).items() if v is not None}
            if "password" in update_data:
                password = update_data.pop("password")
                update_data["hashed_password"] = get_password_hash(password)
                
            if not update_data:
                return UserService.get_by_id(user_id)
                
            res = users_collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_data},
                return_document=True
            )
            return res
        except Exception:
            return None

    @staticmethod
    def delete_user(user_id: str) -> bool:
        try:
            res = users_collection.delete_one({"_id": ObjectId(user_id)})
            return res.deleted_count > 0
        except Exception:
            return False
