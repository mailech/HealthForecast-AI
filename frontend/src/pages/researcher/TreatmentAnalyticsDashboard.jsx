import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FlaskConical,
  Activity,
  Pill,
  ShieldAlert,
  Download,
  Info,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  AlertTriangle
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

const COLORS = {
  cyan: '#06b6d4',
  purple: '#a855f7',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#3b82f6',
  slate: '#64748b'
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export const TreatmentAnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [medOutcomes, setMedOutcomes] = useState(null);
  const [changeOutcomes, setChangeOutcomes] = useState(null);
  const [polyOutcomes, setPolyOutcomes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resSummary, resMed, resChange, resPoly] = await Promise.all([
        api.get('/analytics/treatment-summary'),
        api.get('/analytics/medication-outcomes'),
        api.get('/analytics/change-status-outcomes'),
        api.get('/analytics/polypharmacy-outcomes')
      ]);

      setSummary(resSummary.data);
      setMedOutcomes(resMed.data);
      setChangeOutcomes(resChange.data);
      setPolyOutcomes(resPoly.data);
    } catch (err) {
      console.error("Failed to load treatment analytics", err);
      setError("Failed to load analytics data from backend. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!medOutcomes) return;
    const headers = ["Cohort_Name", "Sample_Size_N", "Cohort_Percentage", "Early_Readmit_Count", "Early_Readmit_Rate_Pct", "Relative_Risk"];
    const rows = medOutcomes.cohort_outcomes.map(c => [
      `"${c.cohort_name}"`, c.sample_size, c.cohort_percentage, c.early_readmit_count, c.early_readmit_rate, c.relative_risk_vs_baseline
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "treatment_effectiveness_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-sm font-semibold text-slate-400">Loading Treatment Effectiveness & Outcome Analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  // Outcome pie chart data
  const pieData = [
    { name: 'No Readmission (NO)', value: 53.84 },
    { name: 'Late Readmission (>30d)', value: 34.96 },
    { name: 'Early Readmission (<30d)', value: 11.19 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-400" /> Treatment Effectiveness & Patient Outcome Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Observational Cohort Analysis of 99,343 Clinical Encounters • Diabetes 130-US Hospitals Dataset (1999–2008)
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-purple-500/20"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics Cohorts CSV</span>
        </button>
      </div>

      {/* Prominent Observational Data Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
            Observational Association Disclaimer & Data Science Principles
          </div>
          <p className="text-amber-200/90 leading-relaxed">
            All analytics represent retrospective observational correlations within historical hospital dataset records (1999–2008). These metrics describe statistical patterns and must <strong>NOT</strong> be interpreted as proof of causal treatment efficacy or as clinical recommendations. Cohort differences reflect baseline patient disease severity and clinical indication.
          </p>
        </div>
      </div>

      {/* Section 1: Treatment Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Encounters Analyzed</div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {summary.total_encounters_analyzed.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Valid inpatient records (excl. expired)</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Diabetes Med Prescribed</div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {summary.diabetes_med_prescribed.percentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.diabetes_med_prescribed.count.toLocaleString()} patients on diabetes meds
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Regimen Adjusted (change=Ch)</div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            {summary.regimen_changed.percentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.regimen_changed.count.toLocaleString()} dosage changes during stay
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Baseline Readmit (&lt;30d)</div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            11.19%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Global 30-day early readmission baseline</div>
        </div>
      </div>

      {/* Top Prescribed Diabetes Medications Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Pill className="h-4 w-4 text-cyan-400" /> Most Commonly Prescribed Diabetes Medications
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.top_prescribed_medications} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="medication_name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val, name, item) => [`${val}% (${item.payload.user_count.toLocaleString()} patients)`, 'Prevalence']}
              />
              <Bar dataKey="prevalence_percentage" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Medication Outcome Analysis */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" /> Major Medication Cohorts vs 30-Day Readmission
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Observational early readmission rates (&lt;30 days) relative to baseline prevalence (11.19%)
            </p>
          </div>
        </div>

        {/* Recharts BarChart comparing early readmission rates */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={medOutcomes?.cohort_outcomes.slice(0, 8)}
              margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="cohort_name"
                stroke="#94a3b8"
                fontSize={10}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 20]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val, name, item) => [
                  `${val}% (n=${item.payload.sample_size.toLocaleString()}, Risk Ratio: ${item.payload.relative_risk_vs_baseline}x)`,
                  '30-Day Readmit Rate'
                ]}
              />
              <Bar dataKey="early_readmit_rate" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Cohort Outcomes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Treatment Cohort</th>
                <th className="py-3 px-4">Sample Size (n)</th>
                <th className="py-3 px-4">Cohort Share</th>
                <th className="py-3 px-4">Early Readmit (&lt;30d)</th>
                <th className="py-3 px-4">Readmit Rate</th>
                <th className="py-3 px-4">Relative Risk vs Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {medOutcomes?.cohort_outcomes.map((cohort, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-200">{cohort.cohort_name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{cohort.sample_size.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-400">{cohort.cohort_percentage}%</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">{cohort.early_readmit_count.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{cohort.early_readmit_rate}%</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      cohort.relative_risk_vs_baseline > 1.10
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : cohort.relative_risk_vs_baseline < 0.90
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {cohort.relative_risk_vs_baseline}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3 & 4: Regimen Change & Treatment Complexity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Medication Change Analysis */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" /> Regimen Change Status (change = Ch vs No)
          </h3>
          <p className="text-xs text-slate-400">
            Comparing early readmission rates between patients with dosage adjustments during hospitalization versus stable regimens.
          </p>

          <div className="space-y-3 pt-2">
            {changeOutcomes?.cohort_outcomes.slice(0, 4).map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-200">{c.cohort_name}</div>
                  <div className="text-[11px] text-slate-400">n = {c.sample_size.toLocaleString()} ({c.cohort_percentage}% of dataset)</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-cyan-400 font-mono">{c.early_readmit_rate}%</div>
                  <div className="text-[11px] text-slate-400 font-mono">Relative Risk: {c.relative_risk_vs_baseline}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Polypharmacy Utilization Analysis */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" /> Polypharmacy Utilization Gradient
          </h3>
          <p className="text-xs text-slate-400">
            Readmission risk increases monotonically with inpatient medication counts.
          </p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={polyOutcomes?.cohort_outcomes} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="cohort_name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 18]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val, name, item) => [`${val}% (n=${item.payload.sample_size.toLocaleString()})`, 'Readmit Rate']}
                />
                <Bar dataKey="early_readmit_rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 5: Global Outcome Distribution Pie Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-emerald-400" /> Overall Dataset Outcome Distribution
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Distribution of 30-day early readmissions (&lt;30d), late readmissions (&gt;30d), and no readmission (NO) across all 99,343 valid clinical encounters.
          </p>
          <div className="pt-2 text-xs space-y-1 font-mono">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">No Readmission (NO): 53,497 encounters (53.84%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">Late Readmission (&gt;30d): 34,728 encounters (34.96%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Early Readmission (&lt;30d): 11,118 encounters (11.19%)</span>
            </div>
          </div>
        </div>

        <div className="h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val) => [`${val}%`, 'Outcome Share']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
