from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.database import treatments_collection, patients_collection
from app.schemas.treatment import TreatmentCreate, TreatmentUpdate

class TreatmentService:
    @staticmethod
    def create_treatment(treatment_in: TreatmentCreate) -> Optional[dict]:
        # Validate patient exists
        patient = patients_collection.find_one({"patient_id": treatment_in.patient_id})
        if not patient:
            return None
            
        treatment_dict = treatment_in.model_dump()
        treatment_dict["created_at"] = datetime.utcnow()
        
        res = treatments_collection.insert_one(treatment_dict)
        treatment_dict["_id"] = res.inserted_id
        return treatment_dict

    @staticmethod
    def get_by_id(treatment_id: str) -> Optional[dict]:
        try:
            return treatments_collection.find_one({"_id": ObjectId(treatment_id)})
        except Exception:
            return None

    @staticmethod
    def get_by_patient_id(patient_id: str) -> List[dict]:
        return list(treatments_collection.find({"patient_id": patient_id}))

    @staticmethod
    def get_all_treatments(skip: int = 0, limit: int = 100) -> List[dict]:
        return list(treatments_collection.find().skip(skip).limit(limit))

    @staticmethod
    def update_treatment(treatment_id: str, treatment_in: TreatmentUpdate) -> Optional[dict]:
        update_data = {k: v for k, v in treatment_in.model_dump(exclude_unset=True).items() if v is not None}
        if not update_data:
            return TreatmentService.get_by_id(treatment_id)
            
        try:
            res = treatments_collection.find_one_and_update(
                {"_id": ObjectId(treatment_id)},
                {"$set": update_data},
                return_document=True
            )
            return res
        except Exception:
            return None

    @staticmethod
    def delete_treatment(treatment_id: str) -> bool:
        try:
            res = treatments_collection.delete_one({"_id": ObjectId(treatment_id)})
            return res.deleted_count > 0
        except Exception:
            return False
