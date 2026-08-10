from app.database import SessionLocal
from app import models

db = SessionLocal()
users = db.query(models.User).all()

for u in users:
    print(f"ID: {u.id}, Name: {u.full_name}, Email: {u.email}, Role: {u.role}")
    print(f"Hashed password: {u.hashed_password[:30]}...")

db.close()