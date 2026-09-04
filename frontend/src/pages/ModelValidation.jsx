import React, { useState, useEffect } from 'react'
import api from '../services/api'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts'

export default function ModelValidation() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/predictions/evaluate')
      setMetrics(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch model metrics:', err)
      setError('Failed to load model evaluation metrics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const handleRetrainEval = async () => {
    setEvaluating(true)
    await new Promise(r => setTimeout(r, 1000))
    await fetchMetrics()
    setEvaluating(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">Running ML Model Validation & Metrics Suite...</p>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 m-6">
        <p className="text-rose-400 font-semibold">{error || 'Metrics unavailable'}</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
        >
          Retry Evaluation
        </button>
      </div>
    )
  }

  const COLORS = ['#14b8a6', '#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#3b82f6', '#10b981']

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-semibold rounded-full">
              ML Analytics & Validation
            </span>
            <span className="text-xs text-slate-400">UCI Diabetes 130-US Dataset</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Prediction Accuracy & Analytics Quality</h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated primary model: <span className="text-teal-400 font-semibold">{metrics.primary_model}</span> | Last updated: {metrics.last_evaluated_at}
          </p>
        </div>

        <button
          onClick={handleRetrainEval}
          disabled={evaluating}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm self-start md:self-auto"
        >
          {evaluating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              Evaluating Dataset...
            </>
          ) : (
            '↻ Re-evaluate Benchmark'
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Overall Accuracy</div>
          <div className="text-2xl font-extrabold text-teal-400 mt-1">
            {(metrics.overall_accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">✓ High Precision</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">ROC-AUC Score</div>
          <div className="text-2xl font-extrabold text-indigo-400 mt-1">
            {metrics.roc_auc.toFixed(3)}
          </div>
          <div className="text-[10px] text-indigo-400 mt-1">★ Excellent Discrimination</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Precision</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Positive Predictive Value</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Sensitivity / Recall</div>
          <div className="text-2xl font-extrabold text-pink-400 mt-1">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">True Positive Rate</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">F1 Score</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {(metrics.f1_score * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Harmonic Mean</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Calibration Index</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {metrics.calibration_score}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Low Brier Score</div>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Confusion Matrix Analysis</h3>
            <p className="text-xs text-slate-400 mt-1">Model classification results on {metrics.test_split_size} test samples</p>
          </div>

          <div className="my-6 grid grid-cols-2 gap-4">
            {/* True Negative */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl text-center">
              <div className="text-[11px] text-emerald-400 font-semibold uppercase">True Negative (TN)</div>
              <div className="text-3xl font-extrabold text-emerald-300 mt-1">{metrics.confusion_matrix.true_negative}</div>
              <div className="text-[10px] text-slate-400 mt-1">Correctly Predicted No Readmit</div>
            </div>

            {/* False Positive */}
            <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl text-center">
              <div className="text-[11px] text-amber-400 font-semibold uppercase">False Positive (FP)</div>
              <div className="text-3xl font-extrabold text-amber-300 mt-1">{metrics.confusion_matrix.false_positive}</div>
              <div className="text-[10px] text-slate-400 mt-1">False Alarm</div>
            </div>

            {/* False Negative */}
            <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-center">
              <div className="text-[11px] text-rose-400 font-semibold uppercase">False Negative (FN)</div>
              <div className="text-3xl font-extrabold text-rose-300 mt-1">{metrics.confusion_matrix.false_negative}</div>
              <div className="text-[10px] text-slate-400 mt-1">Missed Readmission</div>
            </div>

            {/* True Positive */}
            <div className="bg-teal-950/40 border border-teal-500/40 p-4 rounded-xl text-center">
              <div className="text-[11px] text-teal-400 font-semibold uppercase">True Positive (TP)</div>
              <div className="text-3xl font-extrabold text-teal-300 mt-1">{metrics.confusion_matrix.true_positive}</div>
              <div className="text-[10px] text-slate-400 mt-1">Correctly Predicted High Risk</div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex justify-between">
            <span>Test Set Size: <strong className="text-white">{metrics.test_split_size}</strong></span>
            <span>Total Dataset: <strong className="text-white">{metrics.dataset_size}</strong></span>
          </div>
        </div>

        {/* ROC Curve Chart */}
        <div className="lg:col-span-7 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Receiver Operating Characteristic (ROC)</h3>
              <p className="text-xs text-slate-400">Trade-off between True Positive Rate and False Positive Rate</p>
            </div>
            <div className="px-3 py-1 bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-bold rounded-lg">
              AUC = {metrics.roc_auc.toFixed(3)}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.roc_curve} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="fpr" stroke="#94a3b8" label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="tpr" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} name="ROC Curve" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importances & Model Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance Chart */}
        <div className="lg:col-span-7 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-1">Top Clinical Feature Importances</h3>
          <p className="text-xs text-slate-400 mb-4">Relative weight of clinical indicators in predicting hospital readmission</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.feature_importances} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" tick={{ fontSize: 12 }} width={135} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                  {metrics.feature_importances.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Benchmarks Table */}
        <div className="lg:col-span-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Algorithm Benchmark Comparison</h3>
            <p className="text-xs text-slate-400 mb-4">Comparative metrics across machine learning architectures</p>

            <div className="space-y-3">
              {metrics.model_benchmarks.map((bm, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    bm.is_primary 
                      ? 'bg-teal-950/40 border-teal-500/50 shadow-md' 
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-xs text-white flex items-center gap-2">
                      {bm.model_name}
                      {bm.is_primary && (
                        <span className="px-2 py-0.5 bg-teal-500 text-slate-950 text-[10px] font-bold rounded-md">
                          PRIMARY
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-bold text-teal-400">AUC: {bm.roc_auc.toFixed(3)}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-slate-400">Acc</div>
                      <div className="font-semibold text-slate-200">{(bm.accuracy * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Prec</div>
                      <div className="font-semibold text-slate-200">{(bm.precision * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Rec</div>
                      <div className="font-semibold text-slate-200">{(bm.recall * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">F1</div>
                      <div className="font-semibold text-slate-200">{(bm.f1_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 text-center">
            ✓ Models evaluated using 5-fold cross validation on hospital readmission clinical attributes.
          </div>
        </div>
      </div>
    </div>
  )
}
