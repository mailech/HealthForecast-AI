import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from './RoleBadge';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

export default function WelcomeHeader({ subtitle }) {
  const { user } = useAuth();
  const greeting = useMemo(() => getGreeting(), []);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const userName = user?.full_name || user?.name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 mb-6 flex items-center justify-between flex-wrap gap-4 shadow-xs"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-base font-extrabold shadow-sm shadow-blue-500/20 flex-shrink-0"
        >
          {initials}
        </motion.div>

        <div>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
          >
            {greeting.emoji} {greeting.text}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight"
          >
            Welcome Back, {userName}
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
        <RoleBadge role={user?.role} />
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{today}</span>
      </div>
    </motion.div>
  );
}
