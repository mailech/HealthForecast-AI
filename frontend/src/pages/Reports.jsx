import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import RiskBadge from '../components/common/RiskBadge';
import api from '../services/api';
import { patientService } from '../services/patientService';
import { getPatientLabel, getPatientFullName, getPatientMRN } from '../utils/patientUtils';
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
      const doc = new jsPDF();
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 18;

      // Primary Blue Accent Top Bar
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 5, 'F');

      // Title & Subtitle
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('CARE PULSE AI', 14, y);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('HEALTHCARE MANAGEMENT PLATFORM', 14, y + 5);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('PATIENT FORECAST REPORT', pageWidth - 14, y + 2, { align: 'right' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${timeStr}`, pageWidth - 14, y + 7, { align: 'right' });

      y += 14;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;

      const drawSectionHeader = (title) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, pageWidth - 28, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(title.toUpperCase(), 18, y + 5);
        y += 12;
      };

      // 1. PATIENT INFORMATION
      drawSectionHeader('Patient Information');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      const col1 = 18;
      const col2 = 110;

      doc.setFont('helvetica', 'bold');
      doc.text('Patient Name:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.patient_name || '—'}`, col1 + 28, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Patient ID:', col2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`#${report.patient_id}`, col2 + 24, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.text('MRN:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.mrn || '—'}`, col1 + 28, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Gender / Age:', col2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.gender || '—'} / ${report.age ?? '—'} yrs`, col2 + 24, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.text('Department:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.department || 'General Care'}`, col1 + 28, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Admission Date:', col2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.admission_date || 'Not recorded'}`, col2 + 24, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.diagnosis || 'Standard Observation'}`, col1 + 28, y);
      y += 10;

      // 2. MEDICAL REPORTS HISTORY
      drawSectionHeader('Medical Reports Log');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      if (report.medical_reports && report.medical_reports.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(248, 250, 252);
        doc.rect(col1, y, pageWidth - 36, 6, 'F');
        doc.text('File Name', col1 + 2, y + 4.5);
        doc.text('Uploaded Date', col1 + 80, y + 4.5);
        doc.text('Type', col1 + 130, y + 4.5);
        doc.text('Status', col1 + 155, y + 4.5);
        y += 8;
        doc.setFont('helvetica', 'normal');
        report.medical_reports.forEach((mr) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(mr.file_name || '—', col1 + 2, y);
          doc.text(mr.created_at ? new Date(mr.created_at).toLocaleDateString() : '—', col1 + 80, y);
          doc.text((mr.file_type || '').toUpperCase(), col1 + 130, y);
          doc.text('Analyzed', col1 + 155, y);
          y += 5;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('No medical reports recorded for this patient.', col1, y);
        y += 6;
      }
      y += 4;

      // 3. RISK ASSESSMENT & KEY MODEL INPUTS
      drawSectionHeader('Risk Assessment & Key Model Inputs');

      const cat = (report.risk_category || 'N/A').toUpperCase();
      const score = report.risk_score !== null && report.risk_score !== undefined ? `${report.risk_score}%` : 'N/A';

      let rBg = [239, 246, 255];
      let rText = [29, 78, 216];
      if (cat === 'HIGH') {
        rBg = [254, 242, 242];
        rText = [185, 28, 28];
      } else if (cat === 'MEDIUM') {
        rBg = [254, 243, 199];
        rText = [180, 83, 9];
      } else if (cat === 'LOW') {
        rBg = [236, 253, 245];
        rText = [4, 120, 87];
      }

      doc.setFillColor(...rBg);
      doc.roundedRect(col1, y, 80, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...rText);
      doc.text(`RISK CATEGORY: ${cat}`, col1 + 4, y + 6);
      doc.setFontSize(9);
      doc.text(`Readmission Risk Score: ${score}`, col1 + 4, y + 11);

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Prior Admissions:', col2, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.prior_admissions !== null && report.prior_admissions !== undefined ? report.prior_admissions : 'N/A'}`, col2 + 28, y + 4);

      doc.setFont('helvetica', 'bold');
      doc.text('Length of Stay:', col2, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.length_of_stay !== null && report.length_of_stay !== undefined ? `${report.length_of_stay} days` : 'N/A'}`, col2 + 28, y + 10);
      y += 20;

      // 4. PREDICTION RISK HISTORY
      drawSectionHeader('Risk Assessment History');
      if (report.risk_history && report.risk_history.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(248, 250, 252);
        doc.rect(col1, y, pageWidth - 36, 6, 'F');
        doc.text('Assessment Date', col1 + 2, y + 4.5);
        doc.text('Risk Category', col1 + 60, y + 4.5);
        doc.text('Score', col1 + 105, y + 4.5);
        doc.text('Prior Admissions', col1 + 130, y + 4.5);
        doc.text('Length of Stay', col1 + 160, y + 4.5);
        y += 8;

        doc.setFont('helvetica', 'normal');
        report.risk_history.forEach((rh) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(rh.date ? new Date(rh.date).toLocaleDateString() : '—', col1 + 2, y);
          doc.text((rh.risk_category || '').toUpperCase(), col1 + 60, y);
          doc.text(`${rh.risk_score}%`, col1 + 105, y);
          doc.text(rh.prior_admissions !== null && rh.prior_admissions !== undefined ? String(rh.prior_admissions) : 'N/A', col1 + 130, y);
          doc.text(rh.length_of_stay !== null && rh.length_of_stay !== undefined ? `${rh.length_of_stay} d` : 'N/A', col1 + 160, y);
          y += 5;
        });
      } else {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.text('No historical prediction records found.', col1, y);
        y += 6;
      }
      y += 4;

      // 3. CLINICAL RECOMMENDATIONS & INSIGHTS
      drawSectionHeader('Clinical Recommendations & Insights');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      if (report.insights && report.insights.length > 0) {
        report.insights.forEach((insight) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text('•', col1, y);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(insight, pageWidth - 42);
          doc.text(lines, col1 + 5, y);
          y += lines.length * 4.5 + 2;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('No clinical recommendations available for this prediction.', col1, y);
        y += 6;
      }
      y += 4;

      // 4. TREATMENT INFORMATION
      drawSectionHeader('Treatment Information');
      doc.setFontSize(8.5);
      if (report.treatment && (report.treatment.diagnosis || report.treatment.treatment_plan)) {
        if (report.treatment.diagnosis) {
          doc.setFont('helvetica', 'bold');
          doc.text('Diagnosis:', col1, y);
          doc.setFont('helvetica', 'normal');
          doc.text(report.treatment.diagnosis, col1 + 25, y);
          y += 6;
        }
        if (report.treatment.treatment_plan) {
          doc.setFont('helvetica', 'bold');
          doc.text('Treatment Plan:', col1, y);
          y += 5;
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(report.treatment.treatment_plan, pageWidth - 36);
          doc.text(lines, col1, y);
          y += lines.length * 4.5 + 2;
        }
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('No treatment information available.', col1, y);
        y += 6;
      }
      y += 4;

      // 5. APPOINTMENT INFORMATION
      drawSectionHeader('Upcoming / Recent Appointments');
      if (report.appointments && report.appointments.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(248, 250, 252);
        doc.rect(col1, y, pageWidth - 36, 6, 'F');
        doc.text('Doctor', col1 + 2, y + 4.5);
        doc.text('Date & Time', col1 + 60, y + 4.5);
        doc.text('Status', col1 + 110, y + 4.5);
        doc.text('Reminder', col1 + 140, y + 4.5);
        y += 8;

        doc.setFont('helvetica', 'normal');
        report.appointments.forEach((appt) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(appt.doctor_name || '—', col1 + 2, y);
          doc.text(`${appt.appointment_date} ${appt.appointment_time}`, col1 + 60, y);
          doc.text((appt.status || '').toUpperCase(), col1 + 110, y);
          doc.text(appt.reminder_timing || 'Standard', col1 + 140, y);
          y += 5;
        });
      } else {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('No upcoming or recent appointments recorded.', col1, y);
        y += 6;
      }

      // Page numbers footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.line(14, 282, pageWidth - 14, 282);
        doc.text('CarePulse AI Healthcare Management Platform — Confidential Medical Forecast Report', 14, 287);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, 287, { align: 'right' });
      }

      doc.save(`CarePulse_Patient_Report_${report.patient_id}_${dateStr}.pdf`);
    } catch (pdfErr) {
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
