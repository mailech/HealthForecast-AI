import React, { useRef } from 'react';
import { FaPrint, FaDownload, FaTimes, FaFileAlt } from 'react-icons/fa';
import ClinicalReportDocument from './ClinicalReportDocument';

const ClinicalReportModal = ({
  isOpen,
  onClose,
  patient,
  prediction,
  reportType = 'Clinical Outcome Report',
  remarks = '',
  reportId = '',
  clinicianName = 'Dr. Ruchika Patil, MD'
}) => {
  const reportRef = useRef(null);

  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Triggers browser standard A4 PDF print dialog
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
      {/* Top Floating Action Bar (Hidden during printing) */}
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
          <FaFileAlt style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
              Clinical Report Print Preview
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Standard A4 Document Format | Ready for Clinician Review & Printing
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

      {/* Printable Clinical Report Body */}
      <div style={{
        width: '100%',
        maxWidth: '215mm',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div ref={reportRef}>
          <ClinicalReportDocument
            patient={patient}
            prediction={prediction}
            reportType={reportType}
            remarks={remarks}
            reportId={reportId}
            clinicianName={clinicianName}
          />
        </div>
      </div>
    </div>
  );
};

export default ClinicalReportModal;
