from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

connect_args = {"check_same_thread": False} if settings.use_sqlite else {}
engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema():
    """Add columns introduced after the first create_all() without wiping data."""
    inspector = inspect(engine)
    if "patients" not in inspector.get_table_names():
        return
    columns = {col["name"] for col in inspector.get_columns("patients")}
    if "full_name" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE patients ADD COLUMN full_name VARCHAR(255)"))
