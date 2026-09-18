import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  Stethoscope,
  BarChart3,
  FileText,
  UserCheck,
  Home,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  
  const allNavItems = [
    { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, roles: ['Doctor', 'Hospital Administrator', 'System Administrator', 'Healthcare Researcher'] },
    { path: '/patients', label: 'Patient Management', icon: Users, roles: ['Doctor', 'Hospital Administrator'] },
    { path: '/predict', label: 'AI Risk Predictor', icon: BrainCircuit, badge: 'AI Model', roles: ['Doctor', 'Healthcare Researcher'] },
    { path: '/treatment', label: 'Treatment Intelligence', icon: Stethoscope, roles: ['Doctor', 'Hospital Administrator'] },
    { path: '/analytics', label: 'Healthcare Analytics', icon: BarChart3, roles: ['Doctor', 'Hospital Administrator'] },
    { path: '/reports', label: 'Reports & Export', icon: FileText, roles: ['Doctor', 'Hospital Administrator', 'Healthcare Researcher'] },
    { path: '/profile', label: 'Clinician Settings', icon: UserCheck, roles: ['Doctor', 'Hospital Administrator', 'System Administrator', 'Healthcare Researcher'] },
  ];

  // Filter items based on user role. Fallback to all if user not fully loaded yet.
  const navItems = user?.role ? allNavItems.filter(item => item.roles.includes(user.role)) : allNavItems;

  return (
    <aside className="w-64 glass-panel min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex border-r border-slate-200/80">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">
            Core Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">
            Quick Actions
          </p>
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 hover:bg-white/40 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Landing Overview</span>
          </NavLink>
        </div>
      </div>

      {/* Model & System Status Widget */}
      <div className="p-3.5 rounded-xl bg-slate-50 text-slate-800/90 border border-slate-200 text-slate-600">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[11px] font-bold text-slate-700">ML Model Active</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal">
          RandomForest v1.4 - 30-Day Readmission Predictor Engine
        </p>
      </div>
    </aside>
  );
};
