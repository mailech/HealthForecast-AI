import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Bell, Search, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass-nav px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">HealthForecast</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 font-semibold">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Readmission Intelligence System</p>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button 
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-slate-200/60 text-slate-500 hover:text-slate-700 hover:border-blue-500/40 transition-all text-sm"
          >
            <Search className="w-4 h-4 text-blue-500" />
            <span>Search patient by name, code, or diagnosis...</span>
            <kbd className="ml-auto text-[10px] px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">⌘K</kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="relative p-2.5 rounded-xl bg-white border border-slate-200/60 text-slate-600 hover:text-blue-500 hover:border-blue-500/40 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white animate-pulse"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border border-slate-200 rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">2 New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors text-left">
                    <p className="text-xs font-semibold text-slate-900">AI Model Updated</p>
                    <p className="text-xs text-slate-500 mt-0.5">The RandomForest v1.4 readmission model has completed weekend retraining.</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">2 hours ago</p>
                  </div>
                  <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors text-left">
                    <p className="text-xs font-semibold text-rose-600">High Risk Patient Alert</p>
                    <p className="text-xs text-slate-600 mt-0.5">Patient HF-8041 has been flagged as High Risk (78.4%) for 30-day readmission.</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">5 hours ago</p>
                  </div>
                </div>
                <div className="px-4 py-2 text-center">
                  <button onClick={() => setShowNotifications(false)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Mark all as read</button>
                </div>
              </div>
            )}
          </div>

          {/* Clinician Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-white border border-slate-200/60 hover:border-slate-600 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                {user?.full_name ? user.full_name.split(' ').map(n=>n[0]).join('') : 'SJ'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.full_name || 'Dr. Sarah Jenkins'}</p>
                <p className="text-[10px] text-blue-500 font-medium">{user?.role || 'Doctor'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 shadow-md border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-slate-200/50">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {user?.hospital_name || 'MetroHealth General'}
                  </span>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-white/60 hover:text-slate-900 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-500" />
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
