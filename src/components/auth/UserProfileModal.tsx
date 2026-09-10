import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  X,
  User,
  Shield,
  Building2,
  Stethoscope,
  Microscope,
  Sliders,
  CheckCircle2,
  XCircle,
  Key,
  LogOut,
  Sparkles,
  Award
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRoleAndNavigate?: (role: UserRole) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onSwitchRoleAndNavigate
}) => {
  const { currentUser, role, token, logout, switchRole } = useAuth();

  if (!isOpen) return null;

  const roleMeta: Record<UserRole, { label: string; badgeColor: string; icon: any }> = {
    DOCTOR: {
      label: 'Doctor (Attending Physician)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Stethoscope
    },
    HOSPITAL_ADMIN: {
      label: 'Hospital Administrator',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building2
    },
    HEALTHCARE_RESEARCHER: {
      label: 'Healthcare Researcher',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Microscope
    },
    SYSTEM_ADMIN: {
      label: 'System Administrator',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Sliders
    }
  };

  const meta = roleMeta[role];
  const Icon = meta.icon;

  // Page 6 Access Matrix Permissions Breakdown
  const permissions = [
    { name: 'Patient Records', doctor: 'Assigned', admin: 'View Only', res: 'Anonymized', sys: 'Full' },
    { name: 'Medical History', doctor: 'Assigned', admin: 'View Only', res: 'Anonymized', sys: 'Full' },
    { name: 'Risk Prediction Reports', doctor: 'Yes', admin: 'Yes', res: 'Aggregated', sys: 'Yes' },
    { name: 'Readmission Forecasts', doctor: 'Yes', admin: 'Yes', res: 'Aggregated', sys: 'Yes' },
    { name: 'Treatment Effectiveness', doctor: 'Yes', admin: 'Yes', res: 'Yes', sys: 'Yes' },
    { name: 'Hospital Analytics', doctor: 'Limited', admin: 'Full', res: 'Aggregated', sys: 'Full' },
    { name: 'Population Health Reports', doctor: 'No', admin: 'Yes', res: 'Yes', sys: 'Yes' },
    { name: 'Research Dataset Export', doctor: 'No', admin: 'No', res: 'Yes', sys: 'Yes' },
    { name: 'User Management', doctor: 'No', admin: 'No', res: 'No', sys: 'Yes' },
    { name: 'Model Management', doctor: 'No', admin: 'No', res: 'No', sys: 'Yes' }
  ];

  const getRoleStatus = (p: typeof permissions[0]) => {
    switch (role) {
      case 'DOCTOR': return p.doctor;
      case 'HOSPITAL_ADMIN': return p.admin;
      case 'HEALTHCARE_RESEARCHER': return p.res;
      case 'SYSTEM_ADMIN': return p.sys;
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    if (onSwitchRoleAndNavigate) {
      onSwitchRoleAndNavigate(newRole);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">User Profile & RBAC Clearance</h2>
              <span className="text-[11px] text-slate-500">Institutional Identity & Session Token</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Bio Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {currentUser.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{currentUser.title}</p>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.hospital || 'St. Jude Metropolitan Health System'}
                </span>
                {currentUser.department && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.department}
                  </span>
                )}
                {currentUser.npiNumber && (
                  <span className="font-mono text-slate-700 font-semibold">
                    {currentUser.npiNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Session Token & Security Metadata */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Key className="w-3.5 h-3.5" />
                Active Cryptographic JWT Session Token
              </span>
              <span className="text-emerald-400 font-bold font-mono">STATUS: VALID</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg break-all select-all">
              {token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU1ItRE9DLTAwMSIsInJvbGUiOiJET0NUT1IifQ...'}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Account Email: {currentUser.email}</span>
              <span>Last Login: {currentUser.lastLogin}</span>
            </div>
          </div>

          {/* Page 6 Access Matrix Table for this User */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                Authorized Clearance (Page 6 Matrix)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Real-time RBAC Enforcement</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {permissions.map((p) => {
                const status = getRoleStatus(p);
                const isDenied = status === 'No';
                const isLimited = status === 'Limited' || status === 'Assigned' || status === 'View Only';
                return (
                  <div key={p.name} className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50">
                    <span className="text-slate-700 font-medium">{p.name}</span>
                    <div className="flex items-center gap-1.5">
                      {isDenied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" />
                          Restricted
                        </span>
                      ) : isLimited ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          {status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Switch Test Role (Sandbox Evaluation)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['DOCTOR', 'HOSPITAL_ADMIN', 'HEALTHCARE_RESEARCHER', 'SYSTEM_ADMIN'] as UserRole[]).map((r) => {
                const isCurrent = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Workstation</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
