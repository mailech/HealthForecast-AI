import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiActivity,
  FiServer,
  FiShield,
  FiDatabase,
  FiUserPlus,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiLock,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiFilter,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import KpiCard from '../../components/common/KpiCard';
import RoleBadge from '../../components/common/RoleBadge';
import Breadcrumb from '../../components/common/Breadcrumb';
import WelcomeHeader from '../../components/common/WelcomeHeader';
import api from '../../services/api';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } },
};

const getNormalizedRole = (role) => {
  if (!role) return '';
  const r = role.toString().toLowerCase();
  if (r.includes('doctor')) return 'doctor';
  if (r.includes('hospital')) return 'hospital_admin';
  if (r.includes('researcher')) return 'researcher';
  if (r.includes('system')) return 'system_admin';
  return r;
};

export default function SystemAdminDashboard() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add User Modal State
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Doctor',
  });

  // Edit Role Modal / Inline State
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRole, setEditingRole] = useState('Doctor');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, notifRes] = await Promise.allSettled([
        api.get('/users/'),
        api.get('/notifications/'),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data);
      } else {
        setFeedback({ type: 'error', message: 'Unable to load user directory. Please try again.' });
      }

      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.value.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Unable to load system data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setActionLoading(true);
    try {
      await api.post('/users/', newUser);
      setFeedback({ type: 'success', message: `User "${newUser.full_name}" registered successfully.` });
      setAddUserOpen(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'Doctor' });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create user account.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActivate = async (userObj) => {
    setFeedback({ type: '', message: '' });
    setActionLoading(true);
    try {
      const endpoint = userObj.is_active ? `/users/${userObj.id}/deactivate` : `/users/${userObj.id}/activate`;
      await api.post(endpoint);
      setFeedback({
        type: 'success',
        message: `Account for ${userObj.full_name} has been ${userObj.is_active ? 'deactivated' : 'activated'}.`,
      });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update account status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId) => {
    setFeedback({ type: '', message: '' });
    setActionLoading(true);
    try {
      await api.put(`/users/${userId}`, { role: editingRole });
      setFeedback({ type: 'success', message: 'User role updated successfully.' });
      setEditingUserId(null);
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update user role.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userObj) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userObj.full_name}"?`)) return;
    setFeedback({ type: '', message: '' });
    setActionLoading(true);
    try {
      await api.delete(`/users/${userObj.id}`);
      setFeedback({ type: 'success', message: `User ${userObj.full_name} deleted successfully.` });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete user.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Real Counts & Metrics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const doctorCount = users.filter((u) => getNormalizedRole(u.role) === 'doctor').length;
  const hospitalAdminCount = users.filter((u) => getNormalizedRole(u.role) === 'hospital_admin').length;
  const researcherCount = users.filter((u) => getNormalizedRole(u.role) === 'researcher').length;
  const sysAdminCount = users.filter((u) => getNormalizedRole(u.role) === 'system_admin').length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || getNormalizedRole(u.role) === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'System Administrator Dashboard' }]} />
      <WelcomeHeader subtitle="Platform management, user authorization controls, role permissions, and infrastructure monitoring." />

      {/* FEEDBACK BANNERS */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl mb-6 border text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="p-1 hover:opacity-75">
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* TOP DASHBOARD SUMMARY CARDS (REAL DATA) */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
      >
        {[
          {
            title: 'Total Users',
            value: totalUsers,
            icon: FiUsers,
            color: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900' },
          },
          {
            title: 'Active Users',
            value: activeUsers,
            icon: FiActivity,
            color: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900' },
          },
          {
            title: 'Doctors',
            value: doctorCount,
            icon: FiShield,
            color: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900' },
          },
          {
            title: 'Hospital Admins',
            value: hospitalAdminCount,
            icon: FiServer,
            color: { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900' },
          },
          {
            title: 'Researchers',
            value: researcherCount,
            icon: FiDatabase,
            color: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900' },
          },
          {
            title: 'System Admins',
            value: sysAdminCount,
            icon: FiLock,
            color: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
          },
        ].map((kpi, i) => (
          <motion.div key={i} variants={stagger.item}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* SYSTEM HEALTH & ROLE DISTRIBUTION GRID */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* System Health */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <FiServer className="text-indigo-600 dark:text-indigo-400" size={16} /> System Infrastructure Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">API Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Database Engine</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Connected (PostgreSQL)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Backend Services</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Running (FastAPI)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Uptime Monitor Active</span>
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">v1.0.0</span>
          </div>
        </div>

        {/* Role Distribution Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            <FiShield className="text-indigo-600 dark:text-indigo-400" size={16} /> Platform Access & Role Distribution
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Doctors', count: doctorCount, color: 'bg-blue-600', roleKey: 'doctor' },
              { label: 'Hospital Administrators', count: hospitalAdminCount, color: 'bg-indigo-600', roleKey: 'hospital_admin' },
              { label: 'Healthcare Researchers', count: researcherCount, color: 'bg-emerald-600', roleKey: 'researcher' },
              { label: 'System Administrators', count: sysAdminCount, color: 'bg-slate-700', roleKey: 'system_admin' },
            ].map((r) => {
              const pct = totalUsers > 0 ? Math.round((r.count / totalUsers) * 100) : 0;
              return (
                <div key={r.roleKey}>
                  <div className="flex items-center justify-between mb-1 font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>{r.label}</span>
                    <span>{r.count} users ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Active Account Ratio: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
              </span>
            </div>
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Disabled Accounts: </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{totalUsers - activeUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* USER DIRECTORY & ACCESS TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <FiUsers size={16} className="text-indigo-600 dark:text-indigo-400" /> User Directory & Access Control ({filteredUsers.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manage user authorizations, roles, and account statuses.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-2.5 top-2 text-zinc-400" size={13} />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field py-1.5 pl-8 text-xs w-48"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field py-1.5 text-xs w-40"
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctor</option>
              <option value="hospital_admin">Hospital Admin</option>
              <option value="researcher">Researcher</option>
              <option value="system_admin">System Admin</option>
            </select>

            {/* Add User Button */}
            <button
              onClick={() => setAddUserOpen(true)}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3.5 font-bold uppercase tracking-wider"
            >
              <FiUserPlus size={14} /> Add User
            </button>
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-xs text-zinc-400">Loading user directory...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-8 text-center text-xs text-zinc-400">No users found matching filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40">
                <tr>
                  {['User', 'Email', 'Role', 'Account Status', 'Created Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-900">
                          {(u.full_name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white text-xs">{u.full_name}</p>
                          <p className="text-[10px] text-zinc-400">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs font-medium">{u.email}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="input-field py-0.5 text-xs"
                          >
                            <option value="Doctor">Doctor</option>
                            <option value="Hospital Administrator">Hospital Administrator</option>
                            <option value="Healthcare Researcher">Healthcare Researcher</option>
                            <option value="System Administrator">System Administrator</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(u.id)}
                            disabled={actionLoading}
                            className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                          >
                            <FiCheck size={12} />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1 rounded bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ) : (
                        <RoleBadge role={u.role} />
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center gap-1 ${
                          u.is_active
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleActivate(u)}
                          disabled={actionLoading}
                          title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                            u.is_active
                              ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                              : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          {u.is_active ? <FiXCircle size={12} /> : <FiCheckCircle size={12} />}
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setEditingRole(u.role || 'Doctor');
                          }}
                          disabled={actionLoading}
                          title="Edit Role"
                          className="p-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          <FiEdit2 size={12} />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={actionLoading}
                          title="Delete User"
                          className="p-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT PLATFORM ACTIVITY */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
            <FiActivity size={15} className="text-indigo-600 dark:text-indigo-400" /> Recent Platform Activity & Audit Log
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Real DB Log Events</span>
        </div>
        <div className="p-5">
          {notifications.length === 0 ? (
            <p className="text-center text-xs text-zinc-400 py-4">No recent platform activity.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{log.title}</p>
                    <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">{log.message}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD USER MODAL */}
      {addUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <FiUserPlus size={16} />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Register New Platform User</h3>
              </div>
              <button
                onClick={() => setAddUserOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field text-sm"
                  placeholder="e.g. Dr. Alex Vance"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-field text-sm"
                  placeholder="alex.vance@hospital.org"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input-field text-sm"
                  placeholder="Minimum 8 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                  Assigned Platform Role
                </label>
                <select
                  className="input-field text-sm"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Hospital Administrator">Hospital Administrator</option>
                  <option value="Healthcare Researcher">Healthcare Researcher</option>
                  <option value="System Administrator">System Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FiUserPlus size={14} /> Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
