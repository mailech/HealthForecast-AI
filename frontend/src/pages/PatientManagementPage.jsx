import React, { useState } from 'react';
import { Search, Filter, Plus, User, Activity, AlertTriangle, Eye, Sparkles, ChevronRight } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import { Modal } from '../components/Modal';
import { PatientDetailPage } from './PatientDetailPage';
import { useAuth } from '../context/AuthContext';

export const PatientManagementPage = () => {
  const { patients, loading, filters, setFilters, addPatient } = usePatients();
  const { user } = useAuth();
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
    hba1c: 6.5,
    serum_sodium: 138.0,
    creatinine: 1.0,
    polypharmacy_count: 3
  });

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    await addPatient(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Inpatient Cohort</h1>
          <p className="text-xs text-slate-500 mt-1">Live management and risk triage of current hospital admissions.</p>
        </div>

        {user?.role === 'Doctor' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-slate-50 text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inpatient</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white text-slate-800 shadow-md border-slate-200 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search patient, code, diagnosis..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="py-2 px-3 rounded-xl bg-slate-50 text-slate-800/80 border border-slate-200/80 text-slate-700 text-xs focus:outline-none focus:border-blue-500"
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
            className="py-2 px-3 rounded-xl bg-slate-50 text-slate-800/80 border border-slate-200/80 text-slate-700 text-xs focus:outline-none focus:border-blue-500"
          >
            <option>All Risk Levels</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center gap-1 bg-slate-50 text-slate-800/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-blue-500 text-slate-950' : 'text-slate-500'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-blue-500 text-slate-950' : 'text-slate-500'
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
              const badgeColor = isHigh ? 'bg-red-100 text-red-800 border-red-200 font-bold' : isMed ? 'bg-amber-100 text-amber-800 border-amber-200 font-semibold' : 'bg-emerald-100 text-emerald-800 border-emerald-200';

            return (
              <div
                key={patient.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{patient.first_name} {patient.last_name}</h3>
                        <p className="text-xs text-slate-500">{patient.patient_code} • {patient.age}y • {patient.gender}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${badgeColor}`}>
                      {isHigh ? "⚠️ HIGH" : isMed ? "⚡ MED" : "✅ LOW"} ({patient.readmission_risk_score}%)
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 text-slate-800/60 border border-slate-200 text-xs">
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Primary Diagnosis</p>
                    <p className="text-slate-700 font-semibold truncate">{patient.primary_diagnosis}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Admitted: {patient.admission_date}</span>
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="flex items-center gap-1 text-xs text-blue-500 font-bold hover:underline"
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
        <div className="bg-white text-slate-800 shadow-md border-slate-200 rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-800/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-200">
                {patients.map((patient) => {
                  const isHigh = patient.risk_level === 'High';
                  const isMed = patient.risk_level === 'Medium';
                  const badgeColor = isHigh ? 'bg-red-100 text-red-800 border-red-200 font-bold' : isMed ? 'bg-amber-100 text-amber-800 border-amber-200 font-semibold' : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{patient.patient_code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{patient.first_name} {patient.last_name}</td>
                    <td className="py-3 px-4">{patient.age} / {patient.gender}</td>
                    <td className="py-3 px-4">{patient.department}</td>
                    <td className="py-3 px-4 truncate max-w-[150px]">{patient.primary_diagnosis}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
                        {isHigh ? "⚠️ HIGH" : isMed ? "⚡ MED" : "✅ LOW"} ({patient.readmission_risk_score}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-3 py-1 rounded bg-slate-100 border border-slate-200 text-blue-600 hover:bg-blue-500 hover:text-white font-bold transition-all text-[11px]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )})}
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
              <label className="text-slate-600 font-semibold block mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-slate-900"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-slate-900"
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
            <label className="text-slate-600 font-semibold block mb-1">Primary Diagnosis</label>
            <input
              type="text"
              required
              value={formData.primary_diagnosis}
              onChange={(e) => setFormData({ ...formData, primary_diagnosis: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs shadow-md mt-4"
          >
            Save Patient & Calculate Initial AI Risk
          </button>
        </form>
      </Modal>
    </div>
  );
};
