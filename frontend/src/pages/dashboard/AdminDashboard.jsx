import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { dashboardService } from '../../services/dashboardService';
import { Building2, TrendingDown, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [demographics, setDemographics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, perfRes, demoRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getHospitalPerformance(),
          dashboardService.getDemographics('age')
        ]);
        setStats(statsRes);
        setPerformance(perfRes);
        setDemographics(demoRes);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="Hospital Administrator — Operational Intelligence">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="Hospital Total Admissions"
          value={stats?.total_patients || 0}
          subtitle="Active encounter registry"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="30-Day Readmission Rate"
          value={`${stats?.readmission_rate_30_days || 0}%`}
          subtitle="Target threshold < 15.0%"
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="High Risk Patient ratio"
          value={`${stats?.high_risk_count || 0}`}
          subtitle="Clinical intervention required"
          icon={Building2}
          color="amber"
        />
        <StatsCard
          title="Avg Length of Stay"
          value={`${stats?.avg_stay_days || 0} Days`}
          subtitle="Hospital bed turnover rate"
          icon={Calendar}
          color="purple"
        />
      </div>

      <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Hospital Performance by Specialty
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Resource utilization and readmission rate tracking
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Medical Specialty</th>
                  <th style={{ padding: '0.75rem' }}>Total Patients</th>
                  <th style={{ padding: '0.75rem' }}>Avg Stay (Days)</th>
                  <th style={{ padding: '0.75rem' }}>Readmit Rate</th>
                  <th style={{ padding: '0.75rem' }}>High Risk %</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((item) => (
                  <tr key={item.department} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{item.department}</td>
                    <td style={{ padding: '0.75rem' }}>{item.total_patients}</td>
                    <td style={{ padding: '0.75rem' }}>{item.avg_days_in_hospital}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={item.readmission_rate > 35 ? 'danger' : 'warning'}>
                        {item.readmission_rate}%
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{item.high_risk_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Patient Age Distribution
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Diabetes patient age bracket breakdown
          </p>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
