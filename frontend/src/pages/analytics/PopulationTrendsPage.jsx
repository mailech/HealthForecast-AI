import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { dashboardService } from '../../services/dashboardService';
import {
  FileText,
  Users,
  Activity,
  Filter,
  PieChart as PieIcon,
  BarChart2,
  Share2,
  Layers,
  Globe
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

export const PopulationTrendsPage = () => {
  const [stats, setStats] = useState(null);
  const [ageDemographics, setAgeDemographics] = useState([]);
  const [raceDemographics, setRaceDemographics] = useState([]);
  const [genderDemographics, setGenderDemographics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopulationTrends = async () => {
      try {
        const [statsRes, ageRes, raceRes, genderRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getDemographics('age'),
          dashboardService.getDemographics('race'),
          dashboardService.getDemographics('gender')
        ]);
        setStats(statsRes);
        setAgeDemographics(ageRes);
        setRaceDemographics(raceRes);
        setGenderDemographics(genderRes);
      } catch (err) {
        console.error("Error loading population trends data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopulationTrends();
  }, []);

  const COLORS = ['#0d9488', '#0284c7', '#6366f1', '#a855f7', '#ec4899', '#f59e0b'];

  return (
    <DashboardLayout title="Population Health & Epidemiology Trends">
      {/* Population Health KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="Total Research Encounters"
          value={stats?.total_patients || 0}
          subtitle="De-identified epidemiological cohort"
          icon={Users}
          color="teal"
        />
        <StatsCard
          title="High Risk Diabetes Cohort"
          value={stats?.high_risk_count || 0}
          subtitle="Prevalence of severe diabetes cases"
          icon={Activity}
          color="red"
        />
        <StatsCard
          title="Population Readmit Rate"
          value={`${stats?.readmission_rate_30_days || 0}%`}
          subtitle="30-Day population readmission"
          icon={BarChart2}
          color="blue"
        />
        <StatsCard
          title="Demographic Groups"
          value={raceDemographics.length || 5}
          subtitle="Ethnicities & age brackets tracked"
          icon={Globe}
          color="purple"
        />
      </div>

      {/* Grid: Charts for Age Bracket & Ethnic/Racial Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Age Group Distribution */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Age Group Prevalence Distribution
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Encounter counts across age brackets in dataset
              </p>
            </div>
            <BarChart2 size={18} style={{ color: 'var(--teal-600)' }} />
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDemographics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Encounters" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ethnicity / Race Representation */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Racial & Ethnic Cohort Breakdown
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Representation of ethnic backgrounds in cohort
              </p>
            </div>
            <PieIcon size={18} style={{ color: 'var(--teal-600)' }} />
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={raceDemographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="label"
                >
                  {raceDemographics.map((entry, index) => (
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

      {/* Population Health Research Insights Table */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
          Gender & Demographic Stratification Matrix
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Epidemiological breakdown of cohort demographics and gender representation
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Demographic Category</th>
                <th style={{ padding: '0.75rem' }}>Group Label</th>
                <th style={{ padding: '0.75rem' }}>Sample Count</th>
                <th style={{ padding: '0.75rem' }}>Cohort Share (%)</th>
                <th style={{ padding: '0.75rem' }}>Research Status</th>
              </tr>
            </thead>
            <tbody>
              {raceDemographics.map((race) => {
                const total = raceDemographics.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percentage = ((race.count / total) * 100).toFixed(1);
                return (
                  <tr key={race.label} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>Race / Ethnicity</td>
                    <td style={{ padding: '0.75rem' }}>{race.label}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>{race.count} Encounters</td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant="teal">{percentage}% Share</Badge>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Anonymized & Verified</td>
                  </tr>
                );
              })}
              {genderDemographics.map((gender) => {
                const total = genderDemographics.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percentage = ((gender.count / total) * 100).toFixed(1);
                return (
                  <tr key={gender.label} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>Gender Breakdown</td>
                    <td style={{ padding: '0.75rem' }}>{gender.label}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>{gender.count} Encounters</td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant="default">{percentage}% Share</Badge>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Anonymized & Verified</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PopulationTrendsPage;
