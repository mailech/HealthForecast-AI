from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from app.models.encounter import Encounter
from app.models.patient import Patient
from app.schemas.encounter import EncounterCreate

async def get_encounter_by_id(db: AsyncSession, encounter_pk: int) -> Optional[Encounter]:
    result = await db.execute(
        select(Encounter).options(selectinload(Encounter.patient), selectinload(Encounter.predictions)).filter(Encounter.id == encounter_pk)
    )
    return result.scalars().first()

async def get_encounter_by_encounter_id(db: AsyncSession, encounter_id: str) -> Optional[Encounter]:
    result = await db.execute(
        select(Encounter).options(selectinload(Encounter.patient), selectinload(Encounter.predictions)).filter(Encounter.encounter_id == encounter_id)
    )
    return result.scalars().first()

async def create_encounter(db: AsyncSession, encounter_in: EncounterCreate) -> Encounter:
    encounter_data = encounter_in.model_dump()
    db_encounter = Encounter(**encounter_data)
    db.add(db_encounter)
    await db.commit()
    await db.refresh(db_encounter)
    return db_encounter

async def list_encounters(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    patient_id: Optional[int] = None,
    medical_specialty: Optional[str] = None
) -> Tuple[List[Encounter], int]:
    query = select(Encounter)
    count_query = select(func.count(Encounter.id))
    
    if patient_id:
        query = query.filter(Encounter.patient_id == patient_id)
        count_query = count_query.filter(Encounter.patient_id == patient_id)
        
    if medical_specialty:
        query = query.filter(Encounter.medical_specialty.ilike(f"%{medical_specialty}%"))
        count_query = count_query.filter(Encounter.medical_specialty.ilike(f"%{medical_specialty}%"))
        
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    query = query.options(selectinload(Encounter.patient), selectinload(Encounter.predictions)).order_by(Encounter.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    encounters = list(result.scalars().all())
    
    return encounters, total
