import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import RiskBadge from '../components/common/RiskBadge';
import api from '../services/api';
import { patientService } from '../services/patientService';
import { getPatientLabel, getPatientFullName, getPatientMRN } from '../utils/patientUtils';
import { generateHospitalPDFReport } from '../utils/pdfReportGenerator';
import {
  FiDownload,
  FiFileText,
  FiUser,
  FiCalendar,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiShield,
} from 'react-icons/fi';

export default function Reports() {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const loadReport = async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/reports/${Number(patientId)}`);
      setReport(response.data);
    } catch (requestError) {
      setReport(null);
      setError('Unable to load the patient report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    patientService
      .getAll()
      .then((items) => {
        setPatients(items);
        if (items && items[0]) {
          setPatientId(String(items[0].id));
        }
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (patientId) {
      loadReport();
    }
  }, [patientId]);

  const generatePDF = () => {
    if (!report) return;
    setPdfGenerating(true);
    try {
      generateHospitalPDFReport(report);
    } catch (pdfErr) {
      console.error('PDF Generation Error:', pdfErr);
      setError('Unable to generate the PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const getRiskCategoryStyle = (category) => {
    switch (category?.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Forecast Reports' }]} />

      {/* HEADER WITH GENERATE PDF ON FAR RIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Forecast Reports</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Generate and download a professional patient report.
          </p>
        </div>

        <div>
          <button
            onClick={generatePDF}
            disabled={!report || loading || pdfGenerating}
            className={`btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              !report || loading || pdfGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiDownload size={15} />
            {pdfGenerating ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </div>
      </div>

      {/* PATIENT SELECTION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Select Patient
          </label>
          <select
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            className="input-field text-sm w-full"
            aria-label="Patient"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {getPatientLabel(patient)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={loadReport}
            disabled={loading || !patientId}
            className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider w-full sm:w-auto"
          >
            {loading ? 'Loading...' : 'Load Report'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl mb-6 border border-red-200 dark:border-red-900/50">
          {error}
        </p>
      )}

      {/* EMPTY STATES */}
      {!patientId && !loading && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-xs">
          <FiFileText size={36} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Select a patient to generate a report.</p>
          <p className="text-xs text-zinc-400 mt-1">Choose a patient from the dropdown above to inspect their clinical forecast report.</p>
        </div>
      )}

      {patientId && !report && !loading && !error && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-xs">
          <FiAlertTriangle size={36} className="mx-auto text-amber-400 mb-3" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No prediction available for this patient.</p>
          <p className="text-xs text-zinc-400 mt-1">Run a risk prediction for this patient on the Risk Analyzer page first.</p>
        </div>
      )}

      {/* REPORT PREVIEW */}
      {report && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">CARE PULSE AI</p>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">PATIENT FORECAST REPORT</h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">Healthcare Intelligence Platform</p>
              </div>
              <div className="text-left sm:text-right text-xs text-indigo-200">
                <p><span className="font-semibold text-white">Generated:</span> {new Date().toLocaleString()}</p>
                <p className="mt-0.5"><span className="font-semibold text-white">Report ID:</span> RPT-{report.patient_id}-{Date.now().toString().slice(-4)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* 1. PATIENT INFORMATION */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                <FiUser className="text-indigo-600 dark:text-indigo-400" size={14} /> PATIENT INFORMATION
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-zinc-400 uppercase font-semibold">Patient Name</p>
                  <p className="font-bold text-zinc-900 dark:text-white mt-1 text-sm">{report.patient_name}</p>
                </div>
                <div>
                  <p className="text-zinc-400 uppercase font-semibold">Patient ID</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">#{report.patient_id}</p>
                </div>
                <div>
                  <p className="text-zinc-400 uppercase font-semibold">MRN</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{report.mrn || '—'}</p>
                </div>
                <div>
                  <p className="text-zinc-400 uppercase font-semibold">Gender / Age</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{report.gender || '—'} / {report.age ?? '—'} yrs</p>
                </div>
                <div>
                  <p className="text-zinc-400 uppercase font-semibold">Diagnosis</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{report.diagnosis || 'Standard Observation'}</p>
                </div>
                <div>
                  <p className="text-zinc-400 uppercase font-semibold">Department</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{report.department || 'General Care'}</p>
                </div>
                <div>
                  <p className="text-zinc-400 uppercase font-semibold">Admission Date</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{report.admission_date || 'Not recorded'}</p>
                </div>
              </div>
            </section>

            {/* 2. RISK ASSESSMENT */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                <FiShield className="text-indigo-600 dark:text-indigo-400" size={14} /> RISK ASSESSMENT
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 items-center">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${getRiskCategoryStyle(report.risk_category)}`}>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Risk Category</p>
                    <p className="text-lg font-bold capitalize mt-0.5">{report.risk_category || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Risk Score</p>
                    <p className="text-lg font-bold mt-0.5">{report.risk_score !== null && report.risk_score !== undefined ? `${report.risk_score}%` : 'N/A'}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1 sm:col-span-2 pl-0 sm:pl-4">
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{report.summary}</p>
                  <div className="flex gap-6 mt-3 text-zinc-400 text-[11px]">
                    <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Prediction Date:</span> {report.prediction_date ? new Date(report.prediction_date).toLocaleString() : 'N/A'}</p>
                    <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Model Version:</span> {report.model_version || 'patient-risk-model-v1.0.0'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. CLINICAL RECOMMENDATIONS */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3 flex items-center gap-2">
                <FiActivity className="text-indigo-600 dark:text-indigo-400" size={14} /> CLINICAL RECOMMENDATIONS & INSIGHTS
              </h3>
              {report.insights && report.insights.length > 0 ? (
                <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                  {report.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <FiCheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-400 italic">No clinical recommendations available for this prediction.</p>
              )}
            </section>

            {/* 4. TREATMENT INFORMATION */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3 flex items-center gap-2">
                <FiFileText className="text-indigo-600 dark:text-indigo-400" size={14} /> TREATMENT INFORMATION
              </h3>
              {report.treatment && (report.treatment.diagnosis || report.treatment.treatment_plan) ? (
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
                  {report.treatment.diagnosis && (
                    <p><span className="font-bold text-zinc-900 dark:text-white">Diagnosis: </span><span className="text-zinc-700 dark:text-zinc-300">{report.treatment.diagnosis}</span></p>
                  )}
                  {report.treatment.treatment_plan && (
                    <p><span className="font-bold text-zinc-900 dark:text-white">Treatment Plan: </span><span className="text-zinc-700 dark:text-zinc-300">{report.treatment.treatment_plan}</span></p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No treatment information available.</p>
              )}
            </section>

            {/* 5. APPOINTMENTS INFORMATION */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3 flex items-center gap-2">
                <FiCalendar className="text-indigo-600 dark:text-indigo-400" size={14} /> UPCOMING / RECENT APPOINTMENTS
              </h3>
              {report.appointments && report.appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold text-zinc-500 dark:text-zinc-400">Doctor</th>
                        <th className="px-3 py-2 text-left font-bold text-zinc-500 dark:text-zinc-400">Date & Time</th>
                        <th className="px-3 py-2 text-left font-bold text-zinc-500 dark:text-zinc-400">Status</th>
                        <th className="px-3 py-2 text-left font-bold text-zinc-500 dark:text-zinc-400">Reminder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {report.appointments.map((appt) => (
                        <tr key={appt.id}>
                          <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{appt.doctor_name}</td>
                          <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{appt.appointment_date} · {appt.appointment_time}</td>
                          <td className="px-3 py-2 capitalize font-semibold text-zinc-700 dark:text-zinc-300">{appt.status}</td>
                          <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{appt.reminder_timing || 'Standard'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No upcoming or recent appointments recorded.</p>
              )}
            </section>

            {/* REPORT METADATA FOOTER */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Report generated by CarePulse AI Platform</p>
              <p>Model Version: {report.model_version || 'patient-risk-model-v1.0.0'}</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
