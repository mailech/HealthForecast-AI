import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiActivity, FiClock, FiAlertCircle,
  FiBarChart2, FiDownload, FiCheckCircle,
  FiCalendar, FiFileText, FiFilter, FiTrendingUp, FiXCircle
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { notificationService } from '../../services/notificationService';

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

/* ── Operational KPI Card Component ── */
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('this_week');
  const [opsData, setOpsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setLoading(true);
    analyticsService.getOperations(period)
      .then(data => {
        setOpsData(data);
        setLoading(false);
      })
      .catch(() => {
        setOpsData(null);
        setLoading(false);
      });
  }, [period]);

  useEffect(() => {
    notificationService.getAll().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const userName = user?.full_name || user?.name || 'Hospital Admin';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const summary = opsData?.summary;
  const patientFlow = opsData?.patient_flow;
  const deptWorkload = opsData?.department_workload || [];
  const riskOverview = opsData?.risk_overview;

  const maxWorkload = useMemo(() => {
    if (!deptWorkload.length) return 1;
    return Math.max(...deptWorkload.map(d => d.total_workload || d.patient_count || 1), 1);
  }, [deptWorkload]);

  const totalRiskCount = riskOverview?.total_evaluated || 0;

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
                Hospital-level operational overview & department workload statistics.
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:items-end gap-1.5"
          >
            <span className="inline-flex items-center gap-1.5 bg-indigo-900/60 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-700/60">
              Hospital Administrator
            </span>
            <span className="text-slate-400 text-xs font-medium">{todayStr}</span>
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
          TIME FILTER SELECTOR BAR
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <FiFilter className="text-blue-600 dark:text-blue-400" size={16} />
          <span>Operational Filter Period:</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
          {[
            { id: 'today', label: 'Today' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === item.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          1. HOSPITAL OPERATIONS SUMMARY
      ══════════════════════════════════════ */}
      <div className="mb-8">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight flex items-center gap-2">
          <FiActivity className="text-blue-600 dark:text-blue-400" />
          HOSPITAL OPERATIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total Patients"
            value={summary?.total_patients !== undefined ? summary.total_patients.toLocaleString() : '—'}
            icon={FiUsers}
            sub="Active Directory Records"
            delay={0.1}
            color={{ bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900' }}
          />
          <KpiCard
            title="Today's Appointments"
            value={summary?.todays_appointments !== undefined ? summary.todays_appointments : '—'}
            icon={FiCalendar}
            sub="Scheduled For Today"
            delay={0.15}
            color={{ bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900' }}
          />
          <KpiCard
            title="Pending"
            value={summary?.pending_appointments !== undefined ? summary.pending_appointments : '—'}
            icon={FiClock}
            sub="Awaiting Consultation"
            delay={0.2}
            color={{ bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900' }}
          />
          <KpiCard
            title="Completed"
            value={summary?.completed_appointments !== undefined ? summary.completed_appointments : '—'}
            icon={FiCheckCircle}
            sub="Successfully Conducted"
            delay={0.25}
            color={{ bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900' }}
          />
          <KpiCard
            title="Missed"
            value={summary?.missed_appointments !== undefined ? summary.missed_appointments : '—'}
            icon={FiXCircle}
            sub="Missed or Cancelled"
            delay={0.3}
            color={{ bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900' }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════
          2. PATIENT FLOW
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.35)} className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="text-blue-600 dark:text-blue-400" />
              PATIENT FLOW
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calculated patient and appointment activity for: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{period.replace('_', ' ')}</span>
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900 self-start sm:self-auto">
            Live Database Metrics
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Registered Patients</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{patientFlow?.registered_patients ?? 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">New registrations/admissions</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Appointments</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{patientFlow?.total_appointments ?? 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Total for selected period</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{patientFlow?.completed_appointments ?? 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Attended & completed</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{patientFlow?.pending_appointments ?? 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Scheduled upcoming</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Missed</p>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{patientFlow?.missed_appointments ?? 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">No-show / cancelled</span>
          </div>
        </div>

        {/* Empty state check for appointments in period */}
        {patientFlow?.total_appointments === 0 && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle size={15} />
            <span>No appointments recorded for this period.</span>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════
          3. DEPARTMENT WORKLOAD & 5. PATIENT RISK OVERVIEW
      ══════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Department Workload (2 Columns on Large Screens) */}
        <motion.div {...fadeUp(0.4)} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiBarChart2 className="text-blue-600 dark:text-blue-400" />
                  DEPARTMENT WORKLOAD
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Patients and appointment load across existing hospital departments
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                {deptWorkload.length} Departments
              </span>
            </div>

            {deptWorkload.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 my-4">
                <FiBarChart2 size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No department activity available.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">There are no department records in the database for this period.</p>
              </div>
            ) : (
              <div className="space-y-4 my-2">
                {deptWorkload.map((dept, idx) => {
                  const pct = Math.round(((dept.total_workload || dept.patient_count || 0) / maxWorkload) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-900 dark:text-white font-bold">{dept.name}</span>
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                          <span>{dept.patient_count} patients</span>
                          {dept.appointment_count > 0 && (
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{dept.appointment_count} appts</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 6)}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            * Data populated directly from patient records and appointment schedules stored in the hospital database.
          </p>
        </motion.div>

        {/* Patient Risk Overview (1 Column on Large Screens) */}
        <motion.div {...fadeUp(0.45)} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FiAlertCircle className="text-rose-600 dark:text-rose-400" />
                PATIENT RISK OVERVIEW
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Stored AI readmission risk evaluations
              </p>
            </div>

            {totalRiskCount === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 my-4">
                <FiAlertCircle size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No stored patient risk records available.</p>
              </div>
            ) : (
              <div className="space-y-4 my-2">
                {/* High Risk */}
                <div className="bg-rose-50/70 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200/70 dark:border-rose-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider">High Risk</span>
                    <span className="text-lg font-black text-rose-700 dark:text-rose-300">{riskOverview?.high_risk ?? 0}</span>
                  </div>
                  <div className="w-full bg-rose-200/60 dark:bg-rose-900/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full"
                      style={{ width: `${totalRiskCount ? Math.round(((riskOverview?.high_risk || 0) / totalRiskCount) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Medium Risk */}
                <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200/70 dark:border-amber-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Medium Risk</span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-300">{riskOverview?.medium_risk ?? 0}</span>
                  </div>
                  <div className="w-full bg-amber-200/60 dark:bg-amber-900/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${totalRiskCount ? Math.round(((riskOverview?.medium_risk || 0) / totalRiskCount) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Low Risk */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Low Risk</span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{riskOverview?.low_risk ?? 0}</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${totalRiskCount ? Math.round(((riskOverview?.low_risk || 0) / totalRiskCount) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Evaluated Patients:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{totalRiskCount}</span>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          SYSTEM NOTIFICATIONS & ALERTS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.5)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Operational Alerts</h3>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
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
      </motion.div>

    </DashboardLayout>
  );
}

