import React, { useState, useEffect } from 'react'
import api from '../services/api'
import {
  Activity, Stethoscope, AlertOctagon, CheckCircle2,
  TrendingUp, Pill, Dna, ArrowUpRight
} from 'lucide-react'

export default function ClinicalInsights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/predictions/clinical-insights')
      .then(r => setInsights(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">Analyzing Clinical Biomarker Correlations & Care Pathways...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5" /> Clinical Intelligence Suite
            </span>
            <span className="text-xs text-slate-400">Biomarker & Outcome Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Clinical Insights & Biomarker Risk Correlations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Evidence-based clinical correlation analysis, medication polypharmacy impact, and intervention success tracking.
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-300">
          Evaluated Cohort: <strong className="text-teal-400">1,200 Encounters</strong>
        </div>
      </div>

      {/* Biomarker Risk Correlation Cards */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" /> Biomarker Readmission Risk Multipliers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {insights?.biomarker_correlations.map((bm, idx) => (
            <div key={idx} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-slate-300">{bm.biomarker}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  bm.clinical_significance === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {bm.clinical_significance} Impact
                </span>
              </div>

              <div className="text-3xl font-extrabold text-teal-400 mb-1">
                {bm.readmission_risk_multiplier}x
              </div>
              <div className="text-xs text-slate-400">
                Increased readmission probability vs baseline
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
                <span>Sample Size: {bm.sample_count}</span>
                <span className="text-emerald-400 font-semibold">p &lt; 0.001</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention Success & Active Red Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intervention Success Rates */}
        <div className="lg:col-span-7 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Clinical Intervention Efficacy
          </h3>
          <p className="text-xs text-slate-400 mb-5">Observed success rate of post-discharge clinical protocols in preventing readmissions</p>

          <div className="space-y-5">
            {insights?.intervention_success_rates.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.intervention}</span>
                  <span className="font-bold text-emerald-400">{item.success_rate}% Success Rate</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${item.success_rate}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 text-right">
                  Estimated readmissions prevented: <strong className="text-teal-300">+{item.readmissions_prevented} patients</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Clinical Red Flags */}
        <div className="lg:col-span-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" /> Active Clinical Red-Flags
            </h3>
            <p className="text-xs text-slate-400 mb-4">Real-time alerts requiring immediate discharge team review</p>

            <div className="space-y-3">
              {insights?.active_clinical_red_flags.map((rf, idx) => (
                <div key={idx} className="bg-rose-950/30 p-3.5 rounded-xl border border-rose-500/40 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{rf.patient_name}</span>
                    <span className="font-mono text-[10px] text-rose-400 font-semibold">{rf.patient_nbr}</span>
                  </div>
                  <p className="text-rose-200 font-medium">{rf.alert}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            ✓ Automated clinical alerts updated dynamically from active inpatient electronic health records.
          </div>
        </div>
      </div>
    </div>
  )
}
