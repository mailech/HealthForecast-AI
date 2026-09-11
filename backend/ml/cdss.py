from typing import Dict, Any, List
from ml.preprocessing import map_icd9_category


CDSS_DISCLAIMER = (
    "Clinical decision-support suggestion only. Not a substitute for clinician judgment."
)

class ClinicalDecisionSupportEngine:
    """Rules-based Clinical Decision Support System (CDSS) Engine for HealthForecast AI."""

    @staticmethod
    def generate_recommendations(
        encounter_data: Dict[str, Any],
        risk_category: str,
        risk_probability: float
    ) -> List[Dict[str, str]]:
        """Generate non-diagnostic, evidence-grounded clinical decision recommendations."""
        recommendations = []

        # Extract encounter variables
        num_medications = int(encounter_data.get("num_medications", 0))
        num_diagnoses = int(encounter_data.get("number_diagnoses", 0))
        number_inpatient = int(encounter_data.get("number_inpatient", 0))
        number_emergency = int(encounter_data.get("number_emergency", 0))
        time_in_hospital = int(encounter_data.get("time_in_hospital", 0))
        
        change = str(encounter_data.get("change", "No"))
        diabetes_med = str(encounter_data.get("diabetesMed", encounter_data.get("diabetes_med", "No")))
        
        max_glu = str(encounter_data.get("max_glu_serum", "None"))
        a1c = str(encounter_data.get("A1Cresult", encounter_data.get("a1c_result", "None")))
        
        diag1 = str(encounter_data.get("diag_1", ""))
        diag2 = str(encounter_data.get("diag_2", ""))
        diag3 = str(encounter_data.get("diag_3", ""))
        
        diag1_cat = map_icd9_category(diag1)
        diag2_cat = map_icd9_category(diag2)
        diag3_cat = map_icd9_category(diag3)
        has_diabetes_diag = any(cat == "Diabetes" for cat in [diag1_cat, diag2_cat, diag3_cat])

        # Rule 1: Medication Reconciliation & Safety Review
        if change in ["Ch", "Yes"] or diabetes_med == "Yes" or num_medications > 10:
            recommendations.append({
                "rule_id": "CDSS_MED_REC",
                "category": "Medication Safety",
                "title": "Medication Reconciliation",
                "description": "Perform comprehensive post-discharge medication reconciliation, particularly for modified or complex diabetes regimens.",
                "disclaimer": CDSS_DISCLAIMER
            })

        # Rule 2: Outpatient Follow-up Planning (High & Medium Risk)
        if risk_category in ["Medium Risk", "High Risk"] or number_inpatient > 0:
            recommendations.append({
                "rule_id": "CDSS_FOLLOW_UP",
                "category": "Care Continuity",
                "title": "Timely Outpatient Follow-Up",
                "description": "Schedule an outpatient clinical follow-up appointment within 7–14 days of hospital discharge.",
                "disclaimer": CDSS_DISCLAIMER
            })

        # Rule 3: Diabetes Self-Management Education
        if has_diabetes_diag or max_glu in [">200", ">300"] or a1c in [">7", ">8"]:
            recommendations.append({
                "rule_id": "CDSS_DIABETES_EDU",
                "category": "Patient Education",
                "title": "Diabetes Self-Management Education",
                "description": "Provide structured diabetes self-management training, glucose monitoring instructions, and hypoglycemia prevention guidelines.",
                "disclaimer": CDSS_DISCLAIMER
            })

        # Rule 4: Historical Readmission & Emergency Utilization Review
        if number_inpatient > 0 or number_emergency > 0:
            recommendations.append({
                "rule_id": "CDSS_UTILIZATION_REV",
                "category": "Utilization Review",
                "title": "Historical Readmission & ER Visit Review",
                "description": "Review the patient's prior 12-month inpatient and emergency hospitalizations to address root drivers of frequent readmission.",
                "disclaimer": CDSS_DISCLAIMER
            })

        # Rule 5: Glycemic Control & Lab Re-evaluation
        if max_glu in [">200", ">300"] or a1c in [">7", ">8"]:
            recommendations.append({
                "rule_id": "CDSS_GLYCEMIC_MON",
                "category": "Clinical Monitoring",
                "title": "Glycemic Control & Lab Review",
                "description": "Re-evaluate elevated serum glucose/A1C lab results and consider endocrinology consult prior to discharge.",
                "disclaimer": CDSS_DISCLAIMER
            })

        # Rule 6: Multidisciplinary Care Coordination (Complex Encounters)
        if num_medications >= 12 or num_diagnoses >= 6 or time_in_hospital >= 5:
            recommendations.append({
                "rule_id": "CDSS_CARE_COORD",
                "category": "Care Management",
                "title": "Multidisciplinary Care Coordination",
                "description": "Assign a clinical care coordinator to oversee complex discharge planning for multi-morbid care transitions.",
                "disclaimer": CDSS_DISCLAIMER
            })

        # Default recommendation if low risk and no triggers
        if not recommendations:
            recommendations.append({
                "rule_id": "CDSS_STANDARD_CARE",
                "category": "Standard Care",
                "title": "Standard Post-Discharge Care Plan",
                "description": "Continue standard routine discharge protocols and provide general discharge summary instructions.",
                "disclaimer": CDSS_DISCLAIMER
            })

        return recommendations

# Global helper
def get_cdss_engine() -> ClinicalDecisionSupportEngine:
    return ClinicalDecisionSupportEngine()
