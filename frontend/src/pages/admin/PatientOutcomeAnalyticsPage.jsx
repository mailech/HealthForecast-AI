import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Clock,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import api from "../../services/api";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#10b981"];

const PatientOutcomeAnalyticsPage = () => {
  const [performance, setPerformance] = useState(null);
  const [stayOutcomes, setStayOutcomes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOutcomeAnalytics();
  }, []);

  const fetchOutcomeAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPerf, resStay] = await Promise.all([
        api.get("/analytics/hospital-performance"),
        api.get("/analytics/length-of-stay-outcomes")
      ]);
      setPerformance(resPerf.data);
      setStayOutcomes(resStay.data);
    } catch (err) {
      console.error("Failed to load patient outcome analytics:", err);
      setError("Failed to load patient outcome analytics from backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p>{error || "Unable to display patient outcome analytics."}</p>
        </div>
      </div>
    );
  }

  const distributionData = [
    { name: "Early Readmit (<30d)", value: performance.early_readmit_count || 0 },
    { name: "Late Readmit (>30d)", value: Math.round(((performance.late_readmit_rate_pct || 0) / 100) * performance.eligible_encounters_count) },
    { name: "No Readmit", value: Math.round(((performance.no_readmit_rate_pct || 0) / 100) * performance.eligible_encounters_count) }
  ];

  const stayData = stayOutcomes?.cohort_outcomes || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 to-slate-900/60 border border-purple-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/40 text-purple-400">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Patient Outcome Analytics
                </h1>
                <p className="text-purple-200/80 text-sm mt-1">
                  Macro-level patient stay outcomes, readmission distribution, and clinical duration benchmarks
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-900/40 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>View-Only Patient Record Access</span>
          </div>
        </div>
      </div>

      {/* View-Only Protection Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm">
        <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-purple-300">View-Only Patient Record Notice</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Authorized clinicians and administrators are granted aggregate View-Only access to patient outcome metrics. Direct modification of clinical records is strictly restricted according to system RBAC policies.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Eligible Encounters</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {(performance.eligible_encounters_count || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Non-expired patient stays</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>No Readmission Rate</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            {performance.no_readmit_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Stable clinical discharge</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Early Readmit Rate</span>
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-extrabold text-red-400 mt-2">
            {performance.early_readmit_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">&lt;30-day return baseline</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Mean Stay Duration</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">
            {performance.average_length_of_stay_days || 0} <span className="text-sm font-normal">days</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Inpatient hospital stay</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Outcome Breakdown */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-purple-400" />
            Overall Outcome Distribution
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
                <Legend formatter={(value) => <span className="text-slate-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stay Duration Outcomes */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Early Readmission Risk by Stay Duration
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="cohort_name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
                <Bar dataKey="early_readmit_rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Early Readmit Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOutcomeAnalyticsPage;
