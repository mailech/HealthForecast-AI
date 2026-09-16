import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RotateCcw,
  Info,
  BarChart3,
  Layers,
  PieChart as PieIcon
} from 'lucide-react';
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
  Cell
} from 'recharts';

const PIE_COLORS = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6'];

export const AnonymizedPatientDataPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('age');

  useEffect(() => {
    fetchAnonymizedData();
  }, []);

  const fetchAnonymizedData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/researcher/anonymized-patients');
      setData(res.data);
    } catch (err) {
      console.error("Failed to load anonymized patient data", err);
      setError(err.response?.data?.detail || "Failed to retrieve anonymized cohort data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-base font-semibold text-slate-300">Loading Anonymized Population Cohort Data...</div>
        <div className="text-xs text-slate-500">Enforcing strict privacy safeguards — scrubbing all direct patient identifiers</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-panel border border-rose-500/30 rounded-2xl bg-rose-950/20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Anonymized Cohort Data Unavailable</h3>
        <p className="text-sm text-slate-300">{error || "Unable to retrieve anonymized research cohorts."}</p>
        <button
          onClick={fetchAnonymizedData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
        >
          <RotateCcw className="h-4 w-4" /> Retry Cohort Query
        </button>
      </div>
    );
  }

  const getActiveCohortList = () => {
    switch (activeTab) {
      case 'age': return data.age_distribution || [];
      case 'gender': return data.gender_distribution || [];
      case 'race': return data.race_distribution || [];
      case 'diagnosis': return data.diagnosis_distribution || [];
      case 'readmission': return data.readmission_distribution || [];
      default: return data.age_distribution || [];
    }
  };

  const activeCohorts = getActiveCohortList();

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Healthcare Researcher Workbench
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Zero PII Guaranteed
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-400" /> Anonymized Population Cohort Explorer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Population Demographic Distributions, ICD-9 Diagnosis Groups & Readmission Tiers across {data.total_eligible_encounters?.toLocaleString()} Encounters
            </p>
          </div>
        </div>

        {/* Privacy Enforcement Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-purple-200 flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
          <span>
            <strong>Privacy Enforcement Notice:</strong> {data.privacy_notice}
          </span>
        </div>
      </div>

      {/* Cohort Inspector Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" /> Population Demographic & Clinical Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Stratified population sample sizes and dataset percentages across research dimensions.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'age', label: 'Age Groups' },
              { id: 'gender', label: 'Gender' },
              { id: 'race', label: 'Race Category' },
              { id: 'diagnosis', label: 'Primary Diagnosis' },
              { id: 'readmission', label: 'Readmission Tier' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeCohorts} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="cohort_name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                formatter={(val, name, item) => [`${val}% (${item.payload.sample_size?.toLocaleString()} encounters)`, 'Dataset Share']}
              />
              <Bar dataKey="cohort_percentage" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Anonymized Cohort Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider bg-slate-900/60">
                <th className="p-3">Cohort Name</th>
                <th className="p-3">Sample Size (n)</th>
                <th className="p-3">Dataset Percentage (%)</th>
                <th className="p-3">Anonymization Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {activeCohorts.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-white font-sans">{row.cohort_name}</td>
                  <td className="p-3 text-slate-300">{row.sample_size?.toLocaleString()}</td>
                  <td className="p-3 text-purple-400 font-bold">{row.cohort_percentage}%</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Anonymized Aggregate
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnonymizedPatientDataPage;
