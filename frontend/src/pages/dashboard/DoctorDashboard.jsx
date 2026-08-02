import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { dashboardService } from '../../services/dashboardService';
import { patientService } from '../../services/patientService';
import { Users, AlertTriangle, Activity, Stethoscope, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

export const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [readmissionData, setReadmissionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, patientsRes, readmRes] = await Promise.all([
          dashboardService.getStats(),
          patientService.getPatients({ limit: 10 }),
          dashboardService.getReadmissionOverview()
        ]);
        setStats(statsRes);
        setAssignedPatients(patientsRes);
        setReadmissionData(readmRes);
      } catch (err) {
        console.error("Error loading doctor dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <DashboardLayout title="Doctor Dashboard — Patient Risk Monitor">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="Assigned Patients"
          value={stats?.assigned_patients || 0}
          subtitle="Under your active clinical scope"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="High-Risk Watchlist"
          value={stats?.high_risk_count || 0}
          subtitle="Immediate clinical review needed"
          icon={AlertTriangle}
          trend="Action Required"
          color="red"
        />
        <StatsCard
          title="30-Day Readmission Risk"
          value={`${stats?.readmission_rate_30_days || 0}%`}
          subtitle="Early readmission probability"
          icon={Activity}
          color="amber"
        />
        <StatsCard
          title="Avg Length of Stay"
          value={`${stats?.avg_stay_days || 0} Days`}
          subtitle="Inpatient hospitalization duration"
          icon={Stethoscope}
          color="purple"
        />
      </div>

      <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="patient-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Assigned Patient Risk Watchlist
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Real-time risk scoring and readmission forecasts
              </p>
            </div>
            <Link to="/patients" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
              View All Patients
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Age / Gender</th>
                  <th style={{ padding: '0.75rem' }}>Risk Score</th>
                  <th style={{ padding: '0.75rem' }}>Risk Category</th>
                  <th style={{ padding: '0.75rem' }}>Readmit Forecast</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedPatients.slice(0, 6).map((patient) => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {patient.age} ({patient.gender.charAt(0)})
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>
                      {patient.latest_risk_score}%
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={
                        patient.latest_risk_category === 'High' ? 'danger' :
                        patient.latest_risk_category === 'Medium' ? 'warning' : 'success'
                      }>
                        {patient.latest_risk_category} Risk
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={patient.latest_readmission_status === '<30' ? 'danger' : 'default'}>
                        {patient.latest_readmission_status === '<30' ? '<30 Days' : 'Low Risk'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <Link to={`/patients/${patient.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-600)', fontWeight: '600' }}>
                        Details <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Readmission Risk Breakdown
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            30-Day forecast across patient cohort
          </p>

          <div style={{ flex: 1, minHeight: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readmissionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {readmissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {readmissionData.map((item, idx) => (
              <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.category}
                </span>
                <span style={{ fontWeight: '700' }}>{item.count} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
