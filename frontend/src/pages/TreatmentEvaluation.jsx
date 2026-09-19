import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import TreatmentEffectivenessChart from '../components/charts/TreatmentEffectivenessChart';
import KpiCard from '../components/common/KpiCard';
import { FiCheckCircle, FiTrendingUp, FiUsers, FiActivity } from 'react-icons/fi';

const treatments = [
  { name: 'ACE Inhibitors', patients: 234, avgDays: 14, status: 'Active Evaluation' },
  { name: 'Beta Blockers', patients: 189, avgDays: 21, status: 'Active Evaluation' },
  { name: 'Diuretics', patients: 156, avgDays: 10, status: 'Active Evaluation' },
  { name: 'Insulin Regimen', patients: 143, avgDays: 30, status: 'Active Evaluation' },
  { name: 'Bronchodilators', patients: 98, avgDays: 12, status: 'Active Evaluation' },
];

export default function TreatmentEvaluation() {
  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Treatment Evaluation' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Treatment Evaluation</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Clinical observation of patient treatment plans and monitoring protocols.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Protocols Tracked" value={treatments.length} icon={FiActivity} />
        <KpiCard title="Cohort Evaluated" value="820" icon={FiUsers} />
        <KpiCard title="Clinical Categories" value="5" icon={FiTrendingUp} />
        <KpiCard title="Protocol Status" value="Active" icon={FiCheckCircle} />
      </div>
      <div className="mb-6"><TreatmentEffectivenessChart /></div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Treatment Protocol Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/40">
              <tr>
                {['Protocol', 'Cohort Size', 'Avg Duration', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {treatments.map((t, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-white text-xs">{t.name}</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{t.patients} patients</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{t.avgDays} days</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
