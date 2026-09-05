import React, { useState } from 'react';
import api from '../services/api';
import ResultCard from '../components/ResultCard';
import ModelBanner from '../components/ModelBanner';
import { Sparkles, Send, RotateCcw, AlertCircle } from 'lucide-react';

const INITIAL_FORM_STATE = {
  patient_name: 'Jane Doe',
  race: 'Caucasian',
  gender: 'Female',
  age: '[60-70)',
  admission_type_id: '1',
  discharge_disposition_id: '1',
  admission_source_id: '7',
  time_in_hospital: 4,
  payer_code: 'MC',
  medical_specialty: 'InternalMedicine',
  num_lab_procedures: 42,
  num_procedures: 1,
  num_medications: 15,
  number_outpatient: 0,
  number_emergency: 0,
  number_inpatient: 1,
  number_diagnoses: 7,
  max_glu_serum: 'None',
  A1Cresult: 'Norm',
  metformin: 'Steady',
  repaglinide: 'No',
  nateglinide: 'No',
  chlorpropamide: 'No',
  glimepiride: 'No',
  acetohexamide: 'No',
  glipizide: 'No',
  glyburide: 'No',
  tolbutamide: 'No',
  pioglitazone: 'No',
  rosiglitazone: 'No',
  acarbose: 'No',
  miglitol: 'No',
  troglitazone: 'No',
  tolazamide: 'No',
  examide: 'No',
  citoglipton: 'No',
  insulin: 'Steady',
  glyburide_metformin: 'No',
  glipizide_metformin: 'No',
  glimepiride_pioglitazone: 'No',
  metformin_rosiglitazone: 'No',
  metformin_pioglitazone: 'No',
  change: 'Ch',
  diabetesMed: 'Yes',
  diag_1_group: 'Circulatory',
  diag_2_group: 'Diabetes',
  diag_3_group: 'Respiratory'
};

const HIGH_RISK_PRESET = {
  patient_name: 'Robert Vance (High Risk Demo)',
  race: 'AfricanAmerican',
  gender: 'Male',
  age: '[70-80)',
  admission_type_id: '1',
  discharge_disposition_id: '3',
  admission_source_id: '7',
  time_in_hospital: 11,
  payer_code: 'MC',
  medical_specialty: 'Cardiology',
  num_lab_procedures: 78,
  num_procedures: 3,
  num_medications: 28,
  number_outpatient: 2,
  number_emergency: 3,
  number_inpatient: 4,
  number_diagnoses: 9,
  max_glu_serum: '>300',
  A1Cresult: '>8',
  metformin: 'Up',
  repaglinide: 'No',
  nateglinide: 'No',
  chlorpropamide: 'No',
  glimepiride: 'No',
  acetohexamide: 'No',
  glipizide: 'Up',
  glyburide: 'No',
  tolbutamide: 'No',
  pioglitazone: 'No',
  rosiglitazone: 'No',
  acarbose: 'No',
  miglitol: 'No',
  troglitazone: 'No',
  tolazamide: 'No',
  examide: 'No',
  citoglipton: 'No',
  insulin: 'Up',
  glyburide_metformin: 'No',
  glipizide_metformin: 'No',
  glimepiride_pioglitazone: 'No',
  metformin_rosiglitazone: 'No',
  metformin_pioglitazone: 'No',
  change: 'Ch',
  diabetesMed: 'Yes',
  diag_1_group: 'Circulatory',
  diag_2_group: 'Diabetes',
  diag_3_group: 'Genitourinary'
};

const LOW_RISK_PRESET = {
  patient_name: 'Emily Watson (Low Risk Demo)',
  race: 'Caucasian',
  gender: 'Female',
  age: '[30-40)',
  admission_type_id: '3',
  discharge_disposition_id: '1',
  admission_source_id: '1',
  time_in_hospital: 2,
  payer_code: 'BC',
  medical_specialty: 'InternalMedicine',
  num_lab_procedures: 18,
  num_procedures: 0,
  num_medications: 6,
  number_outpatient: 0,
  number_emergency: 0,
  number_inpatient: 0,
  number_diagnoses: 3,
  max_glu_serum: 'None',
  A1Cresult: 'Norm',
  metformin: 'No',
  repaglinide: 'No',
  nateglinide: 'No',
  chlorpropamide: 'No',
  glimepiride: 'No',
  acetohexamide: 'No',
  glipizide: 'No',
  glyburide: 'No',
  tolbutamide: 'No',
  pioglitazone: 'No',
  rosiglitazone: 'No',
  acarbose: 'No',
  miglitol: 'No',
  troglitazone: 'No',
  tolazamide: 'No',
  examide: 'No',
  citoglipton: 'No',
  insulin: 'No',
  glyburide_metformin: 'No',
  glipizide_metformin: 'No',
  glimepiride_pioglitazone: 'No',
  metformin_rosiglitazone: 'No',
  metformin_pioglitazone: 'No',
  change: 'No',
  diabetesMed: 'No',
  diag_1_group: 'Digestive',
  diag_2_group: 'Other',
  diag_3_group: 'Other'
};

