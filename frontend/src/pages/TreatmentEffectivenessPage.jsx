import React from 'react';
import { Stethoscope, Activity, TrendingUp, ShieldCheck, Pill } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const TreatmentEffectivenessPage = () => {
  const trajectoryData = [
    { week: "Week 1", StandardCare: 45, AIGuidedCare: 72 },
    { week: "Week 2", StandardCare: 58, AIGuidedCare: 84 },
    { week: "Week 3", StandardCare: 64, AIGuidedCare: 91 },
    { week: "Week 4", StandardCare: 70, AIGuidedCare: 96 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-teal/20 text-medical-teal border border-medical-teal/30 text-xs font-bold uppercase tracking-wider mb-2">
          <Stethoscope className="w-4 h-4" />
          <span>Clinical Intervention Analytics</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Treatment & Recovery Intelligence</h1>
        <p className="text-xs text-slate-400">Evaluate patient recovery trajectories and medication reconciliation efficacy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Post-Discharge Compliance</p>
          <h3 className="text-2xl font-extrabold text-white">92.8%</h3>
          <p className="text-[11px] text-emerald-400 font-semibold">↑ +14.2% vs standard follow-up</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Average Recovery Velocity</p>
          <h3 className="text-2xl font-extrabold text-medical-cyan">18.4 Days</h3>
          <p className="text-[11px] text-medical-cyan font-semibold">3.8 Days faster discharge target</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Medication Errors Averted</p>
          <h3 className="text-2xl font-extrabold text-emerald-400">142 Cases</h3>
          <p className="text-[11px] text-slate-400 font-semibold">Pharmacist reconciliation pipeline</p>
        </div>
      </div>

      {/* Recovery Trajectory Chart */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">4-Week Patient Recovery Trajectory (AI-Guided vs Standard Care)</h3>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData}>
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="stdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
              <Area type="monotone" dataKey="AIGuidedCare" stroke="#06b6d4" fillOpacity={1} fill="url(#aiGrad)" name="AI-Guided Navigation" />
              <Area type="monotone" dataKey="StandardCare" stroke="#64748b" fillOpacity={1} fill="url(#stdGrad)" name="Standard Protocol Care" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
