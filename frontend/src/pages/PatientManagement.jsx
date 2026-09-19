import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import SearchBar from '../components/common/SearchBar';
import { FiUserPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PatientForm from '../components/forms/PatientForm';
import { patientService } from '../services/patientService';

export default function PatientManagement() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setError('');
      const data = await patientService.getAll();
      setPatients(data);
    } catch (e) {
      setError(e.message || 'Failed to load patients.');
    }
  };

  const filtered = patients.filter((p) => {
    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    const mrn = (p.mrn || '').toLowerCase();
    const searchText = search.toLowerCase();

    return (
      name.includes(searchText) ||
      mrn.includes(searchText)
    );
  });

  const createPatient = async (data) => {
    try {
      setError('');
      const nameParts = data.name.trim().split(/\s+/);
      const genderVal = data.gender === 'Other' ? data.otherGender : data.gender;
      const diagVal = data.diagnosis === 'Other' ? data.otherDiagnosis : data.diagnosis;
      const deptVal = data.department === 'Other' ? data.otherDepartment : data.department;

      const created = await patientService.create({
        mrn: data.mrn,
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || nameParts[0],
        gender: genderVal,
        age: Number(data.age),
        diagnosis: diagVal || null,
        department: deptVal || null,
        admission_date: data.admission_date || null,
      });

      setPatients((current) => [...current, created]);
      setShowForm(false);
      setEditingPatient(null);
    } catch (e) {
      setError(e.message || 'Failed to add patient.');
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${patient.first_name} ${patient.last_name}?`
    );
    if (!confirmed) return;

    try {
      await patientService.delete(patient.id);
      setPatients((current) => current.filter((p) => p.id !== patient.id));
    } catch {
      setError('Failed to delete patient.');
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Patient Management' }]} />

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Patient Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            View, search, and manage clinical patient directory records.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPatient(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4"
        >
          <FiUserPlus size={15} />
          Add Patient
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              {editingPatient ? 'Edit Patient Record' : 'Add New Patient Record'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingPatient(null);
              }}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <PatientForm
            onSubmit={createPatient}
            defaultValues={
              editingPatient
                ? {
                    mrn: editingPatient.mrn,
                    name: `${editingPatient.first_name} ${editingPatient.last_name}`,
                    age: editingPatient.age,
                    gender: editingPatient.gender,
                    admission_date: editingPatient.admission_date || '',
                  }
                : {}
            }
          />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3 mb-4">
          {error}
        </p>
      )}

      {/* PATIENT TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
            All Patients ({filtered.length})
          </h3>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search patients by name or MRN..."
            className="w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-xs text-zinc-400">
            No patient records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40">
                <tr>
                  {['ID', 'Patient', 'MRN', 'Age', 'Gender', 'Diagnosis', 'Department', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      #{p.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center text-xs font-bold">
                          {`${p.first_name || ''} ${p.last_name || ''}`
                            .trim()
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                          }
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-white text-xs">
                          {p.first_name} {p.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      {p.mrn || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">
                      {p.age ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">
                      {p.gender || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">
                      {p.diagnosis || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">
                      {p.department || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                          title="Edit Patient"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Patient"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}