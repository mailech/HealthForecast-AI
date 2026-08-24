import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DEPARTMENT_STATS } from '../../data/dummyData';

export default function DepartmentChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Department Performance</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={DEPARTMENT_STATS} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Patients" />
          <Bar dataKey="readmissions" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Readmissions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
