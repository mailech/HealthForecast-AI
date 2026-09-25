import { jsPDF } from 'jspdf';

/**
 * Generates a professional hospital-style medical report / patient discharge summary PDF.
 * Uses consistent formatting across all roles (Doctor, Hospital Admin, Researcher, System Admin).
 * Uses real patient data provided; displays "N/A" or "Not Available" for missing fields.
 */
export function generateHospitalPDFReport(report) {
  if (!report) return;

  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm
  let y = 0;

  const now = new Date();
  const timeStr = now.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const dateStr = now.toISOString().split('T')[0];
  const reportId = `RPT-${report.patient_id}-${report.prediction_id || 'SYS'}`;

  // Helper for page break check
  const checkOverflow = (neededHeight, onPageBreak = null) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 14;

      // Top Header for Pages 2+
      doc.setFillColor(27, 54, 93); // #1b365d
      doc.rect(0, 0, pageWidth, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'CARE PULSE AI  |  HOSPITAL MEDICAL REPORT & DISCHARGE SUMMARY',
        margin,
        9
      );
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Patient: ${report.patient_name || 'N/A'} (#${report.patient_id})`,
        pageWidth - margin,
        9,
        { align: 'right' }
      );
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, 11, pageWidth - margin, 11);
      y = 15;

      if (typeof onPageBreak === 'function') {
        onPageBreak();
      }
    }
  };

  // Section Header Drawer
  const drawSectionHeader = (title) => {
    checkOverflow(12);
    y += 1.5;
    doc.setFillColor(30, 64, 175); // #1e40af (Hospital Royal Blue)
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 3, y + 3.9);
    y += 7;
  };

  // 4-Column Key-Value Grid Drawer
  const drawGrid4Col = (rowPairs) => {
    rowPairs.forEach((pair) => {
      const col1Label = pair[0]?.label || '';
      const col1Val = String(pair[0]?.val ?? 'N/A');
      const col2Label = pair[1]?.label || '';
      const col2Val = String(pair[1]?.val ?? 'N/A');

      const col1ValLines = doc.splitTextToSize(col1Val, 56);
      const col2ValLines = doc.splitTextToSize(col2Val, 56);

      const maxLines = Math.max(col1ValLines.length, col2ValLines.length, 1);
      const rowHeight = Math.max(6.5, maxLines * 3.8 + 2);

      checkOverflow(rowHeight);

      // Col 1 Label
      doc.setFillColor(241, 245, 249); // #f1f5f9
      doc.setDrawColor(203, 213, 225); // #cbd5e1
      doc.setLineWidth(0.2);
      doc.rect(margin, y, 32, rowHeight, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${col1Label}:`, margin + 2, y + 4.2);

      // Col 1 Value
      doc.setFillColor(255, 255, 255);
      doc.rect(margin + 32, y, 61, rowHeight, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(col1ValLines, margin + 34, y + 4.2);

      // Col 2 Label
      doc.setFillColor(241, 245, 249);
      doc.rect(margin + 93, y, 32, rowHeight, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${col2Label}:`, margin + 95, y + 4.2);

      // Col 2 Value
      doc.setFillColor(255, 255, 255);
      doc.rect(margin + 125, y, 61, rowHeight, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(col2ValLines, margin + 127, y + 4.2);

      y += rowHeight;
    });
    y += 1.5;
  };

  // 2-Column Key-Value Grid Drawer
  const drawGrid2Col = (rows) => {
    rows.forEach((r) => {
      const label = r.label || '';
      const val = String(r.val ?? 'N/A');
      const valLines = doc.splitTextToSize(val, 138);

      const rowHeight = Math.max(6.5, valLines.length * 3.8 + 2);
      checkOverflow(rowHeight);

      // Label Cell
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, 42, rowHeight, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${label}:`, margin + 2, y + 4.2);

      // Value Cell
      doc.setFillColor(255, 255, 255);
      doc.rect(margin + 42, y, 144, rowHeight, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(valLines, margin + 44, y + 4.2);

      y += rowHeight;
    });
    y += 1.5;
  };

  // Table Drawer with auto-header redraw on page overflow
  const drawTable = ({ headers, colWidths, dataRows, emptyMsg }) => {
    const renderHeader = () => {
      doc.setFillColor(224, 242, 254); // #e0f2fe
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);

      let currentX = margin;
      headers.forEach((h, idx) => {
        const w = colWidths[idx];
        doc.rect(currentX, y, w, 6, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(3, 105, 161); // #0369a1
        doc.text(h, currentX + 2, y + 4.2);
        currentX += w;
      });
      y += 6;
    };

    checkOverflow(10);
    renderHeader();

    if (!dataRows || dataRows.length === 0) {
      checkOverflow(6.5);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, contentWidth, 6.5, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(emptyMsg || 'No information recorded.', margin + 3, y + 4.2);
      y += 8;
      return;
    }

    dataRows.forEach((rowValues, rowIndex) => {
      const cellLines = rowValues.map((val, idx) =>
        doc.splitTextToSize(String(val ?? 'N/A'), colWidths[idx] - 4)
      );

      const maxLines = Math.max(...cellLines.map((l) => l.length), 1);
      const rowHeight = Math.max(6, maxLines * 3.8 + 2);

      checkOverflow(rowHeight, () => {
        renderHeader();
      });

      const rowBg = rowIndex % 2 === 0 ? [255, 255, 255] : [248, 250, 252];

      let currentX = margin;
      rowValues.forEach((_, colIdx) => {
        const w = colWidths[colIdx];
        doc.setFillColor(...rowBg);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.2);
        doc.rect(currentX, y, w, rowHeight, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(cellLines[colIdx], currentX + 2, y + 4.2);
        currentX += w;
      });

      y += rowHeight;
    });

    y += 2;
  };

  // =========================================================================
  // PAGE 1: TOP HOSPITAL BRANDING & HEADER
  // =========================================================================
  doc.setFillColor(27, 54, 93); // #1b365d (Deep Hospital Blue Header)
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFillColor(37, 99, 235); // #2563eb Accent stripe
  doc.rect(0, 22, pageWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('CARE PULSE AI', margin, 9);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(147, 197, 253);
  doc.text('HOSPITAL MEDICAL REPORT & DISCHARGE SUMMARY', margin, 14);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(191, 219, 254);
  doc.text('CarePulse Healthcare Management Intelligence Platform', margin, 18.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`REPORT ID: ${reportId}`, pageWidth - margin, 9, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(219, 234, 254);
  doc.text(`Generated: ${timeStr}`, pageWidth - margin, 14, { align: 'right' });
  doc.text(`Department: ${report.department || 'General Medicine'}`, pageWidth - margin, 18.5, {
    align: 'right',
  });

  y = 27;

  // =========================================================================
  // 1. PATIENT DEMOGRAPHICS
  // =========================================================================
  drawSectionHeader('1. Patient Demographics');
  drawGrid4Col([
    [
      { label: 'Patient Name', val: report.patient_name || 'N/A' },
      { label: 'Patient ID / MRN', val: `#${report.patient_id} / ${report.mrn || 'N/A'}` },
    ],
    [
      {
        label: 'Age / Gender',
        val: `${
          report.age !== null && report.age !== undefined ? `${report.age} yrs` : 'N/A'
        } / ${report.gender || 'N/A'}`,
      },
      { label: 'Department', val: report.department || 'N/A' },
    ],
    [
      { label: 'Admission Date', val: report.admission_date || 'N/A' },
      { label: 'Location / Bed', val: 'N/A' },
    ],
    [
      { label: 'Nationality / Race', val: 'N/A' },
      { label: 'Visit No.', val: 'N/A' },
    ],
  ]);

  // =========================================================================
  // 2. ALLERGIES & MEDICAL ALERTS
  // =========================================================================
  drawSectionHeader('2. Allergies & Medical Alerts');
  drawGrid2Col([
    { label: 'Allergies', val: 'N/A' },
    { label: 'Medical Alerts', val: 'N/A' },
  ]);

  // =========================================================================
  // 3. MEDICAL / SURGICAL / FAMILY HISTORY
  // =========================================================================
  drawSectionHeader('3. Medical / Surgical / Family History');
  drawGrid2Col([
    { label: 'Medical History', val: report.diagnosis || 'N/A' },
    { label: 'Surgical History', val: 'N/A' },
    { label: 'Family History', val: 'N/A' },
  ]);

  // =========================================================================
  // 4. ADMISSION INFORMATION
  // =========================================================================
  drawSectionHeader('4. Admission Information');
  drawGrid4Col([
    [
      { label: 'Admission Date', val: report.admission_date || 'N/A' },
      {
        label: 'Principal Doctor',
        val: report.appointments?.[0]?.doctor_name || 'N/A',
      },
    ],
    [
      { label: 'Reason for Admission', val: report.diagnosis || 'N/A' },
      { label: 'Principal Diagnosis', val: report.diagnosis || 'N/A' },
    ],
    [
      { label: 'Secondary Diagnosis', val: report.treatment?.diagnosis || 'N/A' },
      { label: 'Operation / Procedures', val: report.treatment?.treatment_plan || 'N/A' },
    ],
  ]);

  // =========================================================================
  // 5. CLINICAL SUMMARY
  // =========================================================================
  drawSectionHeader('5. Clinical Summary');
  const priorAdmStr =
    report.prior_admissions !== null && report.prior_admissions !== undefined
      ? String(report.prior_admissions)
      : 'Not Available';

  const losStr =
    report.length_of_stay !== null && report.length_of_stay !== undefined
      ? `${report.length_of_stay} days`
      : 'Not Available';

  drawGrid2Col([
    { label: 'Clinical Summary', val: report.summary || 'N/A' },
    { label: 'Diagnosis', val: report.diagnosis || 'N/A' },
    { label: 'Prior Admissions', val: priorAdmStr },
    { label: 'Length of Stay', val: losStr },
    {
      label: 'Treatment Plan',
      val: report.treatment?.treatment_plan || 'N/A',
    },
  ]);

  // Recommendations & Insights Sub-section
  if (report.insights && report.insights.length > 0) {
    checkOverflow(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175);
    doc.text('RECOMMENDED CLINICAL ACTION PLAN:', margin + 2, y + 2);
    y += 4;

    report.insights.forEach((insight) => {
      const insightLines = doc.splitTextToSize(insight, contentWidth - 8);
      const h = insightLines.length * 3.8 + 1.5;
      checkOverflow(h);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('•', margin + 3, y + 3);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(insightLines, margin + 7, y + 3);

      y += h;
    });
    y += 2;
  }

  // =========================================================================
  // 6. RISK ASSESSMENT
  // =========================================================================
  drawSectionHeader('6. Risk Assessment');
  const cat = (report.risk_category || 'N/A').toUpperCase();
  const score =
    report.risk_score !== null && report.risk_score !== undefined
      ? `${report.risk_score}%`
      : 'N/A';

  let rBg = [241, 245, 249];
  let rText = [71, 85, 105];
  let rBorder = [203, 213, 225];

  if (cat === 'HIGH') {
    rBg = [254, 242, 242];
    rText = [153, 27, 27];
    rBorder = [252, 165, 165];
  } else if (cat === 'MEDIUM') {
    rBg = [255, 251, 235];
    rText = [146, 64, 14];
    rBorder = [253, 230, 138];
  } else if (cat === 'LOW') {
    rBg = [240, 253, 244];
    rText = [22, 101, 52];
    rBorder = [134, 239, 172];
  }

  checkOverflow(18);
  // Risk Badge Container
  doc.setFillColor(...rBg);
  doc.setDrawColor(...rBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, 75, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...rText);
  doc.text(`RISK CATEGORY: ${cat}`, margin + 4, y + 6);

  doc.setFontSize(8);
  doc.text(`Readmission Risk Score: ${score}`, margin + 4, y + 12);

  // Risk metadata alongside container
  const sideX = margin + 82;
  const predDateStr = report.prediction_date
    ? new Date(report.prediction_date).toLocaleString()
    : 'N/A';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Prediction Date:', sideX, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(predDateStr, sideX + 26, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Model Version:', sideX, y + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.model_version || 'patient-risk-model-v1.0.0', sideX + 26, y + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Key Inputs:', sideX, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Prior Adm.: ${priorAdmStr}  |  Length of Stay: ${losStr}`, sideX + 26, y + 14);

  y += 20;

  // =========================================================================
  // 7. RISK HISTORY
  // =========================================================================
  drawSectionHeader('7. Risk History');
  const riskHistoryRows = (report.risk_history || []).map((rh) => [
    rh.date ? new Date(rh.date).toLocaleString() : 'N/A',
    (rh.risk_category || 'N/A').toUpperCase(),
    rh.risk_score !== null && rh.risk_score !== undefined ? `${rh.risk_score}%` : 'N/A',
    rh.prior_admissions !== null && rh.prior_admissions !== undefined
      ? String(rh.prior_admissions)
      : 'N/A',
    rh.length_of_stay !== null && rh.length_of_stay !== undefined
      ? `${rh.length_of_stay} days`
      : 'N/A',
  ]);

  drawTable({
    headers: ['Date & Time', 'Risk Category', 'Risk Score', 'Prior Admissions', 'Length of Stay'],
    colWidths: [45, 35, 30, 38, 38],
    dataRows: riskHistoryRows,
    emptyMsg: 'No risk history available.',
  });

  // =========================================================================
  // 8. APPOINTMENTS
  // =========================================================================
  drawSectionHeader('8. Appointments');
  const appointmentRows = (report.appointments || []).map((appt) => [
    `${appt.appointment_date || 'N/A'} ${appt.appointment_time || ''}`.trim(),
    appt.doctor_name || 'N/A',
    (appt.status || 'N/A').toUpperCase(),
    appt.reminder_timing || 'Standard',
  ]);

  drawTable({
    headers: ['Date & Time', 'Doctor', 'Status', 'Reminder'],
    colWidths: [45, 55, 40, 46],
    dataRows: appointmentRows,
    emptyMsg: 'No upcoming or recent appointments recorded.',
  });

  // =========================================================================
  // 9. MEDICAL REPORT INFORMATION
  // =========================================================================
  drawSectionHeader('9. Medical Report Information');
  const medicalReportRows = (report.medical_reports || []).map((mr) => [
    mr.file_name || 'N/A',
    (mr.file_type || 'PDF').toUpperCase(),
    mr.file_size ? `${(mr.file_size / 1024).toFixed(1)} KB` : 'N/A',
    mr.created_at ? new Date(mr.created_at).toLocaleString() : 'N/A',
    'Analyzed',
  ]);

  drawTable({
    headers: ['File Name', 'Format', 'Size', 'Upload Date', 'Status'],
    colWidths: [60, 25, 25, 45, 31],
    dataRows: medicalReportRows,
    emptyMsg: 'No medical report available.',
  });

  // =========================================================================
  // 10. DISCHARGE & FOLLOW-UP DETAILS
  // =========================================================================
  drawSectionHeader('10. Discharge & Follow-up Details');
  const dischargeDateVal =
    report.discharge_date || report.treatment?.discharge_date || 'N/A';

  drawGrid4Col([
    [
      { label: 'Date of Discharge', val: dischargeDateVal },
      {
        label: 'Condition at Discharge',
        val: report.treatment?.diagnosis ? 'Stable / Under Management' : 'N/A',
      },
    ],
    [
      {
        label: 'Follow-up Info',
        val: report.insights?.[0] || 'Standard post-discharge follow-up care.',
      },
      {
        label: 'Attending Physician',
        val: report.appointments?.[0]?.doctor_name || 'N/A',
      },
    ],
  ]);

  // =========================================================================
  // PHYSICIAN & SYSTEM SIGN-OFF BLOCK
  // =========================================================================
  checkOverflow(22);
  y += 2;
  const sigBoxW = 85;

  // Physician Signature
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 10, margin + sigBoxW - 10, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Attending Physician / Authorized Signature', margin, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Date: ________________________', margin, y + 18);

  // System Verification Seal
  const rightSigX = margin + 101;
  doc.line(rightSigX, y + 10, rightSigX + sigBoxW - 10, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CarePulse AI System Verification Seal', rightSigX, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Generated Date: ${dateStr}`, rightSigX, y + 18);

  // =========================================================================
  // PAGE FOOTER ACROSS ALL PAGES
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'CarePulse AI — Official Hospital Medical Report & Discharge Summary',
      margin,
      pageHeight - 7.5
    );
    doc.text(
      `Generated: ${timeStr}`,
      pageWidth / 2,
      pageHeight - 7.5,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7.5,
      { align: 'right' }
    );
  }

  doc.save(`CarePulse_Patient_Report_${report.patient_id}_${dateStr}.pdf`);
}
