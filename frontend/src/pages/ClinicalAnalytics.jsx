import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/api";

import {
  Activity,
  Pill,
  HeartPulse,
  Plus,
  RefreshCw,
  BarChart3,
} from "lucide-react";

function ClinicalAnalytics() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role || "patient";

  const canAddRecords =
    role === "admin" || role === "doctor";

  const [treatments, setTreatments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [recovery, setRecovery] = useState([]);

  const [treatmentAverage, setTreatmentAverage] =
    useState(0);

  const [medicationAverage, setMedicationAverage] =
    useState(0);

  const [recoveryAverage, setRecoveryAverage] =
    useState(0);

  const [recoveryDays, setRecoveryDays] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [showTreatmentForm, setShowTreatmentForm] =
    useState(false);

  const [showMedicationForm, setShowMedicationForm] =
    useState(false);

  const [showRecoveryForm, setShowRecoveryForm] =
    useState(false);

  const [treatmentForm, setTreatmentForm] =
    useState({
      patient_id: "",
      treatment_name: "",
      outcome: "Improved",
      effectiveness_score: 80,
      notes: "",
    });

  const [medicationForm, setMedicationForm] =
    useState({
      patient_id: "",
      medication_name: "",
      outcome: "Effective",
      effectiveness_score: 80,
      notes: "",
    });

  const [recoveryForm, setRecoveryForm] =
    useState({
      patient_id: "",
      recovery_stage: "Improving",
      recovery_score: 80,
      days_to_recovery: "",
      notes: "",
    });

  const [patients, setPatients] = useState([]);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD ANALYTICS
  // ==========================================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        treatmentResponse,
        medicationResponse,
        recoveryResponse,
      ] = await Promise.all([
        api.get("/clinical/treatments"),
        api.get("/clinical/medications"),
        api.get("/clinical/recovery"),
      ]);

      setTreatments(
        treatmentResponse.data?.records || []
      );

      setTreatmentAverage(
        treatmentResponse.data?.average_effectiveness || 0
      );

      setMedications(
        medicationResponse.data?.records || []
      );

      setMedicationAverage(
        medicationResponse.data?.average_effectiveness || 0
      );

      setRecovery(
        recoveryResponse.data?.records || []
      );

      setRecoveryAverage(
        recoveryResponse.data?.average_recovery_score || 0
      );

      setRecoveryDays(
        recoveryResponse.data?.average_days_to_recovery || 0
      );
    } catch (err) {
      console.error(
        "Failed to load clinical analytics:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load clinical analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD PATIENTS
  // ==========================================================

  const loadPatients = async () => {
    if (!canAddRecords) {
      return;
    }

    try {
      const response =
        await api.get("/patients");

      setPatients(response.data || []);
    } catch (err) {
      console.error(
        "Failed to load patients:",
        err
      );
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadPatients();
  }, []);

  // ==========================================================
  // FORM HANDLERS
  // ==========================================================

  const handleTreatmentChange = (e) => {
    setTreatmentForm({
      ...treatmentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleMedicationChange = (e) => {
    setMedicationForm({
      ...medicationForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRecoveryChange = (e) => {
    setRecoveryForm({
      ...recoveryForm,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================================
  // ADD TREATMENT
  // ==========================================================

  const handleAddTreatment = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/clinical/treatments",
        {
          ...treatmentForm,
          patient_id: Number(
            treatmentForm.patient_id
          ),
          effectiveness_score: Number(
            treatmentForm.effectiveness_score
          ),
        }
      );

      setShowTreatmentForm(false);

      setTreatmentForm({
        patient_id: "",
        treatment_name: "",
        outcome: "Improved",
        effectiveness_score: 80,
        notes: "",
      });

      await loadAnalytics();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Unable to add treatment record."
      );
    }
  };

  // ==========================================================
  // ADD MEDICATION
  // ==========================================================

  const handleAddMedication = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/clinical/medications",
        {
          ...medicationForm,
          patient_id: Number(
            medicationForm.patient_id
          ),
          effectiveness_score: Number(
            medicationForm.effectiveness_score
          ),
        }
      );

      setShowMedicationForm(false);

      setMedicationForm({
        patient_id: "",
        medication_name: "",
        outcome: "Effective",
        effectiveness_score: 80,
        notes: "",
      });

      await loadAnalytics();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Unable to add medication record."
      );
    }
  };

  // ==========================================================
  // ADD RECOVERY
  // ==========================================================

  const handleAddRecovery = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/clinical/recovery",
        {
          ...recoveryForm,
          patient_id: Number(
            recoveryForm.patient_id
          ),
          recovery_score: Number(
            recoveryForm.recovery_score
          ),
          days_to_recovery:
            recoveryForm.days_to_recovery
              ? Number(
                  recoveryForm.days_to_recovery
                )
              : null,
        }
      );

      setShowRecoveryForm(false);

      setRecoveryForm({
        patient_id: "",
        recovery_stage: "Improving",
        recovery_score: 80,
        days_to_recovery: "",
        notes: "",
      });

      await loadAnalytics();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Unable to add recovery record."
      );
    }
  };

  // ==========================================================
  // SCORE HELPERS
  // ==========================================================

  const getScoreClass = (score) => {
    if (score >= 80) {
      return "text-green-600";
    }

    if (score >= 50) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  return (
    <MainLayout>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">

              <BarChart3
                size={26}
                className="text-blue-600 dark:text-blue-400"
              />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Clinical Analytics
              </h1>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Treatment, medication and recovery analysis
              </p>

            </div>

          </div>

        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-5 py-4">
          {error}
        </div>
      )}


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">

              <Activity
                size={24}
                className="text-blue-600 dark:text-blue-400"
              />

            </div>

            <div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Treatment Effectiveness
              </p>

              <h2
                className={`text-2xl font-bold ${
                  getScoreClass(
                    treatmentAverage
                  )
                }`}
              >
                {loading
                  ? "..."
                  : `${treatmentAverage}%`}
              </h2>

            </div>

          </div>

        </div>


        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">

              <Pill
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />

            </div>

            <div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Medication Effectiveness
              </p>

              <h2
                className={`text-2xl font-bold ${
                  getScoreClass(
                    medicationAverage
                  )
                }`}
              >
                {loading
                  ? "..."
                  : `${medicationAverage}%`}
              </h2>

            </div>

          </div>

        </div>


        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">

              <HeartPulse
                size={24}
                className="text-green-600 dark:text-green-400"
              />

            </div>

            <div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recovery Score
              </p>

              <h2
                className={`text-2xl font-bold ${
                  getScoreClass(
                    recoveryAverage
                  )
                }`}
              >
                {loading
                  ? "..."
                  : `${recoveryAverage}%`}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Avg. recovery:{" "}
                {recoveryDays} days
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          TREATMENT EFFECTIVENESS
      ====================================================== */}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">

          <div>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Treatment Effectiveness
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Evaluate outcomes of treatments used
            </p>

          </div>

          {canAddRecords && (
            <button
              onClick={() =>
                setShowTreatmentForm(
                  !showTreatmentForm
                )
              }
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Treatment
            </button>
          )}

        </div>


        {showTreatmentForm && canAddRecords && (

          <form
            onSubmit={handleAddTreatment}
            className="p-6 bg-slate-50 dark:bg-slate-700/40 grid grid-cols-1 md:grid-cols-2 gap-4"
          >

            <select
              name="patient_id"
              value={treatmentForm.patient_id}
              onChange={handleTreatmentChange}
              required
              className="border rounded-lg px-4 py-3"
            >
              <option value="">
                Select Patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name} — #{patient.id}
                </option>
              ))}
            </select>


            <input
              name="treatment_name"
              value={treatmentForm.treatment_name}
              onChange={handleTreatmentChange}
              placeholder="Treatment name"
              required
              className="border rounded-lg px-4 py-3"
            />


            <select
              name="outcome"
              value={treatmentForm.outcome}
              onChange={handleTreatmentChange}
              className="border rounded-lg px-4 py-3"
            >
              <option value="Improved">
                Improved
              </option>

              <option value="Stable">
                Stable
              </option>

              <option value="No Improvement">
                No Improvement
              </option>
            </select>


            <input
              type="number"
              name="effectiveness_score"
              min="0"
              max="100"
              value={
                treatmentForm.effectiveness_score
              }
              onChange={handleTreatmentChange}
              placeholder="Effectiveness score"
              className="border rounded-lg px-4 py-3"
            />


            <input
              name="notes"
              value={treatmentForm.notes}
              onChange={handleTreatmentChange}
              placeholder="Notes (optional)"
              className="border rounded-lg px-4 py-3 md:col-span-2"
            />


            <div className="md:col-span-2 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowTreatmentForm(false)
                }
                className="px-5 py-2.5 rounded-lg border"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white"
              >
                Save Treatment
              </button>

            </div>

          </form>

        )}


        <AnalyticsTable
          records={treatments}
          type="treatment"
          emptyText="No treatment records available."
        />

      </div>


      {/* ======================================================
          MEDICATION EFFECTIVENESS
      ====================================================== */}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">

          <div>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Medication Effectiveness
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Evaluate medication outcomes
            </p>

          </div>

          {canAddRecords && (
            <button
              onClick={() =>
                setShowMedicationForm(
                  !showMedicationForm
                )
              }
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
            >
              <Plus size={17} />
              Add Medication
            </button>
          )}

        </div>


        {showMedicationForm && canAddRecords && (

          <form
            onSubmit={handleAddMedication}
            className="p-6 bg-slate-50 dark:bg-slate-700/40 grid grid-cols-1 md:grid-cols-2 gap-4"
          >

            <select
              name="patient_id"
              value={medicationForm.patient_id}
              onChange={handleMedicationChange}
              required
              className="border rounded-lg px-4 py-3"
            >
              <option value="">
                Select Patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name} — #{patient.id}
                </option>
              ))}
            </select>


            <input
              name="medication_name"
              value={
                medicationForm.medication_name
              }
              onChange={handleMedicationChange}
              placeholder="Medication name"
              required
              className="border rounded-lg px-4 py-3"
            />


            <select
              name="outcome"
              value={medicationForm.outcome}
              onChange={handleMedicationChange}
              className="border rounded-lg px-4 py-3"
            >
              <option value="Effective">
                Effective
              </option>

              <option value="Partially Effective">
                Partially Effective
              </option>

              <option value="Ineffective">
                Ineffective
              </option>
            </select>


            <input
              type="number"
              name="effectiveness_score"
              min="0"
              max="100"
              value={
                medicationForm.effectiveness_score
              }
              onChange={handleMedicationChange}
              placeholder="Effectiveness score"
              className="border rounded-lg px-4 py-3"
            />


            <input
              name="notes"
              value={medicationForm.notes}
              onChange={handleMedicationChange}
              placeholder="Notes (optional)"
              className="border rounded-lg px-4 py-3 md:col-span-2"
            />


            <div className="md:col-span-2 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowMedicationForm(false)
                }
                className="px-5 py-2.5 rounded-lg border"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-purple-600 text-white"
              >
                Save Medication
              </button>

            </div>

          </form>

        )}


        <AnalyticsTable
          records={medications}
          type="medication"
          emptyText="No medication records available."
        />

      </div>


      {/* ======================================================
          RECOVERY ANALYSIS
      ====================================================== */}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">

          <div>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Recovery Analysis
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track patient recovery progress
            </p>

          </div>

          {canAddRecords && (
            <button
              onClick={() =>
                setShowRecoveryForm(
                  !showRecoveryForm
                )
              }
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700"
            >
              <Plus size={17} />
              Add Recovery
            </button>
          )}

        </div>


        {showRecoveryForm && canAddRecords && (

          <form
            onSubmit={handleAddRecovery}
            className="p-6 bg-slate-50 dark:bg-slate-700/40 grid grid-cols-1 md:grid-cols-2 gap-4"
          >

            <select
              name="patient_id"
              value={recoveryForm.patient_id}
              onChange={handleRecoveryChange}
              required
              className="border rounded-lg px-4 py-3"
            >
              <option value="">
                Select Patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name} — #{patient.id}
                </option>
              ))}
            </select>


            <select
              name="recovery_stage"
              value={
                recoveryForm.recovery_stage
              }
              onChange={handleRecoveryChange}
              className="border rounded-lg px-4 py-3"
            >
              <option value="Initial">
                Initial
              </option>

              <option value="Improving">
                Improving
              </option>

              <option value="Stable">
                Stable
              </option>

              <option value="Recovered">
                Recovered
              </option>
            </select>


            <input
              type="number"
              name="recovery_score"
              min="0"
              max="100"
              value={
                recoveryForm.recovery_score
              }
              onChange={handleRecoveryChange}
              placeholder="Recovery score"
              className="border rounded-lg px-4 py-3"
            />


            <input
              type="number"
              name="days_to_recovery"
              min="0"
              value={
                recoveryForm.days_to_recovery
              }
              onChange={handleRecoveryChange}
              placeholder="Days to recovery"
              className="border rounded-lg px-4 py-3"
            />


            <input
              name="notes"
              value={recoveryForm.notes}
              onChange={handleRecoveryChange}
              placeholder="Notes (optional)"
              className="border rounded-lg px-4 py-3 md:col-span-2"
            />


            <div className="md:col-span-2 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowRecoveryForm(false)
                }
                className="px-5 py-2.5 rounded-lg border"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-green-600 text-white"
              >
                Save Recovery
              </button>

            </div>

          </form>

        )}


        <RecoveryTable
          records={recovery}
        />

      </div>

    </MainLayout>
  );
}


