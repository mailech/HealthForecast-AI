import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session


# ==========================================
# LOAD .ENV FILE
# ==========================================

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)


# ==========================================
# DATABASE URL
# ==========================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is not set in .env"
    )


# ==========================================
# DATABASE ENGINE
# ==========================================

engine = create_engine(
    DATABASE_URL
)


# ==========================================
# DATABASE SESSION
# ==========================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ==========================================
# BASE MODEL
# ==========================================

class Base(DeclarativeBase):
    pass


# ==========================================
# DATABASE DEPENDENCY
# ==========================================

def get_db():
    db: Session = SessionLocal()

    try:
        yield db

    finally:
        db.close()