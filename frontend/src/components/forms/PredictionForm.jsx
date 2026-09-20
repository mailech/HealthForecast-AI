import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiActivity } from 'react-icons/fi';
import { predictionService } from '../../services/predictionService';
import { patientService } from '../../services/patientService';
import { getPatientLabel } from '../../utils/patientUtils';

export default function PredictionForm({ onResult, onPatientSelect }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { age: '', patient_id: '', diag_1: '250.83' },
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (onPatientSelect) onPatientSelect(patient);
  }, [patients, selectedPatientId, setValue]);

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
        number_inpatient: Number(data.number_inpatient || 0),
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
            className="input-field text-sm"
            placeholder="Prior inpatient stays"
            {...register('number_inpatient', { required: true, min: 0 })}
          />
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
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3">
          {error}
        </p>
      )}

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
