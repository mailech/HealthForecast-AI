import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  UserCheck,
  Database,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const AuditLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const auditEvents = [
    {
      id: 'LOG-1092',
      timestamp: '2026-09-06 14:12:05',
      user: 'sysadmin@healthforecast.ai',
      role: 'System Administrator',
      action: 'Dataset Status Inspection',
      resource: '/api/v1/system/status',
      severity: 'INFO',
      status: 'SUCCESS'
    },
    {
      id: 'LOG-1091',
      timestamp: '2026-09-06 14:05:30',
      user: 'doctor@healthforecast.ai',
      role: 'Doctor',
      action: 'Risk Forecast Prediction (CDSS)',
      resource: '/api/v1/predictions/predict',
      severity: 'LOW',
      status: 'SUCCESS'
    },
    {
      id: 'LOG-1090',
      timestamp: '2026-09-06 13:58:12',
      user: 'admin@healthforecast.ai',
      role: 'Hospital Administrator',
      action: 'Hospital Performance Query',
      resource: '/api/v1/analytics/hospital-performance',
      severity: 'INFO',
      status: 'SUCCESS'
    },
    {
      id: 'LOG-1089',
      timestamp: '2026-09-06 13:45:00',
      user: 'researcher@healthforecast.ai',
      role: 'Healthcare Researcher',
      action: 'Treatment Effectiveness Analytics',
      resource: '/api/v1/analytics/treatments',
      severity: 'INFO',
      status: 'SUCCESS'
    },
    {
      id: 'LOG-1088',
      timestamp: '2026-09-06 13:30:19',
      user: 'sysadmin@healthforecast.ai',
      role: 'System Administrator',
      action: 'RBAC Authorization Access',
      resource: '/api/v1/users',
      severity: 'INFO',
      status: 'SUCCESS'
    }
  ];

  const filteredLogs = auditEvents.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || log.role === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/sysadmin/users"
              className="inline-flex items-center text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to System Dashboard
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-purple-400" /> Platform Security & Audit Trail Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system operation logs, RBAC authentication events & API request telemetry
          </p>
        </div>
      </div>

      {/* Security Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Total Logged Events</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">1,092 Events</div>
          <div className="text-xs text-slate-400">Recorded across active sessions</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Authentication Rate</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">100% Verified</div>
          <div className="text-xs text-slate-400">JWT Token & Role Enforced</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Dataset Integrity</span>
            <Database className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400">Read-Only Source</div>
          <div className="text-xs text-slate-400">diabetic_data.csv Protected</div>
        </div>
      </div>

      {/* Audit Log Table Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-400" /> System Operation Log Directory
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Roles</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Doctor">Doctor</option>
              <option value="Hospital Administrator">Hospital Administrator</option>
              <option value="Healthcare Researcher">Healthcare Researcher</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User Account</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Performed</th>
                <th className="py-3 px-4">Endpoint Resource</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-purple-400 font-semibold">{log.id}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{log.user}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">{log.action}</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-400 text-[11px]">{log.resource}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
