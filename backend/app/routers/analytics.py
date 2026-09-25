from datetime import date, datetime, time, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, or_, and_, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.analytics import (
    AnalyticsSummary,
    HospitalOperationsResponse,
    HospitalOperationsSummary,
    PatientFlowMetrics,
    DepartmentWorkloadItem,
    PatientRiskOverview,
    ResearchCohortFilter,
    ResearcherKpis,
    PopulationAgeItem,
    TrendPointItem,
    AnonymizedPatientItem,
    ResearcherAnalyticsResponse,
    CohortComparisonRequest,
    CohortComparisonResponse,
)
from app.db.database import get_db
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.appointment import Appointment
from app.core.rbac import RoleChecker
from app.models.user import UserRole, User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=AnalyticsSummary)
async def get_dashboard_analytics(
    _: UserRole = Depends(RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Return dashboard metrics calculated from stored patient predictions."""
    total_patients = await db.scalar(select(func.count(Patient.id))) or 0
    total_predictions = await db.scalar(select(func.count(Prediction.id))) or 0
    high_risk = await db.scalar(
        select(func.count(Prediction.id)).where(Prediction.risk_category == "High")
    ) or 0
    medium_risk = await db.scalar(
        select(func.count(Prediction.id)).where(Prediction.risk_category == "Medium")
    ) or 0
    low_risk = await db.scalar(
        select(func.count(Prediction.id)).where(Prediction.risk_category == "Low")
    ) or 0
    average_score = await db.scalar(select(func.avg(Prediction.readmission_risk_score))) or 0
    appointments_today = await db.scalar(
        select(func.count(Appointment.id)).where(Appointment.appointment_date == date.today())
    ) or 0

    recent_result = await db.execute(
        select(Prediction, Patient)
        .join(Patient, Patient.id == Prediction.patient_id)
        .order_by(Prediction.created_at.desc())
        .limit(10)
    )
    recent_predictions = [
        {
            "id": prediction.id,
            "patient_id": prediction.patient_id,
            "patient_name": f"{patient.first_name} {patient.last_name}",
            "risk_score": prediction.readmission_risk_score,
            "risk_category": prediction.risk_category,
            "created_at": prediction.created_at.isoformat(),
        }
        for prediction, patient in recent_result.all()
    ]

    return AnalyticsSummary(
        total_patients=total_patients,
        total_predictions=total_predictions,
        high_risk_patients=high_risk,
        average_risk_score=round(float(average_score), 2),
        readmission_rate=round((high_risk / total_predictions) * 100, 2) if total_predictions else 0.0,
        appointments_today=appointments_today,
        risk_distribution=[
            {"name": "Low", "value": low_risk},
            {"name": "Medium", "value": medium_risk},
            {"name": "High", "value": high_risk},
        ],
        recent_predictions=recent_predictions,
    )


@router.get("/operations", response_model=HospitalOperationsResponse)
async def get_hospital_operations(
    period: str = Query("this_week", description="Filter period: today, this_week, this_month"),
    _: User = Depends(RoleChecker([UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Hospital Operations & Department Workload endpoint for Hospital Administrator.
    Returns real aggregate metrics calculated from actual database records.
    """
    today = date.today()
    if period == "today":
        start_date = today
        end_date = today
    elif period == "this_month":
        start_date = today.replace(day=1)
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        end_date = next_month - timedelta(days=1)
    else:  # "this_week" default
        period = "this_week"
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)

    start_dt = datetime.combine(start_date, time.min).replace(tzinfo=timezone.utc)
    end_dt = datetime.combine(end_date, time.max).replace(tzinfo=timezone.utc)

    # 1. Summary Metrics (Filtered by selected period)
    total_patients = await db.scalar(select(func.count(Patient.id))) or 0

    period_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
        )
    ) or 0

    pending_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
            func.lower(Appointment.status).in_(["scheduled", "pending"]),
        )
    ) or 0

    completed_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
            func.lower(Appointment.status) == "completed",
        )
    ) or 0

    missed_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
            func.lower(Appointment.status).in_(["missed", "cancelled"]),
        )
    ) or 0

    summary = HospitalOperationsSummary(
        total_patients=total_patients,
        todays_appointments=period_appointments,
        pending_appointments=pending_appointments,
        completed_appointments=completed_appointments,
        missed_appointments=missed_appointments,
    )

    # 2. Patient Flow (Filtered by selected period)
    registered_patients = await db.scalar(
        select(func.count(Patient.id)).where(
            or_(
                and_(Patient.admission_date >= start_date, Patient.admission_date <= end_date),
                and_(cast(Patient.created_at, Date) >= start_date, cast(Patient.created_at, Date) <= end_date),
            )
        )
    ) or 0

    patient_flow = PatientFlowMetrics(
        period=period,
        registered_patients=registered_patients,
        total_appointments=period_appointments,
        completed_appointments=completed_appointments,
        pending_appointments=pending_appointments,
        missed_appointments=missed_appointments,
    )

    # 3. Department Workload (Filtered by selected period)
    dept_res = await db.execute(
        select(Patient.department).where(Patient.department.isnot(None), Patient.department != "").distinct()
    )
    depts = [d[0] for d in dept_res.all() if d[0]]

    dept_items = []
    for dept_name in depts:
        p_count = await db.scalar(
            select(func.count(Patient.id)).where(
                Patient.department == dept_name,
                or_(
                    and_(Patient.admission_date >= start_date, Patient.admission_date <= end_date),
                    and_(cast(Patient.created_at, Date) >= start_date, cast(Patient.created_at, Date) <= end_date),
                )
            )
        ) or 0

        a_count = await db.scalar(
            select(func.count(Appointment.id))
            .join(Patient, Appointment.patient_id == Patient.id)
            .where(
                Patient.department == dept_name,
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date,
            )
        ) or 0

        dept_items.append(
            DepartmentWorkloadItem(
                name=dept_name,
                patient_count=p_count,
                appointment_count=a_count,
                total_workload=p_count + a_count,
            )
        )

    # Sort department items by total_workload descending
    dept_items.sort(key=lambda x: x.total_workload, reverse=True)

    # 4. Patient Risk Overview (stored latest risk predictions)
    subq = (
        select(
            Prediction.patient_id,
            func.max(Prediction.id).label("max_id")
        )
        .group_by(Prediction.patient_id)
        .subquery()
    )

    pred_res = await db.execute(
        select(Prediction.risk_category, func.count(Prediction.id))
        .join(subq, Prediction.id == subq.c.max_id)
        .group_by(Prediction.risk_category)
    )

    counts = {cat: count for cat, count in pred_res.all()}
    high_r = counts.get("High", 0)
    med_r = counts.get("Medium", 0)
    low_r = counts.get("Low", 0)

    risk_overview = PatientRiskOverview(
        high_risk=high_r,
        medium_risk=med_r,
        low_risk=low_r,
        total_evaluated=high_r + med_r + low_r,
    )

    return HospitalOperationsResponse(
        summary=summary,
        patient_flow=patient_flow,
        department_workload=dept_items,
        risk_overview=risk_overview,
    )


