import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity, LogIn, AlertCircle, UserPlus } from 'lucide-react';

const VALID_ROLES = ["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"];

const extractErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(d => d.msg || (typeof d === 'object' ? JSON.stringify(d) : String(d))).join(', ');
    }
    if (typeof detail === 'object') return JSON.stringify(detail);
  }
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return fallback;
};

export default function LoginPage() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(cleanUsername, password);
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid username or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError('Please enter both username and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/register', {
        username: cleanUsername,
        email: cleanUsername.includes('@') ? cleanUsername : '',
        full_name: fullName.trim(),
        password,
        role
      });
      setSuccessMsg('Account created successfully! You can now sign in.');
      setIsRegister(false);
      setPassword('');
      setFullName('');
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed. Please check your details and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="nav-brand-icon" style={{ margin: '0 auto', width: 48, height: 48 }}>
            <Activity size={26} />
          </div>
          <h1>HealthForecast AI</h1>
          <p>Hospital Readmission Decision-Support System</p>
        </div>

        {error && (
          <div className="alert-box alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-box alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dr. Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Username / Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                {VALID_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (isRegister ? 'Creating Account...' : 'Authenticating...') : (
              <>
                {isRegister ? <><UserPlus size={18} /> Create Account</> : <><LogIn size={18} /> Sign In</>}
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccessMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {isRegister ? '← Back to Sign In' : "Don't have an account? Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
