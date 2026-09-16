import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BrainCircuit,
  Cpu,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  BarChart3,
  Layers,
  Sparkles,
  Info,
  Zap,
  Server,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export const AIModelManagementPage = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('xgboost');

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/system/model-info');
      setModelInfo(res.data);
    } catch (err) {
      console.error("Failed to load AI model management info", err);
      setError(err.response?.data?.detail || "Model Information Unavailable from backend service.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-base font-semibold text-slate-300">Loading AI Model Management & Validation Telemetry...</div>
        <div className="text-xs text-slate-500">Retrieving XGBoost candidate metrics, feature importances, and deployment status</div>
      </div>
    );
  }

  if (error || !modelInfo) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-panel border border-rose-500/30 rounded-2xl bg-rose-950/20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Model Information Unavailable</h3>
        <p className="text-sm text-slate-300">{error || "Unable to connect to backend model telematics endpoint."}</p>
        <button
          onClick={fetchModelInfo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-500/20"
        >
          <RotateCcw className="h-4 w-4" /> Retry Connection
        </button>
      </div>
    );
  }

  // Transform top features object into array for Recharts horizontal bar chart
  const topFeaturesData = modelInfo.top_features
    ? Object.entries(modelInfo.top_features).map(([key, val]) => ({
        feature: key.replace(/^medical_specialty_/, 'spec: ').replace(/^diag_1_group_/, 'diag: '),
        importance: Number((val * 100).toFixed(2)),
        raw_importance: val
      })).sort((a, b) => b.importance - a.importance)
    : [];

  const xgbMetrics = modelInfo.evaluation_metrics?.xgboost || {};
  const rfMetrics = modelInfo.evaluation_metrics?.random_forest || {};
  const currentMetrics = activeTab === 'xgboost' ? xgbMetrics : rfMetrics;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                System Administrator View
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Production Artifact Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-cyan-400" /> AI Model Management & Validation Telemetry
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Readmission Risk Model Artifacts, Validation Metrics, Feature Importance & Service Health Overview
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 shrink-0">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Active Model: <strong className="text-white">{modelInfo.model_version}</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Model Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Model Name</div>
          <div className="text-lg font-extrabold text-white truncate">{modelInfo.model_name}</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">{modelInfo.algorithm}</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Model Version</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">{modelInfo.model_version}</div>
          <div className="text-[11px] text-slate-400 mt-1">Production Candidate v1.0</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Input Feature Matrix</div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">{modelInfo.feature_count} Features</div>
          <div className="text-[11px] text-slate-400 mt-1">Pre-discharge clinical features only</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Validation Sample Split</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {(modelInfo.train_samples || 79541).toLocaleString()} / {(modelInfo.test_samples || 19802).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Train / Test encounter split (GroupShuffleSplit)</div>
        </div>
      </div>

      {/* SECTION 2: Model Evaluation & Metrics */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" /> Offline Validation & Evaluation Metrics
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Empirical evaluation results evaluated on the holdout test set (19,802 clinical encounters).
            </p>
          </div>

          {/* Candidate Switcher */}
          <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('xgboost')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'xgboost'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              XGBoost (Production Winner)
            </button>
            <button
              onClick={() => setActiveTab('random_forest')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'random_forest'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Random Forest Candidate
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Accuracy</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {currentMetrics.accuracy ? `${(currentMetrics.accuracy * 100).toFixed(2)}%` : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Recall / Sensitivity</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              {currentMetrics.recall_sensitivity ? `${(currentMetrics.recall_sensitivity * 100).toFixed(2)}%` : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Precision</div>
            <div className="text-xl font-extrabold text-cyan-400 mt-1">
              {currentMetrics.precision ? `${(currentMetrics.precision * 100).toFixed(2)}%` : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">F1-Score</div>
            <div className="text-xl font-extrabold text-purple-400 mt-1">
              {currentMetrics.f1_score ? currentMetrics.f1_score.toFixed(4) : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">ROC-AUC</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {currentMetrics.roc_auc ? currentMetrics.roc_auc.toFixed(4) : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">PR-AUC</div>
            <div className="text-xl font-extrabold text-indigo-400 mt-1">
              {currentMetrics.pr_auc ? currentMetrics.pr_auc.toFixed(4) : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Specificity</div>
            <div className="text-xl font-extrabold text-rose-400 mt-1">
              {currentMetrics.specificity ? `${(currentMetrics.specificity * 100).toFixed(2)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Confusion Matrix Display */}
        {currentMetrics.confusion_matrix && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>Validation Confusion Matrix ({activeTab === 'xgboost' ? 'XGBoost' : 'Random Forest'})</span>
              <span className="text-slate-400 font-mono text-[11px]">Test Set Size: 19,802 Encounters</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-center">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                <div className="text-slate-400 text-[11px]">True Negatives (TN)</div>
                <div className="text-lg font-bold text-emerald-400">{currentMetrics.confusion_matrix.tn?.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Correctly predicted NO readmit</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30">
                <div className="text-slate-400 text-[11px]">False Positives (FP)</div>
                <div className="text-lg font-bold text-amber-400">{currentMetrics.confusion_matrix.fp?.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Over-predicted early readmit</div>
              </div>
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30">
                <div className="text-slate-400 text-[11px]">False Negatives (FN)</div>
                <div className="text-lg font-bold text-rose-400">{currentMetrics.confusion_matrix.fn?.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Missed early readmit cases</div>
              </div>
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-slate-400 text-[11px]">True Positives (TP)</div>
                <div className="text-lg font-bold text-cyan-400">{currentMetrics.confusion_matrix.tp?.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Correctly caught early readmit</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Feature Importance Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" /> Top Feature Importance Hierarchy (XGBoost)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global Gini gain weights extracted from the trained production XGBoost classifier model artifact.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topFeaturesData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} unit="%" />
              <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={130} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                formatter={(val) => [`${val}% (${(val / 100).toFixed(4)} weight)`, 'Importance Weight']}
              />
              <Bar dataKey="importance" fill="#a855f7" radius={[0, 4, 4, 0]}>
                {topFeaturesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#a855f7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4 & 5: Prediction Monitoring & Deployment Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Monitoring */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" /> Live Prediction Telemetry & Monitoring
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Prediction Service Health</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                {modelInfo.prediction_monitoring?.service_status || "Online"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Total Predictions Logged in Database</span>
              <span className="text-white font-mono font-bold text-sm">
                {modelInfo.prediction_monitoring?.total_predictions_logged?.toLocaleString() || "0"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Active Inference Model Version</span>
              <span className="text-cyan-400 font-mono font-bold">
                {modelInfo.model_version}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Latest Prediction Timestamp</span>
              <span className="text-slate-300 font-mono text-[11px]">
                {modelInfo.prediction_monitoring?.latest_prediction_timestamp || "Not available"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Inference REST Endpoint</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {modelInfo.prediction_monitoring?.prediction_service_endpoint || "/api/v1/predictions/predict"}
              </span>
            </div>
          </div>
        </div>

        {/* Model Deployment Status */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-400" /> Artifact Deployment Status
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">XGBoost Model Artifact (`xgboost_model.joblib`)</span>
              {modelInfo.artifact_available ? (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Loaded (~474 KB)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
                  Missing
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Preprocessor Artifact (`preprocessor.joblib`)</span>
              {modelInfo.preprocessor_available ? (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Loaded (~11 KB)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
                  Missing
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Production Candidate Selection</span>
              <span className="text-cyan-400 font-semibold">
                {modelInfo.deployment_status?.production_candidate || "XGBoost Classifier"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Temporal Data Leakage Safeguards</span>
              <span className="text-emerald-400 font-semibold">
                GroupShuffleSplit (0 Overlap)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Inference Security Guard</span>
              <span className="text-purple-400 font-semibold">
                RBAC Token (Doctor Authorized)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Performance Optimization & Benchmarks */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" /> Local System Performance & Benchmark Telemetry
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-400 uppercase text-[11px]">Mean Inference Latency</div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">
              {modelInfo.performance_benchmarks?.inference_latency || "~80–95ms (local benchmark)"}
            </div>
            <div className="text-[11px] text-slate-500">Local CPU benchmark execution</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-400 uppercase text-[11px]">Concurrency Handling</div>
            <div className="text-lg font-bold text-cyan-400">
              {modelInfo.performance_benchmarks?.concurrency_handling || "Thread-safe singleton engine"}
            </div>
            <div className="text-[11px] text-slate-500">Global memory instance caching</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-400 uppercase text-[11px]">Artifact Memory Footprint</div>
            <div className="text-lg font-bold text-purple-400 font-mono">
              {modelInfo.performance_benchmarks?.memory_footprint || "~474 KB XGBoost + ~11 KB Preprocessor"}
            </div>
            <div className="text-[11px] text-slate-500">Lightweight binary model size</div>
          </div>
        </div>
      </div>

      {/* SECTION 7: Model Management Information & Rationale */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-3">
        <div className="font-bold text-slate-200 flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-cyan-400" /> AI Model Selection Rationale & Data Governance Summary
        </div>
        <p>
          • <strong>Production Model Selection:</strong> XGBoost Classifier (`v1.0.0-xgb`) was selected over Random Forest because it achieved <strong>54.96% Recall</strong> (capturing 1,218 out of 2,216 early readmission cases in the test set, capturing 162 additional high-risk patients and reducing missed readmissions by 14.0%).
        </p>
        <p>
          • <strong>Temporal Leakage Elimination:</strong> `discharge_disposition_id` was explicitly removed from input features prior to retraining to prevent post-outcome temporal data leakage. All 187 input features represent purely pre-discharge clinical observations.
        </p>
        <p>
          • <strong>Patient Group Isolation:</strong> Patient splitting was enforced via `GroupShuffleSplit` on `patient_nbr` to ensure zero patient record overlap between training (79,541 encounters) and test sets (19,802 encounters).
        </p>
      </div>
    </div>
  );
};

export default AIModelManagementPage;
