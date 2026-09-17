import { useEffect, useState } from "react";
import {
  Activity, Pill, HeartPulse, Plus, RefreshCw,
  BarChart3, X, Users, TrendingUp, Clock
} from "lucide-react";
import api from "../api/api";

function ClinicalAnalytics() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role?.toLowerCase() || "patient";
  const canAddRecords = ["admin", "doctor"].includes(role);

  const [treatments, setTreatments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [recovery, setRecovery] = useState([]);
  const [patients, setPatients] = useState([]);

  const [treatmentAverage, setTreatmentAverage] = useState(0);
  const [medicationAverage, setMedicationAverage] = useState(0);
  const [recoveryAverage, setRecoveryAverage] = useState(0);
  const [recoveryDays, setRecoveryDays] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formType, setFormType] = useState("");

  const [treatmentForm, setTreatmentForm] = useState({
    patient_id: "", treatment_name: "", outcome: "Improved",
    effectiveness_score: 80, notes: ""
  });

  const [medicationForm, setMedicationForm] = useState({
    patient_id: "", medication_name: "", outcome: "Effective",
    effectiveness_score: 80, notes: ""
  });

  const [recoveryForm, setRecoveryForm] = useState({
    patient_id: "", recovery_stage: "Improving",
    recovery_score: 80, days_to_recovery: "", notes: ""
  });

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [t, m, r] = await Promise.all([
        api.get("/clinical/treatments"),
        api.get("/clinical/medications"),
        api.get("/clinical/recovery")
      ]);

      setTreatments(t.data?.records || []);
      setTreatmentAverage(t.data?.average_effectiveness || 0);

      setMedications(m.data?.records || []);
      setMedicationAverage(m.data?.average_effectiveness || 0);

      setRecovery(r.data?.records || []);
      setRecoveryAverage(r.data?.average_recovery_score || 0);
      setRecoveryDays(r.data?.average_days_to_recovery || 0);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load clinical analytics.");
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    if (!canAddRecords) return;

    try {
      const res = await api.get("/patients");
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadPatients();
  }, []);

  const resetForms = () => {
    setTreatmentForm({
      patient_id: "", treatment_name: "", outcome: "Improved",
      effectiveness_score: 80, notes: ""
    });

    setMedicationForm({
      patient_id: "", medication_name: "", outcome: "Effective",
      effectiveness_score: 80, notes: ""
    });

    setRecoveryForm({
      patient_id: "", recovery_stage: "Improving",
      recovery_score: 80, days_to_recovery: "", notes: ""
    });
  };

  const closeForm = () => {
    setFormType("");
    resetForms();
  };

  const addRecord = async (e, type) => {
    e.preventDefault();

    try {
      if (type === "treatment") {
        await api.post("/clinical/treatments", {
          ...treatmentForm,
          patient_id: Number(treatmentForm.patient_id),
          effectiveness_score: Number(treatmentForm.effectiveness_score)
        });
      }

      if (type === "medication") {
        await api.post("/clinical/medications", {
          ...medicationForm,
          patient_id: Number(medicationForm.patient_id),
          effectiveness_score: Number(medicationForm.effectiveness_score)
        });
      }

      if (type === "recovery") {
        await api.post("/clinical/recovery", {
          ...recoveryForm,
          patient_id: Number(recoveryForm.patient_id),
          recovery_score: Number(recoveryForm.recovery_score),
          days_to_recovery: recoveryForm.days_to_recovery
            ? Number(recoveryForm.days_to_recovery)
            : null
        });
      }

      closeForm();
      await loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to save record.");
    }
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
            <BarChart3 size={21} className="text-blue-300" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Clinical Analytics
            </h1>
            <p className="text-sm text-slate-500">
              Treatment, medication and recovery analysis
            </p>
          </div>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-white border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <SummaryCard
          icon={Activity}
          title="Treatment Effectiveness"
          value={treatmentAverage}
          records={treatments.length}
        />

        <SummaryCard
          icon={Pill}
          title="Medication Effectiveness"
          value={medicationAverage}
          records={medications.length}
        />

        <SummaryCard
          icon={HeartPulse}
          title="Recovery Score"
          value={recoveryAverage}
          records={recovery.length}
          extra={`Average recovery: ${recoveryDays} days`}
        />

      </div>

      {/* CLINICAL OVERVIEW */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Clinical Performance</h2>
            <p className="text-xs text-slate-400 mt-1">
              Current outcome measurements across clinical records
            </p>
          </div>
          <TrendingUp size={20} className="text-blue-300" />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <MiniMetric label="Treatment Records" value={treatments.length} />
          <MiniMetric label="Medication Records" value={medications.length} />
          <MiniMetric label="Recovery Records" value={recovery.length} />
        </div>
      </div>

      {/* TREATMENT */}
      <AnalyticsSection
        title="Treatment Effectiveness"
        subtitle="Evaluate outcomes of treatments used"
        icon={Activity}
        button="Add Treatment"
        canAdd={canAddRecords}
        onAdd={() => setFormType("treatment")}
      >
        <AnalyticsTable
          records={treatments}
          type="treatment"
          empty="No treatment records available."
        />
      </AnalyticsSection>

      {/* MEDICATION */}
      <AnalyticsSection
        title="Medication Effectiveness"
        subtitle="Evaluate medication outcomes"
        icon={Pill}
        button="Add Medication"
        canAdd={canAddRecords}
        onAdd={() => setFormType("medication")}
      >
        <AnalyticsTable
          records={medications}
          type="medication"
          empty="No medication records available."
        />
      </AnalyticsSection>

      {/* RECOVERY */}
      <AnalyticsSection
        title="Recovery Analysis"
        subtitle="Track patient recovery progress"
        icon={HeartPulse}
        button="Add Recovery"
        canAdd={canAddRecords}
        onAdd={() => setFormType("recovery")}
      >
        <RecoveryTable records={recovery} />
      </AnalyticsSection>

      {/* FORM MODAL */}
      {formType && (
        <RecordModal
          type={formType}
          patients={patients}
          treatmentForm={treatmentForm}
          medicationForm={medicationForm}
          recoveryForm={recoveryForm}
          setTreatmentForm={setTreatmentForm}
          setMedicationForm={setMedicationForm}
          setRecoveryForm={setRecoveryForm}
          onClose={closeForm}
          onSubmit={e => addRecord(e, formType)}
        />
      )}

    </div>
  );
}

