import React from 'react';
import { ROLE_LABELS } from '../../data/dummyData';

const ROLE_CLASSES = {
  doctor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  hospital_admin: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
  researcher: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  system_admin: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
};

export default function RoleBadge({ role }) {
  const normalized = (role || '').toString().toLowerCase().replace(/\s+/g, '_');
  const badgeClass = ROLE_CLASSES[normalized] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
      {ROLE_LABELS[normalized] || role}
    </span>
  );
}