// ============================================================
// ANALYTICS TABLE
// ============================================================

function AnalyticsTable({
  records,
  type,
  emptyText,
}) {
  return (
    <div className="overflow-x-auto">

      <table className="w-full">

        <thead className="bg-slate-50 dark:bg-slate-700">

          <tr>

            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Patient
            </th>

            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              {type === "treatment"
                ? "Treatment"
                : "Medication"}
            </th>

            <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Outcome
            </th>

            <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Effectiveness
            </th>

            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Notes
            </th>

          </tr>

        </thead>

        <tbody>

          {records.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="text-center py-10 text-gray-500 dark:text-gray-400"
              >
                {emptyText}
              </td>
            </tr>
          )}

          {records.map((record) => (

            <tr
              key={record.id}
              className="border-t border-slate-100 dark:border-slate-700"
            >

              <td className="px-6 py-4 text-slate-800 dark:text-white">
                P-{String(
                  record.patient_id
                ).padStart(4, "0")}
              </td>

              <td className="px-6 py-4 text-slate-700 dark:text-gray-200">
                {type === "treatment"
                  ? record.treatment_name
                  : record.medication_name}
              </td>

              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                {record.outcome}
              </td>

              <td className="px-6 py-4 text-center">

                <span
                  className={`font-semibold ${
                    record.effectiveness_score >= 80
                      ? "text-green-600"
                      : record.effectiveness_score >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {record.effectiveness_score}%
                </span>

              </td>

              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                {record.notes || "—"}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}


// ============================================================
// RECOVERY TABLE
// ============================================================

function RecoveryTable({ records }) {
  return (
    <div className="overflow-x-auto">

      <table className="w-full">

        <thead className="bg-slate-50 dark:bg-slate-700">

          <tr>

            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Patient
            </th>

            <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Recovery Stage
            </th>

            <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Recovery Score
            </th>

            <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Days
            </th>

            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
              Notes
            </th>

          </tr>

        </thead>

        <tbody>

          {records.length === 0 && (
            <tr>

              <td
                colSpan="5"
                className="text-center py-10 text-gray-500 dark:text-gray-400"
              >
                No recovery records available.
              </td>

            </tr>
          )}

          {records.map((record) => (

            <tr
              key={record.id}
              className="border-t border-slate-100 dark:border-slate-700"
            >

              <td className="px-6 py-4 text-slate-800 dark:text-white">
                P-{String(
                  record.patient_id
                ).padStart(4, "0")}
              </td>

              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                {record.recovery_stage}
              </td>

              <td className="px-6 py-4 text-center">

                <span
                  className={`font-semibold ${
                    record.recovery_score >= 80
                      ? "text-green-600"
                      : record.recovery_score >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {record.recovery_score}%
                </span>

              </td>

              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                {record.days_to_recovery ?? "—"}
              </td>

              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                {record.notes || "—"}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default ClinicalAnalytics;