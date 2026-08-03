from app.database import patients_collection, predictions_collection, medical_histories_collection

class DashboardService:
    @staticmethod
    def get_stats() -> dict:
        total_patients = patients_collection.count_documents({})
        
        # Aggregate latest prediction for each patient to get real active risk state
        latest_risk_pipeline = [
            {"$sort": {"prediction_date": -1}},
            {"$group": {
                "_id": "$patient_id",
                "latest_risk": {"$first": "$risk_level"}
            }}
        ]
        
        latest_risks = list(predictions_collection.aggregate(latest_risk_pipeline))
        
        # Compute count of high risk and distribution
        high_risk_count = 0
        distribution = {"High": 0, "Medium": 0, "Low": 0}
        
        for item in latest_risks:
            risk = item.get("latest_risk")
            if risk in distribution:
                distribution[risk] += 1
            if risk == "High":
                high_risk_count += 1
                
        # Aggregate recent admissions (last 10 dates with admissions)
        admissions_pipeline = [
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$admission_date"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": -1}},
            {"$limit": 10}
        ]
        
        admissions_trend = list(medical_histories_collection.aggregate(admissions_pipeline))
        admissions_trend_formatted = [
            {"date": item["_id"], "admissions": item["count"]}
            for item in admissions_trend
        ]
        # Reverse to chronological order
        admissions_trend_formatted.reverse()
        
        return {
            "total_patients": total_patients,
            "high_risk_patients": high_risk_count,
            "risk_distribution": distribution,
            "admissions_trend": admissions_trend_formatted
        }
