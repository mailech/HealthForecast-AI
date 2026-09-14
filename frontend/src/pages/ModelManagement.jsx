import { useEffect, useState } from 'react';
import { predictionsAPI } from '../services/api';
import {
  Settings,
  Database,
  Cpu,
  RefreshCw,
  History,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ArrowUpCircle,
  Play,
  Sliders,
} from 'lucide-react';

export default function ModelManagement() {
  const [metrics, setMetrics] = useState([]);
  const [versions, setVersions] = useState([]);
  const [monitoring, setMonitoring] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Controlled retraining form state
  const [retrainModel, setRetrainModel] = useState('both');
  const [sampleSize, setSampleSize] = useState(20000);
  const [classWeight, setClassWeight] = useState('balanced');
  const [retrainNotes, setRetrainNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsRes, versionsRes, monitoringRes] = await Promise.all([
        predictionsAPI.modelMetrics(),
        predictionsAPI.modelVersions(),
        predictionsAPI.modelMonitoring(),

      ]);
      setMetrics(metricsRes.data);
      setVersions(versionsRes.data);
      setMonitoring(monitoringRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleControlledRetrain = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await predictionsAPI.trainControlled({
        model_type: retrainModel,
        sample_size: parseInt(sampleSize),
        class_weight_strategy: classWeight,
        notes: retrainNotes || `Retrain with ${classWeight} weights and sample ${sampleSize}`,
      });
      setMessage('Controlled model retraining completed successfully! Models calibrated and versions registered.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Controlled retraining failed');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateVersion = async (versionId) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await predictionsAPI.activateVersion(versionId);
      setMessage(res.data.message || 'Model version activated in production.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to activate version');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (modelType) => {
    if (!confirm(`Are you sure you want to rollback ${modelType} to its previous version?`)) {
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await predictionsAPI.rollbackModel(modelType);
      setMessage(res.data.message || `Successfully rolled back ${modelType} to previous version.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Rollback failed');
    } finally {
      setLoading(false);
    }
  };

  const importDataset = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await predictionsAPI.importDataset(500);
      setMessage(`Imported ${res.data.imported} patients from dataset`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Model Management & Governance</h1>
          <p className="text-gray-500">
            System administration — AI model lifecycle, performance monitoring, versioning, and controlled retraining
          </p>
        </div>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2 text-sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /> {error}
        </div>
      )}

      {/* Model Monitoring KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Inferences Served</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{monitoring?.total_inferences || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Live requests scored</p>
        </div>

        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Prediction Distribution</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
              High {monitoring?.risk_distribution?.high_pct || 0}%
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              Med {monitoring?.risk_distribution?.medium_pct || 0}%
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold">
              Low {monitoring?.risk_distribution?.low_pct || 0}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Expected positive baseline ~11%</p>
        </div>

        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Average Latency</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {monitoring?.avg_latency_ms || 12.5} <span className="text-sm font-normal text-gray-500">ms</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Mean inference response time</p>
        </div>

        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Model Drift Status</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                monitoring?.drift_status === 'Normal'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {monitoring?.drift_status || 'Normal'}
            </span>
            <span className="text-xs text-gray-500">({monitoring?.status || 'Healthy'})</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Distribution stability monitor</p>
        </div>
      </div>

      {/* Controlled Retraining & Dataset Import Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary-600" /> Controlled AI Model Retraining
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            System Administrator console: configure training sample size, class balancing strategy, and hyperparameters to produce versioned, evaluated models.
          </p>

          <form onSubmit={handleControlledRetrain} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Model</label>
                <select
                  value={retrainModel}
                  onChange={(e) => setRetrainModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="both">Both (Random Forest + XGBoost)</option>
                  <option value="random_forest">Random Forest</option>
                  <option value="xgboost">XGBoost</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Training Sample Size</label>
                <select
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value={10000}>10,000 encounters (Fast test)</option>
                  <option value={20000}>20,000 encounters (Standard recommended)</option>
                  <option value={50000}>50,000 encounters (Comprehensive)</option>
                  <option value={100000}>Full Dataset (100k+ encounters)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Class Imbalance Strategy</label>
                <select
                  value={classWeight}
                  onChange={(e) => setClassWeight(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="balanced">Balanced Weights + Threshold Tuning</option>
                  <option value="none">Standard Unweighted (Baseline)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Retraining Audit Notes</label>
              <input
                type="text"
                value={retrainNotes}
                onChange={(e) => setRetrainNotes(e.target.value)}
                placeholder="e.g. Production recalibration with class balancing for Q3 readmission audit"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Play className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Retraining Models...' : 'Execute Controlled Retraining'}
              </button>
              <span className="text-xs text-gray-400">Generates a candidate model version and evaluates validation metrics</span>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Dataset Ingestion
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Ingest encounters from the Diabetes 130-US Hospitals dataset into the operational relational database.
          </p>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
              <p className="font-semibold mb-1">Dataset Status</p>
              <p>Source: UCI 130-US Hospitals (1999-2008)</p>
              <p>Clinical Features: 32 diabetic medications, HbA1c, comorbidities</p>
            </div>
            <button
              onClick={importDataset}
              disabled={loading}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              <Database className="w-4 h-4" /> Ingest 500 Records
            </button>
          </div>
        </div>
      </div>

      {/* Active Model Performance Metrics */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" /> Active Production Model Performance
            </h3>
            <p className="text-xs text-gray-500">
              Validated on held-out test encounters across 5 key clinical discrimination metrics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleRollback('random_forest')}
              disabled={loading}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Rollback RF
            </button>
            <button
              onClick={() => handleRollback('xgboost')}
              disabled={loading}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Rollback XGB
            </button>
          </div>
        </div>

        {metrics.length === 0 ? (
          <p className="text-gray-500 text-sm">No models trained yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Model</th>
                  <th className="pb-3 pr-4">Accuracy</th>
                  <th className="pb-3 pr-4">Precision</th>
                  <th className="pb-3 pr-4">Recall</th>
                  <th className="pb-3 pr-4">F1 Score</th>
                  <th className="pb-3 pr-4">ROC-AUC</th>
                  <th className="pb-3 pr-4">Optimal Threshold</th>
                  <th className="pb-3">Trained At</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.model_name} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-semibold capitalize text-gray-800">
                      {m.model_name.replace('_', ' ')}
                    </td>
                    <td className="py-3 pr-4 font-medium">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4 font-bold text-green-600">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4 font-bold text-blue-600">{(m.f1_score * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4 font-bold text-purple-600">{(m.roc_auc * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {m.optimal_threshold !== undefined ? m.optimal_threshold : '0.5000'}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {m.trained_at ? new Date(m.trained_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Model Versioning Registry & Performance Tracking History */}
      <div className="card mb-8">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-700" /> Model Version Registry & Performance History
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Audit trail of trained model iterations with validation benchmarks and one-click promotion/activation controls.
        </p>

        {versions.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No model version history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Version</th>
                  <th className="pb-3 pr-4">Model</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Accuracy</th>
                  <th className="pb-3 pr-4">Precision</th>
                  <th className="pb-3 pr-4">Recall</th>
                  <th className="pb-3 pr-4">F1 Score</th>
                  <th className="pb-3 pr-4">ROC-AUC</th>
                  <th className="pb-3 pr-4">Threshold</th>
                  <th className="pb-3 pr-4">Sample Size</th>
                  <th className="pb-3 pr-4">Trained At</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono font-semibold text-primary-700">{v.version}</td>
                    <td className="py-3 pr-4 capitalize font-medium text-gray-800">
                      {v.model_name.replace('_', ' ')}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          v.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {v.is_active ? 'Active (Prod)' : 'Candidate'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{(v.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 pr-4">{(v.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 pr-4 font-semibold text-green-600">{(v.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 pr-4 font-semibold text-blue-600">{(v.f1_score * 100).toFixed(1)}%</td>
                    <td className="py-3 pr-4 font-semibold text-purple-600">{(v.roc_auc * 100).toFixed(1)}%</td>
                    <td className="py-3 pr-4 text-xs font-mono">{v.optimal_threshold}</td>
                    <td className="py-3 pr-4 text-gray-500">{v.sample_size?.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {v.trained_at ? new Date(v.trained_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3">
                      {!v.is_active && (
                        <button
                          onClick={() => handleActivateVersion(v.id)}
                          disabled={loading}
                          className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1"
                        >
                          <ArrowUpCircle className="w-3 h-3" /> Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}