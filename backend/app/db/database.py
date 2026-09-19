from typing import AsyncGenerator
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

logger = logging.getLogger("healthforecast_ai")

# Primary Engine (PostgreSQL or configured DB)
db_url = settings.DATABASE_URL
if not db_url or "postgresql" in db_url:
    # Default to postgresql url if provided, fallback will occur in main.py if unreachable
    engine_url = db_url or "sqlite+aiosqlite:///./healthforecast.db"
else:
    engine_url = db_url

engine = create_async_engine(
    engine_url,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True if "postgresql" in engine_url else False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for yielding async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()