import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDatabase, FiTrendingUp, FiUsers, FiDownload, FiBarChart2, FiFileText,
  FiFilter, FiRefreshCw, FiSliders, FiLayers, FiActivity, FiCheckCircle,
  FiAlertCircle, FiX, FiPrinter, FiChevronDown, FiChevronUp, FiPieChart, FiColumns
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import KpiCard from '../../components/common/KpiCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import WelcomeHeader from '../../components/common/WelcomeHeader';
import TrendChart from '../../components/charts/TrendChart';
import PopulationChart from '../../components/charts/PopulationChart';
import RiskDistributionChart from '../../components/charts/RiskDistributionChart';
import { analyticsService } from '../../services/analyticsService';
import { patientService } from '../../services/patientService';

const datasets = [
  { name: 'Diabetes 130-US Hospitals', records: '101,766', features: 50, updated: '2024-06-01', format: 'CSV' },
  { name: 'Readmission Risk Dataset', records: '45,230', features: 32, updated: '2024-05-28', format: 'JSON' },
  { name: 'Patient Demographics', records: '12,840', features: 18, updated: '2024-06-05', format: 'CSV' },
];

const initialFilters = {
  age_group: 'all',
  gender: 'all',
  department: 'all',
  diagnosis: '',
  risk_level: 'all',
  prediction_status: 'all',
  date_start: '',
  date_end: '',
  min_prior_admissions: '',
  min_length_of_stay: '',
  trend_granularity: 'week',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: 'easeOut' },
});

