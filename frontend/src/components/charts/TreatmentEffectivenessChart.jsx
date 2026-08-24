import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { treatment: 'Medication A', effectiveness: 82, sideEffects: 12 },
  { treatment: 'Medication B', effectiveness: 74, sideEffects: 18 },
  { treatment: 'Surgery', effectiveness: 91, sideEffects: 24 },
  { treatment: 'Therapy', effectiveness: 68, sideEffects: 6 },
  { treatment: 'Combined', effectiveness: 88, sideEffects: 15 },
];

export default function TreatmentEffectivenessChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Treatment Effectiveness</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="treatment" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="effectiveness" fill="#22c55e" radius={[4, 4, 0, 0]} name="Effectiveness %" />
          <Bar dataKey="sideEffects" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Side Effects %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
