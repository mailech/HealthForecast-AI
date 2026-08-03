import React from 'react';
import {
  Users,
  Brain,
  TrendingDown,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  BarChart3,
  Sparkles,
  Download,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { PATIENT_RECORDS, HOSPITAL_ANALYTICS, MODEL_METRICS } from '../data/mockData';

export const DashboardView = () => {
  const { currentRole, currentRoleKey, setActiveTab, setSelectedPatient } = useAuth();

  const highRiskCount = PATIENT_RECORDS.filter(p => p.riskLevel === 'High').length;
  const avgReadmissionScore = (PATIENT_RECORDS.reduce((acc, p) => acc + p.readmissionScore, 0) / PATIENT_RECORDS.length).toFixed(1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/80 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                currentRoleKey === 'DOCTOR' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                currentRoleKey === 'ADMIN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                currentRoleKey === 'RESEARCHER' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {currentRole.roleLabel} Dashboard
              </span>
              <span className="text-xs text-slate-400">Live Hospital Feed</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, {currentRole.name}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              Real-time readmission risk analytics and clinical decision support powered by XGBoost v2.4 (Diabetes 130-US Dataset).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('risk-prediction')}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-600/20 flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Launch AI Predictor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hospital Readmission Rate</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{HOSPITAL_ANALYTICS.overallReadmissionRate}</h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-2.6% vs last quarter target ({HOSPITAL_ANALYTICS.targetRate})</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">High Risk Patients Flagged</p>
            <h3 className="text-2xl font-extrabold text-rose-400 mt-1">{highRiskCount} Patients</h3>
            <p className="text-[11px] text-rose-300 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Requires immediate discharge review</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Model Accuracy</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{MODEL_METRICS.accuracy}</h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ROC-AUC: {MODEL_METRICS.rocAuc}</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Brain className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mean Risk Score</p>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{avgReadmissionScore}%</h3>
            <p className="text-[11px] text-slate-400 mt-1">Based on active encounters</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Monthly Readmission Rate Trend vs AI Forecast</h3>
              <p className="text-xs text-slate-400">Actual 30-day readmissions vs machine learning predictions</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              2026 YTD
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOSPITAL_ANALYTICS.monthlyReadmissionTrend}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[10, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  itemStyle={{ fontSize: '12px', color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="actual" name="Actual Readmission %" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#actualGrad)" />
                <Area type="monotone" dataKey="predicted" name="AI Predicted %" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#predGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Breakdown Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Readmission Rate by Department</h3>
            <p className="text-xs text-slate-400">Departmental risk concentration</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOSPITAL_ANALYTICS.departmentMetrics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                />
                <Bar dataKey="readmissions" name="Readmissions" radius={[0, 4, 4, 0]}>
                  {HOSPITAL_ANALYTICS.departmentMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#f43f5e' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Risk Patient Quick Queue */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-100">High-Risk Patients Needing Immediate Intervention</h3>
          </div>
          <button
            onClick={() => setActiveTab('patient-records')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>View Full Patient Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATIENT_RECORDS.filter(p => p.riskLevel === 'High').map(patient => (
            <div key={patient.id} className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/20 hover:border-rose-500/40 transition space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{patient.name} ({patient.id})</h4>
                  <p className="text-xs text-slate-400">{patient.primaryDiagnosis}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {patient.readmissionScore}% Risk
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Length of Stay</span>
                  <span className="font-semibold">{patient.timeInHospital} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 block">HbA1c</span>
                  <span className="font-semibold text-rose-400">{patient.a1cResult}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Forecast</span>
                  <span className="font-semibold">{patient.predictedReadmissionDays} Days</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Assigned: {patient.assignedDoctor}</span>
                <button
                  onClick={() => setSelectedPatient(patient)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-medium transition"
                >
                  View Clinical Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
