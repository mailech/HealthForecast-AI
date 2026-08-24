import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until authentication state is restored
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // User is not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Normalize backend role
  // Example:
  // "Doctor" -> "doctor"
  // "Hospital Admin" -> "hospital_admin"
  const userRole = user.role
    ?.toString()
    .toLowerCase()
    .replace(/\s+/g, '_');

  // Check role permission
  if (
    allowedRoles &&
    !allowedRoles.includes(userRole)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
}