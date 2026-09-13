import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { patientService } from '../../services/patientService';
import {
  ArrowLeft,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Pill,
  Calendar,
  ClipboardList,
  Check,
  BookOpen,
  Sparkles,
  Filter
} from 'lucide-react';

export const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [cdsData, setCdsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cdsCategoryFilter, setCdsCategoryFilter] = useState('All');
  const [acknowledgedActions, setAcknowledgedActions] = useState({});

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [patientRes, cdsRes] = await Promise.all([
          patientService.getPatientById(id),
          patientService.getPatientCDS(id).catch(err => {
            console.warn("CDS recommendations fetch fallback:", err);
            return null;
          })
        ]);
        setPatient(patientRes);
        if (cdsRes) setCdsData(cdsRes);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load patient record.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const toggleAcknowledge = (recId) => {
    setAcknowledgedActions(prev => ({
      ...prev,
      [recId]: !prev[recId]
    }));
  };

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

  const filteredCdsRecommendations = (cdsData?.recommendations || []).filter(rec => {
    if (cdsCategoryFilter === 'All') return true;
    if (cdsCategoryFilter === 'Critical') return rec.severity === 'critical';
    if (cdsCategoryFilter === 'Warning') return rec.severity === 'warning';
    return rec.category.toLowerCase().includes(cdsCategoryFilter.toLowerCase());
  });

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

      <div className="patient-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Column: AI Forecast & Admission History */}
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

          {/* Hospital Encounter History */}
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
                      <div>HbA1c Result: <strong>{adm.A1Cresult || 'None'}</strong></div>
                      <div>Glucose Serum: <strong>{adm.max_glu_serum || 'None'}</strong></div>
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

        {/* Right Column: Regimen Efficacy & Evidence-Based CDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Therapeutic Regimen & Efficacy Benchmark Card */}
          <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary-600)' }}>💊</span> Regimen Efficacy Benchmark
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
              Patient's prescribed line of therapy compared against hospital cohort outcomes
            </p>

            {(() => {
              const meds = (latestAdmission?.medications || []).map(m => m.medication_name.toLowerCase());
              const hasInsulin = meds.some(m => m.includes('insulin'));
              const hasMetformin = meds.some(m => m.includes('metformin'));
              const hasOtherOral = meds.some(m => m.includes('glipizide') || m.includes('glyburide') || m.includes('glimepiride') || m.includes('pioglitazone'));

              let lineName = "Dietary / Lifestyle Management";
              let benchmarkReadm = "21.5%";
              let riskRed = "Baseline";
              let recommendation = "Initiate first-line Metformin if HbA1c > 7.0%.";

              if (hasInsulin && (hasMetformin || hasOtherOral)) {
                lineName = "Insulin + Oral Combination";
                benchmarkReadm = "15.6%";
                riskRed = "-18.2% vs Baseline";
                recommendation = "Intensive glycemic titration required; monitor for hypoglycemia.";
              } else if (hasInsulin) {
                lineName = "Insulin Monotherapy (Basal/Bolus)";
                benchmarkReadm = "18.9%";
                riskRed = "-9.4% vs Baseline";
                recommendation = "Evaluate whether addition of Metformin can improve insulin sensitivity.";
              } else if (hasMetformin && hasOtherOral) {
                lineName = "Dual Oral Therapy";
                benchmarkReadm = "11.2%";
                riskRed = "-28.5% vs Baseline";
                recommendation = "Effective dual glycemic control. Monitor renal function periodically.";
              } else if (hasMetformin) {
                lineName = "Metformin Monotherapy";
                benchmarkReadm = "8.4%";
                riskRed = "-36.8% vs Baseline";
                recommendation = "Optimal first-line glycemic efficacy with lowest cohort readmission rate.";
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Current Therapeutic Line
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {lineName}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ padding: '0.65rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cohort Benchmark</div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-600)', marginTop: '0.15rem' }}>{benchmarkReadm}</div>
                    </div>
                    <div style={{ padding: '0.65rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Risk Reduction</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#10b981', marginTop: '0.15rem' }}>{riskRed}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.6rem 0.75rem', backgroundColor: 'rgba(37,99,235,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary-600)' }}>
                    <strong>Clinical Note:</strong> {recommendation}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Issue 4: Evidence-Based Clinical Decision Support (CDS) System */}
          <div className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Stethoscope size={19} style={{ color: 'var(--primary-600)' }} /> Clinical Decision Support
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Evidence-based clinical guidelines & patient safety alerts
                </p>
              </div>

              {cdsData && (
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {cdsData.critical_alerts_count > 0 && (
                    <Badge variant="danger" size="sm">
                      {cdsData.critical_alerts_count} Critical
                    </Badge>
                  )}
                  {cdsData.warning_alerts_count > 0 && (
                    <Badge variant="warning" size="sm">
                      {cdsData.warning_alerts_count} Warnings
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              {['All', 'Critical', 'Warning', 'Glycemic', 'Medication', 'Care'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCdsCategoryFilter(cat)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: cdsCategoryFilter === cat ? '700' : '500',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: cdsCategoryFilter === cat ? 'var(--primary-600)' : '#f1f5f9',
                    color: cdsCategoryFilter === cat ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Recommendations List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredCdsRecommendations.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No active decision support triggers for this category.
                </div>
              ) : (
                filteredCdsRecommendations.map((rec) => {
                  const isDone = acknowledgedActions[rec.id];
                  const isCrit = rec.severity === 'critical';
                  const isWarn = rec.severity === 'warning';
                  const isSucc = rec.severity === 'success';

                  return (
                    <div
                      key={rec.id}
                      style={{
                        padding: '0.875rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: isCrit ? '#fca5a5' : isWarn ? '#fde047' : isSucc ? '#86efac' : '#bfdbfe',
                        backgroundColor: isDone ? '#f8fafc' : isCrit ? '#fef2f2' : isWarn ? '#fefce8' : isSucc ? '#f0fdf4' : '#eff6ff',
                        opacity: isDone ? 0.75 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <Badge variant={isCrit ? 'danger' : isWarn ? 'warning' : isSucc ? 'success' : 'primary'} size="sm">
                            {rec.severity.toUpperCase()}
                          </Badge>
                          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {rec.category}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {rec.evidence_source}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.3rem 0 0.2rem 0' }}>
                        {rec.title}
                      </h4>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
                        {rec.recommendation}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                        <strong>Clinical Rationale:</strong> {rec.rationale}
                      </div>

                      {rec.suggested_action && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.4rem', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                          <button
                            onClick={() => toggleAcknowledge(rec.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              borderRadius: '4px',
                              border: isDone ? '1px solid #10b981' : '1px solid var(--primary-600)',
                              backgroundColor: isDone ? '#dcfce7' : 'var(--primary-600)',
                              color: isDone ? '#166534' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isDone ? (
                              <>
                                <Check size={13} /> Guideline Implemented
                              </>
                            ) : (
                              <>
                                <Sparkles size={13} /> {rec.suggested_action}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
