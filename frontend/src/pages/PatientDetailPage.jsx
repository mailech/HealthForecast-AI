import React from 'react';
import { Modal } from '../components/Modal';
import { RiskGauge } from '../components/RiskGauge';
import { User, Activity, AlertCircle, FileText, CheckCircle2, Calendar, Pill, Shield } from 'lucide-react';

export const PatientDetailPage = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <Modal
      isOpen={!!patient}
      onClose={onClose}
      title={`Patient Intelligence Profile: ${patient.first_name} ${patient.last_name} (${patient.patient_code})`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-slate-700">
        {/* Top Header Card */}
        <div className="grid md:grid-cols-3 gap-6 items-center p-6 rounded-2xl bg-slate-50 text-slate-800/90 border border-slate-200">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-500">
                {patient.patient_code}
              </span>
              <span className="text-xs text-slate-500">• Admitted: {patient.admission_date}</span>
            </div>
            
            <h2 className="text-2xl font-extrabold text-slate-900">{patient.first_name} {patient.last_name}</h2>
            <p className="text-xs text-slate-500">{patient.age} years old • {patient.gender} • Department of {patient.department}</p>
            
            <div className="inline-block mt-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
              <span className="text-slate-500">Primary Diagnosis: </span>
              <span className="text-blue-500">{patient.primary_diagnosis}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <RiskGauge score={patient.readmission_risk_score} size={150} />
          </div>
        </div>

        {/* Clinical Indexes & Vitals */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/60 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold">LACE Index Score</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{patient.lace_index} <span className="text-xs text-slate-500 font-normal">/ 19</span></p>
          </div>
          <div className="p-4 rounded-xl bg-white/60 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Charlson Comorbidity</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{patient.charlson_index}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/60 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold">HbA1c Level</p>
            <p className={`text-2xl font-extrabold mt-1 ${patient.hba1c > 8 ? 'text-rose-400' : 'text-emerald-400'}`}>{patient.hba1c}%</p>
          </div>
          <div className="p-4 rounded-xl bg-white/60 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Polypharmacy</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{patient.polypharmacy_count} <span className="text-xs text-slate-500 font-normal">Meds</span></p>
          </div>
        </div>

        {/* Medical History Timeline */}
        <div className="p-5 rounded-2xl bg-slate-50 text-slate-800/60 border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clinical Event Timeline</h4>
          <div className="space-y-3">
            <div className="flex gap-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
              <div>
                <p className="font-bold text-slate-900">Current Inpatient Admission</p>
                <p className="text-slate-500 text-[11px]">{patient.admission_date} — Inpatient stay ({patient.length_of_stay} days)</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5"></span>
              <div>
                <p className="font-bold text-slate-900">Emergency Department Visit</p>
                <p className="text-slate-500 text-[11px]">{patient.emergency_visits} recorded ED encounters in prior 12 months</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
