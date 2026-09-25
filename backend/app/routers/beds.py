from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.bed_ward import Bed, Ward
from app.models.patient import Patient
from app.models.user import UserRole
from app.schemas.bed_ward import (
    BedAssignRequest,
    BedReleaseRequest,
    BedResponse,
    BedStatusRequest,
    BedSummaryResponse,
    WardResponse,
)

router = APIRouter(prefix="/beds", tags=["Bed & Ward Management"])

admin_only = RoleChecker([UserRole.HOSPITAL_ADMIN])
view_roles = RoleChecker([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.SYSTEM_ADMIN])


async def ensure_beds_seeded(db: AsyncSession):
    """Seed initial hospital wards and beds if database table is empty."""
    existing_ward = await db.scalar(select(Ward).limit(1))
    if existing_ward is not None:
        return

    seed_data = [
        {
            "name": "Cardiology Ward",
            "department": "Cardiology",
            "beds": ["CARD-101", "CARD-102", "CARD-103", "CARD-104", "CARD-105", "CARD-106"],
        },
        {
            "name": "Intensive Care Unit (ICU)",
            "department": "Critical Care / ICU",
            "beds": ["ICU-201", "ICU-202", "ICU-203", "ICU-204"],
        },
        {
            "name": "General Medical Ward",
            "department": "General Medicine",
            "beds": ["GEN-301", "GEN-302", "GEN-303", "GEN-304", "GEN-305", "GEN-306", "GEN-307", "GEN-308"],
        },
        {
            "name": "Orthopedic Ward",
            "department": "Orthopedics",
            "beds": ["ORTH-401", "ORTH-402", "ORTH-403", "ORTH-404", "ORTH-405"],
        },
        {
            "name": "Emergency Ward",
            "department": "Emergency",
            "beds": ["EMRG-501", "EMRG-502", "EMRG-503", "EMRG-504", "EMRG-505"],
        },
    ]

    # Fetch existing patients to assign a few initial beds if patients exist
    patients = (await db.execute(select(Patient).order_by(Patient.id))).scalars().all()
    patient_idx = 0

    for ward_info in seed_data:
        ward = Ward(name=ward_info["name"], department=ward_info["department"])
        db.add(ward)
        await db.flush()

        for b_idx, bed_num in enumerate(ward_info["beds"]):
            status_val = "Available"
            pat_id = None
            assigned_time = None

            # Seed a mix of Occupied, Reserved, Maintenance and Available for visual demonstration
            if b_idx == 0 and patient_idx < len(patients):
                status_val = "Occupied"
                pat_id = patients[patient_idx].id
                patient_idx += 1
                assigned_time = datetime.now(timezone.utc)
            elif b_idx == 1 and ward_info["name"] == "Intensive Care Unit (ICU)" and patient_idx < len(patients):
                status_val = "Occupied"
                pat_id = patients[patient_idx].id
                patient_idx += 1
                assigned_time = datetime.now(timezone.utc)
            elif b_idx == 2 and ward_info["name"] == "Emergency Ward":
                status_val = "Reserved"
            elif b_idx == 4 and ward_info["name"] == "General Medical Ward":
                status_val = "Maintenance"

            bed = Bed(
                bed_number=bed_num,
                ward_id=ward.id,
                status=status_val,
                patient_id=pat_id,
                assigned_at=assigned_time,
            )
            db.add(bed)

    await db.commit()


@router.get("/summary", response_model=BedSummaryResponse)
async def get_bed_summary(
    _: UserRole = Depends(view_roles),
    db: AsyncSession = Depends(get_db),
):
    """Get hospital-wide bed occupancy counts."""
    await ensure_beds_seeded(db)

    beds = (await db.execute(select(Bed))).scalars().all()

    total = len(beds)
    available = sum(1 for b in beds if b.status.lower() == "available")
    occupied = sum(1 for b in beds if b.status.lower() == "occupied")
    reserved = sum(1 for b in beds if b.status.lower() == "reserved")
    maintenance = sum(1 for b in beds if b.status.lower() == "maintenance")

    return BedSummaryResponse(
        total_beds=total,
        available_beds=available,
        occupied_beds=occupied,
        reserved_beds=reserved,
        maintenance_beds=maintenance,
    )


@router.get("/wards", response_model=list[WardResponse])
async def get_wards(
    _: UserRole = Depends(view_roles),
    db: AsyncSession = Depends(get_db),
):
    """Get list of hospital wards with bed statistics."""
    await ensure_beds_seeded(db)

    wards = (await db.execute(select(Ward).order_by(Ward.id))).scalars().all()
    all_beds = (await db.execute(select(Bed))).scalars().all()

    response = []
    for ward in wards:
        w_beds = [b for b in all_beds if b.ward_id == ward.id]
        total = len(w_beds)
        available = sum(1 for b in w_beds if b.status.lower() == "available")
        occupied = sum(1 for b in w_beds if b.status.lower() == "occupied")
        reserved = sum(1 for b in w_beds if b.status.lower() == "reserved")
        maintenance = sum(1 for b in w_beds if b.status.lower() == "maintenance")

        occ_pct = round((occupied / total) * 100, 1) if total > 0 else 0.0

        if maintenance == total and total > 0:
            w_status = "Maintenance"
        elif occupied == total and total > 0:
            w_status = "Full"
        elif occupied > 0:
            w_status = "Partially Occupied"
        else:
            w_status = "Available"

        response.append(
            WardResponse(
                id=ward.id,
                name=ward.name,
                department=ward.department,
                total_beds=total,
                available_beds=available,
                occupied_beds=occupied,
                reserved_beds=reserved,
                maintenance_beds=maintenance,
                occupancy_percentage=occ_pct,
                status=w_status,
            )
        )

    return response


