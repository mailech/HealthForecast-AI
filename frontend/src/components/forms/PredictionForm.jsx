import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FiActivity, FiCheck, FiFileText, FiLoader } from 'react-icons/fi';
import { predictionService } from '../../services/predictionService';
import { patientService } from '../../services/patientService';
import { reportService } from '../../services/reportService';
import { getPatientLabel } from '../../utils/patientUtils';

export default function PredictionForm({ onResult, onPatientSelect }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { age: '', patient_id: '', diag_1: '250.83', number_inpatient: 0, time_in_hospital: 3 },
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // First admission state: 'yes' | 'no' (default to 'yes')
  const [isFirstAdmission, setIsFirstAdmission] = useState('yes');

  // Report extraction state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractError, setExtractError] = useState('');

  const selectedPatientId = Number(watch('patient_id'));

  useEffect(() => {
    let isMounted = true;

    patientService.getAll()
      .then((items) => {
        if (!isMounted) return;
        setPatients(items);
        if (items[0]) {
          const firstPatient = items[0];
          setValue('patient_id', String(firstPatient.id));
          setValue('age', Number(firstPatient.age ?? 0));
          setValue('diag_1', firstPatient.diagnosis || '250.83');
          if (onPatientSelect) onPatientSelect(firstPatient);
        }
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      });

    return () => {
      isMounted = false;
    };
  }, [setValue]);

  useEffect(() => {
    if (!selectedPatientId) return;

    const patient = patients.find((item) => Number(item.id) === selectedPatientId);
    if (!patient) return;

    setValue('age', Number(patient.age ?? 0));
    if (patient.diagnosis) {
      setValue('diag_1', patient.diagnosis);
    }
    // Reset report extraction when patient changes
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSelectedFile(null);
    setExtractedData(null);
    setExtractError('');

    if (onPatientSelect) onPatientSelect(patient);
  }, [patients, selectedPatientId, setValue]);

  // Handle first admission toggle change
  const handleFirstAdmissionChange = (val) => {
    setIsFirstAdmission(val);
    if (val === 'yes') {
      setValue('number_inpatient', 0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
      setExtractedData(null);
      setExtractError('');
    } else if (val === 'no') {
      const currentInpatient = watch('number_inpatient');
      if (currentInpatient === 0 || currentInpatient === '0') {
        setValue('number_inpatient', '');
      }
    }
  };

  // Handle report file upload and extraction
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!selectedPatientId) {
      setExtractError('Please select a patient first before uploading a report.');
      return;
    }

    setSelectedFile(file);
    setExtracting(true);
    setExtractError('');

    try {
      const res = await reportService.uploadAndExtract(selectedPatientId, file);
      setExtractedData(res);

      const ext = res.extracted_fields || {};
      
      // Auto-fill existing form fields with extracted values
      if (ext.prior_admissions !== null && ext.prior_admissions !== undefined) {
        setValue('number_inpatient', Number(ext.prior_admissions));
      }

      if (ext.length_of_stay !== null && ext.length_of_stay !== undefined) {
        setValue('time_in_hospital', Number(ext.length_of_stay));
      }

      if (ext.age !== null && ext.age !== undefined) {
        setValue('age', Number(ext.age));
      }

      if (ext.diagnosis) {
        setValue('diag_1', ext.diagnosis);
      }
    } catch (err) {
      setExtractError(err?.response?.data?.detail || err?.message || 'Failed to extract data from medical report.');
    } finally {
      setExtracting(false);
    }
  };

  // Handle removing selected report file
  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    setExtractedData(null);
    setExtractError('');

    // Reset report-derived form fields to patient DB default values
    const patient = patients.find((item) => Number(item.id) === selectedPatientId);
    if (patient) {
      setValue('age', Number(patient.age ?? 0));
      setValue('diag_1', patient.diagnosis || '250.83');
    }
    if (isFirstAdmission === 'no') {
      setValue('number_inpatient', '');
      setValue('time_in_hospital', 3);
    }
  };

  const handleResolveConflict = (field, chosenValue) => {
    if (field === 'age') setValue('age', Number(chosenValue));
    if (field === 'prior_admissions') setValue('number_inpatient', Number(chosenValue));
    if (field === 'length_of_stay') setValue('time_in_hospital', Number(chosenValue));
    if (field === 'diagnosis') setValue('diag_1', String(chosenValue));

    setExtractedData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        conflicts: (prev.conflicts || []).filter((c) => c.field !== field),
      };
    });
  };

  const onSubmit = async (data) => {
    if (loading) return;

    setLoading(true);
    setError('');
    try {
      const result = await predictionService.predict({
        ...data,
        age: Number(data.age),
        patient_id: Number(data.patient_id),
        diag_1: String(data.diag_1 || '250.83'),
        admission_type_id: Number(data.admission_type_id || 1),
        discharge_disposition_id: Number(data.discharge_disposition_id || 1),
        admission_source_id: Number(data.admission_source_id || 1),
        time_in_hospital: Number(data.time_in_hospital || 3),
        num_lab_procedures: Number(data.num_lab_procedures || 40),
        num_procedures: Number(data.num_procedures || 1),
        num_medications: Number(data.num_medications || 10),
        number_outpatient: Number(data.number_outpatient || 0),
        number_emergency: Number(data.number_emergency || 0),
        number_inpatient: isFirstAdmission === 'yes' ? 0 : Number(data.number_inpatient || 0),
        number_diagnoses: Number(data.number_diagnoses || 5),
      });
      if (onResult) onResult(result);
    } catch (requestError) {
      setError(requestError.message || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Select Patient */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">
          Select Patient
        </label>
        <select
          className="input-field text-sm"
          {...register('patient_id', { required: true })}
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {getPatientLabel(patient)}
            </option>
          ))}
        </select>
        {errors.patient_id && <p className="text-xs text-red-500 mt-1">Please select a valid patient.</p>}
      </div>

      {/* 2. First Hospital Admission Question */}
      {selectedPatientId > 0 && (
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Is this the patient's first hospital admission?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleFirstAdmissionChange('yes')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                isFirstAdmission === 'yes'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleFirstAdmissionChange('no')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                isFirstAdmission === 'no'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* 3. Optional Medical Report PDF Upload (Only when First Admission is "No") */}
      {isFirstAdmission === 'no' && selectedPatientId > 0 && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Previous Medical Report (Optional)
            </label>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-200/80 dark:bg-zinc-700/80 px-2 py-0.5 rounded-md">
              Optional
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Upload a previous medical report if available. The report can be used to extract prior admissions and other supported clinical information.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={extracting}
              className="text-xs text-zinc-600 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/60 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
            />
            {selectedFile && !extracting && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Remove
              </button>
            )}
            {extracting && (
              <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <FiLoader className="animate-spin" size={13} /> Extracting report...
              </span>
            )}
          </div>

          {/* Extracted Fields Review Card */}
          {extractedData && (
            <div className="mt-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <FiFileText size={14} className="text-blue-600 dark:text-blue-400" />
                  Extracted Clinical Review
                </span>
                {(extractedData.extracted_fields?.prior_admissions !== null && extractedData.extracted_fields?.prior_admissions !== undefined) ||
                (extractedData.extracted_fields?.length_of_stay !== null && extractedData.extracted_fields?.length_of_stay !== undefined) ||
                (extractedData.extracted_fields?.age !== null && extractedData.extracted_fields?.age !== undefined) ||
                extractedData.extracted_fields?.diagnosis ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <FiCheck size={12} /> Extracted & Auto-filled
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    No Clinical Fields Extracted
                  </span>
                )}
              </div>

              {/* Conflict Resolution Box */}
              {extractedData.conflicts && extractedData.conflicts.length > 0 && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-[11px] space-y-2">
                  <div className="font-bold text-amber-800 dark:text-amber-300">
                    Data Conflict Warning ({extractedData.conflicts.length} field{extractedData.conflicts.length > 1 ? 's' : ''} differ from Patient Record)
                  </div>
                  {extractedData.conflicts.map((c) => (
                    <div key={c.field} className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-800 p-2 rounded border border-amber-200 dark:border-amber-900/40">
                      <div>
                        <span className="font-bold">{c.field_label}: </span>
                        <span>DB = {String(c.existing_value)} vs Report = {String(c.report_value)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(c.field, c.existing_value)}
                          className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-[10px] font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200"
                        >
                          Use DB ({String(c.existing_value)})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(c.field, c.report_value)}
                          className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700"
                        >
                          Use Report ({String(c.report_value)})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400">
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Prior Admissions: </span>
                  {extractedData.extracted_fields?.prior_admissions !== null && extractedData.extracted_fields?.prior_admissions !== undefined ? (
                    <span className="font-bold text-blue-600 dark:text-blue-400">{extractedData.extracted_fields.prior_admissions}</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium italic">Not Available</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Length of Stay: </span>
                  {extractedData.extracted_fields?.length_of_stay !== null && extractedData.extracted_fields?.length_of_stay !== undefined ? (
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {extractedData.extracted_fields.length_of_stay} days
                      {extractedData.extracted_fields.length_of_stay_source === "Calculated from admission and discharge dates" && (
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal block">
                          (calculated from admission/discharge dates)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium italic">Not Available</span>
                  )}
                </div>
                {extractedData.extracted_fields?.age !== null && extractedData.extracted_fields?.age !== undefined && (
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Patient Age: </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{extractedData.extracted_fields.age} yrs</span>
                  </div>
                )}
                {extractedData.extracted_fields?.diagnosis && (
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Diagnosis: </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{extractedData.extracted_fields.diagnosis}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {extractError && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/50">
              {extractError}
            </p>
          )}
        </div>
      )}

      {/* 4. Clinical Parameter Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">
            Patient Age
          </label>
          <input
            type="number"
            min="0"
            className="input-field text-sm"
            placeholder="Age"
            {...register('age', { required: true, min: 0 })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">
            Prior Admissions
          </label>
          <input
            type="number"
            min="0"
            disabled={isFirstAdmission === 'yes'}
            className={`input-field text-sm ${
              isFirstAdmission === 'yes' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed' : ''
            }`}
            placeholder={isFirstAdmission === 'yes' ? '0 (First Admission)' : 'Prior inpatient stays'}
            {...register('number_inpatient', { required: isFirstAdmission === 'no', min: 0 })}
          />
          {isFirstAdmission === 'yes' && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Automatically set to 0 for first hospital admission.
            </p>
          )}
          {isFirstAdmission === 'no' && extractedData && extractedData.extracted_fields?.prior_admissions === null && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              Not Available in report. Enter manually if known.
            </p>
          )}
        </div>
      </div>

      <input type="hidden" {...register('diag_1')} />

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">
          Length of Stay (days)
        </label>
        <input
          type="number"
          min="1"
          className="input-field text-sm"
          placeholder="Stay duration"
          {...register('time_in_hospital', { required: true, min: 1 })}
        />
        {isFirstAdmission === 'no' && extractedData && extractedData.extracted_fields?.length_of_stay === null && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            Not Available in report. Enter manually if known.
          </p>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3">
          {error}
        </p>
      )}

      {/* 5. Run Prediction Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900 rounded-full animate-spin" />
            <span>Running ML Inference...</span>
          </>
        ) : (
          <>
            <FiActivity size={15} />
            <span>Run Prediction</span>
          </>
        )}
      </button>
    </form>
  );
}
