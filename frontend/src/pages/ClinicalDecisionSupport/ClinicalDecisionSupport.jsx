import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleUserRound,
  HeartPulse,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Target,
  User,
  Users,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import {
  getPatients,
  predictPatientReadmission,
} from "../../services/api";


function ClinicalDecisionSupport() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [prediction, setPrediction] = useState(null);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [predicting, setPredicting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /* =========================================================
     Load patients
  ========================================================= */

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        setError("");

        const data = await getPatients();

        const patientList = Array.isArray(data)
          ? data
          : data?.patients || data?.data || [];

        setPatients(patientList);

        if (patientList.length > 0) {
          setSelectedPatientId(String(patientList[0].id));
        }
      } catch (err) {
        console.error("Unable to load patients:", err);

        setError(
          err.message || "Unable to load patient records."
        );
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);


  /* =========================================================
     Generate AI assessment
  ========================================================= */

  const handleGenerateAssessment = async () => {
    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }

    try {
      setPredicting(true);
      setPrediction(null);
      setError("");
      setSuccess("");

      const result = await predictPatientReadmission(
        Number(selectedPatientId)
      );

      setPrediction(result);

      setSuccess(
        "AI clinical decision-support assessment generated successfully."
      );
    } catch (err) {
      console.error(
        "Clinical decision support error:",
        err
      );

      setError(
        err.message ||
          "Unable to generate clinical decision support."
      );
    } finally {
      setPredicting(false);
    }
  };


  /* =========================================================
     Selected patient
  ========================================================= */

  const selectedPatient = patients.find(
    (patient) =>
      String(patient.id) === String(selectedPatientId)
  );

  // Display-only patient number.
  // The real database id remains unchanged for API calls and selection.
  const selectedPatientNumber =
    selectedPatient
      ? patients.findIndex(
          (patient) =>
            String(patient.id) === String(selectedPatient.id)
        ) + 1
      : 0;



  /* =========================================================
     Prediction helpers
  ========================================================= */

  const probability =
    prediction?.readmission_probability ?? 0;

  const probabilityPercent =
    Math.min(Math.max(probability * 100, 0), 100);

  const riskLevel =
    prediction?.risk_level || "Unknown";

  const predictedOutcome =
    prediction?.predicted_outcome || "Unknown";

  const interpretation =
    prediction?.clinical_interpretation ||
    "No clinical interpretation available.";

  const recommendedAction =
    prediction?.recommended_action ||
    "No recommended action available.";

  const decisionThreshold =
    prediction?.decision_threshold ?? 0;

  const thresholdPercent =
    Math.min(
      Math.max(decisionThreshold * 100, 0),
      100
    );


  /* =========================================================
     Risk configuration
  ========================================================= */

  const riskConfig = useMemo(() => {
    switch (riskLevel) {
      case "High":
        return {
          label: "High Risk",
          description:
            "Prediction is above the model decision threshold.",
          container:
            "border-red-200 bg-red-50",
          icon:
            "bg-red-100 text-red-600",
          text:
            "text-red-700",
          progress:
            "bg-red-500",
          badge:
            "bg-red-100 text-red-700 border-red-200",
          status:
            "Requires closer clinical review",
        };

      case "Moderate":
        return {
          label: "Moderate Risk",
          description:
            "Prediction falls within the intermediate model risk band.",
          container:
            "border-amber-200 bg-amber-50",
          icon:
            "bg-amber-100 text-amber-600",
          text:
            "text-amber-700",
          progress:
            "bg-amber-500",
          badge:
            "bg-amber-100 text-amber-700 border-amber-200",
          status:
            "Consider additional follow-up",
        };

      case "Low":
        return {
          label: "Low Risk",
          description:
            "Prediction is below the model's moderate-risk band.",
          container:
            "border-green-200 bg-green-50",
          icon:
            "bg-green-100 text-green-600",
          text:
            "text-green-700",
          progress:
            "bg-green-500",
          badge:
            "bg-green-100 text-green-700 border-green-200",
          status:
            "Routine follow-up recommended",
        };

      default:
        return {
          label: "Risk Unavailable",
          description:
            "Generate an assessment to view the AI risk classification.",
          container:
            "border-slate-200 bg-slate-50",
          icon:
            "bg-slate-100 text-slate-600",
          text:
            "text-slate-700",
          progress:
            "bg-slate-400",
          badge:
            "bg-slate-100 text-slate-700 border-slate-200",
          status:
            "Awaiting assessment",
        };
    }
  }, [riskLevel]);


  const outcomeIsPositive =
    predictedOutcome
      .toLowerCase()
      .includes("not readmitted");


  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* =====================================================
          Sidebar
      ===================================================== */}

      <Sidebar />


      {/* =====================================================
          Main Application
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar />


        <main className="mx-auto w-full max-w-[1500px] p-6 lg:p-8">

          {/* =================================================
              Page Header
          ================================================= */}

          <section className="mb-8">

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div className="rounded-xl bg-cyan-50 p-2.5">
                    <Brain
                      size={20}
                      className="text-cyan-600"
                    />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-600">
                    AI Clinical Intelligence
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                  Clinical Decision Support
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 lg:text-base">
                  Generate AI-powered readmission risk intelligence
                  for patient-specific clinical review and
                  post-discharge care planning.
                </p>

              </div>


              <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-5 py-4 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                  <Activity
                    size={21}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    AI Platform
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    <p className="text-sm font-bold text-slate-800">
                      Clinical AI Ready
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              Error / Success
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

              <div className="rounded-lg bg-white p-2">
                <AlertTriangle
                  size={19}
                  className="text-red-600"
                />
              </div>

              <div>
                <p className="font-bold text-red-700">
                  Unable to generate assessment
                </p>

                <p className="mt-1 text-sm leading-5 text-red-600">
                  {error}
                </p>
              </div>

            </div>
          )}


          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">

              <div className="rounded-lg bg-white p-2">
                <CheckCircle2
                  size={19}
                  className="text-green-600"
                />
              </div>

              <p className="text-sm font-semibold text-green-700">
                {success}
              </p>

            </div>
          )}


          {/* =================================================
              Patient Selection
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6 text-white lg:px-8">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-cyan-500/15 p-3">
                    <Users
                      size={25}
                      className="text-cyan-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                      Clinical Workspace
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Patient Assessment
                    </h2>

                    <p className="mt-1 text-sm text-slate-300">
                      Select a patient and run the production
                      readmission prediction model.
                    </p>
                  </div>

                </div>


                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">

                  <p className="text-xs text-slate-400">
                    Available patients
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {loadingPatients
                      ? "—"
                      : patients.length}

                  </p>

                </div>

              </div>

            </div>


            <div className="p-6 lg:p-8">

              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">

                <div>

                  <label
                    htmlFor="clinical-patient"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Select Patient
                  </label>

                  <div className="relative">

                    <select
                      id="clinical-patient"
                      value={selectedPatientId}
                      onChange={(event) => {
                        setSelectedPatientId(
                          event.target.value
                        );
                        setPrediction(null);
                        setError("");
                        setSuccess("");
                      }}
                      disabled={
                        loadingPatients ||
                        predicting ||
                        patients.length === 0
                      }
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >

                      {loadingPatients && (
                        <option value="">
                          Loading patient records...
                        </option>
                      )}

                      {!loadingPatients &&
                        patients.length === 0 && (
                          <option value="">
                            No patients available
                          </option>
                        )}

                      {!loadingPatients &&
                        patients.map((patient, index) => (
                           <option
                             key={patient.id}
                             value={patient.id}
                           >
                             {patient.name || "Unknown Patient"}{" "}
                             — Patient #{index + 1}
                           </option>
                         ))}

                    </select>

                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    The selected patient's stored clinical
                    assessment is used by the readmission model.
                  </p>

                </div>


                <div className="flex items-end">

                  <button
                    type="button"
                    onClick={handleGenerateAssessment}
                    disabled={
                      predicting ||
                      loadingPatients ||
                      !selectedPatientId
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                  >

                    {predicting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Generating AI Assessment...
                      </>
                    ) : (
                      <>
                        <Brain size={18} />

                        Generate AI Assessment
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              Patient Profile
          ================================================= */}

          {selectedPatient && (
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-lg font-bold text-cyan-700">
                    {selectedPatient.name
                      ? selectedPatient.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "PT"}
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                      Selected Patient
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {selectedPatient.name ||
                        "Unknown Patient"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Patient #{selectedPatientNumber}
                    </p>

                  </div>

                </div>


                <div className="flex flex-wrap gap-2">

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
                    {selectedPatient.gender ||
                      "Gender unavailable"}
                  </span>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {selectedPatient.blood_group ||
                      "Blood group unavailable"}
                  </span>

                  {selectedPatient.assigned_doctor_id && (
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      Doctor #{selectedPatient.assigned_doctor_id}
                    </span>
                  )}

                </div>

              </div>


              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <CircleUserRound
                    size={19}
                    className="text-cyan-600"
                  />

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Patient
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {selectedPatient.name ||
                      "Not available"}
                  </p>

                </div>


                <div className="rounded-2xl bg-slate-50 p-5">

                  <Target
                    size={19}
                    className="text-blue-600"
                  />

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Patient Number
                  </p>

                   <p className="mt-1 font-bold text-slate-800">
                     #{selectedPatientNumber}
                  </p>

                </div>


                <div className="rounded-2xl bg-slate-50 p-5">

                  <User
                    size={19}
                    className="text-purple-600"
                  />

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Gender
                  </p>

                  <p className="mt-1 font-bold capitalize text-slate-800">
                    {selectedPatient.gender ||
                      "Not available"}
                  </p>

                </div>


                <div className="rounded-2xl bg-slate-50 p-5">

                  <HeartPulse
                    size={19}
                    className="text-red-500"
                  />

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Blood Group
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {selectedPatient.blood_group ||
                      "Not available"}
                  </p>

                </div>

              </div>

            </section>
          )}


          {/* =================================================
              Empty Assessment State
          ================================================= */}

          {!prediction && !predicting && (
            <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm lg:p-14">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50">
                <Brain
                  size={30}
                  className="text-cyan-600"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Ready for AI Assessment
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Select a patient above and generate an AI
                assessment to view the predicted readmission
                probability, risk classification, model threshold,
                clinical interpretation, and recommended action.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">

                <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                  Readmission Risk
                </span>

                <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                  AI Prediction
                </span>

                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  Clinical Review
                </span>

              </div>

            </section>
          )}


          {/* =================================================
              Loading Assessment
          ================================================= */}

          {predicting && (
            <section className="mt-6 rounded-3xl border border-cyan-100 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50">
                <RefreshCw
                  size={30}
                  className="animate-spin text-cyan-600"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Generating Clinical Assessment
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Running the production readmission prediction
                workflow for the selected patient...
              </p>

            </section>
          )}


          {/* =================================================
              AI Assessment
          ================================================= */}

          {prediction && (
            <section className="mt-6">

              {/* =============================================
                  Main Risk Card
              ============================================= */}

              <div
                className={`overflow-hidden rounded-3xl border shadow-sm ${riskConfig.container}`}
              >

                <div className="p-6 lg:p-8">

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${riskConfig.icon}`}
                      >
                        <Activity size={30} />
                      </div>

                      <div>

                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          AI Readmission Assessment
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                          Predicted Readmission Risk
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Production HistGradientBoosting model
                        </p>

                      </div>

                    </div>


                    <div
                      className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${riskConfig.badge}`}
                    >
                      {riskConfig.label}
                    </div>

                  </div>


                  <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">

                    <div>

                      <div className="flex items-end justify-between gap-4">

                        <div>

                          <p className="text-sm font-medium text-slate-500">
                            Readmission probability
                          </p>

                          <p
                            className={`mt-2 text-5xl font-black tracking-tight ${riskConfig.text}`}
                          >
                            {probabilityPercent.toFixed(1)}%
                          </p>

                        </div>


                        <div className="text-right">

                          <p className="text-xs font-medium text-slate-400">
                            Model threshold
                          </p>

                          <p className="mt-1 text-xl font-bold text-slate-800">
                            {thresholdPercent.toFixed(1)}%
                          </p>

                        </div>

                      </div>


                      <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/80">

                        <div
                          className={`h-full rounded-full transition-all duration-700 ${riskConfig.progress}`}
                          style={{
                            width: `${probabilityPercent}%`,
                          }}
                        />

                      </div>


                      <div className="mt-2 flex justify-between text-xs text-slate-400">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>

                    </div>


                    <div className="rounded-2xl border border-white/70 bg-white/70 p-5 backdrop-blur-sm">

                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Risk Status
                      </p>

                      <p
                        className={`mt-2 text-lg font-bold ${riskConfig.text}`}
                      >
                        {riskConfig.status}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {riskConfig.description}
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* =============================================
                  Prediction + Threshold
              ============================================= */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-purple-50 p-3">
                        <Brain
                          size={22}
                          className="text-purple-600"
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          Model Prediction
                        </h3>

                        <p className="text-sm text-slate-500">
                          AI-generated outcome
                        </p>
                      </div>

                    </div>

                    {outcomeIsPositive ? (
                      <CheckCircle2
                        size={24}
                        className="text-green-500"
                      />
                    ) : (
                      <AlertTriangle
                        size={24}
                        className="text-red-500"
                      />
                    )}

                  </div>


                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Predicted Outcome
                    </p>

                    <p
                      className={`mt-2 text-2xl font-bold ${
                        outcomeIsPositive
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {predictedOutcome}
                    </p>

                  </div>

                </div>


                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-cyan-50 p-3">
                      <Target
                        size={22}
                        className="text-cyan-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Decision Threshold
                      </h3>

                      <p className="text-sm text-slate-500">
                        Optimized production threshold
                      </p>
                    </div>

                  </div>


                  <div className="mt-6 rounded-2xl bg-cyan-50 p-5">

                    <div className="flex items-end justify-between">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                          Model threshold
                        </p>

                        <p className="mt-2 text-3xl font-black text-cyan-700">
                          {thresholdPercent.toFixed(1)}%
                        </p>

                      </div>

                      <Target
                        size={30}
                        className="text-cyan-400"
                      />

                    </div>

                  </div>

                </div>

              </div>


              {/* =============================================
                  Clinical Interpretation + Action
              ============================================= */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-blue-50 p-3">
                      <Stethoscope
                        size={22}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Clinical Interpretation
                      </h3>

                      <p className="text-sm text-slate-500">
                        AI-generated interpretation
                      </p>
                    </div>

                  </div>


                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                    <p className="text-sm leading-7 text-blue-950">
                      {interpretation}
                    </p>

                  </div>

                </div>


                <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-green-50 p-3">
                      <ShieldCheck
                        size={22}
                        className="text-green-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Recommended Action
                      </h3>

                      <p className="text-sm text-slate-500">
                        Suggested follow-up based on AI output
                      </p>
                    </div>

                  </div>


                  <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">

                    <p className="text-sm leading-7 text-green-950">
                      {recommendedAction}
                    </p>

                  </div>

                </div>

              </div>


              {/* =============================================
                  Assessment Controls
              ============================================= */}

              <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-slate-100 p-3">
                    <HeartPulse
                      size={21}
                      className="text-slate-600"
                    />
                  </div>

                  <div>
                    <p className="font-bold text-slate-800">
                      Assessment complete
                    </p>

                    <p className="text-xs text-slate-500">
                      Review the AI output before taking clinical action.
                    </p>
                  </div>

                </div>


                <div className="flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleGenerateAssessment}
                    disabled={predicting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-60"
                  >
                    <RefreshCw size={17} />
                    Recalculate
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      navigate("/patients")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
                  >
                    View Patient Records
                    <ArrowRight size={17} />
                  </button>

                </div>

              </div>


              {/* =============================================
                  Responsible AI Notice
              ============================================= */}

              <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">

                <div className="flex items-start gap-4">

                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <AlertTriangle
                      size={21}
                      className="text-amber-600"
                    />
                  </div>

                  <div>

                    <h3 className="font-bold text-amber-900">
                      Clinical Decision-Support Notice
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      This assessment is generated by the
                      HealthForecast AI readmission prediction
                      model. It is intended to support clinical
                      review and post-discharge care planning.
                      AI-generated predictions and recommendations
                      should not replace professional clinical
                      judgment.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-800">
                        AI-Assisted
                      </span>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-800">
                        Clinical Review
                      </span>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-800">
                        Human Oversight
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </section>
          )}

        </main>

      </div>

    </div>
  );
}


export default ClinicalDecisionSupport;