import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  FaFileAlt, 
  FaSpinner, 
  FaPlus, 
  FaTimes, 
  FaCheckCircle, 
  FaFileDownload,
  FaPrint,
  FaEye,
  FaFileMedical
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import ClinicalReportModal from '../components/ClinicalReportModal';

const DoctorReports = () => {
  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchClinicalData = async () => {
    try {
      setLoading(true);
      const [patientsRes, predictionsRes] = await Promise.all([
        API.get('/patients'),
        API.get('/predictions')
      ]);

      let patientList = [];
      if (patientsRes.data && patientsRes.data.success) {
        patientList = patientsRes.data.data;
        setPatients(patientList);
      }

      let predictionList = [];
      if (predictionsRes.data && predictionsRes.data.success) {
        predictionList = predictionsRes.data.data;
        setPredictions(predictionList);
      }

      // Initialize reports linked to real patients
      if (patientList.length > 0) {
        const p1 = patientList[0];
        const p2 = patientList.length > 1 ? patientList[1] : p1;
        const p3 = patientList.length > 2 ? patientList[2] : p1;

        setReports([
          {
            id: 'HCR-89201',
            patientId: p1.patientId,
            patientName: `${p1.firstName} ${p1.lastName}`,
            patientObj: p1,
            type: 'Clinical Outcome Report',
            date: '2026-08-12',
            author: p1.assignedDoctor?.name || 'Dr. Ruchika Patil',
            status: 'Signed',
            remarks: 'Patient responded favorably to maintenance therapy with stabilized glycemic metrics.'
          },
          {
            id: 'HCR-74102',
            patientId: p2.patientId,
            patientName: `${p2.firstName} ${p2.lastName}`,
            patientObj: p2,
            type: 'Clinical Risk Assessment Report',
            date: '2026-08-10',
            author: p2.assignedDoctor?.name || 'Dr. Ruchika Patil',
            status: 'Signed',
            remarks: 'Elevated 30-day readmission vulnerability indicated. Transitional care appointment confirmed within 7 days.'
          },
          {
            id: 'HCR-61504',
            patientId: p3.patientId,
            patientName: `${p3.firstName} ${p3.lastName}`,
            patientObj: p3,
            type: 'Treatment Effectiveness Report',
            date: '2026-08-04',
            author: p3.assignedDoctor?.name || 'Dr. Ruchika Patil',
            status: 'Draft',
            remarks: 'Titration of diabetes medication monitored during encounter; routine outpatient checkup scheduled.'
          }
        ]);
      }
    } catch (err) {
      toast.error('Failed to retrieve patient index');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicalData();
  }, []);

  const handleGenerateReport = (data) => {
    const selectedPat = patients.find(p => p._id === data.patientId);
    if (!selectedPat) return;

    const newReport = {
      id: `HCR-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: selectedPat.patientId,
      patientName: `${selectedPat.firstName} ${selectedPat.lastName}`,
      patientObj: selectedPat,
      type: data.type,
      date: new Date().toISOString().split('T')[0],
      author: selectedPat.assignedDoctor?.name || 'Dr. Ruchika Patil',
      status: 'Signed',
      remarks: data.remarks || 'Routine clinical monitoring evaluation compiled from patient record.'
    };

    setReports([newReport, ...reports]);
    toast.success('Clinical report compiled successfully!');
    setShowModal(false);
    reset();

    // Immediately open clean preview
    handleOpenPreview(newReport);
  };

  const handleOpenPreview = (report) => {
    const targetPatient = report.patientObj || patients.find(p => p.patientId === report.patientId) || patients[0];
    if (!targetPatient) {
      toast.error('Patient record not found');
      return;
    }

    const targetPred = predictions.find(
      pr => (pr.patient?._id || pr.patient) === targetPatient._id
    ) || null;

    setPreviewData({
      patient: targetPatient,
      prediction: targetPred,
      reportType: report.type,
      remarks: report.remarks,
      reportId: report.id,
      clinicianName: report.author || 'Dr. Ruchika Patil, MD'
    });

    setShowPreviewModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaFileMedical style={{ color: 'var(--primary)', fontSize: '2rem' }} />
            Patient Outcome & Clinical Reports
          </h1>
          <p className="page-subtitle">
            Compile structured A4 clinical reports, evaluate transitional outcomes, and generate formal hospital printouts
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus />
          <span>New Clinical Report</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '300px' }}>
          <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)' }} />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Report Type</th>
                <th>Date Compiled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.patientId}</td>
                  <td style={{ fontWeight: 600, color: 'white' }}>{r.patientName}</td>
                  <td>
                    <span style={{ 
                      background: 'rgba(6, 182, 212, 0.1)', 
                      color: 'var(--primary)', 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '6px', 
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {r.type}
                    </span>
                  </td>
                  <td>{r.date}</td>
                  <td>
                    <span className={`badge ${r.status === 'Signed' ? 'badge-low' : 'badge-medium'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                        onClick={() => handleOpenPreview(r)}
                        title="View and Print Clinical Report"
                      >
                        <FaPrint />
                        <span>Print / PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Report Modal */}
      {showModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', background: '#0f172a', position: 'relative', border: '1px solid var(--border)' }}>
            <button 
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-secondary)' }} 
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>
            <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', color: 'white' }}>Compile Clinical Report</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Select an authorized patient from your clinical registry to generate a standardized A4 document.
            </p>

            <form onSubmit={handleSubmit(handleGenerateReport)}>
              <div className="form-group">
                <label className="form-label">Select Patient (Authorized Scope)</label>
                <select className="form-control" {...register('patientId', { required: true })}>
                  <option value="">-- Choose Patient Record --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName} ({p.patientId}) - Age {p.ageGroup}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Report Type</label>
                <select className="form-control" {...register('type', { required: true })}>
                  <option value="Clinical Outcome Report">Clinical Outcome Report</option>
                  <option value="Clinical Risk Assessment Report">Clinical Risk Assessment Report</option>
                  <option value="Treatment Effectiveness Report">Treatment Effectiveness Report</option>
                  <option value="Patient Clinical Summary Report">Patient Clinical Summary Report</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Remarks & Observations</label>
                <textarea 
                  className="form-control" 
                  style={{ minHeight: '90px' }} 
                  placeholder="Document specific clinical observations, medication titration notes, and post-discharge recommendations..." 
                  {...register('remarks')}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <FaFileAlt />
                  <span>Compile & Preview</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated A4 Clinical Report Modal (Print Preview & Export) */}
      {showPreviewModal && previewData && (
        <ClinicalReportModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          patient={previewData.patient}
          prediction={previewData.prediction}
          reportType={previewData.reportType}
          remarks={previewData.remarks}
          reportId={previewData.reportId}
          clinicianName={previewData.clinicianName}
        />
      )}
    </div>
  );
};

export default DoctorReports;
