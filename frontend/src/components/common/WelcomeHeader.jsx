import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../data/dummyData';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

const roleTheme = {
  doctor:       { accent: 'from-blue-600 to-indigo-600',   light: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-100 dark:border-blue-800/40',   tag: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  hospital_admin: { accent: 'from-purple-600 to-indigo-600', light: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800/40', tag: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
  researcher:   { accent: 'from-teal-600 to-green-600',    light: 'bg-teal-50 dark:bg-teal-900/20',    border: 'border-teal-100 dark:border-teal-800/40',    tag: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' },
  system_admin: { accent: 'from-orange-500 to-red-500',    light: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-800/40', tag: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' },
};

export default function WelcomeHeader({ subtitle }) {
  const { user } = useAuth();
  const greeting = useMemo(() => getGreeting(), []);
  const normalizedRole = user?.role?.toString().toLowerCase().replace(/\s+/g, '_');
  const theme = roleTheme[normalizedRole] || roleTheme.doctor;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border ${theme.light} ${theme.border} p-5 mb-6 flex items-center justify-between flex-wrap gap-4`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.accent} flex items-center justify-center text-white text-lg font-extrabold shadow-lg flex-shrink-0`}
        >
          {initials}
        </motion.div>

        <div>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
          >
            {greeting.emoji} {greeting.text}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5"
          >
            Welcome Back, {user?.full_name} 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
          >
            {subtitle || 'Hope you have a productive day.'}
          </motion.p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${theme.tag}`}>
          {ROLE_LABELS[normalizedRole] || user?.role}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{today}</span>
      </div>
    </motion.div>
  );
}