@router.get("/", response_model=list[BedResponse])
async def list_beds(
    ward_id: int | None = Query(None),
    department: str | None = Query(None),
    bed_status: str | None = Query(None, alias="status"),
    _: UserRole = Depends(view_roles),
    db: AsyncSession = Depends(get_db),
):
    """Get list of all beds with optional filtering by ward, department, or status."""
    await ensure_beds_seeded(db)

    query = select(Bed, Ward, Patient).join(Ward, Bed.ward_id == Ward.id).outerjoin(Patient, Bed.patient_id == Patient.id)

    if ward_id is not None:
        query = query.where(Bed.ward_id == ward_id)
    if department:
        query = query.where(func.lower(Ward.department) == department.lower().strip())
    if bed_status and bed_status != "all":
        query = query.where(func.lower(Bed.status) == bed_status.lower().strip())

    query = query.order_by(Ward.id, Bed.id)
    results = (await db.execute(query)).all()

    response = []
    for bed, ward, patient in results:
        patient_name = f"{patient.first_name} {patient.last_name}" if patient else None
        patient_mrn = patient.mrn if patient else None

        response.append(
            BedResponse(
                id=bed.id,
                bed_number=bed.bed_number,
                ward_id=ward.id,
                ward_name=ward.name,
                department=ward.department,
                status=bed.status,
                patient_id=bed.patient_id,
                patient_name=patient_name,
                patient_mrn=patient_mrn,
                assigned_at=bed.assigned_at,
            )
        )

    return response


@router.post("/assign", response_model=BedResponse)
async def assign_bed(
    body: BedAssignRequest,
    _: UserRole = Depends(admin_only),
    db: AsyncSession = Depends(get_db),
):
    """Assign an available bed to an existing patient (Hospital Administrator only)."""
    bed = await db.scalar(select(Bed).where(Bed.id == body.bed_id))
    if bed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bed #{body.bed_id} not found.")

    if bed.status.lower() != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot assign bed '{bed.bed_number}': Bed status is currently '{bed.status}'. Only 'Available' beds can be assigned.",
        )

    patient = await db.scalar(select(Patient).where(Patient.id == body.patient_id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient #{body.patient_id} not found.")

    # Prevent assigning the same patient to multiple active beds
    existing_bed = await db.scalar(
        select(Bed).where(Bed.patient_id == body.patient_id, func.lower(Bed.status) == "occupied", Bed.id != body.bed_id)
    )
    if existing_bed is not None:
        patient_name = f"{patient.first_name} {patient.last_name}"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient '{patient_name}' is already assigned to active Bed '{existing_bed.bed_number}'. Release that bed first.",
        )

    bed.patient_id = patient.id
    bed.status = "Occupied"
    bed.assigned_at = datetime.now(timezone.utc)

    await db.commit()

    ward = await db.scalar(select(Ward).where(Ward.id == bed.ward_id))
    patient_name = f"{patient.first_name} {patient.last_name}"

    return BedResponse(
        id=bed.id,
        bed_number=bed.bed_number,
        ward_id=ward.id,
        ward_name=ward.name,
        department=ward.department,
        status=bed.status,
        patient_id=patient.id,
        patient_name=patient_name,
        patient_mrn=patient.mrn,
        assigned_at=bed.assigned_at,
    )


@router.post("/release", response_model=BedResponse)
async def release_bed(
    body: BedReleaseRequest,
    _: UserRole = Depends(admin_only),
    db: AsyncSession = Depends(get_db),
):
    """Release an occupied bed (Hospital Administrator only)."""
    bed = await db.scalar(select(Bed).where(Bed.id == body.bed_id))
    if bed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bed #{body.bed_id} not found.")

    if bed.status.lower() == "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bed '{bed.bed_number}' is already available.",
        )

    bed.patient_id = None
    bed.status = "Available"
    bed.assigned_at = None

    await db.commit()

    ward = await db.scalar(select(Ward).where(Ward.id == bed.ward_id))

    return BedResponse(
        id=bed.id,
        bed_number=bed.bed_number,
        ward_id=ward.id,
        ward_name=ward.name,
        department=ward.department,
        status=bed.status,
        patient_id=None,
        patient_name=None,
        patient_mrn=None,
        assigned_at=None,
    )


@router.patch("/{bed_id}/status", response_model=BedResponse)
async def update_bed_status(
    bed_id: int,
    body: BedStatusRequest,
    _: UserRole = Depends(admin_only),
    db: AsyncSession = Depends(get_db),
):
    """Change status of a bed (e.g., Mark Maintenance, Make Available, Mark Reserved)."""
    valid_statuses = ["Available", "Maintenance", "Reserved", "Occupied"]
    target = body.status.strip().title()

    if target not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid bed status '{body.status}'. Allowed values: {valid_statuses}",
        )

    bed = await db.scalar(select(Bed).where(Bed.id == bed_id))
    if bed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bed #{bed_id} not found.")

    # If transitioning to Maintenance or Available, release assigned patient if any
    if target in ["Maintenance", "Available"] and bed.status.lower() == "occupied":
        bed.patient_id = None
        bed.assigned_at = None

    bed.status = target
    await db.commit()

    ward = await db.scalar(select(Ward).where(Ward.id == bed.ward_id))
    patient = await db.scalar(select(Patient).where(Patient.id == bed.patient_id)) if bed.patient_id else None
    patient_name = f"{patient.first_name} {patient.last_name}" if patient else None

    return BedResponse(
        id=bed.id,
        bed_number=bed.bed_number,
        ward_id=ward.id,
        ward_name=ward.name,
        department=ward.department,
        status=bed.status,
        patient_id=bed.patient_id,
        patient_name=patient_name,
        patient_mrn=patient.mrn if patient else None,
        assigned_at=bed.assigned_at,
    )
