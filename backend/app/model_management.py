from fastapi import APIRouter, Depends

from app.security import require_role

router = APIRouter(prefix="/model", tags=["model-management"])


@router.get("/info")
def model_info(
    current_user=Depends(require_role("system_admin")),
):
    return {
        "model_type": "RandomForestClassifier",
        "trained_on": "Diabetes 130-US Hospitals Dataset (101,766 records)",
        "features_used": [
            "time_in_hospital",
            "num_lab_procedures",
            "num_procedures",
            "num_medications",
            "number_outpatient",
            "number_emergency",
            "number_inpatient",
            "number_diagnoses",
            "age_encoded",
            "admission_type_id",
            "change_encoded",
            "diabetesMed_encoded",
        ],
        "performance_metrics": {
            "accuracy": 0.89,
            "precision": 0.40,
            "recall": 0.013,
            "f1_score": 0.025,
            "roc_auc": 0.60,
        },
        "target": "Readmission within 30 days (binary)",
    }