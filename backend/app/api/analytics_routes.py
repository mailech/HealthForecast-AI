from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["Healthcare Analytics"])

@router.get("")
def get_analytics_metrics():
    return {
        "monthly_readmissions": [
            {"month": "Jan", "readmissions": 42, "target": 35, "high_risk": 18},
            {"month": "Feb", "readmissions": 38, "target": 35, "high_risk": 15},
            {"month": "Mar", "readmissions": 45, "target": 35, "high_risk": 22},
            {"month": "Apr", "readmissions": 31, "target": 35, "high_risk": 11},
            {"month": "May", "readmissions": 29, "target": 35, "high_risk": 9},
            {"month": "Jun", "readmissions": 26, "target": 35, "high_risk": 8},
            {"month": "Jul", "readmissions": 24, "target": 35, "high_risk": 7}
        ],
        "readmission_reasons": [
            {"reason": "Medication Non-Adherence", "value": 34, "color": "#06b6d4"},
            {"reason": "Inadequate Post-Discharge Support", "value": 28, "color": "#14b8a6"},
            {"reason": "Disease Progression", "value": 20, "color": "#f59e0b"},
            {"reason": "Surgical Complications", "value": 12, "color": "#ef4444"},
            {"reason": "Diagnostic Miss", "value": 6, "color": "#8b5cf6"}
        ],
        "department_performance": [
            {"department": "Cardiology", "total_discharges": 420, "readmission_rate": 16.4, "benchmark": 18.0},
            {"department": "Pulmonology", "total_discharges": 310, "readmission_rate": 18.2, "benchmark": 19.5},
            {"department": "Endocrinology", "total_discharges": 280, "readmission_rate": 11.5, "benchmark": 14.0},
            {"department": "Nephrology", "total_discharges": 190, "readmission_rate": 21.0, "benchmark": 22.5},
            {"department": "Internal Medicine", "total_discharges": 550, "readmission_rate": 13.8, "benchmark": 15.0}
        ],
        "treatment_trajectories": [
            {"week": "Week 1", "standard_care": 45, "ai_guided_care": 72},
            {"week": "Week 2", "standard_care": 58, "ai_guided_care": 84},
            {"week": "Week 3", "standard_care": 64, "ai_guided_care": 91},
            {"week": "Week 4", "standard_care": 70, "ai_guided_care": 96}
        ]
    }
