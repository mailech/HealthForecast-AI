import React from 'react';
import { motion } from 'framer-motion';

export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'bg-blue-600',   text: 'text-blue-600' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'bg-green-600',  text: 'text-green-600' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',     icon: 'bg-red-600',    text: 'text-red-600' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-600', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-500', text: 'text-orange-500' },
    teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',   icon: 'bg-teal-600',   text: 'text-teal-600' },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trend.up ? 'text-green-600' : 'text-red-500'}`}>
              {trend.up ? '↑' : '↓'} {trend.value} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${c.icon} p-3 rounded-xl`}>
            <Icon className="text-white" size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
