import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { TREND_DATA } from '../../data/dummyData';

export default function TrendChart({ data, insufficient = false, granularity = 'week', onGranularityChange }) {
  const chartData = data && data.length > 0 ? data : (insufficient ? [] : TREND_DATA);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-blue-600 dark:text-blue-400" size={18} />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Risk & Readmission Trend</h3>
        </div>
        {onGranularityChange && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onGranularityChange('week')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                granularity === 'week'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => onGranularityChange('month')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                granularity === 'month'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Month
            </button>
          </div>
        )}
      </div>

      {insufficient || !chartData || chartData.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <FiAlertCircle size={24} className="text-amber-500 mb-2" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Insufficient historical data</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Not enough prediction timeline records in the database to render trends.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={data ? "period" : "week"} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
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
            <Line type="monotone" dataKey={data ? "avg_risk" : "predicted"} stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name={data ? "Avg Risk (%)" : "Predicted"} />
            <Line type="monotone" dataKey={data ? "readmission_count" : "actual"} stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} strokeDasharray="5 5" name={data ? "High Risk / Readmissions" : "Actual"} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
