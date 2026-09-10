import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Patient } from '../../types';
import { KPICard } from '../common/KPICard';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { DEPARTMENT_METRICS } from '../../data/mockData';
import {
  Building2,
  DollarSign,
  BedDouble,
  TrendingDown,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface HospitalAdminDashboardProps {
  patients: Patient[];
  onNavigate: (viewId: string) => void;
}

export const HospitalAdminDashboard: React.FC<HospitalAdminDashboardProps> = ({
  patients,
  onNavigate
}) => {
  const { currentUser, canExportHospitalAnalytics } = useAuth();
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Hospital-wide stats
  const totalBeds = 140;
  const occupiedBeds = 124;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Readmission trend across departments
  const departmentReadmissionData = DEPARTMENT_METRICS.map((dept) => ({
    name: dept.name,
    readmissionRate: dept.readmitRate,
    benchmark: 15.6,
    census: dept.patients,
    penaltyExposure: dept.readmitRate > 15.6 ? 'High' : 'Normal'
  }));

  const handleExportAnalytics = () => {
    setExportNotice('Exporting institutional executive dossier (CSV/PDF)...');
    setTimeout(() => {
      setExportNotice('Dossier successfully downloaded: StJude_Hospital_Performance_Q3.csv');
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Hospital Executive Command Center • Quality & CMS Penalties</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Overview: {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Institutional census stands at <strong className="text-white">{occupiedBeds}/{totalBeds} beds ({occupancyRate}% occupancy)</strong>. Hospital-wide 30-day readmissions are tracked at <strong className="text-emerald-300">14.2%</strong> (1.4% below the CMS National Benchmark).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportAnalytics}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Hospital Analytics</span>
            </button>
            <button
              onClick={() => onNavigate('healthcare-analytics')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Deep Dive Analytics</span>
            </button>
          </div>
        </div>

        {/* Scope Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/90 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>RBAC Scope: Hospital Administrator (Hospital Analytics, Department KPIs, CMS Risk, View-Only Records)</span>
          </div>
          <span className="text-[11px] font-mono text-blue-300">
            Facility ID: STJ-METRO-01 • CMS Certified
          </span>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      <DisclaimerBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Hospital Readmission Rate"
          value="14.2%"
          subtitle="CMS National Benchmark: 15.6%"
          icon={TrendingDown}
          color="green"
          badge="-1.4% Better"
        />
        <KPICard
          title="CMS HRRP Penalty Mitigated"
          value="$380,000"
          subtitle="Saved through early AI interventions"
          icon={DollarSign}
          color="teal"
          badge="High Impact"
        />
        <KPICard
          title="Inpatient Bed Occupancy"
          value={`${occupancyRate}%`}
          subtitle="124 active beds / 140 licensed"
          icon={BedDouble}
          color="blue"
        />
        <KPICard
          title="Hospital Average LOS"
          value="4.6 Days"
          subtitle="Target: 4.8 Days"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Department Performance Benchmark Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Department Performance & Readmission Risk Benchmarking
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Service line readmission statistics, bed census, and length of stay compared against federal CMS benchmarks.
            </p>
          </div>

          <button
            onClick={() => onNavigate('healthcare-analytics')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Hospital Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department / Service Line</th>
                <th className="py-3 px-4">Active Census</th>
                <th className="py-3 px-4">Readmission Rate</th>
                <th className="py-3 px-4">CMS Target</th>
                <th className="py-3 px-4">Avg Length of Stay</th>
                <th className="py-3 px-4">HRRP Risk Tier</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEPARTMENT_METRICS.map((dept) => {
                const isOver = dept.readmitRate > 15.6;
                return (
                  <tr key={dept.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{dept.patients} patients</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={isOver ? 'text-rose-600' : 'text-emerald-600'}>
                        {dept.readmitRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">15.6%</td>
                    <td className="py-3.5 px-4 text-slate-700">{dept.avgStay} days</td>
                    <td className="py-3.5 px-4">
                      {isOver ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Penalty Exposure
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Compliant
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onNavigate('healthcare-analytics')}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart: Readmission Rate by Department vs CMS Target */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Department Readmission Rate vs. CMS Target (15.6%)
            </h3>
            <p className="text-xs text-slate-500">
              Identifies which hospital departments generate excess readmission penalty exposure
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Institutional Audit
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentReadmissionData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" domain={[0, 25]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="readmissionRate" name="Current Readmission Rate (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benchmark" name="CMS Penalty Benchmark (15.6%)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
