import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
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

const ReadmissionStatisticsPage = () => {
  const [performance, setPerformance] = useState(null);
  const [utilizationTrends, setUtilizationTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReadmissionData();
  }, []);

  const fetchReadmissionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPerf, resUtil] = await Promise.all([
        api.get("/analytics/hospital-performance"),
        api.get("/analytics/utilization-trends")
      ]);
      setPerformance(resPerf.data);
      setUtilizationTrends(resUtil.data);
    } catch (err) {
      console.error("Failed to load readmission statistics:", err);
      setError("Failed to load readmission statistics from backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p>{error || "Unable to display readmission statistics."}</p>
        </div>
      </div>
    );
  }

  const utilData = utilizationTrends?.cohort_outcomes || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900/60 to-slate-900/60 border border-red-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/40 text-red-400">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Readmission Statistics & Trends
                </h1>
                <p className="text-red-200/80 text-sm mt-1">
                  Macro historical readmission statistics, 30-day early return ratios, and utilization stratification
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-900/40 border border-red-500/30 rounded-lg text-red-300 text-xs font-mono">
            <Calendar className="w-4 h-4 text-red-400" />
            <span>Historical Baseline Analytics</span>
          </div>
        </div>
      </div>

      {/* Historical Disclaimer Banner */}
      <div className="bg-slate-800/80 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-300">Historical Observational Baseline Notice</p>
          <p className="text-xs text-slate-400 mt-0.5">
            The metrics below represent historical dataset readmission statistics (1999–2008). They are retrospective observational baseline indicators and MUST NOT be confused with individual AI model risk predictions.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Early Readmit Rate (&lt;30d)</span>
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-extrabold text-red-400 mt-2">
            {performance.early_readmit_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">30-day early return count: {(performance.early_readmit_count || 0).toLocaleString()}</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Late Readmit Rate (&gt;30d)</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">
            {performance.late_readmit_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Returns after 30 days</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>No Readmit Rate</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            {performance.no_readmit_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Single admission encounters</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>System Baseline</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-cyan-400 mt-2">
            11.19%
          </p>
          <p className="text-xs text-slate-400 mt-1">Dataset-wide mean baseline</p>
        </div>
      </div>

      {/* Utilization Trends Chart */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-400" />
          Readmission Risk by Prior Hospital Utilization
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="cohort_name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
              <Legend />
              <Bar dataKey="early_readmit_rate" fill="#ef4444" radius={[4, 4, 0, 0]} name="Early Readmit Rate (%)" />
              <Bar dataKey="relative_risk_vs_baseline" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Relative Risk vs Baseline (x)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReadmissionStatisticsPage;
