from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import Base, engine, SessionLocal
from app.models import User, Patient
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

ACCOUNTS = [
    ("System Administrator", "systemadmin@gmail.com", "SystemAdmin@123", "system_administrator"),
    ("Hospital Administrator", "hospitaladministration@gmail.com", "HospitalAdmin@123", "hospital_administrator"),
    ("Doctor", "doctor@gmail.com", "Doctor@123", "doctor"),
    ("Healthcare Researcher", "hospitalresearcher@gmail.com", "Researcher@123", "healthcare_researcher"),
]

users = {}
for name, email, password, role in ACCOUNTS:
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            full_name=name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            hospital="Demo Hospital",
            is_active=True,
        )
        db.add(user)
        db.flush()
    else:
        user.full_name = name
        user.password_hash = hash_password(password)
        user.role = role
        user.hospital = "Demo Hospital"
        user.is_active = True
    users[role] = user

db.commit()

# Import the supplied Diabetes 130-US Hospitals encounters instead of demo patients.
db.close()
print("Seed complete.")
print("Accounts:")
for _, email, password, role in ACCOUNTS:
    print(f"{role}: {email} / {password}")
