import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import RiskBadge from '../components/common/RiskBadge';
import api from '../services/api';
import { patientService } from '../services/patientService';

export default function Reports() {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      setReport((await api.get(`/reports/${Number(patientId)}`)).data);
    } catch (requestError) {
      setReport(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    patientService.getAll().then((items) => { setPatients(items); if (items[0]) setPatientId(String(items[0].id)); }).catch((requestError) => setError(requestError.message));
  }, []);
  useEffect(() => { if (patientId) loadReport(); }, [patientId]);

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Forecast Reports' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Forecast Reports</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Patient reports generated from stored forecasts and clinical data</p>
      </div>
      <div className="flex gap-2 mb-6">
        <select value={patientId} onChange={(event) => setPatientId(event.target.value)} className="input-field max-w-xs" aria-label="Patient"><option value="">Select a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name} (#{patient.id})</option>)}</select>
        <button onClick={loadReport} disabled={loading} className="btn-primary">{loading ? 'Loading...' : 'Load Report'}</button>
      </div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {!report && !error && <p className="text-slate-500">Choose a patient to view a report.</p>}
      {report && <div className="space-y-5">
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div><h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{report.patient_name}</h2><p className="text-sm text-slate-500 mt-1">MRN {report.mrn} · {report.gender} · Age {report.age}</p></div>
            {report.risk_category && <RiskBadge level={report.risk_category.toLowerCase()} score={report.risk_score} />}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-5">{report.summary}</p>
          <dl className="grid sm:grid-cols-3 gap-4 mt-5 text-sm"><div><dt className="text-slate-400">Admission date</dt><dd className="font-medium mt-1">{report.admission_date || 'Not recorded'}</dd></div><div><dt className="text-slate-400">Prediction date</dt><dd className="font-medium mt-1">{report.prediction_date ? new Date(report.prediction_date).toLocaleString() : 'Not available'}</dd></div><div><dt className="text-slate-400">Model</dt><dd className="font-medium mt-1">{report.model_version || 'Not available'}</dd></div></dl>
        </section>
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6"><h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Clinical considerations</h2><ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">{report.insights.map((insight) => <li key={insight}>{insight}</li>)}</ul></section>
      </div>}
    </DashboardLayout>
  );
}
