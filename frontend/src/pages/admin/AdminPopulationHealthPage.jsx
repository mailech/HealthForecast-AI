import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Heart,
  TrendingUp,
  AlertCircle,
  Pill,
  PieChart as PieChartIcon,
  RefreshCw
} from "lucide-react";
import {
  BarChart as ReBarChart,
  Bar as ReBar,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  CartesianGrid as ReCartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer as ReResponsiveContainer,
  PieChart as RePieChart,
  Pie as RePie,
  Cell as ReCell,
  Legend as ReLegend
} from "recharts";
import api from "../../services/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];

const AdminPopulationHealthPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [contextOutcomes, setContextOutcomes] = useState(null);
  const [treatmentSummary, setTreatmentSummary] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resPerf, resCtx, resTx] = await Promise.all([
        api.get("/analytics/hospital-performance"),
        api.get("/analytics/admission-context-outcomes"),
        api.get("/analytics/treatment-summary")
      ]);
      setPerformance(resPerf?.data || null);
      setContextOutcomes(resCtx?.data || null);
      setTreatmentSummary(resTx?.data || null);
    } catch (err) {
      console.error("Error fetching population health analytics:", err);
      setError("Failed to load population health statistics from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-red-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Analytics Data Unavailable</p>
              <p className="text-sm text-red-300 mt-0.5">{error || "Unable to display population health statistics."}</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ageDistribution = Array.isArray(contextOutcomes?.cohort_outcomes)
    ? contextOutcomes.cohort_outcomes
        .filter((c) => c && typeof c.cohort_name === "string" && c.cohort_name.startsWith("Age Group:"))
        .map((c) => ({
          age: c.cohort_name.replace(/^Age Group:\s*/, ""),
          count: c.sample_size || 0
        }))
    : [];

  const readmissionDistribution = [
    { name: "Early Readmit (<30d)", value: performance?.early_readmit_count || 0 },
    {
      name: "Late Readmit (>30d)",
      value: performance?.overall_outcome_distribution?.late_readmission?.count || 0
    },
    {
      name: "No Readmit",
      value: performance?.overall_outcome_distribution?.no_readmission?.count || 0
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 to-slate-900/60 border border-blue-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/40 text-blue-400">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Population Health Reports
                </h1>
                <p className="text-blue-200/80 text-sm mt-1">
                  Macro-level demographic distributions, primary diagnosis categories, and medication usage profiles
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-900/40 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-mono">
            <span>Aggregated Dataset Analysis</span>
          </div>
        </div>
      </div>

      {/* Observational Notice */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-300">Observational Dataset Notice</p>
          <p className="text-xs text-slate-400 mt-0.5">
            This report provides macro-level cohort statistics based strictly on anonymized historical dataset attributes.
            No individual patient prediction or identifying information is displayed.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Total Encounters</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {(performance?.eligible_encounters_count || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Dataset-wide inpatient stays</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Early Readmission Rate</span>
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-extrabold text-red-400 mt-2">
            {performance?.early_readmit_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Readmitted within 30 days</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Avg Stay Duration</span>
            <Heart className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-400 mt-2">
            {performance?.average_length_of_stay_days || 0} <span className="text-sm font-normal">days</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Mean duration per encounter</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Active Medication Regimen</span>
            <Pill className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-3xl font-extrabold text-teal-400 mt-2">
            {treatmentSummary?.diabetes_med_prescribed?.percentage || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Prescribed active diabetes meds</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Group Distribution */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Age-Group Demographics
          </h2>
          <div className="h-72">
            {ageDistribution.length > 0 ? (
              <ReResponsiveContainer width="100%" height="100%">
                <ReBarChart data={ageDistribution}>
                  <ReCartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <ReXAxis dataKey="age" stroke="#94a3b8" />
                  <ReYAxis stroke="#94a3b8" />
                  <ReTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
                  <ReBar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Encounters" />
                </ReBarChart>
              </ReResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Demographic data unavailable
              </div>
            )}
          </div>
        </div>

        {/* Readmission Category Breakdown */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-400" />
            Readmission Outcome Breakdown
          </h2>
          <div className="h-72">
            {readmissionDistribution.some((d) => d.value > 0) ? (
              <ReResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <RePie
                    data={readmissionDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      name && typeof percent === "number" ? `${name}: ${(percent * 100).toFixed(1)}%` : name || ""
                    }
                  >
                    {readmissionDistribution.map((entry, index) => (
                      <ReCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </RePie>
                  <ReTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
                  <ReLegend formatter={(value) => <span className="text-slate-300">{value}</span>} />
                </RePieChart>
              </ReResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Readmission outcome data unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPopulationHealthPage;

