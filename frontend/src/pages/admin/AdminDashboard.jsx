import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Building2,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Pill,
  Heart,
  ArrowRight,
  Sparkles,
  PieChart
} from "lucide-react";

export const AdminDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/analytics/hospital-performance");
      setPerformance(res.data);
    } catch (err) {
      console.error("Failed to load executive dashboard stats:", err);
      setError("Failed to connect to backend analytics service.");
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      title: "Hospital Performance",
      description: "System-wide encounter volume, readmission KPIs, stay durations, and hospital performance metrics.",
      path: "/admin/hospital-performance",
      icon: Building2,
      color: "from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400"
    },
    {
      title: "Patient Outcomes",
      description: "Macro patient outcome distributions, discharge disposition breakdowns, and stay duration outcomes.",
      path: "/admin/patient-outcomes",
      icon: Heart,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400"
    },
    {
      title: "Readmission Statistics",
      description: "Early (<30d), late (>30d), and no-readmission historical statistics and admission context trends.",
      path: "/admin/readmission-statistics",
      icon: TrendingUp,
      color: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400"
    },
    {
      title: "Healthcare Performance Reports",
      description: "Executive reporting suite summarizing operational stability, stay metrics, and clinical indicators.",
      path: "/admin/performance-reports",
      icon: BarChart3,
      color: "from-indigo-500/20 to-cyan-500/20 border-indigo-500/30 text-indigo-400"
    },
    {
      title: "Operational Analytics",
      description: "Resource utilization oversight, encounter volume, prior visit profiles, and stay duration brackets.",
      path: "/admin/operations",
      icon: Activity,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400"
    },
    {
      title: "Department Performance",
      description: "Medical specialty-level encounter volume, readmission risk ratios, and outcome distributions.",
      path: "/admin/department-performance",
      icon: PieChart,
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400"
    },
    {
      title: "Treatment Effectiveness",
      description: "Observational medication outcome distributions, regimen change efficacy, and polypharmacy metrics.",
      path: "/admin/treatment-effectiveness",
      icon: Pill,
      color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400"
    },
    {
      title: "Population Health",
      description: "Epidemiological cohort summaries by age groups, primary diagnoses, and medication usage.",
      path: "/admin/population-health",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400"
    },
    {
      title: "Hospital Reports & Export",
      description: "Export aggregate hospital analytics, readmission trends, and operational reports in CSV format.",
      path: "/admin/reports",
      icon: FileSpreadsheet,
      color: "from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-400"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-500/20 rounded-xl border border-sky-500/40 text-sky-400">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Hospital Executive Operations Dashboard
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  System-Wide Performance Oversight • Diabetes 130-US Hospitals Dataset Analytics
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>View-Only Patient Record Safeguard</span>
          </div>
        </div>
      </div>

      {/* Anonymity Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm">
        <AlertCircle className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sky-300">Aggregate Healthcare System Notice</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All metrics represent system-wide historical dataset benchmarks (130 US Hospitals). Patient access for Hospital Administrators is strictly View-Only.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/60 rounded-xl border border-slate-800"></div>
          ))}
        </div>
      ) : performance ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Total Encounters</span>
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-3xl font-extrabold text-white mt-2">
              {(performance.eligible_encounters_count || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">Eligible non-expired stays</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Early Readmission Rate</span>
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-extrabold text-red-400 mt-2">
              {performance.early_readmit_rate_pct || 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">30-day early return baseline</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Average Length of Stay</span>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-extrabold text-purple-400 mt-2">
              {performance.average_length_of_stay_days || 0} <span className="text-sm font-normal">days</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Mean duration per encounter</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>High-Utilization Patients</span>
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-amber-400 mt-2">
              {performance.high_utilization_patient_pct || 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Prior inpatient/ED visits &gt; 0</p>
          </div>
        </div>
      ) : null}

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          Executive Operations & Analytics Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link
                key={module.path}
                to={module.path}
                className="bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition group hover:scale-[1.01]"
              >
                <div>
                  <div className={`p-3 rounded-xl border w-fit bg-gradient-to-r ${module.color} mb-4`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition flex items-center justify-between">
                    {module.title}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
