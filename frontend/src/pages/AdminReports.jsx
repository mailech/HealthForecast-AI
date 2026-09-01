import React, { useState } from 'react';
import { FaFileInvoice, FaFileExport, FaArrowRight, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports] = useState([
    {
      code: 'ADM-PERF-2026',
      title: 'Hospital Performance & Capacity Audit',
      type: 'Capacity and bed utilization analysis',
      frequency: 'Monthly',
      lastRun: '2026-08-01'
    },
    {
      code: 'AI-READMIT-SUM',
      title: 'AI readmission Prediction Evaluation Summary',
      type: 'Prediction accuracy, false positives, and clinical metrics',
      frequency: 'Weekly',
      lastRun: '2026-08-02'
    },
    {
      code: 'DEPT-UTIL-MED',
      title: 'Departmental Resource utilization Report',
      type: 'Length of stay and occupancy indicators',
      frequency: 'Monthly',
      lastRun: '2026-07-31'
    }
  ]);

  const handleExport = (code) => {
    toast.success(`Compiling report ${code} data stream...`);
    window.print();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Reports</h1>
          <p className="page-subtitle">Inspect capacity audits, department statistics, and AI prediction reviews</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '1.25rem' }}>
            <FaFileInvoice />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '1.1rem' }}>3 Core Audits</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ready to compile</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>System Code</th>
              <th>Report Title</th>
              <th>Audit Category</th>
              <th>Frequency</th>
              <th>Last Generated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.code}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.code}</td>
                <td style={{ fontWeight: 600 }}>{r.title}</td>
                <td style={{ fontSize: '0.85rem' }}>{r.type}</td>
                <td>{r.frequency}</td>
                <td>{r.lastRun}</td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px' }}
                    onClick={() => handleExport(r.code)}
                  >
                    <FaFileExport />
                    <span>Print Audit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
