from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.crud_patient import list_patients, get_patient_by_id, create_patient, get_patient_by_nbr
from app.schemas.patient import PatientRead, PatientCreate
from app.api.deps import get_current_user, require_roles

router = APIRouter()

class PatientListResponse(BaseModel if False else object):
    pass

@router.get("", response_model=dict)
async def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
):
    patients, total = await list_patients(db, skip=skip, limit=limit, search=search)
    patient_reads = []
    for p in patients:
        p_dict = {
            "id": p.id,
            "patient_nbr": p.patient_nbr,
            "gender": p.gender,
            "age_group": p.age_group,
            "race": p.race,
            "weight_group": p.weight_group,
            "created_at": p.created_at,
            "encounter_count": len(p.encounters) if p.encounters else 0
        }
        patient_reads.append(p_dict)
        
    return {
        "items": patient_reads,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{patient_id}", response_model=dict)
async def get_patient_detail(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
):
    patient = await get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")
        
    encounters = []
    for e in patient.encounters:
        encounters.append({
            "id": e.id,
            "encounter_id": e.encounter_id,
            "admission_type_id": e.admission_type_id,
            "discharge_disposition_id": e.discharge_disposition_id,
            "time_in_hospital": e.time_in_hospital,
            "medical_specialty": e.medical_specialty,
            "num_lab_procedures": e.num_lab_procedures,
            "num_medications": e.num_medications,
            "actual_readmitted": e.actual_readmitted,
            "diag_1": e.diag_1,
            "diag_2": e.diag_2,
            "diag_3": e.diag_3
        })
        
    return {
        "id": patient.id,
        "patient_nbr": patient.patient_nbr,
        "gender": patient.gender,
        "age_group": patient.age_group,
        "race": patient.race,
        "weight_group": patient.weight_group,
        "created_at": patient.created_at,
        "encounters": encounters
    }

@router.post("", response_model=PatientRead)
async def add_patient(
    patient_in: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["Doctor", "System Administrator"]))
):
    existing = await get_patient_by_nbr(db, patient_in.patient_nbr)
    if existing:
        raise HTTPException(status_code=400, detail=f"Patient with number {patient_in.patient_nbr} already exists.")
        
    new_patient = await create_patient(db, patient_in)
    return new_patient
