import React from 'react';
import { motion } from 'framer-motion';

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-white tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className="text-xs font-semibold mt-2 text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <span>{trend.up ? '↑' : '↓'}</span>
              <span>{trend.value || trend.val}</span>
              {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${color?.bg || 'bg-blue-50 dark:bg-blue-950/50'} ${color?.text || 'text-blue-600 dark:text-blue-400'} p-2.5 rounded-xl ${color?.border || 'border-blue-100 dark:border-blue-900/60'} border shadow-xs flex-shrink-0`}>
            <Icon size={19} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
