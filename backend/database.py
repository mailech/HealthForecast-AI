import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Anchor SQLite default path to the project root directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_PATH = os.path.join(PROJECT_ROOT, "healthforecast.db").replace("\\", "/")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

# If SQLite URL has a relative path, normalize it against PROJECT_ROOT
if DATABASE_URL.startswith("sqlite:///"):
    raw_path = DATABASE_URL[len("sqlite:///"):]
    if not os.path.isabs(raw_path):
        normalized_path = os.path.normpath(os.path.join(PROJECT_ROOT, raw_path)).replace("\\", "/")
        DATABASE_URL = f"sqlite:///{normalized_path}"

# Ensure parent directory exists if SQLite path is used
if DATABASE_URL.startswith("sqlite:///"):
    db_file_path = DATABASE_URL[len("sqlite:///"):]
    db_dir = os.path.dirname(db_file_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

# connect_args={"check_same_thread": False} is required only for SQLite in multi-threaded FastAPI apps
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session per request and closes it after completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
