import React, { useState } from 'react';
import { Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { RiskBadge } from '../common/RiskBadge';
import {
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  Printer,
  Calendar,
  AlertOctagon,
  Pill,
  Heart,
  Stethoscope,
  Clock,
  Download,
  CheckCircle2
} from 'lucide-react';

interface ClinicalDecisionSupportViewProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSelectPatient: (patient: Patient) => void;
}

export const ClinicalDecisionSupportView: React.FC<ClinicalDecisionSupportViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient
}) => {
  const { isAnonymizedView, currentUser } = useAuth();
  const initialPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const [currentPatient, setCurrentPatient] = useState<Patient>(initialPatient);

  // Recommendations checklist state
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [customRecText, setCustomRecText] = useState('');
  const [customRecPriority, setCustomRecPriority] = useState<'Urgent' | 'High' | 'Medium'>('High');
  const [customRecTime, setCustomRecTime] = useState('Within 48 hours');
  const [showAddForm, setShowAddForm] = useState(false);
  const [localRecs, setLocalRecs] = useState(currentPatient.recommendations);
  const [printSuccessNotice, setPrintSuccessNotice] = useState(false);

  const handlePatientChange = (patientId: string) => {
    const found = patients.find(p => p.id === patientId);
    if (found) {
      setCurrentPatient(found);
      setLocalRecs(found.recommendations);
      setCompletedItems({});
    }
  };

  const toggleComplete = (id: string) => {
    setCompletedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCustomRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRecText) return;
    const newRec = {
      id: `REC-CUSTOM-${Date.now()}`,
      category: 'Physician Order',
      priority: customRecPriority,
      recommendation: customRecText,
      rationale: `Clinician added recommendation by ${currentUser.name}`,
      timeframe: customRecTime
    };
    setLocalRecs([newRec, ...localRecs]);
    setCustomRecText('');
    setShowAddForm(false);
  };

  const handlePrintPlan = () => {
    setPrintSuccessNotice(true);
    setTimeout(() => setPrintSuccessNotice(false), 3500);
  };

  const displayName = isAnonymizedView() ? (currentPatient.anonymizedId || 'PT-ANON') : currentPatient.name;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Clinical Decision Support & Care Planning
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              CDS Rule Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evidence-based discharge care coordination and post-acute readmission prevention guidance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPlan}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Patient Discharge Plan</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner type="clinical" />

      {printSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Care Plan formatted for EHR discharge packet. Ready for clinician signature and patient handover.</span>
        </div>
      )}

      {/* Patient Dossier Selector Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block mb-1">
            Active Inpatient for Care Plan Generation
          </span>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {isAnonymizedView() ? 'ANON' : currentPatient.id}
            </span>
            <RiskBadge level={currentPatient.riskLevel} score={currentPatient.riskScore} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Diagnosis: <strong className="text-white">{currentPatient.primaryDiagnosis}</strong> • {currentPatient.department} • Stay Day {currentPatient.lengthOfStay}
          </p>
        </div>

        <div className="min-w-[240px]">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Switch Patient</label>
          <select
            value={currentPatient.id}
            onChange={(e) => handlePatientChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-hidden"
          >
            {patients.map((p) => {
              const pName = isAnonymizedView() ? (p.anonymizedId || 'PT-ANON') : p.name;
              return (
                <option key={p.id} value={p.id}>
                  {pName} ({p.riskLevel} - {p.riskScore}%)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Clinical Guidance Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Follow-up Window</h4>
          <p className="text-xs text-slate-600 mt-1">
            High-risk status mandates in-person ambulatory visit within <strong>7 calendar days</strong> of exit.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-2">
            <Pill className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Polypharmacy Check</h4>
          <p className="text-xs text-slate-600 mt-1">
            Current active medications ({currentPatient.medicationCount}). Pharmacist reconciliation required before discharge.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2">
            <Heart className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Targeted Monitoring</h4>
          <p className="text-xs text-slate-600 mt-1">
            Home biometric surveillance for blood glucose levels, daily weight logging, and BP checks.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold mb-2">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Red Flag Triggers</h4>
          <p className="text-xs text-slate-600 mt-1">
            Provide patient card: rapid weight gain &gt; 3 lbs in 48h, fever &gt; 100.4°F, or sustained blood sugar &gt; 250 mg/dL.
          </p>
        </div>
      </div>

      {/* Proactive Recommendations Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Personalized Discharge Interventions Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and sign off on proactive clinical items designed to mitigate 30-day readmission
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Clinical Order</span>
          </button>
        </div>

        {/* Add custom order form */}
        {showAddForm && (
          <form onSubmit={handleAddCustomRec} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Add Clinician-Specified Care Plan Item</h4>
            <div>
              <input
                type="text"
                required
                placeholder="e.g. Schedule Home Health nurse wound assessment within 48h"
                value={customRecText}
                onChange={(e) => setCustomRecText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
                <select
                  value={customRecPriority}
                  onChange={(e) => setCustomRecPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Execution Timeframe</label>
                <input
                  type="text"
                  value={customRecTime}
                  onChange={(e) => setCustomRecTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded hover:bg-sky-700 cursor-pointer"
              >
                Save to Care Plan
              </button>
            </div>
          </form>
        )}

        {/* Checklist */}
        <div className="space-y-3">
          {localRecs.map((rec) => {
            const isDone = completedItems[rec.id];

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/80 hover:border-sky-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleComplete(rec.id)}
                    className="mt-0.5 text-slate-400 hover:text-sky-600 cursor-pointer"
                    aria-label="Toggle recommendation completion"
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          rec.priority === 'Urgent'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        Window: {rec.timeframe}
                      </span>
                      <span className="text-[11px] text-slate-400">• Category: {rec.category}</span>
                    </div>
                    <p
                      className={`text-xs font-bold mt-1 ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {rec.recommendation}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{rec.rationale}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-[11px] font-semibold ${
                      isDone ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {isDone ? 'Completed' : 'Pending Action'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
