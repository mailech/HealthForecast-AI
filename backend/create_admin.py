from getpass import getpass

from app.database import SessionLocal
from app.models import User
from app.auth import hash_password


def create_admin():
    db = SessionLocal()

    try:
        print("\n========================================")
        print("   HealthForecast AI - Create Admin")
        print("========================================\n")

        name = input("Admin name: ").strip()
        email = input("Admin email: ").strip().lower()
        password = getpass("Admin password: ")
        confirm_password = getpass("Confirm password: ")

        if not name:
            print("\nError: Name cannot be empty.")
            return

        if not email:
            print("\nError: Email cannot be empty.")
            return

        if len(password) < 6:
            print("\nError: Password must be at least 6 characters.")
            return

        if password != confirm_password:
            print("\nError: Passwords do not match.")
            return

        # Check whether email already exists
        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            print("\nError: This email already exists.")

            print(
                f"Existing account role: {existing_user.role}"
            )

            return

        # Create Admin
        admin = User(
            name=name,
            email=email,
            password=hash_password(password),
            role="admin",
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("\n========================================")
        print("Admin account created successfully!")
        print("========================================")
        print(f"Name  : {admin.name}")
        print(f"Email : {admin.email}")
        print(f"Role  : {admin.role}")
        print("========================================\n")

    except Exception as error:
        db.rollback()
        print("\nError creating Admin:")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()