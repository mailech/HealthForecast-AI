import React, { useState, useEffect } from "react";
import {
  PieChart as PieIcon,
  Building2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import api from "../../services/api";

const DepartmentPerformancePage = () => {
  const [contextOutcomes, setContextOutcomes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/analytics/admission-context-outcomes");
      setContextOutcomes(res.data);
    } catch (err) {
      console.error("Failed to load specialty analytics:", err);
      setError("Failed to load medical specialty performance metrics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !contextOutcomes) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p>{error || "Unable to display medical specialty analytics."}</p>
        </div>
      </div>
    );
  }

  // Filter only medical specialty cohorts
  const specialtyCohorts = (contextOutcomes?.cohort_outcomes || []).filter((c) =>
    c.cohort_name.startsWith("Specialty:")
  ).map((c) => ({
    ...c,
    displayName: c.cohort_name.replace("Specialty: ", "")
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/60 to-slate-900/60 border border-amber-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
                <PieIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Department & Medical Specialty Performance
                </h1>
                <p className="text-amber-200/80 text-sm mt-1">
                  Encounter volumes, readmission rates, and relative risk ratios by medical specialty
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-900/40 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Dataset Medical Specialty Categories</span>
          </div>
        </div>
      </div>

      {/* Dataset Mapping Disclaimer */}
      <div className="bg-slate-800/80 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-300">Medical Specialty-Level Analytics Notice</p>
          <p className="text-xs text-slate-400 mt-0.5">
            The dataset records clinical encounters under standard <code className="text-amber-300">medical_specialty</code> taxonomy (e.g., InternalMedicine, Cardiology, GeneralSurgery).
            These metrics reflect specialty-level retrospective performance. No fictional hospital department structures are invented.
          </p>
        </div>
      </div>

      {/* Chart: Readmission Risk by Medical Specialty */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          Early Readmission Rate & Risk Ratio by Medical Specialty
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={specialtyCohorts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="displayName" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
              <Legend />
              <Bar dataKey="early_readmit_rate" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Early Readmit Rate (%)" />
              <Bar dataKey="relative_risk_vs_baseline" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Relative Risk vs Baseline (x)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Specialty Breakdown Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-md font-bold text-white">
          Medical Specialty Performance Breakdown
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 border-b border-slate-700">Medical Specialty</th>
                <th className="px-4 py-3 border-b border-slate-700">Encounter Volume (n)</th>
                <th className="px-4 py-3 border-b border-slate-700">Dataset Share (%)</th>
                <th className="px-4 py-3 border-b border-slate-700">Early Readmit Count</th>
                <th className="px-4 py-3 border-b border-slate-700">Early Rate (%)</th>
                <th className="px-4 py-3 border-b border-slate-700">Relative Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {specialtyCohorts.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-700/40 font-mono">
                  <td className="px-4 py-2.5 font-sans font-semibold text-white">{row.displayName}</td>
                  <td className="px-4 py-2.5">{row.sample_size?.toLocaleString()}</td>
                  <td className="px-4 py-2.5">{row.cohort_percentage}%</td>
                  <td className="px-4 py-2.5">{row.early_readmit_count?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-bold text-amber-400">{row.early_readmit_rate}%</td>
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

export default DepartmentPerformancePage;
