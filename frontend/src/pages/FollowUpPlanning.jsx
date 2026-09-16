import { useState } from 'react'
import { Calendar, Clock, CheckCircle2, User, Plus, PhoneCall, Video, X, Edit3, Trash2 } from 'lucide-react'

export default function FollowUpPlanning() {
  const [appointments, setAppointments] = useState([
    { id: 1, patient: 'Robert Chen', age: 67, type: 'Tele-Health Video', date: 'Tomorrow, 10:00 AM', status: 'Scheduled', risk: 'High' },
    { id: 2, patient: 'Maria Garcia', age: 72, type: 'In-Clinic Checkup', date: 'Sep 18, 2:30 PM', status: 'Confirmed', risk: 'High' },
    { id: 3, patient: 'James Wilson', age: 58, type: 'Nurse Phone Follow-up', date: 'Sep 20, 11:15 AM', status: 'Pending', risk: 'Medium' },
    { id: 4, patient: 'Eleanor Vance', age: 81, type: 'Lab Test Review', date: 'Sep 22, 09:00 AM', status: 'Scheduled', risk: 'High' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApt, setEditingApt] = useState(null)
  const [formData, setFormData] = useState({
    patient: 'Robert Chen',
    age: 67,
    type: 'Tele-Health Video',
    date: '2026-09-18T10:00',
    risk: 'High',
  })

  const openScheduleModal = (apt = null) => {
    if (apt) {
      setEditingApt(apt)
      setFormData({
        patient: apt.patient,
        age: apt.age,
        type: apt.type,
        date: '2026-09-18T10:00',
        risk: apt.risk,
      })
    } else {
      setEditingApt(null)
      setFormData({
        patient: 'New Patient',
        age: 65,
        type: 'Tele-Health Video',
        date: '2026-09-19T11:00',
        risk: 'High',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editingApt) {
      setAppointments(prev => prev.map(a => a.id === editingApt.id ? {
        ...a,
        patient: formData.patient,
        age: formData.age,
        type: formData.type,
        risk: formData.risk,
        date: 'Sep 19, 11:00 AM',
      } : a))
    } else {
      const newApt = {
        id: Date.now(),
        patient: formData.patient,
        age: Number(formData.age),
        type: formData.type,
        date: 'Sep 19, 11:00 AM',
        status: 'Scheduled',
        risk: formData.risk,
      }
      setAppointments(prev => [newApt, ...prev])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Doctor Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Post-Discharge Follow-up Planning</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule & monitor critical post-hospitalization consultations to prevent readmission</p>
        </div>

        <button
          onClick={() => openScheduleModal()}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule Follow-up
        </button>
      </div>

      {/* Appointment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {appointments.map(apt => (
          <div key={apt.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
                  {apt.patient.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{apt.patient}</h3>
                  <p className="text-xs text-gray-400">{apt.age} yrs old</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                apt.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {apt.risk} Risk
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between text-xs text-gray-600">
              <span className="font-semibold flex items-center gap-1.5">
                {apt.type.includes('Video') ? <Video className="w-4 h-4 text-blue-500" /> : <PhoneCall className="w-4 h-4 text-emerald-500" />}
                {apt.type}
              </span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {apt.date}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {apt.status}
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openScheduleModal(apt)}
                  className="text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(apt.id)}
                  className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingApt ? 'Edit Follow-up Consultation' : 'Schedule Post-Discharge Follow-up'}
                </h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Patient Name</label>
                <input
                  type="text"
                  required
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400">Readmission Risk Tier</label>
                  <select
                    value={formData.risk}
                    onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option value="High">High Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="Low">Low Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Consultation Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="Tele-Health Video">Tele-Health Video Call</option>
                  <option value="In-Clinic Checkup">In-Clinic Checkup Visit</option>
                  <option value="Nurse Phone Follow-up">Nurse Phone Call</option>
                  <option value="Lab Test Review">Lab Test & Diagnostics Review</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md"
              >
                {editingApt ? 'Save Changes' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
