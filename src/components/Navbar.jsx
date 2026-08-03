import React from 'react';
import { Activity, Bell, Shield, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const {
    currentRoleKey,
    currentRole,
    switchRole,
    setNotificationsOpen,
    setAccessMatrixOpen
  } = useAuth();

  const rolesList = [
    { key: "DOCTOR", label: "Doctor", color: "cyan" },
    { key: "ADMIN", label: "Hospital Admin", color: "emerald" },
    { key: "RESEARCHER", label: "Researcher", color: "purple" },
    { key: "SYSADMIN", label: "SysAdmin", color: "amber" }
  ];

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            HealthForecast <span className="text-cyan-400 font-bold">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 hidden sm:block">
            Hospital Readmission Prediction & Risk Intelligence
          </p>
        </div>
      </div>

      {/* Role Switcher Toolbar (PDF Page 3-5 RBAC) */}
      <div className="hidden lg:flex items-center space-x-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 px-2.5 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          Active Role:
        </span>
        {rolesList.map(r => {
          const isActive = currentRoleKey === r.key;
          return (
            <button
              key={r.key}
              onClick={() => switchRole(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                r.key === 'DOCTOR' ? 'bg-cyan-400' :
                r.key === 'ADMIN' ? 'bg-emerald-400' :
                r.key === 'RESEARCHER' ? 'bg-purple-400' : 'bg-amber-400'
              }`} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* RBAC Matrix Modal Toggle */}
        <button
          onClick={() => setAccessMatrixOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
          title="View PDF Access Matrix"
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span>RBAC Matrix</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotificationsOpen(prev => !prev)}
          className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-slate-900 animate-pulse" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <img
            src={currentRole.avatar}
            alt={currentRole.name}
            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-200 leading-none">{currentRole.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{currentRole.roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
