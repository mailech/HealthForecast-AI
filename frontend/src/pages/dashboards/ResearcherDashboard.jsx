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
import { POPULATION_STATS, HOSPITAL_KPIS } from '../../data/dummyData';
import { analyticsService } from '../../services/analyticsService';
import api from '../../services/api';

const datasets = [
  { name: 'Diabetes 130-US Hospitals', records: '101,766', features: 50, updated: '2024-06-01', format: 'CSV' },
  { name: 'Readmission Risk Dataset',  records: '45,230',  features: 32, updated: '2024-05-28', format: 'JSON' },
  { name: 'Patient Demographics',      records: '12,840',  features: 18, updated: '2024-06-05', format: 'CSV' },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } },
};

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = React.useState(null);
  const [actionError, setActionError] = React.useState('');
  React.useEffect(() => { analyticsService.getDashboard().then(setMetrics).catch(() => setMetrics(null)); }, []);
  const exportCsv = async () => {
    try {
      const reports = (await api.get('/reports/')).data;
      const headers = ['patient_id', 'patient_name', 'mrn', 'risk_score', 'risk_category', 'prediction_date'];
      const rows = reports.map((report) => headers.map((header) => JSON.stringify(report[header] ?? '')).join(','));
      const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'healthforecast-reports.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setActionError(error.message); }
  };
  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Researcher Dashboard' }]} />
      <WelcomeHeader subtitle="Population analytics, trend analysis, and research datasets." />

      <div className="mb-6 flex items-center justify-end gap-2 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={exportCsv} className="btn-secondary flex items-center gap-2 text-sm py-2"
        >
          <FiDownload size={14} /> Export CSV
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/reports')} className="btn-primary flex items-center gap-2 text-sm py-2"
        >
          <FiFileText size={14} /> Generate Report
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
          { title: "Total Population", value: metrics?.total_patients || 0, icon: FiUsers, color: "blue", subtitle: "Stored patients" },
          { title: "Readmission Rate", value: `${metrics?.readmission_rate || 0}%`, icon: FiTrendingUp, color: "red", subtitle: "Predicted high risk" },
          { title: "Predictions", value: metrics?.total_predictions || 0, icon: FiDatabase, color: "green", subtitle: "Stored forecasts" },
          { title: "Average Risk", value: `${metrics?.average_risk_score || 0}%`, icon: FiBarChart2, color: "purple", subtitle: "Current predictions" },
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

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Population Statistics by Age</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['Age Group', 'Total', 'Readmitted', 'Rate'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {POPULATION_STATS.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{row.age}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{row.count}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{row.readmitted}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${(row.readmitted / row.count) > 0.2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Available Datasets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Dataset Name', 'Records', 'Features', 'Last Updated', 'Format', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {datasets.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{d.name}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{d.records}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{d.features}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{d.updated}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">{d.format}</span>
                  </td>
                  <td className="px-5 py-3">
                    <motion.button disabled title="Dataset download is not available for this local dataset registry"
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-slate-400 font-medium flex items-center gap-1 cursor-not-allowed"
                    >
                      <FiDownload size={12} /> Download
                    </motion.button>
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
