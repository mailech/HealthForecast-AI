import React, { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  Building2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users
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

const OperationalAnalyticsPage = () => {
  const [performance, setPerformance] = useState(null);
  const [stayOutcomes, setStayOutcomes] = useState(null);
  const [contextOutcomes, setContextOutcomes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPerf, resStay, resCtx] = await Promise.all([
        api.get("/analytics/hospital-performance"),
        api.get("/analytics/length-of-stay-outcomes"),
        api.get("/analytics/admission-context-outcomes")
      ]);
      setPerformance(resPerf.data);
      setStayOutcomes(resStay.data);
      setContextOutcomes(resCtx.data);
    } catch (err) {
      console.error("Failed to load operational analytics:", err);
      setError("Failed to load operational analytics from backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p>{error || "Unable to display operational analytics."}</p>
        </div>
      </div>
    );
  }

  const stayData = stayOutcomes?.cohort_outcomes || [];
  const admissionTypeCohorts = (contextOutcomes?.cohort_outcomes || []).filter((c) =>
    c.cohort_name.startsWith("Admission Type")
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900/60 border border-emerald-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-400">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Operational Analytics & Resource Utilization
                </h1>
                <p className="text-emerald-200/80 text-sm mt-1">
                  Encounter volume, stay duration brackets, and admission context utilization
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-900/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Dataset Resource Metrics</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Encounter Volume</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {(performance.eligible_encounters_count || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total analyzed stays</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Mean Stay Duration</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-400 mt-2">
            {performance.average_length_of_stay_days || 0} <span className="text-sm font-normal">days</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Average turnaround time</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Extended Stay Ratio</span>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">
            {performance.extended_stay_rate_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Stays &ge; 6 days</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>High Utilization Ratio</span>
            <Users className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-3xl font-extrabold text-teal-400 mt-2">
            {performance.high_utilization_patient_pct || 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Prior inpatient/ED visits</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admission Type Context */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Admission Context Breakdown
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionTypeCohorts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="cohort_name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
                <Bar dataKey="sample_size" fill="#10b981" radius={[4, 4, 0, 0]} name="Encounter Volume (n)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stay Duration Brackets */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Length-of-Stay Duration Brackets
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="cohort_name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#fff" }} />
                <Bar dataKey="cohort_percentage" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Dataset Share (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalAnalyticsPage;
