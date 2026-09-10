import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AccessDeniedViewProps {
  requiredRole?: string;
  moduleName?: string;
  targetModule?: string;
  onNavigateHome?: () => void;
  onGoBack?: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  requiredRole = 'SYSTEM_ADMIN',
  moduleName,
  targetModule,
  onNavigateHome,
  onGoBack,
  onSwitchRole
}) => {
  const { role, switchRole } = useAuth();

  const handleReturn = () => {
    if (onGoBack) {
      onGoBack();
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleQuickElevate = (targetRole: UserRole) => {
    if (onSwitchRole) {
      onSwitchRole(targetRole);
    } else {
      switchRole(targetRole);
    }
  };

  const moduleNamesMap: Record<string, string> = {
    'admin-users': 'System User Management',
    'admin-roles': 'Role & RBAC Matrix',
    'admin-datasets': 'Dataset Ingestion Pipeline',
    'admin-models': 'AI Model Management',
    'admin-audit': 'Security Surveillance & Audit Logs',
    'admin-dashboard': 'Administration Dashboard',
    'doctor-dashboard': 'Doctor Clinical Dashboard',
    'hospital-dashboard': 'Hospital Administrator Dashboard',
    'researcher-dashboard': 'Researcher Population Dashboard',
    'clinical-decision-support': 'Clinical Decision Support (Attending Physician)'
  };

  const displayModuleName =
    moduleName || (targetModule ? moduleNamesMap[targetModule] || targetModule : 'Protected Institutional Module');

  const targetElevatedRole = (requiredRole as UserRole) || 'SYSTEM_ADMIN';

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-rose-200/80 shadow-xl overflow-hidden p-8 text-center space-y-6">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>Role-Based Access Control Barrier</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Access Restricted: {displayModuleName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your current institutional credential (<span className="font-semibold text-slate-900">{role.replace('_', ' ')}</span>) does not have authorization clearance to access this module under the HealthForecast AI Page 6 Governance Matrix.
          </p>
        </div>

        {/* RBAC Breakdown Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Current Active Clearance:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 uppercase font-mono text-[11px]">
              {role.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Required Clearance:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase font-mono text-[11px]">
              {requiredRole.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Governance Standard:</span>
            <span className="font-mono text-slate-700">HIPAA Safe-Harbor & CMS Access Rules</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReturn}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={() => handleQuickElevate(targetElevatedRole)}
            className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Switch to {requiredRole.replace('_', ' ')} (Demo Elevation)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
