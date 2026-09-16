import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

const PatientList = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPatient, setNewPatient] = useState({
    patient_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    fetchPatients()
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true)
    }
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients')
      setPatients(response.data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase()
    return (
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q) ||
      p.patient_id?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    )
  })

  const handleAddPatient = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setAddError('')

    const payload = {
      patient_id: newPatient.patient_id.trim(),
      first_name: newPatient.first_name.trim(),
      last_name: newPatient.last_name.trim(),
      date_of_birth: newPatient.date_of_birth,
      gender: newPatient.gender,
      phone: newPatient.phone.trim() || null,
      email: newPatient.email.trim() || null,
      address: newPatient.address.trim() || null,
      city: newPatient.city.trim() || null,
      state: newPatient.state.trim() || null,
      zip_code: newPatient.zip_code.trim() || null,
      emergency_contact_name: newPatient.emergency_contact_name.trim() || null,
      emergency_contact_phone: newPatient.emergency_contact_phone.trim() || null
    }

    try {
      const res = await api.post('/patients', payload)
      setPatients(prev => [res.data, ...prev])
      setShowAddModal(false)
      setNewPatient({
        patient_id: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      })
    } catch (error) {
      console.error('Failed to add patient:', error)
      setAddError(error.response?.data?.detail || 'Failed to add patient record. Please check input details.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePatient = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await api.delete(`/patients/${id}`)
        setPatients(prev => prev.filter(p => p.id !== id))
      } catch (error) {
        console.error('Failed to delete patient:', error)
        alert(error.response?.data?.detail || 'Failed to delete patient. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage patient records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Patient
        </button>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, patient ID, phone or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Patient ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Date of Birth</th>
                <th className="table-header">Gender</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{patient.patient_id}</td>
                  <td className="table-cell">
                    {patient.first_name} {patient.last_name}
                  </td>
                  <td className="table-cell">{patient.date_of_birth}</td>
                  <td className="table-cell">{patient.gender}</td>
                  <td className="table-cell">{patient.phone || '-'}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? `No patients match "${searchTerm}"` : 'No patients found'}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>
            {addError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient.patient_id}
                    onChange={(e) => setNewPatient({...newPatient, patient_id: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient.first_name}
                    onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient.last_name}
                    onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={newPatient.date_of_birth}
                    onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    required
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    className="input-field"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={newPatient.emergency_contact_name}
                    onChange={(e) => setNewPatient({...newPatient, emergency_contact_name: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newPatient.emergency_contact_phone}
                    onChange={(e) => setNewPatient({...newPatient, emergency_contact_phone: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newPatient.city}
                    onChange={(e) => setNewPatient({...newPatient, city: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newPatient.state}
                    onChange={(e) => setNewPatient({...newPatient, state: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={newPatient.zip_code}
                    onChange={(e) => setNewPatient({...newPatient, zip_code: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? 'Adding Patient...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientList
