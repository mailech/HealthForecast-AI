import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (status === 'Admitted' || status === 'Active Inpatient') {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (status === 'Discharge Planning') {
    badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (status === 'Discharged') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (status === 'Observation') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${badgeStyle}`}
    >
      {status}
    </span>
  );
};
