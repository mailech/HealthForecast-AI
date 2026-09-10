import React, { useState } from 'react';
import { Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/RiskBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  User,
  Calendar,
  BedDouble,
  Clock,
  HeartPulse,
  Activity,
  FileText,
  Pill,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  Download
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PatientDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForPrediction?: (patientId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSelectForPrediction
}) => {
  const { isAnonymizedView, canModifyMedicalRecords } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'admissions' | 'treatments' | 'risk' | 'reports'>('overview');
  const [downloadedReport, setDownloadedReport] = useState(false);

  if (!patient) return null;

  const displayName = isAnonymizedView() ? (patient.anonymizedId || 'PT-ANON-XXXX') : patient.name;
  const displayId = isAnonymizedView() ? 'ANON-ID' : patient.id;

  const handleExportPatientReport = () => {
    setDownloadedReport(true);
    setTimeout(() => setDownloadedReport(false), 3000);
  };

  return (
    <Modal
      id="patient-detail-modal"
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="5xl"
    >
      {/* Header section with patient profile */}
      <div className="-mt-3 mb-5 pb-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {isAnonymizedView() ? 'PT' : patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {displayName}
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {displayId}
                </span>
                <RiskBadge level={patient.riskLevel} score={patient.riskScore} />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 flex-wrap">
                <span>{patient.age} yrs • {patient.gender}</span>
                <span>•</span>
                <span className="font-medium text-slate-800">{patient.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                  {patient.assignedDoctorName}
                </span>
                {patient.roomNumber && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      {patient.roomNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSelectForPrediction && (
              <button
                onClick={() => {
                  onSelectForPrediction(patient.id);
                  onClose();
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                Analyze in Risk Engine
              </button>
            )}
            <button
              onClick={handleExportPatientReport}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadedReport ? 'Report Exported!' : 'Export Clinical Summary'}
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Risk Score</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-900">{patient.riskScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <span className="text-[11px] text-slate-600">Categorized: {patient.riskLevel}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">30d Readmit Prob.</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-900">{Math.round(patient.readmissionProbability * 100)}%</span>
            </div>
            <span className="text-[11px] text-slate-600">Model: {patient.modelVersion}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Recovery Score</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-emerald-700">{patient.recoveryScore}%</span>
            </div>
            <span className="text-[11px] text-slate-600">Clinical stability index</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Length of Stay</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-900">{patient.lengthOfStay}</span>
              <span className="text-xs text-slate-500">days</span>
            </div>
            <span className="text-[11px] text-slate-600">Admitted: {patient.admissionDate}</span>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none pb-0.5">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'history', label: 'Medical History' },
          { id: 'admissions', label: 'Admissions' },
          { id: 'treatments', label: 'Treatments' },
          { id: 'risk', label: 'Risk Analysis' },
          { id: 'reports', label: 'Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Primary Diagnosis
              </h4>
              <p className="text-sm font-semibold text-slate-800">{patient.primaryDiagnosis}</p>

              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-4 mb-2">
                Secondary Comorbidities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {patient.secondaryDiagnoses.map((d, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white rounded border border-slate-200 text-xs text-slate-700 font-medium"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Latest Laboratory Markers
              </h4>
              <div className="space-y-2">
                {patient.labResults.map((lab, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                    <span className="font-medium text-slate-700">{lab.test}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          lab.status === 'critical'
                            ? 'text-red-700'
                            : lab.status === 'elevated'
                            ? 'text-amber-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {lab.value}
                      </span>
                      <span className="text-[10px] text-slate-600 font-normal">ref: {lab.reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Proactive Clinical Recommendations
            </h4>
            <div className="space-y-2">
              {patient.recommendations.map((rec) => (
                <div key={rec.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 mt-0.5 ${
                      rec.priority === 'Urgent'
                        ? 'bg-red-100 text-red-800'
                        : rec.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{rec.recommendation}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{rec.rationale}</p>
                    <span className="inline-block mt-1 text-[11px] text-sky-700 font-medium">
                      Window: {rec.timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Medical History */}
      {activeTab === 'history' && (
        <div className="py-4 space-y-3">
          {patient.medicalHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No prior documented chronic admissions in St. Jude Metropolitan network.
            </div>
          ) : (
            patient.medicalHistory.map((rec) => (
              <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                  <span>{rec.diagnosis}</span>
                  <span className="text-slate-500">{rec.date}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-2">
                  <span className="font-mono bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">ICD-10: {rec.icd10}</span>
                  <span>•</span>
                  <span>Physician: {rec.physician}</span>
                  <span>•</span>
                  <span>{rec.facility}</span>
                </div>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">{rec.notes}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Admissions */}
      {activeTab === 'admissions' && (
        <div className="py-4 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 rounded-l">Admission ID</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Primary Diagnosis</th>
                  <th className="p-2.5">Length of Stay</th>
                  <th className="p-2.5 rounded-r">Readmitted &lt; 30d?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patient.admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-medium">{adm.id}</td>
                    <td className="p-2.5 text-slate-600">{adm.admissionDate}</td>
                    <td className="p-2.5 font-medium">{adm.type}</td>
                    <td className="p-2.5 text-slate-800">{adm.primaryDiagnosis}</td>
                    <td className="p-2.5">{adm.lengthOfStay} days</td>
                    <td className="p-2.5">
                      {adm.readmittedWithin30Days ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold text-[10px]">Yes (Readmitted)</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Treatments */}
      {activeTab === 'treatments' && (
        <div className="py-4 space-y-3">
          {patient.treatments.map((tx) => (
            <div key={tx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">{tx.treatmentName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                    Recovery Score: {tx.recoveryScore}%
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded font-semibold">
                    {tx.effectivenessPercentage}% Effective
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2"><strong>Medication Response:</strong> {tx.medicationResponse}</p>
              <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200 mt-2">{tx.notes}</p>
              <div className="mt-2 text-[11px] text-slate-600 font-medium">
                Prescribed by: {tx.prescribingDoctor} • Category: {tx.category} • Started: {tx.startDate}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Risk Analysis */}
      {activeTab === 'risk' && (
        <div className="py-4 space-y-4">
          <DisclaimerBanner type="demo" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Key AI Predictive Risk Factors
              </h4>
              <div className="space-y-3">
                {patient.riskFactors.map((rf, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                      <span>{rf.factor}</span>
                      <span className="text-sky-700 font-bold">{rf.impactScore}% Weight</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${rf.impactScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600">{rf.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Historical Risk Trajectory (Stay Progression)
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patient.historicalRisk}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 text-center">
                Model: {patient.modelVersion} • Confidence: {patient.confidenceScore}% • Generated: {patient.predictionTimestamp}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Reports */}
      {activeTab === 'reports' && (
        <div className="py-4 space-y-3">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Hospital Readmission Risk Evaluation Dossier</h4>
              <p className="text-[11px] text-slate-500">Comprehensive risk scoring, medication review & follow-up blueprint</p>
            </div>
            <button
              onClick={handleExportPatientReport}
              className="px-3 py-1.5 bg-sky-600 text-white rounded text-xs font-semibold hover:bg-sky-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