# ============================================================
# RESEARCHER ROLE HELPER & ENDPOINTS
# ============================================================

def parse_date(date_str: str | None) -> date | None:
    if not date_str or date_str.lower() in ["all", "", "none"]:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        return None


def get_age_group(age: int) -> str:
    if age <= 30:
        return "18-30"
    if age <= 45:
        return "31-45"
    if age <= 60:
        return "46-60"
    if age <= 75:
        return "61-75"
    return "76+"


async def build_researcher_analytics(db: AsyncSession, f: ResearchCohortFilter) -> ResearcherAnalyticsResponse:
    query = select(Patient)

    # Age Group filter
    if f.age_group and f.age_group.lower() != "all":
        ag = f.age_group.strip()
        if ag == "18-30":
            query = query.where(and_(Patient.age >= 18, Patient.age <= 30))
        elif ag == "31-45":
            query = query.where(and_(Patient.age >= 31, Patient.age <= 45))
        elif ag == "46-60":
            query = query.where(and_(Patient.age >= 46, Patient.age <= 60))
        elif ag == "61-75":
            query = query.where(and_(Patient.age >= 61, Patient.age <= 75))
        elif ag in ["76+", "76"]:
            query = query.where(Patient.age >= 76)

    # Gender filter
    if f.gender and f.gender.lower() != "all":
        query = query.where(func.lower(Patient.gender) == f.gender.lower().strip())

    # Department filter
    if f.department and f.department.lower() != "all":
        query = query.where(func.lower(Patient.department) == f.department.lower().strip())

    # Diagnosis filter
    if f.diagnosis and f.diagnosis.strip():
        query = query.where(Patient.diagnosis.ilike(f"%{f.diagnosis.strip()}%"))

    # Date Range filter
    d_start = parse_date(f.date_start)
    d_end = parse_date(f.date_end)
    if d_start:
        query = query.where(
            or_(
                Patient.admission_date >= d_start,
                cast(Patient.created_at, Date) >= d_start,
            )
        )
    if d_end:
        query = query.where(
            or_(
                Patient.admission_date <= d_end,
                cast(Patient.created_at, Date) <= d_end,
            )
        )

    patients = (await db.execute(query.order_by(Patient.id))).scalars().all()

    # Subquery for Latest Prediction per patient
    subq = (
        select(
            Prediction.patient_id,
            func.max(Prediction.id).label("max_id")
        )
        .group_by(Prediction.patient_id)
        .subquery()
    )
    latest_preds_res = await db.execute(
        select(Prediction).join(subq, Prediction.id == subq.c.max_id)
    )
    latest_preds_map = {p.patient_id: p for p in latest_preds_res.scalars().all()}

    filtered_items = []
    for pat in patients:
        pred = latest_preds_map.get(pat.id)

        # Risk level filter
        if f.risk_level and f.risk_level.lower() != "all":
            req_risk = f.risk_level.strip().lower()
            if req_risk == "not predicted":
                if pred is not None:
                    continue
            else:
                if not pred or pred.risk_category.lower() != req_risk:
                    continue

        # Prediction status filter
        if f.prediction_status and f.prediction_status.lower() != "all":
            req_status = f.prediction_status.strip().lower()
            if req_status == "predicted" and pred is None:
                continue
            elif req_status == "not predicted" and pred is not None:
                continue

        # Min prior admissions
        if f.min_prior_admissions is not None and f.min_prior_admissions > 0:
            if not pred or (pred.prior_admissions or 0) < f.min_prior_admissions:
                continue

        # Min length of stay
        if f.min_length_of_stay is not None and f.min_length_of_stay > 0:
            if not pred or (pred.length_of_stay or 0) < f.min_length_of_stay:
                continue

        filtered_items.append((pat, pred))

    total_cohort = len(filtered_items)
    total_preds = sum(1 for _, p in filtered_items if p is not None)
    high_count = sum(1 for _, p in filtered_items if p and p.risk_category == "High")
    med_count = sum(1 for _, p in filtered_items if p and p.risk_category == "Medium")
    low_count = sum(1 for _, p in filtered_items if p and p.risk_category == "Low")
    not_pred_count = sum(1 for _, p in filtered_items if p is None)

    risk_scores = [p.readmission_risk_score for _, p in filtered_items if p and p.readmission_risk_score is not None]
    avg_risk_score = round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else None

    readmission_rate = round((high_count / total_preds) * 100, 1) if total_preds > 0 else 0.0

    los_vals = [p.length_of_stay for _, p in filtered_items if p and p.length_of_stay is not None]
    avg_los = round(sum(los_vals) / len(los_vals), 1) if los_vals else None

    prior_vals = [p.prior_admissions for _, p in filtered_items if p and p.prior_admissions is not None]
    avg_priors = round(sum(prior_vals) / len(prior_vals), 1) if prior_vals else None

    kpis = ResearcherKpis(
        total_cohort=total_cohort,
        total_predictions=total_preds,
        high_risk_patients=high_count,
        medium_risk_patients=med_count,
        low_risk_patients=low_count,
        not_predicted_patients=not_pred_count,
        average_risk_score=avg_risk_score,
        readmission_rate=readmission_rate,
        avg_length_of_stay=avg_los,
        avg_prior_admissions=avg_priors,
    )

    age_groups = ["18-30", "31-45", "46-60", "61-75", "76+"]
    pop_by_age = []
    for ag in age_groups:
        cnt = 0
        readmitted = 0
        for pat, pred in filtered_items:
            if get_age_group(pat.age) == ag:
                cnt += 1
                if pred and pred.risk_category == "High":
                    readmitted += 1
        pop_by_age.append(PopulationAgeItem(age=ag, count=cnt, readmitted=readmitted))

    risk_dist = [
        {"name": "Low", "value": low_count},
        {"name": "Medium", "value": med_count},
        {"name": "High", "value": high_count},
    ]

    matching_patient_ids = [pat.id for pat, _ in filtered_items]
    trend_data = []
    insufficient_trend = True

    if matching_patient_ids:
        all_pat_preds_res = await db.execute(
            select(Prediction)
            .where(Prediction.patient_id.in_(matching_patient_ids))
            .order_by(Prediction.created_at.asc())
        )
        all_pat_preds = all_pat_preds_res.scalars().all()

        if len(all_pat_preds) >= 2:
            granularity = f.trend_granularity.lower() if f.trend_granularity else "week"
            grouped = {}
            for pred in all_pat_preds:
                dt = pred.created_at
                if granularity == "month":
                    key = dt.strftime("%Y-%m")
                else:
                    iso_year, iso_week, _ = dt.isocalendar()
                    key = f"W{iso_week}"

                if key not in grouped:
                    grouped[key] = []
                grouped[key].append(pred)

            if len(grouped) >= 2:
                insufficient_trend = False
                for grp_key, grp_preds in grouped.items():
                    avg_score = round(sum(p.readmission_risk_score for p in grp_preds) / len(grp_preds), 1)
                    high_c = sum(1 for p in grp_preds if p.risk_category == "High")
                    trend_data.append(
                        TrendPointItem(
                            period=grp_key,
                            avg_risk=avg_score,
                            predictions=len(grp_preds),
                            readmission_count=high_c,
                        )
                    )

    anonymized_list = []
    for pat, pred in filtered_items:
        anonymized_list.append(
            AnonymizedPatientItem(
                anonymized_id=f"PAT-{pat.id:03d}",
                age=pat.age,
                age_group=get_age_group(pat.age),
                gender=pat.gender,
                department=pat.department,
                diagnosis=pat.diagnosis,
                prior_admissions=pred.prior_admissions if pred else None,
                length_of_stay=pred.length_of_stay if pred else None,
                risk_score=pred.readmission_risk_score if pred else None,
                risk_level=pred.risk_category if pred else "Not Predicted",
                prediction_date=pred.created_at.isoformat() if pred else None,
                readmission_status="High Risk" if (pred and pred.risk_category == "High") else "Stable",
            )
        )

    return ResearcherAnalyticsResponse(
        kpis=kpis,
        population_by_age=pop_by_age,
        risk_distribution=risk_dist,
        population_stats_table=pop_by_age,
        trend_data=trend_data,
        insufficient_trend_data=insufficient_trend,
        patient_list=anonymized_list,
    )


