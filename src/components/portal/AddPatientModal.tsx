import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Patient, RiskLevel } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient
}) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(65);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [department, setDepartment] = useState<'Endocrinology' | 'Cardiology' | 'Internal Medicine' | 'Pulmonology' | 'Geriatrics'>('Endocrinology');
  const [diagnosis, setDiagnosis] = useState('');
  const [priorAdmissions, setPriorAdmissions] = useState<number>(2);
  const [medCount, setMedCount] = useState<number>(7);
  const [hba1c, setHba1c] = useState('8.4%');
  const [room, setRoom] = useState('West Wing - 402');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !diagnosis) return;

    // Calculate realistic simulated risk score
    let calculatedScore = 30 + (priorAdmissions * 12) + (age > 65 ? 15 : 5) + (medCount > 6 ? 12 : 4);
    if (calculatedScore > 95) calculatedScore = 95;
    if (calculatedScore < 15) calculatedScore = 15;

    const riskLevel: RiskLevel = calculatedScore >= 70 ? 'HIGH' : calculatedScore >= 40 ? 'MEDIUM' : 'LOW';
    const readmissionProb = Math.round((calculatedScore / 100) * 0.95 * 100) / 100;
    const newId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient: Patient = {
      id: newId,
      anonymizedId: `PT-ANON-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      age,
      gender,
      dob: '1961-04-12',
      phone: '+1 (555) 000-0000',
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@fictionalmail.net`,
      address: '100 Medical Center Way, Metro City',
      department,
      primaryDiagnosis: diagnosis,
      secondaryDiagnoses: ['Hypertension', 'Dyslipidemia'],
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'Admitted',
      assignedDoctorId: currentUser.id,
      assignedDoctorName: currentUser.name,
      roomNumber: room,
      riskScore: calculatedScore,
      riskLevel,
      readmissionProbability: readmissionProb,
      recoveryScore: 50,
      lengthOfStay: 1,
      priorAdmissionsCount: priorAdmissions,
      medicationCount: medCount,
      hba1cLevel: hba1c,
      predictionTimestamp: 'Just now (Demo ML Inference)',
      modelVersion: 'XGBoost-HospReadmit-v2.4',
      confidenceScore: 91,
      riskFactors: [
        { factor: `Prior Admissions Count (${priorAdmissions})`, impactScore: 28, category: 'Historical', description: 'Strongest predictor in Diabetes 130-US Hospitals model' },
        { factor: 'Comorbidity & Polypharmacy Burden', impactScore: 22, category: 'Clinical', description: 'Active multi-agent medical regimen' }
      ],
      historicalRisk: [{ date: 'Day 1', score: calculatedScore }],
      medicalHistory: [],
      admissions: [
        {
          id: `ADM-${newId}`,
          admissionDate: new Date().toISOString().split('T')[0],
          type: 'Urgent',
          department,
          primaryDiagnosis: diagnosis,
          lengthOfStay: 1,
          dischargeDisposition: 'Pending'
        }
      ],
      treatments: [
        {
          id: `TX-${newId}-1`,
          treatmentName: 'Initial Inpatient Stabilization Protocol',
          category: 'Medication',
          startDate: new Date().toISOString().split('T')[0],
          outcome: 'Favorable',
          recoveryScore: 65,
          effectivenessPercentage: 80,
          medicationResponse: 'Initial vitals monitored and responding',
          notes: 'Standard admission workup underway.',
          prescribingDoctor: currentUser.name
        }
      ],
      labResults: [
        { test: 'HbA1c', value: hba1c, reference: '< 5.7 %', status: 'elevated', date: new Date().toISOString().split('T')[0] },
        { test: 'Serum Creatinine', value: '1.2 mg/dL', reference: '0.7 - 1.3 mg/dL', status: 'normal', date: new Date().toISOString().split('T')[0] }
      ],
      recommendations: [
        {
          id: `REC-${newId}-1`,
          category: 'Follow-up',
          priority: 'High',
          recommendation: 'Schedule 7-day post-discharge primary care check-in',
          rationale: 'Mitigates 30-day readmission risk based on clinical decision rules',
          timeframe: 'Within 7 days'
        }
      ]
    };

    onAddPatient(newPatient);
    onClose();
    setName('');
    setDiagnosis('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Patient Record"
      subtitle="Register admitted patient into HealthForecast AI clinical surveillance"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Jonathan Reynolds"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
            <input
              type="number"
              min={18}
              max={110}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="Endocrinology">Endocrinology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Geriatrics">Geriatrics</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Unit</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Clinical Diagnosis *</label>
          <input
            type="text"
            required
            placeholder="e.g. Type 2 Diabetes with Hyperglycemia or Congestive Heart Failure"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prior Admissions (12mo)</label>
            <input
              type="number"
              min={0}
              max={15}
              value={priorAdmissions}
              onChange={(e) => setPriorAdmissions(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Active Medications</label>
            <input
              type="number"
              min={1}
              max={30}
              value={medCount}
              onChange={(e) => setMedCount(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">HbA1c Lab Value</label>
            <input
              type="text"
              value={hba1c}
              onChange={(e) => setHba1c(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Add Patient & Run Risk Score
          </button>
        </div>
      </form>
    </Modal>
  );
};
