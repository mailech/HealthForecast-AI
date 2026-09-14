import { useEffect, useState } from 'react';
import { treatmentsAPI, patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { patientLabel } from '../utils/patients';
import {
  Pill,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const PIE_COLORS = {
  Recovered: '#22c55e',
  Improved: '#3b82f6',
  Stable: '#f59e0b',
  Readmitted: '#ef4444',
  'Adverse Reaction': '#8b5cf6',
};

export default function TreatmentEffectiveness() {
  const { user } = useAuth();
  const [effectiveness, setEffectiveness] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientAnalysis, setPatientAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);

  // Form states
  const [newMedication, setNewMedication] = useState('Metformin');
  const [newDosage, setNewDosage] = useState('500mg daily');
  const [newStatus, setNewStatus] = useState('active');
  const [newOutcome, setNewOutcome] = useState('Stable');

  const [editStatus, setEditStatus] = useState('completed');
  const [editOutcome, setEditOutcome] = useState('Recovered');
  const [editDosage, setEditDosage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [effRes, patRes] = await Promise.all([
        treatmentsAPI.getEffectiveness(),
        patientsAPI.list(0, 100),
      ]);
      setEffectiveness(effRes.data);
      setPatients(patRes.data);
      if (patRes.data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patRes.data[0].id.toString());
        loadPatientAnalysis(patRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientAnalysis = async (patId) => {
    try {
      const res = await treatmentsAPI.getRecoveryAnalysis(patId);
      setPatientAnalysis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePatientChange = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    if (id) {
      loadPatientAnalysis(parseInt(id));
    } else {
      setPatientAnalysis(null);
    }
  };

  const handleAddTreatment = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setActionLoading(true);
    try {
      await treatmentsAPI.addTreatment(parseInt(selectedPatientId), {
        medication: newMedication,
        dosage: newDosage,
        status: newStatus,
        outcome: newOutcome,
      });
      setShowAddModal(false);
      await loadPatientAnalysis(parseInt(selectedPatientId));
      const effRes = await treatmentsAPI.getEffectiveness();
      setEffectiveness(effRes.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add treatment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTreatment = async (e) => {
    e.preventDefault();
    if (!currentTreatment) return;
    setActionLoading(true);
    try {
      await treatmentsAPI.updateTreatment(currentTreatment.id, {
        dosage: editDosage || currentTreatment.dosage,
        status: editStatus,
        outcome: editOutcome,
      });
      setShowUpdateModal(false);
      await loadPatientAnalysis(parseInt(selectedPatientId));
      const effRes = await treatmentsAPI.getEffectiveness();
      setEffectiveness(effRes.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update treatment');
    } finally {
      setActionLoading(false);
    }
  };

  const openUpdateModal = (treatment) => {
    setCurrentTreatment(treatment);
    setEditStatus(treatment.status || 'completed');
    setEditOutcome(treatment.outcome || 'Recovered');
    setEditDosage(treatment.dosage || '');
    setShowUpdateModal(true);
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading treatment effectiveness analytics...</div>;
  }

  const outcomePieData = effectiveness?.outcome_distribution
    ? Object.entries(effectiveness.outcome_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const canEdit = user?.role === 'doctor';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Treatment Effectiveness & Recovery</h1>
          <p className="text-gray-500">
            Real-world evidence analytics on medication outcomes, recovery rates, and clinical response
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary flex items-center gap-2 text-sm"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4" /> Refresh Analytics
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Treatments</p>
              <p className="text-2xl font-bold mt-1">{effectiveness?.total_treatments || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Pill className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Active: {effectiveness?.active_treatments || 0} | Completed: {effectiveness?.completed_treatments || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Recovery Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {effectiveness?.overall_recovery_rate || 0}%
              </p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Resolved without readmission</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Readmission Rate</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {effectiveness?.overall_readmission_rate || 0}%
              </p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Patients readmitted under current therapy</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Improvement Rate</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {effectiveness?.overall_improvement_rate || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Clinically stabilized or progressing</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" /> Medication Performance Comparison
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Recovery Rate vs Readmission Rate (%) by Diabetic Medication
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={effectiveness?.medication_performance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="medication" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="recovery_rate" fill="#22c55e" name="Recovery Rate (%)" />
              <Bar dataKey="readmission_rate" fill="#ef4444" name="Readmission Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Treatment Outcomes Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={outcomePieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {outcomePieData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Medication Efficacy Table */}
      <div className="card mb-8">
        <h3 className="font-semibold mb-4">Medication Efficacy Benchmark Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Medication</th>
                <th className="pb-3 pr-4">Patients Treated</th>
                <th className="pb-3 pr-4">Recovery Rate</th>
                <th className="pb-3 pr-4">Improvement Rate</th>
                <th className="pb-3 pr-4">Readmission Rate</th>
                <th className="pb-3 pr-4">Avg Duration</th>
                <th className="pb-3">Effectiveness Score</th>
              </tr>
            </thead>
            <tbody>
              {effectiveness?.medication_performance?.map((m) => (
                <tr key={m.medication} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-semibold text-gray-800">{m.medication}</td>
                  <td className="py-3 pr-4">{m.total_treated}</td>
                  <td className="py-3 pr-4 text-green-600 font-medium">{m.recovery_rate}%</td>
                  <td className="py-3 pr-4 text-blue-600">{m.improvement_rate}%</td>
                  <td className="py-3 pr-4 text-red-600 font-medium">{m.readmission_rate}%</td>
                  <td className="py-3 pr-4">{m.avg_duration_days} days</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(m.effectiveness_score, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs">{m.effectiveness_score}/100</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Recovery Tracker & Treatment Management */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-lg">Patient Longitudinal Recovery Analysis</h3>
            <p className="text-sm text-gray-500">Track medication history, outcomes, and therapeutic responses</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedPatientId}
              onChange={handlePatientChange}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">Select a patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {patientLabel(p)} ({p.gender}, {p.age})
                </option>
              ))}
            </select>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!selectedPatientId}
                className="btn-primary text-sm flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add Treatment
              </button>
            )}
          </div>
        </div>

        {patientAnalysis && (
          <div>
            {/* Status and Recommendation Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Patient</p>
                <p className="text-base font-bold text-gray-800">
                  {patientAnalysis.patient_name || patientAnalysis.patient_code}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Therapeutic Response Rating</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    patientAnalysis.status_color === 'green'
                      ? 'bg-green-100 text-green-800'
                      : patientAnalysis.status_color === 'red'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {patientAnalysis.response_rating}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Treatments Tracked</p>
                <p className="text-base font-bold text-gray-800">
                  {patientAnalysis.active_count} Active / {patientAnalysis.total_treatments} Total
                </p>
              </div>
            </div>

            {/* AI Treatment Recommendations */}
            <div className="mb-6 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" /> Evidence-Based Treatment Adjustments
              </h4>
              <ul className="space-y-1">
                {patientAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                    <span className="font-bold">•</span> {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Patient Treatments List */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4">Medication</th>
                    <th className="pb-3 pr-4">Dosage</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Clinical Outcome</th>
                    <th className="pb-3 pr-4">Duration</th>
                    <th className="pb-3 pr-4">Start Date</th>
                    {canEdit && <th className="pb-3">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {patientAnalysis.treatments.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-semibold text-gray-800">{t.medication}</td>
                      <td className="py-3 pr-4 text-gray-600">{t.dosage || '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            t.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            t.outcome === 'Recovered'
                              ? 'bg-green-100 text-green-800'
                              : t.outcome === 'Readmitted'
                              ? 'bg-red-100 text-red-800'
                              : t.outcome === 'Improved'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {t.outcome}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {t.duration_days !== null ? `${t.duration_days} days` : 'Ongoing'}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {t.start_date ? new Date(t.start_date).toLocaleDateString() : '—'}
                      </td>
                      {canEdit && (
                        <td className="py-3">
                          <button
                            onClick={() => openUpdateModal(t)}
                            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Update Outcome
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {patientAnalysis.treatments.length === 0 && (
                <p className="text-center py-6 text-gray-500 text-sm">
                  No treatments recorded for this patient. Click "Add Treatment" to record one.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Treatment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Add Medication Treatment</h3>
            <form onSubmit={handleAddTreatment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Medication</label>
                <select
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Metformin">Metformin</option>
                  <option value="Insulin">Insulin</option>
                  <option value="Glipizide">Glipizide</option>
                  <option value="Glyburide">Glyburide</option>
                  <option value="Pioglitazone">Pioglitazone</option>
                  <option value="Sitagliptin">Sitagliptin</option>
                  <option value="Empagliflozin">Empagliflozin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dosage</label>
                <input
                  type="text"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  placeholder="e.g. 500mg daily"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expected / Initial Outcome</label>
                <select
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Stable">Stable</option>
                  <option value="Improved">Improved</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Readmitted">Readmitted</option>
                  <option value="Adverse Reaction">Adverse Reaction</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-sm"
                >
                  {actionLoading ? 'Saving...' : 'Record Treatment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Treatment Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              Update Treatment: {currentTreatment?.medication}
            </h3>
            <form onSubmit={handleUpdateTreatment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dosage</label>
                <input
                  type="text"
                  value={editDosage}
                  onChange={(e) => setEditDosage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Clinical Outcome</label>
                <select
                  value={editOutcome}
                  onChange={(e) => setEditOutcome(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Recovered">Recovered</option>
                  <option value="Improved">Improved</option>
                  <option value="Stable">Stable</option>
                  <option value="Readmitted">Readmitted</option>
                  <option value="Adverse Reaction">Adverse Reaction</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-sm"
                >
                  {actionLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
