from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.database import predictions_collection, patients_collection
from app.ai.predictor import predictor_instance
from app.schemas.prediction import PredictionInput, PredictionSave

class PredictionService:
    @staticmethod
    def predict_readmission(prediction_in: PredictionInput, user_email: str) -> dict:
        # Validate patient exists
        patient = patients_collection.find_one({"patient_id": prediction_in.patient_id})
        if not patient:
            raise ValueError(f"Patient with ID {prediction_in.patient_id} does not exist.")
            
        data = {
            "age": prediction_in.age,
            "gender": prediction_in.gender,
            "length_of_stay": prediction_in.length_of_stay,
            "num_previous_admissions": prediction_in.num_previous_admissions,
            "num_medications": prediction_in.num_medications,
            "systolic_bp": prediction_in.systolic_bp,
            "diastolic_bp": prediction_in.diastolic_bp,
            "blood_sugar": prediction_in.blood_sugar,
            "comorbidity_count": prediction_in.comorbidity_count
        }
        
        result = predictor_instance.predict(data)
        
        return {
            "patient_id": prediction_in.patient_id,
            "readmission_risk_score": result["readmission_risk_score"],
            "risk_level": result["risk_level"],
            "prediction_date": datetime.utcnow(),
            "predicted_by": user_email,
            "notes": f"Predicted using RandomForest classifier. Risk classification: {result['risk_level']}."
        }

    @staticmethod
    def save_prediction(prediction_save: PredictionSave, features_used: dict) -> dict:
        pred_dict = prediction_save.model_dump()
        pred_dict["features_used"] = features_used
        pred_dict["prediction_date"] = pred_dict.get("prediction_date") or datetime.utcnow()
        
        res = predictions_collection.insert_one(pred_dict)
        pred_dict["_id"] = res.inserted_id
        return pred_dict

    @staticmethod
    def get_predictions_by_patient(patient_id: str) -> List[dict]:
        return list(predictions_collection.find({"patient_id": patient_id}))

    @staticmethod
    def get_all_predictions(skip: int = 0, limit: int = 100) -> List[dict]:
        return list(predictions_collection.find().skip(skip).limit(limit))

    @staticmethod
    def get_by_id(prediction_id: str) -> Optional[dict]:
        try:
            return predictions_collection.find_one({"_id": ObjectId(prediction_id)})
        except Exception:
            return None
