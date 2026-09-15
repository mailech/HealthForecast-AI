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

  const isClinical = user?.role === 'Doctor' || user?.role === 'Hospital Administrator';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let statsData = null;

        // 1. Attempt to fetch administrative stats (allowed for Hospital Admin & SysAdmin)
        try {
          const statsRes = await api.get('/admin/stats');
          statsData = statsRes.data;
        } catch (adminErr) {
          // Expected 403 for non-admin roles (e.g. Doctor, Healthcare Researcher)
        }

        // 2. Fetch role-scoped predictions for clinical users (Doctor, Hospital Admin)
        if (isClinical) {
          const predsRes = await api.get('/predictions');
          const allPreds = predsRes.data || [];
          setRecentPredictions(allPreds.slice(0, 5));

          // If global admin stats was restricted (e.g. for Doctor), calculate stats dynamically from accessible predictions
          if (!statsData) {
            const uniquePatientIds = new Set(allPreds.map(p => p.patient_id));
            const highCriticalCount = allPreds.filter(p => p.risk_class === 'HIGH' || p.risk_class === 'CRITICAL').length;
            const lowModerateCount = allPreds.filter(p => p.risk_class === 'LOW' || p.risk_class === 'MEDIUM').length;

            statsData = {
              total_patients: uniquePatientIds.size,
              total_predictions: allPreds.length,
              high_risk_predictions: highCriticalCount,
              lower_risk_predictions: lowModerateCount,
              model_roc_auc: 0.658,
              model_recall: 0.59
            };
          }
        }

        // 3. Fetch aggregate stats for Healthcare Researcher if admin stats is restricted
        if (user?.role === 'Healthcare Researcher' && !statsData) {
          try {
            const researchRes = await api.get('/researcher/analytics');
            const data = researchRes.data;
            const dist = data.risk_distribution || {};
            const highCrit = (dist.HIGH || 0) + (dist.CRITICAL || 0);
            const lowMod = (dist.LOW || 0) + (dist.MEDIUM || 0);

            statsData = {
              total_patients: data.total_predictions || 0,
              total_predictions: data.total_predictions || 0,
              high_risk_predictions: highCrit,
              lower_risk_predictions: lowMod,
              model_roc_auc: data.model_roc_auc || 0.658,
              model_recall: data.model_recall || 0.59
            };
          } catch (researchErr) {
            console.error("Research overview fetch error:", researchErr);
          }
        }

        if (statsData) {
          setStats(statsData);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isClinical]);

  const roleGreeting = () => {
    switch (user?.role) {
      case 'Doctor': return 'Clinical Dashboard';
      case 'Hospital Administrator': return 'Administrative Dashboard';
      case 'Healthcare Researcher': return 'Research Overview';
      case 'System Administrator': return 'System Overview';
      default: return 'Dashboard';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{roleGreeting()}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Welcome back, {user?.full_name || user?.username} ({user?.role})
          </p>
        </div>
        {isClinical && (
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
            onClick={() => setActivePage('predict')}
          >
            <PlusCircle size={18} /> New Patient Prediction
          </button>
        )}
        {user?.role === 'Healthcare Researcher' && (
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
            onClick={() => setActivePage('research')}
          >
            📊 View Research Analytics
          </button>
        )}
        {user?.role === 'System Administrator' && (
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
            onClick={() => setActivePage('users')}
          >
            ⚙️ Manage Users
          </button>
        )}
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

      {/* Recent Activity Table - only for clinical roles */}
      {isClinical && (
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
                    <th>S.No</th>
                    <th>Patient Name</th>
                    <th>Readmission Probability</th>
                    <th>Risk Category</th>
                    <th>Evaluated By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPredictions.map((pred, idx) => (
                    <tr key={pred.id}>
                      <td>{idx + 1}</td>
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
      )}

      {/* Researcher quick hint */}
      {user?.role === 'Healthcare Researcher' && (
        <div className="form-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>🔬 Research Analytics</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Access anonymized and aggregated hospital readmission data for population health studies.
          </p>
          <button className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.5rem' }} onClick={() => setActivePage('research')}>
            Open Research Analytics →
          </button>
        </div>
      )}

      {/* SysAdmin quick hint */}
      {user?.role === 'System Administrator' && (
        <div className="form-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>⚙️ System Administration</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Manage users, monitor system health, and review audit logs.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.5rem' }} onClick={() => setActivePage('users')}>
              User Management →
            </button>
            <button className="btn-logout" style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setActivePage('audit')}>
              Audit Logs →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
