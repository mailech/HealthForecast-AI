import os
import joblib
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression


# --------------------------------------------------
# Model file path
# --------------------------------------------------

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "risk_prediction_model.joblib"
)


# --------------------------------------------------
# Train Risk Prediction Model
# --------------------------------------------------

def train_risk_model():

    """
    Train a Logistic Regression model using
    healthcare-related numerical features.

    Features:
    1. Age
    2. Blood pressure
    3. Blood sugar
    4. Heart rate
    5. Previous hospitalizations
    6. Chronic disease count

    Target:
    0 = Low risk
    1 = High risk
    """

    # Training input data
    X = np.array([
        [25, 110, 90, 72, 0, 0],
        [30, 115, 100, 75, 0, 0],
        [35, 120, 110, 78, 1, 0],
        [40, 125, 120, 80, 1, 1],
        [45, 130, 135, 85, 2, 1],
        [50, 135, 145, 88, 2, 2],
        [55, 140, 160, 92, 3, 2],
        [60, 145, 175, 95, 3, 3],
        [65, 150, 190, 100, 4, 3],
        [70, 160, 210, 105, 5, 4],

        [28, 112, 95, 70, 0, 0],
        [38, 118, 115, 76, 1, 1],
        [48, 128, 140, 84, 2, 1],
        [58, 142, 170, 94, 3, 2],
        [68, 155, 200, 102, 4, 4]
    ])

    # 0 = Low risk
    # 1 = High risk
    y = np.array([
        0, 0, 0, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 0, 1, 1
    ])

    # Create machine learning pipeline
    model = Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "classifier",
            LogisticRegression(
                random_state=42,
                max_iter=1000
            )
        )
    ])

    # Train model
    model.fit(X, y)

    # Save trained model
    joblib.dump(model, MODEL_PATH)

    print("✅ Risk prediction model trained successfully.")
    print("✅ Model saved at:", MODEL_PATH)

    return model


# --------------------------------------------------
# Predict Patient Risk
# --------------------------------------------------

def predict_risk(
    age,
    blood_pressure,
    blood_sugar,
    heart_rate,
    previous_hospitalizations,
    chronic_disease_count
):

    """
    Predict the patient's healthcare risk.

    Returns:
        prediction
        risk_level
        risk_score
        recommendation
    """

    # Train model automatically if model file does not exist
    if not os.path.exists(MODEL_PATH):
        model = train_risk_model()
    else:
        model = joblib.load(MODEL_PATH)

    # Convert input values to numbers
    age = float(age)
    blood_pressure = float(blood_pressure)
    blood_sugar = float(blood_sugar)
    heart_rate = float(heart_rate)
    previous_hospitalizations = float(
        previous_hospitalizations
    )
    chronic_disease_count = float(
        chronic_disease_count
    )

    # Prepare input data in the same order
    # used during training
    input_data = np.array([[
        age,
        blood_pressure,
        blood_sugar,
        heart_rate,
        previous_hospitalizations,
        chronic_disease_count
    ]])

    # Generate prediction
    prediction = int(
        model.predict(input_data)[0]
    )

    # Get probability of high-risk class
    probability = float(
        model.predict_proba(input_data)[0][1]
    )

    # Convert probability to percentage
    risk_score = round(
        probability * 100,
        2
    )

    # Classify risk level
    if risk_score >= 70:
        risk_level = "High"

    elif risk_score >= 40:
        risk_level = "Medium"

    else:
        risk_level = "Low"

    # Generate recommendation
    if risk_level == "High":

        recommendation = (
            "The patient shows several high-risk indicators. "
            "Closer clinical monitoring and timely follow-up "
            "are recommended."
        )

    elif risk_level == "Medium":

        recommendation = (
            "The patient shows moderate-risk indicators. "
            "Regular monitoring and preventive healthcare "
            "follow-up are recommended."
        )

    else:

        recommendation = (
            "The patient currently shows relatively low-risk "
            "indicators. Continue regular healthcare monitoring."
        )

    # Return result to FastAPI
    return {
        "prediction": prediction,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommendation": recommendation
    }


# --------------------------------------------------
# Test the Model Directly
# --------------------------------------------------

if __name__ == "__main__":

    print("\nTraining risk prediction model...\n")

    train_risk_model()

    print("\nTesting prediction...\n")

    result = predict_risk(
        age=60,
        blood_pressure=145,
        blood_sugar=175,
        heart_rate=95,
        previous_hospitalizations=3,
        chronic_disease_count=2
    )

    print("Prediction Result:")
    print(result)