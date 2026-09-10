import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { AuditLog } from '../../types';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertOctagon,
  Lock,
  Clock,
  UserCheck
} from 'lucide-react';

export const AdminAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [exportNotice, setExportNotice] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !log.userName.toLowerCase().includes(term) &&
        !log.action.toLowerCase().includes(term) &&
        !log.details.toLowerCase().includes(term) &&
        !(log.resource && log.resource.toLowerCase().includes(term))
      ) {
        return false;
      }
    }
    if (selectedStatus !== 'ALL' && log.status !== selectedStatus) return false;
    if (selectedAction !== 'ALL' && !log.action.includes(selectedAction)) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp,User,Role,Action,Resource,IP_Address,Status,Details\n'];
    const rows = filteredLogs.map(l => {
      return `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.resource || ''}","${l.ipAddress}","${l.status}","${l.details}"`;
    });
    const blob = new Blob([headers.join('') + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthForecast_AuditTrail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              HIPAA Security Audit Trail & Access Logs
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Forensic audit trail capturing all user authentication events, clinical dossier reviews, and exports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exportNotice ? 'Audit CSV Exported!' : 'Export Audit Log (CSV)'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user, action, resource ID, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
            >
              <option value="ALL">All Outcomes</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="DENIED">DENIED (Security Violation)</option>
              <option value="FAILED">FAILED</option>
            </select>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Authentication / Login</option>
              <option value="PREDICTION">Prediction Engine</option>
              <option value="EXPORT">Data Exports</option>
              <option value="VIEW">Patient Views</option>
              <option value="RETRAIN">Model Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Timestamp</th>
                <th className="p-3">Clinician / User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Security Action</th>
                <th className="p-3">Resource Target</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 font-sans">
                  <td className="p-3 whitespace-nowrap text-slate-500 font-mono">{l.timestamp}</td>
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{l.userName}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                      {l.userRole}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{l.action}</td>
                  <td className="p-3 font-mono text-slate-600">{l.resource || '—'}</td>
                  <td className="p-3 font-mono text-slate-500">{l.ipAddress}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        l.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : l.status === 'DENIED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate" title={l.details}>
                    {l.details}
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
