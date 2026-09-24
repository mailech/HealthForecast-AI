import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiX,
  FiUser,
  FiFileText,
  FiActivity,
  FiClock,
  FiUploadCloud,
  FiDownload,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';
import RiskBadge from '../common/RiskBadge';
import PatientRiskTrendChart from './PatientRiskTrendChart';
import PatientClinicalActivityTimeline from './PatientClinicalActivityTimeline';
import { predictionService } from '../../services/predictionService';
import { reportService } from '../../services/reportService';
import { getPatientFullName, getPatientMRN } from '../../utils/patientUtils';

export default function PatientProfileModal({ patient, user, onClose, onOpenAnalysis }) {
  const navigate = useNavigate();
  const isDoctor = user?.role === 'Doctor' || user?.role === 'doctor';

  const [riskHistory, setRiskHistory] = useState([]);
  const [medicalReports, setMedicalReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient?.id) {
      loadPatientDetails();
    }
  }, [patient?.id]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      const [historyData, reportsData] = await Promise.all([
        predictionService.getPatientHistory(patient.id).catch(() => []),
        reportService.getPatientReports(patient.id).catch(() => []),
      ]);

      setRiskHistory(historyData);
      setMedicalReports(reportsData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const latestPrediction = riskHistory[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-4xl overflow-hidden my-auto"
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-blue-500/20">
              {getPatientFullName(patient).split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {getPatientFullName(patient)}
                </h2>
                <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                  MRN: {getPatientMRN(patient)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Patient ID: #{patient?.id} • Age: {patient?.age ?? 'N/A'} yrs • Gender: {patient?.gender || 'N/A'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">

          {/* QUICK SUMMARY CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Readmission Forecast Profile</p>
              <div className="flex items-center gap-3 mt-1.5">
                {latestPrediction ? (
                  <>
                    <RiskBadge level={(latestPrediction.risk_category || 'low').toLowerCase()} score={latestPrediction.readmission_risk_score} />
                    <span className="text-sm font-bold text-slate-200">
                      Score: {latestPrediction.readmission_risk_score}%
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic">No forecast record generated yet</span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Department: <span className="font-semibold text-white">{patient?.department || 'General Medicine'}</span> • Diagnosis: <span className="font-semibold text-white">{patient?.diagnosis || 'Unspecified'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isDoctor && (
                <button
                  onClick={() => { onClose(); onOpenAnalysis(patient); }}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-bold uppercase tracking-wider shadow-md"
                >
                  <FiUploadCloud size={16} />
                  <span>Upload & Analyze Report</span>
                </button>
              )}
              <button
                onClick={() => { onClose(); navigate('/reports'); }}
                className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <FiDownload size={15} />
                <span>PDF Forecast Report</span>
              </button>
            </div>
          </div>

          {/* MEDICAL REPORT ANALYSIS SECTION */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <FiFileText size={16} className="text-blue-600 dark:text-blue-400" />
                Medical Report Analysis
              </h3>
              {isDoctor ? (
                <button
                  onClick={() => { onClose(); onOpenAnalysis(patient); }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <FiUploadCloud size={14} /> Upload Report
                </button>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                  Doctor Access Required for Upload
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Upload patient clinical documentation (PDF, DOCX, TXT) to extract clinical parameters (including Prior Admissions and Length of Stay), resolve data conflicts against DB records, and execute the existing ML readmission model.
            </p>
          </div>

          {/* PATIENT RISK TREND FEATURE */}
          <PatientRiskTrendChart history={riskHistory} loading={loading} />

          {/* PATIENT CLINICAL ACTIVITY TIMELINE */}
          {patient?.id && <PatientClinicalActivityTimeline patientId={patient.id} />}

          {/* RISK HISTORY SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <FiActivity size={16} className="text-indigo-600 dark:text-indigo-400" />
                Risk Assessment History ({riskHistory.length})
              </h3>
              <span className="text-xs text-zinc-400">Database Records</span>
            </div>

            {loading ? (
              <p className="text-xs text-zinc-400 p-4 text-center">Loading risk history...</p>
            ) : riskHistory.length === 0 ? (
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50">
                No risk predictions recorded yet for this patient.
              </div>
            ) : (
              <div className="space-y-2">
                {riskHistory.map((pred, idx) => (
                  <div
                    key={pred.id}
                    className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                      idx === 0
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RiskBadge level={(pred.risk_category || 'low').toLowerCase()} score={pred.readmission_risk_score} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-white text-xs">
                            {pred.readmission_risk_score}% Risk Score ({pred.risk_category})
                          </span>
                          {idx === 0 && (
                            <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Latest Prediction
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span>
                            Assessment Date: <strong className="text-zinc-700 dark:text-zinc-300">{pred.created_at ? new Date(pred.created_at).toLocaleString() : 'N/A'}</strong>
                          </span>
                          <span>
                            Prior Admissions: <strong className="text-zinc-700 dark:text-zinc-300">{pred.prior_admissions !== null && pred.prior_admissions !== undefined ? pred.prior_admissions : 'N/A'}</strong>
                          </span>
                          <span>
                            Length of Stay: <strong className="text-zinc-700 dark:text-zinc-300">{pred.length_of_stay !== null && pred.length_of_stay !== undefined ? `${pred.length_of_stay} days` : 'N/A'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-[10px] font-mono text-zinc-400 block">ID #{pred.id}</span>
                      <span className="text-[10px] text-zinc-500 font-semibold">{pred.model_version || 'v1.0.0'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MEDICAL REPORTS HISTORY SECTION */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <FiClock size={16} className="text-blue-600 dark:text-blue-400" />
                Medical Reports Log ({medicalReports.length})
              </h3>
            </div>

            {loading ? (
              <p className="text-xs text-zinc-400 p-4 text-center">Loading medical reports...</p>
            ) : medicalReports.length === 0 ? (
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50">
                No medical reports uploaded yet for this patient.
              </div>
            ) : (
              <div className="space-y-2">
                {medicalReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                        {rep.file_type?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{rep.file_name}</p>
                        <p className="text-[11px] text-zinc-500">
                          Uploaded: {new Date(rep.created_at).toLocaleString()} • Size: {(rep.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                        <FiCheckCircle size={11} /> Analyzed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
