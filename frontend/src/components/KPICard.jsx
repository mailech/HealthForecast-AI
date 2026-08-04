import React from 'react';

export const KPICard = ({ title, value, change, changeType = 'positive', icon: Icon, color = 'medical-cyan' }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
          {change && (
            <p className={`text-[11px] font-bold mt-2 flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{change}</span>
              <span className="text-slate-500 font-normal">vs last month</span>
            </p>
          )}
        </div>
        
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-medical-cyan shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative gradient light */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-medical-cyan/5 blur-2xl pointer-events-none"></div>
    </div>
  );
};
