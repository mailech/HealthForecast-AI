import React, { useState } from 'react';
import { DEPARTMENT_METRICS } from '../../data/mockData';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { KPICard } from '../common/KPICard';
import {
  TrendingDown,
  Sliders,
  DollarSign,
  AlertCircle,
  Download,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
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

export const ReadmissionForecastsView: React.FC = () => {
  // Interactive What-If Scenario Simulator sliders
  const [followUpRate, setFollowUpRate] = useState<number>(65); // % of patients receiving 7d call
  const [medReconciliation, setMedReconciliation] = useState<boolean>(true); // Pharmacist review
  const [remoteMonitoring, setRemoteMonitoring] = useState<boolean>(false); // Telehealth RPM
  const [dischargeEducation, setDischargeEducation] = useState<number>(75); // % receiving teach-back

  // Projected metrics based on simulation
  // Base readmission rate = 14.8%
  let projectedRate = 14.8;
  if (followUpRate > 60) projectedRate -= ((followUpRate - 60) * 0.06);
  if (medReconciliation) projectedRate -= 1.4;
  if (remoteMonitoring) projectedRate -= 1.8;
  if (dischargeEducation > 70) projectedRate -= ((dischargeEducation - 70) * 0.04);
  projectedRate = Math.max(8.2, Math.round(projectedRate * 10) / 10);

  const baselineCost = 4200000; // $4.2M baseline readmissions expense
  const preventedReadmissions = Math.round((14.8 - projectedRate) * 48);
  const projectedSavings = Math.round(preventedReadmissions * 15400); // $15.4k average CMS penalty/cost per readmission

  // 6-month projected monthly trajectory
  const monthlyProjection = [
    { month: 'Oct 2026', baseline: 14.8, simulated: 14.5 },
    { month: 'Nov 2026', baseline: 14.7, simulated: 13.6 },
    { month: 'Dec 2026', baseline: 15.2, simulated: 12.8 },
    { month: 'Jan 2027', baseline: 15.0, simulated: 11.9 },
    { month: 'Feb 2027', baseline: 14.6, simulated: 11.0 },
    { month: 'Mar 2027', baseline: 14.4, simulated: projectedRate }
  ];

  const [exportNotice, setExportNotice] = useState(false);

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hospital Readmission Forecasts
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Prescriptive Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            30-day institutional readmission modeling, department benchmarks, and intervention simulations.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exportNotice ? 'Forecast Dossier Exported!' : 'Export Forecast Executive Summary'}</span>
        </button>
      </div>

      <DisclaimerBanner type="demo" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Baseline Readmission Rate"
          value="14.8%"
          trend={{ value: 'vs 15.0% CMS benchmark', direction: 'down', isPositive: true }}
          subtitle="Hospital-wide 30-day"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="blue"
        />

        <KPICard
          title="Simulated Target Rate"
          value={`${projectedRate}%`}
          trend={{ value: `-${(14.8 - projectedRate).toFixed(1)}% drop`, direction: 'down', isPositive: true }}
          subtitle="With modeled interventions"
          icon={<Sparkles className="w-5 h-5" />}
          accentColor="teal"
        />

        <KPICard
          title="Prevented Readmissions"
          value={preventedReadmissions}
          trend={{ value: 'Across 6 months', direction: 'up', isPositive: true }}
          subtitle="Avoidable hospital returns"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="indigo"
        />

        <KPICard
          title="Projected Cost Savings"
          value={`$${(projectedSavings / 1000).toFixed(0)}k`}
          trend={{ value: 'CMS penalties avoided', direction: 'up', isPositive: true }}
          subtitle="Annualized reimbursement protection"
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Interactive What-If Scenario Simulator Section */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">
                Interactive What-If Intervention Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate operational hospital interventions to project impact on 30-day readmissions and CMS penalties.
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-sky-950 text-sky-300 rounded-full border border-sky-800 font-mono">
            Engine: Monte Carlo Readmit Sim
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls column */}
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1.5">
                <span>7-Day Post-Discharge Tele-Followup Rate:</span>
                <span className="text-sky-400 font-mono">{followUpRate}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                value={followUpRate}
                onChange={(e) => setFollowUpRate(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Target: Contact all high and medium risk patients within 7 calendar days.
              </span>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1.5">
                <span>Patient Discharge Teach-Back Comprehension:</span>
                <span className="text-sky-400 font-mono">{dischargeEducation}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={dischargeEducation}
                onChange={(e) => setDischargeEducation(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Structured clinical verification of medication schedules before exit.
              </span>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Pharmacist Medication Reconciliation</span>
                  <span className="text-[11px] text-slate-400">Reviews polypharmacy & drug interactions prior to sign-off</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMedReconciliation(!medReconciliation)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    medReconciliation ? 'bg-sky-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      medReconciliation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <div>
                  <span className="font-bold text-slate-200 block">Remote Patient Monitoring (RPM) Kit</span>
                  <span className="text-[11px] text-slate-400">Cellular glucometer & blood pressure cuffs for High-Risk cohort</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRemoteMonitoring(!remoteMonitoring)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    remoteMonitoring ? 'bg-sky-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      remoteMonitoring ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Outcome Projection Chart */}
          <div className="lg:col-span-6 bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="text-xs font-bold text-slate-300">
                  Projected 6-Month Readmission Trajectory
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Target: {projectedRate}% (vs 14.8%)
                </span>
              </div>

              <div className="h-48 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[6, 18]} unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="baseline"
                      name="Historical Trajectory"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="simulated"
                      name="Intervention Projection"
                      stroke="#38bdf8"
                      fill="#38bdf8"
                      fillOpacity={0.25}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Estimated Savings:</span>
                <span className="text-emerald-400 font-bold text-base">
                  +${(projectedSavings / 1000).toFixed(0)}k protected
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Readmissions Prevented:</span>
                <span className="text-white font-bold text-base">{preventedReadmissions} patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Department Readmission Rate Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Service line readmission rates compared against national averages
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            National CMS Benchmark: 15.0%
          </span>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEPARTMENT_METRICS} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis unit="%" domain={[0, 25]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="readmitRate" name="Actual Readmit Rate (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highRiskCount" name="High Risk Patients (Census)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
