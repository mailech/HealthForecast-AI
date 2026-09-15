import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, Activity, Users, RefreshCw } from 'lucide-react';

export default function ResearchDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/researcher/analytics');
      setAnalytics(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load research analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading research analytics...</p>;
  if (error) return <div className="alert-box alert-error">{error}</div>;
  if (!analytics) return null;

  const riskColors = { LOW: '#15803d', MEDIUM: '#b45309', HIGH: '#c2410c', CRITICAL: '#b91c1c' };
  const totalRisk = Object.values(analytics.risk_distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🔬 Research Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Anonymized, aggregated hospital readmission data for healthcare research and population health studies.
          </p>
        </div>
        <button className="btn-logout" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={fetchAnalytics}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-label">Total Predictions</div>
          <div className="stat-value">{analytics.total_predictions}</div>
          <div className="stat-desc">Inference runs in dataset</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Probability</div>
          <div className="stat-value">{(analytics.avg_probability * 100).toFixed(1)}%</div>
          <div className="stat-desc">Mean readmission probability</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label" style={{ color: '#b91c1c' }}>Readmission Rate</div>
          <div className="stat-value" style={{ color: '#b91c1c' }}>{analytics.readmission_rate}%</div>
          <div className="stat-desc">Predictions ≥ 50% threshold</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="stat-label" style={{ color: '#0369a1' }}>Model ROC-AUC</div>
          <div className="stat-value" style={{ color: '#0369a1' }}>{analytics.model_roc_auc}</div>
          <div className="stat-desc">Recall: {analytics.model_recall}</div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="form-card">
        <div className="section-header"><h2>Risk Classification Distribution</h2></div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(analytics.risk_distribution).map(([key, count]) => {
            const pct = ((count / totalRisk) * 100).toFixed(1);
            return (
              <div key={key} style={{
                flex: '1 1 120px', padding: '1.25rem', borderRadius: '10px',
                background: `${riskColors[key]}10`, border: `1px solid ${riskColors[key]}30`, textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: riskColors[key] }}>{count}</div>
                <div style={{ fontWeight: 700, color: riskColors[key], fontSize: '0.85rem' }}>{key}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demographics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Age Groups */}
        <div className="form-card">
          <div className="section-header"><h2>Age Group Distribution</h2></div>
          {Object.keys(analytics.age_group_distribution).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No age data available yet.</p>
          ) : (
            <div>
              {Object.entries(analytics.age_group_distribution).sort().map(([age, count]) => (
                <div key={age} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600 }}>{age}</span>
                  <span className="badge-risk LOW" style={{ minWidth: '40px', textAlign: 'center' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gender Distribution */}
        <div className="form-card">
          <div className="section-header"><h2>Gender Distribution</h2></div>
          {Object.keys(analytics.gender_distribution).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No gender data available yet.</p>
          ) : (
            <div>
              {Object.entries(analytics.gender_distribution).map(([gender, count]) => (
                <div key={gender} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600 }}>{gender}</span>
                  <span className="badge-risk MEDIUM" style={{ minWidth: '40px', textAlign: 'center' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Diagnoses */}
        <div className="form-card">
          <div className="section-header"><h2>Primary Diagnosis Groups</h2></div>
          {Object.keys(analytics.top_diagnosis_groups).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No diagnosis data available yet.</p>
          ) : (
            <div>
              {Object.entries(analytics.top_diagnosis_groups).sort((a, b) => b[1] - a[1]).map(([diag, count]) => (
                <div key={diag} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600 }}>{diag}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
        All data is anonymized and aggregated for research purposes. No personally identifiable information (PII) is exposed.
      </div>
    </div>
  );
}
