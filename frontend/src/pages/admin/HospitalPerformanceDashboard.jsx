import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  Clock,
  AlertTriangle,
  Info,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Calendar
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

const PIE_COLORS = ['#f43f5e', '#f59e0b', '#10b981'];

export const HospitalPerformanceDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [contextOutcomes, setContextOutcomes] = useState(null);
  const [utilizationTrends, setUtilizationTrends] = useState(null);
  const [stayOutcomes, setStayOutcomes] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contextTab, setContextTab] = useState('Admission Type');
  const [utilizationTab, setUtilizationTab] = useState('Inpatient');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPerf, resCtx, resUtil, resStay] = await Promise.all([
        api.get('/analytics/hospital-performance'),
        api.get('/analytics/admission-context-outcomes'),
        api.get('/analytics/utilization-trends'),
        api.get('/analytics/length-of-stay-outcomes')
      ]);

      setPerformance(resPerf.data);
      setContextOutcomes(resCtx.data);
      setUtilizationTrends(resUtil.data);
      setStayOutcomes(resStay.data);
    } catch (err) {
      console.error("Failed to load hospital performance analytics", err);
      setError("Failed to connect to backend analytics service. Please verify server status and network connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-base font-semibold text-slate-300">Loading Hospital Performance Analytics & Healthcare Trends...</div>
        <div className="text-xs text-slate-500">Retrieving system-level encounter benchmarks across 130 US hospitals</div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-panel border border-rose-500/30 rounded-2xl bg-rose-950/20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Analytics Data Unavailable</h3>
        <p className="text-sm text-slate-300">{error || "Hospital performance analytics data is currently unavailable from the backend service."}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-500/20"
        >
          <RotateCcw className="h-4 w-4" /> Retry Analytics Data Request
        </button>
      </div>
    );
  }

  // Outcome distribution data for Recharts Pie (Strictly dynamic from live backend API)
  const distributionData = [
    { name: 'Early Readmission (<30d)', value: performance?.early_readmit_count, pct: performance?.early_readmit_rate_pct },
    { name: 'Late Readmission (>30d)', value: performance?.overall_outcome_distribution?.late_readmission?.count, pct: performance?.late_readmit_rate_pct },
    { name: 'No Readmission', value: performance?.overall_outcome_distribution?.no_readmission?.count, pct: performance?.no_readmit_rate_pct }
  ];

  // Helper for context tab filtering
  const filterContextCohorts = () => {
    if (!contextOutcomes?.cohort_outcomes) return [];
    return contextOutcomes.cohort_outcomes.filter(c => {
      if (contextTab === 'Admission Type') return c.cohort_name.startsWith('Admission Type:');
      if (contextTab === 'Admission Source') return c.cohort_name.startsWith('Admission Source:');
      if (contextTab === 'Age Group') return c.cohort_name.startsWith('Age Group:');
      if (contextTab === 'Medical Specialty') return c.cohort_name.startsWith('Specialty:');
      if (contextTab === 'Primary Diagnosis') return c.cohort_name.startsWith('Primary Diagnosis:');
      return true;
    }).map(c => ({
      ...c,
      displayName: c.cohort_name.replace(/^(Admission Type:|Admission Source:|Age Group:|Specialty:|Primary Diagnosis:)\s*/, '')
    }));
  };

  // Helper for utilization tab filtering
  const filterUtilizationCohorts = () => {
    if (!utilizationTrends?.cohort_outcomes) return [];
    return utilizationTrends.cohort_outcomes.filter(c => {
      if (utilizationTab === 'Inpatient') return c.cohort_name.startsWith('Prior Inpatient:');
      if (utilizationTab === 'Emergency') return c.cohort_name.startsWith('Prior Emergency:');
      if (utilizationTab === 'Outpatient') return c.cohort_name.startsWith('Prior Outpatient:');
      return true;
    }).map(c => ({
      ...c,
      displayName: c.cohort_name.replace(/^(Prior Inpatient:|Prior Emergency:|Prior Outpatient:)\s*/, '')
    }));
  };

  const activeContextCohorts = filterContextCohorts();
  const activeUtilizationCohorts = filterUtilizationCohorts();

  // Dynamic cohort metrics for observational summary
  const highUtilCohort = utilizationTrends?.cohort_outcomes?.find(c => c.cohort_name.includes('3+ Visits'));
  const lowUtilCohort = utilizationTrends?.cohort_outcomes?.find(c => c.cohort_name.includes('0 Visits'));
  const circCohort = contextOutcomes?.cohort_outcomes?.find(c => c.cohort_name.includes('Circulatory'));

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <Building2 className="h-8 w-8 text-cyan-400" /> Hospital System Performance Analytics & Healthcare Trends
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Aggregate Population-Level Readmission Analytics, Clinical Contexts & Stay Duration Benchmarks • Diabetes 130-US Hospitals Dataset
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 shrink-0">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span>Time Span: {performance?.dataset_time_span || "1999–2008"}</span>
          </div>
        </div>

        {/* Hospital Anonymity Notice */}
        {performance?.hospital_anonymity_disclaimer && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Hospital Anonymity & System Scope Note: </span>
              {performance.hospital_anonymity_disclaimer}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: Overall Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Encounters Analyzed</div>
          <div className="text-3xl font-extrabold text-white">{performance?.total_encounters_analyzed?.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total raw inpatient records</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Eligible Clinical Encounters</div>
          <div className="text-3xl font-extrabold text-emerald-400">{performance?.eligible_encounters_count?.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Excludes expired/hospice cases</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">30-Day Early Readmission Rate</div>
          <div className="text-3xl font-extrabold text-rose-400">{performance?.early_readmit_rate_pct}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Count: {performance?.early_readmit_count?.toLocaleString()} encounters (&lt;30d)</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Late Readmission Rate (&gt;30d)</div>
          <div className="text-3xl font-extrabold text-amber-400">{performance?.late_readmit_rate_pct}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Readmissions after 30 days</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">No-Readmission Rate</div>
          <div className="text-3xl font-extrabold text-cyan-400">{performance?.no_readmit_rate_pct}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Encounters without return visit</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Average Length of Stay</div>
          <div className="text-3xl font-extrabold text-purple-400">{performance?.average_length_of_stay_days} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Mean duration of hospitalization</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">High-Utilization Patient %</div>
          <div className="text-3xl font-extrabold text-sky-400">{performance?.high_utilization_patient_pct}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Prior inpatient or emergency &gt; 0</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Extended Stay Rate (6+ Days)</div>
          <div className="text-3xl font-extrabold text-indigo-400">{performance?.extended_stay_rate_pct}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Complex long-stay admissions</div>
        </div>
      </div>

      {/* SECTION 2: Overall Outcome Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-cyan-400" /> Overall System Outcome Distribution
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Distribution of readmission outcomes across {performance?.eligible_encounters_count?.toLocaleString()} eligible clinical inpatient encounters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val, name, entry) => [`${val?.toLocaleString()} encounters (${entry.payload.pct}%)`, name]}
                />
                <Legend formatter={(val) => <span className="text-slate-300 text-xs">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-400 uppercase">30-Day Early Readmission (&lt;30d)</div>
                <div className="text-xl font-bold text-white mt-0.5">{performance?.early_readmit_count?.toLocaleString()} encounters</div>
              </div>
              <div className="text-2xl font-extrabold text-rose-400">{performance?.early_readmit_rate_pct}%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-400 uppercase">Late Readmission (&gt;30d)</div>
                <div className="text-xl font-bold text-white mt-0.5">{performance?.overall_outcome_distribution?.late_readmission?.count?.toLocaleString()} encounters</div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400">{performance?.late_readmit_rate_pct}%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase">No Readmission (NO)</div>
                <div className="text-xl font-bold text-white mt-0.5">{performance?.overall_outcome_distribution?.no_readmission?.count?.toLocaleString()} encounters</div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{performance?.no_readmit_rate_pct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 & 6: Readmission Performance by Admission Context */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" /> Readmission Outcomes by Admission Context & Demographics
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Stratified 30-day early, late, and no-readmission rates across key clinical dimensions.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            {['Admission Type', 'Admission Source', 'Age Group', 'Medical Specialty', 'Primary Diagnosis'].map((tab) => (
              <button
                key={tab}
                onClick={() => setContextTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  contextTab === tab
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeContextCohorts} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="displayName" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              <Legend formatter={(val) => <span className="text-slate-300 text-xs">{val}</span>} />
              <Bar dataKey="early_readmit_rate" name="Early Readmit Rate (<30d %)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late_readmit_rate" name="Late Readmit Rate (>30d %)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="no_readmit_rate" name="No Readmit Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 uppercase text-[11px] tracking-wider">
                <th className="p-3">Cohort Name</th>
                <th className="p-3">Sample Size (n)</th>
                <th className="p-3">Cohort %</th>
                <th className="p-3">Early Readmit (&lt;30d)</th>
                <th className="p-3">Early Rate (%)</th>
                <th className="p-3">Late Rate (%)</th>
                <th className="p-3">No Readmit Rate (%)</th>
                <th className="p-3">Relative Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activeContextCohorts.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-white">{row.displayName}</td>
                  <td className="p-3 text-slate-300">{row.sample_size?.toLocaleString()}</td>
                  <td className="p-3 text-slate-400">{row.cohort_percentage}%</td>
                  <td className="p-3 text-rose-400 font-medium">{row.early_readmit_count?.toLocaleString()}</td>
                  <td className="p-3 font-bold text-rose-400">{row.early_readmit_rate}%</td>
                  <td className="p-3 text-amber-400">{row.late_readmit_rate}%</td>
                  <td className="p-3 text-emerald-400">{row.no_readmit_rate}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.relative_risk_vs_baseline > 1.05 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      row.relative_risk_vs_baseline < 0.95 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-slate-700/50 text-slate-300'
                    }`}>
                      {row.relative_risk_vs_baseline}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: Healthcare Utilization Trends */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-400" /> Healthcare Utilization Trends (Prior 12 Months)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Relationship between prior inpatient, emergency, and outpatient visits and 30-day early readmission rates.
            </p>
          </div>

          <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            {['Inpatient', 'Emergency', 'Outpatient'].map((t) => (
              <button
                key={t}
                onClick={() => setUtilizationTab(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  utilizationTab === t
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t} Visits
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeUtilizationCohorts} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="displayName" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              <Bar dataKey="early_readmit_rate" name="30-Day Early Readmit Rate (%)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Observational Note */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
          <div>
            <span className="font-semibold text-white">Observational Utilization Pattern: </span>
            Higher prior hospital utilization is strongly associated with higher observed early readmission rates. Patients with 3+ prior inpatient visits exhibit an observed {highUtilCohort?.early_readmit_rate ?? "elevated"}% early readmission rate ({highUtilCohort?.relative_risk_vs_baseline ?? 1.81}x baseline).
          </div>
        </div>
      </div>

      {/* SECTION 5: Length of Stay Analysis */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" /> Length of Hospital Stay Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Readmission rates stratified across hospital stay duration brackets (Short, Moderate, Extended, Long).
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stayOutcomes?.cohort_outcomes || []} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="cohort_name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              <Bar dataKey="early_readmit_rate" name="Early Readmit Rate (<30d %)" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-400 shrink-0" />
          <div>
            <span className="font-semibold text-white">Length of Stay Finding: </span>
            Extended and long hospital stays reflect elevated inpatient clinical complexity compared to short hospital stays.
          </div>
        </div>
      </div>

      {/* SECTION 7: Key Observations */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" /> Key Observational System Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-rose-400 uppercase text-[11px]">Highest Utilization Risk Cohort</div>
            <div className="text-white font-semibold">Prior Inpatient: 3+ Visits</div>
            <div className="text-slate-400">Observed 30-day readmission rate: <span className="text-rose-400 font-bold">{highUtilCohort?.early_readmit_rate}%</span> ({highUtilCohort?.relative_risk_vs_baseline}x baseline).</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 uppercase text-[11px]">Lowest Readmission Cohort</div>
            <div className="text-white font-semibold">Prior Inpatient: 0 Visits</div>
            <div className="text-slate-400">Observed 30-day readmission rate: <span className="text-emerald-400 font-bold">{lowUtilCohort?.early_readmit_rate}%</span> ({lowUtilCohort?.relative_risk_vs_baseline}x baseline).</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400 uppercase text-[11px]">Highest Risk Diagnosis Group</div>
            <div className="text-white font-semibold">Circulatory System Codes</div>
            <div className="text-slate-400">Observed 30-day readmission rate: <span className="text-amber-400 font-bold">{circCohort?.early_readmit_rate}%</span> across {circCohort?.sample_size?.toLocaleString()} encounters.</div>
          </div>
        </div>
      </div>

      {/* SECTION 8: Dataset Limitation & Medical Disclaimer Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-bold text-slate-200 flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-cyan-400" /> Comprehensive Dataset Limitation & Healthcare Analytics Disclaimer
        </div>
        <p>
          • <strong>Dataset Anonymity Scope:</strong> The Diabetes 130-US Hospitals dataset aggregates clinical encounters across 130 participating US hospitals from 1999 to 2008. Individual hospital names and hospital IDs are not available in the dataset. All metrics reflect aggregate population-level healthcare trends.
        </p>
        <p>
          • <strong>Descriptive & Observational Nature:</strong> All metrics, percentages, and relative risks represent retrospective observational correlations. They describe historical patterns in inpatient records and do NOT establish causal relationships or individual hospital quality rankings.
        </p>
        <p>
          • <strong>Clinical Integrity:</strong> These population-level analytics are intended for administrative risk intelligence and healthcare research. They should not be used as direct medical diagnoses or individual patient treatment plans.
        </p>
      </div>
    </div>
  );
};

export default HospitalPerformanceDashboard;
