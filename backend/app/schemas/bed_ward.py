from datetime import datetime
from pydantic import BaseModel


class WardResponse(BaseModel):
    id: int
    name: str
    department: str
    total_beds: int
    available_beds: int
    occupied_beds: int
    reserved_beds: int
    maintenance_beds: int
    occupancy_percentage: float
    status: str


class BedResponse(BaseModel):
    id: int
    bed_number: str
    ward_id: int
    ward_name: str
    department: str
    status: str
    patient_id: int | None = None
    patient_name: str | None = None
    patient_mrn: str | None = None
    assigned_at: datetime | None = None


class BedSummaryResponse(BaseModel):
    total_beds: int
    available_beds: int
    occupied_beds: int
    reserved_beds: int
    maintenance_beds: int


class BedAssignRequest(BaseModel):
    bed_id: int
    patient_id: int


class BedReleaseRequest(BaseModel):
    bed_id: int


class BedStatusRequest(BaseModel):
    status: str
