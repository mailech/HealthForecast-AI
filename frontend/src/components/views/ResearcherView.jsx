import React, { useState, useEffect } from 'react';
import {
  Database, ShieldCheck, Download, Filter, Sparkles,
  BarChart2, CheckCircle, FileSpreadsheet, EyeOff
} from 'lucide-react';
import CohortConstellation3D from '../three/CohortConstellation3D';
import { sound } from '../../utils/audio';

export default function ResearcherView({ currentUser }) {
  const [cohortPoints, setCohortPoints] = useState([]);
  const [treatmentData, setTreatmentData] = useState(null);
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    fetchResearcherData();
  }, []);

  const fetchResearcherData = async () => {
    setLoading(true);
    try {
      const authHeaders = { 'x-role': 'healthcare_researcher' };
      const [resPoints, resTreat, resPatients] = await Promise.all([
        fetch('/api/research/cohort-data', { headers: authHeaders }),
        fetch('/api/analytics/treatment-effectiveness', { headers: authHeaders }),
        fetch('/api/patients', { headers: authHeaders })
      ]);
      const dataPoints = await resPoints.json();
      const dataTreat = await resTreat.json();
      const dataPatients = await resPatients.json();

      setCohortPoints(Array.isArray(dataPoints) ? dataPoints : []);
      setTreatmentData(dataTreat && typeof dataTreat === 'object' ? dataTreat : null);
      setPatientsList(Array.isArray(dataPatients) ? dataPatients : []);
    } catch (e) {
      console.error(e);
      setCohortPoints([]);
      setPatientsList([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    sound.playSuccess();
    window.location.href = '/api/research/export?format=csv';
  };

  const downloadJSON = () => {
    sound.playSuccess();
    const jsonStr = JSON.stringify(cohortPoints, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diabetes_130_anonymized_cohort_manifold.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-lg">
            {currentUser?.avatar_initials || 'AT'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {currentUser?.full_name || 'Dr. Aris Thorne, PhD'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 border border-blue-500/40 text-blue-300">
                HEALTHCARE RESEARCHER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Epidemiology & Biostatistics • Diabetes 130-US Hospitals Cohort (10-Year Clinical Scope)
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs transition-all shadow-glow-cyan"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Research CSV
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-blue-500/40 hover:bg-blue-500/20 text-blue-300 font-semibold text-xs transition-all"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* HIPAA / Anonymization Notice */}
      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-3">
        <EyeOff className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div className="text-xs text-blue-200">
          <span className="font-bold">De-Identification Protocol Active:</span> All patient records have been scrubbed of Personally Identifiable Information (PII) per HIPAA Safe Harbor standard. MRNs binned into anonymous cohort identifiers.
        </div>
      </div>

      {/* 3D Patient Cohort Constellation Manifold */}
      <CohortConstellation3D
        cohortData={cohortPoints}
        onSelectPoint={(pt) => setSelectedPoint(pt)}
      />

      {/* Comparative Treatment Effectiveness Protocols */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            Comparative Treatment Effectiveness Protocols (Diabetes 130-US Hospitals)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Sample: 1,960 Encounters Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(treatmentData?.protocols || []).map((proto, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{proto.regimen}</h4>
                  <span className="text-xs text-slate-400 font-mono">Cohort Size: {proto.cohort_size} Patients</span>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  proto.readmission_rate_30d < 10 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  proto.readmission_rate_30d < 15 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  {proto.readmission_rate_30d}% Readmit
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">A1C Drop</div>
                  <div className="text-cyan-400 font-bold">-{proto.a1c_reduction_pct}%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Recovery Score</div>
                  <div className="text-emerald-400 font-bold">{proto.recovery_index}/100</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Renal Shield</div>
                  <div className="text-purple-400 font-bold">{proto.renal_protective_score}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anonymized Cohort Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Anonymized Inpatient Encounter Cohort Data
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">SUBJECT ID</th>
                <th className="pb-2">AGE BRACKET</th>
                <th className="pb-2">WARD CATEGORY</th>
                <th className="pb-2">LENGTH OF STAY</th>
                <th className="pb-2">PRIOR EMERGENCIES</th>
                <th className="pb-2">A1C STATUS</th>
                <th className="pb-2">30D READMISSION HAZARD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {patientsList.slice(0, 10).map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 text-cyan-300 font-bold">{pt.full_name}</td>
                  <td className="py-2.5 text-slate-300">[{pt.age - 5}-{pt.age + 5}) yrs</td>
                  <td className="py-2.5 text-slate-400">{pt.ward}</td>
                  <td className="py-2.5 text-slate-300">{pt.time_in_hospital || 4} days</td>
                  <td className="py-2.5 text-slate-300">{pt.number_emergency || 0} visits</td>
                  <td className="py-2.5">
                    {pt.high_a1c ? (
                      <span className="text-red-400 font-bold">&gt; 8.0% Elevated</span>
                    ) : (
                      <span className="text-emerald-400">Normal (&lt; 7.0%)</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pt.risk_category === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      pt.risk_category === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {pt.risk_score}% ({pt.risk_category})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
