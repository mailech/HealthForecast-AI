import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../common/KPICard';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Sliders,
  Cpu,
  Users,
  Database,
  History,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Server,
  KeyRound
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (viewId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white rounded-3xl p-6 sm:p-8 border border-purple-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Healthcare AI Systems Operations & Full Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Administration Console: {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/80 max-w-2xl leading-relaxed">
              Serving <strong className="text-white">XGBoost v2.4 (Active Champion)</strong> with 42ms median latency. Complete administrative clearance over user roles, dataset ingestion pipelines, and HIPAA immutable audit logging.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('admin-models')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>AI Model Registry</span>
            </button>
            <button
              onClick={() => onNavigate('admin-users')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>User Governance</span>
            </button>
          </div>
        </div>

        {/* Scope Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/90 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>RBAC Scope: System Administrator (Full Access across All Clinical & Administrative Modules)</span>
          </div>
          <span className="text-[11px] font-mono text-purple-300">
            Status: HEALTHY • Latency: 42ms • Audit Compliance: 100%
          </span>
        </div>
      </div>

      <DisclaimerBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active AI Classifiers"
          value="3 Models"
          subtitle="XGBoost v2.4 serving primary traffic"
          icon={Cpu}
          color="purple"
          badge="Healthy"
        />
        <KPICard
          title="Serving Latency"
          value="42 ms"
          subtitle="99.98% uptime SLA compliance"
          icon={Activity}
          color="teal"
        />
        <KPICard
          title="Clinical Users"
          value="18 Accounts"
          subtitle="Governed across 4 institutional roles"
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Audit Log Events"
          value="1,482"
          subtitle="HIPAA immutable forensic traces"
          icon={History}
          color="green"
        />
      </div>

      {/* Quick Governance Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('admin-users')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
            User Management
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Provision clinicians, assign departments, and reset institutional credentials.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-600">
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin-models')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
            AI Model Registry
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Inspect ROC-AUC curves, SHAP explainability, and promote candidate models.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-600">
            <span>Inspect Models</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin-datasets')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
            Dataset Ingestion
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Monitor Diabetes 130-US Hospitals EHR data ingestion and feature schema.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-600">
            <span>Dataset Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin-audit')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <History className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
            Security & Audit Logs
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Verify tamper-proof access logs and export HIPAA compliance verification traces.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-600">
            <span>Audit History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
