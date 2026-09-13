from datetime import datetime
from typing import List, Optional
from app.models.patient import Patient
from app.models.admission import Admission
from app.schemas.cds import CDSRecommendation, CDSSummary

def parse_age_numeric(age_str: str) -> int:
    if not age_str:
        return 55
    cleaned = age_str.replace("[", "").replace(")", "").replace("]", "")
    parts = cleaned.split("-")
    try:
        if len(parts) == 2:
            return (int(parts[0]) + int(parts[1])) // 2
        return int(parts[0])
    except Exception:
        return 55

def generate_cds_recommendations(patient: Patient, admission: Optional[Admission] = None) -> CDSSummary:
    """
    Evidence-Based Clinical Decision Support (CDS) Rule Engine
    Evaluates patient encounter parameters, lab markers, medication regimens,
    and comorbidity ICD-9 clusters against ADA, CMS, Beers, and KDIGO guidelines.
    """
    recs: List[CDSRecommendation] = []
    
    if not admission and patient.admissions:
        admission = patient.admissions[0]
        
    patient_age = parse_age_numeric(patient.age)
    risk_score = admission.risk_score if admission else 20.0
    risk_cat = admission.risk_category if admission else "Low"
    
    # -------------------------------------------------------------
    # 1. GLYCEMIC CONTROL & INPATIENT LAB RULES (ADA Standards 2024)
    # -------------------------------------------------------------
    if admission:
        a1c = str(admission.A1Cresult or "")
        glucose = str(admission.max_glu_serum or "")
        
        if a1c == ">8":
            recs.append(CDSRecommendation(
                id="GLYCEMIC_SEVERE_A1C",
                category="Glycemic Management",
                severity="critical",
                title="Severe Hyperglycemia (HbA1c > 8.0%)",
                recommendation="Initiate urgent glycemic treatment intensification. Consult Inpatient Endocrinology for basal-bolus insulin optimization or addition of second-line cardioprotective agent (SGLT2i / GLP-1RA).",
                rationale="Poorly controlled HbA1c >8.0% during hospitalization is associated with a 2.4x higher 30-day readmission hazard and elevated infection risk.",
                evidence_source="ADA Standards of Care in Hospitalized Patients (2024)",
                action_type="consult_specialist",
                suggested_action="Order Endocrinology Consult & Initiate Basal-Bolus Protocol"
            ))
        elif a1c == ">7":
            recs.append(CDSRecommendation(
                id="GLYCEMIC_SUBOPTIMAL_A1C",
                category="Glycemic Management",
                severity="warning",
                title="Suboptimal Glycemic Control (HbA1c > 7.0%)",
                recommendation="Review current outpatient diabetes regimen prior to discharge. Assess adherence barriers and consider escalating oral therapy or lifestyle counseling.",
                rationale="HbA1c between 7.0% and 8.0% indicates chronic glycemic excursions requiring outpatient therapeutic intensification.",
                evidence_source="ADA / EASD Consensus Guidelines",
                action_type="adjust_medication",
                suggested_action="Schedule Diabetes Self-Management Education (DSME)"
            ))
        elif a1c in ["None", "", "none", None]:
            recs.append(CDSRecommendation(
                id="GLYCEMIC_MISSING_A1C",
                category="Guideline Compliance",
                severity="warning",
                title="Missing Inpatient HbA1c Lab Documentation",
                recommendation="Order an inpatient HbA1c test if not documented within the past 90 days before discharge.",
                rationale="Clinical quality guidelines mandate an HbA1c check for all hospitalized patients with diabetes to guide post-discharge glycemic targets.",
                evidence_source="ADA Quality Measures & CMS Inpatient Glycemic Metric",
                action_type="order_lab",
                suggested_action="Order Point-of-Care / Serum HbA1c Panel"
            ))
        else:
            recs.append(CDSRecommendation(
                id="GLYCEMIC_CONTROLLED",
                category="Glycemic Management",
                severity="success",
                title="Adequate Glycemic Control (HbA1c Within Normal Range)",
                recommendation="Maintain current baseline glycemic regimen. Re-evaluate HbA1c in 3 to 6 months.",
                rationale="HbA1c within target limits reduces microvascular and macrovascular complication rates.",
                evidence_source="ADA Standards of Medical Care",
                action_type="patient_education",
                suggested_action="Continue Current Baseline Regimen"
            ))

        # Acute serum glucose checks
        if glucose == ">300":
            recs.append(CDSRecommendation(
                id="GLUCOSE_ACUTE_CRITICAL",
                category="Glycemic Management",
                severity="critical",
                title="Critical Acute Hyperglycemia (Serum Glucose > 300 mg/dL)",
                recommendation="Implement frequent point-of-care capillary glucose monitoring (Q4H/QAC) and rule out diabetic ketoacidosis (DKA) or hyperosmolar hyperglycemic state (HHS).",
                rationale="Severe acute hyperglycemia causes osmotic diuresis, electrolyte imbalance, and immune suppression.",
                evidence_source="AACE / ADA Hospital Management Protocol",
                action_type="order_lab",
                suggested_action="Order Serum Ketones & Electrolyte Chem-7 Panel"
            ))
        elif glucose == ">200":
            recs.append(CDSRecommendation(
                id="GLUCOSE_ELEVATED",
                category="Glycemic Management",
                severity="warning",
                title="Elevated Serum Glucose (> 200 mg/dL)",
                recommendation="Ensure correctional sliding-scale or rapid-acting prandial insulin coverage is in place.",
                rationale="Serum glucose persistently >200 mg/dL impairs wound healing and increases hospital length of stay.",
                evidence_source="Endocrine Society Inpatient Guidelines",
                action_type="adjust_medication",
                suggested_action="Review Pre-Meal Correctional Insulin Orders"
            ))

    # -------------------------------------------------------------
    # 2. MEDICATION SAFETY, POLYPHARMACY & BEERS CRITERIA
    # -------------------------------------------------------------
    if admission:
        med_count = admission.num_medications or 0
        if med_count >= 15:
            recs.append(CDSRecommendation(
                id="POLYPHARMACY_SEVERE",
                category="Medication Safety & Reconciliation",
                severity="critical" if patient_age >= 65 else "warning",
                title=f"High Polypharmacy Alert ({med_count} Active Medications)",
                recommendation="Conduct mandatory Clinical Pharmacist Medication Reconciliation. Screen for duplicate therapies, drug-drug interactions, and evaluate deprescribing opportunities.",
                rationale="Patients prescribed >= 15 medications have a 3.1x higher incidence of adverse drug events and non-adherence post-discharge.",
                evidence_source="WHO Global Patient Safety Challenge & Beers Criteria 2023",
                action_type="care_coordination",
                suggested_action="Request Clinical Pharmacist Comprehensive Medication Review"
            ))

        # Dosage Down / Reduction Risk
        med_list = admission.medications or []
        down_meds = [m.medication_name for m in med_list if m.dosage_status == "Down"]
        if down_meds:
            recs.append(CDSRecommendation(
                id="MED_DOSAGE_DOWN",
                category="Medication Safety & Reconciliation",
                severity="warning",
                title=f"Dosage Reduction Watch ({', '.join(down_meds)})",
                recommendation="Monitor patient for rebound hyperglycemia following dosage taper. Schedule a telehealth check within 72 hours post-discharge.",
                rationale="Inpatient down-titration without structured outpatient monitoring increases risk of rapid glycemic decompensation within 14 days.",
                evidence_source="Clinical Pharmacokinetics & Readmission Quality Studies",
                action_type="schedule_followup",
                suggested_action="Flag for 72-Hour Post-Discharge Telehealth Check"
            ))

    # -------------------------------------------------------------
    # 3. COMORBIDITY CLUSTERS & RENAL/CARDIAC CONTRAINDICATIONS
    # -------------------------------------------------------------
    if admission:
        diag1 = str(admission.diag_1 or "")
        diag2 = str(admission.diag_2 or "")
        diag3 = str(admission.diag_3 or "")
        all_diags = f"{diag1} {diag2} {diag3}"
        
        # Check Renal conditions (ICD-9 580-589)
        has_renal = any(d.startswith("58") for d in [diag1, diag2, diag3])
        has_metformin = any("metformin" in m.medication_name.lower() for m in (admission.medications or []))
        
        if has_renal:
            if has_metformin:
                recs.append(CDSRecommendation(
                    id="METFORMIN_RENAL_SAFETY",
                    category="Medication Safety & Reconciliation",
                    severity="critical",
                    title="Metformin & Renal Impairment Safety Alert",
                    recommendation="Verify estimated Glomerular Filtration Rate (eGFR). If eGFR < 30 mL/min/1.73m², discontinue Metformin immediately to prevent lactic acidosis. If eGFR 30-44, cap max dose at 1000 mg/day.",
                    rationale="Metformin is contraindicated in severe chronic kidney disease due to risk of fatal metformin-associated lactic acidosis (MALA).",
                    evidence_source="FDA Drug Safety Communication & KDIGO 2023",
                    action_type="adjust_medication",
                    suggested_action="Order Stat eGFR / Serum Creatinine & Adjust Metformin"
                ))
            else:
                recs.append(CDSRecommendation(
                    id="RENAL_PROTECTION_PROTOCOL",
                    category="Comorbidity & Specialty Care",
                    severity="warning",
                    title="Chronic Kidney Disease (CKD) Renal Protection Protocol",
                    recommendation="Order urinary albumin-to-creatinine ratio (uACR) and initiate SGLT2 inhibitor or ACEi/ARB for kidney disease progression slowing.",
                    rationale="Diabetic nephropathy is the leading cause of end-stage renal disease; early ACEi/ARB or SGLT2i therapy halts eGFR decline.",
                    evidence_source="KDIGO 2023 Clinical Practice Guideline",
                    action_type="order_lab",
                    suggested_action="Order Spot Urine Albumin-to-Creatinine Ratio (uACR)"
                ))
            
        # Check Cardiovascular conditions (ICD-9 410-414, 428, 430-438)
        has_cvd = any(d.startswith(("410", "411", "412", "413", "414", "428", "430", "431", "432", "433", "434", "435", "436", "437", "438")) for d in [diag1, diag2, diag3])
        if has_cvd:
            recs.append(CDSRecommendation(
                id="CVD_DIABETES_PATHWAY",
                category="Comorbidity & Specialty Care",
                severity="info",
                title="Cardiovascular Disease & Diabetic Comorbidity Pathway",
                recommendation="Prioritize GLP-1 receptor agonist or SGLT2 inhibitor therapy with proven cardiovascular benefit. Ensure statin therapy and blood pressure target (<130/80 mmHg) are met.",
                rationale="Cardiovascular disease is the leading cause of mortality in diabetic patients; SGLT2i and GLP-1RA therapy significantly reduces MACE events.",
                evidence_source="AHA / ACC / ADA Guideline on Cardiovascular-Renal-Metabolic Health",
                action_type="consult_specialist",
                suggested_action="Coordinate Cardiology Outpatient Follow-up & Statin Review"
            ))

        # Check Respiratory conditions (ICD-9 460-519)
        has_resp = any(d.startswith(("46", "47", "48", "49", "50", "51")) for d in [diag1, diag2, diag3])
        if has_resp:
            recs.append(CDSRecommendation(
                id="RESPIRATORY_PULMONARY_PATHWAY",
                category="Comorbidity & Specialty Care",
                severity="info",
                title="Pulmonary Disease & Chronic Airway Care Pathway",
                recommendation="Review inhaler technique, assess for steroid-induced glycemic spikes, and verify pneumococcal and annual influenza immunizations prior to discharge.",
                rationale="COPD and respiratory exacerbations frequently trigger acute hyperglycemia and secondary readmissions.",
                evidence_source="GOLD 2024 Guidelines & CDC Advisory Committee on Immunization",
                action_type="patient_education",
                suggested_action="Order Inpatient Respiratory Therapy Consult & Vaccine Check"
            ))

        # Primary Uncomplicated Diabetes screening
        if not has_cvd and not has_renal and not has_resp:
            recs.append(CDSRecommendation(
                id="DIABETES_PREVENTIVE_SCREENING",
                category="Guideline Compliance",
                severity="info",
                title="Routine Diabetic Microvascular & Preventive Screening",
                recommendation="Schedule annual dilated eye exam for diabetic retinopathy, comprehensive foot exam with monofilament testing, and dental hygiene review.",
                rationale="Early detection of microvascular complications through annual screening prevents progression to proliferative retinopathy and neuropathy.",
                evidence_source="ADA Standards of Medical Care in Diabetes (2024)",
                action_type="schedule_followup",
                suggested_action="Order Annual Ophthalmology & Podiatry Referrals"
            ))


    # -------------------------------------------------------------
    # 4. POST-DISCHARGE TRANSITIONAL CARE & 30-DAY READMISSION
    # -------------------------------------------------------------
    if admission:
        prior_inpatients = admission.number_inpatient or 0
        prior_emergencies = admission.number_emergency or 0
        
        if risk_cat == "High" or risk_score >= 60.0 or admission.readmitted == "<30":
            recs.append(CDSRecommendation(
                id="HIGH_RISK_TRANSITIONAL_CARE",
                category="Post-Discharge Care Coordination",
                severity="critical",
                title="High-Risk Transitional Care Management (TCM) Activation",
                recommendation="Enroll patient in Intensive 30-Day Care Transition Protocol: 1) Dedicated nurse phone call within 48 hours, 2) In-person clinical follow-up within 7 days, 3) Outpatient Remote Patient Monitoring (RPM) glucometer kit.",
                rationale="Patients identified in the High-Risk stratum (>=60% risk score) account for 74% of preventable 30-day readmissions.",
                evidence_source="CMS Hospital Readmissions Reduction Program (HRRP) & TCM Protocol",
                action_type="care_coordination",
                suggested_action="Enroll in 30-Day TCM Protocol & Dispatch RPM Kit"
            ))
        elif risk_cat == "Medium":
            recs.append(CDSRecommendation(
                id="MEDIUM_RISK_FOLLOWUP",
                category="Post-Discharge Care Coordination",
                severity="warning",
                title="Structured 14-Day Outpatient Follow-Up",
                recommendation="Schedule primary care or endocrinology follow-up within 14 days of discharge. Provide clear written discharge instructions on medication timing.",
                rationale="Structured follow-up within 14 days reduces 30-day readmission risk by 28% in moderate risk cohorts.",
                evidence_source="Agency for Healthcare Research and Quality (AHRQ)",
                action_type="schedule_followup",
                suggested_action="Book 14-Day Outpatient Primary Care Encounter"
            ))

        if prior_inpatients >= 2 or prior_emergencies >= 3:
            recs.append(CDSRecommendation(
                id="FREQUENT_UTILIZATION_SDOH",
                category="Post-Discharge Care Coordination",
                severity="warning",
                title=f"Frequent Inpatient Utilization ({prior_inpatients} Prior Inpatients, {prior_emergencies} ED Visits)",
                recommendation="Perform Social Determinants of Health (SDOH) assessment. Evaluate patient for transportation assistance, medication affordability programs, and home health care referral.",
                rationale="Repeated acute admissions frequently stem from social vulnerabilities, lack of primary care access, or financial inability to fill prescriptions.",
                evidence_source="National Academy of Medicine Social Determinants Framework",
                action_type="care_coordination",
                suggested_action="Trigger Medical Social Work (MSW) & SDOH Consultation"
            ))

    # Calculate alert counts
    critical_count = sum(1 for r in recs if r.severity == "critical")
    warning_count = sum(1 for r in recs if r.severity == "warning")
    
    return CDSSummary(
        patient_id=patient.id,
        encounter_id=admission.encounter_id if admission else None,
        patient_name=f"{patient.first_name} {patient.last_name}".strip() or f"Patient #{patient.patient_nbr}",
        overall_risk_level=risk_cat,
        risk_score=round(risk_score, 1),
        critical_alerts_count=critical_count,
        warning_alerts_count=warning_count,
        total_recommendations=len(recs),
        recommendations=recs,
        generated_at=datetime.utcnow().isoformat()
    )
