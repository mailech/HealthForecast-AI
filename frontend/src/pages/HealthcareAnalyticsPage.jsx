import React, { useEffect, useState } from 'react';
import { BarChart3, Filter, Calendar, TrendingDown, PieChart as PieIcon } from 'lucide-react';
import { healthApi } from '../services/api';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const HealthcareAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    healthApi.getAnalytics().then(setAnalytics);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Healthcare Analytics & Hospital Metrics</h1>
          <p className="text-xs text-slate-400">Institutional readmission rate trends, root cause analysis, and departmental benchmarks.</p>
        </div>

        <div className="flex items-center gap-3">
          <select className="py-2 px-3 rounded-xl bg-navy-900 border border-slate-700 text-xs text-slate-200">
            <option>Last 6 Months</option>
            <option>Year 2026 YTD</option>
          </select>
        </div>
      </div>

      {/* Line Chart: Monthly Readmissions Trend */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Monthly Readmissions vs Target Threshold</h3>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.monthly_readmissions || []}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Legend formatter={(v) => <span className="text-xs text-slate-300 font-medium">{v}</span>} />
              <Line type="monotone" dataKey="readmissions" stroke="#ef4444" strokeWidth={3} name="Observed Readmissions" />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} name="CMS Target Benchmark" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Reasons Breakdown & Department Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reasons Pie Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Readmission Root Cause Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.readmission_reasons || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  nameKey="reason"
                >
                  {(analytics?.readmission_reasons || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend formatter={(v) => <span className="text-xs text-slate-300 font-medium">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Departmental Readmission Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.department_performance || []}>
                <XAxis dataKey="department" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="readmission_rate" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Readmission Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
