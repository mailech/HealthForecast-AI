import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Bell, Search, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass-nav px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-cyan to-medical-teal flex items-center justify-center shadow-cyan-glow group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">HealthForecast</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-medical-cyan/20 text-medical-cyan border border-medical-cyan/30 font-semibold">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Readmission Intelligence System</p>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button 
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-navy-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-medical-cyan/40 transition-all text-sm"
          >
            <Search className="w-4 h-4 text-medical-cyan" />
            <span>Search patient by name, code, or diagnosis...</span>
            <kbd className="ml-auto text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">⌘K</kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl bg-navy-800/80 border border-slate-700/60 text-slate-300 hover:text-medical-cyan hover:border-medical-cyan/40 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-navy-900 animate-pulse"></span>
          </button>

          {/* Clinician Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-navy-800/80 border border-slate-700/60 hover:border-slate-600 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-teal to-blue-600 flex items-center justify-center font-bold text-slate-900 text-xs">
                {user?.full_name ? user.full_name.split(' ').map(n=>n[0]).join('') : 'SJ'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'Dr. Sarah Jenkins'}</p>
                <p className="text-[10px] text-medical-cyan font-medium">{user?.role || 'Doctor'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-slate-700/50">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20">
                    {user?.hospital_name || 'MetroHealth General'}
                  </span>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-medical-cyan" />
                  Clinician Profile
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
