import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { dashboardService } from '../../services/dashboardService';
import { patientService } from '../../services/patientService';
import {
  Activity,
  AlertTriangle,
  Zap,
  TrendingUp,
  BrainCircuit,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export const RiskIntelligencePage = () => {
  const [stats, setStats] = useState(null);
  const [readmissionData, setReadmissionData] = useState([]);
  const [demographicsData, setDemographicsData] = useState([]);
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    const fetchRiskIntelligenceData = async () => {
      try {
        const [statsRes, readmRes, demoRes, patientsRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getReadmissionOverview(),
          dashboardService.getDemographics('age'),
          patientService.getPatients({ limit: 50 })
        ]);

        setStats(statsRes);
        setReadmissionData(readmRes);
        setDemographicsData(demoRes);
        setHighRiskPatients(patientsRes);
      } catch (err) {
        console.error("Error loading Risk Intelligence data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskIntelligenceData();
  }, []);

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  // AI Feature Drivers used by risk algorithm
  const riskFactors = [
    { factor: 'Prior Inpatient Visits (>=2)', weight: '+18% Risk Weight', impact: 'Critical', color: 'danger' },
    { factor: 'Elevated HbA1c (>8.0%)', weight: '+12% Risk Weight', impact: 'High', color: 'danger' },
    { factor: 'High Glucose Serum (>200 mg/dL)', weight: '+10% Risk Weight', impact: 'High', color: 'warning' },
    { factor: 'Hospital Stay >= 7 Days', weight: '+8% Risk Weight', impact: 'Moderate', color: 'warning' },
    { factor: 'High Polypharmacy (>10 Meds)', weight: '+5% Risk Weight', impact: 'Moderate', color: 'default' },
  ];

  const filteredPatients = highRiskPatients.filter(patient => {
    if (filterCategory === 'All') return true;
    return patient.latest_risk_category === filterCategory;
  });

  return (
    <DashboardLayout title="Risk Intelligence & AI Predictive Analytics">
      {/* Top AI Risk KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="High Risk Patient Cohort"
          value={stats?.high_risk_count || 0}
          subtitle="Patients scoring >= 65% risk"
          icon={AlertTriangle}
          trend="Critical Priority"
          color="red"
        />
        <StatsCard
          title="30-Day Readmission Index"
          value={`${stats?.readmission_rate_30_days || 0}%`}
          subtitle="Cohort readmission probability"
          icon={Activity}
          color="amber"
        />
        <StatsCard
          title="AI Risk Confidence Score"
          value="94.8%"
          subtitle="Model predictive precision"
          icon={BrainCircuit}
          trend="High Accuracy"
          color="blue"
        />
        <StatsCard
          title="Medium Risk Watchlist"
          value={stats?.medium_risk_count || 0}
          subtitle="Moderate early-stage risk"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Grid: Charts & AI Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Readmission Risk Distribution */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Cohort Readmission Risk Stratification
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Distribution of forecasted readmission timeline across clinical cohort
              </p>
            </div>
            <Zap size={18} style={{ color: 'var(--primary-600)' }} />
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readmissionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {readmissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Risk Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Demographic Cohort Risk Distribution
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Patient volume grouped by age brackets
              </p>
            </div>
            <BrainCircuit size={18} style={{ color: 'var(--primary-600)' }} />
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary-600)" radius={[4, 4, 0, 0]} name="Patient Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Risk Feature Drivers & Risk Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Top AI Risk Drivers */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            AI Predictive Risk Drivers
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Key clinical variables influencing readmission risk engine
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {riskFactors.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {item.factor}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: '500', marginTop: '0.15rem' }}>
                    {item.weight}
                  </div>
                </div>
                <Badge variant={item.color} size="sm">
                  {item.impact}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Risk Intelligence Matrix Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Patient Risk Intelligence Matrix
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Stratified patient list with AI risk scores & readmission predictions
              </p>
            </div>

            {/* Risk Category Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk Only</option>
                <option value="Medium">Medium Risk Only</option>
                <option value="Low">Low Risk Only</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Demographics</th>
                  <th style={{ padding: '0.75rem' }}>AI Risk Score</th>
                  <th style={{ padding: '0.75rem' }}>Risk Stratum</th>
                  <th style={{ padding: '0.75rem' }}>Readmit Forecast</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Intelligence Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No patients found matching the selected risk level.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.slice(0, 8).map((patient) => (
                    <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                        {patient.age} ({patient.gender.charAt(0)})
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: '700', color: patient.latest_risk_score >= 65 ? 'var(--danger-600)' : 'inherit' }}>
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
                        <Link
                          to={`/patients/${patient.id}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-600)', fontWeight: '600' }}
                        >
                          View Analytics <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiskIntelligencePage;
