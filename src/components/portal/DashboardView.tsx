import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Patient } from '../../types';
import { KPICard } from '../common/KPICard';
import { RiskBadge } from '../common/RiskBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  READMISSION_TREND_DATA,
  DEPARTMENT_METRICS,
  TREATMENT_OUTCOME_DATA
} from '../../data/mockData';
import {
  Users,
  AlertTriangle,
  TrendingDown,
  Activity,
  HeartPulse,
  Calendar,
  Filter,
  ArrowUpRight,
  Stethoscope,
  ChevronRight,
  Clock,
  Building2,
  BedDouble
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNavigate: (viewId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  onSelectPatient,
  onNavigate
}) => {
  const { currentUser, role, isAnonymizedView } = useAuth();
  const [timeRange, setTimeRange] = useState<'30d' | '60d' | '90d'>('30d');

  // Filter patients based on role: Doctor only sees assigned patients
  const displayedPatients = role === 'DOCTOR'
    ? patients.filter(p => p.assignedDoctorId === currentUser.id)
    : patients;

  // Calculate dynamic stats
  const totalCount = displayedPatients.length;
  const highRiskCount = displayedPatients.filter(p => p.riskLevel === 'HIGH').length;
  const mediumRiskCount = displayedPatients.filter(p => p.riskLevel === 'MEDIUM').length;
  const lowRiskCount = displayedPatients.filter(p => p.riskLevel === 'LOW').length;
  const avgRisk = totalCount > 0
    ? Math.round(displayedPatients.reduce((acc, p) => acc + p.riskScore, 0) / totalCount)
    : 0;
  const predictedReadmissions = displayedPatients.filter(p => p.readmissionProbability > 0.65).length;
  const avgRecovery = totalCount > 0
    ? Math.round(displayedPatients.reduce((acc, p) => acc + p.recoveryScore, 0) / totalCount)
    : 82;

  // Donut chart data
  const riskDonutData = [
    { name: 'High Risk (>70%)', value: highRiskCount, color: '#ef4444' },
    { name: 'Medium Risk (40-69%)', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'Low Risk (<40%)', value: lowRiskCount, color: '#10b981' }
  ];

  // High risk alerts
  const highRiskAlerts = displayedPatients
    .filter(p => p.riskLevel === 'HIGH')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const getGreeting = () => {
    if (role === 'DOCTOR') return `Good morning, ${currentUser.name}`;
    if (role === 'HOSPITAL_ADMIN') return `Executive Overview, ${currentUser.name}`;
    if (role === 'HEALTHCARE_RESEARCHER') return `Population Health Console, ${currentUser.name}`;
    return `System Operations Console, ${currentUser.name}`;
  };

  const getSubGreeting = () => {
    if (role === 'DOCTOR') return "Here's your assigned patient risk overview and readmission forecasts for today.";
    if (role === 'HOSPITAL_ADMIN') return "Hospital-wide readmission metrics, CMS penalties risk, and department performance.";
    if (role === 'HEALTHCARE_RESEARCHER') return "Aggregated epidemiological trends and treatment effectiveness across de-identified cohorts.";
    return "Complete platform surveillance, real-time AI inference health, and system governance.";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span>St. Jude Metropolitan Health System</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Wednesday, Sep 9, 2026
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {getSubGreeting()}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('risk-predictions')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Risk Prediction Console</span>
          </button>
          <button
            onClick={() => onNavigate('readmission-forecasts')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4 text-sky-600" />
            <span>Forecasts</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner type={isAnonymizedView() ? 'research' : 'demo'} />

      {/* 5 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          id="kpi-total-patients"
          title={role === 'DOCTOR' ? 'Assigned Patients' : 'Total Patients'}
          value={totalCount}
          trend={{ value: '+4.2%', direction: 'up', isPositive: true }}
          subtitle="Active hospital census"
          icon={<Users className="w-5 h-5" />}
          accentColor="blue"
        />

        <KPICard
          id="kpi-high-risk"
          title="High-Risk Patients"
          value={highRiskCount}
          trend={{ value: '-2 vs yesterday', direction: 'down', isPositive: true }}
          subtitle="Score ≥ 70 / 100"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="red"
        />

        <KPICard
          id="kpi-predicted-readmit"
          title="Predicted Readmissions"
          value={predictedReadmissions}
          trend={{ value: '-12% MoM', direction: 'down', isPositive: true }}
          subtitle="30-Day risk probability > 65%"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="amber"
        />

        <KPICard
          id="kpi-avg-risk"
          title="Avg Readmission Risk"
          value={`${avgRisk}%`}
          trend={{ value: '-1.8 pts', direction: 'down', isPositive: true }}
          subtitle="Cohort average score"
          icon={<Activity className="w-5 h-5" />}
          accentColor="indigo"
        />

        <KPICard
          id="kpi-recovery-rate"
          title="Recovery Rate"
          value={`${avgRecovery}%`}
          trend={{ value: '+3.1%', direction: 'up', isPositive: true }}
          subtitle="Clinical stability index"
          icon={<HeartPulse className="w-5 h-5" />}
          accentColor="teal"
        />
      </div>

      {/* Main Charts Row: Readmission Risk Overview (Line) & Risk Distribution (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readmission Risk Overview 30-day Trend */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Readmission Risk Overview & 30-Day Trajectory
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  AI Trend
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hospital readmission percentage vs national CMS benchmark (15.0%)
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {(['30d', '60d', '90d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    timeRange === t
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={READMISSION_TREND_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="%" domain={[10, 22]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="actualRate"
                  name="Actual Hospital Readmission Rate"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedRate"
                  name="Model Predicted Rate"
                  stroke="#0d9488"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="CMS National Benchmark (15%)"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Model: XGBoost-HospReadmit-v2.4 (trained on Diabetes 130-US Hospitals)</span>
            <button
              onClick={() => onNavigate('healthcare-analytics')}
              className="text-sky-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Hospital Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Patient Risk Distribution Donut */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Patient Risk Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current patient census by stratification
              </p>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {riskDonutData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs px-2 py-1 rounded-md bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} patients</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('patients')}
            className="w-full mt-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Full Patient Registry</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* High-Risk Patient Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                High-Risk Patient Alerts
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients flagged with highest probability of 30-day post-discharge readmission
            </p>
          </div>
          <button
            onClick={() => onNavigate('patients')}
            className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Manage All Patients →
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Patient Name & ID</th>
                <th className="p-3">Department</th>
                <th className="p-3">Primary Diagnosis</th>
                <th className="p-3">Risk Level & Score</th>
                <th className="p-3">Readmission Prob.</th>
                <th className="p-3">Assigned Physician</th>
                <th className="p-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highRiskAlerts.map((patient) => {
                const displayName = isAnonymizedView() ? (patient.anonymizedId || 'PT-ANON-XXXX') : patient.name;
                const displayId = isAnonymizedView() ? 'ANON' : patient.id;

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[11px]">
                          {isAnonymizedView() ? 'PT' : patient.name.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[160px]">
                            {displayName}
                          </span>
                          <span className="text-[11px] text-slate-600 font-mono">
                            {displayId} • {patient.age}y {patient.gender[0]}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{patient.department}</td>
                    <td className="p-3 text-slate-800 max-w-[200px] truncate">{patient.primaryDiagnosis}</td>
                    <td className="p-3">
                      <RiskBadge level={patient.riskLevel} score={patient.riskScore} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full"
                            style={{ width: `${Math.round(patient.readmissionProbability * 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-red-600">
                          {Math.round(patient.readmissionProbability * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{patient.assignedDoctorName}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Treatment Effectiveness Overview & Hospital Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Effectiveness Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Treatment Effectiveness Overview
                </h3>
                <p className="text-xs text-slate-500">
                  Recovery rates and medication protocol success
                </p>
              </div>
              <button
                onClick={() => onNavigate('treatment-effectiveness')}
                className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
              >
                Deep Analysis →
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {TREATMENT_OUTCOME_DATA.slice(0, 4).map((tx, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                    <span>{tx.treatment}</span>
                    <span className="text-emerald-700 font-bold">{tx.successRate}% Success</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${tx.successRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Recovery Index: {tx.recoveryScore}/100</span>
                    <span>Cohort: {tx.sampleSize} patients</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hospital Performance by Department */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Departmental Performance & Readmission Rates
                </h3>
                <p className="text-xs text-slate-500">
                  Institutional benchmarks across clinical services
                </p>
              </div>
              <button
                onClick={() => onNavigate('healthcare-analytics')}
                className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
              >
                View Analytics →
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {DEPARTMENT_METRICS.map((dept, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{dept.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {dept.patients} patients • Avg stay: {dept.avgStay} days
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold block ${dept.readmitRate > 15 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {dept.readmitRate}% Readmit
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {dept.highRiskCount} high-risk cases
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
