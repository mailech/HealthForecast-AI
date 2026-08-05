from flask import Blueprint, jsonify, request
from database import get_connection

doctors = Blueprint("doctors", __name__)


# ---------------- GET ALL DOCTORS ----------------

@doctors.route("/", methods=["GET"])
def get_doctors():

    connection = get_connection()

    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM doctors")

    data = cursor.fetchall()

    cursor.close()

    connection.close()

    return jsonify(data)


# ---------------- ADD DOCTOR ----------------

@doctors.route("/", methods=["POST"])
def add_doctor():

    data = request.json

    connection = get_connection()

    cursor = connection.cursor()

    sql = """
    INSERT INTO doctors
    (doctor_id, name, department, experience, status)
    VALUES (%s, %s, %s, %s, %s)
    """

    values = (
        data["doctor_id"],
        data["name"],
        data["department"],
        data["experience"],
        data["status"]
    )

    cursor.execute(sql, values)

    connection.commit()

    cursor.close()

    connection.close()

    return jsonify({
        "message": "Doctor Added Successfully"
    })


# ---------------- UPDATE DOCTOR ----------------

@doctors.route("/<int:id>", methods=["PUT"])
def update_doctor(id):

    data = request.json

    connection = get_connection()

    cursor = connection.cursor()

    sql = """
    UPDATE doctors
    SET
        doctor_id=%s,
        name=%s,
        department=%s,
        experience=%s,
        status=%s
    WHERE id=%s
    """

    values = (
        data["doctor_id"],
        data["name"],
        data["department"],
        data["experience"],
        data["status"],
        id
    )

    cursor.execute(sql, values)

    connection.commit()

    cursor.close()

    connection.close()

    return jsonify({
        "message": "Doctor Updated Successfully"
    })


# ---------------- DELETE DOCTOR ----------------

@doctors.route("/<int:id>", methods=["DELETE"])
def delete_doctor(id):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM doctors WHERE id=%s",
        (id,)
    )

    connection.commit()

    cursor.close()

    connection.close()

    return jsonify({
        "message": "Doctor Deleted Successfully"
    })