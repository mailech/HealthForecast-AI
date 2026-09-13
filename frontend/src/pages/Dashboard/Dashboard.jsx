import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  HeartPulse,
  LockKeyhole,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  UserRound,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import {
  getCurrentUser,
  getPatients,
  getAnonymizedPatients,
  checkBackendHealth,
  getPredictionAnalytics,
  getTreatmentEffectiveness,
} from "../../services/api";


function Dashboard() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);

  const [predictionAnalytics, setPredictionAnalytics] =
    useState(null);

  const [treatmentAnalytics, setTreatmentAnalytics] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] =
    useState("Checking...");

  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const currentUser = getCurrentUser();
        setUser(currentUser);

        /* ---------------- Backend Health ---------------- */

        try {
          await checkBackendHealth();
          setBackendStatus("Ready");
        } catch {
          setBackendStatus("Offline");
        }

        /* ---------------- Dashboard Data ---------------- */

        const [
          patientData,
          predictionData,
          treatmentData,
        ] = await Promise.all([
          currentUser?.role === "healthcare_researcher"
            ? getAnonymizedPatients()
            : getPatients(),

          getPredictionAnalytics(),
          getTreatmentEffectiveness(),
        ]);

        const patientList = Array.isArray(patientData)
          ? patientData
          : patientData?.patients ||
            patientData?.data ||
            [];

        setPatients(patientList);
        setPredictionAnalytics(
          predictionData || null
        );
        setTreatmentAnalytics(
          treatmentData || null
        );
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* ---------------- Derived Data ---------------- */

  const totalPatients = patients.length;

  const activePatients =
    user?.role === "healthcare_researcher"
      ? null
      : patients.filter(
          (patient) => patient.is_active !== false
        ).length;

  const assessedPatients =
    predictionAnalytics?.assessed_patients ?? 0;

  const scoredPatients =
    predictionAnalytics?.scored_patients ?? 0;

  const averageRisk =
    predictionAnalytics
      ?.average_readmission_probability ?? 0;

  const decisionThreshold =
    predictionAnalytics?.decision_threshold ?? 0.48;

  const riskDistribution =
    predictionAnalytics?.risk_distribution || {};

  const outcomeDistribution =
    predictionAnalytics?.outcome_distribution || {};

  const highRisk =
    riskDistribution.high ?? 0;

  const moderateRisk =
    riskDistribution.moderate ?? 0;

  const lowRisk =
    riskDistribution.low ?? 0;

  const predictedReadmitted =
    outcomeDistribution.predicted_readmitted ?? 0;

  const predictedNotReadmitted =
    outcomeDistribution.predicted_not_readmitted ?? 0;

  const totalTreatments =
    treatmentAnalytics?.total_treatments ?? 0;

  const treatmentEffectiveness =
    treatmentAnalytics?.effectiveness_rate ?? 0;

  const ongoingTreatments =
    treatmentAnalytics?.outcome_distribution
      ?.ongoing ?? 0;


  const role = user?.role || "doctor";
  const isDoctor = role === "doctor";
  const isHospitalAdmin = role === "hospital_admin";
  const isResearcher = role === "healthcare_researcher";
  const isSystemAdmin = role === "system_admin";

  const roleLabel = user?.role
    ? user.role
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (letter) => letter.toUpperCase()
        )
    : "User";

  const recentPatients = [...patients]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at ||
          a.updated_at ||
          0
      ).getTime();

      const dateB = new Date(
        b.created_at ||
          b.updated_at ||
          0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  // Patient numbers are presentation-only.
  // Keep the real database ID unchanged for API/backend operations.
  const getPatientNumber = (patient) =>
    patients.findIndex(
      (item) => String(item.id) === String(patient.id)
    ) + 1;

  const formatPercent = (value) =>
    `${((value ?? 0) * 100).toFixed(1)}%`;

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Navbar />

        <main className="mx-auto max-w-[1600px] p-5 sm:p-6 lg:p-8">

          {/* ================================================== */}
          {/* PAGE HEADER */}
          {/* ================================================== */}

          <section className="mb-8">

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-cyan-50 p-2">
                    <Sparkles
                      size={17}
                      className="text-cyan-600"
                    />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                    HealthForecast AI
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {roleLabel} Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Welcome back,{" "}
                  <span className="font-semibold text-slate-700">
                    {user?.name || "User"}
                  </span>
                  .{" "}
                  {isDoctor &&
                    "Monitor assigned patients, AI-powered readmission risk, and clinical care insights."}
                  {isHospitalAdmin &&
                    "Monitor hospital-wide patient activity, readmission risk, treatment performance, and operational analytics."}
                  {isResearcher &&
                    "Explore anonymized population trends, readmission patterns, treatment outcomes, and healthcare research insights."}
                  {isSystemAdmin &&
                    "Monitor platform activity, AI intelligence, healthcare analytics, and system-wide operational status."}
                </p>

              </div>

              {/* System Status */}

              <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm xl:self-auto">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    backendStatus === "Ready"
                      ? "bg-green-50"
                      : backendStatus === "Offline"
                      ? "bg-red-50"
                      : "bg-amber-50"
                  }`}
                >
                  <Activity
                    size={21}
                    className={
                      backendStatus === "Ready"
                        ? "text-green-600"
                        : backendStatus ===
                          "Offline"
                        ? "text-red-600"
                        : "text-amber-600"
                    }
                  />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    AI Platform
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-800">
                    {backendStatus === "Ready"
                      ? "All systems operational"
                      : backendStatus}
                  </p>
                </div>

                <span
                  className={`ml-2 h-2.5 w-2.5 rounded-full ${
                    backendStatus === "Ready"
                      ? "bg-green-500"
                      : backendStatus ===
                        "Offline"
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                />

              </div>

            </div>

          </section>

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="font-semibold text-red-700">
                  Unable to load some dashboard data
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* KPI CARDS */}
          {/* ================================================== */}

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total Patients */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {isResearcher ? "Research Records" : "Total Patients"}
                  </p>

                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                    {loading
                      ? "—"
                      : totalPatients}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Users
                      size={14}
                      className="text-cyan-500"
                    />
                    {isResearcher
                      ? "Anonymized records in your scope"
                      : "Patient records in your scope"}
                  </div>
                </div>

                <div className="rounded-xl bg-cyan-50 p-3">
                  <Users
                    size={23}
                    className="text-cyan-600"
                  />
                </div>

              </div>

            </div>

            {/* Active Patients */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {isResearcher ? "Research Scope" : "Active Patients"}
                  </p>

                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                    {loading
                      ? "—"
                      : isResearcher
                      ? totalPatients
                      : activePatients}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CheckCircle2
                      size={14}
                      className="text-green-500"
                    />
                    {isResearcher
                      ? "Anonymized records in scope"
                      : "Currently active records"}
                  </div>
                </div>

                <div className="rounded-xl bg-green-50 p-3">
                  <HeartPulse
                    size={23}
                    className="text-green-600"
                  />
                </div>

              </div>

            </div>

            {/* Assessed */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Clinical Assessments
                  </p>

                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                    {loading
                      ? "—"
                      : assessedPatients}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Stethoscope
                      size={14}
                      className="text-blue-500"
                    />
                    Patients with assessment data
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-3">
                  <Stethoscope
                    size={23}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            {/* AI Scored */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    AI Scored
                  </p>

                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                    {loading
                      ? "—"
                      : scoredPatients}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Brain
                      size={14}
                      className="text-purple-500"
                    />
                    Patients with AI risk scores
                  </div>
                </div>

                <div className="rounded-xl bg-purple-50 p-3">
                  <Brain
                    size={23}
                    className="text-purple-600"
                  />
                </div>

              </div>

            </div>

          </section>

          {/* ================================================== */}
          {/* AI INTELLIGENCE HERO */}
          {/* ================================================== */}

          <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 shadow-xl">

            <div className="relative p-6 sm:p-8 lg:p-10">

              {/* Decorative background */}

              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="rounded-lg bg-cyan-400/10 p-2">
                        <Brain
                          size={18}
                          className="text-cyan-300"
                        />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                      AI-Powered Healthcare Intelligence
                    </span>

                    </div>
                  </div>

                  <h2 className="mt-4 max-w-3xl text-2xl font-bold text-white sm:text-3xl">
                    {isDoctor && "Hospital Readmission Risk Prediction"}
                    {isHospitalAdmin && "Hospital Risk & Performance Intelligence"}
                    {isResearcher && "Population Health Research Intelligence"}
                    {isSystemAdmin && "HealthForecast AI Platform Intelligence"}
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                    {isDoctor &&
                      "HealthForecast AI analyzes clinical and utilization information to estimate post-discharge readmission risk and support proactive care planning."}

                    {isHospitalAdmin &&
                      "Monitor hospital-wide readmission risk, treatment performance, patient activity, and healthcare operational intelligence."}

                    {isResearcher &&
                      "Explore anonymized population-level risk patterns, readmission trends, treatment outcomes, and research-focused healthcare analytics."}

                    {isSystemAdmin &&
                      "Monitor platform-wide healthcare intelligence, AI model status, analytics, and operational system performance."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">

                    {isDoctor && (
                     <Link
                       to="/clinical-decision-support"
                       className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-400"
                     >
                       <Brain size={17} />
                       Open AI Decision Support
                       <ArrowRight size={16} />
                     </Link>
                   )}

                  <Link
                    to="/analytics"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >

                    View Analytics
                    <ChevronRight size={16} />
                  </Link>

                </div>

              </div>

                {/* Model Card */}

                <div className="min-w-[230px] rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Active Model
                    </span>

                    <span className="rounded-full bg-green-400/10 px-2.5 py-1 text-[11px] font-bold text-green-300">
                      Production
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">

                    <div className="rounded-xl bg-cyan-400/10 p-3">
                      <Sparkles
                        size={22}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <p className="font-bold text-white">
                        HistGradientBoosting
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Readmission prediction
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 border-t border-white/10 pt-4">

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Decision threshold
                      </span>

                      <span className="text-sm font-bold text-cyan-300">
                        {formatPercent(
                          decisionThreshold
                        )}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ================================================== */}
          {/* RISK + TREATMENT */}
          {/* ================================================== */}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

            {/* Readmission Risk */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-purple-50 p-3">
                    <TrendingUp
                      size={21}
                      className="text-purple-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Readmission Risk Intelligence
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Current AI-generated risk distribution
                    </p>
                  </div>

                </div>

                <Link
                  to="/analytics"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Full analytics
                  <ArrowRight size={15} />
                </Link>

              </div>

              {/* Average Risk */}

              <div className="mt-7 rounded-2xl bg-slate-50 p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Average Predicted Readmission Risk
                    </p>

                    <p className="mt-2 text-4xl font-bold text-slate-900">
                      {loading
                        ? "—"
                        : formatPercent(
                            averageRisk
                          )}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">
                      Model threshold
                    </p>

                    <p className="mt-1 text-lg font-bold text-cyan-600">
                      {formatPercent(
                        decisionThreshold
                      )}
                    </p>
                  </div>

                </div>

                {/* Risk bar */}

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          averageRisk * 100,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* Risk Cards */}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-600">
                      High Risk
                    </span>

                    <AlertTriangle
                      size={18}
                      className="text-red-500"
                    />
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : highRisk}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Above model threshold
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-600">
                      Moderate Risk
                    </span>

                    <Activity
                      size={18}
                      className="text-amber-500"
                    />
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : moderateRisk}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Intermediate risk band
                  </p>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-600">
                      Low Risk
                    </span>

                    <CheckCircle2
                      size={18}
                      className="text-green-500"
                    />
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : lowRisk}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Below moderate-risk band
                  </p>
                </div>

              </div>

              {/* Outcomes */}

              <div className="mt-5 grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-slate-200 p-5">

                  <div className="flex items-center gap-2">
                    <HeartPulse
                      size={18}
                      className="text-cyan-600"
                    />

                    <span className="text-sm font-medium text-slate-500">
                      Predicted Readmitted
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : predictedReadmitted}
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-200 p-5">

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />

                    <span className="text-sm font-medium text-slate-500">
                      Predicted Not Readmitted
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : predictedNotReadmitted}
                  </p>

                </div>

              </div>

            </div>

            {/* Treatment Performance */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-blue-50 p-3">
                    <Pill
                      size={21}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Treatment Performance
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Current treatment analytics
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-7">

                <p className="text-sm font-medium text-slate-500">
                  Effectiveness Rate
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <p className="text-4xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : `${treatmentEffectiveness.toFixed(
                          1
                        )}%`}
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          treatmentEffectiveness,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>

              </div>

              <div className="mt-7 space-y-4">

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Pill
                      size={17}
                      className="text-blue-500"
                    />

                    <span className="text-sm text-slate-600">
                      Total Treatments
                    </span>
                  </div>

                  <span className="font-bold text-slate-900">
                    {loading
                      ? "—"
                      : totalTreatments}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Clock3
                      size={17}
                      className="text-amber-500"
                    />

                    <span className="text-sm text-slate-600">
                      Ongoing
                    </span>
                  </div>

                  <span className="font-bold text-slate-900">
                    {loading
                      ? "—"
                      : ongoingTreatments}
                  </span>
                </div>

              </div>

              <Link
                to="/analytics"
                className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                View treatment analytics
                <ArrowRight size={16} />
              </Link>

            </div>

          </section>

          {/* ================================================== */}
          {/* QUICK ACTIONS */}
          {/* ================================================== */}

          <section className="mt-6">

            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Access the healthcare intelligence modules available to your workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {isDoctor && (
                <Link
                  to="/patients"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-cyan-50 p-3">
                      <UserRound size={21} className="text-cyan-600" />
                    </div>
                    <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">Patient Management</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    View assigned patients and access clinical records.
                  </p>
                </Link>
              )}

              {isDoctor && (
                <Link
                  to="/clinical-decision-support"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-purple-50 p-3">
                      <Brain size={21} className="text-purple-600" />
                    </div>
                    <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">AI Decision Support</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Review patient-specific AI risk insights.
                  </p>
                </Link>
              )}

              {isHospitalAdmin && (
                <Link
                  to="/analytics"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-cyan-50 p-3">
                      <Users size={21} className="text-cyan-600" />
                    </div>
                    <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">Hospital Operations</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Monitor hospital-wide patient activity and performance.
                  </p>
                </Link>
              )}

              {isResearcher && (
                <Link
                  to="/analytics"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-purple-50 p-3">
                      <BarChart3 size={21} className="text-purple-600" />
                    </div>
                    <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">Research Intelligence</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Explore anonymized population-level healthcare trends.
                  </p>
                </Link>
              )}

              {isSystemAdmin && (
                <Link
                  to="/analytics"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-cyan-50 p-3">
                      <ShieldCheck size={21} className="text-cyan-600" />
                    </div>
                    <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">Platform Administration</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Monitor platform-wide AI, security, and operational status.
                  </p>
                </Link>
              )}

              <Link
                to="/analytics"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <BarChart3 size={21} className="text-blue-600" />
                  </div>
                  <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>
                <h3 className="mt-5 font-bold text-slate-900">Healthcare Analytics</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Explore population and treatment metrics.
                </p>
              </Link>

              <Link
                to="/reports"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <FileText size={21} className="text-slate-600" />
                  </div>
                  <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
                </div>
                <h3 className="mt-5 font-bold text-slate-900">Reports</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Generate structured healthcare reports.
                </p>
              </Link>

            </div>
          </section>

          {/* ================================================== */}
          {/* RECENT PATIENTS */}
          {/* ================================================== */}

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-50 p-3">
                  <Users size={21} className="text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isResearcher ? "Anonymized Research Records" : "Recent Patients"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isResearcher
                      ? "Privacy-preserving population records available for research analysis"
                      : "Recently available patient records in your access scope"}
                  </p>
                </div>
              </div>

              <Link
                to={isResearcher ? "/analytics" : "/patients"}
                className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
              >
                {isResearcher ? "View analytics" : "View all patients"}
                <ArrowRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading {isResearcher ? "research" : "patient"} records...
                </p>
              </div>
            ) : recentPatients.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Users size={25} className="text-slate-400" />
                </div>
                <p className="mt-4 font-semibold text-slate-700">
                  No {isResearcher ? "research" : "patient"} records available
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Records will appear here once they are available to your role.
                </p>
              </div>
            ) : isResearcher ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Record</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Age</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Gender</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Privacy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPatients.map((patient, index) => {
                      const age = patient.age ?? patient.age_numeric ?? "—";
                      const category =
                        patient.diag_1_category ??
                        patient.diagnosis_category ??
                        patient.primary_diagnosis_category ??
                        "Aggregate clinical data";

                      return (
                        <tr key={patient.id ?? index} className="transition hover:bg-slate-50">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-sm font-bold text-purple-700">
                                R{index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  Research Record {index + 1}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  Anonymized dataset entry
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">{age}</td>
                          <td className="px-6 py-5 text-sm text-slate-600">{patient.gender || "—"}</td>
                          <td className="px-6 py-5 text-sm text-slate-600">{category}</td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                              <LockKeyhole size={12} />
                              Anonymized
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Gender</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Blood Group</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPatients.map((patient) => (
                      <tr key={patient.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700">
                              {(patient.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{patient.name || "Unknown"}</p>
                              <p className="mt-0.5 text-xs text-slate-500">Patient Number: #{getPatientNumber(patient)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">{patient.gender || "—"}</td>
                        <td className="px-6 py-5">
                          {patient.blood_group ? (
                            <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                              {patient.blood_group}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {patient.assigned_doctor_id ? `Doctor #${patient.assigned_doctor_id}` : "Unassigned"}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${patient.is_active === false ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-700"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${patient.is_active === false ? "bg-slate-400" : "bg-green-500"}`} />
                            {patient.is_active === false ? "Inactive" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>

          {/* ================================================== */}
          {/* RESPONSIBLE AI */}
          {/* ================================================== */}

          <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <ShieldCheck
                  size={22}
                  className="text-cyan-600"
                />
              </div>

              <div className="flex-1">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <h2 className="font-bold text-slate-900">
                    Responsible AI & Privacy
                  </h2>

                  <div className="flex flex-wrap gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                      <LockKeyhole size={12} />
                      Role-Based Access
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                      <ShieldCheck size={12} />
                      Privacy Aware
                    </span>

                  </div>

                </div>

                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                  HealthForecast AI predictions are intended to
                  support clinical review and proactive care
                  planning. AI-generated risk scores and
                  recommendations should not replace professional
                  medical judgment.
                </p>

              </div>

            </div>

          </section>

          {/* Bottom spacing */}

          <div className="h-4" />

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
