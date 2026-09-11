import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Plus, UserPlus, X } from 'lucide-react';

export const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patient_nbr: '',
    gender: 'Female',
    age_group: '[60-70)',
    race: 'Caucasian',
    weight_group: '?'
  });
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/patients?limit=50&search=${encodeURIComponent(search)}`);
      setPatients(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load patients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      await api.post('/patients', newPatient);
      setShowModal(false);
      setNewPatient({ patient_nbr: '', gender: 'Female', age_group: '[60-70)', race: 'Caucasian', weight_group: '?' });
      fetchPatients();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create patient record. Please check inputs.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" /> Patient Clinical Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered Patients Ingested from Diabetes 130-US Hospitals Dataset • Total Records: {total.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by Patient Number, Race, Gender..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Patients Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-10 bg-slate-800/40 animate-pulse rounded-xl w-full"></div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No patient records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Database ID</th>
                  <th className="py-3 px-4">Patient Number</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Age Group</th>
                  <th className="py-3 px-4">Race</th>
                  <th className="py-3 px-4">Encounter Stays</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">#{p.id}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-cyan-400">#{p.patient_nbr}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.gender}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.age_group}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.race || 'Unknown'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-cyan-400 font-bold">
                        {p.encounter_count || 0} stays
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating Patient */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" /> Add Patient Record
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Patient Number (Identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9988273"
                  value={newPatient.patient_nbr}
                  onChange={(e) => setNewPatient({ ...newPatient, patient_nbr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Unknown/Invalid">Unknown / Invalid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Age Bracket</label>
                  <select
                    value={newPatient.age_group}
                    onChange={(e) => setNewPatient({ ...newPatient, age_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="[0-10)">[0-10) Years</option>
                    <option value="[10-20)">[10-20) Years</option>
                    <option value="[20-30)">[20-30) Years</option>
                    <option value="[30-40)">[30-40) Years</option>
                    <option value="[40-50)">[40-50) Years</option>
                    <option value="[50-60)">[50-60) Years</option>
                    <option value="[60-70)">[60-70) Years</option>
                    <option value="[70-80)">[70-80) Years</option>
                    <option value="[80-90)">[80-90) Years</option>
                    <option value="[90-100)">[90-100) Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Race / Demographic</label>
                <select
                  value={newPatient.race}
                  onChange={(e) => setNewPatient({ ...newPatient, race: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Caucasian">Caucasian</option>
                  <option value="AfricanAmerican">African American</option>
                  <option value="Hispanic">Hispanic</option>
                  <option value="Asian">Asian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-500/20"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
