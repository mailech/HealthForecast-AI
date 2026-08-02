import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { patientService } from '../../services/patientService';
import { ArrowLeft, Stethoscope } from 'lucide-react';

export const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await patientService.getPatientById(id);
        setPatient(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load patient record.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Patient Intelligence Profile">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading patient clinical profile...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return (
      <DashboardLayout title="Patient Intelligence Profile">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--danger-700)', marginBottom: '0.5rem' }}>Access Denied or Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/patients" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Patient Directory
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const latestAdmission = patient.admissions?.[0];

  return (
    <DashboardLayout title={`Patient Record #${patient.patient_nbr}`}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary-600)' }}>
          <ArrowLeft size={16} /> Back to Patient Directory
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="patient-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}>
              {patient.first_name ? patient.first_name.charAt(0) : 'P'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {patient.first_name} {patient.last_name}
                </h2>
                <Badge variant={
                  patient.latest_risk_category === 'High' ? 'danger' :
                  patient.latest_risk_category === 'Medium' ? 'warning' : 'success'
                }>
                  {patient.latest_risk_category} Readmission Risk
                </Badge>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Patient ID: #{patient.patient_nbr} | Age Bracket: {patient.age} | Gender: {patient.gender} | Race: {patient.race}
              </p>
            </div>
          </div>

          <div className="patient-header-right" style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Physician</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {patient.assigned_doctor_name || 'Unassigned'}
            </div>
          </div>
        </div>
      </div>

      <div className="patient-detail-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ backgroundColor: patient.latest_risk_category === 'High' ? '#fef2f2' : '#ffffff', borderColor: patient.latest_risk_category === 'High' ? '#fecaca' : 'var(--border-color)' }}>
            <div className="risk-forecast-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  AI Readmission Probability Forecast
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Calculated based on encounter laboratory tests, prior inpatient history & diabetes medication changes
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: patient.latest_risk_score > 60 ? 'var(--danger-500)' : 'var(--primary-600)' }}>
                  {patient.latest_risk_score}%
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Risk Score
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Hospital Encounter History
            </h3>
            {patient.admissions && patient.admissions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {patient.admissions.map((adm) => (
                  <div key={adm.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }}>
                    <div className="encounter-header-flex" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        Encounter #{adm.encounter_id} ({adm.medical_specialty})
                      </span>
                      <Badge variant={adm.readmitted === '<30' ? 'danger' : 'default'}>
                        Readmission Status: {adm.readmitted}
                      </Badge>
                    </div>

                    <div className="encounter-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      <div>Time in Hospital: <strong>{adm.time_in_hospital} Days</strong></div>
                      <div>Lab Procedures: <strong>{adm.num_lab_procedures}</strong></div>
                      <div>HbA1c Result: <strong>{adm.A1Cresult}</strong></div>
                      <div>Glucose Serum: <strong>{adm.max_glu_serum}</strong></div>
                    </div>

                    <div style={{ fontSize: '0.8125rem' }}>
                      <strong>Primary Diagnosis (ICD-9):</strong> {adm.diag_1 || '250.00 Diabetes Mellitus'}
                    </div>

                    {adm.medications && adm.medications.length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Prescribed Medication Regimen
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {adm.medications.map((m) => (
                            <span key={m.id} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                              💊 {m.medication_name} ({m.dosage_status})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No admission history recorded.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope size={18} /> Clinical Decision Support
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#15803d', marginBottom: '1rem' }}>
              AI-generated recommendations for discharge & post-acute care
            </p>

            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Schedule 7-day post-discharge follow-up appointment with Endocrinology.</li>
              <li>Monitor HbA1c levels — last recorded result was <strong>{latestAdmission?.A1Cresult || 'Norm'}</strong>.</li>
              <li>Adjust diabetes medication dosage: verify patient compliance on Metformin / Insulin regimen.</li>
              <li>Provide home glucose monitoring equipment and outpatient nurse check-in call within 48 hours.</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
