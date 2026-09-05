import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username / Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="doctor@hospital.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <h4>Demo Quick-Fill Accounts:</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            Pre-configured role accounts for immediate testing:
          </p>
          <div className="demo-btn-group">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoFill('doctor@hospital.com', 'doctor123')}
            >
              👨‍⚕️ Doctor Account
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoFill('admin@hospital.com', 'admin123')}
            >
              🏥 Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
