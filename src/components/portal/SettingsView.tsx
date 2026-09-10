import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Database,
  CheckCircle,
  Key,
  Smartphone,
  Lock,
  Hospital,
  Server
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system' | 'integrations'>('profile');
  const [saveToast, setSaveToast] = useState(false);

  // Form states
  const [phone, setPhone] = useState('+1 (555) 392-1049');
  const [department, setDepartment] = useState(currentUser.department || 'Endocrinology');
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [defaultView, setDefaultView] = useState('Command Center');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              System Settings & User Profile
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
              Role: {role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure clinician preferences, security policies, and EHR integration endpoints.
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully updated and synchronized across active sessions.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'profile', label: 'User Profile & Identity', icon: User },
          { id: 'security', label: 'Security & Access Credentials', icon: Shield },
          { id: 'system', label: 'Platform Preferences', icon: Sliders },
          { id: 'integrations', label: 'EHR & FHIR Bridges', icon: Server }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-500/20 shadow-md"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hospital Enterprise Email</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department Affiliation</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Security & Authentication Policies</h3>
            <p className="text-xs text-slate-500">HIPAA security rule enforcement and credential controls</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Two-Factor Authentication (2FA)</span>
                <span className="text-slate-500">Requires authenticator app token or hospital smartcard for login</span>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  twoFactor ? 'bg-sky-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    twoFactor ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Inactivity Auto-Logout Timeout</span>
                <span className="text-slate-500">Session terminates after consecutive idle minutes</span>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
              >
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes (HIPAA Recommended)</option>
                <option value="60 minutes">60 minutes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* System Preferences Tab */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Workstation Preferences</h3>
            <p className="text-slate-500">Display configuration and clinical dashboard defaults</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Landing View</label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
              >
                <option value="Command Center">Command Center Dashboard</option>
                <option value="Patient Registry">Patient Registry</option>
                <option value="Risk Prediction Engine">Risk Prediction Engine</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date & Time Format</label>
              <input
                type="text"
                disabled
                value="YYYY-MM-DD (ISO 8601 Clinical Standard)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* EHR & FHIR Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">EHR Interface & Data Pipeline Status</h3>
            <p className="text-slate-500">Live connectors to hospital health records systems</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                  FHIR
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">HL7 FHIR R4 Ingestion Bridge</span>
                  <span className="text-slate-500">Syncing patient encounters, vitals & ICD-10 diagnostic codes</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connected
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center">
                  API
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">FastAPI ML Inference Gateway</span>
                  <span className="text-slate-500">Endpoint: https://api.stjude-health.internal/v2/predict</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> 34ms Latency
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
