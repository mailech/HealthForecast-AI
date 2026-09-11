import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Settings, Users, Database, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export const SysAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const [usersRes, statusRes] = await Promise.all([
        api.get('/users'),
        api.get('/system/status')
      ]);
      setUsers(usersRes.data || []);
      setStatus(statusRes.data);
    } catch (err) {
      console.error("Failed to load system admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSeeding = async () => {
    setSeeding(true);
    setMessage('');
    try {
      const res = await api.post('/system/seed-dataset?max_rows=5000');
      setMessage(res.data.message || 'Dataset seeding triggered successfully.');
      fetchSystemInfo();
    } catch (err) {
      setMessage('Dataset seeding failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-400" /> System Administrator Control Panel
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          User Role Directory, Database Diagnostics & Dataset Ingestion Operations
        </p>
      </div>

      {/* Database Diagnostics */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered System Users</div>
            <div className="text-3xl font-extrabold text-amber-400">{status.database_metrics?.users_count || users.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">RBAC Authenticated Accounts</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ingested Patient Records</div>
            <div className="text-3xl font-extrabold text-cyan-400">{(status.database_metrics?.patients_count || 0).toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">Patients in relational database</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clinical Encounters</div>
            <div className="text-3xl font-extrabold text-emerald-400">{(status.database_metrics?.encounters_count || 0).toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">Encounter records in database</div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link
          to="/sysadmin/dataset"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">Dataset Ingestion Operations</div>
              <div className="text-xs text-slate-400">Batch ingestion, dataset specs & row limits</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/sysadmin/audit"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">Audit Trail Logs</div>
              <div className="text-xs text-slate-400">System operation logs & security events</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Inline Dataset Ingestion Control */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" /> Quick Dataset Ingestion
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Source file: <code className="text-cyan-300 font-mono">dataset/diabetic_data.csv</code> (Diabetes 130-US Hospitals)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/sysadmin/dataset"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
            >
              Open Ingestion Page
            </Link>

            <button
              onClick={handleTriggerSeeding}
              disabled={seeding}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Ingesting Dataset...' : 'Trigger Quick Ingestion'}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* User Directory */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Platform User Directory & Assigned Roles</h3>
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading system user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">#{u.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{u.full_name}</td>
                    <td className="py-3.5 px-4 text-cyan-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {u.role?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{u.department || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SysAdminDashboard;
