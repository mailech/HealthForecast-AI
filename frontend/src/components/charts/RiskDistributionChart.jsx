import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FiPieChart } from 'react-icons/fi';

const COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

export default function RiskDistributionChart({ data = [] }) {
  const total = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
  const hasData = total > 0;

  const lowCount = data.find(d => d.name === 'Low')?.value || 0;
  const medCount = data.find(d => d.name === 'Medium')?.value || 0;
  const highCount = data.find(d => d.name === 'High')?.value || 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FiPieChart size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Patient Risk Distribution</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">ML Cohort Breakdown</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {total} {total === 1 ? 'Patient' : 'Patients'}
        </span>
      </div>

      {!hasData ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500 flex items-center justify-center mb-3">
            <FiPieChart size={22} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Predictions Available</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
            Create a patient risk prediction to see distribution analysis here.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-12 gap-4 items-center">
          {/* Donut Chart Container */}
          <div className="sm:col-span-7 relative h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#64748b'} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{total}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="sm:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">High Risk</span>
              </div>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">{highCount}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Medium Risk</span>
              </div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">{medCount}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-2">
                <span className="text-w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Low Risk</span>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{lowCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

