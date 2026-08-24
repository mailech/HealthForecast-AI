import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import RiskBadge from '../components/common/RiskBadge';
import SearchBar from '../components/common/SearchBar';
import { FiUserPlus } from 'react-icons/fi';
import PatientForm from '../components/forms/PatientForm';
import { patientService } from '../services/patientService';

export default function PatientManagement() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { patientService.getAll().then(setPatients).catch((e) => setError(e.message)); }, []);
  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.toLowerCase().includes(search.toLowerCase())
  );
  const createPatient = async (data) => {
    try {
      const name = data.name.trim().split(/\s+/);
      const created = await patientService.create({ mrn: data.mrn, first_name: name[0], last_name: name.slice(1).join(' ') || name[0], gender: data.gender, age: Number(data.age) });
      setPatients((current) => [...current, created]); setShowForm(false); setError('');
    } catch (e) { setError(e.message); }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Patient Management' }]} />
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Patient Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage all patient records</p>
        </div>
        <button onClick={() => setShowForm((current) => !current)} className="btn-primary flex items-center gap-2 text-sm">
          <FiUserPlus size={16} /> Add Patient
        </button>
      </div>
      {showForm && <div className="mb-6 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700"><PatientForm onSubmit={createPatient} /></div>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">All Patients ({filtered.length})</h3>
          <SearchBar value={search} onChange={setSearch} placeholder="Search patients..." className="w-56" />
        </div>
        {filtered.length === 0 ? <p className="p-8 text-center text-slate-500">No patients found.</p> : <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['ID', 'Patient', 'Age', 'Gender', 'Diagnosis', 'Risk', 'Admitted', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {`${p.first_name} ${p.last_name}`.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{p.first_name} {p.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.age}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.gender}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.mrn}</td>
                  <td className="px-4 py-3"><RiskBadge level="low" /></td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{p.admission_date || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${p.status === 'critical' ? 'bg-purple-100 text-purple-700' : p.status === 'stable' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </div>
    </DashboardLayout>
  );
}