export default function ResearcherDashboard() {
  const navigate = useNavigate();

  // Active Cohort Analytics Data State
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [availableDepts, setAvailableDepts] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Cohort Comparison State
  const [showComparison, setShowComparison] = useState(false);
  const [cohortAFilters, setCohortAFilters] = useState({ ...initialFilters, age_group: '18-30' });
  const [cohortBFilters, setCohortBFilters] = useState({ ...initialFilters, age_group: '46-60' });
  const [comparisonData, setComparisonData] = useState(null);
  const [compLoading, setCompLoading] = useState(false);

  // Research Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);

  // Load unique departments and main cohort analytics
  const fetchCohortData = async (filterParams) => {
    setLoading(true);
    setActionError('');
    try {
      const data = await analyticsService.getResearcherAnalytics(filterParams);
      setResearchData(data);
    } catch (err) {
      console.error('Error fetching researcher analytics:', err);
      setActionError('Failed to load research cohort analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    // Fetch unique departments from DB patients for dropdown
    patientService.getAll()
      .then((patients) => {
        const depts = new Set(patients.map((p) => p.department).filter(Boolean));
        setAvailableDepts(Array.from(depts));
      })
      .catch(() => setAvailableDepts([]));
  }, []);

  // Filter Handlers
  const handleApplyFilters = (e) => {
    e?.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const handleGranularityChange = (granularity) => {
    const updated = { ...filters, trend_granularity: granularity };
    setFilters(updated);
    setAppliedFilters(updated);
  };

  // Export Cohort CSV (Anonymized, PII-safe)
  const handleExportCsv = async () => {
    setExportLoading(true);
    setActionError('');
    try {
      const blob = await analyticsService.exportCohortCsv(appliedFilters);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'carepulse-research-cohort.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('CSV Export Error:', err);
      setActionError('Failed to export research cohort CSV.');
    } finally {
      setExportLoading(false);
    }
  };

  // Compare Cohorts Handler
  const handleRunComparison = async () => {
    setCompLoading(true);
    try {
      const compRes = await analyticsService.compareCohorts(cohortAFilters, cohortBFilters);
      setComparisonData(compRes);
    } catch (err) {
      console.error('Comparison error:', err);
      setActionError('Failed to compare cohorts.');
    } finally {
      setCompLoading(false);
    }
  };

  const kpis = researchData?.kpis;
  const popByAge = researchData?.population_by_age || [];
  const riskDist = researchData?.risk_distribution || [];
  const popTable = researchData?.population_stats_table || [];
  const trendData = researchData?.trend_data || [];
  const insufficientTrend = researchData?.insufficient_trend_data ?? true;
  const totalCohort = kpis?.total_cohort ?? 0;

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Researcher Dashboard' }]} />
      <WelcomeHeader subtitle="Population analytics, cohort filtering, statistical comparison, and research datasets." />

      {/* ══════════════════════════════════════
          TOP HEADER ACTIONS & SHORTCUTS
      ══════════════════════════════════════ */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 transition-all ${
              showComparison ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300' : ''
            }`}
          >
            <FiColumns size={14} />
            {showComparison ? 'Hide Cohort Comparison' : 'Cohort Comparison (A vs B)'}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCsv}
            disabled={exportLoading || loading}
            className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5"
          >
            <FiDownload size={13} className={exportLoading ? 'animate-spin' : ''} />
            {exportLoading ? 'Exporting...' : 'Export Cohort CSV'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReportModal(true)}
            className="btn-primary flex items-center gap-2 text-xs py-2 px-3.5 font-bold"
          >
            <FiFileText size={13} /> Generate Report
          </motion.button>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle size={15} />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')}><FiX size={14} /></button>
        </div>
      )}

      {/* ══════════════════════════════════════
          1. RESEARCH COHORT BUILDER / FILTERS
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.05)} className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
              <FiSliders size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Research Cohort Builder</h2>
              <p className="text-[11px] text-slate-500">Filter cohort dataset by demographics, clinical parameters, and risk criteria.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
            >
              {showAdvancedFilters ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              {showAdvancedFilters ? 'Fewer Options' : 'More Options'}
            </button>
          </div>
        </div>

        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Age Group */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Age Group</label>
              <select
                value={filters.age_group}
                onChange={(e) => setFilters({ ...filters, age_group: e.target.value })}
                className="input-field text-xs w-full py-1.5"
              >
                <option value="all">All Ages</option>
                <option value="18-30">18–30</option>
                <option value="31-45">31–45</option>
                <option value="46-60">46–60</option>
                <option value="61-75">61–75</option>
                <option value="76+">76+</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="input-field text-xs w-full py-1.5"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Level</label>
              <select
                value={filters.risk_level}
                onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
                className="input-field text-xs w-full py-1.5"
              >
                <option value="all">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
                <option value="Not Predicted">Not Predicted</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="input-field text-xs w-full py-1.5"
              >
                <option value="all">All Departments</option>
                {availableDepts.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Prediction Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prediction Status</label>
              <select
                value={filters.prediction_status}
                onChange={(e) => setFilters({ ...filters, prediction_status: e.target.value })}
                className="input-field text-xs w-full py-1.5"
              >
                <option value="all">All Statuses</option>
                <option value="Predicted">Forecast Recorded</option>
                <option value="Not Predicted">No Forecast</option>
              </select>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnosis</label>
              <input
                type="text"
                placeholder="Search diagnosis..."
                value={filters.diagnosis}
                onChange={(e) => setFilters({ ...filters, diagnosis: e.target.value })}
                className="input-field text-xs w-full py-1.5"
              />
            </div>
          </div>

          {/* Advanced / Optional Filters */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.date_start}
                  onChange={(e) => setFilters({ ...filters, date_start: e.target.value })}
                  className="input-field text-xs w-full py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.date_end}
                  onChange={(e) => setFilters({ ...filters, date_end: e.target.value })}
                  className="input-field text-xs w-full py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Prior Admissions</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  min="0"
                  value={filters.min_prior_admissions}
                  onChange={(e) => setFilters({ ...filters, min_prior_admissions: e.target.value })}
                  className="input-field text-xs w-full py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Length of Stay (Days)</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  min="0"
                  value={filters.min_length_of_stay}
                  onChange={(e) => setFilters({ ...filters, min_length_of_stay: e.target.value })}
                  className="input-field text-xs w-full py-1.5"
                />
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <FiRefreshCw size={13} /> Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2 px-5 font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <FiFilter size={13} /> {loading ? 'Filtering...' : 'Apply Filters'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* ══════════════════════════════════════
          2. COHORT SUMMARY SECTION
      ══════════════════════════════════════ */}
      <motion.div {...fadeUp(0.1)} className="mb-6 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <FiLayers size={17} className="text-blue-400" />
            <h3 className="text-sm font-bold tracking-tight">Active Cohort Summary</h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/60 self-start sm:self-auto">
            {totalCohort} Patients Matching Criteria
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cohort Size</p>
            <p className="text-xl font-black text-white mt-0.5">{totalCohort}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Average Risk</p>
            <p className="text-xl font-black text-teal-400 mt-0.5">
              {kpis?.average_risk_score !== null && kpis?.average_risk_score !== undefined ? `${kpis.average_risk_score}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Risk Breakdown</p>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              <span className="text-rose-400 font-bold">{kpis?.high_risk_patients ?? 0} H</span> •{' '}
              <span className="text-amber-400 font-bold">{kpis?.medium_risk_patients ?? 0} M</span> •{' '}
              <span className="text-emerald-400 font-bold">{kpis?.low_risk_patients ?? 0} L</span>
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Readmission Rate</p>
            <p className="text-xl font-black text-rose-400 mt-0.5">{kpis?.readmission_rate ?? 0}%</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg Length of Stay</p>
            <p className="text-xl font-black text-blue-300 mt-0.5">
              {kpis?.avg_length_of_stay !== null && kpis?.avg_length_of_stay !== undefined ? `${kpis.avg_length_of_stay} days` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg Prior Admissions</p>
            <p className="text-xl font-black text-indigo-300 mt-0.5">
              {kpis?.avg_prior_admissions !== null && kpis?.avg_prior_admissions !== undefined ? kpis.avg_prior_admissions : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          3. COHORT COMPARISON (A vs B)
      ══════════════════════════════════════ */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-900/60 shadow-md"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FiColumns size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cohort Comparison Analysis</h3>
            </div>
            <button onClick={() => setShowComparison(false)} className="text-slate-400 hover:text-slate-600"><FiX size={16} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Cohort A Filters */}
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Cohort A Parameters</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400">Age Group</label>
                  <select
                    value={cohortAFilters.age_group}
                    onChange={(e) => setCohortAFilters({ ...cohortAFilters, age_group: e.target.value })}
                    className="input-field text-xs py-1"
                  >
                    <option value="all">All Ages</option>
                    <option value="18-30">18–30</option>
                    <option value="31-45">31–45</option>
                    <option value="46-60">46–60</option>
                    <option value="61-75">61–75</option>
                    <option value="76+">76+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Department</label>
                  <select
                    value={cohortAFilters.department}
                    onChange={(e) => setCohortAFilters({ ...cohortAFilters, department: e.target.value })}
                    className="input-field text-xs py-1"
                  >
                    <option value="all">All Depts</option>
                    {availableDepts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Cohort B Filters */}
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 space-y-3">
              <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Cohort B Parameters</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400">Age Group</label>
                  <select
                    value={cohortBFilters.age_group}
                    onChange={(e) => setCohortBFilters({ ...cohortBFilters, age_group: e.target.value })}
                    className="input-field text-xs py-1"
                  >
                    <option value="all">All Ages</option>
                    <option value="18-30">18–30</option>
                    <option value="31-45">31–45</option>
                    <option value="46-60">46–60</option>
                    <option value="61-75">61–75</option>
                    <option value="76+">76+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Department</label>
                  <select
                    value={cohortBFilters.department}
                    onChange={(e) => setCohortBFilters({ ...cohortBFilters, department: e.target.value })}
                    className="input-field text-xs py-1"
                  >
                    <option value="all">All Depts</option>
                    {availableDepts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button
              onClick={handleRunComparison}
              disabled={compLoading}
              className="btn-primary text-xs py-2 px-5 font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {compLoading ? 'Comparing...' : 'Run Side-by-Side Comparison'}
            </button>
          </div>

          {/* Side-by-Side Comparison Table */}
          {comparisonData && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Statistical Metric</th>
                    <th className="py-3 px-4 text-center text-blue-600 dark:text-blue-400">Cohort A</th>
                    <th className="py-3 px-4 text-center text-purple-600 dark:text-purple-400">Cohort B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Cohort Size</td>
                    <td className="py-3 px-4 text-center font-extrabold text-blue-600">{comparisonData.cohort_a_metrics.total_cohort}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-purple-600">{comparisonData.cohort_b_metrics.total_cohort}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Average Risk Score</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_a_metrics.average_risk_score !== null ? `${comparisonData.cohort_a_metrics.average_risk_score}%` : 'N/A'}</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_b_metrics.average_risk_score !== null ? `${comparisonData.cohort_b_metrics.average_risk_score}%` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">High Risk Count</td>
                    <td className="py-3 px-4 text-center text-rose-600 font-bold">{comparisonData.cohort_a_metrics.high_risk_patients}</td>
                    <td className="py-3 px-4 text-center text-rose-600 font-bold">{comparisonData.cohort_b_metrics.high_risk_patients}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Medium Risk Count</td>
                    <td className="py-3 px-4 text-center text-amber-600 font-bold">{comparisonData.cohort_a_metrics.medium_risk_patients}</td>
                    <td className="py-3 px-4 text-center text-amber-600 font-bold">{comparisonData.cohort_b_metrics.medium_risk_patients}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Low Risk Count</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">{comparisonData.cohort_a_metrics.low_risk_patients}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">{comparisonData.cohort_b_metrics.low_risk_patients}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Readmission Rate</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_a_metrics.readmission_rate}%</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_b_metrics.readmission_rate}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Average Length of Stay</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_a_metrics.avg_length_of_stay !== null ? `${comparisonData.cohort_a_metrics.avg_length_of_stay} days` : 'N/A'}</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_b_metrics.avg_length_of_stay !== null ? `${comparisonData.cohort_b_metrics.avg_length_of_stay} days` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Average Prior Admissions</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_a_metrics.avg_prior_admissions !== null ? comparisonData.cohort_a_metrics.avg_prior_admissions : 'N/A'}</td>
                    <td className="py-3 px-4 text-center">{comparisonData.cohort_b_metrics.avg_prior_admissions !== null ? comparisonData.cohort_b_metrics.avg_prior_admissions : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          4. MAIN KPIS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Cohort"
          value={loading ? '—' : totalCohort}
          icon={FiUsers}
          subtitle="Matching research population"
          color={{ bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900' }}
        />
        <KpiCard
          title="Readmission Rate"
          value={loading ? '—' : `${kpis?.readmission_rate ?? 0}%`}
          icon={FiTrendingUp}
          subtitle="Predicted high risk"
          color={{ bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900' }}
        />
        <KpiCard
          title="Predictions"
          value={loading ? '—' : (kpis?.total_predictions ?? 0)}
          icon={FiDatabase}
          subtitle="Stored forecasts"
          color={{ bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900' }}
        />
        <KpiCard
          title="Average Risk"
          value={loading ? '—' : (kpis?.average_risk_score !== null && kpis?.average_risk_score !== undefined ? `${kpis.average_risk_score}%` : 'N/A')}
          icon={FiBarChart2}
          subtitle="Matching predictions"
          color={{ bg: 'bg-teal-50 dark:bg-teal-950/60', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900' }}
        />
      </div>

      {/* ══════════════════════════════════════
          5. CHARTS: TREND & POPULATION BY AGE
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-6 mb-6"
      >
        <TrendChart
          data={trendData}
          insufficient={insufficientTrend}
          granularity={filters.trend_granularity}
          onGranularityChange={handleGranularityChange}
        />
        <PopulationChart data={popByAge} />
      </motion.div>

      {/* ══════════════════════════════════════
          6. CHARTS: RISK DISTRIBUTION & POPULATION STATS TABLE
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid lg:grid-cols-2 gap-6 mb-6"
      >
        <RiskDistributionChart data={riskDist} />

        {/* Population Statistics by Age Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Population Statistics by Age</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Cohort</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Age Group</th>
                    <th className="px-5 py-3 text-center">Cohort Total</th>
                    <th className="px-5 py-3 text-center">High Risk</th>
                    <th className="px-5 py-3 text-right">Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {totalCohort === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-slate-400 italic">
                        No patients match the selected research criteria.
                      </td>
                    </tr>
                  ) : (
                    popTable.map((row, i) => {
                      const pct = totalCohort > 0 ? ((row.count / totalCohort) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{row.age}</td>
                          <td className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{row.count}</td>
                          <td className="px-5 py-3 text-center text-rose-600 font-bold">{row.readmitted}</td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          7. RESEARCH DATASETS TABLE
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 overflow-hidden mb-6"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Research Datasets</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Public Reference Repositories</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                {['Dataset Name', 'Records', 'Features', 'Last Updated', 'Format'].map((h) => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {datasets.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{d.name}</td>
                  <td className="px-5 py-3 font-medium">{d.records}</td>
                  <td className="px-5 py-3 font-medium">{d.features}</td>
                  <td className="px-5 py-3 text-slate-500">{d.updated}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {d.format}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          RESEARCH REPORT MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center">
                    <FiFileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">CarePulse AI Research Report</h3>
                    <p className="text-xs text-slate-500">Filtered Cohort Statistical Summary</p>
                  </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                  <FiX size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-5 text-xs text-slate-700 dark:text-slate-300">
                {/* Cohort Summary */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">1. Research Cohort Summary</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <p>• <span className="font-semibold">Cohort Size:</span> {totalCohort} Patients</p>
                    <p>• <span className="font-semibold">Evaluated Forecasts:</span> {kpis?.total_predictions ?? 0}</p>
                    <p>• <span className="font-semibold">Age Filter:</span> {appliedFilters.age_group}</p>
                    <p>• <span className="font-semibold">Gender Filter:</span> {appliedFilters.gender}</p>
                    <p>• <span className="font-semibold">Department:</span> {appliedFilters.department}</p>
                    <p>• <span className="font-semibold">Risk Level Filter:</span> {appliedFilters.risk_level}</p>
                  </div>
                </div>

                {/* Risk & Clinical Analysis */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">2. Risk & Clinical Analysis</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <p>• <span className="font-semibold">Average Risk Score:</span> {kpis?.average_risk_score !== null && kpis?.average_risk_score !== undefined ? `${kpis.average_risk_score}%` : 'N/A'}</p>
                    <p>• <span className="font-semibold">Readmission Rate:</span> {kpis?.readmission_rate ?? 0}%</p>
                    <p>• <span className="font-semibold">High Risk Count:</span> {kpis?.high_risk_patients ?? 0}</p>
                    <p>• <span className="font-semibold">Medium Risk Count:</span> {kpis?.medium_risk_patients ?? 0}</p>
                    <p>• <span className="font-semibold">Low Risk Count:</span> {kpis?.low_risk_patients ?? 0}</p>
                    <p>• <span className="font-semibold">Not Predicted Count:</span> {kpis?.not_predicted_patients ?? 0}</p>
                    <p>• <span className="font-semibold">Avg Length of Stay:</span> {kpis?.avg_length_of_stay !== null && kpis?.avg_length_of_stay !== undefined ? `${kpis.avg_length_of_stay} days` : 'N/A'}</p>
                    <p>• <span className="font-semibold">Avg Prior Admissions:</span> {kpis?.avg_prior_admissions !== null && kpis?.avg_prior_admissions !== undefined ? kpis.avg_prior_admissions : 'N/A'}</p>
                  </div>
                </div>

                {/* Print / Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setShowReportModal(false)} className="btn-secondary text-xs py-2 px-4">
                    Close
                  </button>
                  <button onClick={() => window.print()} className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2">
                    <FiPrinter size={14} /> Print Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
