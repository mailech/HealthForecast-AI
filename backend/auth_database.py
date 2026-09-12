import sqlite3
import hashlib
import hmac
import os
from datetime import datetime
from typing import Optional, Dict, List


DATABASE_PATH = "backend/healthforecast.db"

VALID_ROLES = {
    "doctor",
    "hospital_admin",
    "healthcare_researcher",
    "system_admin"
}


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_user_db():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            CHECK (
                role IN (
                    'doctor',
                    'hospital_admin',
                    'healthcare_researcher',
                    'system_admin'
                )
            )
        )
        """
    )

    connection.commit()
    connection.close()


def hash_password(password: str) -> str:
    """
    Securely hash a password using PBKDF2-HMAC-SHA256.
    A unique random salt is generated for every password.
    """

    salt = os.urandom(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120000
    )

    return f"{salt.hex()}${password_hash.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify a password against its stored PBKDF2 hash.
    """

    try:
        salt_hex, hash_hex = stored_hash.split("$")

        salt = bytes.fromhex(salt_hex)

        calculated_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            120000
        )

        return hmac.compare_digest(
            calculated_hash.hex(),
            hash_hex
        )

    except (ValueError, TypeError):
        return False


def create_user(
    username: str,
    password: str,
    full_name: str,
    role: str
) -> int:

    if role not in VALID_ROLES:
        raise ValueError("Invalid user role")

    connection = get_connection()
    cursor = connection.cursor()

    now = datetime.now().isoformat()

    password_hash = hash_password(password)

    try:
        cursor.execute(
            """
            INSERT INTO users (
                username,
                password_hash,
                full_name,
                role,
                is_active,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, 1, ?, ?)
            """,
            (
                username,
                password_hash,
                full_name,
                role,
                now,
                now
            )
        )

        connection.commit()

        user_id = cursor.lastrowid

    except sqlite3.IntegrityError:
        connection.close()
        raise ValueError("Username already exists")

    connection.close()

    return user_id


def get_user_by_username(username: str) -> Optional[Dict]:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            username,
            password_hash,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        FROM users
        WHERE username = ?
        """,
        (username,)
    )

    row = cursor.fetchone()

    connection.close()

    return dict(row) if row else None


def get_user_by_id(user_id: int) -> Optional[Dict]:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            username,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    )

    row = cursor.fetchone()

    connection.close()

    return dict(row) if row else None


def list_users() -> List[Dict]:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            username,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        FROM users
        ORDER BY id DESC
        """
    )

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


def update_user_role(user_id: int, role: str) -> bool:

    if role not in VALID_ROLES:
        raise ValueError("Invalid user role")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE users
        SET role = ?,
            updated_at = ?
        WHERE id = ?
        """,
        (
            role,
            datetime.now().isoformat(),
            user_id
        )
    )

    connection.commit()

    updated = cursor.rowcount > 0

    connection.close()

    return updated


def set_user_active(user_id: int, is_active: bool) -> bool:

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE users
        SET is_active = ?,
            updated_at = ?
        WHERE id = ?
        """,
        (
            1 if is_active else 0,
            datetime.now().isoformat(),
            user_id
        )
    )

    connection.commit()

    updated = cursor.rowcount > 0

    connection.close()

    return updated


def delete_user(user_id: int) -> bool:

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM users
        WHERE id = ?
        """,
        (user_id,)
    )

    connection.commit()

    deleted = cursor.rowcount > 0

    connection.close()

    return deleted


init_user_db()
