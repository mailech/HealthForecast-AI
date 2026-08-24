import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient_id: '', doctor_id: user?.id || '', appointment_date: '', appointment_time: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const loadAppointments = () => api.get('/appointments/').then((response) => setAppointments(response.data)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  useEffect(() => {
    loadAppointments();
    patientService.getAll().then(setPatients).catch((requestError) => setError(requestError.message));
    if (user?.role === 'Doctor') {
      setDoctors([user]);
    } else {
      api.get('/users/?role=Doctor').then((response) => setDoctors(response.data)).catch((requestError) => setError(requestError.message));
    }
  }, []);
  const createAppointment = async (event) => {
    event.preventDefault(); setError('');
    try { await api.post('/appointments/', { ...form, patient_id: Number(form.patient_id), doctor_id: Number(form.doctor_id) }); setForm({ ...form, notes: '' }); await loadAppointments(); }
    catch (requestError) { setError(requestError.message); }
  };
  return <DashboardLayout><Breadcrumb items={[{ label: 'Appointments' }]} /><div className="mb-6"><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Appointments</h1><p className="text-slate-500 text-sm mt-1">Schedule and review appointments stored in the hospital database</p></div>
    <form onSubmit={createAppointment} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3"><select className="input-field" aria-label="Patient" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name} (#{patient.id})</option>)}</select><select className="input-field" aria-label="Doctor" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required><option value="">Select doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.full_name}</option>)}</select><input className="input-field" type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required /><input className="input-field" type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} required /><button className="btn-primary" type="submit">Schedule</button><textarea className="input-field sm:col-span-2 lg:col-span-5" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></form>
    {error && <p className="text-sm text-red-600 mb-4">{error}</p>}{loading ? <p className="text-slate-500">Loading appointments...</p> : appointments.length === 0 ? <p className="text-slate-500">No appointments scheduled.</p> : <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-50 dark:bg-slate-700/50"><tr>{['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Notes'].map((heading) => <th className="px-5 py-3 text-left text-xs text-slate-500 uppercase" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{appointments.map((appointment) => <tr key={appointment.id}><td className="px-5 py-3">{appointment.patient_name}</td><td className="px-5 py-3">{appointment.doctor_name}</td><td className="px-5 py-3">{appointment.appointment_date}</td><td className="px-5 py-3">{appointment.appointment_time}</td><td className="px-5 py-3 capitalize">{appointment.status}</td><td className="px-5 py-3">{appointment.notes || '—'}</td></tr>)}</tbody></table></div>}</DashboardLayout>;
}
