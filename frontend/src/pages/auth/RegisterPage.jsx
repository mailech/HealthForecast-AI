import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * @deprecated Registration page removed. All accounts must be provisioned via Admin User Management.
 */
export const RegisterPage = () => {
  return <Navigate to="/login" replace />;
};

export default RegisterPage;
