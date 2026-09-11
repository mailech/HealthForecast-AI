import os

from dotenv import load_dotenv

from database import SessionLocal
from models.user import User
from auth.security import hash_password


load_dotenv()


username = os.getenv("ADMIN_USERNAME")
email = os.getenv("ADMIN_EMAIL")
password = os.getenv("ADMIN_PASSWORD")


if not username:
    raise ValueError("ADMIN_USERNAME is not set in .env")

if not email:
    raise ValueError("ADMIN_EMAIL is not set in .env")

if not password:
    raise ValueError("ADMIN_PASSWORD is not set in .env")


db = SessionLocal()

try:
    existing_user = db.query(User).filter(
        (User.username == username) |
        (User.email == email)
    ).first()

    if existing_user:
        existing_user.username = username
        existing_user.email = email
        existing_user.password_hash = hash_password(password)
        existing_user.role = "admin"
        existing_user.is_active = True

        db.commit()

        print("Existing user converted to admin.")

    else:
        admin_user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role="admin",
            is_active=True
        )

        db.add(admin_user)
        db.commit()

        print("Admin account created successfully.")

finally:
    db.close()