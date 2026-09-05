import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { History, RefreshCw, AlertCircle, Search } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/predictions?limit=100');
      setPredictions(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load prediction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = predictions.filter((p) =>
    p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.risk_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Prediction History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {user?.role === 'Doctor'
              ? 'Viewing predictions created by you.'
              : 'Viewing all hospital readmission predictions across clinical staff.'}
          </p>
        </div>

        <button
          className="btn-logout"
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={fetchHistory}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="form-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by patient name, risk class, or evaluator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading predictions...</p>
      ) : filtered.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No prediction records found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Readmission Probability</th>
                <th>Risk Classification</th>
                <th>Prediction Label</th>
                <th>Evaluated By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.patient_name}</td>
                  <td>
                    <strong>{p.risk_percentage}%</strong> ({p.probability})
                  </td>
                  <td>
                    <span className={`badge-risk ${p.risk_class}`}>{p.risk_class}</span>
                  </td>
                  <td>{p.prediction}</td>
                  <td>{p.created_by}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
