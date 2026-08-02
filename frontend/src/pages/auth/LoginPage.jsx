import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Stethoscope, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      loginUser(data.user, data.access_token);

      const roleDashboards = {
        doctor: '/dashboard/doctor',
        hospital_admin: '/dashboard/admin',
        researcher: '/dashboard/researcher',
        system_admin: '/dashboard/sysadmin',
      };
      navigate(roleDashboards[data.user.role] || '/dashboard/doctor');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(demoEmail, 'Password123!');
      loginUser(data.user, data.access_token);

      const roleDashboards = {
        doctor: '/dashboard/doctor',
        hospital_admin: '/dashboard/admin',
        researcher: '/dashboard/researcher',
        system_admin: '/dashboard/sysadmin',
      };
      navigate(roleDashboards[data.user.role] || '/dashboard/doctor');
    } catch (err) {
      setError('Demo login failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--primary-600)',
            borderRadius: 'var(--radius-lg)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Stethoscope size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            HealthForecast <span style={{ color: 'var(--primary-600)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Hospital Readmission & Patient Risk Intelligence System
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Sign In to Platform
          </h2>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-50)',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-700)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor1@healthforecast.ai"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ marginTop: '2rem', pt: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Quick Role Demo Accounts (2 per role)
            </div>

            <div className="login-demo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('doctor1@healthforecast.ai')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                🩺 Doctor 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin1@healthforecast.ai')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                🏥 Admin 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('researcher1@healthforecast.ai')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                📊 Researcher 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sysadmin1@healthforecast.ai')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                ⚙️ SysAdmin 1
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Need an account? <Link to="/register" style={{ fontWeight: '600', color: 'var(--primary-600)' }}>Register Work Profile</Link>
        </div>
      </div>
    </div>
  );
};
