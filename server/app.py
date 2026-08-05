from flask import Flask
from flask_cors import CORS

from database import get_connection
from routes.auth import auth
from routes.patients import patients
from routes.doctors import doctors
from routes.prediction import prediction

app = Flask(__name__)

CORS(app)

# Register Blueprints
app.register_blueprint(auth, url_prefix="/api")
app.register_blueprint(patients, url_prefix="/api/patients")
app.register_blueprint(doctors, url_prefix="/api/doctors")
app.register_blueprint(prediction, url_prefix="/api/predict")


@app.route("/")
def home():

    return {
        "message": "HealthForecast AI Backend Running Successfully!"
    }


@app.route("/db-test")
def db_test():

    try:

        connection = get_connection()

        connection.close()

        return {
            "status": "success",
            "message": "Database Connected Successfully!"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":

    app.run(debug=True)