import { useEffect, useState } from 'react';
import { patientsAPI, predictionsAPI } from '../services/api';
import { AlertTriangle, Play, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

export default function RiskPrediction() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [modelType, setModelType] = useState('random_forest');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [highRisk, setHighRisk] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    patientsAPI.list(0, 100).then((res) => setPatients(res.data)).catch(console.error);
    predictionsAPI.getHighRisk().then((res) => setHighRisk(res.data)).catch(console.error);
  }, []);

  const runPrediction = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await predictionsAPI.predictRisk(parseInt(selectedId), modelType);
      setResult(res.data);
      const hist = await predictionsAPI.getRiskHistory(parseInt(selectedId));
      setHistory(hist.data);
      const hr = await predictionsAPI.getHighRisk();
      setHighRisk(hr.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const featureData = result?.feature_importance
    ? Object.entries(result.feature_importance).slice(0, 8).map(([name, value]) => ({
        name: name.replace(/cat__|num__/g, '').slice(0, 20),
        importance: parseFloat(value.toFixed(4)),
      }))
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Risk Prediction</h1>
        <p className="text-gray-500">AI-powered patient risk scoring and readmission probability analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card lg:col-span-1">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary-600" /> Run Prediction
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Patient</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Choose patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.patient_id} — {p.age}, {p.gender}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="random_forest">Random Forest</option>
                <option value="xgboost">XGBoost</option>
              </select>
            </div>
            <button onClick={runPrediction} disabled={loading || !selectedId} className="w-full btn-primary disabled:opacity-50">
              {loading ? 'Analyzing...' : 'Generate Risk Score'}
            </button>
          </div>
        </div>

        {result && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Prediction Results
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Risk Score</p>
                <p className="text-3xl font-bold" style={{ color: CATEGORY_COLORS[result.risk_category] }}>
                  {result.risk_score}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Risk Category</p>
                <p className={`text-xl font-bold mt-1 inline-block px-3 py-1 rounded-full risk-${result.risk_category.toLowerCase()}`}>
                  {result.risk_category}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Readmission Probability</p>
                <p className="text-3xl font-bold text-primary-600">
                  {(result.readmission_probability * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {result.clinical_insights?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Clinical Insights</h4>
                <ul className="space-y-1">
                  {result.clinical_insights.map((insight, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span> {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {featureData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Risk Factors (Model)</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={featureData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="importance" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> High-Risk Patients
          </h3>
          {highRisk.length === 0 ? (
            <p className="text-gray-500 text-sm">No high-risk patients identified yet.</p>
          ) : (
            <div className="space-y-2">
              {highRisk.slice(0, 8).map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-sm">Patient #{p.patient_id}</span>
                  <span className="text-red-700 font-bold">{p.risk_score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" /> Prediction History
            </h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                  <span>{new Date(h.created_at).toLocaleString()}</span>
                  <span className={`px-2 py-1 rounded-full risk-${h.risk_category.toLowerCase()} text-xs`}>
                    {h.risk_category} — {h.risk_score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
