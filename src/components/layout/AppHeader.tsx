import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import {
  Activity,
  Search,
  Bell,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Building2,
  Microscope,
  Sliders,
  Check,
  Menu,
  X,
  Shield,
  Settings,
  LogOut
} from 'lucide-react';

interface AppHeaderProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isWebsiteMode: boolean;
  onToggleWebsiteMode: (isWebsite: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPatientById: (patientId: string) => void;
  onToggleMobileSidebar: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  onNavigate,
  isWebsiteMode,
  onToggleWebsiteMode,
  searchQuery,
  onSearchChange,
  onSelectPatientById,
  onToggleMobileSidebar
}) => {
  const { currentUser, role, switchRole, openProfileModal, logout, setAuthScreen } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string; icon: any; color: string }> = {
    DOCTOR: {
      title: 'Doctor',
      badge: 'Assigned Patients Only',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    HOSPITAL_ADMIN: {
      title: 'Hospital Admin',
      badge: 'Hospital-wide Analytics',
      icon: Building2,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    HEALTHCARE_RESEARCHER: {
      title: 'Researcher',
      badge: 'Anonymized Data Only',
      icon: Microscope,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    SYSTEM_ADMIN: {
      title: 'System Admin',
      badge: 'Full Governance & AI Ops',
      icon: Sliders,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  };

  const activeRoleConfig = roleLabels[role];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger (mobile) + Logo & Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onToggleWebsiteMode(true)}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-xs group-hover:shadow-md transition-shadow">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  HealthForecast
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                Hospital Risk Intelligence
              </span>
            </div>
          </button>

          {/* Mode Tabs: Website vs Clinical Platform */}
          <div className="hidden md:flex items-center ml-4 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => onToggleWebsiteMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isWebsiteMode
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Platform Website</span>
            </button>
            <button
              onClick={() => onToggleWebsiteMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !isWebsiteMode
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Live Clinical Portal</span>
            </button>
          </div>
        </div>

        {/* Center: Global Patient & Clinical Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name, ID (e.g. PT-10492), or diagnosis..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Demo Role Selector + Notifications + User Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${activeRoleConfig.color} hover:shadow-xs`}
              title="Switch demo role to test RBAC permissions"
            >
              <activeRoleConfig.icon className="w-3.5 h-3.5 shrink-0" />
              <div className="text-left hidden xl:block">
                <span className="font-bold block leading-none">{activeRoleConfig.title}</span>
                <span className="text-[10px] opacity-85 leading-none">{currentUser.name}</span>
              </div>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Demo Role (Test RBAC)
                  </span>
                </div>
                {(['DOCTOR', 'HOSPITAL_ADMIN', 'HEALTHCARE_RESEARCHER', 'SYSTEM_ADMIN'] as UserRole[]).map((r) => {
                  const cfg = roleLabels[r];
                  const isSelected = role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleDropdownOpen(false);
                        if (currentView.endsWith('-dashboard') || currentView === 'dashboard') {
                          const dashMap: Record<UserRole, string> = {
                            DOCTOR: 'doctor-dashboard',
                            HOSPITAL_ADMIN: 'hospital-dashboard',
                            HEALTHCARE_RESEARCHER: 'researcher-dashboard',
                            SYSTEM_ADMIN: 'admin-dashboard'
                          };
                          onNavigate(dashMap[r]);
                        }
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isSelected ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <cfg.icon className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{cfg.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">{cfg.badge}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900">Clinical Alerts & Notifications</span>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                    2 unread
                  </span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.patientId) onSelectPatientById(n.patientId);
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        n.read ? 'bg-white border-slate-100 opacity-75' : 'bg-sky-50/50 border-sky-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                        <span className="truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-600 font-normal shrink-0 ml-2">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    onToggleWebsiteMode(false);
                    setNotifDropdownOpen(false);
                  }}
                  className="w-full text-center text-[11px] font-semibold text-sky-600 hover:text-sky-800 pt-2 block cursor-pointer"
                >
                  View All Notifications & Alerts →
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity cursor-pointer text-left"
              aria-label="User Account Menu"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200/80 shadow-xs"
              />
              <div className="hidden xl:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none truncate max-w-[130px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  {currentUser.department || 'Healthcare Staff'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center gap-3 p-2 border-b border-slate-100 pb-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/30"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      {roleLabels[role]?.title || role}
                    </span>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openProfileModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>View Profile & Credentials</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setRoleDropdownOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Switch Test Role (RBAC)</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('settings');
                      onToggleWebsiteMode(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Account & Security Settings</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      setAuthScreen('login');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">JWT End</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
