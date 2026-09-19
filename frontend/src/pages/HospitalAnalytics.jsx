import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import AdmissionsChart from '../components/charts/AdmissionsChart';
import DepartmentChart from '../components/charts/DepartmentChart';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';
import KpiCard from '../components/common/KpiCard';
import { FiUsers, FiTrendingUp, FiActivity, FiPercent } from 'react-icons/fi';
import { analyticsService } from '../services/analyticsService';

export default function HospitalAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsService.getDashboard().then(setMetrics).catch((requestError) => setError(requestError.message));
  }, []);

  if (error) return <DashboardLayout><p className="text-red-600 text-xs">{error}</p></DashboardLayout>;
  if (!metrics) return <DashboardLayout><p className="text-zinc-400 text-xs">Loading analytics...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Hospital Analytics' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Hospital Analytics</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Comprehensive hospital operational metrics and readmission distribution.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Patients" value={metrics.total_patients.toLocaleString()} icon={FiUsers} />
        <KpiCard title="Predictions" value={metrics.total_predictions || 0} icon={FiActivity} />
        <KpiCard title="Readmission Rate" value={`${metrics.readmission_rate}%`} icon={FiPercent} />
        <KpiCard title="Average Risk" value={`${metrics.average_risk_score}%`} icon={FiTrendingUp} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <AdmissionsChart />
        <RiskDistributionChart data={metrics.risk_distribution} />
      </div>
      <DepartmentChart />
    </DashboardLayout>
  );
}
