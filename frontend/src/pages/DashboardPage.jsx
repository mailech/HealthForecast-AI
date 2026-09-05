import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ModelBanner from '../components/ModelBanner';
import { Users, FileSpreadsheet, AlertTriangle, ShieldCheck, ArrowRight, PlusCircle } from 'lucide-react';

export default function DashboardPage({ setActivePage }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_patients: 0,
    total_predictions: 0,
    high_risk_predictions: 0,
    lower_risk_predictions: 0,
    model_roc_auc: 0.658,
    model_recall: 0.59
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, predsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/predictions?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentPredictions(predsRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Clinical Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Welcome back, {user?.username} ({user?.role})
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
          onClick={() => setActivePage('predict')}
        >
          <PlusCircle size={18} /> New Patient Prediction
        </button>
      </div>

      <ModelBanner />

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-label">Total Patients</div>
          <div className="stat-value">{loading ? '...' : stats.total_patients}</div>
          <div className="stat-desc">Unique patient records saved</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Predictions</div>
          <div className="stat-value">{loading ? '...' : stats.total_predictions}</div>
          <div className="stat-desc">Inference runs performed</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label" style={{ color: '#b91c1c' }}>High / Critical Risk</div>
          <div className="stat-value" style={{ color: '#b91c1c' }}>{loading ? '...' : stats.high_risk_predictions}</div>
          <div className="stat-desc">&ge; 50% readmission likelihood</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label" style={{ color: '#047857' }}>Low / Moderate Risk</div>
          <div className="stat-value" style={{ color: '#047857' }}>{loading ? '...' : stats.lower_risk_predictions}</div>
          <div className="stat-desc">&lt; 50% readmission likelihood</div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="form-card">
        <div className="section-header">
          <h2>Recent Predictions</h2>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            onClick={() => setActivePage('history')}
          >
            View all <ArrowRight size={16} />
          </button>
        </div>

        {recentPredictions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No predictions made yet. Click "New Patient Prediction" to run your first evaluation.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Readmission Probability</th>
                  <th>Risk Category</th>
                  <th>Evaluated By</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.map((pred) => (
                  <tr key={pred.id}>
                    <td style={{ fontWeight: 600 }}>{pred.patient_name}</td>
                    <td>
                      <strong>{pred.risk_percentage}%</strong> ({pred.probability})
                    </td>
                    <td>
                      <span className={`badge-risk ${pred.risk_class}`}>{pred.risk_class}</span>
                    </td>
                    <td>{pred.created_by}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(pred.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
