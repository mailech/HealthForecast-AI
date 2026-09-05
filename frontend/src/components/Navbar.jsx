import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, PlusCircle, History, Users, LogOut } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();

  if (!user) return null;

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

        {user.role === 'Hospital Administrator' && (
          <button
            className={`nav-btn ${activePage === 'patients' ? 'active' : ''}`}
            onClick={() => setActivePage('patients')}
          >
            <Users size={18} />
            Patient Records
          </button>
        )}
      </div>

      <div className="nav-user">
        <span className={`user-badge ${user.role === 'Doctor' ? 'doctor' : 'admin'}`}>
          {user.role === 'Doctor' ? '👨‍⚕️ ' : '🏥 '} {user.username} ({user.role})
        </span>
        <button className="btn-logout" onClick={logout} title="Sign Out">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
