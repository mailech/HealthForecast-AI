import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import {
  ArrowLeft, Edit, Calendar, Phone, Mail, MapPin,
  Activity, X, Plus, Stethoscope, Pill, FileText, Save
} from 'lucide-react'

// ── Reusable Modal wrapper ──────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  </div>
)

// ── Field helpers ────────────────────────────────────────────────
const Field = ({ label, name, value, onChange, type = 'text', required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children || (
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    )}
  </div>
)

const Select = ({ label, name, value, onChange, required, options }) => (
  <Field label={label} name={name} value={value} onChange={onChange} required={required}>
    <select name={name} value={value} onChange={onChange} required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white">
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </Field>
)

// ── Edit Patient Modal ───────────────────────────────────────────
const EditPatientModal = ({ patient, onClose, onSaved }) => {
  const [form, setForm] = useState({
    first_name: patient.first_name || '',
    last_name: patient.last_name || '',
    phone: patient.phone || '',
    email: patient.email || '',
    address: patient.address || '',
    city: patient.city || '',
    state: patient.state || '',
    zip_code: patient.zip_code || '',
    emergency_contact_name: patient.emergency_contact_name || '',
    emergency_contact_phone: patient.emergency_contact_phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.put(`/patients/${patient.id}`, form)
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update patient.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Edit Patient" onClose={onClose}>
      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
          <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        </div>
        <Field label="Address" name="address" value={form.address} onChange={handleChange} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="City" name="city" value={form.city} onChange={handleChange} />
          <Field label="State" name="state" value={form.state} onChange={handleChange} />
          <Field label="ZIP" name="zip_code" value={form.zip_code} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Emergency Contact" name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} />
          <Field label="Emergency Phone" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center">
            <Save className="w-4 h-4 mr-1" />{loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Add Medical History Modal ────────────────────────────────────
const AddMedicalHistoryModal = ({ patientId, onClose, onSaved }) => {
  const [form, setForm] = useState({ condition: '', diagnosis_date: '', status: 'Active', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        patient_id: patientId,
        condition: form.condition,
        status: form.status,
        notes: form.notes,
        diagnosis_date: form.diagnosis_date ? form.diagnosis_date + 'T00:00:00' : null,
      }
      const res = await api.post('/medical-history/', payload)
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add medical history.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Add Medical History Record" onClose={onClose}>
      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Condition" name="condition" value={form.condition} onChange={handleChange} required />
        <Field label="Diagnosis Date" name="diagnosis_date" type="date" value={form.diagnosis_date} onChange={handleChange} />
        <Select label="Status" name="status" value={form.status} onChange={handleChange}
          options={['Active', 'Resolved', 'Chronic', 'In Remission']} />
        <Field label="Notes" name="notes" value={form.notes} onChange={handleChange}>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </Field>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center">
            <Plus className="w-4 h-4 mr-1" />{loading ? 'Adding…' : 'Add Record'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Add Admission Modal ──────────────────────────────────────────
const AddAdmissionModal = ({ patientId, onClose, onSaved }) => {
  const [form, setForm] = useState({
    admission_number: '', admission_date: '', discharge_date: '',
    admission_type: '', department: '', room_number: '',
    attending_physician: '', diagnosis: '', readmission_flag: 'No',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        patient_id: patientId,
        admission_number: form.admission_number,
        admission_date: form.admission_date,
        discharge_date: form.discharge_date || null,
        admission_type: form.admission_type,
        department: form.department,
        room_number: form.room_number,
        attending_physician: form.attending_physician,
        diagnosis: form.diagnosis,
        readmission_flag: form.readmission_flag,
      }
      const res = await api.post('/admissions/', payload)
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add admission.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Add Admission" onClose={onClose}>
      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Admission Number" name="admission_number" value={form.admission_number} onChange={handleChange} required />
          <Select label="Type" name="admission_type" value={form.admission_type} onChange={handleChange}
            options={['Emergency', 'Elective', 'Urgent', 'Newborn', 'Trauma']} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Admission Date" name="admission_date" type="date" value={form.admission_date} onChange={handleChange} required />
          <Field label="Discharge Date" name="discharge_date" type="date" value={form.discharge_date} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department" name="department" value={form.department} onChange={handleChange} />
          <Field label="Room Number" name="room_number" value={form.room_number} onChange={handleChange} />
        </div>
        <Field label="Attending Physician" name="attending_physician" value={form.attending_physician} onChange={handleChange} />
        <Field label="Diagnosis" name="diagnosis" value={form.diagnosis} onChange={handleChange} />
        <Select label="Readmission?" name="readmission_flag" value={form.readmission_flag} onChange={handleChange}
          options={['No', 'Yes']} />
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center">
            <Plus className="w-4 h-4 mr-1" />{loading ? 'Adding…' : 'Add Admission'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Add Treatment Modal ──────────────────────────────────────────
const AddTreatmentModal = ({ patientId, admissions, onClose, onSaved }) => {
  const [form, setForm] = useState({
    treatment_name: '', treatment_type: '', admission_id: '',
    start_date: '', end_date: '', dosage: '',
    frequency: '', prescribed_by: '', notes: '', outcome: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        patient_id: patientId,
        treatment_name: form.treatment_name,
        treatment_type: form.treatment_type || null,
        admission_id: form.admission_id ? parseInt(form.admission_id) : null,
        start_date: form.start_date ? form.start_date + 'T00:00:00' : null,
        end_date: form.end_date ? form.end_date + 'T00:00:00' : null,
        dosage: form.dosage || null,
        frequency: form.frequency || null,
        prescribed_by: form.prescribed_by || null,
        notes: form.notes || null,
        outcome: form.outcome || null,
      }
      const res = await api.post('/treatments/', payload)
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add treatment.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Add Treatment" onClose={onClose}>
      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Treatment Name" name="treatment_name" value={form.treatment_name} onChange={handleChange} required />
          <Select label="Type" name="treatment_type" value={form.treatment_type} onChange={handleChange}
            options={['Medication', 'Surgery', 'Therapy', 'Procedure', 'Monitoring', 'Other']} />
        </div>
        {admissions.length > 0 && (
          <Field label="Linked Admission" name="admission_id" value={form.admission_id} onChange={handleChange}>
            <select name="admission_id" value={form.admission_id} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="">None</option>
              {admissions.map(a => (
                <option key={a.id} value={a.id}>{a.admission_number} — {a.admission_date}</option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" name="start_date" type="date" value={form.start_date} onChange={handleChange} />
          <Field label="End Date" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dosage" name="dosage" value={form.dosage} onChange={handleChange} />
          <Field label="Frequency" name="frequency" value={form.frequency} onChange={handleChange} />
        </div>
        <Field label="Prescribed By" name="prescribed_by" value={form.prescribed_by} onChange={handleChange} />
        <Field label="Notes" name="notes" value={form.notes} onChange={handleChange}>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </Field>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center">
            <Plus className="w-4 h-4 mr-1" />{loading ? 'Adding…' : 'Add Treatment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Main PatientDetails Page ─────────────────────────────────────
const PatientDetails = () => {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [medicalHistory, setMedicalHistory] = useState([])
  const [admissions, setAdmissions] = useState([])
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal visibility
  const [showEditPatient, setShowEditPatient] = useState(false)
  const [showAddHistory, setShowAddHistory] = useState(false)
  const [showAddAdmission, setShowAddAdmission] = useState(false)
  const [showAddTreatment, setShowAddTreatment] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      const [patientRes, historyRes, admissionsRes, treatmentsRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/medical-history/patient/${id}`),
        api.get(`/admissions/patient/${id}`),
        api.get(`/treatments/patient/${id}`),
      ])
      setPatient(patientRes.data)
      setMedicalHistory(historyRes.data)
      setAdmissions(admissionsRes.data)
      setTreatments(treatmentsRes.data)
    } catch (err) {
      console.error('Failed to fetch patient details:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  )

  if (!patient) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Patient not found</p>
      <Link to="/patients" className="btn-primary mt-4 inline-block">Back to Patients</Link>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Modals */}
      {showEditPatient && (
        <EditPatientModal patient={patient} onClose={() => setShowEditPatient(false)}
          onSaved={updated => setPatient(updated)} />
      )}
      {showAddHistory && (
        <AddMedicalHistoryModal patientId={patient.id} onClose={() => setShowAddHistory(false)}
          onSaved={rec => setMedicalHistory(prev => [rec, ...prev])} />
      )}
      {showAddAdmission && (
        <AddAdmissionModal patientId={patient.id} onClose={() => setShowAddAdmission(false)}
          onSaved={rec => setAdmissions(prev => [rec, ...prev])} />
      )}
      {showAddTreatment && (
        <AddTreatmentModal patientId={patient.id} admissions={admissions}
          onClose={() => setShowAddTreatment(false)}
          onSaved={rec => setTreatments(prev => [rec, ...prev])} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/patients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h1>
            <p className="text-gray-500 text-sm">Patient ID: {patient.patient_id}</p>
          </div>
        </div>
        <button onClick={() => setShowEditPatient(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Edit className="w-4 h-4 mr-2" /> Edit Patient
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-3">
              {[
                { icon: Calendar, label: 'Date of Birth', value: patient.date_of_birth },
                { icon: () => <span className="text-gray-400 text-base">👤</span>, label: 'Gender', value: patient.gender },
                { icon: Phone, label: 'Phone', value: patient.phone || 'Not provided' },
                { icon: Mail, label: 'Email', value: patient.email || 'Not provided' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-xs text-gray-500">{label}</p><p className="text-sm text-gray-900">{value}</p></div>
                </div>
              ))}
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">
                    {[patient.address, patient.city, patient.state, patient.zip_code].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-gray-500">Name</p><p className="text-sm text-gray-900">{patient.emergency_contact_name || 'Not provided'}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm text-gray-900">{patient.emergency_contact_phone || 'Not provided'}</p></div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Medical History */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" /> Medical History
              </h3>
              <button onClick={() => setShowAddHistory(true)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium">
                <Plus className="w-4 h-4 mr-1" /> Add Record
              </button>
            </div>
            {medicalHistory.length > 0 ? (
              <div className="space-y-3">
                {medicalHistory.map(h => (
                  <div key={h.id} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{h.condition}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Diagnosed: {h.diagnosis_date ? new Date(h.diagnosis_date).toLocaleDateString() : 'N/A'}</p>
                      {h.notes && <p className="text-sm text-gray-600 mt-1">{h.notes}</p>}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${h.status === 'Active' ? 'bg-green-100 text-green-800' : h.status === 'Resolved' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                      {h.status || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No medical history records</p>
                <button onClick={() => setShowAddHistory(true)} className="mt-2 text-primary-600 text-sm hover:underline">+ Add first record</button>
              </div>
            )}
          </div>

          {/* Admissions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary-600" /> Admissions
              </h3>
              <button onClick={() => setShowAddAdmission(true)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium">
                <Plus className="w-4 h-4 mr-1" /> Add Admission
              </button>
            </div>
            {admissions.length > 0 ? (
              <div className="space-y-3">
                {admissions.map(a => (
                  <div key={a.id} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{a.admission_number}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Admitted: {new Date(a.admission_date).toLocaleDateString()}
                        {a.discharge_date && ` · Discharged: ${new Date(a.discharge_date).toLocaleDateString()}`}
                      </p>
                      {a.department && <p className="text-sm text-gray-600 mt-1">Dept: {a.department}</p>}
                      {a.diagnosis && <p className="text-sm text-gray-600">Diagnosis: {a.diagnosis}</p>}
                      {a.attending_physician && <p className="text-sm text-gray-600">Physician: {a.attending_physician}</p>}
                    </div>
                    {a.readmission_flag === 'Yes' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex-shrink-0 ml-2">Readmission</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No admission records</p>
                <button onClick={() => setShowAddAdmission(true)} className="mt-2 text-primary-600 text-sm hover:underline">+ Add first admission</button>
              </div>
            )}
          </div>

          {/* Treatments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Pill className="w-5 h-5 mr-2 text-primary-600" /> Treatments
              </h3>
              <button onClick={() => setShowAddTreatment(true)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium">
                <Plus className="w-4 h-4 mr-1" /> Add Treatment
              </button>
            </div>
            {treatments.length > 0 ? (
              <div className="space-y-3">
                {treatments.map(t => (
                  <div key={t.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t.treatment_name}</p>
                        {t.treatment_type && <p className="text-xs text-gray-500 mt-0.5">{t.treatment_type}</p>}
                        {t.dosage && <p className="text-sm text-gray-600 mt-1">Dosage: {t.dosage} {t.frequency && `· ${t.frequency}`}</p>}
                        {t.prescribed_by && <p className="text-sm text-gray-600">By: {t.prescribed_by}</p>}
                        {t.notes && <p className="text-sm text-gray-500 mt-1 italic">{t.notes}</p>}
                      </div>
                      {t.outcome && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex-shrink-0 ml-2">{t.outcome}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No treatment records</p>
                <button onClick={() => setShowAddTreatment(true)} className="mt-2 text-primary-600 text-sm hover:underline">+ Add first treatment</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default PatientDetails
