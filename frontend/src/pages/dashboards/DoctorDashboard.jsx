import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiAlertTriangle, FiActivity,
  FiSearch, FiArrowUp, FiArrowDown,
  FiHeart, FiZap,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import RiskBadge from '../../components/common/RiskBadge';
import AdmissionsChart from '../../components/charts/AdmissionsChart';
import RiskDistributionChart from '../../components/charts/RiskDistributionChart';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import api from '../../services/api';

/* ── helpers ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

const APPT_STYLE = {
  scheduled: { dot: 'bg-blue-500', badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900' },
  completed: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' },
  missed: { dot: 'bg-rose-500', badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900' },
  cancelled: { dot: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
  confirmed: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' },
  pending: { dot: 'bg-amber-500', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900' },
};

const STATUS_STYLE = {
  high: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
};

const ALERT_STYLE = {
  critical: { bar: 'bg-rose-500', bg: 'bg-rose-50/60 dark:bg-rose-950/30', border: 'border-rose-200/90 dark:border-rose-900/60', badge: 'bg-rose-600 text-white' },
  high: { bar: 'bg-amber-500', bg: 'bg-amber-50/60 dark:bg-amber-950/30', border: 'border-amber-200/90 dark:border-amber-900/60', badge: 'bg-amber-600 text-white' },
};

const QUICK_ACTIONS = [
  { label: 'New Prediction', icon: FiZap, route: '/risk-analyzer', primary: true },
  { label: 'Add Patient', icon: FiUsers, route: '/patients' },
  { label: 'Schedule', icon: FiCalendar, route: '/appointments' },
  { label: 'View Reports', icon: FiActivity, route: '/reports' },
];

const KPI_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/80 dark:border-blue-900' },
  { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200/80 dark:border-indigo-900' },
  { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/80 dark:border-rose-900' },
  { bg: 'bg-violet-50 dark:bg-violet-950/60', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200/80 dark:border-violet-900' },
];

/* ── KpiCard component ── */
function KpiCard({ title, value, icon: Icon, sub, trend, delay, idx = 0 }) {
  const color = KPI_COLORS[idx % KPI_COLORS.length];
  return (
    <motion.div
      {...fadeUp(delay)}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-default flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${color.bg} ${color.text} ${color.border} border flex items-center justify-center shadow-xs`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center gap-1">
          {trend.up ? <FiArrowUp size={10} className="text-emerald-500" /> : <FiArrowDown size={10} className="text-rose-500" />}
          {trend.val}
        </span>
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none mb-1.5">{value}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

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
  const userName = user?.full_name || user?.name || 'Doctor';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const livePatients = (metrics?.recent_predictions || []).map((prediction) => ({
    id: prediction.patient_id,
    name: prediction.patient_name,
    riskScore: prediction.risk_score,
    riskLevel: (prediction.risk_category || 'Low').toLowerCase(),
    status: (prediction.risk_category || 'Low').toLowerCase(),
    createdAt: prediction.created_at ? new Date(prediction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
  }));

  const filtered = livePatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const liveKpis = [
    { title: 'Assigned Patients', value: metrics?.total_patients ?? 0, icon: FiUsers, sub: 'Active patient records', trend: { up: true, val: 'Real-time' }, idx: 0 },
    { title: "Today's Appointments", value: metrics?.appointments_today ?? appointments.length, icon: FiCalendar, sub: 'Scheduled today', trend: { up: true, val: 'Today' }, idx: 1 },
    { title: 'Risk Alerts', value: metrics?.high_risk_patients ?? 0, icon: FiAlertTriangle, sub: 'High risk flag count', trend: { up: false, val: 'Priority' }, idx: 2 },
    { title: 'Avg Risk Score', value: metrics?.average_risk_score !== undefined ? `${metrics.average_risk_score}%` : '0%', icon: FiActivity, sub: 'Model cohort average', trend: { up: false, val: 'ML Model' }, idx: 3 },
  ];

  const liveAlerts = livePatients.filter((patient) => patient.riskLevel === 'high').map((patient) => ({
    id: patient.id,
    patient: patient.name,
    message: `High readmission risk detected (${patient.riskScore}%)`,
    severity: 'high',
    time: patient.createdAt,
  }));

  return (
    <DashboardLayout>

      {/* ══════════════════════════════════════
          WELCOME HEADER
      ══════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-2xl mb-6 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-slate-800 shadow-md"
      >
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Left Header */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md shadow-blue-500/20 flex-shrink-0 border border-white/20"
            >
              {initials}
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-blue-200/90 text-xs font-semibold flex items-center gap-1.5"
              >
                {greeting.emoji} {greeting.text}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5"
              >
                Welcome Back, {userName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="text-slate-300 text-xs mt-0.5"
              >
                CarePulse AI Clinical Workspace
              </motion.p>
            </div>
          </div>

          {/* Right — date + role badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:items-end gap-1.5"
          >
            <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold px-3.5 py-1 rounded-full border border-blue-400/30 backdrop-blur-md">
              <FiHeart size={12} className="text-blue-400" /> Attending Physician
            </span>
            <span className="text-slate-300/80 text-xs font-medium">{today}</span>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-white/10"
        >
          {QUICK_ACTIONS.map((a, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(a.route)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                a.primary
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md'
              }`}
            >
              <a.icon size={14} />
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
      {liveAlerts.length > 0 && (
        <motion.div {...fadeUp(0.28)} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <FiAlertTriangle size={13} />
              </span>
              Active High Risk Alerts
            </h2>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2.5 py-0.5 rounded-full">
              {liveAlerts.length} High Risk Flagged
            </span>
          </div>

          <div className="space-y-2">
            {liveAlerts.map((alert, i) => {
              const s = ALERT_STYLE[alert.severity] || ALERT_STYLE.high;
              return (
                <motion.div
                  key={alert.id || i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.08 }}
                  className={`relative flex items-center justify-between gap-4 rounded-xl px-4 py-3 border ${s.bg} ${s.border}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${s.badge} flex items-center justify-center flex-shrink-0`}>
                      <FiAlertTriangle size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{alert.patient}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-[11px] text-slate-400">{alert.time}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          CHARTS — REAL DATA WIRED TO RISK DISTRIBUTION
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.38)} className="grid lg:grid-cols-2 gap-6 mb-6">
        <AdmissionsChart data={[]} />
        <RiskDistributionChart data={metrics?.risk_distribution || []} />
      </motion.div>

      {/* ══════════════════════════════════════
          PATIENT TABLE + SIDEBAR PANELS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.46)} className="grid lg:grid-cols-3 gap-6">

        {/* Patient table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Patient Predictions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} live records</p>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search patients…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field pl-8 py-1.5 text-xs w-44"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40">
                    {['Patient', 'Risk Score', 'Category', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <AnimatePresence>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-400">
                          No prediction records found yet. Perform a patient risk prediction to see live records here.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p, i) => (
                        <motion.tr
                          key={`${p.id}-${p.riskScore}-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 dark:text-white text-xs">{p.name}</p>
                            <p className="text-[10px] text-slate-400">Patient #{p.id}</p>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">
                            {p.riskScore}%
                          </td>
                          <td className="px-4 py-3">
                            <RiskBadge level={p.riskLevel} score={p.riskScore} />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLE[p.status] || STATUS_STYLE.low}`}>
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
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Appointments */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FiCalendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                Today's Appointments
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900">
                {appointments.length} scheduled
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {appointments.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">No appointments scheduled for today.</p>
              ) : (
                appointments.slice(0, 5).map((a) => {
                  const s = APPT_STYLE[a.status] || APPT_STYLE.pending;
                  return (
                    <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{a.patient_name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{a.appointment_date} · {a.appointment_time}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${s.badge}`}>
                        {a.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Clinical Insights */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-3">
              <FiZap size={14} className="text-blue-600 dark:text-blue-400" />
              Clinical Support Insights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time patient risk evaluation actively flags high readmission cases to assist discharge planning and care continuity.
            </p>
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}
