from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.database import patients_collection
from app.schemas.patient import PatientCreate, PatientUpdate

class PatientService:
    @staticmethod
    def create_patient(patient_in: PatientCreate) -> Optional[dict]:
        # Auto-generate patient_id if missing or empty
        if not patient_in.patient_id or not patient_in.patient_id.strip():
            count = patients_collection.count_documents({}) + 10001
            patient_in.patient_id = f"PAT-{count}"
        else:
            patient_in.patient_id = patient_in.patient_id.strip()

        # Check unique patient_id
        if patients_collection.find_one({"patient_id": patient_in.patient_id}):
            return None
            
        patient_dict = patient_in.model_dump()
        # Clean empty strings for optional fields
        if not patient_dict.get("email"):
            patient_dict["email"] = None
        if not patient_dict.get("phone"):
            patient_dict["phone"] = None

        patient_dict["created_at"] = datetime.utcnow()
        patient_dict["updated_at"] = datetime.utcnow()
        
        res = patients_collection.insert_one(patient_dict)
        patient_dict["_id"] = res.inserted_id
        return patient_dict

    @staticmethod
    def get_by_id(patient_id: str) -> Optional[dict]:
        try:
            return patients_collection.find_one({"_id": ObjectId(patient_id)})
        except Exception:
            return patients_collection.find_one({"patient_id": patient_id})

    @staticmethod
    def get_by_patient_id(patient_id: str) -> Optional[dict]:
        return patients_collection.find_one({"patient_id": patient_id})

    @staticmethod
    def get_patients(skip: int = 0, limit: int = 200) -> List[dict]:
        return list(patients_collection.find().sort("created_at", -1).skip(skip).limit(limit))

    @staticmethod
    def update_patient(patient_id: str, patient_in: PatientUpdate) -> Optional[dict]:
        update_data = {k: v for k, v in patient_in.model_dump(exclude_unset=True).items() if v is not None}
        if not update_data:
            return PatientService.get_by_id(patient_id)
            
        update_data["updated_at"] = datetime.utcnow()
        try:
            query = {"_id": ObjectId(patient_id)}
        except Exception:
            query = {"patient_id": patient_id}
            
        res = patients_collection.find_one_and_update(
            query,
            {"$set": update_data},
            return_document=True
        )
        return res

    @staticmethod
    def delete_patient(patient_id: str) -> bool:
        try:
            query = {"_id": ObjectId(patient_id)}
        except Exception:
            query = {"patient_id": patient_id}
            
        res = patients_collection.delete_one(query)
        return res.deleted_count > 0
