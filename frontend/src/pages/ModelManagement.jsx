import { useEffect, useState } from 'react';
import { predictionsAPI, authAPI } from '../services/api';
import { Settings, Database, Cpu, RefreshCw } from 'lucide-react';

export default function ModelManagement() {
  const [metrics, setMetrics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsRes, usersRes] = await Promise.all([
        predictionsAPI.modelMetrics(),
        authAPI.listUsers(),
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const trainModels = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await predictionsAPI.trainModels();
      setMessage(`Models trained! RF Accuracy: ${(res.data.random_forest.accuracy * 100).toFixed(1)}%, XGB Accuracy: ${(res.data.xgboost.accuracy * 100).toFixed(1)}%`);
      await loadData();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Training failed');
    } finally {
      setLoading(false);
    }
  };

  const importDataset = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await predictionsAPI.importDataset(500);
      setMessage(`Imported ${res.data.imported} patients from dataset`);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Model Management</h1>
        <p className="text-gray-500">System administration — AI models, datasets, and user management</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5" /> AI Model Training
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Train Random Forest and XGBoost models on the Diabetes 130-US Hospitals dataset.
          </p>
          <button onClick={trainModels} disabled={loading} className="btn-primary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Training...' : 'Train Models'}
          </button>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" /> Dataset Import
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Import patient records from the Diabetes 130-US Hospitals dataset into the database.
          </p>
          <button onClick={importDataset} disabled={loading} className="btn-secondary flex items-center gap-2">
            <Database className="w-4 h-4" /> Import 500 Patients
          </button>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Model Performance Metrics
        </h3>
        {metrics.length === 0 ? (
          <p className="text-gray-500 text-sm">No models trained yet. Click "Train Models" above.</p>
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
                  <th className="pb-3">Trained At</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.model_name} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-medium capitalize">{m.model_name.replace('_', ' ')}</td>
                    <td className="py-3 pr-4">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4">{(m.f1_score * 100).toFixed(2)}%</td>
                    <td className="py-3 pr-4">{(m.roc_auc * 100).toFixed(2)}%</td>
                    <td className="py-3">{m.trained_at ? new Date(m.trained_at).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Username</th>
                <th className="pb-3 pr-4">Full Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium">{u.username}</td>
                  <td className="py-3 pr-4">{u.full_name}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4 capitalize">{u.role.replace('_', ' ')}</td>
                  <td className="py-3 pr-4">{u.department}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
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
