import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiSettings, FiUser, FiLogOut, FiX,
  FiActivity, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = {
  doctor: [
    { to: '/dashboard/doctor', icon: FiHome,     label: 'Dashboard' },
    { to: '/risk-analyzer',      icon: FiActivity, label: 'Risk Forecast' },
    { to: '/analytics',          icon: FiActivity, label: 'Analytics' },
    { to: '/clinical-insights',  icon: FiActivity, label: 'Clinical Insights' },
    { to: '/patients',           icon: FiUser,     label: 'Patients' },
    { to: '/appointments',       icon: FiActivity, label: 'Appointments' },
    { to: '/reports',            icon: FiActivity, label: 'Reports' },
    { to: '/profile',          icon: FiUser,     label: 'My Profile' },
    { to: '/settings',         icon: FiSettings, label: 'Settings'   },
  ],
  hospital_admin: [
    { to: '/dashboard/admin',  icon: FiHome,     label: 'Dashboard' },
    { to: '/patients',         icon: FiUser,     label: 'Patients' },
    { to: '/appointments',     icon: FiActivity, label: 'Appointments' },
    { to: '/reports',          icon: FiActivity, label: 'Reports' },
    { to: '/profile',          icon: FiUser,     label: 'My Profile' },
    { to: '/settings',         icon: FiSettings, label: 'Settings'   },
  ],
  researcher: [
    { to: '/dashboard/researcher', icon: FiHome,     label: 'Dashboard' },
    { to: '/analytics',             icon: FiActivity, label: 'Analytics' },
    { to: '/reports',               icon: FiActivity, label: 'Reports' },
    { to: '/profile',              icon: FiUser,     label: 'My Profile' },
    { to: '/settings',             icon: FiSettings, label: 'Settings'   },
  ],
  system_admin: [
    { to: '/dashboard/sysadmin', icon: FiHome,     label: 'Dashboard' },
    { to: '/patients',          icon: FiUser,     label: 'Patients' },
    { to: '/appointments',      icon: FiActivity, label: 'Appointments' },
    { to: '/reports',           icon: FiActivity, label: 'Reports' },
    { to: '/profile',            icon: FiUser,     label: 'My Profile' },
    { to: '/settings',           icon: FiSettings, label: 'Settings'   },
  ],
};

const ROLE_LABELS = {
  doctor:        'Doctor',
  hospital_admin:'Hospital Admin',
  researcher:    'Researcher',
  system_admin:  'System Admin',
};

const AVATAR_GRAD = {
  doctor:        'from-blue-500 to-blue-700',
  hospital_admin:'from-violet-500 to-violet-700',
  researcher:    'from-emerald-500 to-emerald-700',
  system_admin:  'from-orange-400 to-orange-600',
};

const ROLE_DOT = {
  doctor:        'bg-blue-500',
  hospital_admin:'bg-violet-500',
  researcher:    'bg-emerald-500',
  system_admin:  'bg-orange-500',
};

function SidebarContent({ collapsed, onClose, isMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role?.toString().toLowerCase().replace(/\s+/g, '_');
  const links = NAV_LINKS[userRole] || [];
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const grad = AVATAR_GRAD[userRole] || 'from-blue-500 to-blue-700';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 ${collapsed && !isMobile ? 'w-[68px]' : 'w-64'}`}>

      {/* ── Logo row ── */}
      <div className={`flex items-center h-16 border-b border-slate-100 dark:border-slate-700/60 flex-shrink-0 ${collapsed && !isMobile ? 'justify-center px-0' : 'justify-between px-5'}`}>
        {(!collapsed || isMobile) && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.2 }}
            className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <FiActivity className="text-white" size={16} />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight whitespace-nowrap">
              HealthForecast <span className="text-blue-600">AI</span>
            </span>
          </motion.div>
        )}
        {collapsed && !isMobile && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <FiActivity className="text-white" size={16} />
          </div>
        )}
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <FiX size={17} />
          </button>
        )}
      </div>

      {/* ── User card ── */}
      <div className={`border-b border-slate-100 dark:border-slate-700/60 flex-shrink-0 ${collapsed && !isMobile ? 'py-4 flex justify-center' : 'px-4 py-4'}`}>
        {collapsed && !isMobile ? (
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-extrabold shadow-sm`}>
            {initials}
          </div>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.2 }}
            className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm font-extrabold shadow-sm flex-shrink-0`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ROLE_DOT[userRole] || 'bg-slate-400'}`} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  {ROLE_LABELS[userRole] || user?.role}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Nav links ── */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
        )}
        <div className="space-y-0.5">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl transition-all duration-150 font-medium text-sm
                ${collapsed && !isMobile ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                ${isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }>
              {({ isActive }) => (
                <>
                  {/* Active left bar */}
                  {isActive && (
                    <motion.span layoutId="activeBar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full"
                      transition={{ type:'spring', stiffness:400, damping:30 }} />
                  )}
                  {/* Icon */}
                  <span className={`flex-shrink-0 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Icon size={18} />
                  </span>
                  {/* Label */}
                  {(!collapsed || isMobile) && (
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.15 }}
                      className="truncate">
                      {label}
                    </motion.span>
                  )}
                  {/* Tooltip when collapsed */}
                  {collapsed && !isMobile && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg z-50">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Logout ── */}
      <div className={`border-t border-slate-100 dark:border-slate-700/60 py-3 flex-shrink-0 ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
        <button onClick={handleLogout}
          className={`group relative w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150
            ${collapsed && !isMobile ? 'justify-center px-0' : 'px-3'}`}>
          <FiLogOut size={18} className="flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.15 }}>
              Sign Out
            </motion.span>
          )}
          {collapsed && !isMobile && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg z-50">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 relative">
        <SidebarContent collapsed={collapsed} onClose={onClose} isMobile={false} />

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center shadow-md text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors z-10">
          {collapsed
            ? <FiChevronRight size={12} />
            : <FiChevronLeft  size={12} />
          }
        </motion.button>
      </aside>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose} />
            <motion.aside
              initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden shadow-2xl">
              <SidebarContent collapsed={false} onClose={onClose} isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
