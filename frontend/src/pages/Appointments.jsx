import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { getPatientLabel } from '../utils/patientUtils';
import {
  FiCalendar,
  FiPlus,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertTriangle,
  FiRefreshCw,
  FiX,
  FiUser,
} from 'react-icons/fi';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: user?.id || '',
    appointment_date: '',
    appointment_time: '',
    reminder_timing: 'At appointment time',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    appointment_date: '',
    appointment_time: '',
    reminder_timing: 'At appointment time',
    notes: '',
  });

  const loadAppointments = () =>
    api
      .get('/appointments/')
      .then((response) => setAppointments(response.data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadAppointments();
    patientService
      .getAll()
      .then(setPatients)
      .catch((requestError) => setError(requestError.message));

    const normalizedRole = user?.role?.toString().toLowerCase().replace(/\s+/g, '_');
    if (normalizedRole === 'doctor') {
      setDoctors([user]);
    } else {
      api
        .get('/users/?role=Doctor')
        .then((response) => setDoctors(response.data))
        .catch((requestError) => setError(requestError.message));
    }
  }, [user]);

  const createAppointment = async (event) => {
    event.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      await api.post('/appointments/', {
        ...form,
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
      });

      setForm({
        patient_id: '',
        doctor_id: user?.id || '',
        appointment_date: '',
        appointment_time: '',
        reminder_timing: 'At appointment time',
        notes: '',
      });

      await loadAppointments();
    } catch (requestError) {
      setError(requestError.message || 'Failed to schedule appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setError('');
    setActionLoading(true);
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      await loadAppointments();
    } catch (requestError) {
      setError(requestError.message || `Failed to mark appointment as ${newStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setError('');
    setActionLoading(true);
    try {
      await api.patch(`/appointments/${id}/cancel`);
      await loadAppointments();
    } catch (requestError) {
      setError(requestError.message || 'Failed to cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleForm({
      appointment_date: appointment.appointment_date || '',
      appointment_time: appointment.appointment_time || '',
      reminder_timing: appointment.reminder_timing || 'At appointment time',
      notes: appointment.notes || '',
    });
    setRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleRescheduleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedAppointment) return;
    setError('');
    setActionLoading(true);
    try {
      await api.post(`/appointments/${selectedAppointment.id}/reschedule`, rescheduleForm);
      closeRescheduleModal();
      await loadAppointments();
    } catch (requestError) {
      setError(requestError.message || 'Failed to reschedule appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // KPI Counts
  const scheduledCount = appointments.filter((a) => a.status === 'scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const missedCount = appointments.filter((a) => a.status === 'missed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
            <FiCheckCircle size={12} /> Completed
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 capitalize">
            <FiAlertTriangle size={12} /> Missed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 capitalize">
            <FiXCircle size={12} /> Cancelled
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize">
            <FiClock size={12} /> Scheduled
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Appointments' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Appointment Scheduling</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Schedule and manage clinical appointments with real-time status updates and reminder notifications.
        </p>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{scheduledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FiClock size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FiCheckCircle size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Missed</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{missedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <FiAlertTriangle size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Cancelled</p>
            <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400 mt-1">{cancelledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
            <FiXCircle size={18} />
          </div>
        </div>
      </div>

      {/* SCHEDULE FORM */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-6">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-indigo-600 dark:text-indigo-400" size={16} /> Schedule New Appointment
        </h2>

        <form onSubmit={createAppointment} className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Patient Select */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                Select Patient
              </label>
              <select
                className="input-field text-sm"
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                required
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getPatientLabel(p)}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Select */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                Attending Doctor
              </label>
              <select
                className="input-field text-sm"
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name || d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reminder Timing Dropdown */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                Reminder Notification
              </label>
              <select
                className="input-field text-sm"
                value={form.reminder_timing}
                onChange={(e) => setForm({ ...form, reminder_timing: e.target.value })}
              >
                <option value="At appointment time">At appointment time</option>
                <option value="1 day before">1 day before</option>
                <option value="2 days before">2 days before</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                Appointment Date
              </label>
              <input
                className="input-field text-sm"
                type="date"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                Appointment Time
              </label>
              <input
                className="input-field text-sm"
                type="time"
                value={form.appointment_time}
                onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                disabled={actionLoading}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                type="submit"
              >
                <FiPlus size={15} /> Schedule Appointment
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
              Clinical Notes (Optional)
            </label>
            <textarea
              className="input-field text-sm h-20"
              placeholder="Add clinical instructions or notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </form>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl mb-4 border border-red-200 dark:border-red-900/50">
          {error}
        </p>
      )}

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
            Clinical Appointments ({appointments.length})
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Showing all appointments
          </span>
        </div>

        {loading ? (
          <p className="p-8 text-center text-xs text-zinc-400">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="p-8 text-center text-xs text-zinc-400">No appointments scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40">
                <tr>
                  {['Patient', 'Doctor', 'Date', 'Time', 'Reminder', 'Status', 'Notes', 'Actions'].map((heading) => (
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                      key={heading}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {appointments.map((appointment) => {
                  const statusLower = appointment.status?.toLowerCase();
                  return (
                    <tr key={appointment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white text-xs">
                        {appointment.patient_name}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
                        {appointment.doctor_name}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                        {appointment.appointment_date}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                        {appointment.appointment_time}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                        {appointment.reminder_timing || 'At appointment time'}
                      </td>
                      <td className="px-4 py-3">{renderStatusBadge(appointment.status)}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs truncate">
                        {appointment.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {statusLower === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                disabled={actionLoading}
                                title="Mark Completed"
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                              >
                                <FiCheckCircle size={12} /> Mark Completed
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'missed')}
                                disabled={actionLoading}
                                title="Mark Missed"
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1"
                              >
                                <FiAlertTriangle size={12} /> Mark Missed
                              </button>
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                disabled={actionLoading}
                                title="Cancel Appointment"
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1"
                              >
                                <FiXCircle size={12} /> Cancel
                              </button>
                            </>
                          )}

                          {statusLower === 'missed' && (
                            <button
                              onClick={() => openRescheduleModal(appointment)}
                              disabled={actionLoading}
                              title="Reschedule Appointment"
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1"
                            >
                              <FiRefreshCw size={12} /> Reschedule
                            </button>
                          )}

                          {statusLower === 'completed' && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              Completed
                            </span>
                          )}

                          {statusLower === 'cancelled' && (
                            <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <FiRefreshCw size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Reschedule Appointment</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Update date and time for missed clinical visit</p>
                </div>
              </div>
              <button
                onClick={closeRescheduleModal}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Current Details Summary */}
            <div className="px-6 py-3 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-xs text-zinc-700 dark:text-zinc-300 grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Patient: </span>
                <span className="font-bold text-zinc-900 dark:text-white">{selectedAppointment.patient_name}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Doctor: </span>
                <span className="font-bold text-zinc-900 dark:text-white">{selectedAppointment.doctor_name}</span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Current Visit: </span>
                <span className="font-medium text-rose-600 dark:text-rose-400">
                  {selectedAppointment.appointment_date} at {selectedAppointment.appointment_time} (Missed)
                </span>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                    New Date
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field text-sm"
                    value={rescheduleForm.appointment_date}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointment_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                    New Time
                  </label>
                  <input
                    type="time"
                    required
                    className="input-field text-sm"
                    value={rescheduleForm.appointment_time}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointment_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                  Reminder Timing
                </label>
                <select
                  className="input-field text-sm"
                  value={rescheduleForm.reminder_timing}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reminder_timing: e.target.value })}
                >
                  <option value="At appointment time">At appointment time</option>
                  <option value="1 day before">1 day before</option>
                  <option value="2 days before">2 days before</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                  Reschedule Notes / Reason
                </label>
                <textarea
                  className="input-field text-sm h-20"
                  placeholder="Enter notes regarding rescheduling..."
                  value={rescheduleForm.notes}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, notes: e.target.value })}
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FiRefreshCw size={13} /> Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
