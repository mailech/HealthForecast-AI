import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiAlertTriangle, FiActivity,
  FiClock, FiSearch, FiArrowUp, FiArrowDown,
  FiHeart, FiEye, FiMoreHorizontal, FiZap,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import RiskBadge from '../../components/common/RiskBadge';
import AdmissionsChart from '../../components/charts/AdmissionsChart';
import RiskDistributionChart from '../../components/charts/RiskDistributionChart';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import api from '../../services/api';
import {
  PATIENTS, APPOINTMENTS, RISK_ALERTS, RECENT_ACTIVITY,
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

/* ── static config ── */
const APPT_STYLE = {
  confirmed: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending:   { dot: 'bg-yellow-500',  badge: 'bg-yellow-50  text-yellow-700  border-yellow-200'  },
  cancelled: { dot: 'bg-red-500',     badge: 'bg-red-50     text-red-700     border-red-200'     },
};

const STATUS_STYLE = {
  critical: 'bg-purple-100 text-purple-700 border-purple-200',
  stable:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  admitted: 'bg-blue-100 text-blue-700 border-blue-200',
};

const ALERT_STYLE = {
  critical: { bar: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800/40', badge: 'bg-purple-100 text-purple-700' },
  high:     { bar: 'bg-red-500',    bg: 'bg-red-50    dark:bg-red-900/10',    border: 'border-red-200    dark:border-red-800/40',    badge: 'bg-red-100    text-red-700'    },
};

const KPI_CONFIG = [
  { title: 'Assigned Patients',    value: PATIENTS.length,    icon: FiUsers,         color: 'blue',   sub: 'Active cases',      trend: { up: true,  val: '2 new today' } },
  { title: "Today's Appointments", value: APPOINTMENTS.length, icon: FiCalendar,      color: 'emerald',sub: 'Scheduled today',   trend: { up: true,  val: '1 confirmed'  } },
  { title: 'Risk Alerts',          value: RISK_ALERTS.length,  icon: FiAlertTriangle, color: 'red',    sub: 'Require attention', trend: { up: false, val: 'Urgent'        } },
  { title: 'Avg Risk Score',       value: '67%',               icon: FiActivity,      color: 'violet', sub: 'Across all patients',trend: { up: false, val: '+3% this week' } },
];

const KPI_COLORS = {
  blue:   { icon: 'bg-blue-600',    text: 'text-blue-600',   light: 'bg-blue-50   dark:bg-blue-900/20',   ring: 'shadow-blue-500/15'   },
  emerald:{ icon: 'bg-emerald-600', text: 'text-emerald-600',light: 'bg-emerald-50 dark:bg-emerald-900/20',ring: 'shadow-emerald-500/15' },
  red:    { icon: 'bg-red-500',     text: 'text-red-600',    light: 'bg-red-50    dark:bg-red-900/20',    ring: 'shadow-red-500/15'    },
  violet: { icon: 'bg-violet-600',  text: 'text-violet-600', light: 'bg-violet-50 dark:bg-violet-900/20', ring: 'shadow-violet-500/15' },
};

const QUICK_ACTIONS = [
  { label: 'New Prediction', icon: FiZap,      color: 'bg-blue-600   hover:bg-blue-700'   },
  { label: 'Add Patient',    icon: FiUsers,    color: 'bg-violet-600 hover:bg-violet-700' },
  { label: 'Schedule',       icon: FiCalendar, color: 'bg-emerald-600 hover:bg-emerald-700'},
  { label: 'View Reports',   icon: FiActivity, color: 'bg-orange-500 hover:bg-orange-600' },
];

/* ── sub-components ── */
function KpiCard({ title, value, icon: Icon, color, sub, trend, delay }) {
  const c = KPI_COLORS[color] || KPI_COLORS.blue;
  return (
    <motion.div {...fadeUp(delay)}
      whileHover={{ y: -3, boxShadow: '0 12px 32px -4px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-card cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center shadow-lg ${c.ring}`}>
          <Icon className="text-white" size={20} />
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${trend.up ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'} flex items-center gap-1`}>
          {trend.up ? <FiArrowUp size={9} /> : <FiArrowDown size={9} />}
          {trend.val}
        </span>
      </div>
      <p className={`text-3xl font-extrabold ${c.text} leading-none mb-1`}>{value}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </motion.div>
  );
}

/* ── main component ── */
export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  useEffect(() => {
    analyticsService.getDashboard().then(setMetrics).catch(() => setMetrics(null));
    api.get('/appointments/').then((response) => setAppointments(response.data)).catch(() => setAppointments([]));
  }, []);
  const greeting = useMemo(() => getGreeting(), []);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const livePatients = (metrics?.recent_predictions || []).map((prediction) => ({
    id: prediction.patient_id,
    name: prediction.patient_name,
    age: '—',
    gender: '—',
    department: '—',
    diagnosis: '—',
    riskScore: prediction.risk_score,
    riskLevel: prediction.risk_category.toLowerCase(),
    status: prediction.risk_category.toLowerCase(),
  }));
  const filtered = livePatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const liveKpis = [
    { title: 'Assigned Patients', value: metrics?.total_patients || 0, icon: FiUsers, color: 'blue', sub: 'Live patient records', trend: { up: true, val: 'Database' } },
    { title: "Today's Appointments", value: metrics?.appointments_today || 0, icon: FiCalendar, color: 'emerald', sub: 'Scheduled today', trend: { up: true, val: 'Database' } },
    { title: 'Risk Alerts', value: metrics?.high_risk_patients || 0, icon: FiAlertTriangle, color: 'red', sub: 'High-risk predictions', trend: { up: false, val: 'Review' } },
    { title: 'Avg Risk Score', value: `${metrics?.average_risk_score || 0}%`, icon: FiActivity, color: 'violet', sub: 'Stored predictions', trend: { up: false, val: 'Model' } },
  ];
  const liveAlerts = livePatients.filter((patient) => patient.riskLevel === 'high').map((patient) => ({
    id: patient.id, patient: patient.name, message: `High readmission risk detected (${patient.riskScore}%)`, severity: 'high', time: 'Latest forecast',
  }));

  return (
    <DashboardLayout>

      {/* ══════════════════════════════════════
          WELCOME HEADER
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}
        className="relative overflow-hidden rounded-3xl mb-6 p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #7c3aed 100%)' }}>

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Blobs */}
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

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
                Welcome Back, {user?.full_name} 👋
              </motion.h1>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="text-white/60 text-sm mt-0.5">
                Hope you have a productive day.
              </motion.p>
            </div>
          </div>

          {/* Right — date + role badge */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:items-end gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/25">
              <FiHeart size={11} className="text-red-300" /> Doctor
            </span>
            <span className="text-white/50 text-xs font-medium">{today}</span>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative mt-6 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.button key={i} whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate({ 'New Prediction': '/risk-analyzer', 'Add Patient': '/patients', Schedule: '/appointments', 'View Reports': '/reports' }[a.label])}
              className={`flex items-center gap-2 ${a.color} text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-md`}>
              <a.icon size={13} />
              {a.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════
          KPI CARDS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {liveKpis.map((k, i) => (
          <KpiCard key={i} {...k} delay={0.05 + i * 0.07} />
        ))}
      </div>

      {/* ══════════════════════════════════════
          RISK ALERTS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.28)} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiAlertTriangle className="text-red-500" size={14} />
            </span>
            Active Risk Alerts
          </h2>
          <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-2.5 py-1 rounded-full">
            {liveAlerts.length} Active
          </span>
        </div>

        <div className="space-y-2.5">
          {liveAlerts.map((alert, i) => {
            const s = ALERT_STYLE[alert.severity] || ALERT_STYLE.high;
            return (
              <motion.div key={alert.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 + i * 0.08 }}
                whileHover={{ x: 4 }}
                className={`relative flex items-center justify-between gap-4 rounded-2xl px-5 py-4 border ${s.bg} ${s.border} overflow-hidden`}>
                {/* Left accent bar */}
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-2xl`} />
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${s.badge} flex items-center justify-center flex-shrink-0`}>
                    <FiAlertTriangle size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{alert.patient}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-400 whitespace-nowrap">{alert.time}</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full border ${s.badge}`}>
                    {alert.severity}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          CHARTS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.38)} className="grid lg:grid-cols-2 gap-6 mb-6">
        <AdmissionsChart />
        <RiskDistributionChart />
      </motion.div>

      {/* ══════════════════════════════════════
          PATIENT TABLE + SIDEBAR PANELS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.46)} className="grid lg:grid-cols-3 gap-6">

        {/* Patient table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Patient List</h3>
              <p className="text-xs text-slate-400 mt-0.5">{filtered.length} live prediction records</p>
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search patients…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-8 py-2 text-xs w-44"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/40">
                  {['Patient', 'Age', 'Diagnosis', 'Risk Score', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60">
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <FiUsers size={20} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No patients found</p>
                          <p className="text-xs text-slate-400">Try a different search term</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, i) => (
                      <motion.tr key={`${p.id}-${p.riskScore}-${i}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="group hover:bg-blue-50/40 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                        {/* Patient */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 shadow-sm">
                              {p.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.gender} · {p.department}</p>
                            </div>
                          </div>
                        </td>
                        {/* Age */}
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-sm font-medium">{p.age}</td>
                        {/* Diagnosis */}
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-sm max-w-[140px] truncate">{p.diagnosis}</td>
                        {/* Risk */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p.riskScore}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                                className={`h-full rounded-full ${p.riskScore >= 80 ? 'bg-red-500' : p.riskScore >= 60 ? 'bg-orange-400' : p.riskScore >= 40 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                              />
                            </div>
                            <RiskBadge level={p.riskLevel} score={p.riskScore} />
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[p.status] || STATUS_STYLE.admitted}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {p.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Appointments */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiCalendar size={12} className="text-blue-600" />
                </span>
                Today's Appointments
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800/40">
                {appointments.length} total
              </span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700/60">
              {appointments.map((a, i) => {
                const s = APPT_STYLE[a.status] || APPT_STYLE.pending;
                return (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    whileHover={{ backgroundColor: 'rgba(59,130,246,0.03)' }}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{a.patient_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.appointment_date} · {a.appointment_time}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize flex-shrink-0 ${s.badge}`}>
                      {a.status}
                    </span>
                  </motion.div>
                );
              })}
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
            <div className="px-5 py-3 space-y-0">
              {RECENT_ACTIVITY.map((a, i) => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.06 }}
                  className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-slate-700/60 last:border-0">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center flex-shrink-0 mt-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500" />
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
