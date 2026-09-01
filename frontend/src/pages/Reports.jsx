import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  FileCode,
  FileSpreadsheet,
  Calendar,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const INITIAL_REPORTS = [
  {
    id: "REP-101",
    name: "Readmission Risk Summary",
    type: "PDF",
    date: "2026-08-01",
    status: "Completed",
    size: "2.4 MB",
  },
  {
    id: "REP-102",
    name: "Patient Summary Dataset",
    type: "Excel",
    date: "2026-08-02",
    status: "Completed",
    size: "4.8 MB",
  },
  {
    id: "REP-103",
    name: "High Risk Patients Export",
    type: "CSV",
    date: "2026-08-03",
    status: "Completed",
    size: "850 KB",
  },
  {
    id: "REP-104",
    name: "Monthly Hospital Analytics",
    type: "PDF",
    date: "2026-07-31",
    status: "Completed",
    size: "5.1 MB",
  },
  {
    id: "REP-105",
    name: "Department Performance Report",
    type: "Excel",
    date: "2026-07-28",
    status: "Completed",
    size: "3.2 MB",
  },
];

function Reports() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Filtered Logic
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All" || report.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, typeFilter]);

  const handleDownload = async (report, targetFormat = null) => {
    const formatType = (targetFormat || report?.type || "PDF").toUpperCase();
    let ext = formatType === "EXCEL" ? "xlsx" : formatType.toLowerCase();
    const reportId = report?.id || "REP-101";
    const reportTitle = report?.name || "Clinical_Outcome_Report";
    const fileName = `${reportTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.${ext}`;

    try {
      toast.info(`Preparing ${fileName} download...`);

      const response = await fetch(
        `http://localhost:5000/api/reports/${reportId}/download?format=${formatType}`
      );

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${fileName} downloaded successfully!`);
    } catch (error) {
      console.error("Report download error:", error);
      toast.error(`Download Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="text-blue-600" size={30} />
            Clinical Outcome Reports & Document Audit 📄
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Access, filter, and export hospital readmission reports and patient analytical summaries.
          </p>
        </div>

        {/* Global Export Options */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownload({ id: "REP-FULL", name: "Clinical_Summary_Export" }, "PDF")}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export PDF (.pdf)
          </button>
          <button
            onClick={() => handleDownload({ id: "REP-FULL", name: "Patient_Dataset_Export" }, "EXCEL")}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export Excel (.xlsx)
          </button>
          <button
            onClick={() => handleDownload({ id: "REP-FULL", name: "Readmission_Risk_Export" }, "CSV")}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export CSV (.csv)
          </button>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {["All", "PDF", "Excel", "CSV"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === type
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Report Title</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{report.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{report.name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] ${
                      report.type === "PDF"
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : report.type === "Excel"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{report.date}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{report.size}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDownload(report)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Download size={14} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Reports;