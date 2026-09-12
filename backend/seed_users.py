from backend.auth_database import create_user, get_user_by_username


DEMO_USERS = [
    {
        "username": "doctor",
        "password": "Doctor@123",
        "full_name": "Demo Doctor",
        "role": "doctor"
    },
    {
        "username": "hospital_admin",
        "password": "Hospital@123",
        "full_name": "Hospital Administrator",
        "role": "hospital_admin"
    },
    {
        "username": "researcher",
        "password": "Researcher@123",
        "full_name": "Healthcare Researcher",
        "role": "healthcare_researcher"
    },
    {
        "username": "system_admin",
        "password": "System@123",
        "full_name": "System Administrator",
        "role": "system_admin"
    }
]


def create_demo_users():

    for user in DEMO_USERS:

        existing_user = get_user_by_username(
            user["username"]
        )

        if existing_user:
            print(
                f"User '{user['username']}' already exists. Skipping."
            )
            continue

        user_id = create_user(
            username=user["username"],
            password=user["password"],
            full_name=user["full_name"],
            role=user["role"]
        )

        print(
            f"Created {user['role']}: "
            f"{user['username']} (ID: {user_id})"
        )


if __name__ == "__main__":
    create_demo_users()