/* SUMMARY CARD */
function SummaryCard({ icon: Icon, title, value, records, extra }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon size={19} className="text-slate-700" />
        </div>

        <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
          {records} records
        </span>
      </div>

      <p className="text-sm text-slate-500 mt-4">{title}</p>

      <div className="flex items-end gap-2 mt-1">
        <h2 className="text-2xl font-bold text-slate-900">
          {value}%
        </h2>
        <span className="text-xs text-slate-400 mb-1">average</span>
      </div>

      {extra && (
        <p className="text-xs text-slate-400 mt-1">{extra}</p>
      )}
    </div>
  );
}

/* SECTION */
function AnalyticsSection({
  title, subtitle, icon: Icon, button,
  canAdd, onAdd, children
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon size={17} className="text-slate-700" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {canAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
          >
            <Plus size={15} />
            {button}
          </button>
        )}
      </div>

      {children}
    </div>
  );
}

/* MINI METRIC */
function MiniMetric({ label, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

/* TABLE */
function AnalyticsTable({ records, type, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">

        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Patient</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
              {type === "treatment" ? "Treatment" : "Medication"}
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">Outcome</th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">Effectiveness</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Notes</th>
          </tr>
        </thead>

        <tbody>
          {!records.length ? (
            <tr>
              <td colSpan="5" className="py-10 text-center text-sm text-slate-400">
                {empty}
              </td>
            </tr>
          ) : (
            records.map(record => (
              <tr
                key={record.id}
                className="border-b border-slate-100 hover:bg-slate-50/70"
              >
                <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                  P-{String(record.patient_id).padStart(4, "0")}
                </td>

                <td className="px-5 py-3.5 text-sm text-slate-700">
                  {type === "treatment"
                    ? record.treatment_name
                    : record.medication_name}
                </td>

                <td className="px-5 py-3.5 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
                    {record.outcome}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-center">
                  <Score value={record.effectiveness_score} />
                </td>

                <td className="px-5 py-3.5 text-sm text-slate-400">
                  {record.notes || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
}

/* RECOVERY TABLE */
function RecoveryTable({ records }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">

        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Patient</th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">Stage</th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">Recovery Score</th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">Days</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Notes</th>
          </tr>
        </thead>

        <tbody>
          {!records.length ? (
            <tr>
              <td colSpan="5" className="py-10 text-center text-sm text-slate-400">
                No recovery records available.
              </td>
            </tr>
          ) : (
            records.map(record => (
              <tr
                key={record.id}
                className="border-b border-slate-100 hover:bg-slate-50/70"
              >
                <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                  P-{String(record.patient_id).padStart(4, "0")}
                </td>

                <td className="px-5 py-3.5 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
                    {record.recovery_stage}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-center">
                  <Score value={record.recovery_score} />
                </td>

                <td className="px-5 py-3.5 text-center text-sm text-slate-600">
                  {record.days_to_recovery ?? "—"}
                </td>

                <td className="px-5 py-3.5 text-sm text-slate-400">
                  {record.notes || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
}

/* SCORE */
function Score({ value }) {
  const score = Number(value) || 0;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-700 rounded-full"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-700">
        {score}%
      </span>
    </div>
  );
}

/* MODAL */
function RecordModal({
  type, patients,
  treatmentForm, medicationForm, recoveryForm,
  setTreatmentForm, setMedicationForm, setRecoveryForm,
  onClose, onSubmit
}) {
  const title = {
    treatment: "Add Treatment Record",
    medication: "Add Medication Record",
    recovery: "Add Recovery Record"
  }[type];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter clinical outcome information
            </p>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">

          <select
            required
            value={
              type === "treatment"
                ? treatmentForm.patient_id
                : type === "medication"
                ? medicationForm.patient_id
                : recoveryForm.patient_id
            }
            onChange={e => {
              const value = e.target.value;

              if (type === "treatment")
                setTreatmentForm({ ...treatmentForm, patient_id: value });

              if (type === "medication")
                setMedicationForm({ ...medicationForm, patient_id: value });

              if (type === "recovery")
                setRecoveryForm({ ...recoveryForm, patient_id: value });
            }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name} — #{patient.id}
              </option>
            ))}
          </select>

          {type === "treatment" && (
            <>
              <input
                required
                placeholder="Treatment name"
                value={treatmentForm.treatment_name}
                onChange={e => setTreatmentForm({
                  ...treatmentForm, treatment_name: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <select
                value={treatmentForm.outcome}
                onChange={e => setTreatmentForm({
                  ...treatmentForm, outcome: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              >
                <option>Improved</option>
                <option>Stable</option>
                <option>No Improvement</option>
              </select>

              <ScoreInput
                value={treatmentForm.effectiveness_score}
                onChange={value => setTreatmentForm({
                  ...treatmentForm, effectiveness_score: value
                })}
              />

              <textarea
                placeholder="Notes (optional)"
                value={treatmentForm.notes}
                onChange={e => setTreatmentForm({
                  ...treatmentForm, notes: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </>
          )}

          {type === "medication" && (
            <>
              <input
                required
                placeholder="Medication name"
                value={medicationForm.medication_name}
                onChange={e => setMedicationForm({
                  ...medicationForm, medication_name: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <select
                value={medicationForm.outcome}
                onChange={e => setMedicationForm({
                  ...medicationForm, outcome: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              >
                <option>Effective</option>
                <option>Partially Effective</option>
                <option>Ineffective</option>
              </select>

              <ScoreInput
                value={medicationForm.effectiveness_score}
                onChange={value => setMedicationForm({
                  ...medicationForm, effectiveness_score: value
                })}
              />

              <textarea
                placeholder="Notes (optional)"
                value={medicationForm.notes}
                onChange={e => setMedicationForm({
                  ...medicationForm, notes: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </>
          )}

          {type === "recovery" && (
            <>
              <select
                value={recoveryForm.recovery_stage}
                onChange={e => setRecoveryForm({
                  ...recoveryForm, recovery_stage: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              >
                <option>Initial</option>
                <option>Improving</option>
                <option>Stable</option>
                <option>Recovered</option>
              </select>

              <ScoreInput
                value={recoveryForm.recovery_score}
                onChange={value => setRecoveryForm({
                  ...recoveryForm, recovery_score: value
                })}
                label="Recovery Score"
              />

              <input
                type="number"
                min="0"
                placeholder="Days to recovery"
                value={recoveryForm.days_to_recovery}
                onChange={e => setRecoveryForm({
                  ...recoveryForm, days_to_recovery: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              />

              <textarea
                placeholder="Notes (optional)"
                value={recoveryForm.notes}
                onChange={e => setRecoveryForm({
                  ...recoveryForm, notes: e.target.value
                })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
            >
              Save Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function ScoreInput({ value, onChange, label = "Effectiveness Score" }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">
        {label}: {value}%
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full mt-2 accent-slate-700"
      />
    </div>
  );
}

export default ClinicalAnalytics; 