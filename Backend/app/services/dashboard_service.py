from datetime import datetime
from bson import ObjectId
from app.database import patients_collection, predictions_collection, medical_histories_collection, treatments_collection

def _sanitize_doc(item):
    if isinstance(item, dict):
        return {k: _sanitize_doc(v) for k, v in item.items() if k != "_id"}
    elif isinstance(item, list):
        return [_sanitize_doc(i) for i in item]
    elif isinstance(item, (datetime, ObjectId)):
        return str(item)
    return item

class DashboardService:
    @staticmethod
    def get_stats() -> dict:
        total_patients = patients_collection.count_documents({})
        total_predictions = predictions_collection.count_documents({})
        total_treatments = treatments_collection.count_documents({})

        # Aggregate latest prediction per patient for active risk state
        latest_risk_pipeline = [
            {"$sort": {"prediction_date": -1}},
            {"$group": {
                "_id": "$patient_id",
                "latest_risk": {"$first": "$risk_level"}
            }}
        ]
        latest_risks = list(predictions_collection.aggregate(latest_risk_pipeline))

        high_risk_count = 0
        risk_breakdown = {"High": 0, "Medium": 0, "Low": 0}
        for item in latest_risks:
            risk = item.get("latest_risk")
            if risk in risk_breakdown:
                risk_breakdown[risk] += 1
            if risk == "High":
                high_risk_count += 1

        # Daily admission trends (last 10 days) with safe type checking
        admissions_pipeline = [
            {"$match": {"admission_date": {"$ne": None}}},
            {"$group": {
                "_id": {
                    "$cond": {
                        "if": {"$eq": [{"$type": "$admission_date"}, "date"]},
                        "then": {"$dateToString": {"format": "%Y-%m-%d", "date": "$admission_date"}},
                        "else": {"$substr": [{"$toString": "$admission_date"}, 0, 10]}
                    }
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": -1}},
            {"$limit": 10}
        ]
        try:
            admissions_trend = list(medical_histories_collection.aggregate(admissions_pipeline))
            admissions_trend.reverse()
        except Exception:
            admissions_trend = []

        # Recent predictions (last 10)
        recent_preds_raw = list(
            predictions_collection.find()
            .sort("prediction_date", -1)
            .limit(10)
        )
        recent_preds = [_sanitize_doc(p) for p in recent_preds_raw]

        return {
            "total_patients": total_patients,
            "total_predictions": total_predictions,
            "total_treatments": total_treatments,
            "high_risk_count": high_risk_count,
            "risk_breakdown": risk_breakdown,
            "daily_admission_trends": admissions_trend,
            "recent_predictions": recent_preds,
        }
