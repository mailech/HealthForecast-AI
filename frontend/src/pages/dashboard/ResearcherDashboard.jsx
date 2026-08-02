import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { patientService } from '../../services/patientService';
import { dashboardService } from '../../services/dashboardService';
import { Database, Download, Activity, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ResearcherDashboard = () => {
  const [anonymizedPatients, setAnonymizedPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [demographics, setDemographics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, statsRes, demoRes] = await Promise.all([
          patientService.getPatients({ limit: 15 }),
          dashboardService.getStats(),
          dashboardService.getDemographics('race')
        ]);
        setAnonymizedPatients(patientsRes);
        setStats(statsRes);
        setDemographics(demoRes);
      } catch (err) {
        console.error("Error loading researcher dashboard:", err);
      }
    };
    fetchData();
  }, []);

  const exportDatasetCSV = () => {
    const headers = ["ID", "Patient_NBR", "Race", "Gender", "Age", "Risk_Score", "Risk_Category", "Readmitted_Status"];
    const rows = anonymizedPatients.map(p => [
      p.id, p.patient_nbr, p.race, p.gender, p.age, p.latest_risk_score, p.latest_risk_category, p.latest_readmission_status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "anonymized_diabetes_research_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Healthcare Researcher — Analytics & Population Health">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="Anonymized Encounters"
          value={stats?.total_patients || 0}
          subtitle="De-identified clinical cohort"
          icon={Database}
          color="blue"
        />
        <StatsCard
          title="30-Day Readmit Rate"
          value={`${stats?.readmission_rate_30_days || 0}%`}
          subtitle="Cohort readmission prevalence"
          icon={Activity}
          color="teal"
        />
        <StatsCard
          title="High Risk Sub-group"
          value={`${stats?.high_risk_count || 0}`}
          subtitle="High risk diabetes encounters"
          icon={Layers}
          color="purple"
        />
      </div>

      <div className="card research-export-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }}>
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0f766e' }}>
            Export Anonymized Research Dataset
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#115e59' }}>
            Compliant with HIPAA Privacy Rule — Personally Identifiable Information (PII) Stripped
          </p>
        </div>
        <button onClick={exportDatasetCSV} className="btn btn-primary" style={{ backgroundColor: '#0d9488', flexShrink: 0 }}>
          <Download size={16} />
          <span>Export Research CSV</span>
        </button>
      </div>

      <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Anonymized Patient Dataset
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.625rem' }}>Patient NBR</th>
                  <th style={{ padding: '0.625rem' }}>Race</th>
                  <th style={{ padding: '0.625rem' }}>Gender</th>
                  <th style={{ padding: '0.625rem' }}>Age</th>
                  <th style={{ padding: '0.625rem' }}>Risk Score</th>
                  <th style={{ padding: '0.625rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {anonymizedPatients.slice(0, 8).map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.625rem', fontFamily: 'monospace', fontWeight: '600' }}>#{p.patient_nbr}</td>
                    <td style={{ padding: '0.625rem' }}>{p.race}</td>
                    <td style={{ padding: '0.625rem' }}>{p.gender}</td>
                    <td style={{ padding: '0.625rem' }}>{p.age}</td>
                    <td style={{ padding: '0.625rem', fontWeight: '700' }}>{p.latest_risk_score}%</td>
                    <td style={{ padding: '0.625rem' }}>{p.latest_readmission_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Racial / Ethnic Demographic Breakdown
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Population health ethnicity representation
          </p>

          <div style={{ flex: 1, minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} name="Encounters" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
