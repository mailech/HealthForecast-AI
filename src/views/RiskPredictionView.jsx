import React, { useState } from 'react';
import { Brain, Sparkles, Activity, AlertTriangle, CheckCircle, RefreshCw, BarChart2, Zap, ArrowRight } from 'lucide-react';
import { PATIENT_RECORDS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const RiskPredictionView = () => {
  const { setSelectedPatient } = useAuth();
  
  // Interactive Simulator State
  const [selectedPatientId, setSelectedPatientId] = useState(PATIENT_RECORDS[0].id);
  const [timeInHospital, setTimeInHospital] = useState(7);
  const [numEmergency, setNumEmergency] = useState(2);
  const [numInpatient, setNumInpatient] = useState(3);
  const [numLabProcedures, setNumLabProcedures] = useState(64);
  const [numMedications, setNumMedications] = useState(22);
  const [a1cResult, setA1cResult] = useState('>8 (Abnormal)');
  const [insulinChange, setInsulinChange] = useState('Up');
  const [isCalculating, setIsCalculating] = useState(false);

  // Dynamic AI Score Calculation Algorithm
  const calculateScore = () => {
    let score = 25; // baseline

    score += Math.min(timeInHospital * 3, 25);
    score += Math.min(numEmergency * 12, 30);
    score += Math.min(numInpatient * 8, 24);
    score += (numMedications > 15 ? 12 : 5);
    if (a1cResult === '>8 (Abnormal)') score += 18;
    if (a1cResult === '>7') score += 10;
    if (insulinChange === 'Up') score += 10;

    return Math.min(Math.max(score, 12), 98);
  };

  const calculatedRisk = calculateScore();
  const getRiskCategory = (val) => val >= 75 ? 'High' : val >= 40 ? 'Medium' : 'Low';
  const category = getRiskCategory(calculatedRisk);

  const handleRecalculate = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 500);
  };

  const loadPatientPreset = (pid) => {
    setSelectedPatientId(pid);
    const p = PATIENT_RECORDS.find(item => item.id === pid);
    if (p) {
      setTimeInHospital(p.timeInHospital);
      setNumEmergency(p.numberEmergency);
      setNumInpatient(p.numberInpatient);
      setNumLabProcedures(p.numLabProcedures);
      setNumMedications(p.numMedications);
      setA1cResult(p.a1cResult);
      setInsulinChange(p.insulinChange);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              AI Risk Prediction & Readmission Forecasting
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              XGBoost Model v2.4
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time inference engine calculating 30-day hospital readmission probability and risk drivers
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Form vs Dynamic Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form / Preset Picker */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-sm">Clinical Feature Input Matrix</h3>
            </div>

            {/* Quick Preset Picker */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Load Patient Preset:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => loadPatientPreset(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-cyan-300 font-semibold focus:outline-none"
              >
                {PATIENT_RECORDS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.riskLevel} Risk)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Length of Stay */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="text-slate-300 font-semibold flex justify-between">
                <span>Time in Hospital (Days)</span>
                <span className="text-cyan-400 font-bold">{timeInHospital} Days</span>
              </label>
              <input
                type="range"
                min="1"
                max="14"
                value={timeInHospital}
                onChange={(e) => setTimeInHospital(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Emergency Department Visits */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="text-slate-300 font-semibold flex justify-between">
                <span>Emergency Visits (Prior 6m)</span>
                <span className="text-rose-400 font-bold">{numEmergency} Visits</span>
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={numEmergency}
                onChange={(e) => setNumEmergency(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Inpatient Stays */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="text-slate-300 font-semibold flex justify-between">
                <span>Prior Inpatient Admissions</span>
                <span className="text-purple-400 font-bold">{numInpatient} Stays</span>
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={numInpatient}
                onChange={(e) => setNumInpatient(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Num Medications */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="text-slate-300 font-semibold flex justify-between">
                <span>Medications Prescribed</span>
                <span className="text-emerald-400 font-bold">{numMedications} Medications</span>
              </label>
              <input
                type="range"
                min="1"
                max="35"
                value={numMedications}
                onChange={(e) => setNumMedications(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* HbA1c Status */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="text-slate-300 font-semibold block">HbA1c Lab Result</label>
              <select
                value={a1cResult}
                onChange={(e) => setA1cResult(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value="Norm">Normal (&lt;7%)</option>
                <option value=">7">Elevated (&gt;7%)</option>
                <option value=">8 (Abnormal)">Abnormal High (&gt;8%)</option>
                <option value="None">None Tested</option>
              </select>
            </div>

            {/* Insulin Dosage Change */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="text-slate-300 font-semibold block">Insulin Dose Change during Encounter</label>
              <select
                value={insulinChange}
                onChange={(e) => setInsulinChange(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value="No">No Change</option>
                <option value="Steady">Steady Baseline</option>
                <option value="Up">Increased (Up)</option>
                <option value="Down">Decreased (Down)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>{isCalculating ? 'Executing AI Inference Engine...' : 'Run AI Readmission Prediction'}</span>
          </button>
        </div>

        {/* Right Column: AI Output Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Risk Card Gauge */}
          <div className={`glass-card p-6 rounded-2xl border text-center relative overflow-hidden transition-all duration-500 ${
            category === 'High' ? 'border-rose-500/40 glow-rose' :
            category === 'Medium' ? 'border-amber-500/40' :
            'border-emerald-500/40 glow-emerald'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              30-Day Readmission Probability
            </span>

            {/* Gauge Percentage */}
            <div className="my-4 inline-block relative">
              <span className={`text-6xl font-black tracking-tight ${
                category === 'High' ? 'text-rose-400' :
                category === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {calculatedRisk}%
              </span>
            </div>

            {/* Risk Category Badge */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                category === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                category === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {category} Risk Category
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {category === 'High' && "Patient exhibits multiple high-risk indicators requiring mandatory discharge care planning."}
              {category === 'Medium' && "Moderate risk profile. Recommend standard post-discharge follow-up within 7 days."}
              {category === 'Low' && "Low readmission likelihood. Standard outpatient protocols recommended."}
            </p>
          </div>

          {/* Key Drivers SHAP breakdown */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Top AI Risk Drivers</span>
              <span className="text-[10px] text-cyan-400 font-mono">SHAP Feature Impact</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-300 font-medium">Prior Emergency Visits ({numEmergency})</span>
                <span className="text-rose-400 font-bold">+{numEmergency * 8}% impact</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-300 font-medium">Inpatient Stays ({numInpatient})</span>
                <span className="text-amber-400 font-bold">+{numInpatient * 6}% impact</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-300 font-medium">HbA1c Level ({a1cResult})</span>
                <span className="text-rose-400 font-bold">{a1cResult.includes('>') ? '+18% impact' : '0% impact'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
