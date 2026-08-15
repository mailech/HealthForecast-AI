import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/api";

import {
  Brain,
  Activity,
  HeartPulse,
  AlertTriangle,
  CheckCircle,
  User,
  RefreshCw,
} from "lucide-react";

function Prediction() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");

  const [prediction, setPrediction] = useState(null);

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  const [loadingPrediction, setLoadingPrediction] =
    useState(false);

  const [error, setError] = useState("");

  // =========================
  // LOAD PATIENTS
  // =========================

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(response.data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load patients."
      );
    } finally {
      setLoadingPatients(false);
    }
  };


  // =========================
  // RUN PREDICTION
  // =========================

  const handlePrediction = async (e) => {
    e.preventDefault();

    if (!patientId) {
      setError("Please select a patient.");
      return;
    }

    try {
      setLoadingPrediction(true);
      setPrediction(null);
      setError("");

      const response = await api.post(
        "/prediction",
        {
          patient_id: Number(patientId),
        }
      );

      setPrediction(response.data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Prediction failed. Please try again."
      );

    } finally {
      setLoadingPrediction(false);
    }
  };


  // =========================
  // SELECTED PATIENT
  // =========================

  const selectedPatient = patients.find(
    (patient) =>
      patient.id === Number(patientId)
  );


  return (
    <MainLayout>

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

            <Brain
              size={26}
              className="text-blue-600"
            />

          </div>

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Health Risk Prediction
            </h1>

            <p className="text-gray-500 mt-1">
              Analyze patient data and predict
              readmission risk
            </p>

          </div>

        </div>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">

          {error}

        </div>

      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* =========================
            PATIENT SELECTION
        ========================= */}

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-3 rounded-lg bg-blue-50">

              <User
                size={21}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-semibold text-slate-800">
                Select Patient
              </h2>

              <p className="text-sm text-gray-500">
                Select a patient from your database
              </p>

            </div>

          </div>


          <form
            onSubmit={handlePrediction}
            className="space-y-6"
          >

            {/* PATIENT */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient
              </label>

              <select
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setPrediction(null);
                  setError("");
                }}
                disabled={loadingPatients}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  {loadingPatients
                    ? "Loading patients..."
                    : "Select a patient"}
                </option>

                {patients.map((patient) => (

                  <option
                    key={patient.id}
                    value={patient.id}
                  >

                    {patient.name} — Age{" "}
                    {patient.age} —{" "}
                    {patient.disease}

                  </option>

                ))}

              </select>

            </div>


            {/* PATIENT INFORMATION */}

            {selectedPatient && (

              <div className="bg-slate-50 rounded-xl p-5">

                <h3 className="font-semibold text-slate-800 mb-4">
                  Patient Information
                </h3>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  <div>

                    <p className="text-xs text-gray-500">
                      Name
                    </p>

                    <p className="font-medium mt-1">
                      {selectedPatient.name}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Age
                    </p>

                    <p className="font-medium mt-1">
                      {selectedPatient.age}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Gender
                    </p>

                    <p className="font-medium mt-1">
                      {selectedPatient.gender}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Disease
                    </p>

                    <p className="font-medium mt-1">
                      {selectedPatient.disease}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Current Risk
                    </p>

                    <p className="font-medium mt-1">
                      {selectedPatient.risk}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Status
                    </p>

                    <p className="font-medium mt-1">
                      {selectedPatient.status}
                    </p>

                  </div>

                </div>

              </div>

            )}


            {/* BUTTON */}

            <div className="flex justify-end">

              <button
                type="submit"
                disabled={
                  loadingPrediction ||
                  !patientId
                }
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loadingPrediction ? (

                  <>
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />

                    Analyzing...

                  </>

                ) : (

                  <>
                    <Brain size={18} />

                    Predict Risk

                  </>

                )}

              </button>

            </div>

          </form>

        </div>


        {/* =========================
            RESULT
        ========================= */}

        <div className="bg-white rounded-xl shadow-sm p-6 h-fit">

          <h2 className="text-xl font-semibold text-slate-800">
            Prediction Result
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            AI-assisted readmission risk assessment
          </p>


          {/* NO RESULT */}

          {!prediction &&
            !loadingPrediction && (

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">

                <Brain
                  size={45}
                  className="mx-auto text-gray-300 mb-4"
                />

                <p className="font-medium text-gray-600">
                  No prediction yet
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Select a patient and click
                  Predict Risk.
                </p>

              </div>

            )}


          {/* LOADING */}

          {loadingPrediction && (

            <div className="border border-blue-100 bg-blue-50 rounded-xl p-8 text-center">

              <RefreshCw
                size={42}
                className="mx-auto text-blue-500 mb-4 animate-spin"
              />

              <p className="font-medium text-blue-700">
                Analyzing patient data...
              </p>

              <p className="text-sm text-blue-500 mt-2">
                Connecting to HealthForecast AI
              </p>

            </div>

          )}


          {/* RESULT */}

          {prediction &&
            !loadingPrediction && (

              <div className="space-y-5">


                {/* RISK */}

                <div
                  className={`rounded-xl p-6 text-center ${
                    prediction.risk_level ===
                    "High"
                      ? "bg-red-50"
                      : prediction.risk_level ===
                        "Medium"
                      ? "bg-yellow-50"
                      : "bg-green-50"
                  }`}
                >

                  {prediction.risk_level ===
                  "High" ? (

                    <AlertTriangle
                      size={42}
                      className="mx-auto text-red-500 mb-3"
                    />

                  ) : prediction.risk_level ===
                    "Medium" ? (

                    <HeartPulse
                      size={42}
                      className="mx-auto text-yellow-600 mb-3"
                    />

                  ) : (

                    <CheckCircle
                      size={42}
                      className="mx-auto text-green-600 mb-3"
                    />

                  )}


                  <p className="text-sm text-gray-500">
                    Predicted Risk
                  </p>

                  <h3
                    className={`text-3xl font-bold mt-1 ${
                      prediction.risk_level ===
                      "High"
                        ? "text-red-600"
                        : prediction.risk_level ===
                          "Medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >

                    {prediction.risk_level}

                  </h3>

                </div>


                {/* SCORE */}

                <div className="bg-slate-50 rounded-xl p-5">

                  <div className="flex justify-between mb-2">

                    <span className="text-sm text-gray-500">
                      Risk Probability
                    </span>

                    <span className="font-semibold">

                      {Math.round(
                        prediction.risk_score *
                          100
                      )}
                      %

                    </span>

                  </div>


                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        prediction.risk_level ===
                        "High"
                          ? "bg-red-500"
                          : prediction.risk_level ===
                            "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          prediction.risk_score *
                          100
                        }%`,
                      }}
                    />

                  </div>

                </div>


                {/* RECOMMENDATION */}

                <div className="border rounded-xl p-5">

                  <div className="flex items-center gap-2 mb-2">

                    <Activity
                      size={18}
                      className="text-blue-600"
                    />

                    <h3 className="font-semibold">
                      Recommendation
                    </h3>

                  </div>

                  <p className="text-sm text-gray-600 leading-6">
                    {prediction.recommendation}
                  </p>

                </div>


                {/* DISCLAIMER */}

                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-4">

                  <strong>
                    Disclaimer:
                  </strong>{" "}
                  This prediction is intended
                  for demonstration and
                  decision-support purposes only.
                  It is not a medical diagnosis.

                </div>

              </div>

            )}

        </div>

      </div>

    </MainLayout>
  );
}

export default Prediction; 