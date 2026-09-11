import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
  Sparkles,
  Stethoscope,
  Activity,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  BrainCircuit,
  FileText,
  User,
  Building,
  Pill,
  History,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

const SAMPLE_HIGH_RISK = {
  race: "Caucasian",
  gender: "Female",
  age: "[70-80)",
  admission_type_id: 1,
  admission_source_id: 7,
  time_in_hospital: 7,
  payer_code: "MC",
  medical_specialty: "InternalMedicine",
  num_lab_procedures: 68,
  num_procedures: 2,
  num_medications: 18,
  number_outpatient: 2,
  number_emergency: 2,
  number_inpatient: 3,
  diag_1: "250.02",
  diag_2: "414",
  diag_3: "401",
  number_diagnoses: 9,
  max_glu_serum: ">300",
  A1Cresult: ">8",
  change: "Ch",
  diabetesMed: "Yes",
  insulin: "Up",
  metformin: "Steady",
  glipizide: "No",
  glyburide: "No",
  pioglitazone: "No",
  rosiglitazone: "No"
};

const SAMPLE_LOW_RISK = {
  race: "Caucasian",
  gender: "Male",
  age: "[40-50)",
  admission_type_id: 3,
  admission_source_id: 1,
  time_in_hospital: 2,
  payer_code: "HM",
  medical_specialty: "GeneralSurgery",
  num_lab_procedures: 25,
  num_procedures: 1,
  num_medications: 6,
  number_outpatient: 0,
  number_emergency: 0,
  number_inpatient: 0,
  diag_1: "540",
  diag_2: "401",
  diag_3: "250.00",
  number_diagnoses: 3,
  max_glu_serum: "None",
  A1Cresult: "None",
  change: "No",
  diabetesMed: "No",
  insulin: "No",
  metformin: "No",
  glipizide: "No",
  glyburide: "No",
  pioglitazone: "No",
  rosiglitazone: "No"
};

