import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPICardProps {
  id?: string;
  label?: string;
  title?: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive?: boolean; // positive means good in clinical context
    direction?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon: any;
  supportingText?: string;
  subtitle?: string;
  indicatorColor?: string;
  color?: string;
  accentColor?: string;
  badge?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  label,
  title,
  value,
  trend,
  icon,
  supportingText,
  subtitle,
  indicatorColor,
  color,
  accentColor,
  badge
}) => {
  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || supportingText;
  const chosenColor = color || accentColor || indicatorColor || 'blue';

  const colorStyles: Record<string, string> = {
    blue: 'text-sky-600 bg-sky-50 border-sky-100',
    sky: 'text-sky-600 bg-sky-50 border-sky-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    yellow: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    teal: 'text-teal-600 bg-teal-50 border-teal-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100'
  };

  const activeColorStyle = colorStyles[chosenColor] || colorStyles.blue;

  // Safe icon rendering that supports both:
  // 1. React elements: icon={<Users className="w-5 h-5" />}
  // 2. React component functions/forwardRefs: icon={Users}
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  const cardId = id || `kpi-${displayTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'card'}`;

  return (
    <div
      id={cardId}
      className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{displayTitle}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {badge}
            </span>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border shrink-0 ${activeColorStyle}`}>
          {renderIcon()}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{value}</span>
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}
            >
              {trend.direction === 'down' ? (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              ) : trend.direction === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              ) : trend.isPositive ? (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>

        {displaySubtitle && (
          <p className="mt-2 text-xs text-slate-500 font-normal leading-relaxed">{displaySubtitle}</p>
        )}
      </div>
    </div>
  );
};

