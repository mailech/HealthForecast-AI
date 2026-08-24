import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiTrendingUp, FiActivity, FiPercent,
  FiClock, FiAlertCircle, FiArrowUp, FiArrowDown,
  FiBarChart2, FiDownload, FiRefreshCw, FiCheckCircle,
  FiAlertTriangle, FiInfo, FiCalendar, FiBriefcase,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import AdmissionsChart from '../../components/charts/AdmissionsChart';
import DepartmentChart from '../../components/charts/DepartmentChart';
import RiskDistributionChart from '../../components/charts/RiskDistributionChart';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import {
  HOSPITAL_KPIS, DEPARTMENT_STATS, RECENT_ACTIVITY, NOTIFICATIONS,
} from '../../data/dummyData';

/* ── helpers ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning',   emoji: '☀️' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
  return              { text: 'Good Evening',   emoji: '🌙' };
}

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

/* ── KPI config ── */
const KPI_LIST = [
  {
    title: 'Total Patients',
    value: HOSPITAL_KPIS.totalPatients.toLocaleString(),
    icon: FiUsers,
    color: 'blue',
    trend: { up: true,  label: '+48 this month' },
    sub: 'Registered patients',
  },
  {
    title: 'Appointments Today',
    value: HOSPITAL_KPIS.admissionsToday,
    icon: FiActivity,
    color: 'emerald',
    trend: { up: true,  label: '+3 vs yesterday' },
    sub: 'New admissions',
  },
  {
    title: 'Readmission Rate',
    value: `${HOSPITAL_KPIS.readmissionRate}%`,
    icon: FiPercent,
    color: 'red',
    trend: { up: false, label: '-1.2% this week' },
    sub: '30-day rate',
  },
  {
    title: 'Average Risk Score',
    value: '—',
    icon: FiClock,
    color: 'violet',
    trend: { up: false, label: '-0.3 vs last month' },
    sub: 'Length of stay',
  },
  {
    title: 'Bed Occupancy',
    value: '—',
    icon: FiTrendingUp,
    color: 'orange',
    trend: { up: true,  label: '+5% this week' },
    sub: 'Current capacity',
  },
  {
    title: 'Critical Patients',
    value: '—',
    icon: FiAlertCircle,
    color: 'rose',
    trend: { up: false, label: '2 new today' },
    sub: 'Require urgent care',
  },
];

const KPI_COLORS = {
  blue:   { grad: 'from-blue-500 to-blue-700',     text: 'text-blue-600',   light: 'bg-blue-50   dark:bg-blue-900/20',   shadow: 'shadow-blue-500/20'   },
  emerald:{ grad: 'from-emerald-500 to-emerald-700',text: 'text-emerald-600',light: 'bg-emerald-50 dark:bg-emerald-900/20',shadow: 'shadow-emerald-500/20' },
  red:    { grad: 'from-red-500 to-red-700',        text: 'text-red-600',    light: 'bg-red-50    dark:bg-red-900/20',    shadow: 'shadow-red-500/20'    },
  violet: { grad: 'from-violet-500 to-violet-700',  text: 'text-violet-600', light: 'bg-violet-50 dark:bg-violet-900/20', shadow: 'shadow-violet-500/20' },
  orange: { grad: 'from-orange-400 to-orange-600',  text: 'text-orange-600', light: 'bg-orange-50 dark:bg-orange-900/20', shadow: 'shadow-orange-500/20' },
  rose:   { grad: 'from-rose-500 to-rose-700',      text: 'text-rose-600',   light: 'bg-rose-50   dark:bg-rose-900/20',   shadow: 'shadow-rose-500/20'   },
};

/* revenue / occupancy mini-stats */
const MINI_STATS = [
  { label: 'Monthly Revenue',   value: '—', change: 'Unavailable', up: true, icon: FiBarChart2 },
  { label: 'Surgeries Today',   value: '—', change: 'Unavailable', up: true, icon: FiActivity },
  { label: 'Staff On Duty',     value: '—', change: 'Unavailable', up: true, icon: FiBriefcase },
  { label: 'Discharges Today',  value: '—', change: 'Unavailable', up: true, icon: FiCheckCircle },
];

/* dept performance color */
function perfColor(score) {
  if (score >= 90) return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Excellent' };
  if (score >= 80) return { bar: 'bg-blue-500',    badge: 'bg-blue-50    text-blue-700    border-blue-200',    label: 'Good'      };
  return                  { bar: 'bg-yellow-500',  badge: 'bg-yellow-50  text-yellow-700  border-yellow-200',  label: 'Needs Work' };
}

/* notif icon */
const NOTIF_ICON = {
  critical: <FiAlertTriangle size={13} className="text-red-500" />,
  info:     <FiInfo          size={13} className="text-blue-500" />,
  success:  <FiCheckCircle   size={13} className="text-emerald-500" />,
};

