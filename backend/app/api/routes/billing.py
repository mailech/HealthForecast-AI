import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.rbac import Role, require_roles
from app.models.patient import Admission, Bill
from app.schemas.patient import BillCreate, BillOut

router = APIRouter(prefix="/billing", tags=["billing"])

# Billing is hospital operations data — doctors, hospital admins, and system
# admins can see/manage it. Researchers stay out (financial data isn't part
# of their anonymized/aggregated scope per the Access Matrix).
_billing_roles = require_roles(Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.SYSTEM_ADMIN)


@router.post("", response_model=BillOut, status_code=201)
def create_bill(payload: BillCreate, db: Session = Depends(get_db), _=Depends(_billing_roles)):
    admission = db.get(Admission, payload.admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    existing = db.query(Bill).filter(Bill.admission_id == payload.admission_id).first()
    if existing:
        for field, value in payload.model_dump(exclude={"admission_id"}).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    bill = Bill(patient_id=admission.patient_id, **payload.model_dump())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.get("/patient/{patient_id}", response_model=list[BillOut])
def list_bills_for_patient(patient_id: uuid.UUID, db: Session = Depends(get_db), _=Depends(_billing_roles)):
    return db.query(Bill).filter(Bill.patient_id == patient_id).order_by(Bill.issued_on.desc()).all()
