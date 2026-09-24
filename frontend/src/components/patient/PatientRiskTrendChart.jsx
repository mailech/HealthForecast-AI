import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiActivity } from 'react-icons/fi';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 dark:bg-zinc-950 text-white p-3 rounded-xl shadow-xl border border-zinc-700 dark:border-zinc-800 text-xs space-y-1 z-50">
        <p className="font-bold text-zinc-300 border-b border-zinc-800 pb-1 mb-1">
          Prediction Record #{data.id}
        </p>
        <p><span className="text-zinc-400">Date:</span> <strong className="text-white">{data.dateStr}</strong></p>
        {data.timeStr && <p><span className="text-zinc-400">Time:</span> <strong className="text-white">{data.timeStr}</strong></p>}
        <p><span className="text-zinc-400">Risk Score:</span> <strong className="text-blue-400">{data.riskScore}%</strong></p>
        <p><span className="text-zinc-400">Risk Level:</span> <strong className="text-amber-400">{data.riskCategory}</strong></p>
      </div>
    );
  }
  return null;
};

export default function PatientRiskTrendChart({ history = [], loading = false }) {
  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-xs text-zinc-400">Loading risk trend history...</p>
      </div>
    );
  }

  // Requirement 5: Empty state - No prediction history
  if (!history || history.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
        <div className="w-8 h-8 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-2">
          <FiActivity size={16} />
        </div>
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          No risk prediction history available for this patient.
        </p>
      </div>
    );
  }

  // Sort chronologically (earliest to latest)
  const sorted = [...history].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : a.id;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : b.id;
    return timeA - timeB;
  });

  const chartData = sorted.map((pred, index) => {
    const dateObj = pred.created_at ? new Date(pred.created_at) : null;
    const dateStr = dateObj
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : `Record #${pred.id}`;
    const timeStr = dateObj
      ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      : '';
    const shortLabel = dateObj
      ? `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : `P${index + 1}`;

    return {
      id: pred.id,
      index: index + 1,
      shortLabel,
      dateStr,
      timeStr,
      riskScore: Number(pred.readmission_risk_score),
      riskCategory: pred.risk_category || 'Low',
    };
  });

  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  const latestRisk = latest ? Number(latest.readmission_risk_score) : null;
  const previousRisk = previous ? Number(previous.readmission_risk_score) : null;

  let trendLabel = null;
  let trendClass = '';
  let TrendIcon = null;

  if (previousRisk !== null && latestRisk !== null) {
    const diff = Math.round((latestRisk - previousRisk) * 10) / 10;
    if (diff > 0) {
      trendLabel = `Increased (+${diff}%)`;
      trendClass = 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400';
      TrendIcon = FiTrendingUp;
    } else if (diff < 0) {
      trendLabel = `Decreased (${diff}%)`;
      trendClass = 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400';
      TrendIcon = FiTrendingDown;
    } else {
      trendLabel = 'Stable (0%)';
      trendClass = 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400';
      TrendIcon = FiMinus;
    }
  }

  // Requirement 6: Single prediction state
  const isSinglePrediction = sorted.length === 1;

  return (
    <div className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <FiActivity className="text-blue-600 dark:text-blue-400" size={15} />
            Patient Risk Trend
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Chronological readmission risk score progression across historical evaluations.
          </p>
        </div>

        {trendLabel && TrendIcon && (
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${trendClass}`}>
            <TrendIcon size={14} />
            <span>Mathematical Trend: {trendLabel}</span>
          </div>
        )}
      </div>

      {/* GRAPH AREA */}
      <div className="w-full h-52 bg-white dark:bg-zinc-900/90 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#71717a" opacity={0.15} />
            <XAxis
              dataKey="shortLabel"
              tick={{ fontSize: 10, fill: '#71717a' }}
              axisLine={{ stroke: '#d4d4d8' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickFormatter={(val) => `${val}%`}
              axisLine={{ stroke: '#d4d4d8' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="riskScore"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SINGLE PREDICTION NOTICE */}
      {isSinglePrediction && (
        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300">
          Only one prediction is available. More predictions will appear as the patient's risk history grows.
        </div>
      )}

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Latest Risk</span>
          <span className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5 block">
            {latestRisk !== null ? `${latestRisk}%` : 'N/A'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Previous Risk</span>
          <span className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5 block">
            {previousRisk !== null ? `${previousRisk}%` : 'N/A'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Evaluations Count</span>
          <span className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5 block">
            {sorted.length} Record{sorted.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </div>
  );
}
