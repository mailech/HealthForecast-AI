import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, User as UserIcon, Menu } from 'lucide-react';

export const Navbar = ({ title = "Dashboard", onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="dashboard-navbar" style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '260px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 10
    }}>
      {/* Left side: hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        {/* Mobile hamburger menu button */}
        <button
          className="navbar-hamburger"
          onClick={onMenuToggle}
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            width: '38px',
            height: '38px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          <Menu size={20} />
        </button>
        <h1 className="navbar-title" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h1>
      </div>

      {/* Right controls: Search, Notifications, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Global Search input */}
        <div className="navbar-search" style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search patients, ICD-9 codes..."
            className="form-control"
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.8125rem' }}
          />
        </div>

        {/* Notification Bell */}
        <button style={{
          background: 'none',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          position: 'relative',
          flexShrink: 0,
        }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '7px',
            height: '7px',
            backgroundColor: 'var(--danger-500)',
            borderRadius: '50%'
          }} />
        </button>

        {/* User Profile Pill */}
        {user && (
          <div className="navbar-user-pill" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '1rem',
            borderLeft: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.875rem',
              flexShrink: 0,
            }}>
              {user.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="navbar-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user.full_name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