research_roles = RoleChecker([UserRole.RESEARCHER, UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN])


@router.get("/researcher", response_model=ResearcherAnalyticsResponse)
async def get_researcher_analytics(
    age_group: str = Query("all"),
    gender: str = Query("all"),
    department: str = Query("all"),
    diagnosis: str | None = Query(None),
    risk_level: str = Query("all"),
    prediction_status: str = Query("all"),
    date_start: str | None = Query(None),
    date_end: str | None = Query(None),
    min_prior_admissions: int | None = Query(None),
    min_length_of_stay: int | None = Query(None),
    trend_granularity: str = Query("week"),
    _: User = Depends(research_roles),
    db: AsyncSession = Depends(get_db),
):
    """
    Research Population & Cohort Analytics for Healthcare Researcher.
    Calculates live metrics, age distributions, risk distributions, and trend data based on cohort filters.
    """
    filters = ResearchCohortFilter(
        age_group=age_group,
        gender=gender,
        department=department,
        diagnosis=diagnosis,
        risk_level=risk_level,
        prediction_status=prediction_status,
        date_start=date_start,
        date_end=date_end,
        min_prior_admissions=min_prior_admissions,
        min_length_of_stay=min_length_of_stay,
        trend_granularity=trend_granularity,
    )
    return await build_researcher_analytics(db, filters)


