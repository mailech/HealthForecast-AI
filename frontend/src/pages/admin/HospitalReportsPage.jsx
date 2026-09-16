import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  Pill,
  Building2,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import api from "../../services/api";

const ADMIN_REPORT_CATEGORIES = [
  {
    id: "hospital_performance",
    title: "Hospital Performance Report",
    description: "System-wide encounter volumes, readmission benchmarks, operational utilization, length of stay indicators, and medical specialty performance.",
    items: [
      "Overall hospital & system performance",
      "Readmission statistics & benchmarks",
      "Operational analytics & utilization",
      "Department & medical specialty performance",
      "Length of stay & turnaround indicators"
    ],
    icon: Building2,
    badgeColor: "text-sky-400 bg-sky-500/20 border-sky-500/30"
  },
  {
    id: "patient_outcomes",
    title: "Patient Outcomes Report",
    description: "Aggregate patient clinical outcomes, readmission outcome distributions (<30d, >30d, No Return), discharge metrics, and outcome trends.",
    items: [
      "Patient outcome analytics",
      "Readmission outcome breakdown (<30d, >30d, No Return)",
      "Hospital stay duration outcomes",
      "Historical outcome trends & risk ratios"
    ],
    icon: Heart,
    badgeColor: "text-purple-400 bg-purple-500/20 border-purple-500/30"
  },
  {
    id: "treatment_effectiveness",
    title: "Treatment Effectiveness Report",
    description: "Observational medication outcome distributions, regimen change efficacy, treatment complexity indicators, and polypharmacy statistics.",
    items: [
      "Treatment & medication effectiveness",
      "Diabetes medication outcome distributions",
      "Regimen change & dosage efficacy",
      "Polypharmacy & medication count analytics"
    ],
    icon: Pill,
    badgeColor: "text-teal-400 bg-teal-500/20 border-teal-500/30"
  },
  {
    id: "population_health",
    title: "Population Health Report",
    description: "Epidemiological cohort summaries by age groups, admission context breakdowns, aggregate population statistics, and population-level trends.",
    items: [
      "Population health & epidemiological summaries",
      "Age-group demographic distributions",
      "Aggregate population statistics & diagnoses",
      "Population-level utilization trends"
    ],
    icon: Users,
    badgeColor: "text-blue-400 bg-blue-500/20 border-blue-500/30"
  }
];

const HospitalReportsPage = () => {
  const [downloadingReport, setDownloadingReport] = useState(null);
  const [error, setError] = useState(null);

  const handleExportReport = async (reportId) => {
    setDownloadingReport(reportId);
    setError(null);
    try {
      const response = await api.post(
        "/researcher/analytical-report/export",
        { report_type: reportId },
        { responseType: "blob" }
      );

      const filename = `${reportId}_report_${Date.now()}.csv`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error exporting ${reportId} report:`, err);
      setError(`Failed to export ${reportId} report CSV.`);
    } finally {
      setDownloadingReport(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900/60 to-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/40 text-cyan-400">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Reports &amp; Analytics
                </h1>
                <p className="text-cyan-200/80 text-sm mt-1">
                  Consolidated executive hospital reports and export center for system-wide performance, patient outcomes, treatment efficacy, and population health analytics.
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyan-900/40 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Executive Reporting Center</span>
          </div>
        </div>
      </div>

      {/* Safety Safeguard Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm shadow-md">
        <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-cyan-300">Executive Report Export Privacy Safeguard</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All exported hospital analytics reports contain macro-level aggregated metrics. Direct patient identifiers (patient_nbr, encounter_id, names, SSN) are strictly prohibited and scrubbed prior to export.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 4 Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ADMIN_REPORT_CATEGORIES.map((report) => {
          const IconComponent = report.icon;
          const isDownloading = downloadingReport === report.id;

          return (
            <div
              key={report.id}
              className="bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${report.badgeColor}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-400">
                    CSV Export Available
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {report.description}
                </p>

                {/* Included / Grouped Analytics Items */}
                <div className="mt-4 pt-4 border-t border-slate-700/40 space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Included Analytics &amp; Metrics:
                  </div>
                  {report.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <button
                  onClick={() => handleExportReport(report.id)}
                  disabled={isDownloading}
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Preparing Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export CSV Report
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalReportsPage;

