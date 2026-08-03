import React, { useState } from 'react';
import { Stethoscope, Sparkles, CheckSquare, Calendar, ShieldCheck, Heart, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import { PATIENT_RECORDS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const ClinicalDecisionSupportView = () => {
  const { setSelectedPatient } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState(PATIENT_RECORDS[0].id);

  const patient = PATIENT_RECORDS.find(p => p.id === selectedPatientId) || PATIENT_RECORDS[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Clinical Decision Support & Care Recommendations
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PDF Module 5 Requirement
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            AI-generated personalized care plans, discharge readiness checklists, and risk mitigation protocols
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold pl-2">Select Active Case:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-cyan-300 font-bold focus:outline-none"
          >
            {PATIENT_RECORDS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.riskLevel} Risk - {p.readmissionScore}%)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Patient Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-white">{patient.name}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              patient.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
              patient.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {patient.readmissionScore}% Readmission Risk ({patient.riskLevel})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Primary: <span className="text-cyan-300 font-medium">{patient.primaryDiagnosis}</span> • Admission: {patient.admissionType}
          </p>
        </div>

        <button
          onClick={() => setSelectedPatient(patient)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition"
        >
          View Full Clinical Dossier
        </button>
      </div>

      {/* Grid: Recommendations & Discharge Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personalized Recommendations */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">AI Care Recommendations</h3>
          </div>

          <div className="space-y-3">
            {patient.careRecommendations.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-200">{rec}</p>
                  <p className="text-[11px] text-slate-400">High impact on reducing 30-day readmission probability.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discharge Support & Checklist */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Discharge Readiness Checklist</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-cyan-500 w-4 h-4 rounded" />
              <div>
                <span className="font-semibold text-slate-200 block">Medication Reconciliation</span>
                <span className="text-slate-400 text-[11px]">Pharmacist verified 22 prescriptions & insulin titration schedule</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-cyan-500 w-4 h-4 rounded" />
              <div>
                <span className="font-semibold text-slate-200 block">48-Hour Outpatient Telehealth Scheduled</span>
                <span className="text-slate-400 text-[11px]">Confirmed appointment with Dr. Sarah Jenkins</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input type="checkbox" className="accent-cyan-500 w-4 h-4 rounded" />
              <div>
                <span className="font-semibold text-slate-200 block">Remote Glucose Monitor Setup</span>
                <span className="text-slate-400 text-[11px]">Pending device activation before physical discharge</span>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert(`Discharge Protocol approved for ${patient.name}. Care plan transmitted to EHR!`)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20"
            >
              Authorize & Approve Clinical Care Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
