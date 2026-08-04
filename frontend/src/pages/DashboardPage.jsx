import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldAlert, TrendingDown, DollarSign, Activity, ArrowUpRight, Search, Plus, Filter } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { healthApi } from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await healthApi.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const pieData = [
    { name: 'Low Risk (<30%)', value: summary?.low_risk_patients || 75, color: '#10b981' },
    { name: 'Medium Risk (30-60%)', value: summary?.medium_risk_patients || 45, color: '#f59e0b' },
    { name: 'High Risk (>60%)', value: summary?.high_risk_patients || 28, color: '#ef4444' }
  ];

  const deptData = summary?.department_distribution ? Object.keys(summary.department_distribution).map(k => ({
    department: k,
    count: summary.department_distribution[k]
  })) : [
    { department: 'Cardiology', count: 42 },
    { department: 'Pulmonology', count: 35 },
    { department: 'Endocrinology', count: 28 },
    { department: 'Nephrology', count: 19 },
    { department: 'Internal Med', count: 24 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="text-[11px] font-bold text-medical-cyan uppercase tracking-wider">Hospital Intelligence Command</span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Executive Readmission Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time risk scoring, 30-day cohort monitoring, and clinical intervention streams.</p>
        </div>
        
        <button
          onClick={() => navigate('/predict')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 font-bold text-xs shadow-cyan-glow hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Risk Assessment</span>
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Active Patients"
          value={summary?.total_patients || 148}
          change="+6.2%"
          icon={Users}
        />
        <KPICard
          title="High Risk Cohort"
          value={summary?.high_risk_patients || 28}
          change="-4.1%"
          changeType="positive"
          icon={ShieldAlert}
        />
        <KPICard
          title="30-Day Readmission Rate"
          value={`${summary?.readmission_rate_30d || 14.2}%`}
          change="-2.8%"
          changeType="positive"
          icon={TrendingDown}
        />
        <KPICard
          title="Predicted Cost Savings"
          value={`$${(summary?.predicted_savings_usd || 191500).toLocaleString()}`}
          change="+$42k"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart: Risk Distribution */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Cohort Risk Distribution</h3>
            <span className="text-[10px] text-slate-400">Current Inpatients</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Department Volume */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Patient Volume by Department</h3>
            <span className="text-[10px] text-slate-400">Live Breakdown</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Risk Recent Alerts Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">High-Risk Priority Readmission Stream</h3>
            <p className="text-xs text-slate-400">Patients requiring immediate care management intervention before discharge</p>
          </div>
          <button
            onClick={() => navigate('/patients')}
            className="text-xs text-medical-cyan hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All Patients</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Patient Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Primary Diagnosis</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(summary?.recent_alerts || []).map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-medical-cyan font-bold">{patient.patient_code}</td>
                  <td className="py-3 px-4 font-bold text-white">{patient.name}</td>
                  <td className="py-3 px-4">{patient.department}</td>
                  <td className="py-3 px-4 text-slate-400">{patient.primary_diagnosis}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                      {patient.risk_score}% High
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/patients?search=${patient.patient_code}`)}
                      className="px-3 py-1 rounded-lg bg-navy-800 hover:bg-medical-cyan hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition-all"
                    >
                      Inspect Profile
                    </button>
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
