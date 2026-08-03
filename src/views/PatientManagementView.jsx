import React, { useState } from 'react';
import { Search, Filter, Eye, UserPlus, Database, ShieldAlert, FileSpreadsheet, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PATIENT_RECORDS } from '../data/mockData';

export const PatientManagementView = () => {
  const { currentRoleKey, setSelectedPatient } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [admissionFilter, setAdmissionFilter] = useState('All');

  const isAnonymized = currentRoleKey === 'RESEARCHER';
  const isDoctor = currentRoleKey === 'DOCTOR';

  // Filter records
  const filteredPatients = PATIENT_RECORDS.filter(p => {
    const matchesSearch = isAnonymized
      ? p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      : p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'All' || p.riskLevel === riskFilter;
    const matchesAdmission = admissionFilter === 'All' || p.admissionType === admissionFilter;

    // If Doctor, only show assigned patients unless SysAdmin or Admin
    if (isDoctor && p.assignedDoctor !== "Dr. Sarah Jenkins, MD") {
      return false;
    }

    return matchesSearch && matchesRisk && matchesAdmission;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Patient Records Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Diabetes 130-US Dataset
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {isAnonymized ? "Viewing anonymized research data cohort (HIPAA compliant mode)" : "Clinical patient encounter management and admission history"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert("Dataset export initiated! File healthforecast_diabetes130_export.csv downloaded.")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={isAnonymized ? "Search by Subject ID, Diagnosis..." : "Search patient name, ID, diagnosis..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Risk Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk (&gt;75%)</option>
            <option value="Medium">Medium Risk (40-75%)</option>
            <option value="Low">Low Risk (&lt;40%)</option>
          </select>
        </div>

        {/* Admission Type Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Admission:</span>
          <select
            value={admissionFilter}
            onChange={(e) => setAdmissionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Types</option>
            <option value="Emergency">Emergency</option>
            <option value="Urgent">Urgent</option>
            <option value="Elective">Elective</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">Patient / Subject ID</th>
                <th className="py-3.5 px-4 font-bold">Demographics</th>
                <th className="py-3.5 px-4 font-bold">Primary Diagnosis</th>
                <th className="py-3.5 px-4 font-bold text-center">Length of Stay</th>
                <th className="py-3.5 px-4 font-bold text-center">HbA1c Test</th>
                <th className="py-3.5 px-4 font-bold text-center">AI Readmission Risk</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No matching patient records found in current scope.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-900/60 transition">
                    {/* Name / ID */}
                    <td className="py-4 px-4 font-semibold">
                      <div className="text-slate-100 font-bold">
                        {isAnonymized ? `ANON-SUBJECT-${patient.id.replace('PT-', '')}` : patient.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {patient.id} • {patient.encounterId}
                      </div>
                    </td>

                    {/* Demographics */}
                    <td className="py-4 px-4">
                      <div className="text-slate-300">{patient.gender}, Age {patient.ageGroup}</div>
                      <div className="text-[10px] text-slate-500">{patient.admissionType} Admission</div>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-slate-200 truncate" title={patient.primaryDiagnosis}>
                        {patient.primaryDiagnosis}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {patient.numMedications} Medications • {patient.numLabProcedures} Lab Tests
                      </div>
                    </td>

                    {/* Length of stay */}
                    <td className="py-4 px-4 text-center font-mono font-medium text-slate-200">
                      {patient.timeInHospital} Days
                    </td>

                    {/* HbA1c */}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold border ${
                        patient.a1cResult.includes('>') ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {patient.a1cResult}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs border ${
                          patient.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          patient.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {patient.readmissionScore}% ({patient.riskLevel})
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition flex items-center space-x-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
