import React, { useState } from 'react';
import { Search, Filter, Plus, User, Activity, AlertTriangle, Eye, Sparkles, ChevronRight } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import { Modal } from '../components/Modal';
import { PatientDetailPage } from './PatientDetailPage';

export const PatientManagementPage = () => {
  const { patients, loading, filters, setFilters, addPatient } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: 65,
    gender: 'Male',
    department: 'Cardiology',
    primary_diagnosis: 'Heart Failure',
    admission_date: new Date().toISOString().split('T')[0],
    prior_admissions: 1,
    emergency_visits: 0,
    length_of_stay: 4,
    charlson_index: 2,
    lace_index: 8,
    hba1c: 7.2,
    serum_sodium: 137.0,
    creatinine: 1.1,
    polypharmacy_count: 5
  });

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    await addPatient(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Patient Management Hub</h1>
          <p className="text-xs text-slate-400">Search, filter, and inspect clinical cohorts for readmission risk analysis.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 font-bold text-xs shadow-cyan-glow hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search patient, code, diagnosis..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-900/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-medical-cyan"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="py-2 px-3 rounded-xl bg-navy-900/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-medical-cyan"
          >
            <option>All Departments</option>
            <option>Cardiology</option>
            <option>Pulmonology</option>
            <option>Endocrinology</option>
            <option>Nephrology</option>
            <option>Internal Medicine</option>
          </select>

          <select
            value={filters.risk_level}
            onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
            className="py-2 px-3 rounded-xl bg-navy-900/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-medical-cyan"
          >
            <option>All Risk Levels</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center gap-1 bg-navy-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-medical-cyan text-slate-950' : 'text-slate-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-medical-cyan text-slate-950' : 'text-slate-400'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Patient Content Grid / Table */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((patient) => {
            const isHigh = patient.risk_level === 'High';
            const isMed = patient.risk_level === 'Medium';
            const badgeColor = isHigh ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : isMed ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={patient.id}
                className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-medical-cyan">{patient.patient_code}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeColor}`}>
                      {patient.risk_level} ({patient.readmission_risk_score}%)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{patient.first_name} {patient.last_name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{patient.age} yrs • {patient.gender} • {patient.department}</p>
                  
                  <div className="mt-3 p-3 rounded-xl bg-navy-900/60 border border-slate-800 text-xs">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Primary Diagnosis</p>
                    <p className="text-slate-200 font-semibold truncate">{patient.primary_diagnosis}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Admitted: {patient.admission_date}</span>
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="flex items-center gap-1 text-xs text-medical-cyan font-bold hover:underline"
                  >
                    <span>Inspect Detail</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Age/Gender</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4 text-center">Risk Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-medical-cyan">{patient.patient_code}</td>
                  <td className="py-3 px-4 font-bold text-white">{patient.first_name} {patient.last_name}</td>
                  <td className="py-3 px-4">{patient.age} / {patient.gender}</td>
                  <td className="py-3 px-4">{patient.department}</td>
                  <td className="py-3 px-4">{patient.primary_diagnosis}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 border border-slate-700">
                      {patient.risk_level} ({patient.readmission_risk_score}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="px-3 py-1 rounded bg-navy-800 text-medical-cyan hover:bg-medical-cyan hover:text-slate-950 font-bold transition-all text-[11px]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Drawer Modal */}
      {selectedPatient && (
        <PatientDetailPage
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Inpatient Cohort Record"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              >
                <option>Cardiology</option>
                <option>Pulmonology</option>
                <option>Endocrinology</option>
                <option>Nephrology</option>
                <option>Internal Medicine</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Primary Diagnosis</label>
            <input
              type="text"
              required
              value={formData.primary_diagnosis}
              onChange={(e) => setFormData({ ...formData, primary_diagnosis: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 font-bold text-xs shadow-cyan-glow mt-4"
          >
            Save Patient & Calculate Initial AI Risk
          </button>
        </form>
      </Modal>
    </div>
  );
};
