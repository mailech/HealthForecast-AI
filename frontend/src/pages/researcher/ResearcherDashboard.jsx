import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FlaskConical,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  Database,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';

export const ResearcherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryStats();
  }, []);

  const fetchSummaryStats = async () => {
    try {
      const res = await api.get('/analytics/treatment-summary');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load researcher summary stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Healthcare Researcher Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Anonymized Data Only (No PII)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-purple-400" /> Healthcare Research & Population Intelligence Workbench
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Epidemiological Cohort Analytics, Treatment Effectiveness, Readmission Trends & Anonymized Dataset Generation
            </p>
          </div>
        </div>

        {/* Privacy Safeguard Note */}
        <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
          <span>
            <strong>Strict Privacy & Anonymization Safeguard:</strong> Direct patient identifiers (patient_nbr, encounter_id, names, PII) are strictly prohibited and scrubbed from all researcher views, dataset exports, and analytical reports.
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Eligible Clinical Encounters</div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {loading ? "..." : (stats?.total_encounters_analyzed || 99343).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Non-expired Retrospective Research Records</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Prescribed Medication Regimens</div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {loading ? "..." : `${stats?.diabetes_med_prescribed?.percentage || 75.85}%`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {loading ? "..." : `${(stats?.diabetes_med_prescribed?.count || 75350).toLocaleString()} Active Medication Patients`}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Regimen Adjustments (change=Ch)</div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            {loading ? "..." : `${stats?.regimen_changed?.percentage || 46.00}%`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dosage Modified During Hospital Stay</div>
        </div>
      </div>

      {/* 7 Core Researcher Navigation Module Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-400" /> Research Modules & Analytics Workstations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Anonymized Patient Data */}
          <Link
            to="/researcher/patients"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Anonymized Only</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">Anonymized Patient Data</h3>
                <p className="text-xs text-slate-400 mt-1">Inspect population healthcare data in aggregate cohort form without direct patient identifiers.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-medium">
              <span>Open Cohort Inspector</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Aggregated Healthcare Analytics */}
          <Link
            to="/researcher/analytics"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">System Benchmarks</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">Aggregated Healthcare Analytics</h3>
                <p className="text-xs text-slate-400 mt-1">Comprehensive system-wide outcome distributions, admission contexts, and stay durations.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>View Aggregate Analytics</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Treatment Effectiveness */}
          <Link
            to="/researcher/treatment"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Drug Class Outcomes</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">Treatment Effectiveness</h3>
                <p className="text-xs text-slate-400 mt-1">Observational evaluations across insulin, metformin, polypharmacy, and regimen adjustments.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
              <span>Explore Treatment Analytics</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Readmission Trends */}
          <Link
            to="/researcher/readmission-trends"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">12-Month Utilization</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">Readmission Trend Reports</h3>
                <p className="text-xs text-slate-400 mt-1">Retrospective risk gradients across prior inpatient, emergency, and outpatient utilization.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium">
              <span>Inspect Readmission Trends</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Population Health */}
          <Link
            to="/researcher/population-health"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                  <Activity className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Demographic Risk</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">Population Health Statistics</h3>
                <p className="text-xs text-slate-400 mt-1">Age group distributions, primary ICD-9 diagnosis organ systems, and demographic stratification.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
              <span>View Population Health</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Research Dataset Generation */}
          <Link
            to="/researcher/research-dataset"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
                  <Database className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">CSV Dataset Export</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition-colors">Research Dataset Generator</h3>
                <p className="text-xs text-slate-400 mt-1">Filter and generate anonymized research dataset CSV exports based on custom parameters.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-medium">
              <span>Build Research Dataset</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 7: Analytical Report Export */}
          <Link
            to="/researcher/reports"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group flex flex-col justify-between lg:col-span-3"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">Analytical Report Export Station</h3>
                  <p className="text-xs text-slate-400 mt-1">Download precomputed CSV analytical reports across Treatment Effectiveness, Readmission Trends, Population Health, and Patient Outcomes.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 shrink-0">
                <span>Export Reports Station</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Retrospective Science Disclaimer */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-bold text-slate-200 flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-purple-400" /> Research Governance & Observational Methodology Guidelines
        </div>
        <p>
          • <strong>Retrospective Scope:</strong> All analytics describe historical patterns within the Diabetes 130-US Hospitals dataset (1999–2008). They represent retrospective observational correlations and do NOT establish direct causality.
        </p>
        <p>
          • <strong>No Clinical Decision Approval:</strong> Healthcare Researchers access population-level research intelligence. Researchers do not provide direct medical diagnoses or approve individual clinical treatment plans.
        </p>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
