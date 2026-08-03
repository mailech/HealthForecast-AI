import React from 'react';
import { X, Activity, AlertTriangle, FileText, Heart, Shield, Sparkles, User, Calendar, Stethoscope, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PatientDetailModal = () => {
  const { selectedPatient, setSelectedPatient, currentRoleKey, setActiveTab } = useAuth();

  if (!selectedPatient) return null;

  const isAnonymized = currentRoleKey === 'RESEARCHER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {isAnonymized ? `ANONYMIZED SUBJECT #${selectedPatient.id.replace('PT-', 'SUBJ-')}` : selectedPatient.name}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  selectedPatient.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  selectedPatient.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {selectedPatient.riskLevel} Risk ({selectedPatient.readmissionScore}%)
                </span>
              </h3>
              <p className="text-xs text-slate-400">Encounter ID: {selectedPatient.encounterId} • Status: {selectedPatient.status}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPatient(null)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Demographics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Age Bracket</span>
              <span className="font-semibold text-slate-200">{selectedPatient.ageGroup}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Gender</span>
              <span className="font-semibold text-slate-200">{selectedPatient.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Admission Type</span>
              <span className="font-semibold text-slate-200">{selectedPatient.admissionType}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Length of Stay</span>
              <span className="font-semibold text-slate-200">{selectedPatient.timeInHospital} Days</span>
            </div>
          </div>

          {/* Vitals & Clinical Indicators */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Clinical Lab & Vitals Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">HbA1c Test</span>
                <span className={`text-sm font-bold ${selectedPatient.a1cResult.includes('>') ? 'text-rose-400' : 'text-slate-200'}`}>
                  {selectedPatient.a1cResult}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Blood Glucose</span>
                <span className="text-sm font-bold text-slate-200">{selectedPatient.glucoseTest}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Lab Procedures</span>
                <span className="text-sm font-bold text-slate-200">{selectedPatient.numLabProcedures} tests</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Medication Count</span>
                <span className="text-sm font-bold text-slate-200">{selectedPatient.numMedications} rx</span>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary & Secondary Diagnosis</h4>
            <p className="text-sm font-medium text-cyan-300">{selectedPatient.primaryDiagnosis}</p>
            <p className="text-xs text-slate-400">{selectedPatient.secondaryDiagnosis}</p>
          </div>

          {/* AI Risk Drivers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Readmission Risk Drivers (SHAP Value Breakdown)
            </h4>
            <div className="space-y-2">
              {selectedPatient.aiRiskFactors.map((rf, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="text-slate-300 font-medium">{rf.factor}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    rf.impact.startsWith('+') ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {rf.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Care Recommendations */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-3">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              Clinical Decision Support Recommendations
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedPatient.careRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              setSelectedPatient(null);
              setActiveTab('risk-prediction');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
          >
            Launch Live AI Risk Simulator for this Patient
          </button>
          <button
            onClick={() => setSelectedPatient(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
