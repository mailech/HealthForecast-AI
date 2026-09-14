import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI, predictionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, AlertTriangle, Pill, UserCheck } from 'lucide-react';

export default function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [predicting, setPredicting] = useState(false);

  const isDoctor = user?.role === 'doctor';
  const isResearcher = user?.role === 'researcher';

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    setLoading(true);
    patientsAPI.list(0, 100)
      .then((res) => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const filtered = patients.filter((p) => {
    const haystack = `${p.full_name || ''} ${p.patient_id || ''} ${p.gender || ''} ${p.age || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const runPrediction = async (patientId) => {
    setPredicting(true);
    try {
      await predictionsAPI.predictRisk(patientId);
      alert('Risk prediction completed successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };


  const riskBadge = (readmitted) => {
    if (readmitted === '<30') return <span className="risk-high px-2 py-1 rounded-full text-xs font-semibold">Readmitted</span>;
    if (readmitted === '>30') return <span className="risk-medium px-2 py-1 rounded-full text-xs font-semibold">Late Readmit</span>;
    return <span className="risk-low px-2 py-1 rounded-full text-xs font-semibold">Not Readmitted</span>;
  };

  if (loading) return <div className="text-gray-500 p-8">Loading patient directory...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Patient Management</h1>
          <p className="text-gray-500">
            {isResearcher
              ? 'Anonymized patient health records (De-identified research view)'
              : isDoctor
              ? 'Patients under your direct clinical care and assignment'
              : 'Hospital clinical directory — patient records, doctor assignments, and risk tracking'}
          </p>
        </div>
        {isDoctor && (
          <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Showing your assigned patients only
          </span>
        )}
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name, ID, gender, or age..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Patient</th>
              <th className="pb-3 pr-4">Patient ID</th>
              <th className="pb-3 pr-4">Age</th>
              <th className="pb-3 pr-4">Gender</th>
              <th className="pb-3 pr-4">Stay (days)</th>
              <th className="pb-3 pr-4">Medications</th>
              <th className="pb-3 pr-4">Diagnoses</th>
              <th className="pb-3 pr-4">Readmission</th>
              {!isResearcher && <th className="pb-3 pr-4">Assigned Doctor</th>}
              {!isResearcher && <th className="pb-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 font-semibold text-gray-800">
                  {isResearcher ? 'Anonymized' : (p.full_name || '—')}
                </td>
                <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{p.patient_id}</td>
                <td className="py-3 pr-4">{p.age}</td>
                <td className="py-3 pr-4">{p.gender}</td>
                <td className="py-3 pr-4">{p.time_in_hospital}</td>
                <td className="py-3 pr-4">{p.num_medications}</td>
                <td className="py-3 pr-4">{p.number_diagnoses}</td>
                <td className="py-3 pr-4">{riskBadge(p.readmitted)}</td>
                {!isResearcher && (
                  <td className="py-3 pr-4">
                    {p.assigned_doctor_id ? (
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        Assigned
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </td>
                )}
                {!isResearcher && (
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => runPrediction(p.id)}
                        disabled={predicting}
                        className="flex items-center gap-1 text-xs btn-primary py-1 px-2.5"
                      >
                        <AlertTriangle className="w-3 h-3" /> Risk
                      </button>
                      <button
                        onClick={() => navigate('/treatments')}
                        className="flex items-center gap-1 text-xs btn-secondary py-1 px-2.5"
                      >
                        <Pill className="w-3 h-3" /> Treatments
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">
            No patients found matching your query or assignment.
          </p>
        )}
      </div>

    </div>
  );
}