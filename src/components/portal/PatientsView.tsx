import React, { useState, useMemo } from 'react';
import { Patient, RiskLevel } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../common/RiskBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Stethoscope,
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
  Activity,
  BedDouble,
  FileSpreadsheet,
  Shield
} from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAddPatient: () => void;
  onSelectForPrediction: (patientId: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onOpenAddPatient,
  onSelectForPrediction
}) => {
  const { currentUser, role, isAnonymizedView, canModifyMedicalRecords } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'riskScore' | 'readmissionProb' | 'age' | 'lengthOfStay'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [exportNotice, setExportNotice] = useState(false);

  // Doctor scope check
  const isDoctor = role === 'DOCTOR';

  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        // Doctor can only access assigned patients
        if (isDoctor && p.assignedDoctorId !== currentUser.id) {
          return false;
        }

        // Search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(term);
          const matchAnon = p.anonymizedId?.toLowerCase().includes(term);
          const matchId = p.id.toLowerCase().includes(term);
          const matchDiag = p.primaryDiagnosis.toLowerCase().includes(term);
          const matchDept = p.department.toLowerCase().includes(term);
          if (!matchName && !matchAnon && !matchId && !matchDiag && !matchDept) return false;
        }

        // Risk level filter
        if (selectedRisk !== 'ALL' && p.riskLevel !== selectedRisk) {
          return false;
        }

        // Department filter
        if (selectedDept !== 'ALL' && p.department !== selectedDept) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'ALL' && p.status !== selectedStatus) {
          return false;
        }

        // Doctor filter
        if (selectedDoctor !== 'ALL' && p.assignedDoctorName !== selectedDoctor) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortBy] as number;
        let valB = b[sortBy] as number;
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [
    patients,
    isDoctor,
    currentUser.id,
    searchTerm,
    selectedRisk,
    selectedDept,
    selectedStatus,
    selectedDoctor,
    sortBy,
    sortOrder
  ]);

  const handleExportCSV = () => {
    const headers = ['PatientID,Name,Age,Gender,Department,Diagnosis,RiskScore,ReadmitProbability,Status,Doctor\n'];
    const rows = filteredPatients.map(p => {
      const name = isAnonymizedView() ? (p.anonymizedId || 'ANON') : `"${p.name}"`;
      return `${p.id},${name},${p.age},${p.gender},${p.department},"${p.primaryDiagnosis}",${p.riskScore},${Math.round(p.readmissionProbability * 100)}%,${p.status},"${p.assignedDoctorName}"`;
    });
    const blob = new Blob([headers.join('') + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthForecast_Patients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Patient Management Registry
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredPatients.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isDoctor
              ? `Displaying assigned cohort under care of ${currentUser.name}.`
              : 'Institutional patient census with real-time AI readmission stratification.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {exportNotice
                ? 'CSV Exported!'
                : role === 'HEALTHCARE_RESEARCHER'
                ? 'Export Research Cohort (CSV)'
                : isDoctor
                ? 'Export Assigned Cohort (CSV)'
                : 'Export Census (CSV)'}
            </span>
          </button>

          {canModifyMedicalRecords() ? (
            <button
              onClick={onOpenAddPatient}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{role === 'HOSPITAL_ADMIN' ? 'View-Only Access (Cannot Edit)' : 'Anonymized Research Mode'}</span>
            </div>
          )}
        </div>
      </div>

      <DisclaimerBanner type={isAnonymizedView() ? 'research' : 'demo'} />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID (e.g. PT-10492), or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 text-xs">
            {/* Risk filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk (&ge;70%)</option>
              <option value="MEDIUM">Medium Risk (40-69%)</option>
              <option value="LOW">Low Risk (&lt;40%)</option>
            </select>

            {/* Department filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Geriatrics">Geriatrics</option>
            </select>

            {/* Admission Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharge Planning">Discharge Planning</option>
              <option value="Observation">Observation</option>
              <option value="Discharged">Discharged</option>
            </select>

            {/* Sort selection */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden px-1"
              >
                <option value="riskScore">Sort: Risk Score</option>
                <option value="readmissionProb">Sort: Readmit Prob</option>
                <option value="lengthOfStay">Sort: Length of Stay</option>
                <option value="age">Sort: Patient Age</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
                title={`Order: ${sortOrder.toUpperCase()}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="p-3.5">Patient Info</th>
                <th className="p-3.5">Patient ID</th>
                <th className="p-3.5">Age / Sex</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Primary Diagnosis</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Readmit Prob.</th>
                <th className="p-3.5">Assigned Doctor</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No patients match your search criteria. Try modifying your filters.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const displayName = isAnonymizedView()
                    ? (patient.anonymizedId || 'PT-ANON-XXXX')
                    : patient.name;
                  const displayId = isAnonymizedView() ? 'ANON-ID' : patient.id;

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {isAnonymizedView() ? 'PT' : patient.name.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                              {displayName}
                            </span>
                            {patient.roomNumber && (
                              <span className="text-[11px] text-slate-600 flex items-center gap-1">
                                <BedDouble className="w-3 h-3 text-slate-400" />
                                {patient.roomNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-medium text-slate-700">{displayId}</td>
                      <td className="p-3.5 text-slate-700">{patient.age}y / {patient.gender[0]}</td>
                      <td className="p-3.5 font-medium text-slate-800">{patient.department}</td>
                      <td className="p-3.5 text-slate-800 max-w-[200px] truncate" title={patient.primaryDiagnosis}>
                        {patient.primaryDiagnosis}
                      </td>
                      <td className="p-3.5">
                        <RiskBadge level={patient.riskLevel} score={patient.riskScore} size="sm" />
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                patient.readmissionProbability > 0.7
                                  ? 'bg-red-500'
                                  : patient.readmissionProbability > 0.4
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.round(patient.readmissionProbability * 100)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">
                            {Math.round(patient.readmissionProbability * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-slate-400" />
                          {patient.assignedDoctorName}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            patient.status === 'Admitted'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : patient.status === 'Discharge Planning'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : patient.status === 'Observation'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectForPrediction(patient.id)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Analyze in Risk Engine"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
