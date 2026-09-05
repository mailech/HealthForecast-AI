import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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

      <div className="result-disclaimer">
        ⚠️ <strong>Disclaimer:</strong> {result.note || "This prediction is intended for academic decision-support demonstration and is not a medical diagnosis."}
      </div>
    </div>
  );
}
