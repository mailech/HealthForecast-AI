import sqlite3
import json
from datetime import datetime
from typing import Dict, List


DATABASE_PATH = "backend/healthforecast.db"


def get_connection():
    """
    Create and return a connection to the SQLite database.
    """
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """
    Create the predictions table if it does not already exist.
    """

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            prediction TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            readmission_probability REAL NOT NULL,
            patient_age REAL,
            gender TEXT,
            time_in_hospital INTEGER,
            emergency_visits INTEGER,
            inpatient_visits INTEGER,
            result_json TEXT
        )
        """
    )

    connection.commit()
    connection.close()


def save_prediction(
    patient_data: Dict,
    prediction_result: Dict
) -> int:
    """
    Save a prediction result into the database.

    Returns:
        ID of the newly created prediction record.
    """

    connection = get_connection()

    cursor = connection.cursor()

    created_at = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO predictions (
            created_at,
            prediction,
            risk_level,
            readmission_probability,
            patient_age,
            gender,
            time_in_hospital,
            emergency_visits,
            inpatient_visits,
            result_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            created_at,
            prediction_result.get("prediction"),
            prediction_result.get("risk_level"),
            prediction_result.get("readmission_probability"),
            patient_data.get("age"),
            patient_data.get("gender"),
            patient_data.get("time_in_hospital"),
            patient_data.get("number_emergency"),
            patient_data.get("number_inpatient"),
            json.dumps(prediction_result)
        )
    )

    connection.commit()

    prediction_id = cursor.lastrowid

    connection.close()

    return prediction_id


def get_history(limit: int = 20) -> List[Dict]:
    """
    Return the latest prediction records.
    """

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            created_at,
            prediction,
            risk_level,
            readmission_probability,
            patient_age,
            gender,
            time_in_hospital,
            emergency_visits,
            inpatient_visits
        FROM predictions
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,)
    )

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


def get_stats() -> Dict:
    """
    Return dashboard statistics.
    """

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT COUNT(*) AS total
        FROM predictions
        """
    )

    total = cursor.fetchone()["total"]

    cursor.execute(
        """
        SELECT COUNT(*) AS high_risk
        FROM predictions
        WHERE risk_level = 'HIGH'
        """
    )

    high_risk = cursor.fetchone()["high_risk"]

    cursor.execute(
        """
        SELECT COUNT(*) AS moderate_risk
        FROM predictions
        WHERE risk_level = 'MODERATE'
        """
    )

    moderate_risk = cursor.fetchone()["moderate_risk"]

    cursor.execute(
        """
        SELECT COUNT(*) AS low_risk
        FROM predictions
        WHERE risk_level = 'LOW'
        """
    )

    low_risk = cursor.fetchone()["low_risk"]

    cursor.execute(
        """
        SELECT AVG(readmission_probability) AS average_probability
        FROM predictions
        """
    )

    average_probability = cursor.fetchone()["average_probability"]

    connection.close()

    return {
        "total_predictions": total,
        "high_risk": high_risk,
        "moderate_risk": moderate_risk,
        "low_risk": low_risk,
        "average_readmission_probability": (
            round(average_probability, 4)
            if average_probability is not None
            else 0
        )
    }


def clear_history():
    """
    Delete all prediction history.
    """

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("DELETE FROM predictions")

    connection.commit()

    connection.close()


# Initialize database when this module is loaded.
init_db()
