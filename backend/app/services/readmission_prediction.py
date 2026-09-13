from pathlib import Path
from typing import Any

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "final_threshold_optimized_readmission_model.joblib"
)


MEDICATION_COLUMNS = [
    "metformin",
    "repaglinide",
    "nateglinide",
    "chlorpropamide",
    "glimepiride",
    "acetohexamide",
    "glipizide",
    "glyburide",
    "tolbutamide",
    "pioglitazone",
    "rosiglitazone",
    "acarbose",
    "miglitol",
    "troglitazone",
    "tolazamide",
    "insulin",
    "glyburide-metformin",
    "glipizide-metformin",
    "glimepiride-pioglitazone",
    "metformin-rosiglitazone",
    "metformin-pioglitazone",
]


class ReadmissionPredictionService:
    """
    Service responsible for loading the trained readmission model,
    reproducing the training-time feature engineering, and generating
    patient readmission risk predictions.
    """

    def __init__(self, model_path: Path):
        self.model_path = model_path

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Readmission model not found at: {self.model_path}"
            )

        self.bundle = joblib.load(self.model_path)

        self.model = self.bundle["model"]
        self.preprocessor = self.bundle["preprocessor"]
        self.feature_columns = self.bundle["feature_columns"]
        self.class_mapping = self.bundle["class_mapping"]
        self.decision_threshold = self.bundle["decision_threshold"]

    @staticmethod
    def extract_diagnosis_category(value: Any) -> str:
        """
        Convert ICD diagnosis codes into broad clinical categories.
        This matches the feature engineering used during model training.
        """

        if value is None or pd.isna(value):
            return "Unknown"

        value = str(value).strip()

        if value == "":
            return "Unknown"

        if value.startswith("V"):
            return "Supplementary"

        if value.startswith("E"):
            return "External_Cause"

        try:
            code = float(value)
        except ValueError:
            return "Other"

        if 390 <= code <= 459:
            return "Circulatory"

        if 460 <= code <= 519:
            return "Respiratory"

        if 520 <= code <= 579:
            return "Digestive"

        if 580 <= code <= 629:
            return "Genitourinary"

        if 630 <= code <= 679:
            return "Pregnancy"

        if 680 <= code <= 709:
            return "Skin"

        if 710 <= code <= 739:
            return "Musculoskeletal"

        if 740 <= code <= 759:
            return "Congenital"

        if 760 <= code <= 779:
            return "Perinatal"

        if 780 <= code <= 799:
            return "Symptoms"

        if 800 <= code <= 999:
            return "Injury_Poisoning"

        if 250 <= code < 251:
            return "Diabetes"

        return "Other"

    @staticmethod
    def convert_age_to_numeric(age_value: Any) -> Any:
        """
        Convert the dataset age bucket into the numeric representation
        used during training.
        """

        age_map = {
            "[0-10)": 5,
            "[10-20)": 15,
            "[20-30)": 25,
            "[30-40)": 35,
            "[40-50)": 45,
            "[50-60)": 55,
            "[60-70)": 65,
            "[70-80)": 75,
            "[80-90)": 85,
            "[90-100)": 95,
        }

        return age_map.get(age_value, age_value)

    @staticmethod
    def interpret_risk(
        probability: float,
        decision_threshold: float
    ) -> tuple[str, str, str]:
        """
        Convert the model probability into a project-defined
        risk category and provide a human-readable interpretation.

        These risk bands are application-level thresholds and
        are not clinical guidelines.
        """

        if probability >= decision_threshold:
            return (
                "High",
                "The patient's predicted readmission probability "
                "is at or above the model decision threshold.",
                "Prioritize follow-up planning and closer "
                "post-discharge monitoring."
            )

        if probability >= 0.30:
            return (
                "Moderate",
                "The patient's predicted readmission probability "
                "is below the decision threshold but indicates "
                "an intermediate level of predicted risk.",
                "Consider structured follow-up and continued "
                "patient monitoring."
            )

        return (
            "Low",
            "The patient's predicted readmission probability "
            "is currently below the moderate-risk band and "
            "below the model decision threshold.",
            "Routine follow-up and standard "
            "post-discharge monitoring."
        )

    def engineer_features(
        self,
        patient_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Reproduce the feature engineering performed during model training.
        """

        data = patient_data.copy()

        # ---------------------------------------------------------
        # Age
        # ---------------------------------------------------------
        if "age_numeric" not in data and "age" in data:
            data["age_numeric"] = self.convert_age_to_numeric(
                data["age"]
            )

        # ---------------------------------------------------------
        # Diagnosis categories
        # ---------------------------------------------------------
        for column in ["diag_1", "diag_2", "diag_3"]:
            category_column = f"{column}_category"

            if category_column not in data:
                data[category_column] = (
                    self.extract_diagnosis_category(
                        data.get(column)
                    )
                )

        # ---------------------------------------------------------
        # Prior healthcare utilization
        # ---------------------------------------------------------
        outpatient = data.get("number_outpatient", 0) or 0
        emergency = data.get("number_emergency", 0) or 0
        inpatient = data.get("number_inpatient", 0) or 0

        data["prior_utilization"] = (
            float(outpatient)
            + float(emergency)
            + float(inpatient)
        )

        # ---------------------------------------------------------
        # Medication count
        # Count medications with an active medication status.
        #
        # Training preprocessing uses:
        # Steady / Up / Down
        # ---------------------------------------------------------
        medication_count = 0

        for medication in MEDICATION_COLUMNS:
            value = data.get(medication)

            if value in {"Steady", "Up", "Down"}:
                medication_count += 1

        data["medication_count"] = medication_count

        # ---------------------------------------------------------
        # Medication changed
        # ---------------------------------------------------------
        data["medication_changed"] = (
            1 if data.get("change") == "Ch" else 0
        )

        # ---------------------------------------------------------
        # Diabetes medication
        # ---------------------------------------------------------
        data["diabetes_medication"] = (
            1 if data.get("diabetesMed") == "Yes" else 0
        )

        # ---------------------------------------------------------
        # Clinical activity
        # ---------------------------------------------------------
        lab_procedures = data.get("num_lab_procedures", 0) or 0
        procedures = data.get("num_procedures", 0) or 0
        medications = data.get("num_medications", 0) or 0

        data["clinical_activity"] = (
            float(lab_procedures)
            + float(procedures)
            + float(medications)
        )

        # ---------------------------------------------------------
        # Remove raw columns that were removed during training
        # ---------------------------------------------------------
        data.pop("age", None)
        data.pop("diag_1", None)
        data.pop("diag_2", None)
        data.pop("diag_3", None)

        return data

    def predict(
        self,
        patient_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Generate a readmission prediction for a single patient.
        """

        # ---------------------------------------------------------
        # Step 1: Reproduce training-time feature engineering
        # ---------------------------------------------------------
        engineered_data = self.engineer_features(
            patient_data
        )

        input_data = pd.DataFrame([engineered_data])

        # ---------------------------------------------------------
        # Step 2: Validate required model features
        # ---------------------------------------------------------
        missing_features = [
            column
            for column in self.feature_columns
            if column not in input_data.columns
        ]

        if missing_features:
            raise ValueError(
                "Missing required model features: "
                + ", ".join(missing_features)
            )

        # ---------------------------------------------------------
        # Step 3: Keep exactly the features used during training
        # ---------------------------------------------------------
        input_data = input_data[self.feature_columns]

        # ---------------------------------------------------------
        # Step 4: Apply saved preprocessing
        # ---------------------------------------------------------
        processed_data = self.preprocessor.transform(
            input_data
        )

        # ---------------------------------------------------------
        # Step 5: Generate readmission probability
        # ---------------------------------------------------------
        probability = float(
            self.model.predict_proba(processed_data)[0, 1]
        )

        # ---------------------------------------------------------
        # Step 6: Apply optimized decision threshold
        # ---------------------------------------------------------
        prediction = int(
            probability >= self.decision_threshold
        )

        prediction_label = self.class_mapping[prediction]

        # ---------------------------------------------------------
        # Step 7: Generate risk interpretation
        # ---------------------------------------------------------
        (
            risk_level,
            clinical_interpretation,
            recommended_action
        ) = self.interpret_risk(
            probability,
            self.decision_threshold
        )

        # ---------------------------------------------------------
        # Step 8: Return complete prediction response
        # ---------------------------------------------------------
        return {
            "readmission_probability": round(
                probability,
                4
            ),
            "decision_threshold": round(
                float(self.decision_threshold),
                4
            ),
            "predicted_class": prediction,
            "predicted_outcome": prediction_label,
            "risk_level": risk_level,
            "clinical_interpretation": clinical_interpretation,
            "recommended_action": recommended_action,
        }


readmission_prediction_service = ReadmissionPredictionService(
    MODEL_PATH
)