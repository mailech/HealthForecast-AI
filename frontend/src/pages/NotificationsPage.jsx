import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const categoryIcon = (cat) => {
    switch (cat) {
      case 'critical': return <AlertTriangle size={18} color="#b91c1c" />;
      case 'warning': return <AlertTriangle size={18} color="#b45309" />;
      case 'system': return <Info size={18} color="#0369a1" />;
      default: return <Info size={18} color="#64748b" />;
    }
  };

  const categoryBg = (cat) => {
    switch (cat) {
      case 'critical': return '#fef2f2';
      case 'warning': return '#fffbeb';
      case 'system': return '#f0f9ff';
      default: return '#f8fafc';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🔔 Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Clinical alerts, system events, and important updates.
          </p>
        </div>
        <button className="btn-logout" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={fetchNotifications}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bell size={48} color="#cbd5e1" />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '1rem' }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                background: n.is_read ? '#ffffff' : categoryBg(n.category),
                border: `1px solid ${n.is_read ? 'var(--border)' : '#e2e8f0'}`,
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                opacity: n.is_read ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ marginTop: '2px' }}>{categoryIcon(n.category)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{n.message}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                </div>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CheckCircle size={14} style={{ marginRight: '0.25rem' }} /> Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
