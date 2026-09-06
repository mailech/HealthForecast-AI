import os
import json
import joblib
import pandas as pd


# ============================================================
# HEALTHFORECAST AI
# MODEL SERVICE
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "healthforecast_model.joblib"
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "model_metadata.json"
)


# ============================================================
# MODEL SERVICE CLASS
# ============================================================

class ModelService:

    def __init__(self):

        self.model = None
        self.metadata = None

        self.load_model()


    # ========================================================
    # LOAD TRAINED MODEL
    # ========================================================

    def load_model(self):

        if not os.path.exists(MODEL_PATH):

            print(
                "WARNING: Trained model not found."
            )

            print(
                "Run train_model.py first."
            )

            return False

        try:

            self.model = joblib.load(
                MODEL_PATH
            )

            print(
                "HealthForecast AI model loaded successfully."
            )

            if os.path.exists(METADATA_PATH):

                with open(
                    METADATA_PATH,
                    "r",
                    encoding="utf-8"
                ) as file:

                    self.metadata = json.load(file)

            return True

        except Exception as error:

            print(
                f"Model loading error: {error}"
            )

            self.model = None

            return False


    # ========================================================
    # CHECK MODEL STATUS
    # ========================================================

    def is_ready(self):

        return self.model is not None


    # ========================================================
    # PREDICT
    # ========================================================

    def predict(self, patient_data):

        if self.model is None:

            raise RuntimeError(
                "ML model is not loaded. "
                "Please train the model first."
            )

        # Convert incoming patient information
        # into a pandas DataFrame

        patient_df = pd.DataFrame(
            [patient_data]
        )

        # Make prediction

        prediction = self.model.predict(
            patient_df
        )[0]

        # Get probabilities

        probabilities = self.model.predict_proba(
            patient_df
        )[0]

        # Get model classes

        classes = list(
            self.model.classes_
        )

        probability_map = {}

        for class_name, probability in zip(
            classes,
            probabilities
        ):

            probability_map[
                str(class_name)
            ] = round(
                float(probability) * 100,
                2
            )


        # ====================================================
        # 30-DAY READMISSION PROBABILITY
        # ====================================================

        readmission_probability = probability_map.get(
            "<30",
            0
        )


        # ====================================================
        # DETERMINE RISK LEVEL
        # ====================================================

        if readmission_probability >= 50:

            risk_level = "HIGH"

        elif readmission_probability >= 25:

            risk_level = "MODERATE"

        else:

            risk_level = "LOW"


        # ====================================================
        # RISK MESSAGE
        # ====================================================

        if risk_level == "HIGH":

            message = (
                "The model estimates a higher probability "
                "of readmission within 30 days. "
                "Further clinical assessment may be appropriate."
            )

        elif risk_level == "MODERATE":

            message = (
                "The model estimates a moderate probability "
                "of readmission within 30 days. "
                "Continued monitoring may be appropriate."
            )

        else:

            message = (
                "The model estimates a lower probability "
                "of readmission within 30 days."
            )


        # ====================================================
        # RISK FACTOR ANALYSIS
        # ====================================================

        risk_factors = self.identify_risk_factors(
            patient_data
        )


        # ====================================================
        # RETURN COMPLETE RESULT
        # ====================================================

        return {

            "prediction": str(
                prediction
            ),

            "risk_level": risk_level,

            "readmission_probability": readmission_probability,

            "class_probabilities": probability_map,

            "risk_factors": risk_factors,

            "message": message

        }


    # ========================================================
    # IDENTIFY IMPORTANT PATIENT FACTORS
    # ========================================================

    def identify_risk_factors(
        self,
        patient_data
    ):

        factors = []


        # Age

        age = patient_data.get(
            "age"
        )

        if age is not None:

            try:

                age = float(age)

                if age >= 75:

                    factors.append(
                        "Advanced age"
                    )

                elif age >= 60:

                    factors.append(
                        "Older age group"
                    )

            except:

                pass


        # Previous emergency visits

        emergency = patient_data.get(
            "number_emergency"
        )

        if emergency is not None:

            try:

                emergency = float(
                    emergency
                )

                if emergency >= 3:

                    factors.append(
                        "Multiple previous emergency visits"
                    )

                elif emergency >= 1:

                    factors.append(
                        "Previous emergency visit"
                    )

            except:

                pass


        # Previous inpatient visits

        inpatient = patient_data.get(
            "number_inpatient"
        )

        if inpatient is not None:

            try:

                inpatient = float(
                    inpatient
                )

                if inpatient >= 2:

                    factors.append(
                        "Multiple previous inpatient admissions"
                    )

                elif inpatient >= 1:

                    factors.append(
                        "Previous inpatient admission"
                    )

            except:

                pass


        # Hospital stay

        stay = patient_data.get(
            "time_in_hospital"
        )

        if stay is not None:

            try:

                stay = float(stay)

                if stay >= 10:

                    factors.append(
                        "Long hospital stay"
                    )

                elif stay >= 7:

                    factors.append(
                        "Extended hospital stay"
                    )

            except:

                pass


        # Number of medications

        medications = patient_data.get(
            "num_medications"
        )

        if medications is not None:

            try:

                medications = float(
                    medications
                )

                if medications >= 20:

                    factors.append(
                        "High medication burden"
                    )

            except:

                pass


        # Number of diagnoses

        diagnoses = patient_data.get(
            "number_diagnoses"
        )

        if diagnoses is not None:

            try:

                diagnoses = float(
                    diagnoses
                )

                if diagnoses >= 8:

                    factors.append(
                        "Multiple recorded diagnoses"
                    )

            except:

                pass


        # If no obvious factors

        if not factors:

            factors.append(
                "No major utilization-related risk factor detected"
            )


        return factors


    # ========================================================
    # MODEL INFORMATION
    # ========================================================

    def get_model_info(self):

        if self.metadata is None:

            return {

                "status": "not_available",

                "message":
                    "Model metadata is not available."

            }

        return self.metadata


# ============================================================
# CREATE GLOBAL MODEL SERVICE
# ============================================================

model_service = ModelService()
