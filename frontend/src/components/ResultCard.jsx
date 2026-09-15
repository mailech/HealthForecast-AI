import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Clock, Lightbulb } from 'lucide-react';

export default function ResultCard({ result }) {
  if (!result) return null;

  const getIcon = () => {
    switch (result.risk_class) {
      case 'LOW':
        return <CheckCircle size={28} color="#15803d" />;
      case 'MEDIUM':
        return <AlertCircle size={28} color="#b45309" />;
      case 'HIGH':
      case 'CRITICAL':
        return <AlertTriangle size={28} color="#b91c1c" />;
      default:
        return <AlertCircle size={28} />;
    }
  };

  const impactColor = (impact) => {
    switch (impact) {
      case 'high': return '#b91c1c';
      case 'moderate': return '#b45309';
      default: return '#15803d';
    }
  };

  return (
    <div className={`result-card ${result.risk_class}`}>
      <div className="result-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {getIcon()}
          <div>
            <div className="result-title">Estimated 30-day readmission risk</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
              Patient: <strong>{result.patient_name || 'Anonymous'}</strong>
            </div>
          </div>
        </div>
        <div className="result-badge">
          {result.risk_class} RISK
        </div>
      </div>

      <div className="result-stat-row">
        <div>
          <div className="big-prob">{result.risk_percentage}%</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Readmission Probability ({result.probability})</div>
        </div>
        <div style={{ paddingLeft: '1.5rem', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{result.prediction}</div>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
            <Clock size={14} /> Evaluated: {result.created_at ? new Date(result.created_at).toLocaleString() : 'Just now'}
          </div>
        </div>
      </div>

      {/* Clinical Insights */}
      {result.clinical_insights && result.clinical_insights.length > 0 && (
        <div style={{
          marginTop: '1.25rem', padding: '1rem', borderRadius: '8px',
          background: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Lightbulb size={18} /> Clinical Insights & Recommendations
          </div>
          {result.clinical_insights.map((insight, idx) => (
            <div key={idx} style={{
              padding: '0.65rem 0.85rem', marginBottom: '0.5rem', borderRadius: '6px',
              background: 'rgba(255,255,255,0.5)', borderLeft: `3px solid ${impactColor(insight.impact)}`
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                <span style={{
                  display: 'inline-block', fontSize: '0.7rem', padding: '0.1rem 0.4rem',
                  borderRadius: '4px', marginRight: '0.5rem', fontWeight: 800,
                  background: `${impactColor(insight.impact)}15`, color: impactColor(insight.impact)
                }}>
                  {insight.impact.toUpperCase()}
                </span>
                {insight.factor}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>{insight.recommendation}</div>
            </div>
          ))}
        </div>
      )}

      <div className="result-disclaimer">
        ⚠️ <strong>Disclaimer:</strong> {result.note || "This prediction is intended for academic decision-support demonstration and is not a medical diagnosis."}
      </div>
    </div>
  );
}
