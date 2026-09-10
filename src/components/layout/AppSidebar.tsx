import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Activity,
  TrendingDown,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Bell,
  Settings,
  Shield,
  Database,
  Cpu,
  History,
  Lock,
  ChevronRight,
  Hospital,
  SlidersHorizontal,
  Stethoscope,
  X
} from 'lucide-react';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  isMobileOpen,
  onCloseMobile
}) => {
  const { role, currentUser, canManageAIModels, canManageUsers, canAccessModule } = useAuth();

  // Dynamic Navigation Items tailored strictly to Page 6 Role Permissions
  const getNavItems = () => {
    switch (role) {
      case 'DOCTOR':
        return [
          { id: 'doctor-dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'Assigned Patients', icon: Users },
          { id: 'risk-predictions', label: 'Risk Prediction Reports', icon: Activity },
          { id: 'readmission-forecasts', label: 'Readmission Forecasts', icon: TrendingDown },
          { id: 'treatment-effectiveness', label: 'Treatment Effectiveness', icon: Stethoscope },
          { id: 'clinical-decision-support', label: 'Clinical Decision Support', icon: Sparkles },
          { id: 'reports', label: 'Patient Outcome Reports', icon: FileSpreadsheet },
          { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ];

      case 'HOSPITAL_ADMIN':
        return [
          { id: 'hospital-dashboard', label: 'Hospital Dashboard', icon: LayoutDashboard },
          { id: 'healthcare-analytics', label: 'Hospital-wide Analytics', icon: BarChart3 },
          { id: 'patients', label: 'Patient Census (View Only)', icon: Users },
          { id: 'readmission-forecasts', label: 'Readmission Statistics', icon: TrendingDown },
          { id: 'risk-predictions', label: 'Risk Predictions', icon: Activity },
          { id: 'treatment-effectiveness', label: 'Treatment Effectiveness', icon: Stethoscope },
          { id: 'reports', label: 'Healthcare Performance Reports', icon: FileSpreadsheet },
          { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ];

      case 'HEALTHCARE_RESEARCHER':
        return [
          { id: 'researcher-dashboard', label: 'Research Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'Anonymized Datasets', icon: Users },
          { id: 'healthcare-analytics', label: 'Aggregated Analytics', icon: BarChart3 },
          { id: 'treatment-effectiveness', label: 'Treatment Effectiveness', icon: Stethoscope },
          { id: 'readmission-forecasts', label: 'Readmission Trend Reports', icon: TrendingDown },
          { id: 'risk-predictions', label: 'Aggregated Risk Predictions', icon: Activity },
          { id: 'reports', label: 'Research Dataset Export', icon: FileSpreadsheet },
          { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ];

      case 'SYSTEM_ADMIN':
      default:
        return [
          { id: 'admin-dashboard', label: 'Administration Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'Patient Records (Full)', icon: Users },
          { id: 'risk-predictions', label: 'Risk Prediction Engine', icon: Activity },
          { id: 'readmission-forecasts', label: 'Readmission Forecasts', icon: TrendingDown },
          { id: 'treatment-effectiveness', label: 'Treatment Effectiveness', icon: Stethoscope },
          { id: 'clinical-decision-support', label: 'Clinical Decision Support', icon: Sparkles },
          { id: 'healthcare-analytics', label: 'Healthcare Analytics', icon: BarChart3 },
          { id: 'reports', label: 'All Platform Reports', icon: FileSpreadsheet },
          { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ];
    }
  };

  const navItems = getNavItems();

  const adminNavItems = [
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-roles', label: 'Role & RBAC Matrix', icon: Shield },
    { id: 'admin-datasets', label: 'Dataset Ingestion', icon: Database },
    { id: 'admin-models', label: 'AI Model Management', icon: Cpu },
    { id: 'admin-audit', label: 'Security & Audit Logs', icon: History }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const isSysAdmin = role === 'SYSTEM_ADMIN';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Hospital Identity banner */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
            <Hospital className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white tracking-tight truncate">
              St. Jude Metropolitan
            </h3>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              EHR Bridge Online
            </span>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Permitted Modules for Active Role */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            {role === 'DOCTOR'
              ? 'Doctor Clinical Scope'
              : role === 'HOSPITAL_ADMIN'
              ? 'Hospital Administration Scope'
              : role === 'HEALTHCARE_RESEARCHER'
              ? 'Research & Analytics Scope'
              : 'Clinical Intelligence'}
          </span>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Administration Section - ONLY visible to System Administrator per "Hide unauthorized navigation items" */}
        {isSysAdmin && (
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                System Governance
              </span>
              <span className="text-[10px] font-mono text-purple-300">
                Full Clearance
              </span>
            </div>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Active User RBAC Pill */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-600"
          />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white block truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-sky-400 block truncate font-medium">
              Role: {role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
