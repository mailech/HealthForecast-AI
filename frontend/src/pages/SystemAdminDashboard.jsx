import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import { 
  FaUsers, 
  FaShieldAlt, 
  FaCog, 
  FaUserPlus, 
  FaToggleOn, 
  FaToggleOff, 
  FaTrash, 
  FaSpinner, 
  FaSync, 
  FaLock, 
  FaClock, 
  FaNetworkWired,
  FaFileInvoice
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const SystemAdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Decide active view based on path
  let activePanel = 'users'; // default
  if (path.includes('audit-logs')) activePanel = 'audit';
  else if (path.includes('model-control')) activePanel = 'model';

  return (
    <div className="page-container">
      {activePanel === 'users' && <UsersManagementPanel />}
      {activePanel === 'audit' && <AuditLogsPanel />}
      {activePanel === 'model' && <ModelControlPanel />}
    </div>
  );
};

/* ==========================================================================
   USERS MANAGEMENT PANEL
   ========================================================================== */
const UsersManagementPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      if (res.data && res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await API.put(`/users/${id}/status`, { isActive: !currentStatus });
      if (res.data && res.data.success) {
        toast.success(`User status updated successfully!`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to alter user status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await API.delete(`/users/${id}`);
      if (res.data && res.data.success) {
        toast.success('User account deleted');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleAddUserSubmit = async (data) => {
    try {
      const res = await API.post('/auth/register', data);
      if (res.data && res.data.success) {
        toast.success(`User ${data.name} registered successfully!`);
        setShowAddModal(false);
        reset();
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts Management</h1>
          <p className="page-subtitle">Configure credentials, roles, and administrative statuses for clinicians</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FaUserPlus />
          <span>Register Staff Account</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '300px' }}>
          <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Specialty</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>{u.role.replace('_', ' ')}</td>
                  <td>{u.specialty || 'N/A'}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-low' : 'badge-high'}`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: u.isActive ? 'var(--success)' : 'var(--text-muted)' }}
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                        title={u.isActive ? 'Suspend User' : 'Activate User'}
                      >
                        {u.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', background: 'white', position: 'relative' }}>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Register Staff Account</h2>
            
            <form onSubmit={handleSubmit(handleAddUserSubmit)}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" {...register('name', { required: 'Required' })} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" {...register('email', { required: 'Required' })} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" {...register('password', { required: 'Required', minLength: 6 })} />
              </div>

              <div className="form-group">
                <label className="form-label">System Role</label>
                <select className="form-control" {...register('role', { required: 'Required' })}>
                  <option value="doctor">Doctor</option>
                  <option value="hospital_admin">Hospital Administrator</option>
                  <option value="researcher">Healthcare Researcher</option>
                  <option value="system_admin">System Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specialty (Optional - Doctors Only)</label>
                <input type="text" className="form-control" placeholder="e.g. Cardiology" {...register('specialty')} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/* ==========================================================================
   AUDIT LOGS PANEL
   ========================================================================== */
const AuditLogsPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await API.get('/users/audit-logs');
      if (res.data && res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load system audit trails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Security Logs</h1>
          <p className="page-subtitle">Inspect audit log streams, auth activities and clinical queries</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs}>
          <FaSync />
          <span>Refresh Feed</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '300px' }}>
          <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action Code</th>
                <th>Network IP</th>
                <th>Inspect Trail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    <FaClock style={{ marginRight: '0.4rem', color: 'var(--text-muted)' }} />
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <strong>{l.userEmail}</strong>
                    {l.user && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{l.user.role}</div>}
                  </td>
                  <td>
                    <span className="badge badge-medium" style={{ fontFamily: 'monospace', fontSize: '0.75rem', borderRadius: '4px' }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <FaNetworkWired style={{ marginRight: '0.4rem', color: 'var(--text-muted)' }} />
                    {l.ipAddress}
                  </td>
                  <td style={{ fontSize: '0.9rem' }}>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   ML MODEL CONTROL PANEL
   ========================================================================== */
const ModelControlPanel = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const { register, handleSubmit, setValue } = useForm();

  const fetchModel = async () => {
    try {
      const res = await API.get('/model/metrics');
      if (res.data && res.data.success) {
        setModel(res.data.data);
        setValue('epochs', res.data.data.epochs);
        setValue('learningRate', res.data.data.learningRate);
        setValue('scalePosWeight', res.data.data.scalePosWeight || 7.96);
        setValue('imbalanceMethod', res.data.data.imbalanceMethod || 'scale_pos_weight');
        if (res.data.data.status === 'Training') {
          setTraining(true);
        } else {
          setTraining(false);
        }
      }
    } catch (err) {
      toast.error('Failed to load AI model metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModel();
  }, []);

  // Poll model status if training
  useEffect(() => {
    let timer;
    if (training) {
      timer = setInterval(() => {
        fetchModel();
      }, 3000); // Check status every 3s
    }
    return () => clearInterval(timer);
  }, [training]);

  const handleRetrain = async () => {
    setTraining(true);
    try {
      const res = await API.post('/model/retrain');
      if (res.data && res.data.success) {
        toast.success('AI Model training pipeline activated!');
        setModel(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Model training startup failed');
      setTraining(false);
    }
  };

  const handleConfigSubmit = async (data) => {
    try {
      const res = await API.post('/model/configure', data);
      if (res.data && res.data.success) {
        toast.success('Hyperparameters updated successfully!');
        setModel(res.data.data);
      }
    } catch (err) {
      toast.error('Parameter updates failed');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '300px' }}>
        <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Predictive Operations (MLOps)</h1>
          <p className="page-subtitle">Monitor classification metrics, configure weights, and re-train models</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Model status */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pipeline Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${model?.status === 'Training' ? 'badge-medium' : 'badge-low'}`} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
                {model?.status}
              </span>
              {model?.status === 'Training' && <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Model Signature: {model?.name}
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1.5rem', width: '100%' }}
            disabled={model?.status === 'Training'}
            onClick={handleRetrain}
          >
            <FaSync />
            <span>Retrain Classifier</span>
          </button>
        </div>

        {/* Model classification scores focusing on ROC-AUC & Recall */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Clinical Performance Matrix (ROC-AUC & Recall Focused)</h3>
            <span className="badge badge-high" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
              Optimized for Positive Class Imbalance (~11% Readmissions)
            </span>
          </div>

          {/* Primary Clinical KPIs */}
          <div className="grid-3" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROC-AUC Score</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{model?.auc}</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Primary Discriminative Index</span>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sensitivity / Recall</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>{model?.recall}%</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>High-Risk Catch Rate</span>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class Balance Weight</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>{model?.scalePosWeight || 7.96}x</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>scale_pos_weight Ratio</span>
            </div>
          </div>
          
          {/* Secondary Operational Metrics */}
          <div className="grid-3" style={{ textAlign: 'center' }}>
            <div style={{ padding: '0.5rem', background: 'var(--bg-app)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Precision</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{model?.precision}%</div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--bg-app)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>F1-Score</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{model?.f1Score}%</div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--bg-app)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Raw Accuracy</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{model?.accuracy}%</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Deceptive in imbalanced sets</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3">
        {/* Model tuning form */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Hyperparameters & Weights</h3>
          <form onSubmit={handleSubmit(handleConfigSubmit)}>
            <div className="form-group">
              <label className="form-label">Positive Class Weight (scale_pos_weight)</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-control" 
                {...register('scalePosWeight')} 
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Compensates ~7.96:1 negative-to-positive ratio
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Imbalance Handling Strategy</label>
              <select className="form-control" {...register('imbalanceMethod')}>
                <option value="scale_pos_weight">XGBoost scale_pos_weight (Loss Penalty)</option>
                <option value="SMOTE">SMOTE (Synthetic Minority Over-sampling)</option>
                <option value="Hybrid">Hybrid (SMOTE + Cost-Sensitive Weighting)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Learning Rate (Eta)</label>
              <input 
                type="number" 
                step="0.001" 
                className="form-control" 
                {...register('learningRate')} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Training Iterations / Estimators</label>
              <input 
                type="number" 
                className="form-control" 
                {...register('epochs')} 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Apply Hyperparameters
            </button>
          </form>
        </div>

        {/* Data Preprocessing & Missing Values */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Data Preprocessing Specs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.6rem', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Weight (Missing: 96.8%)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Midpoint conversion + <code>weight_was_missing</code> flag + Median/KNN imputation (75.0 kg).
              </div>
            </div>

            <div style={{ padding: '0.6rem', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Payer Code (Missing: 39.5%)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Mode Imputation (<code>'MC'</code> - Medicare) + Categorical label encoding.
              </div>
            </div>

            <div style={{ padding: '0.6rem', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Medical Specialty (Missing: 49.0%)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Mode Imputation (<code>'InternalMedicine'</code>) + Top-10 grouping & specialty binning.
              </div>
            </div>

            <div style={{ padding: '0.6rem', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Missing Code Handling</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Explicit replacement of all <code>'?'</code> sentinel tokens across 50 features.
              </div>
            </div>
          </div>
        </div>

        {/* Dataset statistics */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Dataset Cohort Specs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Corpus</span>
              <strong>Diabetes 130-US Hospitals</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Encounters</span>
              <strong>{model?.datasetSize} Rows</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>30-Day Readmission</span>
              <strong style={{ color: 'var(--danger)' }}>11.16% (Minority Class)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Negative Class Ratio</span>
              <strong>88.84% (8.0 to 1)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Calibration Date</span>
              <strong>{model?.lastTrained}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
