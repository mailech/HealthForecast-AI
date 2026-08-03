import io
import csv
from datetime import datetime
from app.database import patients_collection, predictions_collection, medical_histories_collection

class ReportService:
    @staticmethod
    def generate_summary_report() -> dict:
        total_patients = patients_collection.count_documents({})
        total_predictions = predictions_collection.count_documents({})
        
        # Aggregate averages from medical histories
        pipeline_stats = [
            {"$group": {
                "_id": None,
                "avg_stay": {"$avg": "$length_of_stay"},
                "avg_meds": {"$avg": "$num_medications"},
                "avg_prev_admissions": {"$avg": "$num_previous_admissions"}
            }}
        ]
        stats_res = list(medical_histories_collection.aggregate(pipeline_stats))
        stats = stats_res[0] if stats_res else {"avg_stay": 0, "avg_meds": 0, "avg_prev_admissions": 0}
        
        # Average risk score
        pipeline_risk = [
            {"$group": {
                "_id": None,
                "avg_risk_score": {"$avg": "$readmission_risk_score"}
            }}
        ]
        risk_res = list(predictions_collection.aggregate(pipeline_risk))
        avg_risk = risk_res[0]["avg_risk_score"] if risk_res else 0.0
        
        # Top 5 highest risk patients
        top_risk_pipeline = [
            {"$sort": {"readmission_risk_score": -1}},
            {"$limit": 5},
            {"$lookup": {
                "from": "patients",
                "localField": "patient_id",
                "foreignField": "patient_id",
                "as": "patient"
            }},
            {"$unwind": "$patient"}
        ]
        top_risks = list(predictions_collection.aggregate(top_risk_pipeline))
        
        high_risk_details = []
        for tr in top_risks:
            high_risk_details.append({
                "patient_id": tr["patient_id"],
                "name": f"{tr['patient']['first_name']} {tr['patient']['last_name']}",
                "hospital": tr["patient"]["hospital"],
                "risk_score": tr["readmission_risk_score"],
                "risk_level": tr["risk_level"]
            })
            
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "metrics": {
                "total_patients": total_patients,
                "total_predictions": total_predictions,
                "average_length_of_stay": round(stats.get("avg_stay", 0) or 0, 2),
                "average_medications": round(stats.get("avg_meds", 0) or 0, 2),
                "average_previous_admissions": round(stats.get("avg_prev_admissions", 0) or 0, 2),
                "average_readmission_risk_score": round(avg_risk, 4)
            },
            "highest_risk_patients": high_risk_details
        }

    @staticmethod
    def export_predictions_csv() -> str:
        # Join predictions and patient info
        pipeline = [
            {"$lookup": {
                "from": "patients",
                "localField": "patient_id",
                "foreignField": "patient_id",
                "as": "patient"
            }},
            {"$unwind": {"path": "$patient", "preserveNullAndEmptyArrays": True}},
            {"$sort": {"prediction_date": -1}}
        ]
        records = list(predictions_collection.aggregate(pipeline))
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            "Patient ID", "First Name", "Last Name", "Gender", "Hospital",
            "Readmission Risk Score", "Risk Level", "Predicted By", "Prediction Date", "Notes"
        ])
        
        for rec in records:
            pat = rec.get("patient") or {}
            date_str = rec.get("prediction_date").strftime("%Y-%m-%d %H:%M:%S") if rec.get("prediction_date") else ""
            writer.writerow([
                rec.get("patient_id"),
                pat.get("first_name", ""),
                pat.get("last_name", ""),
                pat.get("gender", ""),
                pat.get("hospital", ""),
                rec.get("readmission_risk_score"),
                rec.get("risk_level"),
                rec.get("predicted_by", ""),
                date_str,
                rec.get("notes", "")
            ])
            
        return output.getvalue()
