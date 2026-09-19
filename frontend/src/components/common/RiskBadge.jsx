import React from 'react';

const config = {
  low: { label: 'Low Risk', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900' },
  medium: { label: 'Medium Risk', classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900' },
  high: { label: 'High Risk', classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900' },
  critical: { label: 'Critical Risk', classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-800' },
  not_predicted: { label: 'Not Predicted', classes: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

export default function RiskBadge({ level, score }) {
  const normLevel = level ? level.toString().toLowerCase().replace(/[\s-]+/g, '_') : 'not_predicted';
  const item = config[normLevel] || config.not_predicted;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {item.label}{score !== undefined && score !== null && ` (${score}%)`}
    </span>
  );
}