const MEDICATION_KEYS = [
  'metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 'glimepiride',
  'acetohexamide', 'glipizide', 'glyburide', 'tolbutamide', 'pioglitazone',
  'rosiglitazone', 'acarbose', 'miglitol', 'troglitazone', 'tolazamide',
  'examide', 'citoglipton', 'insulin', 'glyburide_metformin', 'glipizide_metformin',
  'glimepiride_pioglitazone', 'metformin_rosiglitazone', 'metformin_pioglitazone'
];

export default function PredictionPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/predict', formData);
      setResult(response.data);
      // Scroll to result
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      console.error('Prediction API Error:', err);
      setError(
        err.response?.data?.detail || 'Failed to process prediction. Please check input parameters.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>New Readmission Risk Evaluation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter patient demographic, encounter, and clinical metrics to run the XGBoost inference model.
          </p>
        </div>

        {/* Quick Demo Preset Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="demo-btn"
            style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', fontWeight: 600, padding: '0.5rem 0.85rem' }}
            onClick={() => setFormData(HIGH_RISK_PRESET)}
          >
            ⚡ Load High-Risk Sample
          </button>
          <button
            type="button"
            className="demo-btn"
            style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', fontWeight: 600, padding: '0.5rem 0.85rem' }}
            onClick={() => setFormData(LOW_RISK_PRESET)}
          >
            ⚡ Load Low-Risk Sample
          </button>
        </div>
      </div>

      <ModelBanner />

      {error && (
        <div className="alert-box alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Demographics & Encounter */}
        <div className="form-card">
          <div className="section-header">
            <h2>1. Patient & Encounter Details</h2>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Patient Identifier / Name</label>
              <input
                type="text"
                name="patient_name"
                className="form-control"
                value={formData.patient_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Age Bracket</label>
              <select name="age" className="form-control" value={formData.age} onChange={handleChange}>
                {['[0-10)', '[10-20)', '[20-30)', '[30-40)', '[40-50)', '[50-60)', '[60-70)', '[70-80)', '[80-90)', '[90-100)'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div className="form-group">
              <label>Race / Ethnicity</label>
              <select name="race" className="form-control" value={formData.race} onChange={handleChange}>
                <option value="Caucasian">Caucasian</option>
                <option value="AfricanAmerican">African American</option>
                <option value="Hispanic">Hispanic</option>
                <option value="Asian">Asian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Admission Type ID</label>
              <select name="admission_type_id" className="form-control" value={formData.admission_type_id} onChange={handleChange}>
                <option value="1">1 - Emergency</option>
                <option value="2">2 - Urgent</option>
                <option value="3">3 - Elective</option>
                <option value="4">4 - Newborn</option>
                <option value="5">5 - Not Available</option>
                <option value="6">6 - NULL</option>
                <option value="7">7 - Trauma Center</option>
                <option value="8">8 - Not Mapped</option>
              </select>
            </div>

            <div className="form-group">
              <label>Discharge Disposition ID</label>
              <select name="discharge_disposition_id" className="form-control" value={formData.discharge_disposition_id} onChange={handleChange}>
                <option value="1">1 - Discharged to Home</option>
                <option value="2">2 - Short-term Hospital</option>
                <option value="3">3 - SNF (Skilled Nursing)</option>
                <option value="4">4 - ICF</option>
                <option value="5">5 - Inpatient Care Facility</option>
                <option value="6">6 - Home with Health Care</option>
                <option value="7">7 - Left AMA</option>
                <option value="18">18 - Rehab Facility</option>
                <option value="22">22 - Specialized Rehab</option>
              </select>
            </div>

            <div className="form-group">
              <label>Admission Source ID</label>
              <select name="admission_source_id" className="form-control" value={formData.admission_source_id} onChange={handleChange}>
                <option value="7">7 - Emergency Room</option>
                <option value="1">1 - Physician Referral</option>
                <option value="2">2 - Clinic Referral</option>
                <option value="3">3 - HMO Referral</option>
                <option value="4">4 - Transfer from Hospital</option>
                <option value="5">5 - Transfer from SNF</option>
                <option value="6">6 - Transfer from Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payer Code</label>
              <select name="payer_code" className="form-control" value={formData.payer_code} onChange={handleChange}>
                {['MC', 'MD', 'HM', 'UN', 'BC', 'SP', 'CP', 'SI', 'DM', 'CM', 'OG', 'PO', 'OT', 'WC', 'MP', 'CH', 'Unknown'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Medical Specialty</label>
              <select name="medical_specialty" className="form-control" value={formData.medical_specialty} onChange={handleChange}>
                {['InternalMedicine', 'Cardiology', 'Family/GeneralPractice', 'Emergency/Trauma', 'Surgery-General', 'Orthopedics', 'Nephrology', 'Gastroenterology', 'Neurology', 'Oncology', 'Pulmonology', 'Urology', 'Unknown'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Counts & Hospital Stay */}
        <div className="form-card">
          <div className="section-header">
            <h2>2. Encounter Utilization & Lab Counts</h2>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Time in Hospital (Days)</label>
              <input
                type="number"
                name="time_in_hospital"
                className="form-control"
                min="1"
                max="14"
                value={formData.time_in_hospital}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Num Lab Procedures</label>
              <input
                type="number"
                name="num_lab_procedures"
                className="form-control"
                min="1"
                value={formData.num_lab_procedures}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Num Procedures</label>
              <input
                type="number"
                name="num_procedures"
                className="form-control"
                min="0"
                value={formData.num_procedures}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Num Medications</label>
              <input
                type="number"
                name="num_medications"
                className="form-control"
                min="1"
                value={formData.num_medications}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Outpatient Encounters</label>
              <input
                type="number"
                name="number_outpatient"
                className="form-control"
                min="0"
                value={formData.number_outpatient}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Emergency Encounters</label>
              <input
                type="number"
                name="number_emergency"
                className="form-control"
                min="0"
                value={formData.number_emergency}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Inpatient Encounters</label>
              <input
                type="number"
                name="number_inpatient"
                className="form-control"
                min="0"
                value={formData.number_inpatient}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Number of Diagnoses</label>
              <input
                type="number"
                name="number_diagnoses"
                className="form-control"
                min="1"
                value={formData.number_diagnoses}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lab Tests & Diagnostics */}
        <div className="form-card">
          <div className="section-header">
            <h2>3. Laboratory Tests & Diagnostic Groups</h2>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Max Glucose Serum</label>
              <select name="max_glu_serum" className="form-control" value={formData.max_glu_serum} onChange={handleChange}>
                <option value="None">None / Not Measured</option>
                <option value="Norm">Norm</option>
                <option value=">200">&gt;200</option>
                <option value=">300">&gt;300</option>
              </select>
            </div>

            <div className="form-group">
              <label>HbA1c Result</label>
              <select name="A1Cresult" className="form-control" value={formData.A1Cresult} onChange={handleChange}>
                <option value="None">None / Not Measured</option>
                <option value="Norm">Norm</option>
                <option value=">7">&gt;7</option>
                <option value=">8">&gt;8</option>
              </select>
            </div>

            <div className="form-group">
              <label>Medication Change</label>
              <select name="change" className="form-control" value={formData.change} onChange={handleChange}>
                <option value="Ch">Ch (Changed)</option>
                <option value="No">No (No change)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Diabetes Med Prescribed</label>
              <select name="diabetesMed" className="form-control" value={formData.diabetesMed} onChange={handleChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Primary Diagnosis Group (Diag 1)</label>
              <select name="diag_1_group" className="form-control" value={formData.diag_1_group} onChange={handleChange}>
                {['Circulatory', 'Diabetes', 'Digestive', 'Genitourinary', 'Injury', 'Musculoskeletal', 'Neoplasms', 'Respiratory', 'Other'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Secondary Diagnosis Group (Diag 2)</label>
              <select name="diag_2_group" className="form-control" value={formData.diag_2_group} onChange={handleChange}>
                {['Circulatory', 'Diabetes', 'Digestive', 'Genitourinary', 'Injury', 'Musculoskeletal', 'Neoplasms', 'Respiratory', 'Other'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tertiary Diagnosis Group (Diag 3)</label>
              <select name="diag_3_group" className="form-control" value={formData.diag_3_group} onChange={handleChange}>
                {['Circulatory', 'Diabetes', 'Digestive', 'Genitourinary', 'Injury', 'Musculoskeletal', 'Neoplasms', 'Respiratory', 'Other'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Medications */}
        <div className="form-card">
          <div className="section-header">
            <h2>4. Prescribed Medications (Dosage Status)</h2>
          </div>

          <div className="form-grid-4">
            {MEDICATION_KEYS.map((med) => (
              <div className="form-group" key={med}>
                <label style={{ textTransform: 'capitalize' }}>
                  {med.replace(/_/g, ' ')}
                </label>
                <select
                  name={med}
                  className="form-control"
                  value={formData[med]}
                  onChange={handleChange}
                >
                  <option value="No">No</option>
                  <option value="Steady">Steady</option>
                  <option value="Up">Up</option>
                  <option value="Down">Down</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Submit action */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.9rem 1.5rem', fontSize: '1.05rem' }}
            disabled={loading}
          >
            {loading ? 'Evaluating Model Inference...' : (
              <>
                <Send size={20} /> Run Readmission Prediction
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-logout"
            style={{ padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => {
              setFormData(INITIAL_FORM_STATE);
              setResult(null);
            }}
          >
            <RotateCcw size={18} /> Reset Form
          </button>
        </div>
      </form>

      {/* Prediction Output */}
      {result && <ResultCard result={result} />}
    </div>
  );
}
