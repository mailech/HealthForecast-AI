import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity, LayoutDashboard, PlusCircle, History, Users, LogOut, Bell, BarChart3, Settings, Shield } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unread_count);
      } catch (e) { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const roleConfig = {
    'Doctor': { emoji: '👨‍⚕️', badge: 'doctor' },
    'Hospital Administrator': { emoji: '🏥', badge: 'admin' },
    'Healthcare Researcher': { emoji: '🔬', badge: 'researcher' },
    'System Administrator': { emoji: '⚙️', badge: 'sysadmin' },
  };

  const rc = roleConfig[user.role] || { emoji: '👤', badge: 'default' };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <Activity size={20} />
        </div>
        <span>HealthForecast AI</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        {/* Doctor & Admin: Prediction, History */}
        {(user.role === 'Doctor' || user.role === 'Hospital Administrator') && (
          <>
            <button
              className={`nav-btn ${activePage === 'predict' ? 'active' : ''}`}
              onClick={() => setActivePage('predict')}
            >
              <PlusCircle size={18} />
              New Prediction
            </button>
            <button
              className={`nav-btn ${activePage === 'history' ? 'active' : ''}`}
              onClick={() => setActivePage('history')}
            >
              <History size={18} />
              Prediction History
            </button>
          </>
        )}

        {/* Admin: Patient Records */}
        {user.role === 'Hospital Administrator' && (
          <button
            className={`nav-btn ${activePage === 'patients' ? 'active' : ''}`}
            onClick={() => setActivePage('patients')}
          >
            <Users size={18} />
            Patient Records
          </button>
        )}

        {/* Researcher: Analytics */}
        {user.role === 'Healthcare Researcher' && (
          <button
            className={`nav-btn ${activePage === 'research' ? 'active' : ''}`}
            onClick={() => setActivePage('research')}
          >
            <BarChart3 size={18} />
            Research Analytics
          </button>
        )}

        {/* SysAdmin: Management */}
        {user.role === 'System Administrator' && (
          <>
            <button
              className={`nav-btn ${activePage === 'users' ? 'active' : ''}`}
              onClick={() => setActivePage('users')}
            >
              <Shield size={18} />
              User Management
            </button>
            <button
              className={`nav-btn ${activePage === 'audit' ? 'active' : ''}`}
              onClick={() => setActivePage('audit')}
            >
              <Settings size={18} />
              Audit Logs
            </button>
          </>
        )}

        {/* Notifications for all */}
        <button
          className={`nav-btn ${activePage === 'notifications' ? 'active' : ''}`}
          onClick={() => setActivePage('notifications')}
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

      <div className="nav-user">
        <span className={`user-badge ${rc.badge}`}>
          {rc.emoji} {user.username} ({user.role})
        </span>
        <button className="btn-logout" onClick={logout} title="Sign Out">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
