import React, { useState } from "react";
import {
  Database,
  Filter,
  Download,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Eye
} from "lucide-react";
import api from "../../services/api";

const ResearchDatasetPage = () => {
  const [filters, setFilters] = useState({
    age_group: "",
    admission_type: "",
    medication_category: "",
    readmission_category: ""
  });

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateCohort = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Build filter object omitting empty values
      const activeFilters = {};
      if (filters.age_group) activeFilters.age_group = filters.age_group;
      if (filters.admission_type) activeFilters.admission_type = filters.admission_type;
      if (filters.medication_category) activeFilters.medication_category = filters.medication_category;
      if (filters.readmission_category) activeFilters.readmission_category = filters.readmission_category;

      const response = await api.post("/api/v1/researcher/research-dataset/generate", activeFilters);
      setResult(response.data);
    } catch (err) {
      console.error("Error generating research dataset cohort:", err);
      setError(err.response?.data?.detail || "Failed to generate research dataset cohort.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    setError(null);
    try {
      const activeFilters = {};
      if (filters.age_group) activeFilters.age_group = filters.age_group;
      if (filters.admission_type) activeFilters.admission_type = filters.admission_type;
      if (filters.medication_category) activeFilters.medication_category = filters.medication_category;
      if (filters.readmission_category) activeFilters.readmission_category = filters.readmission_category;

      const response = await api.post(
        "/api/v1/researcher/research-dataset/export",
        activeFilters,
        { responseType: "blob" }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `anonymized_research_dataset_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting research dataset:", err);
      setError("Failed to export research dataset CSV.");
    } finally {
      setExporting(false);
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
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Research Dataset Generator & Export
                </h1>
                <p className="text-emerald-200/80 text-sm mt-1">
                  Define, inspect, and export anonymized research-grade cohorts
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-900/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Backend Anonymization</span>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-slate-800/80 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-300">Privacy & De-identification Enforced</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All exported research datasets are generated server-side. Patient identifiers (patient_nbr, encounter_id, names, addresses)
            are strictly scrubbed and excluded prior to file creation.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filter Options & Controls */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-400" />
          Cohort Filter Specifications
        </h2>

        <form onSubmit={handleGenerateCohort} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Age Group
            </label>
            <select
              name="age_group"
              value={filters.age_group}
              onChange={handleFilterChange}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">All Age Groups</option>
              <option value="[0-10)">[0-10)</option>
              <option value="[10-20)">[10-20)</option>
              <option value="[20-30)">[20-30)</option>
              <option value="[30-40)">[30-40)</option>
              <option value="[40-50)">[40-50)</option>
              <option value="[50-60)">[50-60)</option>
              <option value="[60-70)">[60-70)</option>
              <option value="[70-80)">[70-80)</option>
              <option value="[80-90)">[80-90)</option>
              <option value="[90-100)">[90-100)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Admission Type
            </label>
            <select
              name="admission_type"
              value={filters.admission_type}
              onChange={handleFilterChange}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="Emergency">Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="Elective">Elective</option>
              <option value="Newborn">Newborn</option>
              <option value="Trauma Center">Trauma Center</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Medication Status
            </label>
            <select
              name="medication_category"
              value={filters.medication_category}
              onChange={handleFilterChange}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">All Medication States</option>
              <option value="insulin">Insulin Prescribed</option>
              <option value="metformin">Metformin Prescribed</option>
              <option value="glipizide">Glipizide Prescribed</option>
              <option value="change">Treatment Changed</option>
              <option value="no_change">No Change</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Readmission Outcome
            </label>
            <select
              name="readmission_category"
              value={filters.readmission_category}
              onChange={handleFilterChange}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">All Readmission Outcomes</option>
              <option value="<30">Early Readmit (&lt;30 days)</option>
              <option value=">30">Late Readmit (&gt;30 days)</option>
              <option value="NO">No Readmission</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex items-center justify-end gap-4 mt-2">
            <button
              type="button"
              onClick={() => {
                setFilters({ age_group: "", admission_type: "", medication_category: "", readmission_category: "" });
                setResult(null);
              }}
              className="px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Cohort...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Generate Cohort Preview
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Cohort Results Preview */}
      {result && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Cohort Generated Successfully
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {result.record_count.toLocaleString()} Matching Anonymized Encounters
              </h3>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exporting || result.record_count === 0}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-teal-900/30 transition disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Preparing CSV...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Anonymized CSV Dataset
                </>
              )}
            </button>
          </div>

          {/* Sample Data Table */}
          {result.sample_data && result.sample_data.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Sample Anonymized Data Preview (First {result.sample_data.length} records)
                </h4>
                <span className="text-xs text-slate-400">Strictly scrubbed of PII</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold">
                    <tr>
                      {Object.keys(result.sample_data[0]).map((col) => (
                        <th key={col} className="px-4 py-3 border-b border-slate-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.sample_data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/40">
                        {Object.values(row).map((val, valIdx) => (
                          <td key={valIdx} className="px-4 py-2.5 font-mono">
                            {val !== null && val !== undefined ? String(val) : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">
              No records match the selected filter criteria. Try broadening your filter selection.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchDatasetPage;
