import React from 'react';
import { FaPrint, FaDownload, FaTimes, FaFileInvoice } from 'react-icons/fa';

const AdminReportModal = ({
  isOpen,
  onClose,
  reportTitle = 'Hospital Capacity & Resource Utilization Audit',
  reportCode = 'ADM-PERF-2026',
  auditCategory = 'Capacity and bed utilization analysis',
  author = 'Sanika Walunj (Hospital Administrator)',
  metrics = {}
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const generatedTimestamp = `${dateStr} at ${timeStr}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop no-print-bg" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      zIndex: 9999,
      overflowY: 'auto',
      padding: '24px 16px'
    }}>
      {/* Action Bar (Hidden during printing) */}
      <div className="no-print" style={{
        width: '100%',
        maxWidth: '215mm',
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '12px 20px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaFileInvoice style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
              Institutional Operational Report Preview
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Standard A4 Administrative Audit | Ready for Printing / PDF Export
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={handlePrint}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <FaPrint />
            <span>Print Report</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleDownloadPDF}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <FaDownload />
            <span>Download PDF</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '6px',
              marginLeft: '8px'
            }}
            title="Close Preview"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Printable Document Body */}
      <div style={{
        width: '100%',
        maxWidth: '215mm',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div className="clinical-report-printable" style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: '24px 32px',
          maxWidth: '210mm',
          margin: '0 auto',
          lineHeight: 1.45,
          fontSize: '10pt',
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div style={{
            borderBottom: '2.5px solid #0369a1',
            paddingBottom: '12px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{ fontSize: '15pt', fontWeight: 800, color: '#0369a1', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                HEALTHFORECAST
              </div>
              <div style={{ fontSize: '9pt', color: '#475569', fontWeight: 600, marginTop: '1px' }}>
                Hospital Operational & Resource Utilization System
              </div>
              <div style={{ fontSize: '7.5pt', color: '#64748b', marginTop: '2px' }}>
                Health System Administration & Institutional Compliance Division
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                OPERATIONAL AUDIT REPORT
              </div>
              <div style={{ fontSize: '8pt', color: '#475569', marginTop: '3px' }}>
                Audit Reference: <strong style={{ color: '#0f172a' }}>{reportCode}</strong>
              </div>
              <div style={{ fontSize: '8pt', color: '#64748b' }}>
                Evaluation Period: {dateStr}
              </div>
            </div>
          </div>

          {/* Audit Metadata */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9.5pt', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
              Audit Specifications
            </div>
            <table style={{ width: '100%', fontSize: '8.5pt', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
              <tbody>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, width: '25%', color: '#334155' }}>Report Scope:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', width: '25%', fontWeight: 700 }}>{reportTitle}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, width: '25%', color: '#334155' }}>Facility Name:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', width: '25%' }}>HealthForecast Metropolitan Center</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#334155' }}>Audit Classification:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{auditCategory}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#334155' }}>Reporting Official:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{author}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Executive Operations Summary */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9.5pt', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
              Executive Operational Summary
            </div>
            <div style={{ fontSize: '8.5pt', color: '#1e293b', lineHeight: 1.5, padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              This audit synthesizes institutional capacity utilization, clinical bed occupancy, and readmission risk distributions across active hospital departments. Evaluated operational indicators indicate that facility capacity remains stabilized with consistent transitional care workflows and compliant post-discharge follow-up scheduling.
            </div>
          </div>

          {/* Key Resource & Clinical Utilization Metrics Table */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9.5pt', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
              Institutional Metrics & Capacity Utilization
            </div>
            <table style={{ width: '100%', fontSize: '8.5pt', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>Operational Indicator</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>Recorded Metric</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>Institutional Benchmark</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>Operational Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Active Inpatient Volume:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{metrics.totalPatients || 98} Patients Monitored</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', color: '#475569' }}>Capacity Ceiling: 150</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#15803d' }}>Optimal (65.3%)</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Average Length of Stay:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>4.3 Days</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', color: '#475569' }}>Standard: 4.5 - 5.0 Days</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#15803d' }}>Efficient Convalescence</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Predicted Readmission Risk Rate:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#b91c1c' }}>18.4% Cohort Vulnerability</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', color: '#475569' }}>Regional Average: 19.8%</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0369a1' }}>Within Threshold</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Attending Clinical Staff:</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{metrics.totalDoctors || 4} Staff Physicians Active</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', color: '#475569' }}>Coverage Target: 1:25 Ratio</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#15803d' }}>Compliant</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Institutional Directives */}
          <div style={{ marginBottom: '16px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '8px 12px', background: '#f8fafc' }}>
            <div style={{ fontSize: '9pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>
              Administrative Compliance Directives
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '8pt', color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li>Ensure all patients identified with elevated readmission indicators have outpatient appointments scheduled prior to discharge.</li>
              <li>Maintain current endocrinology and cardiology medication reconciliation protocols for multicondition admissions.</li>
              <li>Audit logs and clinical access permissions strictly adhere to HIPAA Safe Harbor and minimum-necessary privacy requirements.</li>
            </ul>
          </div>

          {/* Footer & Sign-off */}
          <div style={{
            marginTop: '24px',
            paddingTop: '10px',
            borderTop: '1.5px solid #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: '8pt'
          }}>
            <div>
              <div style={{ fontSize: '8.5pt', fontWeight: 800, color: '#0f172a' }}>
                HealthForecast Institutional Administration
              </div>
              <div style={{ fontSize: '7.5pt', color: '#64748b' }}>
                Confidential Operational Audit | Internal Healthcare Operations
              </div>
              <div style={{ fontSize: '7.5pt', color: '#64748b', marginTop: '2px' }}>
                Generated on: {generatedTimestamp}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #0f172a', width: '180px', marginBottom: '4px' }}></div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{author}</div>
              <div style={{ fontSize: '7pt', color: '#64748b' }}>Director of Hospital Operations</div>
              <div style={{ fontSize: '7pt', color: '#0369a1', marginTop: '2px' }}>Page 1 of 1</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminReportModal;
