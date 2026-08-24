import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiActivity, FiServer, FiShield, FiDatabase, FiTrendingUp, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import KpiCard from '../../components/common/KpiCard';
import RoleBadge from '../../components/common/RoleBadge';
import Breadcrumb from '../../components/common/Breadcrumb';
import WelcomeHeader from '../../components/common/WelcomeHeader';
import { ALL_USERS, SYSTEM_LOGS, PLATFORM_STATS } from '../../data/dummyData';
import api from '../../services/api';
import { analyticsService } from '../../services/analyticsService';

const logColors = {
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  error:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } },
};

export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  useEffect(() => { api.get('/users/').then((response) => setUsers(response.data)).catch(() => setUsers([])); }, []);
  useEffect(() => { analyticsService.getDashboard().then(setMetrics).catch(() => setMetrics(null)); }, []);
  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'System Administrator Dashboard' }]} />
      <WelcomeHeader subtitle="Platform management, user control, and system monitoring." />

      {/* KPIs */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
      >
        {[
          { title: "Total Users", value: users.length, icon: FiUsers, color: "blue" },
          { title: "Active Users", value: users.filter((item) => item.is_active).length, icon: FiActivity, color: "green" },
          { title: "Predictions Run", value: metrics?.total_predictions || 0, icon: FiTrendingUp, color: "purple" },
          { title: "System Uptime", value: '—', icon: FiServer, color: "teal" },
          { title: "Storage Used", value: '—', icon: FiDatabase, color: "orange" },
          { title: "API Calls", value: '—', icon: FiShield, color: "blue" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={stagger.item}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* User Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden mb-6"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiUsers size={16} className="text-blue-500" /> User Management
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field py-1.5 text-sm w-44"
            />
            <motion.button onClick={() => navigate('/register')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"
            >
              <FiUserPlus size={14} /> Add User
            </motion.button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['User', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                        {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">{u.lastLogin}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <motion.button disabled title="User editing is not available in the current management UI" whileHover={{ scale: 1.15 }} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors cursor-not-allowed">
                        <FiEdit2 size={14} />
                      </motion.button>
                      <motion.button disabled title="Use the backend user-management API for deletion" whileHover={{ scale: 1.15 }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors cursor-not-allowed">
                        <FiTrash2 size={14} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* System Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiActivity size={16} className="text-blue-500" /> System Logs
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['User', 'Action', 'Module', 'Timestamp', 'Level'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {SYSTEM_LOGS.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">{log.user}</td>
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{log.action}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{log.module}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">{log.time}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${logColors[log.level]}`}>{log.level}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
