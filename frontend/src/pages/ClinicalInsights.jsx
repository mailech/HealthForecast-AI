import { useEffect, useState } from 'react';
import { patientsAPI, predictionsAPI } from '../services/api';
import { Brain, Heart, Calendar, Home, Shield } from 'lucide-react';

export default function ClinicalInsights() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    patientsAPI.list(0, 100).then((res) => setPatients(res.data)).catch(console.error);
  }, []);

  const loadInsights = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await predictionsAPI.clinicalInsights(parseInt(selectedId));
      setInsights(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const categoryClass = (cat) => {
    if (cat === 'High') return 'risk-high';
    if (cat === 'Medium') return 'risk-medium';
    return 'risk-low';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Clinical Insights</h1>
        <p className="text-gray-500">AI-generated care recommendations, follow-up plans, and discharge support</p>
      </div>

      <div className="card mb-8">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
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
          <button onClick={loadInsights} disabled={loading || !selectedId} className="btn-primary disabled:opacity-50">
            {loading ? 'Analyzing...' : 'Generate Clinical Insights'}
          </button>
        </div>
      </div>

      {insights && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center">
              <p className="text-sm text-gray-500">Patient</p>
              <p className="text-lg font-bold">{insights.patient_code}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Risk Category</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${categoryClass(insights.risk_category)}`}>
                {insights.risk_category}
              </span>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Risk Score</p>
              <p className="text-2xl font-bold">{insights.risk_score}%</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Readmission Probability</p>
              <p className="text-2xl font-bold text-primary-600">
                {(insights.readmission_probability * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" /> Key Risk Factors
              </h3>
              <ul className="space-y-2">
                {insights.key_risk_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg text-sm">
                    <span className="text-red-500 font-bold">{i + 1}.</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-500" /> Care Recommendations
              </h3>
              <ul className="space-y-2">
                {insights.care_recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg text-sm">
                    <span className="text-green-500">✓</span> {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> Follow-Up Plan
              </h3>
              <ul className="space-y-2">
                {insights.follow_up_plan.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg text-sm">
                    <span className="text-blue-500 font-medium">{i + 1}.</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-500" /> Discharge Support
              </h3>
              <ul className="space-y-2">
                {insights.discharge_support.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg text-sm">
                    <span className="text-purple-500">→</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {!insights && !loading && (
        <div className="card text-center py-12">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a patient and generate clinical insights to view recommendations</p>
        </div>
      )}
    </div>
  );
}
