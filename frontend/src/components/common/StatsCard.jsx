import React from 'react';

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const iconColors = {
    blue: { bg: '#eff6ff', text: '#2563eb' },
    green: { bg: '#ecfdf5', text: '#10b981' },
    amber: { bg: '#fffbeb', text: '#f59e0b' },
    red: { bg: '#fef2f2', text: '#ef4444' },
    purple: { bg: '#f5f3ff', text: '#7c3aed' },
  };

  const style = iconColors[color] || iconColors.blue;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: style.bg,
            color: style.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          {value}
        </span>
        {trend && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: trend.startsWith('+') || trend.includes('High') ? 'var(--danger-500)' : 'var(--success-500)'
          }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
