import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaArrowLeft, 
  FaBrain, 
  FaFileAlt, 
  FaNotesMedical, 
  FaPlus, 
  FaSpinner, 
  FaCheckCircle, 
  FaUserInjured, 
  FaChevronRight,
  FaPills
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [showAddAdmissionModal, setShowAddAdmissionModal] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  
  const { register, handleSubmit, reset } = useForm();

  const fetchPatientDetails = async () => {
    try {
      const patientRes = await API.get(`/patients/${id}`);
      if (patientRes.data && patientRes.data.success) {
        setPatient(patientRes.data.data);
      }

      // Fetch predictions history
      const predRes = await API.get(`/predictions/patient/${id}`);
      if (predRes.data && predRes.data.success) {
        setPredictionHistory(predRes.data.data);
        if (predRes.data.data.length > 0) {
          setFeedbackInput(predRes.data.data[0].clinicalFeedback || '');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error loading patient file');
      // If unauthorized, go back
      if (err.message.includes('denied') || err.message.includes('not authorized')) {
        navigate(-1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  // Run Real-Time AI Prediction
  const handleRunPrediction = async () => {
    setPredicting(true);
    try {
      const res = await API.post(`/predictions/run/${id}`);
      if (res.data && res.data.success) {
        toast.success('AI readmission risk calibrated!');
        fetchPatientDetails();
      }
    } catch (err) {
      toast.error(err.message || 'AI engine failed');
    } finally {
      setPredicting(false);
    }
  };

  // Submit Doctor Feedback
  const handleFeedbackSubmit = async (predictionId) => {
    if (!feedbackInput.trim()) {
      toast.error('Feedback notes cannot be blank');
      return;
    }
    try {
      const res = await API.post(`/predictions/${predictionId}/feedback`, {
        clinicalFeedback: feedbackInput
      });
      if (res.data && res.data.success) {
        toast.success('Clinical feedback submitted successfully!');
        fetchPatientDetails();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    }
  };

  // Add Admission Submit
  const handleAddAdmission = async (data) => {
    setLoading(true);
    try {
      // Add the new admission to the patient's existing history list
      const updatedAdmissions = [...patient.admissionHistory, {
        admissionSource: data.admissionSource,
        timeInHospital: Number(data.timeInHospital),
        numLabProcedures: Number(data.numLabProcedures),
        numMedications: Number(data.numMedications),
        numDiagnoses: Number(data.numDiagnoses),
        primaryDiagnosis: data.primaryDiagnosis,
        secondaryDiagnosis: data.secondaryDiagnosis,
        maxGluSerum: data.maxGluSerum,
        a1cResult: data.a1cResult,
        changeInMeds: data.changeInMeds === 'true',
        diabetesMed: data.diabetesMed === 'true',
        dischargeDisposition: data.dischargeDisposition
      }];

      const res = await API.put(`/patients/${id}`, {
        admissionHistory: updatedAdmissions
      });

      if (res.data && res.data.success) {
        toast.success('New admission entry logged!');
        setShowAddAdmissionModal(false);
        reset();
        fetchPatientDetails();
      }
    } catch (err) {
      toast.error(err.message || 'Encounter log failed');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <FaSpinner className="spin" style={{ fontSize: '3rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p>Retrieving Clinical File...</p>
      </div>
    );
  }

  if (!patient) return null;

  const latestPrediction = predictionHistory[0];
  const canModify = user.role === 'doctor' || user.role === 'system_admin';

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      {/* Back navigation */}
      <button className="btn btn-secondary" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
        <FaArrowLeft />
        <span>Back to Directory</span>
      </button>

      {/* Patient Profile Header Card */}
      <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="avatar" style={{ width: '70px', height: '70px', fontSize: '1.75rem', borderRadius: '15px' }}>
          {getInitials(patient.firstName, patient.lastName)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>{patient.firstName} {patient.lastName}</h2>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>ID: {patient.patientId}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {patient.ageGroup} Years | {patient.gender} | {patient.race}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {canModify && (
            <button className="btn btn-secondary" onClick={() => setShowAddAdmissionModal(true)}>
              <FaPlus />
              <span>Log Admission</span>
            </button>
          )}
          {canModify && (
            <button className="btn btn-primary" disabled={predicting} onClick={handleRunPrediction}>
              {predicting ? <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <FaBrain />}
              <span>Recalibrate Risk</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        {/* Left Column: Timeline & Admissions */}
        <div>
          {/* Medical Summary */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Chronic Conditions & Allergies</h3>
            <div className="grid-2">
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Chronic Conditions:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {patient.medicalHistory?.chronicConditions?.length > 0 ? (
                    patient.medicalHistory.chronicConditions.map((c, idx) => (
                      <span key={idx} className="badge badge-low" style={{ background: '#f1f5f9', color: '#475569', borderRadius: '4px' }}>{c}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None logged</span>
                  )}
                </div>
              </div>
              
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Allergies:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {patient.medicalHistory?.allergies?.length > 0 ? (
                    patient.medicalHistory.allergies.map((a, idx) => (
                      <span key={idx} className="badge badge-high" style={{ borderRadius: '4px' }}>{a}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No known drug allergies</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Clinical Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1rem' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '4px', width: '2px', background: 'var(--border)' }}></div>
              
              {patient.admissionHistory?.slice().reverse().map((ad, idx) => (
                <div key={ad.admissionId} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-12px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid white' }}></div>
                  
                  <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--primary)' }}>Encounter: {ad.primaryDiagnosis}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(ad.admissionDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="grid-4" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <div>
                        <strong>Stay duration:</strong> {ad.timeInHospital} days
                      </div>
                      <div>
                        <strong>Meds count:</strong> {ad.numMedications} items
                      </div>
                      <div>
                        <strong>HbA1c check:</strong> {ad.a1cResult}
                      </div>
                      <div>
                        <strong>Discharge:</strong> {ad.dischargeDisposition}
                      </div>
                    </div>
                    {ad.secondaryDiagnosis && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Secondary diagnosis: {ad.secondaryDiagnosis}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI predictions & Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* AI Panel */}
          <div className="card" style={{ borderColor: 'rgba(37, 99, 235, 0.25)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaBrain style={{ color: 'var(--primary)' }} />
              <span>AI Risk Assessment</span>
            </h3>

            {latestPrediction ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Probability Score</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{latestPrediction.readmissionProbability}%</div>
                  </div>
                  <span className={`badge badge-${latestPrediction.riskCategory.toLowerCase()}`} style={{ padding: '0.35rem 0.85rem' }}>
                    {latestPrediction.riskCategory} Risk
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Key Clinical Risk Factors:</span>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {latestPrediction.keyContributors?.map((c, i) => (
                      <li key={i} style={{ marginBottom: '0.35rem' }}>{c.details}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Transitional Care Plan:</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--primary)' }}>
                    {latestPrediction.dischargeSupport}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Clinical Guidelines:</span>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {latestPrediction.recommendations?.map((r, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>No AI readmission assessment has been run yet for this patient profile.</p>
                {canModify && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRunPrediction}>
                    Run Risk Prediction
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Notes */}
          {latestPrediction && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaNotesMedical style={{ color: 'var(--info)' }} />
                <span>Doctor Feedback</span>
              </h3>
              
              <div className="form-group">
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', fontSize: '0.85rem' }}
                  placeholder="Leave review comments on risk accuracy or plan compliance..."
                  value={feedbackInput}
                  disabled={!canModify}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                />
              </div>

              {canModify && (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onClick={() => handleFeedbackSubmit(latestPrediction._id)}
                >
                  Submit Review Notes
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Admission Modal */}
      {showAddAdmissionModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', background: 'white' }}>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Log New Hospitalization</h2>
            
            <form onSubmit={handleSubmit(handleAddAdmission)}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Stay Duration (days)</label>
                  <input type="number" className="form-control" defaultValue={3} {...register('timeInHospital', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lab Procedures</label>
                  <input type="number" className="form-control" defaultValue={25} {...register('numLabProcedures', { required: 'Required' })} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">No. Medications</label>
                  <input type="number" className="form-control" defaultValue={10} {...register('numMedications', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">No. Diagnoses</label>
                  <input type="number" className="form-control" defaultValue={3} {...register('numDiagnoses', { required: 'Required' })} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Primary Diagnosis</label>
                  <input type="text" className="form-control" defaultValue="Diabetes" {...register('primaryDiagnosis', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary Diagnosis</label>
                  <input type="text" className="form-control" defaultValue="Hypertension" {...register('secondaryDiagnosis')} />
                </div>
              </div>

              <div className="grid-4">
                <div className="form-group">
                  <label className="form-label">Max Glucose</label>
                  <select className="form-control" defaultValue="None" {...register('maxGluSerum')}>
                    <option value="None">None</option>
                    <option value="Norm">Norm</option>
                    <option value=">200">&gt;200</option>
                    <option value=">300">&gt;300</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">HbA1c</label>
                  <select className="form-control" defaultValue="None" {...register('a1cResult')}>
                    <option value="None">None</option>
                    <option value="Norm">Norm</option>
                    <option value=">7">&gt;7</option>
                    <option value=">8">&gt;8</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Change meds</label>
                  <select className="form-control" defaultValue="false" {...register('changeInMeds')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Diabetes meds</label>
                  <select className="form-control" defaultValue="true" {...register('diabetesMed')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Discharge Disposition</label>
                <input type="text" className="form-control" defaultValue="Discharged to Home" {...register('dischargeDisposition')} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddAdmissionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Encounter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
