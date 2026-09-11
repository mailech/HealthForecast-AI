from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from app.models.patient import Patient
from app.models.encounter import Encounter
from app.schemas.patient import PatientCreate

async def get_patient_by_id(db: AsyncSession, patient_id: int) -> Optional[Patient]:
    result = await db.execute(
        select(Patient).options(selectinload(Patient.encounters)).filter(Patient.id == patient_id)
    )
    return result.scalars().first()

async def get_patient_by_nbr(db: AsyncSession, patient_nbr: str) -> Optional[Patient]:
    result = await db.execute(
        select(Patient).filter(Patient.patient_nbr == patient_nbr)
    )
    return result.scalars().first()

async def create_patient(db: AsyncSession, patient_in: PatientCreate) -> Patient:
    patient = Patient(
        patient_nbr=patient_in.patient_nbr,
        gender=patient_in.gender,
        age_group=patient_in.age_group,
        race=patient_in.race,
        weight_group=patient_in.weight_group
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient

async def list_patients(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
) -> Tuple[List[Patient], int]:
    query = select(Patient)
    count_query = select(func.count(Patient.id))
    
    if search:
        search_filter = or_(
            Patient.patient_nbr.ilike(f"%{search}%"),
            Patient.race.ilike(f"%{search}%"),
            Patient.gender.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        count_query = count_query.filter(search_filter)
        
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    query = query.options(selectinload(Patient.encounters)).order_by(Patient.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    patients = list(result.scalars().all())
    
    return patients, total
