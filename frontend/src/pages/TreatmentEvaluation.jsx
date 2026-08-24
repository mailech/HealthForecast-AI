import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import TreatmentEffectivenessChart from '../components/charts/TreatmentEffectivenessChart';
import KpiCard from '../components/common/KpiCard';
import { FiCheckCircle, FiTrendingUp, FiUsers, FiActivity } from 'react-icons/fi';

const treatments = [
  { name: 'ACE Inhibitors', patients: 234, successRate: '87%', avgDays: 14, outcome: 'Positive' },
  { name: 'Beta Blockers', patients: 189, successRate: '82%', avgDays: 21, outcome: 'Positive' },
  { name: 'Diuretics', patients: 156, successRate: '74%', avgDays: 10, outcome: 'Moderate' },
  { name: 'Insulin Therapy', patients: 143, successRate: '91%', avgDays: 30, outcome: 'Positive' },
  { name: 'Bronchodilators', patients: 98, successRate: '78%', avgDays: 12, outcome: 'Moderate' },
];

export default function TreatmentEvaluation() {
  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Treatment Evaluation' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Treatment Evaluation</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Analyze treatment effectiveness and patient outcomes</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Treatments Tracked" value={treatments.length} icon={FiActivity} color="blue" />
        <KpiCard title="Avg Success Rate" value="82.4%" icon={FiTrendingUp} color="green" />
        <KpiCard title="Patients Evaluated" value="820" icon={FiUsers} color="purple" />
        <KpiCard title="Positive Outcomes" value="3" icon={FiCheckCircle} color="teal" />
      </div>
      <div className="mb-6"><TreatmentEffectivenessChart /></div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Treatment Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Treatment', 'Patients', 'Success Rate', 'Avg Duration', 'Outcome'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {treatments.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{t.name}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{t.patients}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{t.successRate}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{t.avgDays} days</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.outcome === 'Positive' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.outcome}
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
