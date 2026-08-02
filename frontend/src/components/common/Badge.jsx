import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '600',
    borderRadius: '9999px',
    lineHeight: '1',
  };

  const sizes = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.35rem 0.75rem', fontSize: '0.8125rem' },
    lg: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
  };

  const variants = {
    default: { backgroundColor: '#f1f5f9', color: '#475569' },
    primary: { backgroundColor: '#dbeafe', color: '#1e40af' },
    success: { backgroundColor: '#ecfdf5', color: '#047857' },
    warning: { backgroundColor: '#fffbeb', color: '#b45309' },
    danger: { backgroundColor: '#fef2f2', color: '#b91c1c' },
    purple: { backgroundColor: '#f5f3ff', color: '#7c3aed' },
    teal: { backgroundColor: '#f0fdfa', color: '#0d9488' },
  };

  return (
    <span style={{ ...baseStyles, ...sizes[size], ...variants[variant] }}>
      {children}
    </span>
  );
};
