import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, Shield, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'Doctor':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Hospital Administrator':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Healthcare Researcher':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'System Administrator':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Activity className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            HealthForecast <span className="text-cyan-400 font-extrabold">AI</span>
          </h1>
          <p className="text-xs text-slate-400">Hospital Readmission & Risk Intelligence</p>
        </div>
      </div>

      {/* Middle Banner: Medical Disclaimer */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
        <Shield className="h-3.5 w-3.5 text-cyan-400" />
        <span>Clinical Decision-Support Engine <strong className="text-slate-400 font-medium">(Non-Diagnostic)</strong></span>
      </div>

      {/* Right User Controls */}
      {user && (
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-200">{user.full_name}</div>
            <div className="text-xs text-slate-400">{user.department || user.email}</div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role?.name)}`}>
            {user.role?.name}
          </span>

          <button
            onClick={logout}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
};
