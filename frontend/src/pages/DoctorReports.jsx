import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FaFileAlt, FaSpinner, FaPlus, FaTimes, FaCheckCircle, FaFileDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const DoctorReports = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([
    {
      id: 'REP-749',
      patientId: 'PT-59302',
      patientName: 'John Doe',
      type: 'Clinical Readmission Audit',
      date: '2026-08-01',
      author: 'Dr. Ruchika Patil',
      status: 'Signed'
    },
    {
      id: 'REP-612',
      patientId: 'PT-18302',
      patientName: 'Robert Downey',
      type: 'Discharge outcome summary',
      date: '2026-07-28',
      author: 'Dr. Ruchika Patil',
      status: 'Draft'
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchPatients = async () => {
    try {
      const res = await API.get('/patients');
      if (res.data && res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to retrieve patient index');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleGenerateReport = (data) => {
    const selectedPat = patients.find(p => p._id === data.patientId);
    if (!selectedPat) return;

    const newReport = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      patientId: selectedPat.patientId,
      patientName: `${selectedPat.firstName} ${selectedPat.lastName}`,
      type: data.type,
      date: new Date().toISOString().split('T')[0],
      author: 'Dr. Ruchika Patil',
      status: 'Signed'
    };

    setReports([newReport, ...reports]);
    toast.success('Patient outcome report generated successfully!');
    setShowModal(false);
    reset();
  };

  const handleExport = (repId) => {
    toast.success(`Exporting report ${repId} as PDF...`);
    window.print();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Outcome Reports</h1>
          <p className="page-subtitle">Compile clinical discharge evaluations and export summaries</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus />
          <span>New Outcome Report</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '300px' }}>
          <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)', animation: 'spin 1s linear' }} />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Evaluation Type</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.id}</td>
                  <td>{r.patientId}</td>
                  <td style={{ fontWeight: 600 }}>{r.patientName}</td>
                  <td>{r.type}</td>
                  <td>{r.date}</td>
                  <td>
                    <span className={`badge ${r.status === 'Signed' ? 'badge-low' : 'badge-medium'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px' }}
                      onClick={() => handleExport(r.id)}
                    >
                      <FaFileDownload />
                      <span>Print/PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'white', position: 'relative' }}>
            <button style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Compile Outcome Report</h2>

            <form onSubmit={handleSubmit(handleGenerateReport)}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select className="form-control" {...register('patientId', { required: true })}>
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select className="form-control" {...register('type', { required: true })}>
                  <option value="Clinical Readmission Audit">Clinical Readmission Audit</option>
                  <option value="Discharge outcome summary">Discharge outcome summary</option>
                  <option value="Transitional care plan review">Transitional care plan review</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Remarks & Recommendations</label>
                <textarea className="form-control" style={{ minHeight: '100px' }} placeholder="Provide detailed remarks on recovery metrics, drug compliance and review timelines..." {...register('remarks')}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorReports;
