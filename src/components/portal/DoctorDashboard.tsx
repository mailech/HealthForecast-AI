import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Patient } from '../../types';
import { KPICard } from '../common/KPICard';
import { RiskBadge } from '../common/RiskBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  HeartPulse,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Pill,
  Activity,
  FileSpreadsheet,
  ChevronRight,
  ClipboardCheck,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface DoctorDashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNavigate: (viewId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  patients,
  onSelectPatient,
  onNavigate
}) => {
  const { currentUser } = useAuth();

  // Doctor only sees assigned patients
  const assignedPatients = patients.filter(
    (p) => p.assignedDoctorId === currentUser.id
  );

  const highRisk = assignedPatients.filter((p) => p.riskLevel === 'HIGH');
  const mediumRisk = assignedPatients.filter((p) => p.riskLevel === 'MEDIUM');
  const lowRisk = assignedPatients.filter((p) => p.riskLevel === 'LOW');

  const avgRisk = assignedPatients.length > 0
    ? Math.round(assignedPatients.reduce((acc, p) => acc + p.riskScore, 0) / assignedPatients.length)
    : 68;

  // Readmission hazard trajectory data
  const hazardCurveData = [
    { day: 'Day 1', doctorCohort: 4, hospitalAvg: 5 },
    { day: 'Day 5', doctorCohort: 12, hospitalAvg: 14 },
    { day: 'Day 10', doctorCohort: 28, hospitalAvg: 32 },
    { day: 'Day 14 (Peak)', doctorCohort: 54, hospitalAvg: 62 },
    { day: 'Day 21', doctorCohort: 68, hospitalAvg: 75 },
    { day: 'Day 30', doctorCohort: 74, hospitalAvg: 82 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>Doctor Clinical Command • Endocrinology Inpatient Service</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Active rounds: You have <strong className="text-white">{assignedPatients.length} assigned inpatients</strong> under direct care. <strong className="text-rose-300">{highRisk.length} patients</strong> exhibit critical 30-day readmission hazard scores requiring discharge review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('clinical-decision-support')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Decision Support (CDS)</span>
            </button>
            <button
              onClick={() => onNavigate('patients')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>View Assigned Roster</span>
            </button>
          </div>
        </div>

        {/* Doctor Scope Badge */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/90 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>RBAC Scope: Doctor (Assigned Inpatients, CDS, Care Planning, Order Authorizations)</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-300">
            NPI: {currentUser.npiNumber || '1849201948'} • St. Jude Metropolitan
          </span>
        </div>
      </div>

      <DisclaimerBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Assigned Inpatients"
          value={assignedPatients.length.toString()}
          subtitle="Patients in your care team"
          icon={Users}
          color="blue"
        />
        <KPICard
          title="High Readmission Hazard"
          value={highRisk.length.toString()}
          subtitle="Risk score ≥ 70%"
          icon={AlertTriangle}
          color="red"
          badge="Priority Rounds"
        />
        <KPICard
          title="Pending CDS Interventions"
          value="3"
          subtitle="Medication reconciliation & follow-ups"
          icon={Sparkles}
          color="teal"
          badge="Actionable"
        />
        <KPICard
          title="Cohort Average Risk"
          value={`${avgRisk}%`}
          subtitle="Compared to hospital baseline 58%"
          icon={Activity}
          color="amber"
        />
      </div>

      {/* High-Risk Assigned Patient Rounds */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-base font-extrabold text-slate-900">
                Priority Inpatient Rounding Queue (Assigned Scope)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients flagged with high 30-day readmission risk based on clinical biomarkers and prior encounter velocity.
            </p>
          </div>

          <button
            onClick={() => onNavigate('patients')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Assigned Patients ({assignedPatients.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {assignedPatients.map((patient) => {
            return (
              <div
                key={patient.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                    {patient.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{patient.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({patient.id})</span>
                      <RiskBadge level={patient.riskLevel} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span>Age: {patient.age}</span>
                      <span>•</span>
                      <span>Diagnosis: <strong className="text-slate-700">{patient.primaryDiagnosis}</strong></span>
                      <span>•</span>
                      <span>Room: <strong className="text-slate-700">{patient.roomNumber}</strong></span>
                      <span>•</span>
                      <span>LOS: {patient.admissionDays} days</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Top Risk: {patient.topRiskFactor}
                      </span>
                      <span className="text-slate-500">
                        Readmission Probability: {Math.round(patient.readmissionProbability * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => {
                      onSelectPatient(patient);
                      onNavigate('clinical-decision-support');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Review CDS</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectPatient(patient);
                      onNavigate('patients');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Patient Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Clinical Decision Pathways & 30-Day Hazard Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active CDS Recommendations (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Actionable Clinical Interventions
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
              CDS Engine
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Post-Discharge PCP Telehealth</span>
                <span className="text-[10px] font-bold text-amber-700 font-mono">-24% Hazard</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Schedule comprehensive primary care follow-up within 7 calendar days of discharge for Eleanor Vance.
              </p>
              <button
                onClick={() => onNavigate('clinical-decision-support')}
                className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 block mt-1 cursor-pointer"
              >
                Authorize Follow-up Order →
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900">Inpatient Diabetes Education</span>
                <span className="text-[10px] font-bold text-sky-700 font-mono">-18% Hazard</span>
              </div>
              <p className="text-[11px] text-sky-800 leading-snug">
                Order certified diabetes educator consult for insulin titration and home glucose log verification.
              </p>
              <button
                onClick={() => onNavigate('clinical-decision-support')}
                className="text-[11px] font-bold text-sky-900 underline hover:text-sky-950 block mt-1 cursor-pointer"
              >
                Order Educational Protocol →
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Pharmacotherapy Review</span>
                <span className="text-[10px] font-bold text-emerald-700 font-mono">-15% Hazard</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Evaluate SGLT2 inhibitor addition for cardiovascular and renal risk mitigation.
              </p>
              <button
                onClick={() => onNavigate('treatment-effectiveness')}
                className="text-[11px] font-bold text-emerald-900 underline hover:text-emerald-950 block mt-1 cursor-pointer"
              >
                Compare Treatment Effectiveness →
              </button>
            </div>
          </div>
        </div>

        {/* Right: 30-Day Readmission Hazard Curve (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Assigned Inpatients 30-Day Readmission Hazard Curve
              </h3>
              <p className="text-xs text-slate-500">
                Cumulative post-discharge bounceback probability vs institutional benchmark
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Dr. Sharma Cohort
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hazardCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
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
                <Line
                  type="monotone"
                  dataKey="doctorCohort"
                  name="Assigned Cohort Hazard (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="hospitalAvg"
                  name="Hospital Institutional Avg (%)"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Critical Re-hospitalization Window: <strong>Days 7 to 14</strong></span>
            <button
              onClick={() => onNavigate('readmission-forecasts')}
              className="font-bold text-sky-600 hover:text-sky-800"
            >
              Full Forecast Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
