import React, { useState } from "react";
import {
  FileText,
  Download,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Users,
  Pill,
  RefreshCw
} from "lucide-react";
import api from "../../services/api";

const REPORT_TYPES = [
  {
    id: "treatment_effectiveness",
    title: "Treatment Effectiveness Report",
    description: "Aggregated treatment outcomes, medication usage and treatment effectiveness statistics.",
    icon: Pill,
    badgeColor: "text-purple-400 bg-purple-500/20 border-purple-500/30"
  },
  {
    id: "readmission_trends",
    title: "Readmission Trends Report",
    description: "Aggregate early (<30 days), late (>30 days) and no-readmission trends across the approved dataset.",
    icon: TrendingUp,
    badgeColor: "text-red-400 bg-red-500/20 border-red-500/30"
  },
  {
    id: "population_health",
    title: "Population Health Report",
    description: "Aggregate demographic, population health and utilization statistics.",
    icon: Users,
    badgeColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30"
  }
];

const AnalyticalReportsPage = () => {
  const [downloadingCategory, setDownloadingCategory] = useState(null);
  const [error, setError] = useState(null);

  const handleExportReport = async (reportId) => {
    setDownloadingCategory(reportId);
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
      setDownloadingCategory(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Analytical Reports
                </h1>
                <p className="text-emerald-200/80 text-sm mt-1">
                  Export PDF-compliant aggregated research analytics, treatment outcomes, and population health statistics in CSV format
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-900/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero PII / De-identified Reports</span>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm shadow-md">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-300">Compliant Research Reporting</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All analytical reports contain macro-level aggregated metrics derived directly from approved dataset attributes.
            No individual patient record numbers or personal identifiers (patient_nbr, encounter_id, PII) are included.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 3 Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report) => {
          const IconComponent = report.icon;
          const isDownloading = downloadingCategory === report.id;

          return (
            <div
              key={report.id}
              className="bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${report.badgeColor}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-400">
                    CSV Format
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <button
                  onClick={() => handleExportReport(report.id)}
                  disabled={isDownloading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export Analytical Report
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

export default AnalyticalReportsPage;

