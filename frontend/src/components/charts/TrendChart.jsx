import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TREND_DATA } from '../../data/dummyData';

export default function TrendChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Predicted vs Actual Readmissions</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={TREND_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Predicted" />
          <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} strokeDasharray="5 5" name="Actual" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
