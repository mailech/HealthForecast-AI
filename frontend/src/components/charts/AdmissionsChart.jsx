import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MONTHLY_ADMISSIONS } from '../../data/dummyData';

export default function AdmissionsChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Monthly Admissions vs Readmissions</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={MONTHLY_ADMISSIONS} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2} fill="url(#admGrad)" name="Admissions" />
          <Area type="monotone" dataKey="readmissions" stroke="#ef4444" strokeWidth={2} fill="url(#readGrad)" name="Readmissions" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