@router.post("/researcher/compare", response_model=CohortComparisonResponse)
async def compare_research_cohorts(
    body: CohortComparisonRequest,
    _: User = Depends(research_roles),
    db: AsyncSession = Depends(get_db),
):
    """
    Side-by-side statistical comparison of Cohort A vs Cohort B.
    """
    res_a = await build_researcher_analytics(db, body.cohort_a)
    res_b = await build_researcher_analytics(db, body.cohort_b)

    return CohortComparisonResponse(
        cohort_a_name="Cohort A",
        cohort_a_metrics=res_a.kpis,
        cohort_b_name="Cohort B",
        cohort_b_metrics=res_b.kpis,
    )


import io
import csv
from fastapi.responses import StreamingResponse


@router.get("/researcher/export")
async def export_researcher_cohort_csv(
    age_group: str = Query("all"),
    gender: str = Query("all"),
    department: str = Query("all"),
    diagnosis: str | None = Query(None),
    risk_level: str = Query("all"),
    prediction_status: str = Query("all"),
    date_start: str | None = Query(None),
    date_end: str | None = Query(None),
    min_prior_admissions: int | None = Query(None),
    min_length_of_stay: int | None = Query(None),
    _: User = Depends(research_roles),
    db: AsyncSession = Depends(get_db),
):
    """
    Export current filtered research cohort dataset as an anonymized CSV file.
    Enforces privacy by excluding personally identifiable information (full names, phone, email, address).
    """
    filters = ResearchCohortFilter(
        age_group=age_group,
        gender=gender,
        department=department,
        diagnosis=diagnosis,
        risk_level=risk_level,
        prediction_status=prediction_status,
        date_start=date_start,
        date_end=date_end,
        min_prior_admissions=min_prior_admissions,
        min_length_of_stay=min_length_of_stay,
    )
    res = await build_researcher_analytics(db, filters)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Anonymized Patient ID",
        "Age",
        "Age Group",
        "Gender",
        "Department",
        "Diagnosis",
        "Prior Admissions",
        "Length of Stay",
        "Risk Score (%)",
        "Risk Level",
        "Prediction Date",
        "Readmission Status",
    ])

    for item in res.patient_list:
        writer.writerow([
            item.anonymized_id,
            item.age,
            item.age_group,
            item.gender,
            item.department or "N/A",
            item.diagnosis or "N/A",
            item.prior_admissions if item.prior_admissions is not None else "N/A",
            item.length_of_stay if item.length_of_stay is not None else "N/A",
            item.risk_score if item.risk_score is not None else "N/A",
            item.risk_level or "Not Predicted",
            item.prediction_date or "N/A",
            item.readmission_status,
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=carepulse-research-cohort.csv"},
    )