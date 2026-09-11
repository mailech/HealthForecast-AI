from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.models.patient import Patient
from app.models.encounter import Encounter
from app.models.user import User
from app.services.dataset_service import seed_dataset_from_csv

router = APIRouter()

@router.get("/status")
async def system_status(db: AsyncSession = Depends(get_db)):
    patients_count = (await db.execute(select(func.count(Patient.id)))).scalar_one()
    encounters_count = (await db.execute(select(func.count(Encounter.id)))).scalar_one()
    users_count = (await db.execute(select(func.count(User.id)))).scalar_one()
    
    return {
        "status": "online",
        "system": "HealthForecast AI Backend",
        "version": "1.0.0",
        "database_metrics": {
            "users_count": users_count,
            "patients_count": patients_count,
            "encounters_count": encounters_count
        }
    }

@router.post("/seed-dataset")
async def seed_dataset(
    max_rows: int = Query(2000, ge=100, le=101766),
    db: AsyncSession = Depends(get_db)
):
    result = await seed_dataset_from_csv(db, max_rows=max_rows)
    return result
