import React from 'react';
import {
  LayoutDashboard,
  Users,
  Brain,
  LineChart,
  Stethoscope,
  BarChart3,
  Cpu,
  UserCog,
  Lock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { activeTab, setActiveTab, currentRoleKey, canAccessFeature, getFeatureAccessLevel } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      featureName: 'Hospital Analytics Dashboard'
    },
    {
      id: 'patient-records',
      label: 'Patient Management',
      badge: 'Diabetes 130',
      icon: Users,
      featureName: 'Patient Records'
    },
    {
      id: 'risk-prediction',
      label: 'Risk Prediction',
      badge: 'AI Model',
      icon: Brain,
      featureName: 'Risk Prediction Reports'
    },
    {
      id: 'treatment-effectiveness',
      label: 'Treatment Effectiveness',
      icon: LineChart,
      featureName: 'Treatment Effectiveness Reports'
    },
    {
      id: 'clinical-decision',
      label: 'Clinical Decision Support',
      icon: Stethoscope,
      featureName: 'Readmission Forecasts'
    },
    {
      id: 'healthcare-analytics',
      label: 'Healthcare Analytics',
      icon: BarChart3,
      featureName: 'Population Health Reports'
    },
    {
      id: 'ai-model',
      label: 'AI Model Management',
      badge: 'XGBoost',
      icon: Cpu,
      featureName: 'Model Management'
    },
    {
      id: 'user-management',
      label: 'User Management (RBAC)',
      icon: UserCog,
      featureName: 'User Management'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation Group Header */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-2">
            Core Modules
          </span>
          <nav className="space-y-1">
            {navItems.map(item => {
              const isAllowed = canAccessFeature(item.featureName);
              const isActive = activeTab === item.id;
              const accessLevel = getFeatureAccessLevel(item.featureName);

              return (
                <button
                  key={item.id}
                  onClick={() => isAllowed && setActiveTab(item.id)}
                  disabled={!isAllowed}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : isAllowed
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <item.icon className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : isAllowed ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {item.badge && isAllowed && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.badge}
                      </span>
                    )}
                    {!isAllowed && (
                      <Lock className="w-3 h-3 text-slate-600" title={`Restricted for ${currentRoleKey}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Current Role Scope Indicator */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Permissions</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {currentRoleKey === 'DOCTOR' && "Scope restricted to assigned patients & clinical decision support."}
            {currentRoleKey === 'ADMIN' && "Full hospital-wide operational analytics & resource oversight."}
            {currentRoleKey === 'RESEARCHER' && "Anonymized clinical datasets & aggregated health metrics."}
            {currentRoleKey === 'SYSADMIN' && "Unrestricted platform administration, user CRUD, & AI models."}
          </p>
        </div>
      </div>

      {/* System Footer info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>AI Engine</span>
          <span className="text-slate-400 font-mono">v2.4 Active</span>
        </div>
        <div className="flex justify-between">
          <span>Dataset</span>
          <span className="text-slate-400 font-mono">Diabetes 130-US</span>
        </div>
      </div>
    </aside>
  );
};
