import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUserMd, 
  FaHospital, 
  FaFileAlt, 
  FaSignOutAlt, 
  FaHeartbeat,
  FaCalendarAlt,
  FaBars,
  FaSearch,
  FaBell,
  FaUsersCog,
  FaDatabase,
  FaShieldAlt,
  FaCog
} from 'react-icons/fa';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  // Filter menu items strictly by role
  const getMenuItems = () => {
    switch (user.role) {
      case 'doctor':
        return {
          sectionTitle: 'Clinical Monitor',
          items: [
            {
              name: 'My Dashboard',
              icon: <FaUserMd />,
              path: '/doctor-dashboard'
            },
            {
              name: 'Follow-up Planner',
              icon: <FaCalendarAlt />,
              path: '/follow-up-planning'
            },
            {
              name: 'Outcome Reports',
              icon: <FaFileAlt />,
              path: '/doctor-reports'
            }
          ]
        };
      case 'hospital_admin':
        return {
          sectionTitle: 'Institution Operations',
          items: [
            {
              name: 'Hospital Dashboard',
              icon: <FaHospital />,
              path: '/admin-dashboard'
            },
            {
              name: 'Staff Overview',
              icon: <FaUsersCog />,
              path: '/staff-overview'
            },
            {
              name: 'utilization Reports',
              icon: <FaFileAlt />,
              path: '/admin-reports'
            }
          ]
        };
      case 'researcher':
        return {
          sectionTitle: 'Population Data',
          items: [
            {
              name: 'Population Analytics',
              icon: <FaDatabase />,
              path: '/researcher-dashboard'
            }
          ]
        };
      case 'system_admin':
        return {
          sectionTitle: 'System Control',
          items: [
            {
              name: 'Users Management',
              icon: <FaUsersCog />,
              path: '/sysadmin-dashboard'
            },
            {
              name: 'Audit Logs',
              icon: <FaShieldAlt />,
              path: '/sysadmin-dashboard/audit-logs'
            },
            {
              name: 'ML Model Control',
              icon: <FaCog />,
              path: '/sysadmin-dashboard/model-control'
            }
          ]
        };
      default:
        return { sectionTitle: 'HMS Portal', items: [] };
    }
  };

  const menuConfig = getMenuItems();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const formatRole = (role) => {
    if (role === 'hospital_admin') return 'Hospital Administrator';
    if (role === 'doctor') return 'Doctor / Staff';
    if (role === 'researcher') return 'Healthcare Researcher';
    if (role === 'system_admin') return 'System Administrator';
    return role;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <FaHeartbeat className="sidebar-logo" />
          <span className="sidebar-title">HealthForecast</span>
        </div>
        
        <nav className="sidebar-menu">
          {/* Section Category Title */}
          <div className="sidebar-section-title">
            {menuConfig.sectionTitle}
          </div>

          {menuConfig.items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileOpen(false); // close mobile sidebar on navigation
                }}
                title={isCollapsed ? item.name : ''}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-name">{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Sidebar User Details Card to fill space */}
        <div className="sidebar-user-card">
          <div className="user-avatar" style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}>
            {getInitials(user.name)}
          </div>
          <div className="user-info">
            <span className="sidebar-user-card-name" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{user.name}</span>
            <span className="sidebar-user-card-role" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatRole(user.role)}</span>
          </div>
        </div>

        {/* Diagnostic Status Indicator widget */}
        <div className="sidebar-health-widget">
          <div className="health-status-row">
            <span>AI Core Model</span>
            <div className="health-pulse-dot"></div>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Status: Active & Calibrated
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content frame */}
      <div className="main-wrapper">
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle-btn" 
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                setIsMobileOpen(!isMobileOpen);
              }}
            >
              <FaBars />
            </button>
            
            <div className="search-bar-wrapper">
              <FaSearch className="search-bar-icon" />
              <input 
                type="text" 
                className="search-bar-input" 
                placeholder="Search records, analytics logs, reports..." 
              />
            </div>
          </div>
          
          <div className="header-right">
            {/* Notification bell UI placeholder */}
            <button className="notification-bell-btn" title="System Notifications">
              <FaBell />
              <div className="notification-dot"></div>
            </button>

            {/* Profile widget */}
            <div className="user-profile-widget">
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role-badge">{formatRole(user.role)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
