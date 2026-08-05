from flask import Blueprint, jsonify, request
from database import get_connection

patients = Blueprint("patients", __name__)


# ---------------- GET ALL PATIENTS ----------------

@patients.route("/", methods=["GET"])
def get_patients():

    connection = get_connection()

    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM patients")

    data = cursor.fetchall()

    cursor.close()

    connection.close()

    return jsonify(data)


# ---------------- ADD PATIENT ----------------

@patients.route("/", methods=["POST"])
def add_patient():

    data = request.json

    connection = get_connection()

    cursor = connection.cursor()

    sql = """
    INSERT INTO patients
    (name, age, gender, disease, risk)
    VALUES (%s, %s, %s, %s, %s)
    """

    values = (
        data["name"],
        data["age"],
        data["gender"],
        data["disease"],
        data["risk"]
    )

    cursor.execute(sql, values)

    connection.commit()

    cursor.close()

    connection.close()

    return jsonify({
        "message": "Patient Added Successfully"
    })


# ---------------- DELETE PATIENT ----------------

@patients.route("/<int:id>", methods=["DELETE"])
def delete_patient(id):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM patients WHERE id=%s",
        (id,)
    )

    connection.commit()

    cursor.close()

    connection.close()

    return jsonify({
        "message": "Patient Deleted Successfully"
    })


# ---------------- UPDATE PATIENT ----------------

@patients.route("/<int:id>", methods=["PUT"])
def update_patient(id):

    data = request.json

    connection = get_connection()

    cursor = connection.cursor()

    sql = """
    UPDATE patients
    SET
        name=%s,
        age=%s,
        gender=%s,
        disease=%s,
        risk=%s
    WHERE id=%s
    """

    values = (
        data["name"],
        data["age"],
        data["gender"],
        data["disease"],
        data["risk"],
        id
    )

    cursor.execute(sql, values)

    connection.commit()

    cursor.close()

    connection.close()

    return jsonify({
        "message": "Patient Updated Successfully"
    })