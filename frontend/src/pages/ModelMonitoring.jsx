import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import KpiCard from '../components/common/KpiCard';
import { FiCpu, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../services/api';

export default function ModelMonitoring() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ml-models/')
      .then((res) => setModels(res.data))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Model Monitoring' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">ML Model Registry & Monitoring</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Track active clinical inference models, versions, and deployment status.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Active Models" value={models.length || '1'} icon={FiCpu} />
        <KpiCard title="Model Architecture" value="XGBoost" icon={FiTrendingUp} />
        <KpiCard title="Target Output" value="30-day Readmit" icon={FiCheckCircle} />
        <KpiCard title="Pipeline Status" value="Online" icon={FiClock} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Deployed ML Models</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/40">
              <tr>
                {['Model Name', 'Version', 'Task', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-xs text-zinc-400">Loading model registry...</td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-white text-xs">CarePulse Readmission Predictor</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">v1.0.0</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">Readmission Risk Stratification</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                      Active
                    </span>
                  </td>
                </tr>
              ) : (
                models.map((m, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-white text-xs">{m.model_name}</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{m.version}</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">Readmission Risk</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
