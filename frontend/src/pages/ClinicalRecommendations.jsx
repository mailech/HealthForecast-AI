import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import { FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

import api from '../services/api';
import { patientService } from '../services/patientService';

const typeConfig = {
  critical: { icon: FiAlertTriangle, bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 text-purple-700', iconColor: 'text-purple-600' },
  high:     { icon: FiAlertTriangle, bg: 'bg-red-50 dark:bg-red-900/10',    border: 'border-red-200 dark:border-red-800',    badge: 'bg-red-100 text-red-700',    iconColor: 'text-red-500' },
  medium:   { icon: FiInfo,          bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', badge: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-500' },
  low:      { icon: FiCheckCircle,   bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-100 text-green-700', iconColor: 'text-green-600' },
};

export default function ClinicalRecommendations() {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const loadSummary = () => api.get(`/clinical/summary/${Number(patientId)}`).then((response) => setSummary(response.data)).catch((requestError) => setError(requestError.message));
  useEffect(() => { patientService.getAll().then((items) => { setPatients(items); if (items[0]) setPatientId(String(items[0].id)); }).catch((requestError) => setError(requestError.message)); }, []);

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Clinical Recommendations' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clinical Recommendations</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">AI-generated clinical action items based on patient risk scores</p>
      </div>
      <div className="flex gap-2 mb-5">
        <select value={patientId} onChange={(event) => setPatientId(event.target.value)} className="input-field max-w-xs" aria-label="Patient"><option value="">Select a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name} (#{patient.id})</option>)}</select>
        <button onClick={loadSummary} className="btn-primary">Load Insights</button>
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {summary && <div className="space-y-4">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-semibold text-slate-800">{summary.patient_name}</h3>
          <p className="text-sm text-slate-600 mt-2">{summary.summary}</p>
          {summary.risk_score !== undefined && <p className="text-sm font-semibold mt-3">Risk score: {summary.risk_score}% ({summary.risk_category})</p>}
        </div>
        {summary.insights.map((insight) => {
          const cfg = typeConfig[(summary.risk_category || 'low').toLowerCase()] || typeConfig.low;
          const Icon = cfg.icon;
          return (
            <div key={insight} className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 ${cfg.iconColor}`}><Icon size={20} /></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{insight}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>}
    </DashboardLayout>
  );
}
