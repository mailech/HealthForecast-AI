from datetime import date, timedelta

from app.database import SessionLocal
from app.models.patient import (
    Patient,
    MedicalHistory,
    Treatment,
    Admission,
)
from app.models.clinical_assessment import ClinicalAssessment
from app.models.user import User


# ============================================================
# DEMO PATIENT DATA
# ============================================================

PATIENTS = [
    {
        "name": "Priya Sharma",
        "date_of_birth": date(1958, 4, 12),
        "gender": "Female",
        "phone": "9000000001",
        "address": "Vijayawada, Andhra Pradesh",
        "blood_group": "A+",

        "assessment": {
            "admission_type_id": 1,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 3,
            "num_lab_procedures": 35,
            "num_procedures": 1,
            "num_medications": 9,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 0,
            "number_diagnoses": 4,
            "max_glu_serum": "None",
            "A1Cresult": "Norm",

            "metformin": "Steady",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "No",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "No",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "No",
            "diabetesMed": "Yes",

            "race": "Caucasian",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Other",
            "diag_3_category": "Other",

            "prior_utilization": 0,
            "medication_count": 1,
            "medication_changed": 0,
            "diabetes_medication": 1,
            "clinical_activity": 45,
        },

        "history": {
            "diagnosis": "Type 2 Diabetes Mellitus",
            "description": "Controlled diabetes with routine monitoring.",
            "notes": "Continue lifestyle management and medication adherence.",
        },

        "treatments": [
            {
                "treatment_name": "Diabetes Management",
                "medication": "Metformin",
                "dosage": "500 mg",
                "start_date": date(2026, 5, 1),
                "end_date": date(2026, 7, 30),
                "outcome": "Improved",
                "notes": "Good response to treatment.",
            },
            {
                "treatment_name": "Dietary Management",
                "medication": None,
                "dosage": None,
                "start_date": date(2026, 6, 1),
                "end_date": None,
                "outcome": "Ongoing",
                "notes": "Continue diabetic diet plan.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 4, 28),
            "discharge_date": date(2026, 5, 1),
            "admission_type": "Elective",
            "diagnosis": "Type 2 Diabetes Mellitus",
            "discharge_reason": "Stable condition",
        },
    },

    {
        "name": "Ravi Patel",
        "date_of_birth": date(1949, 9, 21),
        "gender": "Male",
        "phone": "9000000002",
        "address": "Guntur, Andhra Pradesh",
        "blood_group": "B+",

        "assessment": {
            "admission_type_id": 1,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 7,
            "num_lab_procedures": 55,
            "num_procedures": 3,
            "num_medications": 18,
            "number_outpatient": 3,
            "number_emergency": 2,
            "number_inpatient": 2,
            "number_diagnoses": 8,
            "max_glu_serum": ">300",
            "A1Cresult": ">8",

            "metformin": "Up",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "Steady",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "Up",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "Ch",
            "diabetesMed": "Yes",

            "race": "Caucasian",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Circulatory",
            "diag_3_category": "Other",

            "prior_utilization": 7,
            "medication_count": 3,
            "medication_changed": 1,
            "diabetes_medication": 1,
            "clinical_activity": 76,
        },

        "history": {
            "diagnosis": "Type 2 Diabetes with Hypertension",
            "description": "Poor glycemic control with recurrent hospital utilization.",
            "notes": "Requires close follow-up after discharge.",
        },

        "treatments": [
            {
                "treatment_name": "Intensive Diabetes Management",
                "medication": "Insulin",
                "dosage": "10 units",
                "start_date": date(2026, 4, 10),
                "end_date": date(2026, 6, 20),
                "outcome": "Improved",
                "notes": "Glucose levels improved after medication adjustment.",
            },
            {
                "treatment_name": "Medication Adjustment",
                "medication": "Metformin",
                "dosage": "1000 mg",
                "start_date": date(2026, 6, 21),
                "end_date": None,
                "outcome": "Ongoing",
                "notes": "Continue monitoring glucose levels.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 4, 3),
            "discharge_date": date(2026, 4, 10),
            "admission_type": "Emergency",
            "diagnosis": "Uncontrolled Diabetes",
            "discharge_reason": "Clinical stabilization",
        },
    },

    {
        "name": "Ananya Reddy",
        "date_of_birth": date(1972, 2, 8),
        "gender": "Female",
        "phone": "9000000003",
        "address": "Hyderabad, Telangana",
        "blood_group": "O+",

        "assessment": {
            "admission_type_id": 2,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 4,
            "num_lab_procedures": 42,
            "num_procedures": 1,
            "num_medications": 11,
            "number_outpatient": 1,
            "number_emergency": 0,
            "number_inpatient": 1,
            "number_diagnoses": 5,
            "max_glu_serum": "None",
            "A1Cresult": ">7",

            "metformin": "Steady",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "Steady",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "No",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "No",
            "diabetesMed": "Yes",

            "race": "Asian",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Other",
            "diag_3_category": "Other",

            "prior_utilization": 2,
            "medication_count": 2,
            "medication_changed": 0,
            "diabetes_medication": 1,
            "clinical_activity": 54,
        },

        "history": {
            "diagnosis": "Type 2 Diabetes Mellitus",
            "description": "Moderately controlled diabetes.",
            "notes": "Routine follow-up recommended.",
        },

        "treatments": [
            {
                "treatment_name": "Glycemic Control",
                "medication": "Metformin",
                "dosage": "500 mg",
                "start_date": date(2026, 5, 15),
                "end_date": date(2026, 7, 15),
                "outcome": "Successful",
                "notes": "Treatment completed successfully.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 5, 11),
            "discharge_date": date(2026, 5, 15),
            "admission_type": "Urgent",
            "diagnosis": "Diabetes Management",
            "discharge_reason": "Stable",
        },
    },

    {
        "name": "Suresh Kumar",
        "date_of_birth": date(1944, 11, 3),
        "gender": "Male",
        "phone": "9000000004",
        "address": "Visakhapatnam, Andhra Pradesh",
        "blood_group": "AB+",

        "assessment": {
            "admission_type_id": 1,
            "discharge_disposition_id": 1,
            "admission_source_id": 4,
            "time_in_hospital": 9,
            "num_lab_procedures": 70,
            "num_procedures": 4,
            "num_medications": 22,
            "number_outpatient": 5,
            "number_emergency": 3,
            "number_inpatient": 3,
            "number_diagnoses": 9,
            "max_glu_serum": ">300",
            "A1Cresult": ">8",

            "metformin": "Down",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "No",
            "acetohexamide": "No",
            "glipizide": "Steady",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "Steady",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "Ch",
            "diabetesMed": "Yes",

            "race": "AfricanAmerican",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Circulatory",
            "diag_3_category": "Respiratory",

            "prior_utilization": 11,
            "medication_count": 3,
            "medication_changed": 1,
            "diabetes_medication": 1,
            "clinical_activity": 96,
        },

        "history": {
            "diagnosis": "Diabetes with Cardiovascular Disease",
            "description": "Complex chronic condition with multiple prior admissions.",
            "notes": "Requires multidisciplinary follow-up.",
        },

        "treatments": [
            {
                "treatment_name": "Insulin Therapy",
                "medication": "Insulin",
                "dosage": "15 units",
                "start_date": date(2026, 3, 1),
                "end_date": date(2026, 5, 30),
                "outcome": "Not Improved",
                "notes": "Limited response observed.",
            },
            {
                "treatment_name": "Cardiac Monitoring",
                "medication": None,
                "dosage": None,
                "start_date": date(2026, 5, 31),
                "end_date": None,
                "outcome": "Ongoing",
                "notes": "Continued monitoring required.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 2, 20),
            "discharge_date": date(2026, 3, 1),
            "admission_type": "Emergency",
            "diagnosis": "Diabetes with cardiovascular complications",
            "discharge_reason": "Transferred to follow-up care",
        },
    },

    {
        "name": "Meena Lakshmi",
        "date_of_birth": date(1965, 6, 18),
        "gender": "Female",
        "phone": "9000000005",
        "address": "Tirupati, Andhra Pradesh",
        "blood_group": "A-",

        "assessment": {
            "admission_type_id": 3,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 5,
            "num_lab_procedures": 48,
            "num_procedures": 2,
            "num_medications": 14,
            "number_outpatient": 2,
            "number_emergency": 1,
            "number_inpatient": 1,
            "number_diagnoses": 6,
            "max_glu_serum": "200-300",
            "A1Cresult": ">7",

            "metformin": "Steady",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "Steady",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "No",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "Ch",
            "diabetesMed": "Yes",

            "race": "Hispanic",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Respiratory",
            "diag_3_category": "Other",

            "prior_utilization": 4,
            "medication_count": 2,
            "medication_changed": 1,
            "diabetes_medication": 1,
            "clinical_activity": 64,
        },

        "history": {
            "diagnosis": "Type 2 Diabetes and Respiratory Disease",
            "description": "Diabetes with intermittent respiratory complications.",
            "notes": "Monitor glucose and respiratory symptoms.",
        },

        "treatments": [
            {
                "treatment_name": "Diabetes Therapy",
                "medication": "Glimepiride",
                "dosage": "2 mg",
                "start_date": date(2026, 5, 5),
                "end_date": date(2026, 7, 5),
                "outcome": "Stable",
                "notes": "Patient condition remained stable.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 4, 30),
            "discharge_date": date(2026, 5, 5),
            "admission_type": "Urgent",
            "diagnosis": "Diabetes with respiratory symptoms",
            "discharge_reason": "Stable",
        },
    },

    {
        "name": "Arjun Rao",
        "date_of_birth": date(1981, 1, 25),
        "gender": "Male",
        "phone": "9000000006",
        "address": "Bengaluru, Karnataka",
        "blood_group": "O-",

        "assessment": {
            "admission_type_id": 1,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 2,
            "num_lab_procedures": 28,
            "num_procedures": 0,
            "num_medications": 6,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 0,
            "number_diagnoses": 3,
            "max_glu_serum": "None",
            "A1Cresult": "Norm",

            "metformin": "Steady",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "No",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "No",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "No",
            "diabetesMed": "Yes",

            "race": "Asian",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Other",
            "diag_3_category": "Other",

            "prior_utilization": 0,
            "medication_count": 1,
            "medication_changed": 0,
            "diabetes_medication": 1,
            "clinical_activity": 34,
        },

        "history": {
            "diagnosis": "Early Type 2 Diabetes",
            "description": "Recently diagnosed diabetes under management.",
            "notes": "Lifestyle modification emphasized.",
        },

        "treatments": [
            {
                "treatment_name": "Lifestyle Management",
                "medication": None,
                "dosage": None,
                "start_date": date(2026, 6, 1),
                "end_date": None,
                "outcome": "Ongoing",
                "notes": "Diet and exercise program.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 5, 30),
            "discharge_date": date(2026, 6, 1),
            "admission_type": "Elective",
            "diagnosis": "Diabetes evaluation",
            "discharge_reason": "Stable",
        },
    },

    {
        "name": "Lakshmi Devi",
        "date_of_birth": date(1953, 8, 14),
        "gender": "Female",
        "phone": "9000000007",
        "address": "Nellore, Andhra Pradesh",
        "blood_group": "B-",

        "assessment": {
            "admission_type_id": 1,
            "discharge_disposition_id": 2,
            "admission_source_id": 4,
            "time_in_hospital": 8,
            "num_lab_procedures": 62,
            "num_procedures": 3,
            "num_medications": 20,
            "number_outpatient": 4,
            "number_emergency": 2,
            "number_inpatient": 2,
            "number_diagnoses": 8,
            "max_glu_serum": ">300",
            "A1Cresult": ">8",

            "metformin": "Down",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "No",
            "acetohexamide": "No",
            "glipizide": "Steady",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "Steady",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "Ch",
            "diabetesMed": "Yes",

            "race": "Caucasian",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Circulatory",
            "diag_3_category": "Other",

            "prior_utilization": 8,
            "medication_count": 3,
            "medication_changed": 1,
            "diabetes_medication": 1,
            "clinical_activity": 88,
        },

        "history": {
            "diagnosis": "Diabetes with Hypertension",
            "description": "Long-standing diabetes with recurrent admissions.",
            "notes": "High monitoring requirement.",
        },

        "treatments": [
            {
                "treatment_name": "Insulin Management",
                "medication": "Insulin",
                "dosage": "12 units",
                "start_date": date(2026, 3, 15),
                "end_date": date(2026, 5, 15),
                "outcome": "Improved",
                "notes": "Partial improvement observed.",
            },
            {
                "treatment_name": "Hypertension Management",
                "medication": "Antihypertensive Therapy",
                "dosage": "Standard",
                "start_date": date(2026, 5, 16),
                "end_date": None,
                "outcome": "Ongoing",
                "notes": "Continue monitoring blood pressure.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 3, 7),
            "discharge_date": date(2026, 3, 15),
            "admission_type": "Emergency",
            "diagnosis": "Uncontrolled Diabetes",
            "discharge_reason": "Clinical stabilization",
        },
    },

    {
        "name": "Vikram Singh",
        "date_of_birth": date(1960, 12, 6),
        "gender": "Male",
        "phone": "9000000008",
        "address": "Chennai, Tamil Nadu",
        "blood_group": "A+",

        "assessment": {
            "admission_type_id": 2,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 6,
            "num_lab_procedures": 50,
            "num_procedures": 2,
            "num_medications": 16,
            "number_outpatient": 2,
            "number_emergency": 1,
            "number_inpatient": 1,
            "number_diagnoses": 7,
            "max_glu_serum": "200-300",
            "A1Cresult": ">7",

            "metformin": "Steady",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "Steady",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "Steady",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "No",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "No",
            "diabetesMed": "Yes",

            "race": "AfricanAmerican",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Circulatory",
            "diag_3_category": "Digestive",

            "prior_utilization": 4,
            "medication_count": 3,
            "medication_changed": 0,
            "diabetes_medication": 1,
            "clinical_activity": 71,
        },

        "history": {
            "diagnosis": "Diabetes with Cardiovascular Risk",
            "description": "Moderate-risk chronic disease profile.",
            "notes": "Monitor medication adherence.",
        },

        "treatments": [
            {
                "treatment_name": "Combined Diabetes Therapy",
                "medication": "Metformin + Glimepiride",
                "dosage": "Standard",
                "start_date": date(2026, 4, 20),
                "end_date": date(2026, 7, 20),
                "outcome": "Favorable",
                "notes": "Patient responded well.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 4, 14),
            "discharge_date": date(2026, 4, 20),
            "admission_type": "Urgent",
            "diagnosis": "Diabetes with cardiovascular risk",
            "discharge_reason": "Stable",
        },
    },

    {
        "name": "Neha Gupta",
        "date_of_birth": date(1978, 5, 27),
        "gender": "Female",
        "phone": "9000000009",
        "address": "Pune, Maharashtra",
        "blood_group": "O+",

        "assessment": {
            "admission_type_id": 1,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 3,
            "num_lab_procedures": 32,
            "num_procedures": 1,
            "num_medications": 8,
            "number_outpatient": 1,
            "number_emergency": 0,
            "number_inpatient": 0,
            "number_diagnoses": 4,
            "max_glu_serum": "None",
            "A1Cresult": "Norm",

            "metformin": "Steady",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "No",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "No",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "No",
            "diabetesMed": "Yes",

            "race": "Asian",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Other",
            "diag_3_category": "Other",

            "prior_utilization": 1,
            "medication_count": 1,
            "medication_changed": 0,
            "diabetes_medication": 1,
            "clinical_activity": 41,
        },

        "history": {
            "diagnosis": "Type 2 Diabetes Mellitus",
            "description": "Well-controlled diabetes.",
            "notes": "Continue current treatment plan.",
        },

        "treatments": [
            {
                "treatment_name": "Routine Diabetes Care",
                "medication": "Metformin",
                "dosage": "500 mg",
                "start_date": date(2026, 6, 10),
                "end_date": date(2026, 8, 10),
                "outcome": "Recovered",
                "notes": "Condition improved significantly.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 6, 7),
            "discharge_date": date(2026, 6, 10),
            "admission_type": "Elective",
            "diagnosis": "Routine diabetes management",
            "discharge_reason": "Recovered",
        },
    },

    {
        "name": "Mohammed Ali",
        "date_of_birth": date(1950, 3, 16),
        "gender": "Male",
        "phone": "9000000010",
        "address": "Mumbai, Maharashtra",
        "blood_group": "B+",

        "assessment": {
            "admission_type_id": 1,
            "discharge_disposition_id": 2,
            "admission_source_id": 4,
            "time_in_hospital": 10,
            "num_lab_procedures": 75,
            "num_procedures": 5,
            "num_medications": 24,
            "number_outpatient": 6,
            "number_emergency": 4,
            "number_inpatient": 4,
            "number_diagnoses": 10,
            "max_glu_serum": ">300",
            "A1Cresult": ">8",

            "metformin": "Down",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "No",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "Steady",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "insulin": "Up",

            "glyburide_metformin": "No",
            "glipizide_metformin": "No",
            "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No",
            "metformin_pioglitazone": "No",

            "change": "Ch",
            "diabetesMed": "Yes",

            "race": "Other",
            "diag_1_category": "Diabetes",
            "diag_2_category": "Circulatory",
            "diag_3_category": "Respiratory",

            "prior_utilization": 14,
            "medication_count": 3,
            "medication_changed": 1,
            "diabetes_medication": 1,
            "clinical_activity": 104,
        },

        "history": {
            "diagnosis": "Complex Diabetes with Multiple Comorbidities",
            "description": "High healthcare utilization and multiple chronic conditions.",
            "notes": "Close post-discharge monitoring recommended.",
        },

        "treatments": [
            {
                "treatment_name": "Insulin Intensification",
                "medication": "Insulin",
                "dosage": "20 units",
                "start_date": date(2026, 2, 1),
                "end_date": date(2026, 4, 1),
                "outcome": "Ineffective",
                "notes": "Insufficient glycemic response.",
            },
            {
                "treatment_name": "Medication Review",
                "medication": "Diabetes Medication",
                "dosage": "Adjusted",
                "start_date": date(2026, 4, 2),
                "end_date": None,
                "outcome": "Monitoring",
                "notes": "Ongoing clinical monitoring.",
            },
        ],

        "admission": {
            "admission_date": date(2026, 1, 22),
            "discharge_date": date(2026, 2, 1),
            "admission_type": "Emergency",
            "diagnosis": "Uncontrolled diabetes with comorbidities",
            "discharge_reason": "Transferred for continued management",
        },
    },

    {
        "name": "Kavya Reddy",
        "date_of_birth": date(1968, 4, 12),
        "gender": "Female",
        "phone": "9000000012",
        "address": "Vijayawada, Andhra Pradesh",
        "blood_group": "O+",
        "assessment": {
            "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 3,
            "num_lab_procedures": 32, "num_procedures": 1, "num_medications": 8,
            "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0,
            "number_diagnoses": 3, "max_glu_serum": "None", "A1Cresult": "Norm",
            "metformin": "Steady", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
            "glipizide": "No", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "No", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "No", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Diabetes", "diag_2_category": "Other",
            "diag_3_category": "Other", "prior_utilization": 0,
            "medication_count": 1, "medication_changed": 0,
            "diabetes_medication": 1, "clinical_activity": 41,
        },
        "history": {
            "diagnosis": "Type 2 Diabetes",
            "description": "Stable diabetes under routine management.",
            "notes": "Continue routine monitoring and medication adherence.",
        },
        "treatments": [
            {
                "treatment_name": "Diabetes Management", "medication": "Metformin",
                "dosage": "500 mg", "start_date": date(2026, 7, 1),
                "end_date": date(2026, 8, 15), "outcome": "Improved",
                "notes": "Good response to treatment.",
            },
            {
                "treatment_name": "Lifestyle Management", "medication": None,
                "dosage": None, "start_date": date(2026, 7, 1),
                "end_date": None, "outcome": "Ongoing",
                "notes": "Continue diet and exercise plan.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 28),
            "discharge_date": date(2026, 7, 1),
            "admission_type": "Elective", "diagnosis": "Type 2 Diabetes",
            "discharge_reason": "Stable condition",
        },
    },
    {
        "name": "Rahul Verma",
        "date_of_birth": date(1947, 9, 3),
        "gender": "Male", "phone": "9000000013",
        "address": "Guntur, Andhra Pradesh", "blood_group": "B+",
        "assessment": {
            "admission_type_id": 2, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 8,
            "num_lab_procedures": 68, "num_procedures": 3, "num_medications": 22,
            "number_outpatient": 2, "number_emergency": 2, "number_inpatient": 1,
            "number_diagnoses": 8, "max_glu_serum": ">300", "A1Cresult": ">8",
            "metformin": "Steady", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "Up", "acetohexamide": "No",
            "glipizide": "No", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "Steady", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "Ch", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Circulatory", "diag_2_category": "Diabetes",
            "diag_3_category": "Other", "prior_utilization": 5,
            "medication_count": 3, "medication_changed": 1,
            "diabetes_medication": 1, "clinical_activity": 93,
        },
        "history": {
            "diagnosis": "Diabetes with cardiovascular disease",
            "description": "Multiple chronic conditions with prior healthcare utilization.",
            "notes": "Requires close post-discharge follow-up.",
        },
        "treatments": [
            {
                "treatment_name": "Cardiac Monitoring", "medication": None, "dosage": None,
                "start_date": date(2026, 7, 1), "end_date": date(2026, 7, 31),
                "outcome": "Improved", "notes": "Condition stabilized.",
            },
            {
                "treatment_name": "Insulin Therapy", "medication": "Insulin",
                "dosage": "Basal-bolus", "start_date": date(2026, 7, 1),
                "end_date": None, "outcome": "Ongoing",
                "notes": "Continue glucose monitoring.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 23), "discharge_date": date(2026, 7, 1),
            "admission_type": "Emergency", "diagnosis": "Circulatory disease with diabetes",
            "discharge_reason": "Clinical stabilization",
        },
    },
    {
        "name": "Sneha Iyer",
        "date_of_birth": date(1959, 1, 27),
        "gender": "Female", "phone": "9000000014",
        "address": "Visakhapatnam, Andhra Pradesh", "blood_group": "A+",
        "assessment": {
            "admission_type_id": 3, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 7,
            "num_lab_procedures": 61, "num_procedures": 2, "num_medications": 19,
            "number_outpatient": 1, "number_emergency": 4, "number_inpatient": 2,
            "number_diagnoses": 7, "max_glu_serum": ">300", "A1Cresult": ">8",
            "metformin": "Down", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "Steady", "acetohexamide": "No",
            "glipizide": "No", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "Up", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "Ch", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Respiratory", "diag_2_category": "Diabetes",
            "diag_3_category": "Circulatory", "prior_utilization": 7,
            "medication_count": 3, "medication_changed": 1,
            "diabetes_medication": 1, "clinical_activity": 82,
        },
        "history": {
            "diagnosis": "Diabetes with recurrent emergency visits",
            "description": "Frequent emergency utilization and complex clinical activity.",
            "notes": "Close follow-up recommended.",
        },
        "treatments": [
            {
                "treatment_name": "Insulin Intensification", "medication": "Insulin",
                "dosage": "Basal-bolus", "start_date": date(2026, 7, 1),
                "end_date": date(2026, 8, 30), "outcome": "Not Improved",
                "notes": "Limited response observed.",
            },
            {
                "treatment_name": "Diabetes Medication Review", "medication": "Metformin",
                "dosage": "500 mg", "start_date": date(2026, 8, 31),
                "end_date": None, "outcome": "Ongoing", "notes": "Continue monitoring.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 24), "discharge_date": date(2026, 7, 1),
            "admission_type": "Emergency", "diagnosis": "Uncontrolled diabetes with respiratory symptoms",
            "discharge_reason": "Stabilized after acute episode",
        },
    },
    {
        "name": "Divya Menon",
        "date_of_birth": date(1976, 7, 18),
        "gender": "Female", "phone": "9000000015",
        "address": "Eluru, Andhra Pradesh", "blood_group": "AB+",
        "assessment": {
            "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 2,
            "num_lab_procedures": 25, "num_procedures": 0, "num_medications": 6,
            "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0,
            "number_diagnoses": 2, "max_glu_serum": "None", "A1Cresult": "Norm",
            "metformin": "Steady", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
            "glipizide": "No", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "No", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "No", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Diabetes", "diag_2_category": "Other",
            "diag_3_category": "Other", "prior_utilization": 0,
            "medication_count": 1, "medication_changed": 0,
            "diabetes_medication": 1, "clinical_activity": 31,
        },
        "history": {
            "diagnosis": "Controlled Type 2 Diabetes",
            "description": "Good outpatient control with routine monitoring.",
            "notes": "Continue current management.",
        },
        "treatments": [
            {
                "treatment_name": "Glycemic Control", "medication": "Metformin",
                "dosage": "500 mg", "start_date": date(2026, 7, 1),
                "end_date": date(2026, 8, 1), "outcome": "Improved",
                "notes": "Good treatment response.",
            },
            {
                "treatment_name": "Dietary Management", "medication": None, "dosage": None,
                "start_date": date(2026, 7, 1), "end_date": date(2026, 9, 1),
                "outcome": "Successful", "notes": "Lifestyle plan completed.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 29), "discharge_date": date(2026, 7, 1),
            "admission_type": "Elective", "diagnosis": "Routine diabetes management",
            "discharge_reason": "Stable",
        },
    },
    {
        "name": "Karthik Nair",
        "date_of_birth": date(1943, 11, 9),
        "gender": "Male", "phone": "9000000016",
        "address": "Rajahmundry, Andhra Pradesh", "blood_group": "O-",
        "assessment": {
            "admission_type_id": 2, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 9,
            "num_lab_procedures": 74, "num_procedures": 4, "num_medications": 25,
            "number_outpatient": 3, "number_emergency": 3, "number_inpatient": 4,
            "number_diagnoses": 9, "max_glu_serum": ">300", "A1Cresult": ">8",
            "metformin": "Down", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "Up", "acetohexamide": "No",
            "glipizide": "No", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "Up", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "Ch", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Circulatory", "diag_2_category": "Diabetes",
            "diag_3_category": "Respiratory", "prior_utilization": 10,
            "medication_count": 3, "medication_changed": 1,
            "diabetes_medication": 1, "clinical_activity": 103,
        },
        "history": {
            "diagnosis": "Recurrent hospitalization with diabetes",
            "description": "Multiple inpatient admissions and high medication burden.",
            "notes": "Requires intensive post-discharge monitoring.",
        },
        "treatments": [
            {
                "treatment_name": "Intensive Diabetes Management", "medication": "Insulin",
                "dosage": "Basal-bolus", "start_date": date(2026, 7, 1),
                "end_date": date(2026, 9, 1), "outcome": "Not Improved",
                "notes": "Insufficient glycemic response.",
            },
            {
                "treatment_name": "Cardiac Monitoring", "medication": None, "dosage": None,
                "start_date": date(2026, 7, 1), "end_date": None,
                "outcome": "Ongoing", "notes": "Continued monitoring required.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 22), "discharge_date": date(2026, 7, 1),
            "admission_type": "Emergency", "diagnosis": "Diabetes with cardiovascular complications",
            "discharge_reason": "Discharged after extended monitoring",
        },
    },
    {
        "name": "Pooja Rao",
        "date_of_birth": date(1963, 5, 21),
        "gender": "Female", "phone": "9000000017",
        "address": "Machilipatnam, Andhra Pradesh", "blood_group": "A-",
        "assessment": {
            "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 5,
            "num_lab_procedures": 46, "num_procedures": 1, "num_medications": 13,
            "number_outpatient": 1, "number_emergency": 1, "number_inpatient": 0,
            "number_diagnoses": 5, "max_glu_serum": "None", "A1Cresult": ">7",
            "metformin": "Steady", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "Steady", "acetohexamide": "No",
            "glipizide": "No", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "No", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "No", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Diabetes", "diag_2_category": "Other",
            "diag_3_category": "Other", "prior_utilization": 2,
            "medication_count": 2, "medication_changed": 0,
            "diabetes_medication": 1, "clinical_activity": 60,
        },
        "history": {
            "diagnosis": "Type 2 Diabetes with moderate utilization",
            "description": "Requires regular monitoring and medication review.",
            "notes": "Maintain scheduled follow-up.",
        },
        "treatments": [
            {
                "treatment_name": "Medication Review", "medication": "Glimepiride",
                "dosage": "2 mg", "start_date": date(2026, 7, 1),
                "end_date": None, "outcome": "Ongoing", "notes": "Continue monitoring.",
            },
            {
                "treatment_name": "Diabetes Management", "medication": "Metformin",
                "dosage": "500 mg", "start_date": date(2026, 7, 1),
                "end_date": date(2026, 8, 15), "outcome": "Improved",
                "notes": "Condition improved.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 26), "discharge_date": date(2026, 7, 1),
            "admission_type": "Elective", "diagnosis": "Diabetes",
            "discharge_reason": "Stable discharge",
        },
    },
    {
        "name": "Aditya Kapoor",
        "date_of_birth": date(1951, 2, 14),
        "gender": "Male", "phone": "9000000018",
        "address": "Nellore, Andhra Pradesh", "blood_group": "B-",
        "assessment": {
            "admission_type_id": 2, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 6,
            "num_lab_procedures": 58, "num_procedures": 2, "num_medications": 20,
            "number_outpatient": 2, "number_emergency": 2, "number_inpatient": 1,
            "number_diagnoses": 7, "max_glu_serum": "200-300", "A1Cresult": ">8",
            "metformin": "Steady", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "Steady", "acetohexamide": "No",
            "glipizide": "Up", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "Steady", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "Ch", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Diabetes", "diag_2_category": "Circulatory",
            "diag_3_category": "Other", "prior_utilization": 5,
            "medication_count": 4, "medication_changed": 1,
            "diabetes_medication": 1, "clinical_activity": 80,
        },
        "history": {
            "diagnosis": "Complex diabetes medication profile",
            "description": "Multiple diabetes medications with cardiovascular comorbidity.",
            "notes": "Medication adherence should be monitored.",
        },
        "treatments": [
            {
                "treatment_name": "Combined Diabetes Therapy",
                "medication": "Metformin + Glimepiride", "dosage": "Combination",
                "start_date": date(2026, 7, 1), "end_date": date(2026, 8, 30),
                "outcome": "Improved", "notes": "Patient responded well.",
            },
            {
                "treatment_name": "Medication Adjustment", "medication": "Insulin",
                "dosage": "Titrated", "start_date": date(2026, 8, 31),
                "end_date": None, "outcome": "Ongoing",
                "notes": "Continue monitoring glucose.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 25), "discharge_date": date(2026, 7, 1),
            "admission_type": "Emergency", "diagnosis": "Diabetes with cardiovascular risk",
            "discharge_reason": "Medication stabilization",
        },
    },
    {
        "name": "Nandini Patil",
        "date_of_birth": date(1980, 10, 6),
        "gender": "Female", "phone": "9000000019",
        "address": "Tenali, Andhra Pradesh", "blood_group": "O+",
        "assessment": {
            "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 3,
            "num_lab_procedures": 30, "num_procedures": 0, "num_medications": 7,
            "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0,
            "number_diagnoses": 3, "max_glu_serum": "None", "A1Cresult": "Norm",
            "metformin": "Steady", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
            "glipizide": "No", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "No", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "No", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Diabetes", "diag_2_category": "Other",
            "diag_3_category": "Other", "prior_utilization": 0,
            "medication_count": 1, "medication_changed": 0,
            "diabetes_medication": 1, "clinical_activity": 37,
        },
        "history": {
            "diagnosis": "Stable diabetes follow-up",
            "description": "Routine management with low prior healthcare utilization.",
            "notes": "Continue current treatment plan.",
        },
        "treatments": [
            {
                "treatment_name": "Routine Diabetes Care", "medication": "Metformin",
                "dosage": "500 mg", "start_date": date(2026, 7, 1),
                "end_date": date(2026, 9, 1), "outcome": "Improved",
                "notes": "Condition improved.",
            },
            {
                "treatment_name": "Lifestyle Management", "medication": None, "dosage": None,
                "start_date": date(2026, 7, 1), "end_date": date(2026, 9, 1),
                "outcome": "Improved", "notes": "Lifestyle goals met.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 28), "discharge_date": date(2026, 7, 1),
            "admission_type": "Elective", "diagnosis": "Routine diabetes management",
            "discharge_reason": "Routine discharge",
        },
    },
    {
        "name": "Rohit Sharma",
        "date_of_birth": date(1949, 6, 30),
        "gender": "Male", "phone": "9000000020",
        "address": "Kakinada, Andhra Pradesh", "blood_group": "A+",
        "assessment": {
            "admission_type_id": 3, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 10,
            "num_lab_procedures": 80, "num_procedures": 5, "num_medications": 27,
            "number_outpatient": 4, "number_emergency": 3, "number_inpatient": 3,
            "number_diagnoses": 10, "max_glu_serum": ">300", "A1Cresult": ">8",
            "metformin": "Down", "repaglinide": "No", "nateglinide": "No",
            "chlorpropamide": "No", "glimepiride": "Up", "acetohexamide": "No",
            "glipizide": "Steady", "glyburide": "No", "tolbutamide": "No",
            "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
            "miglitol": "No", "troglitazone": "No", "tolazamide": "No",
            "insulin": "Up", "glyburide_metformin": "No",
            "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
            "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
            "change": "Ch", "diabetesMed": "Yes", "race": "Caucasian",
            "diag_1_category": "Circulatory", "diag_2_category": "Diabetes",
            "diag_3_category": "Respiratory", "prior_utilization": 10,
            "medication_count": 4, "medication_changed": 1,
            "diabetes_medication": 1, "clinical_activity": 112,
        },
        "history": {
            "diagnosis": "Complex diabetes with recurrent utilization",
            "description": "High clinical activity and repeated prior healthcare utilization.",
            "notes": "Close post-discharge monitoring recommended.",
        },
        "treatments": [
            {
                "treatment_name": "Insulin Intensification", "medication": "Insulin",
                "dosage": "Basal-bolus", "start_date": date(2026, 7, 1),
                "end_date": date(2026, 9, 1), "outcome": "Not Improved",
                "notes": "Insufficient glycemic response.",
            },
            {
                "treatment_name": "Hypertension Management",
                "medication": "Antihypertensive Therapy", "dosage": "Adjusted",
                "start_date": date(2026, 7, 1), "end_date": None,
                "outcome": "Ongoing", "notes": "Continued monitoring required.",
            },
        ],
        "admission": {
            "admission_date": date(2026, 6, 21), "discharge_date": date(2026, 7, 1),
            "admission_type": "Emergency", "diagnosis": "Uncontrolled diabetes with comorbidities",
            "discharge_reason": "Discharged after intensive monitoring",
        },
    },
]


# ============================================================
# LEGACY DEMO NAME MIGRATIONS
# ============================================================
#
# Earlier versions of this seed file used placeholder names:
# Demo Patient 12 ... Demo Patient 20.
#
# If those records already exist in the database, this mapping
# upgrades them to the final names without creating duplicates.
#
# Gender is explicitly checked against the final patient profile.
# ============================================================

LEGACY_NAME_MIGRATIONS = {
    "Demo Patient 12": ("Kavya Reddy", "Female"),
    "Demo Patient 13": ("Rahul Verma", "Male"),
    "Demo Patient 14": ("Sneha Iyer", "Female"),
    "Demo Patient 15": ("Divya Menon", "Female"),
    "Demo Patient 16": ("Karthik Nair", "Male"),
    "Demo Patient 17": ("Pooja Rao", "Female"),
    "Demo Patient 18": ("Aditya Kapoor", "Male"),
    "Demo Patient 19": ("Nandini Patil", "Female"),
    "Demo Patient 20": ("Rohit Sharma", "Male"),
}


# ============================================================
# SEED FUNCTION
# ============================================================

def seed_demo_data():
    db = SessionLocal()

    try:
        doctor = (
            db.query(User)
            .filter(User.email == "doctor@test.com")
            .first()
        )

        if doctor is None:
            raise RuntimeError(
                "Doctor account doctor@test.com was not found."
            )

        created_patients = 0
        renamed_patients = 0
        removed_legacy_duplicates = 0
        skipped_patients = 0
        created_assessments = 0
        created_treatments = 0
        created_histories = 0
        created_admissions = 0

        # --------------------------------------------------------
        # STEP 1: Validate final demo names and gender
        # --------------------------------------------------------
        for data in PATIENTS:
            expected_gender = None

            for legacy_name, (final_name, gender) in LEGACY_NAME_MIGRATIONS.items():
                if data["name"] == final_name:
                    expected_gender = gender
                    break

            if expected_gender is not None and data["gender"] != expected_gender:
                raise ValueError(
                    f"Gender mismatch for {data['name']}: "
                    f"expected {expected_gender}, found {data['gender']}."
                )

        # --------------------------------------------------------
        # STEP 2: Upgrade old placeholder names
        #
        # Case A:
        #   Only "Demo Patient 12" exists
        #   -> rename it to "Kavya Reddy"
        #
        # Case B:
        #   Both old and new names exist
        #   -> keep the final named record and remove the old
        #      placeholder duplicate.
        #
        # Case C:
        #   Neither exists
        #   -> normal seed creation happens below.
        # --------------------------------------------------------
        for legacy_name, (final_name, expected_gender) in LEGACY_NAME_MIGRATIONS.items():
            legacy_patient = (
                db.query(Patient)
                .filter(Patient.name == legacy_name)
                .first()
            )

            final_patient = (
                db.query(Patient)
                .filter(Patient.name == final_name)
                .first()
            )

            if legacy_patient and final_patient:
                # The named record is the final version.
                # Delete only the old placeholder duplicate.
                db.delete(legacy_patient)
                removed_legacy_duplicates += 1

                print(
                    f"[CLEANUP] Removed legacy duplicate "
                    f"{legacy_name} -> kept {final_name}."
                )

            elif legacy_patient:
                # Preserve the existing patient's related records,
                # simply replace the placeholder display name.
                if legacy_patient.gender != expected_gender:
                    raise ValueError(
                        f"Gender mismatch for legacy patient "
                        f"{legacy_name}: expected {expected_gender}, "
                        f"found {legacy_patient.gender}."
                    )

                legacy_patient.name = final_name
                renamed_patients += 1

                print(
                    f"[RENAMED] {legacy_name} -> "
                    f"{final_name} ({expected_gender})."
                )

        # Flush cleanup/renames before normal duplicate checks.
        db.flush()

        # --------------------------------------------------------
        # STEP 3: Seed missing final records
        # --------------------------------------------------------
        for data in PATIENTS:

            existing_patient = (
                db.query(Patient)
                .filter(Patient.name == data["name"])
                .first()
            )

            if existing_patient:
                print(
                    f"[SKIP] {data['name']} already exists."
                )
                skipped_patients += 1
                continue

            # ----------------------------------------------------
            # Create patient
            # ----------------------------------------------------
            patient = Patient(
                name=data["name"],
                date_of_birth=data["date_of_birth"],
                gender=data["gender"],
                phone=data["phone"],
                address=data["address"],
                blood_group=data["blood_group"],
                assigned_doctor_id=doctor.id,
            )

            db.add(patient)
            db.flush()

            created_patients += 1

            # ----------------------------------------------------
            # Clinical assessment
            # ----------------------------------------------------
            assessment = ClinicalAssessment(
                patient_id=patient.id,
                **data["assessment"],
            )

            db.add(assessment)
            created_assessments += 1

            # ----------------------------------------------------
            # Medical history
            # ----------------------------------------------------
            history_data = data["history"]

            history = MedicalHistory(
                patient_id=patient.id,
                diagnosis=history_data["diagnosis"],
                description=history_data["description"],
                diagnosis_date=date(2026, 1, 1),
                notes=history_data["notes"],
            )

            db.add(history)
            created_histories += 1

            # ----------------------------------------------------
            # Treatments
            # ----------------------------------------------------
            for treatment_data in data["treatments"]:

                treatment = Treatment(
                    patient_id=patient.id,
                    treatment_name=treatment_data["treatment_name"],
                    medication=treatment_data["medication"],
                    dosage=treatment_data["dosage"],
                    start_date=treatment_data["start_date"],
                    end_date=treatment_data["end_date"],
                    outcome=treatment_data["outcome"],
                    notes=treatment_data["notes"],
                )

                db.add(treatment)
                created_treatments += 1

            # ----------------------------------------------------
            # Admission
            # ----------------------------------------------------
            admission_data = data["admission"]

            admission = Admission(
                patient_id=patient.id,
                admission_date=admission_data["admission_date"],
                discharge_date=admission_data["discharge_date"],
                admission_type=admission_data["admission_type"],
                diagnosis=admission_data["diagnosis"],
                discharge_reason=admission_data["discharge_reason"],
                notes="Demo dataset record for HealthForecast AI.",
            )

            db.add(admission)
            created_admissions += 1

            print(
                f"[CREATED] {patient.name} "
                f"({patient.gender}) "
                f"(Patient ID: {patient.id})"
            )

        db.commit()

        print()
        print("=" * 60)
        print("HEALTHFORECAST AI - DEMO DATA SEED COMPLETE")
        print("=" * 60)
        print(f"Patients created              : {created_patients}")
        print(f"Patients renamed              : {renamed_patients}")
        print(f"Legacy duplicates removed     : {removed_legacy_duplicates}")
        print(f"Patients skipped              : {skipped_patients}")
        print(f"Assessments created           : {created_assessments}")
        print(f"Treatments created             : {created_treatments}")
        print(f"Medical histories created      : {created_histories}")
        print(f"Admissions created             : {created_admissions}")
        print("=" * 60)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    seed_demo_data()
