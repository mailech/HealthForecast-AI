from flask import Blueprint, request, jsonify
from database import get_connection

auth = Blueprint("auth", __name__)


@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE username=%s AND password=%s
        """,
        (username, password)
    )

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if user:

        return jsonify({
            "success": True,
            "role": user["role"],
            "username": user["username"]
        })

    return jsonify({
        "success": False,
        "message": "Invalid Username or Password"
    }), 401