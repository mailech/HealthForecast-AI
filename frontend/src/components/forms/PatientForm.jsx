import React from 'react';
import { useForm } from 'react-hook-form';

export default function PatientForm({ onSubmit, defaultValues = {} }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Medical Record Number</label>
        <input type="text" className="input-field" placeholder="MRN-001"
          {...register('mrn', { required: 'MRN is required' })} />
        {errors.mrn && <p className="text-red-500 text-xs mt-1">{errors.mrn.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
        <input type="text" className="input-field" placeholder="Patient full name"
          {...register('name', { required: 'Name is required' })} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Age</label>
          <input type="number" className="input-field" placeholder="Age"
            {...register('age', { required: 'Age is required', min: { value: 0, message: 'Invalid age' } })} />
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
          <select className="input-field" {...register('gender', { required: true })}>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Diagnosis</label>
        <input type="text" className="input-field" placeholder="Primary diagnosis"
          {...register('diagnosis', { required: 'Diagnosis is required' })} />
        {errors.diagnosis && <p className="text-red-500 text-xs mt-1">{errors.diagnosis.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
        <input type="text" className="input-field" placeholder="Department"
          {...register('department')} />
      </div>
      <button type="submit" className="btn-primary w-full">Save Patient</button>
    </form>
  );
}
