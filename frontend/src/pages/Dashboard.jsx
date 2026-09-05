import { useEffect, useState } from 'react';
import { predictionsAPI } from '../services/api';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { Users, AlertTriangle, TrendingUp, Activity, Brain } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [highRisk, setHighRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      predictionsAPI.dashboardStats(),
      predictionsAPI.modelMetrics(),
      predictionsAPI.getHighRisk(),
    ])
      .then(([statsRes, metricsRes, highRiskRes]) => {
        setStats(statsRes.data);
        setMetrics(metricsRes.data);
        setHighRisk(highRiskRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;

  const riskData = [
    { name: 'High Risk', value: stats?.high_risk_patients || 0, color: RISK_COLORS.High },
    { name: 'Medium Risk', value: stats?.medium_risk_patients || 0, color: RISK_COLORS.Medium },
    { name: 'Low Risk', value: stats?.low_risk_patients || 0, color: RISK_COLORS.Low },
  ];

  const modelData = metrics.map((m) => ({
    name: m.model_name.replace('_', ' ').toUpperCase(),
    accuracy: (m.accuracy * 100).toFixed(1),
    f1: (m.f1_score * 100).toFixed(1),
    auc: (m.roc_auc * 100).toFixed(1),
  }));

  const statCards = [
    { label: 'Total Patients', value: stats?.total_patients || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'High Risk Patients', value: stats?.high_risk_patients || 0, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Avg Readmission Prob.', value: `${stats?.avg_readmission_probability || 0}%`, icon: TrendingUp, color: 'bg-amber-500' },
    { label: 'Model Accuracy', value: `${stats?.model_accuracy?.toFixed(1) || 0}%`, icon: Activity, color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Healthcare Dashboard</h1>
        <p className="text-gray-500">
          Welcome, {user?.full_name} — {ROLE_LABELS[user?.role]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color} p-3 rounded-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
          {modelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={modelData}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                <Bar dataKey="f1" fill="#22c55e" name="F1 Score %" />
                <Bar dataKey="auc" fill="#f59e0b" name="ROC-AUC %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No model metrics available. Train models first.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold">High-Risk Patients</h3>
        </div>
        {highRisk.length === 0 ? (
          <p className="text-gray-500 text-sm">No high-risk predictions yet. Run risk predictions from the Risk Prediction page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Patient ID</th>
                  <th className="pb-3 pr-4">Risk Score</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Readmission Prob.</th>
                  <th className="pb-3">Model</th>
                </tr>
              </thead>
              <tbody>
                {highRisk.slice(0, 10).map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-medium">{p.patient_name || '—'}</td>
                    <td className="py-3 pr-4 text-gray-500">{p.patient_code || `#${p.patient_id}`}</td>
                    <td className="py-3 pr-4">{p.risk_score}%</td>
                    <td className="py-3 pr-4">
                      <span className="risk-high px-2 py-1 rounded-full text-xs font-medium">{p.risk_category}</span>
                    </td>
                    <td className="py-3 pr-4">{(p.readmission_probability * 100).toFixed(1)}%</td>
                    <td className="py-3">{p.model_used}</td>
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
