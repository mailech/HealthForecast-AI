import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiUsers } from 'react-icons/fi';
import { POPULATION_STATS } from '../../data/dummyData';

export default function PopulationChart({ data }) {
  const chartData = data && data.length > 0 ? data : POPULATION_STATS;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <FiUsers className="text-indigo-600 dark:text-indigo-400" size={18} />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Population by Age Group</h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #334155',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Cohort Patients" />
          <Bar dataKey="readmitted" fill="#f43f5e" radius={[4, 4, 0, 0]} name="High Risk / Readmitted" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
