import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import TrendChart from '../components/charts/TrendChart';
import KpiCard from '../components/common/KpiCard';
import { FiCpu, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';

const models = [
  { name: 'Readmission Predictor v2.1', accuracy: '94.2%', auc: '0.96', status: 'active', updated: '2024-06-01' },
  { name: 'Risk Stratifier v1.4', accuracy: '89.7%', auc: '0.92', status: 'active', updated: '2024-05-20' },
  { name: 'LOS Predictor v1.0', accuracy: '81.3%', auc: '0.87', status: 'staging', updated: '2024-06-05' },
];

export default function ModelMonitoring() {
  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Model Monitoring' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">ML Model Monitoring</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track model performance, accuracy, and drift metrics</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Active Models" value="2" icon={FiCpu} color="blue" />
        <KpiCard title="Avg Accuracy" value="91.9%" icon={FiTrendingUp} color="green" />
        <KpiCard title="Predictions Today" value="142" icon={FiCheckCircle} color="purple" />
        <KpiCard title="Avg Latency" value="120ms" icon={FiClock} color="orange" />
      </div>
      <div className="mb-6"><TrendChart /></div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Deployed Models</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Model Name', 'Accuracy', 'AUC-ROC', 'Status', 'Last Updated'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {models.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{m.name}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{m.accuracy}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{m.auc}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{m.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
