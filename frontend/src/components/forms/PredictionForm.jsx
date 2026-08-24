import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiActivity } from 'react-icons/fi';
import { predictionService } from '../../services/predictionService';
import { patientService } from '../../services/patientService';

export default function PredictionForm({ onResult }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { age: '[50-60]' },
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    patientService.getAll().then((items) => {
      setPatients(items);
      if (items[0]) setValue('patient_id', items[0].id);
    }).catch((requestError) => setError(requestError.message));
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const result = await predictionService.predict({
        ...data,
        patient_id: Number(data.patient_id),
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Patient ID</label>
        <select className="input-field" {...register('patient_id', { required: true })}>
          <option value="">Select a patient</option>
          {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name} (#{patient.id})</option>)}
        </select>
        {errors.patient_id && <p className="text-xs text-red-500 mt-1">Enter a valid patient ID.</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Age</label>
          <input type="text" className="input-field" placeholder="[50-60]"
            {...register('age', { required: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Prior Admissions</label>
          <input type="number" min="0" className="input-field" placeholder="Number"
            {...register('number_inpatient', { required: true, min: 0 })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Primary Diagnosis</label>
        <input type="text" className="input-field" placeholder="e.g. 250.83"
          {...register('diag_1', { required: true })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Length of Stay (days)</label>
        <input type="number" min="1" className="input-field" placeholder="Days"
          {...register('time_in_hospital', { required: true, min: 1 })} />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running Prediction...</>
          : <><FiActivity size={16} /> Run Prediction</>
        }
      </button>
    </form>
  );
}
