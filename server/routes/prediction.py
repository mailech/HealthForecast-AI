from flask import Blueprint, request, jsonify
import pandas as pd
import joblib

prediction = Blueprint("prediction", __name__)

# Load AI model
model = joblib.load("risk_model.pkl")


@prediction.route("/", methods=["POST"])
def predict():

    try:

        data = request.json

        input_df = pd.DataFrame([{
            "age": int(data["age"]),
            "gender": data["gender"],
            "disease": data["disease"]
        }])

        risk = model.predict(input_df)[0]

        return jsonify({
            "risk": risk
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500