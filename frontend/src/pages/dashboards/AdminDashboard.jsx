import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiTrendingUp, FiActivity, FiPercent,
  FiClock, FiAlertCircle, FiArrowRight,
  FiBarChart2, FiDownload, FiRefreshCw, FiCheckCircle,
  FiCalendar, FiFileText,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import AdmissionsChart from '../../components/charts/AdmissionsChart';
import DepartmentChart from '../../components/charts/DepartmentChart';
import RiskDistributionChart from '../../components/charts/RiskDistributionChart';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { notificationService } from '../../services/notificationService';
import { DEPARTMENT_STATS } from '../../data/dummyData';

/* ── helpers ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

/* ── KPI Card Component with custom accents ── */
function KpiCard({ title, value, icon: Icon, sub, delay, color }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.text} ${color.border} border flex items-center justify-center shadow-xs`}>
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
          Operational
        </span>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">{value ?? '—'}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
    </motion.div>
  );
}

function perfColor(score) {
  if (score >= 90) return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900', label: 'Optimal' };
  if (score >= 80) return { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900', label: 'Standard' };
  return { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900', label: 'Review' };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    analyticsService.getDashboard().then(setMetrics).catch(() => setMetrics(null));
    notificationService.getAll().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const userName = user?.full_name || user?.name || 'Hospital Admin';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const totalPatients = metrics?.total_patients ?? null;
  const apptsToday = metrics?.appointments_today ?? null;
  const readmissionRate = metrics?.readmission_rate !== undefined && metrics?.readmission_rate !== null ? `${metrics.readmission_rate}%` : null;
  const avgRiskScore = metrics?.average_risk_score !== undefined && metrics?.average_risk_score !== null ? `${metrics.average_risk_score}%` : null;
  const highRiskCount = metrics?.risk_distribution?.find(r => (r.name || r.category) === 'High')?.value ?? metrics?.high_risk_patients ?? null;

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
          {/* Left */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-extrabold shadow-sm flex-shrink-0"
            >
              {initials}
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-blue-300 text-xs font-semibold flex items-center gap-1.5"
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
                Hospital-wide operations, performance and patient analytics.
              </motion.p>
            </div>
          </div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:items-end gap-1.5"
          >
            <span className="inline-flex items-center gap-1.5 bg-indigo-900/60 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-700/60">
              Hospital Administrator
            </span>
            <span className="text-slate-400 text-xs font-medium">{today}</span>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-slate-800"
        >
          {[
            { label: 'Generate Reports', icon: FiDownload, action: () => navigate('/reports') },
            { label: 'Hospital Analytics', icon: FiBarChart2, action: () => navigate('/analytics') },
            { label: 'Patient Directory', icon: FiUsers, action: () => navigate('/patients') },
            { label: 'Appointments', icon: FiCalendar, action: () => navigate('/appointments') },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.action}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
            >
              <a.icon size={13} className="text-blue-400" />
              {a.label}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════
          6 COLORFUL OPERATIONAL KPI CARDS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard
          title="Total Patients"
          value={totalPatients !== null ? totalPatients.toLocaleString() : '—'}
          icon={FiUsers}
          sub="Hospital Directory"
          delay={0.05}
          color={{ bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900' }}
        />
        <KpiCard
          title="Appointments Today"
          value={apptsToday !== null ? apptsToday : '—'}
          icon={FiCalendar}
          sub="Daily Schedule"
          delay={0.1}
          color={{ bg: 'bg-teal-50 dark:bg-teal-950/60', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900' }}
        />
        <KpiCard
          title="Readmission Rate"
          value={readmissionRate ?? '—'}
          icon={FiPercent}
          sub="30-Day Index"
          delay={0.15}
          color={{ bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900' }}
        />
        <KpiCard
          title="Avg Risk Score"
          value={avgRiskScore ?? '—'}
          icon={FiActivity}
          sub="AI Assessment"
          delay={0.2}
          color={{ bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900' }}
        />
        <KpiCard
          title="Bed Occupancy"
          value="—"
          icon={FiClock}
          sub="No data available"
          delay={0.25}
          color={{ bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900' }}
        />
        <KpiCard
          title="Critical Patients"
          value={highRiskCount !== null ? highRiskCount : '—'}
          icon={FiAlertCircle}
          sub="High Risk Flagged"
          delay={0.3}
          color={{ bg: 'bg-pink-50 dark:bg-pink-950/60', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-100 dark:border-pink-900' }}
        />
      </div>

      {/* ══════════════════════════════════════
          CHARTS ROW
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.35)} className="grid lg:grid-cols-2 gap-6 mb-6">
        <AdmissionsChart />
        <RiskDistributionChart data={metrics?.risk_distribution || []} />
      </motion.div>

      {/* ══════════════════════════════════════
          DEPARTMENT METRICS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.4)} className="mb-6">
        <DepartmentChart />
      </motion.div>

      {/* ══════════════════════════════════════
          DEPARTMENT TABLE + REAL NOTIFICATIONS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.45)} className="grid lg:grid-cols-3 gap-6">

        {/* Department performance table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Department Overview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{DEPARTMENT_STATS.length} operational departments</p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            >
              <FiFileText size={12} /> View Reports
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40">
                  {['Department', 'Patients', 'Readmissions', 'Performance', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DEPARTMENT_STATS.map((d, i) => {
                  const p = perfColor(d.performance);
                  return (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-xs">{d.name}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400">{d.patients}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400">{d.readmissions}</td>
                      <td className="px-5 py-3.5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${p.bar}`} style={{ width: `${d.performance}%` }} />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{d.performance}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badge}`}>
                          {p.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Alerts</h3>
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
              {notifications.length} alerts
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">No recent notifications.</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}
