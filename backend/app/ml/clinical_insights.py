from typing import Any, Dict, List

from app.models.patient import Patient


class ClinicalInsightsEngine:
    @staticmethod
    def generate_insights(
        patient: Patient,
        risk_score: float,
        risk_category: str,
        readmission_probability: float,
        feature_importance: Dict[str, float],
    ) -> Dict[str, Any]:
        risk_factors = ClinicalInsightsEngine._identify_risk_factors(patient, feature_importance)
        recommendations = ClinicalInsightsEngine._care_recommendations(patient, risk_category)
        follow_up = ClinicalInsightsEngine._follow_up_plan(risk_category, readmission_probability)
        discharge = ClinicalInsightsEngine._discharge_support(patient, risk_category)

        insights_text = [
            f"Patient {patient.patient_id} classified as {risk_category} risk ({risk_score}%).",
            f"30-day readmission probability: {readmission_probability * 100:.1f}%.",
        ]
        if patient.time_in_hospital and patient.time_in_hospital > 7:
            insights_text.append("Extended hospital stay detected — monitor recovery closely.")
        if patient.num_medications and patient.num_medications > 10:
            insights_text.append("Polypharmacy detected — review medication interactions.")
        if patient.number_inpatient and patient.number_inpatient > 2:
            insights_text.append("Multiple prior inpatient visits — elevated readmission concern.")

        return {
            "key_risk_factors": risk_factors,
            "care_recommendations": recommendations,
            "follow_up_plan": follow_up,
            "discharge_support": discharge,
            "clinical_insights": insights_text,
        }

    @staticmethod
    def _identify_risk_factors(patient: Patient, importance: Dict[str, float]) -> List[str]:
        factors = []
        if patient.time_in_hospital and patient.time_in_hospital >= 7:
            factors.append(f"Extended hospital stay ({patient.time_in_hospital} days)")
        if patient.num_medications and patient.num_medications >= 10:
            factors.append(f"High medication count ({patient.num_medications} medications)")
        if patient.number_emergency and patient.number_emergency >= 2:
            factors.append(f"Frequent emergency visits ({patient.number_emergency})")
        if patient.number_inpatient and patient.number_inpatient >= 2:
            factors.append(f"Multiple prior admissions ({patient.number_inpatient})")
        if patient.number_diagnoses and patient.number_diagnoses >= 5:
            factors.append(f"Multiple comorbidities ({patient.number_diagnoses} diagnoses)")
        if patient.a1cresult in [">7", ">8"]:
            factors.append(f"Elevated A1C result ({patient.a1cresult})")
        if patient.max_glu_serum in [">200", ">300"]:
            factors.append(f"Elevated glucose serum ({patient.max_glu_serum})")
        if patient.diabetes_med == "No":
            factors.append("Not on diabetes medication")

        for feat, _ in list(importance.items())[:3]:
            clean = feat.replace("cat__", "").replace("num__", "")
            if clean not in str(factors):
                factors.append(f"Model factor: {clean}")

        return factors[:8] if factors else ["Standard risk profile — no dominant factors identified"]

    @staticmethod
    def _care_recommendations(patient: Patient, category: str) -> List[str]:
        recs = []
        if category == "High":
            recs.extend([
                "Schedule follow-up within 7 days of discharge",
                "Assign care coordinator for transitional care",
                "Conduct medication reconciliation before discharge",
                "Provide patient education on warning signs",
            ])
        elif category == "Medium":
            recs.extend([
                "Schedule follow-up within 14 days",
                "Review discharge medications with pharmacist",
                "Ensure patient understands care plan",
            ])
        else:
            recs.extend([
                "Standard 30-day follow-up appointment",
                "Provide standard discharge instructions",
            ])

        if patient.diabetes_med == "No":
            recs.append("Evaluate diabetes medication initiation")
        if patient.num_medications and patient.num_medications > 10:
            recs.append("Conduct comprehensive medication review")
        return recs

    @staticmethod
    def _follow_up_plan(category: str, probability: float) -> List[str]:
        if category == "High":
            return [
                "Day 3: Phone check-in with nurse",
                "Day 7: In-person or telehealth visit",
                "Day 14: Lab work if indicated",
                "Day 30: Comprehensive follow-up assessment",
            ]
        if category == "Medium":
            return [
                "Day 7: Phone check-in",
                "Day 14: Follow-up appointment",
                "Day 30: Outcome assessment",
            ]
        return [
            "Day 14: Routine check-in call",
            "Day 30: Standard follow-up visit",
        ]

    @staticmethod
    def _discharge_support(patient: Patient, category: str) -> List[str]:
        support = [
            "Provide written discharge summary to patient and primary care provider",
            "Ensure prescriptions are filled before discharge",
        ]
        if category in ["High", "Medium"]:
            support.extend([
                "Arrange home health services if needed",
                "Connect patient with community support resources",
                "Provide 24/7 nurse hotline contact information",
            ])
        if patient.number_emergency and patient.number_emergency >= 2:
            support.append("Review emergency department utilization patterns")
        return support

    @staticmethod
    def generate_forecast_report(
        patient: Patient,
        probability: float,
        risk_factors: List[str],
        recommendations: List[str],
        period_days: int,
    ) -> str:
        return (
            f"READMISSION FORECAST REPORT\n"
            f"{'=' * 50}\n"
            f"Patient ID: {patient.patient_id}\n"
            f"Forecast Period: {period_days} days\n"
            f"Readmission Probability: {probability * 100:.1f}%\n"
            f"Risk Level: {'High' if probability >= 0.7 else 'Medium' if probability >= 0.4 else 'Low'}\n\n"
            f"RISK FACTORS:\n"
            + "\n".join(f"  • {f}" for f in risk_factors)
            + f"\n\nRECOMMENDATIONS:\n"
            + "\n".join(f"  • {r}" for r in recommendations)
            + f"\n\nGenerated by HealthForecast AI Clinical Decision Support System"
        )
