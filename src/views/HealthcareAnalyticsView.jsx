import React from 'react';
import { BarChart3, Download, TrendingUp, Users, Building, ShieldCheck, FileText } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { HOSPITAL_ANALYTICS } from '../data/mockData';

export const HealthcareAnalyticsView = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Healthcare Analytics & Hospital Performance Reports
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
              PDF Module 6 Requirement
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Hospital-wide operational metrics, readmission benchmarks, and clinical outcome trends
          </p>
        </div>

        <button
          onClick={() => alert("Full Hospital Analytics PDF Report generated and ready for download.")}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall 30-Day Readmission</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">14.2%</h3>
          <p className="text-[11px] text-emerald-400 mt-1">Goal: &lt;11.5% by Q4 2026</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Evaluated Encounters</p>
          <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">101,766</h3>
          <p className="text-[11px] text-slate-400 mt-1">Diabetes 130-US Dataset</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Intervention Success Rate</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">88.4%</h3>
          <p className="text-[11px] text-slate-400 mt-1">High-risk care plan compliance</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Readmission Trend vs National Benchmark (16.5%)</h3>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HOSPITAL_ANALYTICS.monthlyReadmissionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[12, 20]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
              <Line type="monotone" dataKey="actual" name="Hospital Readmission %" stroke="#06b6d4" strokeWidth={3} />
              <Line type="monotone" dataKey="benchmark" name="National Benchmark %" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
