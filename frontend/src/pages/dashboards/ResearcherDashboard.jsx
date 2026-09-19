import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDatabase, FiTrendingUp, FiUsers, FiDownload, FiBarChart2, FiFileText } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import KpiCard from '../../components/common/KpiCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import WelcomeHeader from '../../components/common/WelcomeHeader';
import TrendChart from '../../components/charts/TrendChart';
import PopulationChart from '../../components/charts/PopulationChart';
import RiskDistributionChart from '../../components/charts/RiskDistributionChart';
import { POPULATION_STATS } from '../../data/dummyData';
import { analyticsService } from '../../services/analyticsService';
import api from '../../services/api';

const datasets = [
  { name: 'Diabetes 130-US Hospitals', records: '101,766', features: 50, updated: '2024-06-01', format: 'CSV' },
  { name: 'Readmission Risk Dataset', records: '45,230', features: 32, updated: '2024-05-28', format: 'JSON' },
  { name: 'Patient Demographics', records: '12,840', features: 18, updated: '2024-06-05', format: 'CSV' },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } },
};

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = React.useState(null);
  const [actionError, setActionError] = React.useState('');

  React.useEffect(() => {
    analyticsService.getDashboard().then(setMetrics).catch(() => setMetrics(null));
  }, []);

  const exportCsv = async () => {
    try {
      const reports = (await api.get('/reports/')).data;
      const headers = ['patient_id', 'patient_name', 'mrn', 'risk_score', 'risk_category', 'prediction_date'];
      const rows = reports.map((report) => headers.map((header) => JSON.stringify(report[header] ?? '')).join(','));
      const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'carepulse-reports.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Researcher Dashboard' }]} />
      <WelcomeHeader subtitle="Population analytics, trend analysis, and research cohort datasets." />

      <div className="mb-6 flex items-center justify-end gap-2.5 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportCsv}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5"
        >
          <FiDownload size={13} /> Export Cohort CSV
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/reports')}
          className="btn-primary flex items-center gap-2 text-xs py-2 px-3.5"
        >
          <FiFileText size={13} /> Generate Report
        </motion.button>
      </div>
      {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}

      {/* KPIs */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          { title: "Total Cohort", value: metrics?.total_patients ?? '—', icon: FiUsers, subtitle: "Stored patients", color: { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900' } },
          { title: "Readmission Rate", value: metrics?.readmission_rate !== undefined ? `${metrics.readmission_rate}%` : '—', icon: FiTrendingUp, subtitle: "Predicted high risk", color: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900' } },
          { title: "Predictions", value: metrics?.total_predictions ?? '—', icon: FiDatabase, subtitle: "Stored forecasts", color: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900' } },
          { title: "Average Risk", value: metrics?.average_risk_score !== undefined ? `${metrics.average_risk_score}%` : '—', icon: FiBarChart2, subtitle: "Current predictions", color: { bg: 'bg-teal-50 dark:bg-teal-950/60', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900' } },
        ].map((kpi, i) => (
          <motion.div key={i} variants={stagger.item}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid lg:grid-cols-2 gap-6 mb-6"
      >
        <TrendChart />
        <PopulationChart />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid lg:grid-cols-2 gap-6 mb-6"
      >
        <RiskDistributionChart />

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Population Statistics by Age</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40">
                <tr>
                  {['Age Group', 'Total', 'Readmitted', 'Rate'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {POPULATION_STATS.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white text-xs">{row.age}</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{row.count}</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{row.readmitted}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {((row.readmitted / row.count) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Datasets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Research Datasets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/40">
              <tr>
                {['Dataset Name', 'Records', 'Features', 'Last Updated', 'Format'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {datasets.map((d, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white text-xs">{d.name}</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{d.records}</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{d.features}</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{d.updated}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">{d.format}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
