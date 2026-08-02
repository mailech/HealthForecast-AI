import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { dashboardService } from '../../services/dashboardService';
import {
  Building2,
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const HospitalPerformancePage = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalPerformance = async () => {
      try {
        const [perfRes, statsRes] = await Promise.all([
          dashboardService.getHospitalPerformance(),
          dashboardService.getStats()
        ]);
        setPerformanceData(perfRes);
        setStats(statsRes);
      } catch (err) {
        console.error("Error loading hospital performance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalPerformance();
  }, []);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <DashboardLayout title="Hospital Performance & Operations Analytics">
      {/* Top Operations Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="Active Departments"
          value={performanceData.length || 4}
          subtitle="Monitored clinical specialties"
          icon={Building2}
          color="blue"
        />
        <StatsCard
          title="Overall Readmission Index"
          value={`${stats?.readmission_rate_30_days || 0}%`}
          subtitle="Hospital-wide 30-day readmit"
          icon={TrendingUp}
          trend="Target <15%"
          color="red"
        />
        <StatsCard
          title="Average Inpatient Stay"
          value={`${stats?.avg_stay_days || 0} Days`}
          subtitle="Bed efficiency & turnover"
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Operational Efficiency"
          value="92.4%"
          subtitle="Clinical resource allocation"
          icon={Award}
          trend="Optimal"
          color="green"
        />
      </div>

      {/* Specialty Performance Chart & High-Risk Ratios */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Readmission & Hospitalization Duration Chart by Department */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Departmental Readmission & Hospital Stay Comparison
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Readmission rates (%) and average length of stay across specialties
              </p>
            </div>
            <BarChart3 size={18} style={{ color: 'var(--primary-600)' }} />
          </div>

          <div style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="readmission_rate" fill="#ef4444" name="Readmission Rate (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_days_in_hospital" fill="#2563eb" name="Avg Hospital Stay (Days)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Volume Breakdown by Department */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Specialty Patient Volume Share
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Encounters distribution by clinical specialty
              </p>
            </div>
            <Layers size={18} style={{ color: 'var(--primary-600)' }} />
          </div>

          <div style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="total_patients"
                  nameKey="department"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Department Performance Scorecard Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Hospital Department Performance Matrix
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Detailed metrics for quality governance, readmission rates, and patient risk profiles
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Medical Specialty / Department</th>
                <th style={{ padding: '0.75rem' }}>Total Patients</th>
                <th style={{ padding: '0.75rem' }}>Avg Hospital Stay</th>
                <th style={{ padding: '0.75rem' }}>Readmission Rate</th>
                <th style={{ padding: '0.75rem' }}>High-Risk Patient Ratio</th>
                <th style={{ padding: '0.75rem' }}>Quality Status</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No department performance data available.
                  </td>
                </tr>
              ) : (
                performanceData.map((item) => (
                  <tr key={item.department} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{item.department}</td>
                    <td style={{ padding: '0.75rem' }}>{item.total_patients} Patients</td>
                    <td style={{ padding: '0.75rem' }}>{item.avg_days_in_hospital} Days</td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={item.readmission_rate > 35 ? 'danger' : 'warning'}>
                        {item.readmission_rate}%
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>{item.high_risk_percentage}%</td>
                    <td style={{ padding: '0.75rem' }}>
                      {item.readmission_rate <= 30 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success-700)', fontWeight: '600', fontSize: '0.75rem' }}>
                          <CheckCircle2 size={14} /> Meets Target
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger-700)', fontWeight: '600', fontSize: '0.75rem' }}>
                          <AlertCircle size={14} /> Audit Needed
                        </span>
                      )}
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
};

export default HospitalPerformancePage;
