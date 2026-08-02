import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  const roleDashboards = {
    doctor: '/dashboard/doctor',
    hospital_admin: '/dashboard/admin',
    researcher: '/dashboard/researcher',
    system_admin: '/dashboard/sysadmin',
  };

  const userDashboard = user ? roleDashboards[user.role] : '/login';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="card" style={{ maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--danger-50)',
          color: 'var(--danger-500)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Your user account role ({user?.role?.replace('_', ' ')}) does not have permission to access this module under platform Role-Based Access Control (RBAC).
        </p>
        <Link to={userDashboard} className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Your Authorized Dashboard
        </Link>
      </div>
    </div>
  );
};