/* ── KpiCard sub-component ── */
function KpiCard({ title, value, icon: Icon, color, trend, sub, delay }) {
  const c = KPI_COLORS[color] || KPI_COLORS.blue;
  return (
    <motion.div {...fadeUp(delay)}
      whileHover={{ y: -3, boxShadow: '0 16px 40px -8px rgba(0,0,0,0.12)' }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-card cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-lg ${c.shadow}`}>
          <Icon className="text-white" size={19} />
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border
          ${trend.up
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-600 border-red-200'}`}>
          {trend.up ? <FiArrowUp size={9} /> : <FiArrowDown size={9} />}
          {trend.label}
        </span>
      </div>
      <p className={`text-3xl font-extrabold ${c.text} leading-none mb-1`}>{value}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  useEffect(() => { analyticsService.getDashboard().then(setMetrics).catch(() => setMetrics(null)); }, []);
  const greeting = useMemo(() => getGreeting(), []);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>

      {/* ══════════════════════════════════════
          WELCOME HEADER
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}
        className="relative overflow-hidden rounded-3xl mb-6 p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #2563eb 100%)' }}>

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Blobs */}
        <motion.div animate={{ scale: [1, 1.18, 1], rotate: [0, 12, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Left */}
          <div className="flex items-center gap-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-xl font-extrabold shadow-lg flex-shrink-0">
              {initials}
            </motion.div>
            <div>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-white/70 text-sm font-medium flex items-center gap-1.5">
                {greeting.emoji} {greeting.text}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                Welcome Back, {user?.name} 👋
              </motion.h1>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="text-white/60 text-sm mt-0.5">
                Hospital-wide performance overview and analytics.
              </motion.p>
            </div>
          </div>

          {/* Right */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:items-end gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/25">
              🏥 Hospital Administrator
            </span>
            <span className="text-white/50 text-xs font-medium">{today}</span>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative mt-6 flex flex-wrap gap-2">
          {[
            { label: 'Generate Report', icon: FiDownload,   bg: 'bg-white/20 hover:bg-white/30' },
            { label: 'View Analytics',  icon: FiBarChart2,  bg: 'bg-white/20 hover:bg-white/30' },
            { label: 'Refresh Data',    icon: FiRefreshCw,  bg: 'bg-white/20 hover:bg-white/30' },
            { label: 'Appointments',    icon: FiCalendar,   bg: 'bg-white/20 hover:bg-white/30' },
          ].map((a, i) => (
            <motion.button key={i} onClick={() => ({ 'Generate Report': () => navigate('/reports'), 'View Analytics': () => navigate('/analytics'), 'Refresh Data': () => window.location.reload(), Appointments: () => navigate('/appointments') }[a.label]())} whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-2 ${a.bg} backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20`}>
              <a.icon size={13} />
              {a.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════
          6 KPI CARDS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {KPI_LIST.map((k, i) => (
          <KpiCard key={i} {...k} delay={0.05 + i * 0.06} value={[
            metrics?.total_patients,
            metrics?.appointments_today,
            metrics?.readmission_rate !== undefined ? `${metrics.readmission_rate}%` : undefined,
            metrics?.average_risk_score !== undefined ? `${metrics.average_risk_score}%` : undefined,
          ][i] ?? k.value} />
        ))}
      </div>

      {/* ══════════════════════════════════════
          MINI STATS ROW
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.42)}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {MINI_STATS.map((s, i) => (
          <motion.div key={i}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl px-5 py-4 border border-slate-100 dark:border-slate-700 shadow-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <s.icon size={18} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-medium truncate">{s.label}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{s.value}</p>
                <span className={`text-[10px] font-bold ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {s.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════
          CHARTS ROW 1
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.5)} className="grid lg:grid-cols-2 gap-6 mb-6">
        <AdmissionsChart />
        <RiskDistributionChart data={metrics?.risk_distribution || []} />
      </motion.div>

      {/* ══════════════════════════════════════
          DEPARTMENT BAR CHART
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.56)} className="mb-6">
        <DepartmentChart />
      </motion.div>

      {/* ══════════════════════════════════════
          DEPARTMENT TABLE + ACTIVITY PANEL
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.62)} className="grid lg:grid-cols-3 gap-6">

        {/* Department performance table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Department Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">{DEPARTMENT_STATS.length} departments tracked</p>
            </div>
            <motion.button disabled title="Department export is not available from the current API" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">
              <FiDownload size={12} /> Export
            </motion.button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/40">
                  {['Department', 'Patients', 'Readmissions', 'Performance', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60">
                {DEPARTMENT_STATS.map((d, i) => {
                  const p = perfColor(d.performance);
                  return (
                    <motion.tr key={i}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.65 + i * 0.05 }}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors cursor-default">

                      {/* Department */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-extrabold shadow-sm flex-shrink-0">
                            {d.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{d.name}</span>
                        </div>
                      </td>

                      {/* Patients */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{d.patients}</span>
                      </td>

                      {/* Readmissions */}
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${d.readmissions > 25 ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {d.readmissions}
                        </span>
                      </td>

                      {/* Performance bar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[80px] h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${d.performance}%` }}
                              transition={{ duration: 0.9, delay: 0.7 + i * 0.06, ease: 'easeOut' }}
                              className={`h-full rounded-full ${p.bar}`}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums w-10">
                            {d.performance}%
                          </span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${p.badge}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {p.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiAlertCircle size={12} className="text-red-500" />
                </span>
                Notifications
              </h3>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-2 py-1 rounded-full">
                {NOTIFICATIONS.filter(n => !n.read).length} unread
              </span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700/60">
              {NOTIFICATIONS.map((n, i) => (
                <motion.div key={n.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.68 + i * 0.06 }}
                  className={`px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer
                    ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">{NOTIF_ICON[n.type] || NOTIF_ICON.info}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <FiClock size={12} className="text-violet-600" />
                </span>
                Recent Activity
              </h3>
            </div>
            <div className="px-5 py-3">
              {RECENT_ACTIVITY.map((a, i) => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.06 }}
                  className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-slate-700/60 last:border-0">
                  <div className="flex flex-col items-center flex-shrink-0 mt-1">
                    <span className="w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-500" />
                    {i < RECENT_ACTIVITY.length - 1 && (
                      <span className="w-px flex-1 bg-slate-100 dark:bg-slate-700 mt-1 min-h-[16px]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">{a.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{a.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}
