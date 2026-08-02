import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  ShieldCheck,
  BarChart3,
  LogOut,
  Stethoscope,
  Building2,
  Database,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logoutUser } = useAuth();

  const roleNavItems = {
    doctor: [
      { path: '/dashboard/doctor', label: 'Doctor Dashboard', icon: LayoutDashboard },
      { path: '/patients', label: 'Assigned Patients', icon: Users },
      { path: '/analytics/risk', label: 'Risk Intelligence', icon: Activity },
    ],
    hospital_admin: [
      { path: '/dashboard/admin', label: 'Hospital Overview', icon: Building2 },
      { path: '/patients', label: 'Patient Directory', icon: Users },
      { path: '/analytics/performance', label: 'Hospital Performance', icon: BarChart3 },
    ],
    researcher: [
      { path: '/dashboard/researcher', label: 'Research Analytics', icon: Activity },
      { path: '/patients', label: 'Anonymized Datasets', icon: Database },
      { path: '/analytics/trends', label: 'Population Trends', icon: FileText },
    ],
    system_admin: [
      { path: '/dashboard/sysadmin', label: 'System Dashboard', icon: ShieldCheck },
      { path: '/users', label: 'User Management', icon: Users },
      { path: '/patients', label: 'All Patients', icon: Database },
      { path: '/analytics/performance', label: 'Platform Analytics', icon: BarChart3 },
    ],
  };

  const navItems = user ? roleNavItems[user.role] || [] : [];

  const roleVariant = {
    doctor: 'primary',
    hospital_admin: 'purple',
    researcher: 'teal',
    system_admin: 'default',
  };

  const roleLabel = {
    doctor: 'Doctor',
    hospital_admin: 'Hospital Admin',
    researcher: 'Researcher',
    system_admin: 'System Admin',
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 25,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: 'var(--primary-600)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--text-primary)', lineHeight: '1.2' }}>
                HealthForecast <span style={{ color: 'var(--primary-600)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Readmission & Risk Platform</div>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Badge Info */}
        {user && (
          <div style={{
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {user.full_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.department || 'Clinical Care'}</span>
              <Badge variant={roleVariant[user.role]} size="sm">
                {roleLabel[user.role]}
              </Badge>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={logoutUser}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
