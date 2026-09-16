from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.database import predictions_collection, patients_collection, users_collection
from app.ai.predictor import predictor_instance
from app.schemas.prediction import PredictionInput, PredictionSave

class PredictionService:
    @staticmethod
    def predict_readmission(prediction_in: PredictionInput, user_email: str) -> dict:
        # Validate patient exists
        patient = patients_collection.find_one({"patient_id": prediction_in.patient_id})
        if not patient:
            raise ValueError(f"Patient with ID {prediction_in.patient_id} does not exist.")
            
        data = prediction_in.model_dump()
        meds = data.pop("medications", {}) or {}
        if isinstance(meds, dict):
            for k, v in meds.items():
                data[k] = v
        
        result = predictor_instance.predict(data)
        
        # Build patient full name for persistent storage
        patient_name = " ".join(filter(None, [
            patient.get("first_name", ""),
            patient.get("last_name", "")
        ])).strip() or None
        
        # Fetch doctor name from users collection
        user_doc = users_collection.find_one({"email": user_email})
        doctor_name = user_doc.get("full_name") if user_doc else None
        
        pred_dict = {
            "patient_id": prediction_in.patient_id,
            "model1_probability": result["model1_probability"],
            "model1_prediction": result["model1_prediction"],
            "model2_probability": result["model2_probability"],
            "model2_prediction": result["model2_prediction"],
            "readmission_risk_score": result["readmission_risk_score"],
            "risk_level": result["risk_level"],
            "clinical_interpretation": result["clinical_interpretation"],
            "prediction_date": datetime.utcnow(),
            "predicted_by": user_email,
            "doctor_name": doctor_name,
            "patient_name": patient_name,
            "notes": f"Evaluated with Dual-Model ML pipeline. {result['clinical_interpretation']}",
            "features_used": prediction_in.model_dump()
        }

        # Auto-save to predictions collection in MongoDB
        res = predictions_collection.insert_one(pred_dict)
        pred_dict["_id"] = res.inserted_id
        return pred_dict

    @staticmethod
    def save_prediction(prediction_save: PredictionSave, features_used: dict) -> dict:
        pred_dict = prediction_save.model_dump()
        pred_dict["features_used"] = features_used
        pred_dict["prediction_date"] = pred_dict.get("prediction_date") or datetime.utcnow()
        
        # Check if already inserted by predict_readmission within the last 5 seconds to prevent duplicate record
        existing = predictions_collection.find_one({
            "patient_id": pred_dict["patient_id"],
            "predicted_by": pred_dict.get("predicted_by"),
            "readmission_risk_score": pred_dict.get("readmission_risk_score")
        }, sort=[("prediction_date", -1)])
        
        if existing:
            time_diff = (pred_dict["prediction_date"] - existing.get("prediction_date", datetime.min)).total_seconds()
            if abs(time_diff) < 5:
                return existing

        res = predictions_collection.insert_one(pred_dict)
        pred_dict["_id"] = res.inserted_id
        return pred_dict

    @staticmethod
    def update_prediction(prediction_id: str, update_data: dict) -> Optional[dict]:
        """
        Partially updates a prediction record (e.g., editing the doctor name).
        Returns the updated document, or None if not found.
        """
        try:
            try:
                query = {"_id": ObjectId(prediction_id)}
            except Exception:
                query = {"_id": prediction_id}
            
            # Only update non-None provided fields
            set_fields = {k: v for k, v in update_data.items() if v is not None}
            if not set_fields:
                return predictions_collection.find_one(query)
            
            result = predictions_collection.find_one_and_update(
                query,
                {"$set": set_fields},
                return_document=True
            )
            return result
        except Exception:
            return None

    @staticmethod
    def get_predictions_by_patient(patient_id: str) -> List[dict]:
        return list(predictions_collection.find({"patient_id": patient_id}).sort("prediction_date", -1))

    @staticmethod
    def get_all_predictions(skip: int = 0, limit: int = 100) -> List[dict]:
        return list(predictions_collection.find().sort("prediction_date", -1).skip(skip).limit(limit))

    @staticmethod
    def delete_prediction(prediction_id: str) -> bool:
        try:
            try:
                query = {"_id": ObjectId(prediction_id)}
            except Exception:
                query = {"_id": prediction_id}
            res = predictions_collection.delete_one(query)
            return res.deleted_count > 0
        except Exception:
            return False

    @staticmethod
    def get_by_id(prediction_id: str) -> Optional[dict]:
        try:
            try:
                return predictions_collection.find_one({"_id": ObjectId(prediction_id)})
            except Exception:
                return predictions_collection.find_one({"_id": prediction_id})
        except Exception:
            return None
