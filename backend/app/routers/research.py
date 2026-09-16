from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field

from ..database import get_db
from .. import models
from ..auth import require_roles


router = APIRouter(
    prefix="/research",
    tags=["Research"]
)


# ============================================================
# RESEARCHER-SAFE RESPONSE MODEL
# ============================================================
# IMPORTANT:
# This response model contains ONLY aggregated information.
#
# No patient name
# No email
# No phone number
# No address
# No patient ID
# No user ID
#
# Therefore, researchers cannot receive PII from this endpoint.
# ============================================================

class ResearchSummaryResponse(BaseModel):

    total_patients: int = Field(
        ge=0,
        description="Total number of patients"
    )

    high_risk_patients: int = Field(
        ge=0,
        description="Total number of high-risk patients"
    )

    total_predictions: int = Field(
        ge=0,
        description="Total number of predictions"
    )

    average_risk_score: float = Field(
        ge=0,
        le=100,
        description="Average predicted risk score"
    )


# ============================================================
# RESEARCH SUMMARY
# ============================================================

@router.get(
    "/summary",
    response_model=ResearchSummaryResponse
)
def research_summary(
    current_user=Depends(
        require_roles(
            "admin",
            "doctor",
            "researcher"
        )
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Aggregate patient count
    # --------------------------------------------------------

    total_patients = db.query(
        models.Patient
    ).count()


    # --------------------------------------------------------
    # Aggregate high-risk patient count
    # --------------------------------------------------------

    high_risk = db.query(
        models.Patient
    ).filter(
        models.Patient.risk.ilike("high")
    ).count()


    # --------------------------------------------------------
    # Aggregate prediction count
    # --------------------------------------------------------

    predictions = db.query(
        models.Prediction
    ).count()


    # --------------------------------------------------------
    # Average prediction risk
    # --------------------------------------------------------

    avg_risk = db.query(
        func.avg(
            models.Prediction.risk_score
        )
    ).scalar()


    # --------------------------------------------------------
    # IMPORTANT PRIVACY RULE
    # --------------------------------------------------------
    # Only aggregated values are returned.
    #
    # No individual patient information is exposed.
    # --------------------------------------------------------

    return ResearchSummaryResponse(
        total_patients=total_patients,

        high_risk_patients=high_risk,

        total_predictions=predictions,

        average_risk_score=round(
            float(avg_risk or 0),
            4
        )
    ) 