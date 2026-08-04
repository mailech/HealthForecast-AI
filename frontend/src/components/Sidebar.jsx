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

export const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patient Management', icon: Users },
    { path: '/predict', label: 'AI Risk Predictor', icon: BrainCircuit, badge: 'AI Model' },
    { path: '/treatment', label: 'Treatment Intelligence', icon: Stethoscope },
    { path: '/analytics', label: 'Healthcare Analytics', icon: BarChart3 },
    { path: '/reports', label: 'Reports & Export', icon: FileText },
    { path: '/profile', label: 'Clinician Settings', icon: UserCheck },
  ];

  return (
    <aside className="w-64 glass-panel min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex border-r border-slate-800/80">
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
                      isActive
                        ? 'bg-gradient-to-r from-medical-cyan/20 to-medical-teal/10 text-medical-cyan border border-medical-cyan/30 shadow-cyan-glow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-medical-cyan text-slate-950 font-bold uppercase">
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
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Landing Overview</span>
          </NavLink>
        </div>
      </div>

      {/* Model & System Status Widget */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 text-slate-300">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[11px] font-bold text-slate-200">ML Model Active</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal">
          RandomForest v1.4 • 30-Day Readmission Predictor Engine
        </p>
      </div>
    </aside>
  );
};
