import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileSpreadsheet,
  Server,
  Layers,
  Activity,
  ShieldCheck
} from 'lucide-react';

export const DatasetIngestionPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedMaxRows, setSelectedMaxRows] = useState(5000);
  const [message, setMessage] = useState('');
  const [ingestionResult, setIngestionResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/system/status');
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to load system status", err);
      setError(err.response?.data?.detail || err.message || "Failed to connect to backend server.");
    } fontally: {
      setLoading(false);
    }
  };

  const handleTriggerIngestion = async () => {
    setSeeding(true);
    setMessage('');
    setIngestionResult(null);
    setError(null);
    try {
      const res = await api.post(`/system/seed-dataset?max_rows=${selectedMaxRows}`);
      setIngestionResult(res.data);
      setMessage(res.data.message || 'Dataset ingestion process executed successfully.');
      fetchStatus();
    } catch (err) {
      console.error("Dataset ingestion error", err);
      setError('Dataset ingestion failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/sysadmin/users"
              className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to System Dashboard
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Database className="h-6 w-6 text-cyan-400" /> Dataset Ingestion Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage relational database seeding, batch ingestion parameters & dataset telemetry
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-rose-200">System Connection Error</div>
              <div>{error}</div>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-colors border border-rose-500/40"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Ingestion Source Dataset Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Primary Source File</span>
            <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">diabetic_data.csv</div>
          <div className="text-xs text-slate-400">Path: <code className="text-cyan-300 font-mono">dataset/diabetic_data.csv</code></div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Total Dataset Scope</span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">101,766 Encounters</div>
          <div className="text-xs text-slate-400">130 Participating US Hospitals (1999–2008)</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Feature Dimension</span>
            <Server className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-400">50 Variables / Attributes</div>
          <div className="text-xs text-slate-400">Demographics, Medications, Labs, Diagnoses</div>
        </div>
      </div>

      {/* Database Diagnostic Metrics */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-amber-400" /> Database Live Ingestion Status
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
            Loading database metrics...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Ingested Patient Records</div>
              <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                {(status?.database_metrics?.patients_count || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Unique patient entities in DB</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Clinical Encounter Records</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {(status?.database_metrics?.encounters_count || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Full hospital admission encounters</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">System Health Status</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 uppercase flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                {status?.status || 'Online'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Backend v{status?.version || '1.0.0'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Ingestion Control Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" /> Execute Batch Dataset Ingestion
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Specify the maximum record limit for relational DB seeding from <code className="text-cyan-300 font-mono">diabetic_data.csv</code>. Existing database records are safely preserved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Batch Ingestion Size (Max Rows):
            </label>
            <select
              value={selectedMaxRows}
              onChange={(e) => setSelectedMaxRows(Number(e.target.value))}
              disabled={seeding}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={2000}>2,000 Records (Fast Development)</option>
              <option value={5000}>5,000 Records (Standard Analytical Sample)</option>
              <option value={10000}>10,000 Records (Extended Cohort)</option>
              <option value={101766}>101,766 Records (Full US Dataset)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleTriggerIngestion}
              disabled={seeding}
              className="w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Processing Ingestion...' : 'Trigger Dataset Ingestion'}</span>
            </button>
          </div>
        </div>

        {/* Message / Result Alert */}
        {message && (
          <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
            ingestionResult?.status === 'already_seeded'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm mb-0.5">
                {ingestionResult?.status === 'already_seeded' ? 'Database Already Seeded' : 'Ingestion Completed'}
              </div>
              <div>{message}</div>
              {ingestionResult?.patients_created !== undefined && (
                <div className="mt-1 font-mono text-[11px]">
                  Patients Created: {ingestionResult.patients_created} | Encounters Created: {ingestionResult.encounters_created}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Security & Data Integrity Note */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-cyan-400 flex-shrink-0" />
        <div>
          <span className="font-semibold text-slate-300">Data Integrity Notice:</span> All dataset ingestion routines read strictly from <code className="text-cyan-300 font-mono">dataset/diabetic_data.csv</code>. The original source file remains 100% read-only and immutable.
        </div>
      </div>
    </div>
  );
};

export default DatasetIngestionPage;
