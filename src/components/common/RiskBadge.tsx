import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const styles = {
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
    LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20',
  };

  const dotColors = {
    HIGH: 'bg-rose-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-emerald-500',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      id={`risk-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ${styles[level]} ${sizeClasses[size]} tracking-wide uppercase transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[level]} animate-pulse`} />
      {level} RISK {score !== undefined ? `(${score}%)` : ''}
    </span>
  );
};
