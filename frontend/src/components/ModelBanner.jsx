import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function ModelBanner() {
  return (
    <div className="model-banner">
      <div className="model-banner-text">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <ShieldCheck size={18} color="#0284c7" />
          <h3>Hospital Readmission Decision-Support Engine</h3>
        </div>
        <p>
          Trained on the Diabetes 130-US Hospitals (1999–2008) dataset using XGBoost.
        </p>
      </div>

      <div className="model-metrics">
        <div className="metric-pill">
          <span>MEASURED ROC-AUC</span>
          <strong>~0.658</strong>
        </div>
        <div className="metric-pill">
          <span>POSITIVE RECALL</span>
          <strong>~0.59</strong>
        </div>
      </div>
    </div>
  );
}
