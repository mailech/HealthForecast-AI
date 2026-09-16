import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Building2,
  TrendingUp,
  Activity,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import api from "../../services/api";

const HealthcarePerformanceReportsPage = () => {
  const [performance, setPerformance] = useState(null);
  const [contextOutcomes, setContextOutcomes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceReports();
  }, []);

  const fetchPerformanceReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPerf, resCtx] = await Promise.all([
        api.get("/analytics/hospital-performance"),
        api.get("/analytics/admission-context-outcomes")
      ]);
      setPerformance(resPerf.data);
      setContextOutcomes(resCtx.data);
    } catch (err) {
      console.error("Failed to load healthcare performance reports:", err);
      setError("Failed to load performance reports from backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p>{error || "Unable to display healthcare performance reports."}</p>
        </div>
      </div>
    );
  }

  const cohorts = contextOutcomes?.cohort_outcomes || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-slate-900/60 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/40 text-indigo-400">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Healthcare Performance Reports
                </h1>
                <p className="text-indigo-200/80 text-sm mt-1">
                  Executive system performance summary, stay duration indicators, and clinical resource stability
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-900/40 border border-indigo-500/30 rounded-lg text-indigo-300 text-xs font-mono">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>130 US Hospitals System Overview</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Encounters</div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {(performance.eligible_encounters_count || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">100% Non-expired inpatient stays</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Early Readmission Rate</div>
          <p className="text-3xl font-extrabold text-red-400 mt-2">
            {performance.early_readmit_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Baseline comparison standard</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average Length of Stay</div>
          <p className="text-3xl font-extrabold text-purple-400 mt-2">
            {performance.average_length_of_stay_days || 0} <span className="text-sm font-normal">days</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Inpatient bed turnaround metric</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Extended Stay Ratio</div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">
            {performance.extended_stay_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Hospital stays &ge; 6 days</p>
        </div>
      </div>

      {/* Cohort Performance Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          Admission Context & Specialty Performance Matrix
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 border-b border-slate-700">Context Cohort</th>
                <th className="px-4 py-3 border-b border-slate-700">Sample Size (n)</th>
                <th className="px-4 py-3 border-b border-slate-700">Cohort Share (%)</th>
                <th className="px-4 py-3 border-b border-slate-700">Early Readmit Count</th>
                <th className="px-4 py-3 border-b border-slate-700">Early Rate (%)</th>
                <th className="px-4 py-3 border-b border-slate-700">Relative Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {cohorts.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-700/40 font-mono">
                  <td className="px-4 py-2.5 font-sans font-semibold text-white">{row.cohort_name}</td>
                  <td className="px-4 py-2.5">{row.sample_size?.toLocaleString()}</td>
                  <td className="px-4 py-2.5">{row.cohort_percentage}%</td>
                  <td className="px-4 py-2.5">{row.early_readmit_count?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-bold text-red-400">{row.early_readmit_rate}%</td>
                  <td className="px-4 py-2.5 font-bold text-cyan-400">{row.relative_risk_vs_baseline}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthcarePerformanceReportsPage;
