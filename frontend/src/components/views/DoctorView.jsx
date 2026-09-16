import React, { useState, useEffect } from 'react';
import {
  Activity, Heart, AlertTriangle, CheckCircle, ShieldAlert,
  FileText, Sliders, RefreshCw, Printer, Download, Sparkles, User, ChevronRight
} from 'lucide-react';
import PatientBodyTwin3D from '../three/PatientBodyTwin3D';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

export default function DoctorView({ currentUser }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeReport, setDischargeReport] = useState(null);

  // Simulation Controls State
  const [simParams, setSimParams] = useState({
    time_in_hospital: 5,
    number_emergency: 1,
    high_a1c: 1,
    insulin_changed: 1,
    num_medications: 16,
    comorbidity_renal: 0,
    comorbidity_circulatory: 1
  });
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [riskFilter]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const url = riskFilter === 'All' ? '/api/patients' : `/api/patients?risk=${riskFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPatients(data);
      if (data.length > 0 && !selectedPatient) {
        selectPatient(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (p) => {
    setSelectedPatient(p);
    sound.playClick();
    try {
      const res = await fetch(`/api/patients/${p.id}`);
      const data = await res.json();
      setPatientDetail(data);

      // Initialize simulator with patient's baseline encounter
      const enc = data.encounter || {};
      setSimParams({
        time_in_hospital: enc.time_in_hospital || 5,
        number_emergency: enc.number_emergency || 1,
        high_a1c: enc.high_a1c || 0,
        insulin_changed: enc.insulin_changed || 0,
        num_medications: enc.num_medications || 15,
        comorbidity_renal: enc.comorbidity_renal || 0,
        comorbidity_circulatory: enc.comorbidity_circulatory || 1
      });
      setSimResult(data.prediction);
    } catch (e) {
      console.error(e);
    }
  };

  const runSimulation = async (updatedParams) => {
    setSimulating(true);
    try {
      const res = await fetch('/api/predict/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient?.id,
          age_num: selectedPatient?.age || 65,
          ...updatedParams
        })
      });
      const data = await res.json();
      setSimResult(data);
      if (data.risk_category === 'HIGH') sound.playAlert();
      else sound.playScan();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleSliderChange = (field, val) => {
    const updated = { ...simParams, [field]: val };
    setSimParams(updated);
    runSimulation(updated);
  };

  const toggleRecommendation = async (recId) => {
    sound.playClick();
    try {
      await fetch(`/api/recommendations/${recId}/toggle`, { method: 'POST' });
      // Refresh patient detail
      if (selectedPatient) {
        const res = await fetch(`/api/patients/${selectedPatient.id}`);
        const data = await res.json();
        setPatientDetail(data);
      }
    } catch (e) {}
  };

  const openDischargePlan = async () => {
    if (!selectedPatient) return;
    sound.playClick();
    try {
      const res = await fetch(`/api/patients/${selectedPatient.id}/discharge-report`);
      const report = await res.json();
      setDischargeReport(report);
      setShowDischargeModal(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
    }
  };

  const currentPred = simResult || selectedPatient;

  return (
    <div className="space-y-6">
      {/* Top Banner with Doctor Context */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
            {currentUser?.avatar_initials || 'EV'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {currentUser?.full_name || 'Dr. Elena Vance, MD'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                ATTENDING PHYSICIAN
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Department: {currentUser?.department || 'Endocrinology & Cardiology'} • Clinical Readmission Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openDischargePlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs shadow-glow-cyan transition-all"
          >
            <FileText className="w-4 h-4 text-black" />
            Generate Discharge Mitigation Plan
          </button>
        </div>
      </div>

      {/* Main Grid: Left Roster & Right 3D Intelligence Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Roster (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Inpatient Roster ({patients.length})
              </h3>
              <button onClick={fetchPatients} className="p-1 hover:text-cyan-400 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Risk Filters */}
            <div className="flex items-center gap-1.5 mb-3">
              {['All', 'HIGH', 'MODERATE', 'LOW'].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`flex-1 py-1 text-[11px] font-mono rounded-lg transition-all ${
                    riskFilter === risk
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <input
              type="text"
              placeholder="Search name, MRN, diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 mb-3"
            />

            {/* Patient Cards List */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {patients
                .filter(p => !searchQuery || p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.mrn.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => {
                  const isSelected = selectedPatient?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-glow-cyan'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{p.full_name}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          p.risk_category === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          p.risk_category === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {p.risk_score}% READMIT
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>{p.mrn} • {p.age}y {p.gender[0]}</span>
                        <span className="font-mono text-[11px] text-slate-500">{p.bed_number}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                        {p.primary_diagnosis}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: 3D Holographic Twin & Real-Time Simulation (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3D Hologram Patient Body Twin */}
          <PatientBodyTwin3D
            patient={selectedPatient}
            riskScore={currentPred?.readmission_risk_score ?? selectedPatient?.risk_score}
            riskCategory={currentPred?.risk_category ?? selectedPatient?.risk_category}
            organRisks={currentPred?.organ_risks || selectedPatient?.organ_risks}
          />

          {/* Real-Time "What-If" Clinical Simulator */}
          <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Real-Time "What-If" Clinical Risk Simulator
                </h4>
                <p className="text-xs text-slate-400">
                  Adjust patient biomarker & hospitalization parameters to simulate instant readmission hazard shifts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Forecast Status:</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  simResult?.risk_category === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  simResult?.risk_category === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {simResult?.risk_score ?? selectedPatient?.risk_score}% ({simResult?.risk_category ?? selectedPatient?.risk_category})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Slider 1: Length of Stay */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Hospital Stay Duration:</span>
                  <span className="text-cyan-400 font-bold">{simParams.time_in_hospital} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={simParams.time_in_hospital}
                  onChange={(e) => handleSliderChange('time_in_hospital', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2: Prior Emergency Admissions */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Prior Emergency Encounters:</span>
                  <span className="text-cyan-400 font-bold">{simParams.number_emergency} Visits</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={simParams.number_emergency}
                  onChange={(e) => handleSliderChange('number_emergency', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3: Total Active Medications */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Active Medication Burden:</span>
                  <span className="text-cyan-400 font-bold">{simParams.num_medications} Meds</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="35"
                  value={simParams.num_medications}
                  onChange={(e) => handleSliderChange('num_medications', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggle Buttons: Biomarker Flags */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => handleSliderChange('high_a1c', simParams.high_a1c === 1 ? 0 : 1)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    simParams.high_a1c === 1
                      ? 'bg-red-950/70 border-red-500/60 text-red-300 shadow-glow-red'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  HbA1c &gt; 8.0% {simParams.high_a1c === 1 ? '(Critical)' : '(Normal)'}
                </button>

                <button
                  onClick={() => handleSliderChange('insulin_changed', simParams.insulin_changed === 1 ? 0 : 1)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    simParams.insulin_changed === 1
                      ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-glow-amber'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Insulin Titration {simParams.insulin_changed === 1 ? '(Active)' : '(Stable)'}
                </button>
              </div>
            </div>
          </div>

          {/* Explainable AI Risk Factor Drivers */}
          {currentPred?.risk_drivers && currentPred.risk_drivers.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Explainable AI: Key Readmission Hazard Contributors
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentPred.risk_drivers.map((rf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-red-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{rf.factor}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rf.category}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400">{rf.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Decision Support & Recommendations */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              Clinical Decision Support & Care Protocol Checklist
            </h4>
            <div className="space-y-2.5">
              {(patientDetail?.recommendations || []).map((rec) => {
                const isDone = rec.status === 'COMPLETED';
                return (
                  <div
                    key={rec.id}
                    onClick={() => toggleRecommendation(rec.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-600'
                      }`}>
                        {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                          {rec.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{rec.description}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      rec.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Discharge Planning Modal */}
      {showDischargeModal && dischargeReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider">HEALTHFORECAST AI CLINICAL REPORT</span>
                <h3 className="text-xl font-bold text-white">Discharge Planning & 30-Day Readmission Mitigation Plan</h3>
                <p className="text-xs text-slate-400 font-mono">Report ID: {dischargeReport.report_id} • Generated: {dischargeReport.generated_at}</p>
              </div>
              <button
                onClick={() => setShowDischargeModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            {/* Patient Header */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500">PATIENT NAME</span>
                <div className="text-white font-bold">{dischargeReport.patient.full_name}</div>
              </div>
              <div>
                <span className="text-slate-500">MRN</span>
                <div className="text-white font-bold">{dischargeReport.patient.mrn}</div>
              </div>
              <div>
                <span className="text-slate-500">AGE / GENDER</span>
                <div className="text-white font-bold">{dischargeReport.patient.age}y / {dischargeReport.patient.gender}</div>
              </div>
              <div>
                <span className="text-slate-500">ATTENDING</span>
                <div className="text-cyan-400 font-bold">{dischargeReport.attending_physician}</div>
              </div>
            </div>

            {/* Risk Assessment Summary */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400">AI 30-DAY READMISSION FORECAST</div>
                <div className="text-2xl font-black text-red-400 font-mono">
                  {dischargeReport.readmission_forecast.readmission_risk_score}% ({dischargeReport.readmission_forecast.risk_category} RISK)
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Recommendation Level: {dischargeReport.readmission_forecast.recommendation_level}
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="text-slate-400">Recovery Index</div>
                <div className="text-xl font-bold text-emerald-400">{dischargeReport.readmission_forecast.treatment_effectiveness_score} / 100</div>
              </div>
            </div>

            {/* Discharge Checklist */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase font-mono text-slate-300">Mandatory Transition Checklist</h5>
              {dischargeReport.discharge_checklist.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-200">{item.task}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                Print Formatted Clinical PDF
              </button>
              <button
                onClick={() => {
                  sound.playSuccess();
                  setShowDischargeModal(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold shadow-glow-cyan"
              >
                <CheckCircle className="w-4 h-4 text-black" />
                Sign & Finalize Discharge Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
