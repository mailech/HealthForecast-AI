import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiActivity } from 'react-icons/fi';
import api from '../services/api';
import { patientService } from '../services/patientService';
import { getPatientLabel } from '../utils/patientUtils';

export default function ClinicalRecommendations() {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSummary = () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    api.get(`/clinical/summary/${Number(patientId)}`)
      .then((response) => setSummary(response.data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    patientService.getAll()
      .then((items) => {
        setPatients(items);
        if (items[0]) setPatientId(String(items[0].id));
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Clinical Recommendations' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Clinical Recommendations</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">AI-generated clinical suggestions and discharge precautions.</p>
      </div>
      <div className="flex gap-2.5 mb-5">
        <select
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          className="input-field max-w-xs text-sm"
          aria-label="Patient"
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {getPatientLabel(patient)}
            </option>
          ))}
        </select>
        <button onClick={loadSummary} disabled={loading} className="btn-primary text-xs py-2 px-4 font-bold uppercase tracking-wider">
          {loading ? 'Loading...' : 'Load Insights'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mb-4 border border-red-200">{error}</p>}

      {summary && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base">{summary.patient_name}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">{summary.summary}</p>
            {summary.risk_score !== undefined && (
              <p className="text-xs font-bold text-zinc-900 dark:text-white mt-3">
                Risk Score: {summary.risk_score}% ({summary.risk_category || 'Unspecified'})
              </p>
            )}
          </div>

          {summary.insights && summary.insights.map((insight, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4">
              <div className="flex items-start gap-3">
                <FiCheckCircle size={16} className="text-zinc-700 dark:text-zinc-300 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{insight}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
