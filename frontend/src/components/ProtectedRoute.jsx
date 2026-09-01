import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Verifying session credentials...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // User is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default dashboard for their role
    switch (user.role) {
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'hospital_admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'researcher':
        return <Navigate to="/researcher-dashboard" replace />;
      case 'system_admin':
        return <Navigate to="/sysadmin-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
