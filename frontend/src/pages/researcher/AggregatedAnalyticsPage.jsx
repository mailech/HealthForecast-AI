import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RotateCcw,
  Info,
  Clock,
  TrendingUp,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export const AggregatedAnalyticsPage = () => {
  const [perf, setPerf] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAggregatedAnalytics();
  }, []);

  const fetchAggregatedAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPerf, resCtx] = await Promise.all([
        api.get('/analytics/hospital-performance'),
        api.get('/analytics/admission-context-outcomes')
      ]);
      setPerf(resPerf.data);
      setCtx(resCtx.data);
    } catch (err) {
      console.error("Failed to load aggregated analytics", err);
      setError(err.response?.data?.detail || "Failed to retrieve aggregated analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-base font-semibold text-slate-300">Loading Aggregated Healthcare Analytics...</div>
        <div className="text-xs text-slate-500">Retrieving system-level readmission outcome benchmarks across 130 US hospitals</div>
      </div>
    );
  }

  if (error || !perf) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-panel border border-rose-500/30 rounded-2xl bg-rose-950/20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Aggregated Analytics Unavailable</h3>
        <p className="text-sm text-slate-300">{error || "Unable to load analytics payload."}</p>
        <button
          onClick={fetchAggregatedAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20"
        >
          <RotateCcw className="h-4 w-4" /> Retry Request
        </button>
      </div>
    );
  }

  const pieData = [
    { name: 'No Readmission (NO)', value: perf.no_readmit_rate_pct, count: perf.overall_outcome_distribution?.no_readmission?.count },
    { name: 'Late Readmission (>30d)', value: perf.late_readmit_rate_pct, count: perf.overall_outcome_distribution?.late_readmission?.count },
    { name: 'Early Readmission (<30d)', value: perf.early_readmit_rate_pct, count: perf.early_readmit_count }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Healthcare Research Module
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-cyan-400" /> Aggregated Healthcare Analytics & Outcome Metrics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              System-wide 30-Day Readmission Benchmarks, Length of Stay Outcomes & Admission Contexts
            </p>
          </div>
        </div>

        {/* Mandatory Anonymity Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Aggregated Healthcare Analytics Notice:</strong> No patient-identifying information is displayed. All metrics represent retrospective observational trends across 130 participating US hospitals.
          </span>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Encounters Analyzed</div>
          <div className="text-3xl font-extrabold text-white font-mono">{perf.total_encounters_analyzed?.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total raw inpatient records</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Eligible Research Encounters</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{perf.eligible_encounters_count?.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Excludes expired/hospice cases</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">30-Day Early Readmission Rate</div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">{perf.early_readmit_rate_pct}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Count: {perf.early_readmit_count?.toLocaleString()} (&lt;30d)</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Average Length of Stay</div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">{perf.average_length_of_stay_days} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Mean hospitalization duration</div>
        </div>
      </div>

      {/* Overall Outcome Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-cyan-400" /> System-Wide Outcome Distribution
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val, name, entry) => [`${val}% (${entry.payload.count?.toLocaleString()} encounters)`, name]}
                />
                <Legend formatter={(val) => <span className="text-slate-300 text-xs">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase">No Readmission (NO)</div>
                <div className="text-xl font-bold text-white mt-0.5">{perf.overall_outcome_distribution?.no_readmission?.count?.toLocaleString()} encounters</div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{perf.no_readmit_rate_pct}%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-400 uppercase">Late Readmission (&gt;30d)</div>
                <div className="text-xl font-bold text-white mt-0.5">{perf.overall_outcome_distribution?.late_readmission?.count?.toLocaleString()} encounters</div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">{perf.late_readmit_rate_pct}%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-400 uppercase">Early Readmission (&lt;30d)</div>
                <div className="text-xl font-bold text-white mt-0.5">{perf.early_readmit_count?.toLocaleString()} encounters</div>
              </div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">{perf.early_readmit_rate_pct}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AggregatedAnalyticsPage;
