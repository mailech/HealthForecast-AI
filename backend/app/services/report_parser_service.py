import io
import re
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import docx
except ImportError:
    docx = None

from app.models.patient import Patient
from app.schemas.medical_report import ExtractedClinicalFields, FieldConflict


def parse_date_string(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    # Clean ordinal suffixes like 5th -> 5, 1st -> 1, 2nd -> 2, 3rd -> 3
    cleaned = re.sub(r'(\d+)(st|nd|rd|th)\b', r'\1', date_str.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r'[,]', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    formats = [
        "%d %B %Y",      # 05 August 2026 / 5 August 2026
        "%B %d %Y",      # August 05 2026 / August 5 2026
        "%d %b %Y",      # 05 Aug 2026
        "%b %d %Y",      # Aug 05 2026
        "%Y-%m-%d",      # 2026-08-05
        "%d-%m-%Y",      # 05-08-2026
        "%m-%d-%Y",      # 08-05-2026
        "%d/%m/%Y",      # 05/08/2026
        "%m/%d/%Y",      # 08/05/2026
        "%Y/%m/%d",      # 2026/08/05
    ]

    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            pass
    return None


class ReportParserService:

    @staticmethod
    def extract_raw_text(file_contents: bytes, filename: str) -> str:
        ext = filename.lower().split(".")[-1]
        
        if ext == "pdf":
            extracted = ""
            errors_list = []

            # 1. Try pypdf
            if pypdf is not None:
                try:
                    reader = pypdf.PdfReader(io.BytesIO(file_contents))
                    text_parts = [page.extract_text() for page in reader.pages if page.extract_text()]
                    extracted = "\n".join(text_parts).strip()
                except Exception as e:
                    errors_list.append(f"pypdf: {str(e)}")

            # 2. Try fitz (PyMuPDF) if pypdf didn't produce text
            if not extracted and fitz is not None:
                try:
                    doc = fitz.open(stream=file_contents, filetype="pdf")
                    text_parts = [page.get_text() for page in doc]
                    extracted = "\n".join(text_parts).strip()
                except Exception as e:
                    errors_list.append(f"fitz: {str(e)}")

            # 3. Try PyPDF2
            if not extracted and PyPDF2 is not None:
                try:
                    reader = PyPDF2.PdfReader(io.BytesIO(file_contents))
                    text_parts = [page.extract_text() for page in reader.pages if page.extract_text()]
                    extracted = "\n".join(text_parts).strip()
                except Exception as e:
                    errors_list.append(f"PyPDF2: {str(e)}")

            # 4. Fallback text stream regex parser for uncompressed PDF text operators
            if not extracted:
                try:
                    decoded = file_contents.decode("latin-1", errors="ignore")
                    text_matches = re.findall(r"\(([^()]{2,})\)\s*Tj", decoded)
                    if text_matches:
                        extracted = "\n".join(text_matches).strip()
                except Exception:
                    pass

            if not extracted or len(extracted.strip()) < 5:
                err_msg = f" ({'; '.join(errors_list)})" if errors_list else ""
                raise ValueError(f"Unable to extract readable clinical text from this PDF medical report.{err_msg} Please ensure the document is a readable text PDF.")

            return extracted

        elif ext == "docx":
            if docx is None:
                raise ValueError("DOCX library not available on server.")
            try:
                doc = docx.Document(io.BytesIO(file_contents))
                text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()]).strip()
                if not text:
                    raise ValueError("Empty text in DOCX file.")
                return text
            except Exception as e:
                raise ValueError(f"Failed to read DOCX report: {str(e)}")

        elif ext in ["txt", "text"]:
            try:
                text = file_contents.decode("utf-8", errors="replace").strip()
                if not text:
                    raise ValueError("File contains no text.")
                return text
            except Exception as e:
                raise ValueError(f"Failed to read text file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file format '.{ext}'. Supported formats: .pdf, .docx, .txt")

    @staticmethod
    def parse_clinical_text(raw_text: str) -> ExtractedClinicalFields:
        fields = ExtractedClinicalFields()

        # 1. Patient Name
        name_match = re.search(
            r"(?:patient\s*name|name\s*of\s*patient|patient\s*full\s*name|name)\s*[:=\-]\s*([A-Za-z\.\'-]+(?:[ \t]+[A-Za-z\.\'-]+)*)",
            raw_text,
            re.IGNORECASE
        )
        if name_match:
            val = name_match.group(1).strip()
            if val and len(val) > 2 and not any(kw in val.lower() for kw in ["age", "gender", "male", "female", "report", "date", "clinical", "discharge"]):
                fields.patient_name = val

        # 2. Age
        age_match = re.search(
            r"(?:patient\s*age|age/sex|age/gender|age)\s*[:=\-]\s*(\d{1,3})",
            raw_text,
            re.IGNORECASE
        )
        if not age_match:
            age_match = re.search(r"\b(\d{1,3})\s*(?:years?\s*old|y/o|yo|yr|yrs)\b", raw_text, re.IGNORECASE)
        
        if age_match:
            try:
                age_val = int(age_match.group(1))
                if 0 <= age_val <= 120:
                    fields.age = age_val
            except ValueError:
                pass

        # 3. Gender
        gender_match = re.search(r"(?:gender|sex)\s*[:=\-]\s*(male|female|m|f)\b", raw_text, re.IGNORECASE)
        if not gender_match:
            gender_match = re.search(r"\b(male|female)\b", raw_text, re.IGNORECASE)
        
        if gender_match:
            g_str = gender_match.group(1).lower()
            if g_str in ["male", "m"]:
                fields.gender = "Male"
            elif g_str in ["female", "f"]:
                fields.gender = "Female"

        # 4. Diagnosis
        diag_match = re.search(
            r"(?:primary\s*diagnosis|admitting\s*diagnosis|diagnosis|condition|icd(?:-9|-10)?|impression)\s*[:=\-]\s*([^\n\r;,]+)",
            raw_text,
            re.IGNORECASE
        )
        if diag_match:
            d_val = diag_match.group(1).strip()
            if d_val and len(d_val) > 1:
                fields.diagnosis = d_val

        # 5. Department
        dept_match = re.search(
            r"(?:department|specialty|unit|ward|clinic)\s*[:=\-]\s*([^\n\r;,]+)",
            raw_text,
            re.IGNORECASE
        )
        if dept_match:
            dept_val = dept_match.group(1).strip()
            if dept_val:
                fields.department = dept_val
        else:
            for known_dept in ["General Medicine", "Cardiology", "Endocrinology", "Neurology", "Surgery", "Pediatrics", "Emergency", "Internal Medicine", "Oncology"]:
                if re.search(r"\b" + re.escape(known_dept) + r"\b", raw_text, re.IGNORECASE):
                    fields.department = known_dept
                    break

        # 6. Prior Admissions
        prior_match = re.search(
            r"(?:prior(?:\s+hospital)?\s+admissions?|previous(?:\s+hospital)?\s+admissions?|number\s+of\s+(?:previous|prior)\s+(?:hospital\s+)?admissions?|history\s+of\s+(?:hospital\s+)?admissions?|prior\s+inpatient\s+(?:stays|admissions)|inpatient\s+stays|prior\s+hospitalization[s]?|previous\s+hospitalization[s]?)\s*[:=\-]\s*(\d+)",
            raw_text,
            re.IGNORECASE
        )
        if not prior_match:
            prior_match = re.search(r"(\d+)\s*(?:previous|prior)\s+(?:hospital\s+)?admissions", raw_text, re.IGNORECASE)
        if not prior_match:
            prior_match = re.search(r"(?:admitted|hospitalized)\s*(\d+)\s*times?\s*(?:previously|prior|in\s*the\s*past)", raw_text, re.IGNORECASE)

        if prior_match:
            try:
                fields.prior_admissions = int(prior_match.group(1))
                fields.prior_admissions_source = "Medical report"
            except ValueError:
                fields.prior_admissions = None
                fields.prior_admissions_source = "Not Available"
        else:
            fields.prior_admissions = None
            fields.prior_admissions_source = "Not Available"

        # 7. Admission Date & Discharge Date
        adm_match = re.search(
            r"(?:date\s+of\s+admission|admission\s+date|admitted\s+on|admitted|date\s+admitted)\s*[:=\-]\s*([A-Za-z0-9\s/,\.\-]+?)(?=\n|\r|;|\bdischarge|\bdate\s+of\s+discharge|\bpatient|\bdiagnosis|$)",
            raw_text,
            re.IGNORECASE
        )
        dis_match = re.search(
            r"(?:date\s+of\s+discharge|discharge\s+date|discharged\s+on|discharged|date\s+discharged)\s*[:=\-]\s*([A-Za-z0-9\s/,\.\-]+?)(?=\n|\r|;|\badmission|\bpatient|\bdiagnosis|$)",
            raw_text,
            re.IGNORECASE
        )

        if adm_match:
            fields.admission_date = adm_match.group(1).strip()
        if dis_match:
            fields.discharge_date = dis_match.group(1).strip()

        # 8. Length of Stay Priority Logic
        # FIRST: Explicit Length of Stay in report
        los_match = re.search(
            r"(?:length\s*of\s*stay(?:\s*\([^)]*\))?|hospital\s*stay|stay\s*duration|\blos\b|duration\s*of\s*stay)\s*[:=\-]\s*(\d+)\s*(?:days?)?",
            raw_text,
            re.IGNORECASE
        )
        if not los_match:
            los_match = re.search(r"stay(?:ed)?\s*for\s*(\d+)\s*days?", raw_text, re.IGNORECASE)
        if not los_match:
            los_match = re.search(r"(\d+)\s*days?\s*(?:in\s*hospital|hospitalization|stay)", raw_text, re.IGNORECASE)

        if los_match:
            try:
                fields.length_of_stay = int(los_match.group(1))
                fields.length_of_stay_source = "Medical report"
            except ValueError:
                pass

        # SECOND: Calculate from Admission and Discharge dates if explicit LOS not found
        if fields.length_of_stay is None and fields.admission_date and fields.discharge_date:
            adm_dt = parse_date_string(fields.admission_date)
            dis_dt = parse_date_string(fields.discharge_date)
            if adm_dt and dis_dt and dis_dt >= adm_dt:
                calc_days = (dis_dt - adm_dt).days
                fields.length_of_stay = calc_days
                fields.length_of_stay_source = "Calculated from admission and discharge dates"

        # THIRD: If neither exists, length_of_stay remains None ("Not Available")
        if fields.length_of_stay is None:
            fields.length_of_stay_source = "Not Available"

        # 9. Clinical procedure metrics
        lab_match = re.search(r"(?:num(?:ber)?\s*of\s*lab\s*procedures|lab\s*procedures|lab\s*tests)\s*[:=\-]\s*(\d+)", raw_text, re.IGNORECASE)
        if lab_match:
            fields.num_lab_procedures = int(lab_match.group(1))

        proc_match = re.search(r"(?<!lab\s)(?:num(?:ber)?\s*of\s*procedures|surgical\s*procedures|\bprocedures)\s*[:=\-]\s*(\d+)", raw_text, re.IGNORECASE)
        if proc_match:
            fields.num_procedures = int(proc_match.group(1))

        med_match = re.search(r"(?:num(?:ber)?\s*of\s*medications|medications)\s*[:=\-]\s*(\d+)", raw_text, re.IGNORECASE)
        if med_match:
            fields.num_medications = int(med_match.group(1))

        outpatient_match = re.search(r"(?:outpatient\s*visits|number\s*outpatient)\s*[:=\-]\s*(\d+)", raw_text, re.IGNORECASE)
        if outpatient_match:
            fields.number_outpatient = int(outpatient_match.group(1))

        emergency_match = re.search(r"(?:emergency\s*visits|number\s*emergency)\s*[:=\-]\s*(\d+)", raw_text, re.IGNORECASE)
        if emergency_match:
            fields.number_emergency = int(emergency_match.group(1))

        a1c_match = re.search(r"(?:a1c\s*result|hba1c|a1c)\s*[:=\-]\s*(>8|>7|norm|none)", raw_text, re.IGNORECASE)
        if a1c_match:
            fields.A1Cresult = a1c_match.group(1).title()

        glu_match = re.search(r"(?:max\s*glu\s*serum|glucose\s*serum)\s*[:=\-]\s*(>300|>200|norm|none)", raw_text, re.IGNORECASE)
        if glu_match:
            fields.max_glu_serum = glu_match.group(1).title()

        ins_match = re.search(r"insulin\s*[:=\-]\s*(up|down|steady|no)", raw_text, re.IGNORECASE)
        if ins_match:
            fields.insulin = ins_match.group(1).capitalize()

        met_match = re.search(r"metformin\s*[:=\-]\s*(up|down|steady|no)", raw_text, re.IGNORECASE)
        if met_match:
            fields.metformin = met_match.group(1).capitalize()

        return fields

    @staticmethod
    def detect_conflicts(extracted: ExtractedClinicalFields, patient: Patient) -> list[FieldConflict]:
        conflicts = []

        if extracted.age is not None and patient.age is not None:
            if extracted.age != patient.age:
                conflicts.append(FieldConflict(
                    field="age",
                    field_label="Patient Age",
                    existing_value=patient.age,
                    report_value=extracted.age
                ))

        if extracted.gender and patient.gender:
            if extracted.gender.lower() != patient.gender.lower():
                conflicts.append(FieldConflict(
                    field="gender",
                    field_label="Gender",
                    existing_value=patient.gender,
                    report_value=extracted.gender
                ))

        if extracted.diagnosis and patient.diagnosis:
            if extracted.diagnosis.lower().strip() != patient.diagnosis.lower().strip():
                conflicts.append(FieldConflict(
                    field="diagnosis",
                    field_label="Diagnosis",
                    existing_value=patient.diagnosis,
                    report_value=extracted.diagnosis
                ))

        if extracted.department and patient.department:
            if extracted.department.lower().strip() != patient.department.lower().strip():
                conflicts.append(FieldConflict(
                    field="department",
                    field_label="Department",
                    existing_value=patient.department,
                    report_value=extracted.department
                ))

        return conflicts
