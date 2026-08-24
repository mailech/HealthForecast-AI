import React from 'react';

const config = {
  low:      { label: 'Low Risk',  classes: 'bg-green-100 text-green-700 border-green-200' },
  medium:   { label: 'Medium',    classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  high:     { label: 'High Risk', classes: 'bg-red-100 text-red-700 border-red-200' },
  critical: { label: 'Critical',  classes: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function RiskBadge({ level, score }) {
  const { label, classes } = config[level] || config.low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}{score !== undefined && ` (${score}%)`}
    </span>
  );
}
