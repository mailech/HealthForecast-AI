import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Ensure SQLite directory exists if path is provided
if settings.DATABASE_URL.startswith("sqlite"):
    clean_path = settings.DATABASE_URL.replace("sqlite:////", "/").replace("sqlite:///", "")
    db_dir = os.path.dirname(clean_path)
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception as e:
            print(f"Warning: Could not create DB directory {db_dir}: {e}")

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
