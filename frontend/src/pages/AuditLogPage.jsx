import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/sysadmin/audit-logs?limit=200');
      setLogs(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColor = (action) => {
    if (action.includes('LOGIN')) return '#0369a1';
    if (action.includes('REGISTER')) return '#15803d';
    if (action.includes('UPDATED')) return '#b45309';
    return '#475569';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📋 System Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Chronological record of authentication events, user management actions, and system changes.
          </p>
        </div>
        <button className="btn-logout" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={fetchLogs}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="alert-box alert-error"><AlertCircle size={18} style={{ marginRight: '0.5rem' }} />{error}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No audit log entries yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Detail</th>
                <th>User ID</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td>
                    <span style={{
                      fontWeight: 700, fontSize: '0.8rem', padding: '0.15rem 0.5rem',
                      borderRadius: '4px', background: `${actionColor(log.action)}15`,
                      color: actionColor(log.action)
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.detail}
                  </td>
                  <td>{log.user_id || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip_address || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
