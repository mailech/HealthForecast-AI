import React from 'react';
import { useForm } from 'react-hook-form';

export default function PatientForm({ onSubmit, defaultValues = {} }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({ defaultValues });

  // Selected values
  const selectedGender = watch('gender');
  const selectedDiagnosis = watch('diagnosis');
  const selectedDepartment = watch('department');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Medical Record Number */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Medical Record Number
        </label>

        <input
          type="text"
          className="input-field"
          placeholder="MRN-001"
          {...register('mrn', {
            required: 'MRN is required'
          })}
        />

        {errors.mrn && (
          <p className="text-red-500 text-xs mt-1">
            {errors.mrn.message}
          </p>
        )}
      </div>


      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Full Name
        </label>

        <input
          type="text"
          className="input-field"
          placeholder="Patient full name"
          {...register('name', {
            required: 'Name is required'
          })}
        />

        {errors.name && (
          <p className="text-red-500 text-xs mt-1">
            {errors.name.message}
          </p>
        )}
      </div>


      {/* Age and Gender */}
      <div className="grid grid-cols-2 gap-4">

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Age
          </label>

          <input
            type="number"
            className="input-field"
            placeholder="Age"
            {...register('age', {
              required: 'Age is required',
              min: {
                value: 0,
                message: 'Invalid age'
              }
            })}
          />

          {errors.age && (
            <p className="text-red-500 text-xs mt-1">
              {errors.age.message}
            </p>
          )}
        </div>


        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Gender
          </label>

          <select
            className="input-field"
            {...register('gender', {
              required: 'Gender is required'
            })}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">
              {errors.gender.message}
            </p>
          )}
        </div>

      </div>


      {/* Other Gender */}
      {selectedGender === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Please Specify Gender
          </label>

          <input
            type="text"
            className="input-field"
            placeholder="Enter gender"
            {...register('otherGender', {
              required: 'Please specify gender'
            })}
          />

          {errors.otherGender && (
            <p className="text-red-500 text-xs mt-1">
              {errors.otherGender.message}
            </p>
          )}
        </div>
      )}


      {/* Diagnosis */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Diagnosis
        </label>

        <select
          className="input-field"
          {...register('diagnosis', {
            required: 'Diagnosis is required'
          })}
        >
          <option value="">Select Diagnosis</option>

          <option value="Diabetes">Diabetes</option>
          <option value="Hypertension">Hypertension</option>
          <option value="Heart Disease">Heart Disease</option>
          <option value="Heart Failure">Heart Failure</option>
          <option value="Coronary Artery Disease">
            Coronary Artery Disease
          </option>
          <option value="Asthma">Asthma</option>
          <option value="Pneumonia">Pneumonia</option>
          <option value="COPD">COPD</option>
          <option value="Kidney Disease">Kidney Disease</option>
          <option value="Liver Disease">Liver Disease</option>
          <option value="Stroke">Stroke</option>
          <option value="Cancer">Cancer</option>
          <option value="Anemia">Anemia</option>
          <option value="Infection">Infection</option>
          <option value="Other">Other</option>
        </select>

        {errors.diagnosis && (
          <p className="text-red-500 text-xs mt-1">
            {errors.diagnosis.message}
          </p>
        )}
      </div>


      {/* Other Diagnosis */}
      {selectedDiagnosis === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Please Specify Diagnosis
          </label>

          <input
            type="text"
            className="input-field"
            placeholder="Enter diagnosis"
            {...register('otherDiagnosis', {
              required: 'Please specify diagnosis'
            })}
          />

          {errors.otherDiagnosis && (
            <p className="text-red-500 text-xs mt-1">
              {errors.otherDiagnosis.message}
            </p>
          )}
        </div>
      )}


      {/* Department */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Department
        </label>

        <select
          className="input-field"
          {...register('department')}
        >
          <option value="">Select Department</option>

          <option value="General Medicine">
            General Medicine
          </option>

          <option value="Cardiology">
            Cardiology
          </option>

          <option value="Neurology">
            Neurology
          </option>

          <option value="Orthopedics">
            Orthopedics
          </option>

          <option value="Pediatrics">
            Pediatrics
          </option>

          <option value="Gynecology">
            Gynecology
          </option>

          <option value="Oncology">
            Oncology
          </option>

          <option value="Nephrology">
            Nephrology
          </option>

          <option value="Pulmonology">
            Pulmonology
          </option>

          <option value="Dermatology">
            Dermatology
          </option>

          <option value="ENT">
            ENT
          </option>

          <option value="Emergency">
            Emergency
          </option>

          <option value="ICU">
            ICU
          </option>

          <option value="Other">
            Other
          </option>
        </select>
      </div>


      {/* Other Department */}
      {selectedDepartment === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Please Specify Department
          </label>

          <input
            type="text"
            className="input-field"
            placeholder="Enter department"
            {...register('otherDepartment', {
              required: 'Please specify department'
            })}
          />

          {errors.otherDepartment && (
            <p className="text-red-500 text-xs mt-1">
              {errors.otherDepartment.message}
            </p>
          )}
        </div>
      )}


      {/* Save Button */}
      <button
        type="submit"
        className="btn-primary w-full"
      >
        Save Patient
      </button>

    </form>
  );
}