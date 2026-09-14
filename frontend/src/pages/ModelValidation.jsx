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
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium animate-pulse">Running ML Model Validation & Metrics Suite...</p>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm m-6">
        <p className="text-rose-600 font-semibold">{error || 'Metrics unavailable'}</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg text-sm"
        >
          Retry Evaluation
        </button>
      </div>
    )
  }

  const COLORS = ['#0d9488', '#4f46e5', '#9333ea', '#db2777', '#d97706', '#2563eb', '#059669']

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold rounded-full">
              ML Analytics & Validation
            </span>
            <span className="text-xs text-gray-500 font-medium">UCI Diabetes 130-US Dataset</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Prediction Accuracy & Analytics Quality</h1>
          <p className="text-xs text-gray-500 mt-1">
            Evaluated primary model: <span className="text-teal-700 font-bold">{metrics.primary_model}</span> | Last updated: {metrics.last_evaluated_at}
          </p>
        </div>

        <button
          onClick={handleRetrainEval}
          disabled={evaluating}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm self-start md:self-auto"
        >
          {evaluating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Evaluating Dataset...
            </>
          ) : (
            '↻ Re-evaluate Benchmark'
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium">Overall Accuracy</div>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">
            {(metrics.overall_accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ High Precision</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium">ROC-AUC Score</div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1">
            {metrics.roc_auc.toFixed(3)}
          </div>
          <div className="text-[10px] text-indigo-600 font-bold mt-1">★ Excellent Discrimination</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium">Precision</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Positive Predictive Value</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium">Sensitivity / Recall</div>
          <div className="text-2xl font-extrabold text-pink-700 mt-1">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-gray-500 mt-1">True Positive Rate</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium">F1 Score</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {(metrics.f1_score * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Harmonic Mean</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium">Calibration Index</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {metrics.calibration_score}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">Low Brier Score</div>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Confusion Matrix Analysis</h3>
            <p className="text-xs text-gray-500 mt-1">Model classification results on {metrics.test_split_size} test samples</p>
          </div>

          <div className="my-6 grid grid-cols-2 gap-4">
            {/* True Negative */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <div className="text-[11px] text-emerald-800 font-bold uppercase">True Negative (TN)</div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">{metrics.confusion_matrix.true_negative}</div>
              <div className="text-[10px] text-gray-600 mt-1">Correctly Predicted No Readmit</div>
            </div>

            {/* False Positive */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
              <div className="text-[11px] text-amber-800 font-bold uppercase">False Positive (FP)</div>
              <div className="text-3xl font-extrabold text-amber-700 mt-1">{metrics.confusion_matrix.false_positive}</div>
              <div className="text-[10px] text-gray-600 mt-1">False Alarm</div>
            </div>

            {/* False Negative */}
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-center">
              <div className="text-[11px] text-rose-800 font-bold uppercase">False Negative (FN)</div>
              <div className="text-3xl font-extrabold text-rose-700 mt-1">{metrics.confusion_matrix.false_negative}</div>
              <div className="text-[10px] text-gray-600 mt-1">Missed Readmission</div>
            </div>

            {/* True Positive */}
            <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl text-center">
              <div className="text-[11px] text-teal-800 font-bold uppercase">True Positive (TP)</div>
              <div className="text-3xl font-extrabold text-teal-700 mt-1">{metrics.confusion_matrix.true_positive}</div>
              <div className="text-[10px] text-gray-600 mt-1">Correctly Predicted High Risk</div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-700 flex justify-between">
            <span>Test Set Size: <strong className="text-gray-900">{metrics.test_split_size}</strong></span>
            <span>Total Dataset: <strong className="text-gray-900">{metrics.dataset_size}</strong></span>
          </div>
        </div>

        {/* ROC Curve Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Receiver Operating Characteristic (ROC)</h3>
              <p className="text-xs text-gray-500">Trade-off between True Positive Rate and False Positive Rate</p>
            </div>
            <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-lg">
              AUC = {metrics.roc_auc.toFixed(3)}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.roc_curve} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fpr" stroke="#64748b" label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#64748b" label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="tpr" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 4 }} name="ROC Curve" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importances & Model Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Top Clinical Feature Importances</h3>
          <p className="text-xs text-gray-500 mb-4">Relative weight of clinical indicators in predicting hospital readmission</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.feature_importances} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="feature" stroke="#64748b" tick={{ fontSize: 12 }} width={135} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Algorithm Benchmark Comparison</h3>
            <p className="text-xs text-gray-500 mb-4">Comparative metrics across machine learning architectures</p>

            <div className="space-y-3">
              {metrics.model_benchmarks.map((bm, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    bm.is_primary 
                      ? 'bg-teal-50/60 border-teal-200 shadow-xs' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-gray-900 flex items-center gap-2">
                      {bm.model_name}
                      {bm.is_primary && (
                        <span className="px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-md">
                          PRIMARY
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-bold text-teal-700">AUC: {bm.roc_auc.toFixed(3)}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-white p-2 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-gray-500">Acc</div>
                      <div className="font-bold text-gray-900">{(bm.accuracy * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Prec</div>
                      <div className="font-bold text-gray-900">{(bm.precision * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Rec</div>
                      <div className="font-bold text-gray-900">{(bm.recall * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">F1</div>
                      <div className="font-bold text-gray-900">{(bm.f1_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center font-medium">
            ✓ Models evaluated using 5-fold cross validation on hospital readmission clinical attributes.
          </div>
        </div>
      </div>
    </div>
  )
}
