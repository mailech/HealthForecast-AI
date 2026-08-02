import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';
import { Search, ArrowUpRight, UserPlus, X, Stethoscope, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientsListPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [riskCategory, setRiskCategory] = useState('');
  const [readmittedFilter, setReadmittedFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    patient_nbr: Math.floor(10000000 + Math.random() * 90000000),
    first_name: '',
    last_name: '',
    race: 'Caucasian',
    gender: 'Female',
    age: '[60-70)',
    weight: '[50-75kg)',
    payer_code: 'MC',
    admission_type: 'Emergency',
    medical_specialty: 'InternalMedicine',
    time_in_hospital: 5,
    num_lab_procedures: 52,
    num_procedures: 1,
    num_medications: 14,
    number_outpatient: 0,
    number_emergency: 0,
    number_inpatient: 1,
    diag_1: '250.00 Diabetes Mellitus',
    diag_2: '401.90 Essential Hypertension',
    diag_3: '414.01 Coronary Atherosclerosis',
    max_glu_serum: 'Norm',
    A1Cresult: '>8',
    change: 'Ch',
    diabetesMed: 'Yes',
    medications: [
      { medication_name: 'Metformin', dosage_status: 'Steady' },
      { medication_name: 'Insulin', dosage_status: 'Up' }
    ]
  });

  const { user } = useAuth();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (riskCategory) params.risk_category = riskCategory;
      if (readmittedFilter) params.readmitted = readmittedFilter;

      const data = await patientService.getPatients(params);
      setPatients(data);
    } catch (err) {
      console.error("Error loading patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, riskCategory, readmittedFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await patientService.createPatientWithAdmission({
        ...formData,
        patient_nbr: parseInt(formData.patient_nbr, 10),
        time_in_hospital: parseInt(formData.time_in_hospital, 10),
        num_lab_procedures: parseInt(formData.num_lab_procedures, 10),
        num_medications: parseInt(formData.num_medications, 10),
        number_inpatient: parseInt(formData.number_inpatient, 10),
      });

      setIsModalOpen(false);
      fetchPatients();
      setFormData(prev => ({
        ...prev,
        patient_nbr: Math.floor(10000000 + Math.random() * 90000000),
        first_name: '',
        last_name: ''
      }));
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to add patient record.");
    } finally {
      setSubmitting(false);
    }
  };

  const isResearcher = user?.role === 'researcher';
  const canAddPatient = ['doctor', 'hospital_admin', 'system_admin'].includes(user?.role);

  return (
    <DashboardLayout title={isResearcher ? "Anonymized Patient Dataset Directory" : "Patient Record Registry"}>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="patient-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Clinical Patient Database
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Predict readmission risk, manage clinical encounters & medical histories
            </p>
          </div>

          {canAddPatient && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
            >
              <UserPlus size={16} />
              <span>+ Add Patient & Medical History</span>
            </button>
          )}
        </div>

        <div className="patient-filters-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isResearcher ? "Search by Patient NBR..." : "Search by name or patient number..."}
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          <div>
            <select
              value={riskCategory}
              onChange={(e) => setRiskCategory(e.target.value)}
              className="form-control"
            >
              <option value="">All Risk Categories</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>
          </div>

          <div>
            <select
              value={readmittedFilter}
              onChange={(e) => setReadmittedFilter(e.target.value)}
              className="form-control"
            >
              <option value="">All Readmission Statuses</option>
              <option value="<30">Readmitted &lt;30 Days</option>
              <option value=">30">Readmitted &gt;30 Days</option>
              <option value="NO">No Readmission</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Patient NBR</th>
                {!isResearcher && <th style={{ padding: '0.75rem' }}>Patient Name</th>}
                <th style={{ padding: '0.75rem' }}>Demographics (Age/Race/Gender)</th>
                {!isResearcher && <th style={{ padding: '0.75rem' }}>Assigned Physician</th>}
                <th style={{ padding: '0.75rem' }}>AI Risk Score</th>
                <th style={{ padding: '0.75rem' }}>Risk Level</th>
                <th style={{ padding: '0.75rem' }}>Readmit Forecast</th>
                {!isResearcher && <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={isResearcher ? 6 : 8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: '600' }}>
                      #{p.patient_nbr}
                    </td>
                    {!isResearcher && (
                      <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                        {p.first_name} {p.last_name}
                      </td>
                    )}
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {p.age} | {p.race} | {p.gender}
                    </td>
                    {!isResearcher && (
                      <td style={{ padding: '0.75rem' }}>
                        {p.assigned_doctor_name || 'Unassigned'}
                      </td>
                    )}
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>
                      {p.latest_risk_score}%
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={
                        p.latest_risk_category === 'High' ? 'danger' :
                        p.latest_risk_category === 'Medium' ? 'warning' : 'success'
                      }>
                        {p.latest_risk_category} Risk
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={p.latest_readmission_status === '<30' ? 'danger' : 'default'}>
                        {p.latest_readmission_status === '<30' ? '<30 Days' : p.latest_readmission_status}
                      </Badge>
                    </td>
                    {!isResearcher && (
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <Link to={`/patients/${p.id}`} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                          View Profile <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card modal-card" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', pb: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={22} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Add Patient & Clinical Encounter Record
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-50)', color: 'var(--danger-700)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddPatientSubmit}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                1. Patient Demographics
              </div>
              <div className="modal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">First Name *</label>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} placeholder="e.g. Samantha" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} placeholder="e.g. Miller" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Age Bracket</label>
                  <select name="age" value={formData.age} onChange={handleInputChange} className="form-control">
                    <option value="[30-40)">[30-40)</option>
                    <option value="[40-50)">[40-50)</option>
                    <option value="[50-60)">[50-60)</option>
                    <option value="[60-70)">[60-70)</option>
                    <option value="[70-80)">[70-80)</option>
                    <option value="[80-90)">[80-90)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="form-control">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Race / Ethnicity</label>
                  <select name="race" value={formData.race} onChange={handleInputChange} className="form-control">
                    <option value="Caucasian">Caucasian</option>
                    <option value="AfricanAmerican">African American</option>
                    <option value="Hispanic">Hispanic</option>
                    <option value="Asian">Asian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Patient NBR #</label>
                  <input type="number" name="patient_nbr" required value={formData.patient_nbr} onChange={handleInputChange} className="form-control" />
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                2. Clinical Findings & Encounter Data (Used by AI Engine)
              </div>
              <div className="modal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Primary Diagnosis (ICD-9)</label>
                  <input type="text" name="diag_1" value={formData.diag_1} onChange={handleInputChange} className="form-control" />
                </div>
                <div>
                  <label className="form-label">HbA1c Test Result</label>
                  <select name="A1Cresult" value={formData.A1Cresult} onChange={handleInputChange} className="form-control">
                    <option value=">8">High (&gt;8%)</option>
                    <option value=">7">Elevated (&gt;7%)</option>
                    <option value="Norm">Normal</option>
                    <option value="None">None Tested</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Glucose Serum Test</label>
                  <select name="max_glu_serum" value={formData.max_glu_serum} onChange={handleInputChange} className="form-control">
                    <option value=">300">High (&gt;300 mg/dL)</option>
                    <option value=">200">Elevated (&gt;200 mg/dL)</option>
                    <option value="Norm">Normal</option>
                    <option value="None">None Tested</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Time in Hospital (Days)</label>
                  <input type="number" name="time_in_hospital" value={formData.time_in_hospital} onChange={handleInputChange} className="form-control" />
                </div>
                <div>
                  <label className="form-label">Number of Lab Procedures</label>
                  <input type="number" name="num_lab_procedures" value={formData.num_lab_procedures} onChange={handleInputChange} className="form-control" />
                </div>
                <div>
                  <label className="form-label">Prior Inpatient Admissions</label>
                  <input type="number" name="number_inpatient" value={formData.number_inpatient} onChange={handleInputChange} className="form-control" />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Analyzing & Saving...' : 'Analyze Risk & Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
