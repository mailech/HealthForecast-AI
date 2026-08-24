import React from 'react';
import { ROLE_LABELS } from '../../data/dummyData';

const colors = {
  doctor:       'bg-blue-100 text-blue-700 border-blue-200',
  hospital_admin: 'bg-purple-100 text-purple-700 border-purple-200',
  researcher:   'bg-green-100 text-green-700 border-green-200',
  system_admin: 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
