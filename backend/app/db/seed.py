"""
Creates the tables (dev convenience — use Alembic migrations in production)
and a single System Administrator account so you can log in and create
everyone else through the API/UI.

Run with:  python -m app.db.seed
"""
import os

from app.core.rbac import Role
from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models.user import User


def run():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@healthforecast.ai")
        if db.query(User).filter(User.email == admin_email).first():
            print(f"Admin '{admin_email}' already exists — skipping.")
            return

        admin = User(
            email=admin_email,
            hashed_password=hash_password(os.getenv("SEED_ADMIN_PASSWORD", "ChangeMe123!")),
            full_name="System Administrator",
            role=Role.SYSTEM_ADMIN.value,
        )
        db.add(admin)
        db.commit()
        print(f"Created System Administrator: {admin_email}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
