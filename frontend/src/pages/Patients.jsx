import { useEffect, useState } from 'react';
import { patientsAPI, predictionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, AlertTriangle } from 'lucide-react';

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    patientsAPI.list(0, 100)
      .then((res) => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isResearcher = user?.role === 'researcher';
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
    if (readmitted === '<30') return <span className="risk-high px-2 py-1 rounded-full text-xs">Readmitted</span>;
    if (readmitted === '>30') return <span className="risk-medium px-2 py-1 rounded-full text-xs">Late Readmit</span>;
    return <span className="risk-low px-2 py-1 rounded-full text-xs">Not Readmitted</span>;
  };

  if (loading) return <div className="text-gray-500">Loading patients...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Patient Management</h1>
          <p className="text-gray-500">
            {user?.role === 'researcher' ? 'Anonymized patient records' : 'Manage and monitor patient records'}
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, patient ID, gender, or age..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
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
              {user?.role !== 'researcher' && <th className="pb-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium">{isResearcher ? 'Anonymized' : (p.full_name || '—')}</td>
                <td className="py-3 pr-4 text-gray-500">{p.patient_id}</td>
                <td className="py-3 pr-4">{p.age}</td>
                <td className="py-3 pr-4">{p.gender}</td>
                <td className="py-3 pr-4">{p.time_in_hospital}</td>
                <td className="py-3 pr-4">{p.num_medications}</td>
                <td className="py-3 pr-4">{p.number_diagnoses}</td>
                <td className="py-3 pr-4">{riskBadge(p.readmitted)}</td>
                {user?.role !== 'researcher' && (
                  <td className="py-3">
                    <button
                      onClick={() => runPrediction(p.id)}
                      disabled={predicting}
                      className="flex items-center gap-1 text-xs btn-primary py-1 px-2"
                    >
                      <AlertTriangle className="w-3 h-3" /> Predict Risk
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No patients found. Import dataset from Model Management.</p>
        )}
      </div>
    </div>
  );
}
