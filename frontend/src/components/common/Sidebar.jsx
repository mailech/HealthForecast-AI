import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiSettings, FiUser, FiLogOut, FiX,
  FiActivity, FiChevronLeft, FiChevronRight,
  FiUsers, FiCalendar, FiBarChart2, FiFileText, FiZap, FiLayers,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = {
  doctor: [
    { to: '/dashboard/doctor',   icon: FiHome,      label: 'Dashboard' },
    { to: '/patients',           icon: FiUsers,     label: 'Patients' },
    { to: '/risk-analyzer',      icon: FiActivity,  label: 'Risk Analyzer' },
    { to: '/appointments',       icon: FiCalendar,  label: 'Appointments' },
    { to: '/clinical-insights',  icon: FiZap,       label: 'Clinical Insights' },
    { to: '/reports',            icon: FiFileText,  label: 'Reports' },
    { to: '/profile',            icon: FiUser,      label: 'My Profile' },
    { to: '/settings',           icon: FiSettings,  label: 'Settings'   },
  ],
  hospital_admin: [
    { to: '/dashboard/admin',    icon: FiHome,      label: 'Dashboard' },
    { to: '/beds',               icon: FiLayers,    label: 'Bed & Ward Mgmt' },
    { to: '/patients',           icon: FiUsers,     label: 'Patients' },
    { to: '/appointments',       icon: FiCalendar,  label: 'Appointments' },
    { to: '/analytics',          icon: FiBarChart2, label: 'Analytics' },
    { to: '/reports',            icon: FiFileText,  label: 'Reports' },
    { to: '/profile',            icon: FiUser,      label: 'My Profile' },
    { to: '/settings',           icon: FiSettings,  label: 'Settings'   },
  ],
  researcher: [
    { to: '/dashboard/researcher', icon: FiHome,      label: 'Dashboard' },
    { to: '/analytics',            icon: FiBarChart2, label: 'Analytics' },
    { to: '/reports',              icon: FiFileText,  label: 'Reports' },
    { to: '/profile',              icon: FiUser,      label: 'My Profile' },
    { to: '/settings',             icon: FiSettings,  label: 'Settings'   },
  ],
  system_admin: [
    { to: '/dashboard/sysadmin', icon: FiHome,      label: 'Dashboard' },
    { to: '/patients',           icon: FiUsers,     label: 'Patients' },
    { to: '/appointments',       icon: FiCalendar,  label: 'Appointments' },
    { to: '/reports',            icon: FiFileText,  label: 'Reports' },
    { to: '/profile',            icon: FiUser,      label: 'My Profile' },
    { to: '/settings',           icon: FiSettings,  label: 'Settings'   },
  ],
};

const ROLE_LABELS = {
  doctor:        'Doctor',
  hospital_admin:'Hospital Admin',
  researcher:    'Researcher',
  system_admin:  'System Admin',
};

function getRoleDashboardPath(role) {
  const normalized = role?.toString().toLowerCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'doctor': return '/dashboard/doctor';
    case 'hospital_admin': return '/dashboard/admin';
    case 'researcher': return '/dashboard/researcher';
    case 'system_admin': return '/dashboard/sysadmin';
    default: return '/';
  }
}

function SidebarContent({ collapsed, onClose, isMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role?.toString().toLowerCase().replace(/\s+/g, '_');
  const links = NAV_LINKS[userRole] || [];
  const userName = user?.full_name || user?.name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 ${collapsed && !isMobile ? 'w-[68px]' : 'w-64'}`}>

      {/* ── Logo row ── */}
      <div className={`flex items-center h-16 border-b border-slate-150 dark:border-slate-800 flex-shrink-0 ${collapsed && !isMobile ? 'justify-center px-0' : 'justify-between px-5'}`}>
        {(!collapsed || isMobile) && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.2 }}>
            <NavLink to={getRoleDashboardPath(user?.role)} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-sm shadow-blue-500/20 flex-shrink-0">
                <FiActivity size={16} />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight whitespace-nowrap">
                CarePulse <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
              </span>
            </NavLink>
          </motion.div>
        )}
        {collapsed && !isMobile && (
          <NavLink to={getRoleDashboardPath(user?.role)} className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-sm">
            <FiActivity size={16} />
          </NavLink>
        )}
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <FiX size={17} />
          </button>
        )}
      </div>

      {/* ── User summary card ── */}
      <div className={`border-b border-slate-150 dark:border-slate-800 flex-shrink-0 ${collapsed && !isMobile ? 'py-4 flex justify-center' : 'px-4 py-3.5'}`}>
        {collapsed && !isMobile ? (
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold border border-blue-200 dark:border-blue-900 shadow-xs">
            {initials}
          </div>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.2 }}
            className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold border border-blue-200 dark:border-blue-900 shadow-xs flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate">
                  {ROLE_LABELS[userRole] || user?.role}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Scrollable Nav Links ── */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2.5">
            Navigation
          </p>
        )}
        <div className="space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl transition-all duration-150 font-medium text-sm
                ${collapsed && !isMobile ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                ${isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/40 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`
              }>
              {({ isActive }) => (
                <>
                  {/* Active left indicator bar */}
                  {isActive && (
                    <motion.span layoutId="activeBar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 dark:bg-blue-400 rounded-r-full"
                      transition={{ type:'spring', stiffness:400, damping:30 }} />
                  )}
                  {/* Icon */}
                  <span className={`flex-shrink-0 transition-transform duration-150 ${isActive ? 'scale-105 text-blue-600 dark:text-blue-400' : 'group-hover:scale-105 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                    <Icon size={18} />
                  </span>
                  {/* Label */}
                  {(!collapsed || isMobile) && (
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.15 }}
                      className="truncate">
                      {label}
                    </motion.span>
                  )}
                  {/* Tooltip in collapsed mode */}
                  {collapsed && !isMobile && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                      {label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Bottom Sign Out Section ── */}
      <div className={`p-3 border-t border-slate-200/90 dark:border-slate-800 flex-shrink-0 ${collapsed && !isMobile ? 'flex justify-center' : ''}`}>
        <button onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium text-sm
          ${collapsed && !isMobile ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
          title={collapsed ? 'Sign Out' : undefined}>
          <FiLogOut size={17} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>

    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col relative h-full flex-shrink-0">
        <SidebarContent collapsed={collapsed} />
        {/* Toggle collapse button */}
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-30"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <FiChevronRight size={13} /> : <FiChevronLeft size={13} />}
        </button>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs" />
            <motion.div initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'spring', damping:28, stiffness:300 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <SidebarContent collapsed={false} onClose={onClose} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

