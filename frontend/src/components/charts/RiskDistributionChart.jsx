import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

export default function RiskDistributionChart({ data = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Patient Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" nameKey="name">
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.name] || '#64748b'} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
