from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.database import medical_histories_collection, patients_collection
from app.schemas.history import MedicalHistoryCreate, MedicalHistoryUpdate

class MedicalHistoryService:
    @staticmethod
    def create_history(history_in: MedicalHistoryCreate) -> Optional[dict]:
        # Validate patient exists
        patient = patients_collection.find_one({"patient_id": history_in.patient_id})
        if not patient:
            return None
            
        history_dict = history_in.model_dump()
        history_dict["created_at"] = datetime.utcnow()
        
        res = medical_histories_collection.insert_one(history_dict)
        history_dict["_id"] = res.inserted_id
        return history_dict

    @staticmethod
    def get_by_id(history_id: str) -> Optional[dict]:
        try:
            return medical_histories_collection.find_one({"_id": ObjectId(history_id)})
        except Exception:
            return None

    @staticmethod
    def get_by_patient_id(patient_id: str) -> List[dict]:
        return list(medical_histories_collection.find({"patient_id": patient_id}))

    @staticmethod
    def get_all_histories(skip: int = 0, limit: int = 100) -> List[dict]:
        return list(medical_histories_collection.find().skip(skip).limit(limit))

    @staticmethod
    def update_history(history_id: str, history_in: MedicalHistoryUpdate) -> Optional[dict]:
        update_data = {k: v for k, v in history_in.model_dump(exclude_unset=True).items() if v is not None}
        if not update_data:
            return MedicalHistoryService.get_by_id(history_id)
            
        try:
            res = medical_histories_collection.find_one_and_update(
                {"_id": ObjectId(history_id)},
                {"$set": update_data},
                return_document=True
            )
            return res
        except Exception:
            return None

    @staticmethod
    def delete_history(history_id: str) -> bool:
        try:
            res = medical_histories_collection.delete_one({"_id": ObjectId(history_id)})
            return res.deleted_count > 0
        except Exception:
            return False
