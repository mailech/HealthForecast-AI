import os
import joblib
import pandas as pd


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "readmission_model.joblib"
)


_model = None


def get_model():
    global _model

    if _model is None:

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Trained ML model not found. "
                "Run: python ml/train_model.py"
            )

        _model = joblib.load(
            MODEL_PATH
        )

    return _model


def predict_readmission(
    age: int,
    gender: str,
    disease: str,
):
    model = get_model()


    # ========================================================
    # MAP APPLICATION PATIENT DATA
    # TO MODEL FEATURES
    # ========================================================

    age_value = str(age)

    if age < 20:
        age_group = "[0-10)"
    elif age < 30:
        age_group = "[20-30)"
    elif age < 40:
        age_group = "[30-40)"
    elif age < 50:
        age_group = "[40-50)"
    elif age < 60:
        age_group = "[50-60)"
    elif age < 70:
        age_group = "[60-70)"
    elif age < 80:
        age_group = "[70-80)"
    elif age < 90:
        age_group = "[80-90)"
    else:
        age_group = "[90-100)"


    # Default clinical values are used because
    # the current Patient model stores only basic
    # demographic/clinical information.

    input_data = pd.DataFrame(
        [
            {
                "race": "Caucasian",
                "gender": gender,
                "age": age_group,
                "admission_type_id": 1,
                "discharge_disposition_id": 1,
                "admission_source_id": 7,
                "time_in_hospital": 4,
                "num_lab_procedures": 40,
                "num_procedures": 1,
                "num_medications": 10,
                "number_outpatient": 0,
                "number_emergency": 0,
                "number_inpatient": 0,
                "number_diagnoses": 5,
                "max_glu_serum": "None",
                "A1Cresult": "None",
                "insulin": "No",
                "change": "No",
                "diabetesMed": "Yes",
            }
        ]
    )


    probability = float(
        model.predict_proba(
            input_data
        )[0][1]
    )


    # ========================================================
    # RISK LEVEL
    # ========================================================

    if probability >= 0.60:
        risk_level = "High"

    elif probability >= 0.30:
        risk_level = "Medium"

    else:
        risk_level = "Low"


    # ========================================================
    # RECOMMENDATION
    # ========================================================

    if risk_level == "High":

        recommendation = (
            "High predicted readmission risk. "
            "Consider closer clinical follow-up, "
            "medication review and discharge planning."
        )

    elif risk_level == "Medium":

        recommendation = (
            "Moderate predicted readmission risk. "
            "Monitor the patient closely and "
            "review follow-up requirements."
        )

    else:

        recommendation = (
            "Low predicted readmission risk. "
            "Continue routine monitoring and "
            "standard follow-up care."
        )


    return {
        "risk_score": round(
            probability,
            4
        ),
        "risk_level": risk_level,
        "recommendation": recommendation,
    }