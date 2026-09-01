import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FaCalendarAlt, FaSpinner, FaPhoneAlt, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FollowUpPlanning = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await API.get('/patients');
      if (res.data && res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load patient reviews schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleResolveFollowUp = (patId) => {
    toast.success('Follow-up review logged and scheduled.');
  };

  // Heuristic timeline generator for display
  const getFollowUpList = () => {
    return patients.map((p, idx) => {
      const isHigh = p.isReadmitted;
      const daysOffset = isHigh ? 3 : 10 + (idx % 5);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() + daysOffset);

      return {
        _id: p._id,
        patientId: p.patientId,
        name: `${p.firstName} ${p.lastName}`,
        ageGroup: p.ageGroup,
        riskLevel: isHigh ? 'High' : 'Medium',
        suggestedDate: reviewDate.toISOString().split('T')[0],
        action: isHigh ? 'Telehealth & Med Reconciliation' : 'Routine clinic follow-up',
        priority: isHigh ? 'High Priority' : 'Routine'
      };
    }).sort((a, b) => new Date(a.suggestedDate) - new Date(b.suggestedDate));
  };

  const followUps = getFollowUpList();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Scheduler</h1>
          <p className="page-subtitle">Coordinate post-discharge telehealth check-ins and clinical reviews</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '300px' }}>
          <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)', animation: 'spin 1s linear' }} />
        </div>
      ) : followUps.length === 0 ? (
        <div className="card flex-center" style={{ height: '200px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No transitional patient follow-ups scheduled</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Priority</th>
                <th>Risk Grade</th>
                <th>Target Date</th>
                <th>Transitional Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {followUps.map((f) => (
                <tr key={f._id} style={{ borderLeft: f.priority === 'High Priority' ? '4px solid var(--danger)' : 'none' }}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{f.patientId}</td>
                  <td style={{ fontWeight: 600 }}>{f.name} ({f.ageGroup} y/o)</td>
                  <td>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      color: f.priority === 'High Priority' ? 'var(--danger)' : 'var(--text-secondary)' 
                    }}>
                      {f.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${f.riskLevel.toLowerCase()}`}>
                      {f.riskLevel}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{f.suggestedDate}</td>
                  <td style={{ fontSize: '0.85rem' }}>{f.action}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
                        title="Call Patient"
                        onClick={() => toast.success(`Initiating telehealth dialer for ${f.name}...`)}
                      >
                        <FaPhoneAlt />
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', background: 'var(--success)' }}
                        title="Mark Complete"
                        onClick={() => handleResolveFollowUp(f._id)}
                      >
                        <FaCheck />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FollowUpPlanning;
