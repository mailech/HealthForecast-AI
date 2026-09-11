from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.crud_encounter import list_encounters, get_encounter_by_id, create_encounter, get_encounter_by_encounter_id
from app.schemas.encounter import EncounterRead, EncounterCreate
from app.api.deps import require_roles

router = APIRouter()

@router.get("", response_model=dict)
async def get_encounters(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    patient_id: Optional[int] = Query(None),
    medical_specialty: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
):
    encounters, total = await list_encounters(
        db, skip=skip, limit=limit, patient_id=patient_id, medical_specialty=medical_specialty
    )
    items = []
    for e in encounters:
        items.append({
            "id": e.id,
            "encounter_id": e.encounter_id,
            "patient_id": e.patient_id,
            "patient_nbr": e.patient.patient_nbr if e.patient else "N/A",
            "gender": e.patient.gender if e.patient else "N/A",
            "age_group": e.patient.age_group if e.patient else "N/A",
            "time_in_hospital": e.time_in_hospital,
            "medical_specialty": e.medical_specialty,
            "num_lab_procedures": e.num_lab_procedures,
            "num_procedures": e.num_procedures,
            "num_medications": e.num_medications,
            "number_inpatient": e.number_inpatient,
            "diag_1": e.diag_1,
            "max_glu_serum": e.max_glu_serum,
            "a1c_result": e.a1c_result,
            "insulin": e.insulin,
            "actual_readmitted": e.actual_readmitted,
            "predictions": [
                {
                    "id": p.id,
                    "readmission_risk_score": p.readmission_risk_score,
                    "risk_level": p.risk_level,
                    "predicted_readmitted": p.predicted_readmitted,
                    "created_at": p.created_at
                } for p in (e.predictions or [])
            ]
        })
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{encounter_id}", response_model=dict)
async def get_encounter_detail(
    encounter_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
):
    encounter = await get_encounter_by_id(db, encounter_id)
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter record not found")
        
    return {
        "id": encounter.id,
        "encounter_id": encounter.encounter_id,
        "patient_id": encounter.patient_id,
        "patient_nbr": encounter.patient.patient_nbr if encounter.patient else "N/A",
        "gender": encounter.patient.gender if encounter.patient else "N/A",
        "age_group": encounter.patient.age_group if encounter.patient else "N/A",
        "time_in_hospital": encounter.time_in_hospital,
        "payer_code": encounter.payer_code,
        "medical_specialty": encounter.medical_specialty,
        "num_lab_procedures": encounter.num_lab_procedures,
        "num_procedures": encounter.num_procedures,
        "num_medications": encounter.num_medications,
        "number_outpatient": encounter.number_outpatient,
        "number_emergency": encounter.number_emergency,
        "number_inpatient": encounter.number_inpatient,
        "diag_1": encounter.diag_1,
        "diag_2": encounter.diag_2,
        "diag_3": encounter.diag_3,
        "number_diagnoses": encounter.number_diagnoses,
        "max_glu_serum": encounter.max_glu_serum,
        "a1c_result": encounter.a1c_result,
        "metformin": encounter.metformin,
        "insulin": encounter.insulin,
        "change_status": encounter.change_status,
        "diabetes_med": encounter.diabetes_med,
        "actual_readmitted": encounter.actual_readmitted,
        "predictions": [
            {
                "id": p.id,
                "readmission_risk_score": p.readmission_risk_score,
                "risk_level": p.risk_level,
                "predicted_readmitted": p.predicted_readmitted,
                "top_risk_factors": p.top_risk_factors,
                "clinical_recommendations": p.clinical_recommendations,
                "created_at": p.created_at
            } for p in (encounter.predictions or [])
        ]
    }

@router.post("", response_model=EncounterRead)
async def add_encounter(
    encounter_in: EncounterCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles(["Doctor", "System Administrator"]))
):
    existing = await get_encounter_by_encounter_id(db, encounter_in.encounter_id)
    if existing:
        raise HTTPException(status_code=400, detail=f"Encounter ID {encounter_in.encounter_id} already exists.")
        
    new_enc = await create_encounter(db, encounter_in)
    return new_enc
