import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiActivity,
  FiEdit3,
  FiArrowRight,
  FiAlertTriangle,
  FiRefreshCw,
  FiClock,
  FiShield
} from 'react-icons/fi';
import { reportService } from '../../services/reportService';
import { predictionService } from '../../services/predictionService';
import RiskBadge from '../common/RiskBadge';
import { getPatientFullName, getPatientMRN } from '../../utils/patientUtils';

export default function MedicalReportAnalysisModal({ patient, user, onClose, onPredictionSaved }) {
  const isDoctor = user?.role === 'Doctor' || user?.role === 'doctor';
  const isHospitalAdmin = user?.role === 'Hospital Admin' || user?.role === 'hospital_admin';

  // Step flow: 1 = Upload, 2 = Extracted & Review, 3 = Risk Result
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extracted Data
  const [reportData, setReportData] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [history, setHistory] = useState([]);

  // Editable Form Parameters for Risk Assessment
  const [reviewForm, setReviewForm] = useState({
    patient_id: patient?.id,
    age: patient?.age || '',
    gender: patient?.gender || 'Male',
    diagnosis: patient?.diagnosis || '',
    department: patient?.department || '',
    number_inpatient: '', // Prior Admissions
    time_in_hospital: '', // Length of Stay
    num_lab_procedures: 40,
    num_procedures: 1,
    num_medications: 10,
    number_outpatient: 0,
    number_emergency: 0,
    max_glu_serum: 'None',
    A1Cresult: 'None',
    insulin: 'No',
    metformin: 'No',
  });

  // Risk Prediction Result
  const [predicting, setPredicting] = useState(false);
  const [riskResult, setRiskResult] = useState(null);

  useEffect(() => {
    if (patient?.id) {
      loadHistory(patient.id);
    }
  }, [patient]);

  const loadHistory = async (patientId) => {
    try {
      const items = await reportService.getMedicalReports(patientId);
      setHistory(items || []);
    } catch {
      setHistory([]);
    }
    try {
      const predictions = await predictionService.getHistory(patientId);
      setRiskHistory(predictions || []);
    } catch {
      setRiskHistory([]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSuccessMsg('');
    if (!selectedFile) return;

    const ext = selectedFile.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx', 'txt', 'text'].includes(ext)) {
      setError('Unsupported file type. Please upload a PDF (.pdf), DOCX (.docx), or TXT (.txt) report.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndExtract = async () => {
    if (!file) {
      setError('Please select a medical report file to upload.');
      return;
    }
    if (!isDoctor) {
      setError('Only authenticated Doctors are authorized to upload and extract medical reports.');
      return;
    }

    setUploading(true);
    setProgress(10);
    setError('');

    try {
      const res = await reportService.uploadAndExtract(patient.id, file, (p) => setProgress(p));
      setReportData(res);
      setConflicts(res.conflicts || []);

      const ext = res.extracted_fields || {};

      // Populate review form using extracted values if available, falling back to patient DB record
      setReviewForm({
        patient_id: patient.id,
        age: ext.age !== null && ext.age !== undefined ? ext.age : (patient.age ?? ''),
        gender: ext.gender ? ext.gender : (patient.gender ?? 'Male'),
        diagnosis: ext.diagnosis ? ext.diagnosis : (patient.diagnosis ?? ''),
        department: ext.department ? ext.department : (patient.department ?? ''),
        number_inpatient: ext.prior_admissions !== null && ext.prior_admissions !== undefined ? ext.prior_admissions : '',
        time_in_hospital: ext.length_of_stay !== null && ext.length_of_stay !== undefined ? ext.length_of_stay : '',
        num_lab_procedures: ext.num_lab_procedures ?? 40,
        num_procedures: ext.num_procedures ?? 1,
        num_medications: ext.num_medications ?? 10,
        number_outpatient: ext.number_outpatient ?? 0,
        number_emergency: ext.number_emergency ?? 0,
        max_glu_serum: ext.max_glu_serum || 'None',
        A1Cresult: ext.A1Cresult || 'None',
        insulin: ext.insulin || 'No',
        metformin: ext.metformin || 'No',
      });

      setSuccessMsg('Medical report text extracted successfully!');
      setStep(2);
      loadHistory(patient.id);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to extract data from medical report.');
    } finally {
      setUploading(false);
    }
  };

  const resolveConflict = (field, chosenValue) => {
    setReviewForm((prev) => ({ ...prev, [field]: chosenValue }));
    setConflicts((prev) => prev.filter((c) => c.field !== field));
  };

  const handleRunRiskAssessment = async () => {
    setError('');

    // Validate required prediction inputs
    if (reviewForm.age === '' || reviewForm.age === null || reviewForm.age === undefined) {
      setError('Patient Age is required for Risk Assessment. Please enter an age.');
      return;
    }
    if (reviewForm.number_inpatient === '' || reviewForm.number_inpatient === null) {
      setError('Prior Admissions is required. Please specify prior inpatient stays (enter 0 if none).');
      return;
    }
    if (reviewForm.time_in_hospital === '' || reviewForm.time_in_hospital === null) {
      setError('Length of Stay is required. Please specify stay duration in days.');
      return;
    }

    setPredicting(true);
    try {
      const payload = {
        patient_id: Number(patient.id),
        age: Number(reviewForm.age),
        gender: reviewForm.gender,
        diag_1: reviewForm.diagnosis ? String(reviewForm.diagnosis) : '250.83',
        diag_2: '276',
        diag_3: '250',
        time_in_hospital: Number(reviewForm.time_in_hospital),
        number_inpatient: Number(reviewForm.number_inpatient),
        num_lab_procedures: Number(reviewForm.num_lab_procedures || 40),
        num_procedures: Number(reviewForm.num_procedures || 1),
        num_medications: Number(reviewForm.num_medications || 10),
        number_outpatient: Number(reviewForm.number_outpatient || 0),
        number_emergency: Number(reviewForm.number_emergency || 0),
        max_glu_serum: reviewForm.max_glu_serum || 'None',
        A1Cresult: reviewForm.A1Cresult || 'None',
        insulin: reviewForm.insulin || 'No',
        metformin: reviewForm.metformin || 'No',
      };

      const result = await predictionService.predict(payload);
      setRiskResult(result);
      setStep(3);

      if (onPredictionSaved) {
        onPredictionSaved(result);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'ML Risk Assessment failed. Please check inputs.');
    } finally {
      setPredicting(false);
    }
  };

  const computeKeyRiskFactors = () => {
    if (!reviewForm) return [];
    const factors = [];

    const prior = Number(reviewForm.number_inpatient || 0);
    if (prior > 0) {
      factors.push(`History of ${prior} prior inpatient hospital admission${prior > 1 ? 's' : ''}`);
    }

    const los = Number(reviewForm.time_in_hospital || 0);
    if (los >= 5) {
      factors.push(`Extended length of hospital stay (${los} days)`);
    }

    if (reviewForm.A1Cresult && reviewForm.A1Cresult !== 'None' && reviewForm.A1Cresult !== 'Norm') {
      factors.push(`Elevated HbA1c lab result (${reviewForm.A1Cresult})`);
    }

    if (reviewForm.insulin && reviewForm.insulin !== 'No') {
      factors.push(`Insulin therapy administration (${reviewForm.insulin})`);
    }

    const meds = Number(reviewForm.num_medications || 0);
    if (meds > 12) {
      factors.push(`Polypharmacy regimen (${meds} concurrent medications)`);
    }

    if (reviewForm.diagnosis) {
      factors.push(`Admitting diagnosis: ${reviewForm.diagnosis}`);
    }

    if (factors.length === 0) {
      factors.push('Standard clinical parameters without acute risk flags');
    }

    return factors;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-3xl overflow-hidden my-auto"
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FiFileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                Medical Report Analysis
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded-md">
                  {isDoctor ? 'Doctor Workspace' : 'View Only'}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Patient: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{getPatientFullName(patient)}</span> (MRN: {getPatientMRN(patient)})
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

        {/* STEP PROGRESS BAR */}
        <div className="px-6 py-3 bg-zinc-100/60 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-500">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'}`}>1</span>
            <span>1. Upload Report</span>
          </div>
          <FiArrowRight size={13} className="text-zinc-400" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'}`}>2</span>
            <span>2. Review Extracted Data</span>
          </div>
          <FiArrowRight size={13} className="text-zinc-400" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'}`}>3</span>
            <span>3. Risk Analysis Result</span>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* ERROR ALERT */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
              <FiAlertCircle size={17} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* SUCCESS MSG */}
          {successMsg && !error && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <FiCheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: UPLOAD REPORT ================= */}
          {step === 1 && (
            <div className="space-y-6">
              {!isDoctor && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                  <FiShield size={18} className="flex-shrink-0" />
                  <span>View Only Mode: Medical report uploading and ML extraction is restricted to Doctors.</span>
                </div>
              )}

              {/* DRAG & DROP AREA */}
              {isDoctor && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : file
                      ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600 bg-zinc-50/50 dark:bg-zinc-800/20'
                  }`}
                >
                  {!file ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                        <FiUploadCloud size={26} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          Drag & Drop Medical Report Here
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Supported formats: <span className="font-semibold text-zinc-700 dark:text-zinc-300">PDF, DOCX, TXT</span> (Max 10MB)
                        </p>
                      </div>
                      <label className="btn-primary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-2">
                        <span>Browse File</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt,.text"
                          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FiFileText size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFile(null)}
                          className="text-xs font-semibold text-red-500 hover:underline"
                        >
                          Remove File
                        </button>
                        <button
                          onClick={handleUploadAndExtract}
                          disabled={uploading}
                          className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
                        >
                          {uploading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Extracting Text...</span>
                            </>
                          ) : (
                            <>
                              <FiActivity size={15} />
                              <span>Extract Clinical Data</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* UPLOAD PROGRESS BAR */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <span>Processing Medical Report...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* RISK HISTORY FOR PATIENT */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FiActivity size={14} className="text-blue-600 dark:text-blue-400" />
                    Patient Risk Prediction History ({riskHistory.length})
                  </span>
                  {riskHistory.length > 0 && (
                    <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      Latest: {riskHistory[0].risk_category} ({riskHistory[0].readmission_risk_score}%)
                    </span>
                  )}
                </h3>
                {riskHistory.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No risk predictions recorded yet for this patient.</p>
                ) : (
                  <div className="space-y-2">
                    {riskHistory.map((pred, idx) => (
                      <div
                        key={pred.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          idx === 0
                            ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                            : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RiskBadge level={(pred.risk_category || 'low').toLowerCase()} score={pred.readmission_risk_score} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900 dark:text-white">
                                {pred.readmission_risk_score}% Readmission Risk
                              </span>
                              {idx === 0 && (
                                <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">
                                  Latest
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {pred.created_at ? new Date(pred.created_at).toLocaleString() : 'Date N/A'} •
                              {pred.prior_admissions !== null && pred.prior_admissions !== undefined ? ` Prior Admissions: ${pred.prior_admissions}` : ''}
                              {pred.length_of_stay !== null && pred.length_of_stay !== undefined ? ` • Stay: ${pred.length_of_stay} days` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">#{pred.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* REPORT UPLOAD HISTORY FOR PATIENT */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                  <FiClock size={14} /> Previously Uploaded Reports ({history.length})
                </h3>
                {history.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No medical reports uploaded yet for this patient.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((rep) => (
                      <div key={rep.id} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <FiFileText className="text-blue-600 dark:text-blue-400" size={16} />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white">{rep.file_name}</p>
                            <p className="text-[11px] text-zinc-500">
                              {new Date(rep.created_at).toLocaleDateString()} • {(rep.file_size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                          {rep.file_type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: REVIEW & EDIT EXTRACTED INFORMATION ================= */}
          {step === 2 && (
            <div className="space-y-6">

              {/* CONFLICT WARNING BANNER */}
              {conflicts.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                    <FiAlertTriangle size={17} />
                    <span>Data Conflict Warning ({conflicts.length} fields differ from DB Patient Record)</span>
                  </div>
                  <div className="space-y-2">
                    {conflicts.map((c) => (
                      <div key={c.field} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white">{c.field_label}: </span>
                          <span className="text-zinc-500">Database = </span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{String(c.existing_value)}</span>
                          <span className="text-zinc-500 font-bold mx-1 text-[10px]">vs</span>
                          <span className="text-zinc-500">Report = </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{String(c.report_value)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => resolveConflict(c.field, c.existing_value)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200 text-[11px]"
                          >
                            Use DB ({String(c.existing_value)})
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveConflict(c.field, c.report_value)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 text-[11px]"
                          >
                            Use Report ({String(c.report_value)})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXTRACTED INFORMATION DISPLAY CARD */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <FiFileText size={15} className="text-blue-600 dark:text-blue-400" />
                    Extracted Clinical Information Summary
                  </h3>
                  <span className="text-[11px] font-semibold text-zinc-500">File: {reportData?.file_name}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[11px] uppercase font-bold">Patient Name</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {reportData?.extracted_fields?.patient_name || getPatientFullName(patient)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px] uppercase font-bold">Age</span>
                    <span className={`font-bold ${reportData?.extracted_fields?.age !== null ? 'text-zinc-900 dark:text-white' : 'text-amber-600 dark:text-amber-400'}`}>
                      {reportData?.extracted_fields?.age !== null && reportData?.extracted_fields?.age !== undefined ? `${reportData.extracted_fields.age} yrs` : 'Not Available'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px] uppercase font-bold">Prior Admissions</span>
                    <span className={`font-bold ${reportData?.extracted_fields?.prior_admissions !== null ? 'text-zinc-900 dark:text-white' : 'text-amber-600 dark:text-amber-400'}`}>
                      {reportData?.extracted_fields?.prior_admissions !== null && reportData?.extracted_fields?.prior_admissions !== undefined ? reportData.extracted_fields.prior_admissions : 'Not Available'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px] uppercase font-bold">Length of Stay</span>
                    <span className={`font-bold ${reportData?.extracted_fields?.length_of_stay !== null && reportData?.extracted_fields?.length_of_stay !== undefined ? 'text-zinc-900 dark:text-white' : 'text-amber-600 dark:text-amber-400'}`}>
                      {reportData?.extracted_fields?.length_of_stay !== null && reportData?.extracted_fields?.length_of_stay !== undefined ? (
                        <>
                          {reportData.extracted_fields.length_of_stay} days
                          {reportData.extracted_fields.length_of_stay_source === "Calculated from admission and discharge dates" && (
                            <span className="text-[10px] text-zinc-500 font-normal block">(calculated from dates)</span>
                          )}
                        </>
                      ) : (
                        'Not Available'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* REVIEW BEFORE PREDICTION EDITABLE FORM */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FiEdit3 size={16} className="text-blue-600 dark:text-blue-400" />
                    Review & Edit Extracted Parameters Before Risk Prediction
                  </h3>
                  <span className="text-xs text-zinc-400">All fields are editable</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* AGE */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Patient Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={reviewForm.age}
                      onChange={(e) => setReviewForm({ ...reviewForm, age: e.target.value })}
                      placeholder="Enter age (e.g. 56)"
                      className="input-field text-xs"
                    />
                  </div>

                  {/* GENDER */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Gender
                    </label>
                    <select
                      value={reviewForm.gender}
                      onChange={(e) => setReviewForm({ ...reviewForm, gender: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* PRIOR ADMISSIONS */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Prior Inpatient Admissions <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={reviewForm.number_inpatient}
                      onChange={(e) => setReviewForm({ ...reviewForm, number_inpatient: e.target.value })}
                      placeholder={reportData?.extracted_fields?.prior_admissions === null ? 'Not Available in report (Enter value)' : 'Prior stays'}
                      className={`input-field text-xs ${reviewForm.number_inpatient === '' ? 'border-amber-400 dark:border-amber-500' : ''}`}
                    />
                    {reviewForm.number_inpatient === '' && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Not Available in report — Please enter prior admissions count (0 if none).</p>
                    )}
                  </div>

                  {/* LENGTH OF STAY */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Length of Stay (days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reviewForm.time_in_hospital}
                      onChange={(e) => setReviewForm({ ...reviewForm, time_in_hospital: e.target.value })}
                      placeholder={reportData?.extracted_fields?.length_of_stay === null ? 'Not Available in report (Enter days)' : 'Stay duration in days'}
                      className={`input-field text-xs ${reviewForm.time_in_hospital === '' ? 'border-amber-400 dark:border-amber-500' : ''}`}
                    />
                    {reviewForm.time_in_hospital === '' && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Not Available in report — Please enter stay duration (in days).</p>
                    )}
                  </div>

                  {/* DIAGNOSIS */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Diagnosis / ICD Code
                    </label>
                    <input
                      type="text"
                      value={reviewForm.diagnosis}
                      onChange={(e) => setReviewForm({ ...reviewForm, diagnosis: e.target.value })}
                      placeholder="e.g. Diabetes / 250.83"
                      className="input-field text-xs"
                    />
                  </div>

                  {/* DEPARTMENT */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Clinical Department
                    </label>
                    <input
                      type="text"
                      value={reviewForm.department}
                      onChange={(e) => setReviewForm({ ...reviewForm, department: e.target.value })}
                      placeholder="e.g. General Medicine"
                      className="input-field text-xs"
                    />
                  </div>

                  {/* HBA1C RESULT */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      HbA1c Lab Result
                    </label>
                    <select
                      value={reviewForm.A1Cresult}
                      onChange={(e) => setReviewForm({ ...reviewForm, A1Cresult: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="None">None</option>
                      <option value="Norm">Norm</option>
                      <option value=">7">&gt;7</option>
                      <option value=">8">&gt;8</option>
                    </select>
                  </div>

                  {/* INSULIN */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Insulin Therapy
                    </label>
                    <select
                      value={reviewForm.insulin}
                      onChange={(e) => setReviewForm({ ...reviewForm, insulin: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="No">No</option>
                      <option value="Steady">Steady</option>
                      <option value="Up">Up</option>
                      <option value="Down">Down</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ← Back to Upload
                </button>

                <button
                  type="button"
                  onClick={handleRunRiskAssessment}
                  disabled={predicting}
                  className="btn-primary text-xs py-3 px-6 flex items-center gap-2 font-bold uppercase tracking-wider"
                >
                  {predicting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Running ML Model...</span>
                    </>
                  ) : (
                    <>
                      <FiActivity size={16} />
                      <span>Run Risk Assessment</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* ================= STEP 3: RISK ANALYSIS RESULT ================= */}
          {step === 3 && riskResult && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">

              {/* RISK HEADER CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-blue-950 text-white border border-zinc-800 shadow-xl text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  Readmission Risk Assessment Result
                </p>
                <p className="text-6xl font-black text-white tracking-tight">
                  {riskResult.readmission_risk_score}%
                </p>
                <div className="inline-block pt-1">
                  <RiskBadge level={riskResult.risk_category.toLowerCase()} score={riskResult.readmission_risk_score} />
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto pt-2 leading-relaxed">
                  Evaluated using {riskResult.model_version || 'patient-risk-model-v1.0.0'} against validated clinical parameters.
                </p>
              </div>

              {/* PROBABILITY DISTRIBUTION */}
              {riskResult.probabilities && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Probability Distribution
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(riskResult.probabilities).map(([label, val]) => (
                      <div key={label} className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                        <span className="text-[11px] font-bold text-zinc-500 block uppercase">{label} Risk</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KEY RISK FACTORS */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <FiAlertTriangle size={15} className="text-amber-500" />
                  Key Clinical Risk Factors
                </h3>
                <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                  {computeKeyRiskFactors().map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CLINICAL SUMMARY & ACTIONS */}
              <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2 text-xs">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[11px]">
                  Clinical Summary & Recommended Protocol
                </h4>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {riskResult.risk_category === 'High'
                    ? 'Patient is identified as HIGH readmission risk. Recommend multidisciplinary case consultation, mandatory post-discharge appointment within 48-72 hours, and medication reconciliation.'
                    : riskResult.risk_category === 'Medium'
                    ? 'Patient is identified as MEDIUM readmission risk. Recommend care plan review and outpatient telephone follow-up within 7 days.'
                    : 'Patient is identified as LOW readmission risk. Standard routine clinical monitoring and standard discharge instructions apply.'}
                </p>
              </div>

              {/* FINAL ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ← Edit Parameters
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setFile(null); setRiskResult(null); }}
                    className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
                  >
                    <FiRefreshCw size={14} />
                    <span>Run New Assessment</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    Done
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