export const PredictionPage = () => {
  const location = useLocation();
  const [formData, setFormData] = useState(SAMPLE_HIGH_RISK);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [storedEncounters, setStoredEncounters] = useState([]);
  const [selectedEncounterId, setSelectedEncounterId] = useState('');

  useEffect(() => {
    fetchStoredEncounters();
    if (location.state?.encounter_id) {
      handleStoredPrediction(location.state.encounter_id);
    }
  }, [location]);

  const fetchStoredEncounters = async () => {
    try {
      const res = await api.get('/encounters?limit=15');
      setStoredEncounters(res.data.items || []);
    } catch (err) {
      console.error("Failed to load encounters", err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/predictions/predict', formData);
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction failed", err);
      const msg = err.response?.data?.detail || "Failed to generate readmission prediction. Please verify input parameters.";
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleStoredPrediction = async (encId) => {
    if (!encId) return;
    setLoading(true);
    setError(null);
    setSelectedEncounterId(encId);
    try {
      const res = await api.post(`/predictions/predict/${encId}`);
      setPrediction(res.data);
    } catch (err) {
      console.error("Stored prediction failed", err);
      setError(err.response?.data?.detail || "Failed to run prediction on stored encounter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-cyan-400" /> Readmission Risk Prediction & Clinical Decision Support
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inference using validated XGBoost Model (187 Safe Pre-discharge Clinical Features)
          </p>
        </div>

        {/* Action Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFormData(SAMPLE_HIGH_RISK)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>Load High-Risk Patient Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(SAMPLE_LOW_RISK)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Load Low-Risk Patient Profile</span>
          </button>
        </div>
      </div>

      {/* Quick Select Ingested Encounter */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <History className="h-4 w-4 text-cyan-400" />
          <span>Or evaluate an ingested clinical encounter:</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedEncounterId}
            onChange={(e) => {
              setSelectedEncounterId(e.target.value);
              if (e.target.value) handleStoredPrediction(e.target.value);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">-- Choose Ingested Encounter --</option>
            {storedEncounters.map(enc => (
              <option key={enc.id} value={enc.encounter_id}>
                #{enc.encounter_id} (Patient #{enc.patient_nbr} - {enc.medical_specialty || 'General'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <form onSubmit={handleCustomSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Patient Demographics */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" /> 1. Patient Demographics & Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Race / Demographic</label>
                <select
                  value={formData.race}
                  onChange={(e) => handleInputChange('race', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="Caucasian">Caucasian</option>
                  <option value="AfricanAmerican">African American</option>
                  <option value="Hispanic">Hispanic</option>
                  <option value="Asian">Asian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Age Bracket</label>
                <select
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="[0-10)">[0-10) Years</option>
                  <option value="[10-20)">[10-20) Years</option>
                  <option value="[20-30)">[20-30) Years</option>
                  <option value="[30-40)">[30-40) Years</option>
                  <option value="[40-50)">[40-50) Years</option>
                  <option value="[50-60)">[50-60) Years</option>
                  <option value="[60-70)">[60-70) Years</option>
                  <option value="[70-80)">[70-80) Years</option>
                  <option value="[80-90)">[80-90) Years</option>
                  <option value="[90-100)">[90-100) Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Hospital Admission Context */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Building className="h-4 w-4 text-cyan-400" /> 2. Admission & Hospital Context
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Admission Type</label>
                <select
                  value={formData.admission_type_id}
                  onChange={(e) => handleInputChange('admission_type_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value={1}>1 - Emergency</option>
                  <option value={2}>2 - Urgent</option>
                  <option value={3}>3 - Elective</option>
                  <option value={6}>6 - Trauma Center</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Admission Source</label>
                <select
                  value={formData.admission_source_id}
                  onChange={(e) => handleInputChange('admission_source_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value={7}>7 - Emergency Room</option>
                  <option value={1}>1 - Physician Referral</option>
                  <option value={2}>2 - Clinic Referral</option>
                  <option value={4}>4 - Transfer from Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payer Code</label>
                <select
                  value={formData.payer_code}
                  onChange={(e) => handleInputChange('payer_code', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="MC">Medicare (MC)</option>
                  <option value="MD">Medicaid (MD)</option>
                  <option value="HM">HMO (HM)</option>
                  <option value="BC">Blue Cross (BC)</option>
                  <option value="SP">Self Pay (SP)</option>
                  <option value="?">Unknown / Other (?)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Medical Specialty</label>
                <select
                  value={formData.medical_specialty}
                  onChange={(e) => handleInputChange('medical_specialty', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="InternalMedicine">Internal Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="GeneralSurgery">General Surgery</option>
                  <option value="Family/GeneralPractice">Family Practice</option>
                  <option value="ObstetricsandGynecology">Obstetrics & Gynecology</option>
                  <option value="?">Unknown Specialty (?)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">
                  Time in Hospital: <span className="text-cyan-400 font-bold">{formData.time_in_hospital} Days</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={formData.time_in_hospital}
                  onChange={(e) => handleInputChange('time_in_hospital', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Procedures & Diagnoses */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" /> 3. Clinical Procedures & Diagnoses
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Lab Procedures</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={formData.num_lab_procedures}
                  onChange={(e) => handleInputChange('num_lab_procedures', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Non-Lab Procedures</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.num_procedures}
                  onChange={(e) => handleInputChange('num_procedures', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Medications</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.num_medications}
                  onChange={(e) => handleInputChange('num_medications', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Diagnoses Count</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={formData.number_diagnoses}
                  onChange={(e) => handleInputChange('number_diagnoses', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Primary ICD-9 (diag_1)</label>
                <input
                  type="text"
                  value={formData.diag_1}
                  onChange={(e) => handleInputChange('diag_1', e.target.value)}
                  placeholder="e.g. 250.02 (Diabetes)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Secondary ICD-9 (diag_2)</label>
                <input
                  type="text"
                  value={formData.diag_2}
                  onChange={(e) => handleInputChange('diag_2', e.target.value)}
                  placeholder="e.g. 414 (Circulatory)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Tertiary ICD-9 (diag_3)</label>
                <input
                  type="text"
                  value={formData.diag_3}
                  onChange={(e) => handleInputChange('diag_3', e.target.value)}
                  placeholder="e.g. 401 (Hypertension)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Prior Healthcare Utilization */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-cyan-400" /> 4. Prior 12-Month Healthcare Utilization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Outpatient Visits</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.number_outpatient}
                  onChange={(e) => handleInputChange('number_outpatient', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Emergency ER Visits</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.number_emergency}
                  onChange={(e) => handleInputChange('number_emergency', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Inpatient Admissions</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.number_inpatient}
                  onChange={(e) => handleInputChange('number_inpatient', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Diabetes Glycemic Results & Regimen Change */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" /> 5. Glycemic Lab Results & Regimen Change
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Max Serum Glucose</label>
                <select
                  value={formData.max_glu_serum}
                  onChange={(e) => handleInputChange('max_glu_serum', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="None">None</option>
                  <option value="Norm">Norm</option>
                  <option value=">200">&gt; 200 mg/dL</option>
                  <option value=">300">&gt; 300 mg/dL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">A1C Test Result</label>
                <select
                  value={formData.A1Cresult}
                  onChange={(e) => handleInputChange('A1Cresult', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="None">None</option>
                  <option value="Norm">Norm</option>
                  <option value=">7">&gt; 7%</option>
                  <option value=">8">&gt; 8%</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Medication Change</label>
                <select
                  value={formData.change}
                  onChange={(e) => handleInputChange('change', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="No">No (Unchanged)</option>
                  <option value="Ch">Ch (Changed Dosage)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Diabetes Med Prescribed</label>
                <select
                  value={formData.diabetesMed}
                  onChange={(e) => handleInputChange('diabetesMed', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Key Diabetes Medication Administration */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Pill className="h-4 w-4 text-purple-400" /> 6. Key Medication Administration Protocol
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {[
                { label: 'Insulin', key: 'insulin' },
                { label: 'Metformin', key: 'metformin' },
                { label: 'Glipizide', key: 'glipizide' },
                { label: 'Glyburide', key: 'glyburide' },
                { label: 'Pioglitazone', key: 'pioglitazone' },
                { label: 'Rosiglitazone', key: 'rosiglitazone' }
              ].map((m) => (
                <div key={m.key}>
                  <label className="block text-slate-400 font-medium mb-1">{m.label}</label>
                  <select
                    value={formData[m.key] || 'No'}
                    onChange={(e) => handleInputChange(m.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Executing XGBoost Inference Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Calculate Readmission Risk & Generate CDSS Plan</span>
              </>
            )}
          </button>
        </form>

        {/* Right Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          {prediction ? (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/20 animate-fade-in">
              {/* Main Risk Gauge */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  30-Day Readmission Risk Forecast
                </div>
                <div className="text-5xl font-extrabold text-cyan-400 font-mono tracking-tight">
                  {prediction.risk_percentage}%
                </div>

                {/* Risk Category Badge */}
                <div className="inline-block">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${
                    prediction.risk_category === 'High Risk'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : prediction.risk_category === 'Medium Risk'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {prediction.risk_category.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-slate-400 pt-1">
                  Target Outcome Class: <span className="text-slate-200 font-bold">{prediction.predicted_class_label === '<30' ? 'Early Readmission (<30 Days)' : 'No Early Readmission (<30d)'}</span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  {prediction.model_name} • {prediction.model_version}
                </div>
              </div>

              {/* Top Risk Factors */}
              {prediction.top_risk_factors?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Contributing Clinical Risk Factors</h4>
                  <div className="space-y-2">
                    {prediction.top_risk_factors.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-mono">{item.feature}</span>
                        <div className="text-right">
                          <div className="font-bold text-cyan-400">{item.value}</div>
                          <div className="text-[10px] text-slate-500">Weight: {(item.importance_weight * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CDSS Recommendations */}
              {prediction.cdss_recommendations?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4" /> Clinical Decision Support Recommendations
                  </h4>
                  <div className="space-y-3">
                    {prediction.cdss_recommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            {rec.category}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">{rec.rule_id}</span>
                        </div>
                        <div className="text-xs font-bold text-white">{rec.title}</div>
                        <div className="text-xs text-slate-300">{rec.description}</div>
                        <div className="text-[10px] text-cyan-400/80 italic pt-1">{rec.disclaimer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Safety Disclaimer */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{prediction.disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center space-y-3">
              <BrainCircuit className="h-12 w-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">Ready for Clinical Evaluation</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Fill out the 6 clinical form sections on the left or select an ingested encounter to calculate readmission risk.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
