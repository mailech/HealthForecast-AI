import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, RefreshCw, AlertCircle } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hospital Patient Records</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Administrative registry of patients stored in local SQLite database.
          </p>
        </div>

        <button className="btn-logout" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={fetchPatients}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading patient records...</p>
      ) : patients.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No patient records available yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age Bracket</th>
                <th>Gender</th>
                <th>Race</th>
                <th>Stay (Days)</th>
                <th>Medications</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.patient_name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.race}</td>
                  <td>{p.time_in_hospital} days</td>
                  <td>{p.num_medications}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}
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
