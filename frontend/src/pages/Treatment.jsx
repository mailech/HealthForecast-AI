import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

import {
  FaPills,
  FaUserMd,
  FaCalendarCheck,
  FaNotesMedical,
  FaCheckCircle,
  FaUserInjured,
} from "react-icons/fa";

function Treatment() {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState("");

  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [doctorRecommendations, setDoctorRecommendations] =
    useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      setError("");

      const response = await api.get("/api/patients");

      setPatients(response.data || []);

    } catch (error) {
      console.error(
        "Error fetching patients:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        setError(
          "You do not have permission to manage treatment plans."
        );
      } else {
        setError(
          "Unable to load patient information."
        );
      }
    } finally {
      setLoadingPatients(false);
    }
  };

  // =====================================================
  // SELECT PATIENT
  // =====================================================

  const handlePatientChange = (event) => {
    const patientId = event.target.value;

    setSelectedPatient(patientId);
    setSaved(false);
    setError("");

    const patient = patients.find(
      (item) =>
        String(item.id || item._id) ===
        String(patientId)
    );

    if (patient?.treatment_plan) {
      setDiagnosis(
        patient.treatment_plan.diagnosis || ""
      );

      setMedicines(
        patient.treatment_plan.medicines || ""
      );

      setDoctorRecommendations(
        patient.treatment_plan.doctor_recommendations ||
          ""
      );

      setFollowUpDate(
        patient.treatment_plan.follow_up_date || ""
      );
    } else {
      setDiagnosis("");
      setMedicines("");
      setDoctorRecommendations("");
      setFollowUpDate("");
    }
  };

  // =====================================================
  // SAVE TREATMENT
  // =====================================================

  const handleSave = async () => {
    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }

    if (!diagnosis.trim()) {
      setError("Please enter the diagnosis.");
      return;
    }

    if (!medicines.trim()) {
      setError("Please enter the prescribed medicines.");
      return;
    }

    if (!followUpDate) {
      setError("Please select a follow-up date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      await api.patch(
        `/api/patients/${selectedPatient}/treatment`,
        {
          patient_id: selectedPatient,
          diagnosis: diagnosis.trim(),
          medicines: medicines.trim(),
          doctor_recommendations:
            doctorRecommendations.trim(),
          follow_up_date: followUpDate,
        }
      );

      // Update local patient data so the page immediately reflects
      // the saved treatment.
      setPatients((currentPatients) =>
        currentPatients.map((patient) => {
          const patientId =
            patient.id || patient._id;

          if (
            String(patientId) !==
            String(selectedPatient)
          ) {
            return patient;
          }

          return {
            ...patient,
            treatment_plan: {
              diagnosis: diagnosis.trim(),
              medicines: medicines.trim(),
              doctor_recommendations:
                doctorRecommendations.trim(),
              follow_up_date: followUpDate,
            },
          };
        })
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);

    } catch (error) {
      console.error(
        "Error saving treatment:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You can only update treatment for your assigned patients."
        );
      } else if (error.response?.status === 404) {
        setError("Patient not found.");
      } else {
        setError(
          error.response?.data?.detail ||
            "Unable to save treatment plan."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SELECTED PATIENT
  // =====================================================

  const selectedPatientData = patients.find(
    (patient) =>
      String(patient.id || patient._id) ===
      String(selectedPatient)
  );

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Treatment Management
        </h1>

        <p className="text-gray-500 mt-2">
          Create and manage treatment plans for assigned
          patients.
        </p>

      </div>


      {/* ERROR */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
          {error}
        </div>
      )}


      <div className="grid lg:grid-cols-2 gap-8">

        {/* =================================================
            TREATMENT FORM
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Treatment Plan
          </h2>

          <div className="space-y-5">

            {/* PATIENT */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Patient
              </label>

              <select
                value={selectedPatient}
                onChange={handlePatientChange}
                disabled={loadingPatients}
                className="w-full border rounded-lg p-3 bg-white"
              >

                <option value="">
                  {loadingPatients
                    ? "Loading patients..."
                    : "Select a patient"}
                </option>

                {patients.map((patient) => (
                  <option
                    key={
                      patient.id ||
                      patient._id
                    }
                    value={
                      patient.id ||
                      patient._id
                    }
                  >
                    {patient.name || "Unknown Patient"}
                    {" - Age "}
                    {patient.age ?? "—"}
                  </option>
                ))}

              </select>

            </div>


            {/* SELECTED PATIENT */}

            {selectedPatientData && (
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">

                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                  <FaUserInjured />
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    {selectedPatientData.name}
                  </p>

                  <p className="text-sm text-gray-600">
                    Age: {selectedPatientData.age ?? "—"}
                    {" • "}
                    {selectedPatientData.disease || "No disease recorded"}
                  </p>

                </div>

              </div>
            )}


            {/* DIAGNOSIS */}

            <input
              type="text"
              value={diagnosis}
              onChange={(event) =>
                setDiagnosis(event.target.value)
              }
              placeholder="Diagnosis"
              className="w-full border rounded-lg p-3"
            />


            {/* MEDICINES */}

            <textarea
              rows="4"
              value={medicines}
              onChange={(event) =>
                setMedicines(event.target.value)
              }
              placeholder="Prescribed Medicines"
              className="w-full border rounded-lg p-3"
            />


            {/* RECOMMENDATIONS */}

            <textarea
              rows="4"
              value={doctorRecommendations}
              onChange={(event) =>
                setDoctorRecommendations(
                  event.target.value
                )
              }
              placeholder="Doctor Recommendations"
              className="w-full border rounded-lg p-3"
            />


            {/* FOLLOW UP */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Follow-up Date
              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(event) =>
                  setFollowUpDate(
                    event.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              />

            </div>


            {/* SAVE */}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-semibold"
            >
              {saving
                ? "Saving Treatment Plan..."
                : "Save Treatment Plan"}
            </button>

          </div>


          {/* SUCCESS */}

          {saved && (
            <div className="mt-5 bg-green-100 text-green-700 rounded-lg p-3 flex items-center gap-2">

              <FaCheckCircle />

              Treatment plan saved successfully.

            </div>
          )}

        </div>


        {/* =================================================
            CURRENT TREATMENT SUMMARY
        ================================================= */}

        <div className="space-y-6">

          {/* MEDICATION */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3">

              <FaPills className="text-blue-600 text-2xl" />

              <h2 className="text-xl font-bold">
                Medication
              </h2>

            </div>

            <div className="mt-4">

              {medicines ? (
                <p className="text-gray-700 whitespace-pre-line">
                  {medicines}
                </p>
              ) : (
                <p className="text-gray-400">
                  No medicines prescribed yet.
                </p>
              )}

            </div>

          </div>


          {/* DOCTOR ADVICE */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3">

              <FaUserMd className="text-green-600 text-2xl" />

              <h2 className="text-xl font-bold">
                Doctor Advice
              </h2>

            </div>

            <div className="mt-4">

              {doctorRecommendations ? (
                <p className="text-gray-700 whitespace-pre-line">
                  {doctorRecommendations}
                </p>
              ) : (
                <p className="text-gray-400">
                  No recommendations entered yet.
                </p>
              )}

            </div>

          </div>


          {/* FOLLOW UP */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3">

              <FaCalendarCheck className="text-orange-500 text-2xl" />

              <h2 className="text-xl font-bold">
                Follow-up
              </h2>

            </div>

            <p className="mt-4 text-gray-600">

              {followUpDate
                ? `Next appointment: ${followUpDate}`
                : "No follow-up date scheduled."}

            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          RECOVERY TRACKER
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-8 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <FaNotesMedical className="text-red-500 text-2xl" />

          <h2 className="text-xl font-bold">
            Recovery Progress
          </h2>

        </div>

        <div className="space-y-6">

          <div>

            <div className="flex justify-between mb-2">

              <span>
                Overall Recovery
              </span>

              <span>
                80%
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: "80%" }}
              />

            </div>

          </div>


          <div>

            <div className="flex justify-between mb-2">

              <span>
                Medication Compliance
              </span>

              <span>
                92%
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: "92%" }}
              />

            </div>

          </div>


          <div>

            <div className="flex justify-between mb-2">

              <span>
                Vital Stability
              </span>

              <span>
                75%
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-yellow-500 h-4 rounded-full"
                style={{ width: "75%" }}
              />

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Treatment;