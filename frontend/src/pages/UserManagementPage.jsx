import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Users, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const VALID_ROLES = ["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, healthRes] = await Promise.all([
        api.get('/sysadmin/users'),
        api.get('/sysadmin/health')
      ]);
      setUsers(usersRes.data);
      setSystemHealth(healthRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load system data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleUserActive = async (userId, currentStatus) => {
    try {
      await api.patch(`/sysadmin/users/${userId}`, { is_active: !currentStatus });
      setActionMsg(`User #${userId} ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user.');
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/sysadmin/users/${userId}`, { role: newRole });
      setActionMsg(`User #${userId} role changed to ${newRole}.`);
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user role.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>⚙️ System Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            User management, system health monitoring, and access control.
          </p>
        </div>
        <button className="btn-logout" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={fetchData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="alert-box alert-error"><AlertCircle size={18} style={{ marginRight: '0.5rem' }} />{error}</div>}
      {actionMsg && <div className="alert-box alert-success"><CheckCircle size={18} style={{ marginRight: '0.5rem' }} />{actionMsg}</div>}

      {/* System Health */}
      {systemHealth && (
        <div className="grid-stats" style={{ marginBottom: '2rem' }}>
          <div className="stat-card" style={{ borderLeft: `4px solid ${systemHealth.status === 'healthy' ? '#10b981' : '#ef4444'}` }}>
            <div className="stat-label">System Status</div>
            <div className="stat-value" style={{ color: systemHealth.status === 'healthy' ? '#10b981' : '#ef4444', fontSize: '1.5rem' }}>
              {systemHealth.status === 'healthy' ? '✅ Healthy' : '⚠️ Degraded'}
            </div>
            <div className="stat-desc">Database: {systemHealth.database} | ML Model: {systemHealth.model_loaded ? 'Loaded' : 'Unavailable'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{systemHealth.total_users}</div>
            <div className="stat-desc">Registered accounts</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">{systemHealth.total_patients}</div>
            <div className="stat-desc">Patient records</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Predictions</div>
            <div className="stat-value">{systemHealth.total_predictions}</div>
            <div className="stat-desc">ML inference runs</div>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="form-card">
        <div className="section-header"><h2>Registered Users</h2></div>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading users...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td>{u.full_name || '—'}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.id, e.target.value)}
                        className="form-control"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto', minWidth: '160px' }}
                      >
                        {VALID_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>✅ Active</span>
                      ) : (
                        <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.85rem' }}>🚫 Inactive</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="btn-logout"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => toggleUserActive(u.id, u.is_active)}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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
}
