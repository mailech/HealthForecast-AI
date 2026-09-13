from app.database import Base, engine, SessionLocal
from app.models.user import User, UserRole
from app.utils.security import hash_password


DEMO_USERS = [
    {
        "name": "Test Doctor",
        "email": "doctor@test.com",
        "password": "password123",
        "role": UserRole.DOCTOR,
    },
    {
        "name": "Hospital Administrator",
        "email": "hospitaladmin@test.com",
        "password": "HospitalAdmin@123",
        "role": UserRole.HOSPITAL_ADMIN,
    },
    {
        "name": "Healthcare Researcher",
        "email": "researcher@test.com",
        "password": "Researcher@123",
        "role": UserRole.HEALTHCARE_RESEARCHER,
    },
    {
        "name": "System Administrator",
        "email": "admin@healthforecast.com",
        "password": "Admin@123",
        "role": UserRole.SYSTEM_ADMIN,
    },
]


def create_or_update_demo_users():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        for demo_user in DEMO_USERS:
            user = (
                db.query(User)
                .filter(User.email == demo_user["email"])
                .first()
            )

            if user:
                user.name = demo_user["name"]
                user.hashed_password = hash_password(
                    demo_user["password"]
                )
                user.role = demo_user["role"]
                user.is_active = True

                print(
                    f"UPDATED: {demo_user['email']} "
                    f"-> {demo_user['role'].value}"
                )

            else:
                user = User(
                    name=demo_user["name"],
                    email=demo_user["email"],
                    hashed_password=hash_password(
                        demo_user["password"]
                    ),
                    role=demo_user["role"],
                    is_active=True,
                )

                db.add(user)

                print(
                    f"CREATED: {demo_user['email']} "
                    f"-> {demo_user['role'].value}"
                )

        db.commit()

        print()
        print("Demo accounts are ready.")
        print("Do not use these credentials in production.")

    finally:
        db.close()


if __name__ == "__main__":
    create_or_update_demo_users()