import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../common/KPICard';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  BarChart3,
  TrendingDown,
  Users,
  Calendar,
  Download,
  Building2,
  DollarSign,
  Clock,
  BedDouble,
  Shield,
  Info
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
  AreaChart,
  Area
} from 'recharts';

export const HealthcareAnalyticsView: React.FC = () => {
  const { role, currentUser } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'30d' | 'quarter' | 'year'>('quarter');
  const [exportNotice, setExportNotice] = useState(false);

  // Age group readmission data
  const ageGroupData = [
    { age: '18-39', rate: 7.2, census: 42 },
    { age: '40-59', rate: 11.8, census: 88 },
    { age: '60-74', rate: 16.5, census: 164 },
    { age: '75-89', rate: 22.4, census: 112 },
    { age: '90+', rate: 26.1, census: 34 }
  ];

  // Diagnosis readmission comparison
  const diagnosisData = [
    { diagnosis: 'Congestive Heart Failure', actual: 21.8, benchmark: 21.0 },
    { diagnosis: 'Type 2 Diabetes w/ Complications', actual: 18.2, benchmark: 17.5 },
    { diagnosis: 'COPD / Chronic Bronchitis', actual: 17.4, benchmark: 18.0 },
    { diagnosis: 'Acute Myocardial Infarction', actual: 15.1, benchmark: 16.2 },
    { diagnosis: 'Pneumonia / Respiratory', actual: 14.3, benchmark: 15.5 },
    { diagnosis: 'Elective Knee / Hip Arthroplasty', actual: 4.8, benchmark: 4.5 }
  ];

  // Length of stay vs readmission correlation
  const stayCorrelationData = [
    { stay: '1-2 Days', readmitRate: 9.4 },
    { stay: '3-4 Days', readmitRate: 13.1 },
    { stay: '5-7 Days', readmitRate: 17.8 },
    { stay: '8-10 Days', readmitRate: 23.5 },
    { stay: '11+ Days', readmitRate: 29.2 }
  ];

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hospital Readmission & Performance Analytics
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Epidemiology & CMS Deck
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Population-level epidemiological stratification, CMS HRRP benchmark tracking, and demographic drivers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['30d', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeFilter === period
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period === '30d' ? 'Past 30 Days' : period === 'quarter' ? 'Current Quarter' : 'Year-to-Date'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportNotice ? 'Exported!' : 'Export Report (PDF)'}</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner type="clinical" />

      {/* Role-Specific Scope Notice (Page 6 Access Matrix: Doctor: Limited, Admin: Full Access, Researcher: Aggregated Only, SysAdmin: Full Access) */}
      <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
        role === 'DOCTOR'
          ? 'bg-sky-50 border-sky-200 text-sky-900'
          : role === 'HEALTHCARE_RESEARCHER'
          ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            <strong>Access Matrix Scope ({role.replace('_', ' ')}):</strong>{' '}
            {role === 'DOCTOR'
              ? 'Limited physician scope filtered to your clinical department with institutional benchmark comparison.'
              : role === 'HEALTHCARE_RESEARCHER'
              ? 'Aggregated epidemiological scope across de-identified Diabetes 130-US hospital encounters.'
              : 'Full institutional governance across all 6 clinical departments and CMS penalty monitoring.'}
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/80 font-bold shrink-0">
          {role === 'DOCTOR' ? 'Scope: Limited' : role === 'HEALTHCARE_RESEARCHER' ? 'Scope: Aggregated Only' : 'Scope: Full Access'}
        </span>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Overall Readmission Rate"
          value="14.4%"
          trend={{ value: '-0.6% vs CMS Benchmark', direction: 'down', isPositive: true }}
          subtitle="All conditions 30-day"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="blue"
        />

        <KPICard
          title="CMS HRRP Penalty Risk"
          value="0.00% (Safe)"
          trend={{ value: '$0 Penalty Assessment', direction: 'neutral', isPositive: true }}
          subtitle="Under national excess ratio"
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="teal"
        />

        <KPICard
          title="Average Length of Stay"
          value="4.8 Days"
          trend={{ value: '-0.3d improvement', direction: 'down', isPositive: true }}
          subtitle="Acute inpatient ALOS"
          icon={<Clock className="w-5 h-5" />}
          accentColor="indigo"
        />

        <KPICard
          title="Bed Occupancy Rate"
          value="82.6%"
          trend={{ value: 'Optimal utilization', direction: 'neutral', isPositive: true }}
          subtitle="440 licensed acute beds"
          icon={<BedDouble className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Row 1: Readmission by Diagnosis vs CMS Benchmark */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Readmission Rate by Clinical Diagnosis vs National CMS Benchmark
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing hospital rates across HRRP target conditions
            </p>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diagnosisData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="diagnosis" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" height={50} />
              <YAxis unit="%" domain={[0, 30]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="actual" name="Hospital Readmit Rate (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benchmark" name="CMS National Benchmark (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Demographic Readmission Stratification (Age & Length of Stay) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readmission by Age Group */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Readmission Rate by Patient Age Bracket
            </h3>
            <p className="text-xs text-slate-500">
              Risk correlation with advancing demographic age
            </p>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroupData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="%" domain={[0, 35]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="rate" name="Readmit Rate (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readmission by Length of Stay */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Readmission Correlation with Length of Stay (ALOS)
            </h3>
            <p className="text-xs text-slate-500">
              Extended hospital stay duration strongly correlates with readmission severity
            </p>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stayCorrelationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stay" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="%" domain={[0, 35]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="readmitRate"
                  name="Readmission Rate (%)"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
