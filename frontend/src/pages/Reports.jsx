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
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      let y = 10;

      const timeStr = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const dateStr = new Date().toISOString().split('T')[0];
      const reportId = `RPT-${report.patient_id}-${report.prediction_id || Date.now().toString().slice(-4)}`;

      // Helper to check page overflow before drawing
      const checkPageOverflow = (requiredHeight = 10) => {
        if (y + requiredHeight > pageHeight - 16) {
          doc.addPage();
          y = 14;
          doc.setFillColor(37, 99, 235);
          doc.rect(0, 0, pageWidth, 2.5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `CARE PULSE AI  |  PATIENT FORECAST REPORT  |  ${report.patient_name || ''} (#${report.patient_id})`,
            margin,
            8
          );
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, 10, pageWidth - margin, 10);
        }
      };

      const drawSectionHeader = (title) => {
        checkPageOverflow(10);
        y += 1.5;
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setFillColor(37, 99, 235);
        doc.rect(margin, y, 2, 5.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(title.toUpperCase(), margin + 4.5, y + 3.8);
        y += 7.5;
      };

      const drawGridField = (label, val, xLbl, xVal, currentY) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`${label}:`, xLbl, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(String(val ?? 'N/A'), xVal, currentY);
      };

      // --------------------------------------------------
      // TOP BRANDING & HEADER (COMPACT)
      // --------------------------------------------------
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text('CARE PULSE AI', margin, y + 4);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('HEALTHCARE MANAGEMENT PLATFORM', margin, y + 8);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('PATIENT FORECAST REPORT', pageWidth - margin, y + 4, { align: 'right' });

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${timeStr}`, pageWidth - margin, y + 8, { align: 'right' });
      doc.text(`Report ID: ${reportId}`, pageWidth - margin, y + 11.5, { align: 'right' });

      y += 14;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 3;

      // --------------------------------------------------
      // 1. PATIENT INFORMATION
      // --------------------------------------------------
      drawSectionHeader('Patient Information');
      const col1 = margin + 2;
      const col1Val = col1 + 25;
      const col2 = margin + 92;
      const col2Val = col2 + 28;

      drawGridField('Patient Name', report.patient_name || 'N/A', col1, col1Val, y);
      drawGridField('Patient ID', `#${report.patient_id}`, col2, col2Val, y);
      y += 4.5;

      drawGridField('MRN', report.mrn || 'N/A', col1, col1Val, y);
      drawGridField(
        'Gender / Age',
        `${report.gender || 'N/A'} / ${
          report.age !== null && report.age !== undefined ? `${report.age} yrs` : 'N/A'
        }`,
        col2,
        col2Val,
        y
      );
      y += 4.5;

      drawGridField('Department', report.department || 'General Care', col1, col1Val, y);
      drawGridField('Admission Date', report.admission_date || 'N/A', col2, col2Val, y);
      y += 4.5;

      drawGridField('Diagnosis', report.diagnosis || 'N/A', col1, col1Val, y);
      y += 6;

      // --------------------------------------------------
      // 2. MEDICAL REPORTS (COMPACT SUMMARY)
      // --------------------------------------------------
      drawSectionHeader('Medical Reports');
      doc.setFontSize(8);
      if (report.medical_reports && report.medical_reports.length > 0) {
        const latest = report.medical_reports[0];
        const count = report.medical_reports.length;
        const uploadDateStr = latest.created_at ? new Date(latest.created_at).toLocaleString() : 'N/A';

        if (count === 1) {
          drawGridField('Latest Report', latest.file_name || 'N/A', col1, col1 + 25, y);
          drawGridField('Uploaded', uploadDateStr, margin + 92, margin + 110, y);
          y += 4.5;
          drawGridField('Status', 'Analyzed', col1, col1 + 25, y);
          drawGridField('Format', (latest.file_type || 'PDF').toUpperCase(), margin + 92, margin + 110, y);
          y += 6;
        } else {
          drawGridField('Reports on Record', String(count), col1, col1 + 30, y);
          drawGridField('Latest Report', latest.file_name || 'N/A', margin + 70, margin + 95, y);
          y += 4.5;
          drawGridField('Latest Status', 'Analyzed', col1, col1 + 30, y);
          drawGridField('Latest Upload', uploadDateStr, margin + 70, margin + 95, y);
          y += 6;
        }
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('No medical report recorded for this patient.', col1, y);
        y += 5;
      }

      // --------------------------------------------------
      // 3. RISK ASSESSMENT
      // --------------------------------------------------
      drawSectionHeader('Risk Assessment');
      const cat = (report.risk_category || 'N/A').toUpperCase();
      const score =
        report.risk_score !== null && report.risk_score !== undefined
          ? `${report.risk_score}%`
          : 'N/A';

      let rBg = [241, 245, 249];
      let rText = [30, 41, 59];
      let rBorder = [203, 213, 225];

      if (cat === 'HIGH') {
        rBg = [254, 242, 242];
        rText = [185, 28, 28];
        rBorder = [254, 202, 202];
      } else if (cat === 'MEDIUM') {
        rBg = [254, 243, 199];
        rText = [180, 83, 9];
        rBorder = [253, 230, 138];
      } else if (cat === 'LOW') {
        rBg = [236, 253, 245];
        rText = [4, 120, 87];
        rBorder = [167, 243, 208];
      }

      checkPageOverflow(16);
      doc.setFillColor(...rBg);
      doc.setDrawColor(...rBorder);
      doc.roundedRect(col1, y, 70, 12, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...rText);
      doc.text(`RISK CATEGORY: ${cat}`, col1 + 3, y + 4.8);
      doc.setFontSize(8);
      doc.text(`Risk Score: ${score}`, col1 + 3, y + 9.2);

      drawGridField(
        'Prediction Date',
        report.prediction_date ? new Date(report.prediction_date).toLocaleString() : 'N/A',
        margin + 80,
        margin + 106,
        y + 4
      );
      drawGridField(
        'Model Version',
        report.model_version || 'patient-risk-model-v1.0.0',
        margin + 80,
        margin + 106,
        y + 9
      );
      y += 15;

      // KEY MODEL INPUTS SUB-LINE
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('KEY MODEL INPUTS:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const priorAdm = report.prior_admissions !== null && report.prior_admissions !== undefined ? report.prior_admissions : 'N/A';
      const losDays = report.length_of_stay !== null && report.length_of_stay !== undefined ? `${report.length_of_stay} days` : 'N/A';
      doc.text(`Prior Admissions: ${priorAdm}   |   Length of Stay: ${losDays}`, col1 + 32, y);
      y += 6;

      // --------------------------------------------------
      // 4. RISK ASSESSMENT HISTORY (MAX 5 RECORDS)
      // --------------------------------------------------
      drawSectionHeader('Risk Assessment History');
      if (report.risk_history && report.risk_history.length > 0) {
        const displayHistory = report.risk_history.slice(0, 5);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 5, 'F');
        doc.setTextColor(71, 85, 105);
        doc.text('Assessment Date', col1, y + 3.6);
        doc.text('Risk Category', margin + 45, y + 3.6);
        doc.text('Risk Score', margin + 85, y + 3.6);
        doc.text('Prior Admissions', margin + 120, y + 3.6);
        doc.text('Length of Stay', margin + 155, y + 3.6);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        displayHistory.forEach((rh) => {
          checkPageOverflow(5);
          const historyDateStr = rh.date ? new Date(rh.date).toLocaleDateString() : 'N/A';
          doc.text(historyDateStr, col1, y);
          doc.text((rh.risk_category || 'N/A').toUpperCase(), margin + 45, y);
          doc.text(
            rh.risk_score !== null && rh.risk_score !== undefined ? `${rh.risk_score}%` : 'N/A',
            margin + 85,
            y
          );
          doc.text(
            rh.prior_admissions !== null && rh.prior_admissions !== undefined
              ? String(rh.prior_admissions)
              : 'N/A',
            margin + 120,
            y
          );
          doc.text(
            rh.length_of_stay !== null && rh.length_of_stay !== undefined
              ? `${rh.length_of_stay} days`
              : 'N/A',
            margin + 155,
            y
          );
          y += 4.2;
        });

        if (report.risk_history.length > 5) {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 116, 139);
          doc.text(`Showing latest 5 of ${report.risk_history.length} assessments`, col1, y + 1);
          y += 4.5;
        }
      } else {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('No risk assessment history available.', col1, y);
        y += 5;
      }
      y += 2;

      // --------------------------------------------------
      // 5. CLINICAL INFORMATION
      // --------------------------------------------------
      drawSectionHeader('Clinical Information');
      drawGridField(
        'Prior Admissions',
        report.prior_admissions !== null && report.prior_admissions !== undefined
          ? String(report.prior_admissions)
          : 'N/A',
        col1,
        col1Val,
        y
      );
      drawGridField(
        'Length of Stay',
        report.length_of_stay !== null && report.length_of_stay !== undefined
          ? `${report.length_of_stay} days`
          : 'N/A',
        col2,
        col2Val,
        y
      );
      y += 4.5;

      drawGridField('Admission Date', report.admission_date || 'N/A', col1, col1Val, y);
      const dischargeDateVal =
        (report.treatment && report.treatment.discharge_date) || report.discharge_date || 'N/A';
      drawGridField('Discharge Date', dischargeDateVal, col2, col2Val, y);
      y += 4.5;

      drawGridField('Diagnosis', report.diagnosis || 'N/A', col1, col1Val, y);
      y += 6;

      // --------------------------------------------------
      // 6. APPOINTMENTS
      // --------------------------------------------------
      drawSectionHeader('Appointments');
      if (report.appointments && report.appointments.length > 0) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 5, 'F');
        doc.setTextColor(71, 85, 105);
        doc.text('Date & Time', col1, y + 3.6);
        doc.text('Doctor', margin + 60, y + 3.6);
        doc.text('Status', margin + 130, y + 3.6);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        report.appointments.forEach((appt) => {
          checkPageOverflow(5);
          const dateTimeStr = `${appt.appointment_date || 'N/A'} ${appt.appointment_time || ''}`.trim();
          doc.text(dateTimeStr, col1, y);
          doc.text(appt.doctor_name || 'N/A', margin + 60, y);
          doc.text((appt.status || 'N/A').toUpperCase(), margin + 130, y);
          y += 4.2;
        });
      } else {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('No upcoming or recent appointments recorded.', col1, y);
        y += 5;
      }
      y += 2;

      // --------------------------------------------------
      // 7. CLINICAL RECOMMENDATIONS
      // --------------------------------------------------
      drawSectionHeader('Clinical Recommendations');
      doc.setFontSize(8);
      if (report.insights && report.insights.length > 0) {
        doc.setTextColor(30, 41, 59);
        report.insights.forEach((insight) => {
          const lines = doc.splitTextToSize(insight, contentWidth - 8);
          checkPageOverflow(lines.length * 3.8 + 2);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(37, 99, 235);
          doc.text('•', col1, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          doc.text(lines, col1 + 4, y);
          y += lines.length * 3.8 + 1.8;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('No clinical recommendations recorded.', col1, y);
        y += 5;
      }

      // --------------------------------------------------
      // REPORT FOOTER (ALL PAGES)
      // --------------------------------------------------
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text('CarePulse AI — Patient Forecast Report', margin, pageHeight - 6.5);
        doc.text(`Generated: ${timeStr}`, pageWidth / 2, pageHeight - 6.5, { align: 'center' });
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6.5, { align: 'right' });
      }

      doc.save(`CarePulse_Patient_Report_${report.patient_id}_${dateStr}.pdf`);
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
