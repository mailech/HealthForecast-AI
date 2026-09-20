import io
import re
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


class ReportParserService:

    @staticmethod
    def extract_raw_text(file_contents: bytes, filename: str) -> str:
        ext = filename.lower().split(".")[-1]
        
        if ext == "pdf":
            extracted = ""
            if fitz is not None:
                try:
                    doc = fitz.open(stream=file_contents, filetype="pdf")
                    text_parts = [page.get_text() for page in doc]
                    extracted = "\n".join(text_parts).strip()
                except Exception as e:
                    raise ValueError(f"Unable to read this report. The PDF file may be corrupted: {str(e)}")
            elif pypdf is not None:
                try:
                    reader = pypdf.PdfReader(io.BytesIO(file_contents))
                    text_parts = [page.extract_text() for page in reader.pages if page.extract_text()]
                    extracted = "\n".join(text_parts).strip()
                except Exception as e:
                    raise ValueError(f"Unable to read this report. The PDF file may be corrupted: {str(e)}")
            elif PyPDF2 is not None:
                try:
                    reader = PyPDF2.PdfReader(io.BytesIO(file_contents))
                    text_parts = [page.extract_text() for page in reader.pages if page.extract_text()]
                    extracted = "\n".join(text_parts).strip()
                except Exception as e:
                    raise ValueError(f"Unable to read this report. The PDF file may be corrupted: {str(e)}")
            else:
                # Fallback text extraction from raw bytes
                try:
                    extracted = file_contents.decode("utf-8", errors="ignore").strip()
                except Exception:
                    extracted = ""

            if not extracted:
                raise ValueError("Unable to extract readable information from this report.")
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
            r"(?:patient\s*age|age/sex|age/gender|age)\s*[:=]\s*(\d{1,3})",
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
        gender_match = re.search(r"(?:gender|sex)\s*[:=]\s*(male|female|m|f)\b", raw_text, re.IGNORECASE)
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
            r"(?:primary\s*diagnosis|admitting\s*diagnosis|diagnosis|condition|icd(?:-9|-10)?|impression)\s*[:=]\s*([^\n\r;,]+)",
            raw_text,
            re.IGNORECASE
        )
        if diag_match:
            d_val = diag_match.group(1).strip()
            if d_val and len(d_val) > 1:
                fields.diagnosis = d_val

        # 5. Department
        dept_match = re.search(
            r"(?:department|specialty|unit|ward|clinic)\s*[:=]\s*([^\n\r;,]+)",
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

        # 6. Prior Admissions (STRICT: ONLY IF FOUND)
        prior_match = re.search(
            r"(?:prior\s*admissions|previous\s*admissions|history\s*of\s*hospitalization|number\s*of\s*previous\s*hospital\s*admissions|prior\s*inpatient\s*stays|inpatient\s*stays|prior\s*hospitalization[s]?|previous\s*hospitalization[s]?)\s*[:=]\s*(\d+)",
            raw_text,
            re.IGNORECASE
        )
        if not prior_match:
            prior_match = re.search(r"(\d+)\s*(?:previous\s*admissions|prior\s*admissions|prior\s*hospitalizations|previous\s*hospitalizations|prior\s*inpatient\s*stays)", raw_text, re.IGNORECASE)
        if not prior_match:
            prior_match = re.search(r"(?:admitted|hospitalized)\s*(\d+)\s*times?\s*(?:previously|prior|in\s*the\s*past)", raw_text, re.IGNORECASE)

        if prior_match:
            try:
                fields.prior_admissions = int(prior_match.group(1))
            except ValueError:
                pass

        # 7. Length of Stay (STRICT: ONLY IF FOUND)
        los_match = re.search(
            r"(?:length\s*of\s*stay|hospital\s*stay|stay\s*duration|los|duration\s*of\s*stay)\s*[:=]\s*(\d+)\s*(?:days?)?",
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
            except ValueError:
                pass

        # 7b. Admission & Discharge Date Calculation for Length of Stay if stay duration wasn't explicitly matched
        if fields.length_of_stay is None:
            adm_match = re.search(r"(?:admission\s*date|admitted|date\s*of\s*admission)\s*[:=]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})", raw_text, re.IGNORECASE)
            dis_match = re.search(r"(?:discharge\s*date|discharged|date\s*of\s*discharge)\s*[:=]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})", raw_text, re.IGNORECASE)
            if adm_match and dis_match:
                try:
                    from datetime import datetime as dt_cls
                    adm_str = adm_match.group(1).replace('/', '-')
                    dis_str = dis_match.group(1).replace('/', '-')
                    def parse_dt(s):
                        for fmt in ("%Y-%m-%d", "%m-%d-%Y", "%d-%m-%Y"):
                            try:
                                return dt_cls.strptime(s, fmt)
                            except ValueError:
                                pass
                        return None
                    dt_adm = parse_dt(adm_str)
                    dt_dis = parse_dt(dis_str)
                    if dt_adm and dt_dis and dt_dis >= dt_adm:
                        days = (dt_dis - dt_adm).days
                        if days > 0:
                            fields.length_of_stay = days
                except Exception:
                    pass

        # 8. Clinical procedure metrics
        lab_match = re.search(r"(?:num(?:ber)?\s*of\s*lab\s*procedures|lab\s*procedures|lab\s*tests)\s*[:=]\s*(\d+)", raw_text, re.IGNORECASE)
        if lab_match:
            fields.num_lab_procedures = int(lab_match.group(1))

        proc_match = re.search(r"(?<!lab\s)(?:num(?:ber)?\s*of\s*procedures|surgical\s*procedures|\bprocedures)\s*[:=]\s*(\d+)", raw_text, re.IGNORECASE)
        if proc_match:
            fields.num_procedures = int(proc_match.group(1))

        med_match = re.search(r"(?:num(?:ber)?\s*of\s*medications|medications)\s*[:=]\s*(\d+)", raw_text, re.IGNORECASE)
        if med_match:
            fields.num_medications = int(med_match.group(1))

        outpatient_match = re.search(r"(?:outpatient\s*visits|number\s*outpatient)\s*[:=]\s*(\d+)", raw_text, re.IGNORECASE)
        if outpatient_match:
            fields.number_outpatient = int(outpatient_match.group(1))

        emergency_match = re.search(r"(?:emergency\s*visits|number\s*emergency)\s*[:=]\s*(\d+)", raw_text, re.IGNORECASE)
        if emergency_match:
            fields.number_emergency = int(emergency_match.group(1))

        a1c_match = re.search(r"(?:a1c\s*result|hba1c|a1c)\s*[:=]\s*(>8|>7|norm|none)", raw_text, re.IGNORECASE)
        if a1c_match:
            fields.A1Cresult = a1c_match.group(1).title()

        glu_match = re.search(r"(?:max\s*glu\s*serum|glucose\s*serum)\s*[:=]\s*(>300|>200|norm|none)", raw_text, re.IGNORECASE)
        if glu_match:
            fields.max_glu_serum = glu_match.group(1).title()

        ins_match = re.search(r"insulin\s*[:=]\s*(up|down|steady|no)", raw_text, re.IGNORECASE)
        if ins_match:
            fields.insulin = ins_match.group(1).capitalize()

        met_match = re.search(r"metformin\s*[:=]\s*(up|down|steady|no)", raw_text, re.IGNORECASE)
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
