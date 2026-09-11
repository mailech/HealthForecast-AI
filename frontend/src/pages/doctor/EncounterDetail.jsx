import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Stethoscope,
  ArrowLeft,
  Activity,
  Pill,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  FileText
} from 'lucide-react';

export const EncounterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/encounters/${id}`);
      setEncounter(res.data);
      // Auto-trigger prediction if encounter is loaded
      if (res.data?.encounter_id) {
        fetchPrediction(res.data.encounter_id);
      }
    } catch (err) {
      console.error("Failed to load encounter detail", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (encounterId) => {
    setPredLoading(true);
    try {
      const res = await api.post(`/predictions/predict/${encounterId}`);
      setPrediction(res.data);
    } catch (err) {
      console.error("Failed to fetch live prediction", err);
    } finally {
      setPredLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading clinical encounter details...</div>;
  }

  if (!encounter) {
    return <div className="py-20 text-center text-rose-400">Clinical Encounter record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <Link to="/doctor/dashboard" className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Clinical Workstation</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor/predict', { state: { encounter_id: encounter.encounter_id } })}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Open in CDSS Workstation</span>
          </button>
          <div className="text-xs text-slate-400 font-mono">Encounter ID: #{encounter.encounter_id}</div>
        </div>
      </div>

      {/* Patient Overview Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Patient #{encounter.patient_nbr}</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {encounter.gender} • {encounter.age_group}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Medical Specialty: <span className="text-slate-200 font-semibold">{encounter.medical_specialty || 'Internal Medicine'}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-xs text-slate-400">Actual Dataset Outcome</div>
            <div className={`text-sm font-extrabold mt-0.5 ${
              encounter.actual_readmitted === '<30' ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {encounter.actual_readmitted === '<30' ? 'Readmitted <30 Days' : encounter.actual_readmitted === '>30' ? 'Readmitted >30 Days' : 'No Readmission Recorded'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clinical Metrics & Diagnoses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinical Vital Metrics Grid */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" /> Hospital Stay Clinical Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 mb-1">Time in Hospital</div>
                <div className="text-xl font-bold text-white">{encounter.time_in_hospital} Days</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 mb-1">Lab Procedures</div>
                <div className="text-xl font-bold text-cyan-400">{encounter.num_lab_procedures}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 mb-1">Medications</div>
                <div className="text-xl font-bold text-purple-400">{encounter.num_medications}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 mb-1">Prior Inpatient Stays</div>
                <div className="text-xl font-bold text-amber-400">{encounter.number_inpatient}</div>
              </div>
            </div>
          </div>

          {/* Diagnosis Codes (ICD-9) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">ICD-9 Primary & Secondary Diagnoses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Primary Diagnosis (diag_1)</div>
                <div className="text-base font-mono font-bold text-cyan-400 mt-1">{encounter.diag_1 || '250.00'}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Secondary (diag_2)</div>
                <div className="text-base font-mono font-bold text-slate-300 mt-1">{encounter.diag_2 || '401.9'}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Additional (diag_3)</div>
                <div className="text-base font-mono font-bold text-slate-300 mt-1">{encounter.diag_3 || '272.4'}</div>
              </div>
            </div>
          </div>

          {/* Diabetes Medication Regime */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Pill className="h-4 w-4 text-purple-400" /> Diabetes Drug Administration Protocol
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { name: 'Insulin', value: encounter.insulin },
                { name: 'Metformin', value: encounter.metformin },
                { name: 'Glipizide', value: encounter.glipizide },
                { name: 'Glyburide', value: encounter.glyburide },
                { name: 'A1C Result', value: encounter.a1c_result },
                { name: 'Max Serum Glu', value: encounter.max_glu_serum },
                { name: 'Med Change', value: encounter.change_status },
                { name: 'Diabetes Med', value: encounter.diabetes_med }
              ].map((drug, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="text-slate-400 text-[11px] font-medium">{drug.name}</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{drug.value || 'No'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real XGBoost Live Risk Prediction & CDSS */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span>AI Decision-Support Intelligence</span>
              </div>
            </div>

            {predLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Evaluating XGBoost Model...
              </div>
            ) : prediction ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">30-Day Readmission Risk Forecast</div>
                  <div className="text-4xl font-extrabold text-cyan-400 font-mono">
                    {prediction.risk_percentage}%
                  </div>
                  <div className="inline-block">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      prediction.risk_category === 'High Risk'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : prediction.risk_category === 'Medium Risk'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {prediction.risk_category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="font-semibold text-slate-300">Top Contributing Factors:</div>
                  <div className="space-y-1.5">
                    {prediction.top_risk_factors?.slice(0, 3).map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="font-mono text-slate-300">{f.feature}</span>
                        <span className="font-bold text-cyan-400">{f.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="font-semibold text-slate-300 pt-2">CDSS Recommendations ({prediction.cdss_recommendations?.length}):</div>
                  <div className="space-y-2">
                    {prediction.cdss_recommendations?.slice(0, 2).map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200">
                        <div className="font-bold text-xs">{rec.title}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">{rec.description}</div>
                      </div>
                    ))}
                  </div>

                  {/* Disclaimer */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 pt-3">
                    <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{prediction.disclaimer}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Prediction not loaded. Click above to execute.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
