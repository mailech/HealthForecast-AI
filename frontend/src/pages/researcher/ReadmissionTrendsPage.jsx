import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const ReadmissionTrendsPage = () => {
  const [util, setUtil] = useState(null);
  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [utilTab, setUtilTab] = useState('Inpatient');

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resUtil, resStay] = await Promise.all([
        api.get('/analytics/utilization-trends'),
        api.get('/analytics/length-of-stay-outcomes')
      ]);
      setUtil(resUtil.data);
      setStay(resStay.data);
    } catch (err) {
      console.error("Failed to load readmission trend reports", err);
      setError(err.response?.data?.detail || "Failed to load readmission trends.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-base font-semibold text-slate-300">Loading Retrospective Readmission Trend Reports...</div>
        <div className="text-xs text-slate-500">Evaluating 12-month prior utilization risk gradients and length of stay patterns</div>
      </div>
    );
  }

  if (error || !util) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-panel border border-rose-500/30 rounded-2xl bg-rose-950/20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Readmission Trends Unavailable</h3>
        <p className="text-sm text-slate-300">{error || "Unable to retrieve readmission trends payload."}</p>
        <button
          onClick={fetchTrendData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-500/20"
        >
          <RotateCcw className="h-4 w-4" /> Retry Request
        </button>
      </div>
    );
  }

  const filterUtilizationCohorts = () => {
    if (!util?.cohort_outcomes) return [];
    return util.cohort_outcomes.filter(c => {
      if (utilTab === 'Inpatient') return c.cohort_name.startsWith('Prior Inpatient:');
      if (utilTab === 'Emergency') return c.cohort_name.startsWith('Prior Emergency:');
      if (utilTab === 'Outpatient') return c.cohort_name.startsWith('Prior Outpatient:');
      return true;
    }).map(c => ({
      ...c,
      displayName: c.cohort_name.replace(/^(Prior Inpatient:|Prior Emergency:|Prior Outpatient:)\s*/, '')
    }));
  };

  const activeUtilCohorts = filterUtilizationCohorts();
  const highUtilCohort = util?.cohort_outcomes?.find(c => c.cohort_name.includes('3+ Visits'));

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Healthcare Research Module
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                HISTORICAL ANALYTICS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-amber-400" /> Readmission Trend & Risk Gradient Reports
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Retrospective 12-Month Prior Utilization Gradients & Length of Hospital Stay Risk Profiles
            </p>
          </div>
        </div>

        {/* Historical Disclaimer Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-200 flex items-center gap-2.5">
          <Info className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>HISTORICAL ANALYTICS NOTICE:</strong> All metrics represent retrospective population trends within historical inpatient records (1999–2008). They do NOT represent individual patient predictions.
          </span>
        </div>
      </div>

      {/* Utilization Trends Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-400" /> 12-Month Prior Healthcare Utilization Gradients
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Relationship between prior inpatient, emergency, and outpatient visits and 30-day early readmission rates.
            </p>
          </div>

          <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            {['Inpatient', 'Emergency', 'Outpatient'].map((t) => (
              <button
                key={t}
                onClick={() => setUtilTab(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  utilTab === t
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t} Visits
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeUtilCohorts} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="displayName" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              <Bar dataKey="early_readmit_rate" name="30-Day Early Readmit Rate (%)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider bg-slate-900/60">
                <th className="p-3">Utilization Cohort</th>
                <th className="p-3">Sample Size (n)</th>
                <th className="p-3">Dataset Share (%)</th>
                <th className="p-3">Early Readmit Rate (&lt;30d %)</th>
                <th className="p-3">Late Rate (&gt;30d %)</th>
                <th className="p-3">Relative Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {activeUtilCohorts.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-white font-sans">{row.displayName}</td>
                  <td className="p-3 text-slate-300">{row.sample_size?.toLocaleString()}</td>
                  <td className="p-3 text-slate-400">{row.cohort_percentage}%</td>
                  <td className="p-3 font-bold text-amber-400">{row.early_readmit_rate}%</td>
                  <td className="p-3 text-slate-400">{row.late_readmit_rate}%</td>
                  <td className="p-3 font-bold text-cyan-400">{row.relative_risk_vs_baseline}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Length of Stay Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" /> Length of Stay Readmission Patterns
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Readmission rates stratified across hospital stay duration brackets (Short, Moderate, Extended, Long).
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stay?.cohort_outcomes || []} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="cohort_name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              <Bar dataKey="early_readmit_rate" name="Early Readmit Rate (<30d %)" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReadmissionTrendsPage;
