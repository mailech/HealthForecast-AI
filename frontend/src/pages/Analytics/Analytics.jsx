import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  Pill,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import {
  getPredictionAnalytics,
  getTreatmentEffectiveness,
} from "../../services/api";


function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [treatmentAnalytics, setTreatmentAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [predictionData, treatmentData] =
          await Promise.all([
            getPredictionAnalytics(),
            getTreatmentEffectiveness(),
          ]);

        setAnalytics(predictionData || null);
        setTreatmentAnalytics(treatmentData || null);
      } catch (err) {
        console.error("Analytics loading error:", err);

        setError(
          err.message ||
            "Unable to load healthcare analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  /* =========================================================
     SAFE PREDICTION VALUES
  ========================================================= */

  const totalPatients =
    analytics?.total_patients ?? 0;

  const assessedPatients =
    analytics?.assessed_patients ?? 0;

  const scoredPatients =
    analytics?.scored_patients ?? 0;

  const highRisk =
    analytics?.risk_distribution?.high ?? 0;

  const moderateRisk =
    analytics?.risk_distribution?.moderate ?? 0;

  const lowRisk =
    analytics?.risk_distribution?.low ?? 0;

  const predictedReadmitted =
    analytics?.outcome_distribution
      ?.predicted_readmitted ?? 0;

  const predictedNotReadmitted =
    analytics?.outcome_distribution
      ?.predicted_not_readmitted ?? 0;

  const averageProbability =
    analytics?.average_readmission_probability ?? 0;

  const decisionThreshold =
    analytics?.decision_threshold ?? 0;

  const model =
    analytics?.model || "HistGradientBoosting";

  /* =========================================================
     SAFE TREATMENT VALUES
  ========================================================= */

  const totalTreatments =
    treatmentAnalytics?.total_treatments ?? 0;

  const treatmentEffectivenessRate =
    treatmentAnalytics?.effectiveness_rate ?? 0;

  const averageTreatmentDuration =
    treatmentAnalytics
      ?.average_treatment_duration_days ?? 0;

  const treatmentOutcomeDistribution =
    treatmentAnalytics?.outcome_distribution ?? {};

  const favorableTreatments =
    treatmentOutcomeDistribution.favorable ?? 0;

  const unfavorableTreatments =
    treatmentOutcomeDistribution.unfavorable ?? 0;

  const ongoingTreatments =
    treatmentOutcomeDistribution.ongoing ?? 0;

  const notRecordedTreatments =
    treatmentOutcomeDistribution.not_recorded ?? 0;

  const treatmentEffectiveness =
    treatmentAnalytics?.treatment_effectiveness ?? [];

  const medicationOutcomes =
    treatmentAnalytics?.medication_outcomes ?? [];

  /* =========================================================
     DERIVED VALUES
  ========================================================= */

  const totalScored =
    highRisk + moderateRisk + lowRisk;

  const highRiskPercentage =
    totalScored > 0
      ? (highRisk / totalScored) * 100
      : 0;

  const moderateRiskPercentage =
    totalScored > 0
      ? (moderateRisk / totalScored) * 100
      : 0;

  const lowRiskPercentage =
    totalScored > 0
      ? (lowRisk / totalScored) * 100
      : 0;

  const assessmentCoverage =
    totalPatients > 0
      ? Math.min(
          (assessedPatients / totalPatients) * 100,
          100
        )
      : 0;

  const scoringCoverage =
    totalPatients > 0
      ? Math.min(
          (scoredPatients / totalPatients) * 100,
          100
        )
      : 0;

  const predictedOutcomeTotal =
    predictedReadmitted +
    predictedNotReadmitted;

  const readmittedPercentage =
    predictedOutcomeTotal > 0
      ? (predictedReadmitted /
          predictedOutcomeTotal) *
        100
      : 0;

  const notReadmittedPercentage =
    predictedOutcomeTotal > 0
      ? (predictedNotReadmitted /
          predictedOutcomeTotal) *
        100
      : 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="p-6 lg:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="mb-8">

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div className="rounded-lg bg-cyan-50 p-2">
                    <BarChart3
                      size={19}
                      className="text-cyan-600"
                    />
                  </div>

                  <span className="text-sm font-bold tracking-[0.18em] text-cyan-600">
                    HEALTHFORECAST AI
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                  Healthcare Analytics
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 lg:text-base">
                  Monitor patient population, AI-powered
                  readmission risk, treatment effectiveness,
                  and healthcare intelligence from a single
                  analytics workspace.
                </p>

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-5 py-4 shadow-sm">

                <div className="rounded-xl bg-green-50 p-3">
                  <Activity
                    size={21}
                    className="text-green-600"
                  />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Analytics Status
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">

                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    {loading
                      ? "Refreshing data"
                      : "Live analytics"}

                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">

              <div className="rounded-lg bg-white p-2">
                <AlertTriangle
                  size={20}
                  className="text-red-500"
                />
              </div>

              <div>

                <p className="font-bold text-red-700">
                  Unable to load analytics
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* Total Patients */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Patients
                  </p>

                  <p className="mt-3 text-4xl font-bold text-slate-900">
                    {loading ? "—" : totalPatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Patients in your access scope
                  </p>

                </div>

                <div className="rounded-xl bg-cyan-50 p-3.5">
                  <Users
                    size={25}
                    className="text-cyan-600"
                  />
                </div>

              </div>

            </div>


            {/* Assessed */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Clinical Assessments
                  </p>

                  <p className="mt-3 text-4xl font-bold text-slate-900">
                    {loading ? "—" : assessedPatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Patients with assessment data
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-3.5">
                  <ClipboardCheck
                    size={25}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>


            {/* AI Scored */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    AI Scored
                  </p>

                  <p className="mt-3 text-4xl font-bold text-cyan-600">
                    {loading ? "—" : scoredPatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Patients evaluated by AI
                  </p>

                </div>

                <div className="rounded-xl bg-purple-50 p-3.5">
                  <Brain
                    size={25}
                    className="text-purple-600"
                  />
                </div>

              </div>

            </div>


            {/* Average Risk */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Average Readmission Risk
                  </p>

                  <p className="mt-3 text-4xl font-bold text-purple-600">
                    {loading
                      ? "—"
                      : `${(
                          averageProbability * 100
                        ).toFixed(1)}%`}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Across AI-scored patients
                  </p>

                </div>

                <div className="rounded-xl bg-purple-50 p-3.5">
                  <TrendingUp
                    size={25}
                    className="text-purple-600"
                  />
                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              AI READMISSION INTELLIGENCE
          ================================================= */}

          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-6 py-7 text-white lg:px-8">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-cyan-500/15 p-3.5">
                    <Brain
                      size={27}
                      className="text-cyan-300"
                    />
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                      AI Intelligence
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Readmission Risk Intelligence
                    </h2>

                    <p className="mt-1 text-sm text-slate-300">
                      Current model-generated risk distribution
                      and predicted outcomes.
                    </p>

                  </div>

                </div>

                <Link
                  to="/clinical-decision-support"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Open AI Decision Support
                  <ChevronRight size={17} />
                </Link>

              </div>

            </div>


            <div className="p-6 lg:p-8">

              {/* Average Risk */}

              <div className="rounded-2xl bg-slate-50 p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      Average Predicted Readmission Risk
                    </p>

                    <p className="mt-2 text-4xl font-bold text-slate-900">
                      {loading
                        ? "—"
                        : `${(
                            averageProbability * 100
                          ).toFixed(1)}%`}
                    </p>

                  </div>

                  <div className="sm:text-right">

                    <p className="text-xs text-slate-400">
                      Model decision threshold
                    </p>

                    <p className="mt-1 text-xl font-bold text-cyan-600">
                      {loading
                        ? "—"
                        : `${(
                            decisionThreshold * 100
                          ).toFixed(1)}%`}
                    </p>

                  </div>

                </div>

                <div className="mt-5">

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          averageProbability * 100,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>

                </div>

              </div>


              {/* Risk Cards */}

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                {/* High */}

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                      <p className="text-sm font-bold text-red-700">
                        High Risk
                      </p>

                    </div>

                    <AlertTriangle
                      size={19}
                      className="text-red-500"
                    />

                  </div>

                  <p className="mt-4 text-3xl font-bold text-slate-900">
                    {loading ? "—" : highRisk}
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {highRiskPercentage.toFixed(1)}% of
                    scored patients
                  </p>

                </div>


                {/* Moderate */}

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

                      <p className="text-sm font-bold text-amber-700">
                        Moderate Risk
                      </p>

                    </div>

                    <Activity
                      size={19}
                      className="text-amber-500"
                    />

                  </div>

                  <p className="mt-4 text-3xl font-bold text-slate-900">
                    {loading ? "—" : moderateRisk}
                  </p>

                  <p className="mt-1 text-xs text-amber-600">
                    {moderateRiskPercentage.toFixed(1)}%
                    of scored patients
                  </p>

                </div>


                {/* Low */}

                <div className="rounded-2xl border border-green-100 bg-green-50 p-5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                      <p className="text-sm font-bold text-green-700">
                        Low Risk
                      </p>

                    </div>

                    <CheckCircle2
                      size={19}
                      className="text-green-500"
                    />

                  </div>

                  <p className="mt-4 text-3xl font-bold text-slate-900">
                    {loading ? "—" : lowRisk}
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    {lowRiskPercentage.toFixed(1)}% of
                    scored patients
                  </p>

                </div>

              </div>


              {/* Predicted Outcomes */}

              <div className="mt-6 grid gap-5 lg:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 p-6">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-red-50 p-3">
                        <XCircle
                          size={21}
                          className="text-red-500"
                        />
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          Predicted Readmitted
                        </p>

                        <p className="text-xs text-slate-400">
                          AI prediction outcome
                        </p>

                      </div>

                    </div>

                    <p className="text-3xl font-bold text-slate-900">
                      {loading
                        ? "—"
                        : predictedReadmitted}
                    </p>

                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${readmittedPercentage}%`,
                      }}
                    />

                  </div>

                </div>


                <div className="rounded-2xl border border-slate-200 p-6">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-green-50 p-3">
                        <CheckCircle2
                          size={21}
                          className="text-green-500"
                        />
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          Predicted Not Readmitted
                        </p>

                        <p className="text-xs text-slate-400">
                          AI prediction outcome
                        </p>

                      </div>

                    </div>

                    <p className="text-3xl font-bold text-slate-900">
                      {loading
                        ? "—"
                        : predictedNotReadmitted}
                    </p>

                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${notReadmittedPercentage}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              MODEL + COVERAGE
          ================================================= */}

          <section className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* Model */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-50 p-3">
                  <Brain
                    size={23}
                    className="text-purple-600"
                  />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    AI Model Intelligence
                  </h2>

                  <p className="text-sm text-slate-500">
                    Current production prediction engine
                  </p>

                </div>

              </div>


              <div className="mt-6 space-y-4">

                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Active Model
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {model}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Hospital readmission classifier
                  </p>

                </div>


                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 p-5">

                    <div className="flex items-center gap-2">
                      <Target
                        size={18}
                        className="text-cyan-600"
                      />

                      <p className="text-xs font-medium text-slate-500">
                        Decision Threshold
                      </p>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-cyan-600">
                      {loading
                        ? "—"
                        : `${(
                            decisionThreshold * 100
                          ).toFixed(1)}%`}
                    </p>

                  </div>


                  <div className="rounded-xl border border-green-100 bg-green-50 p-5">

                    <div className="flex items-center gap-2">

                      <ShieldCheck
                        size={18}
                        className="text-green-600"
                      />

                      <p className="text-xs font-medium text-green-700">
                        Privacy
                      </p>

                    </div>

                    <p className="mt-2 text-lg font-bold text-green-700">
                      Aggregate Only
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* Coverage */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-cyan-50 p-3">
                    <TrendingUp
                      size={23}
                      className="text-cyan-600"
                    />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-slate-900">
                      Analytics Coverage
                    </h2>

                    <p className="text-sm text-slate-500">
                      Clinical data and AI scoring coverage
                    </p>

                  </div>

                </div>

              </div>


              {/* Assessment */}

              <div className="mt-7">

                <div className="mb-2 flex items-center justify-between">

                  <p className="text-sm font-medium text-slate-600">
                    Clinical Assessments
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    {assessmentCoverage.toFixed(1)}%
                  </p>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                    style={{
                      width: `${assessmentCoverage}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {assessedPatients} of {totalPatients} patients
                  have assessment data.
                </p>

              </div>


              {/* AI Scoring */}

              <div className="mt-6">

                <div className="mb-2 flex items-center justify-between">

                  <p className="text-sm font-medium text-slate-600">
                    AI Scoring Coverage
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    {scoringCoverage.toFixed(1)}%
                  </p>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-700"
                    style={{
                      width: `${scoringCoverage}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {scoredPatients} of {totalPatients} patients
                  have generated AI scores.
                </p>

              </div>


              <div className="mt-7 grid grid-cols-3 gap-3">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {loading ? "—" : totalPatients}
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-4">

                  <p className="text-xs text-blue-600">
                    Assessed
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-700">
                    {loading ? "—" : assessedPatients}
                  </p>

                </div>

                <div className="rounded-xl bg-purple-50 p-4">

                  <p className="text-xs text-purple-600">
                    AI Scored
                  </p>

                  <p className="mt-1 text-xl font-bold text-purple-700">
                    {loading ? "—" : scoredPatients}
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              TREATMENT ANALYTICS
          ================================================= */}

          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-7 lg:px-8">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-green-50 p-3.5">
                    <HeartPulse
                      size={26}
                      className="text-green-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">
                      Clinical Performance
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      Treatment Effectiveness
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Treatment outcomes and medication
                      effectiveness indicators.
                    </p>

                  </div>

                </div>

                <Link
                  to="/reports"
                  className="inline-flex items-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700"
                >
                  View reports
                  <ChevronRight size={17} />
                </Link>

              </div>

            </div>


            <div className="p-6 lg:p-8">

              {/* Treatment KPI */}

              <div className="grid gap-5 md:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-slate-500">
                      Total Treatments
                    </p>

                    <Pill
                      size={20}
                      className="text-cyan-600"
                    />

                  </div>

                  <p className="mt-4 text-3xl font-bold text-slate-900">
                    {loading ? "—" : totalTreatments}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Recorded treatment plans
                  </p>

                </div>


                <div className="rounded-2xl bg-green-50 p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-green-700">
                      Effectiveness Rate
                    </p>

                    <CheckCircle2
                      size={20}
                      className="text-green-600"
                    />

                  </div>

                  <p className="mt-4 text-3xl font-bold text-green-700">
                    {loading
                      ? "—"
                      : `${treatmentEffectivenessRate.toFixed(
                          1
                        )}%`}
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    Based on classified outcomes
                  </p>

                </div>


                <div className="rounded-2xl bg-cyan-50 p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-cyan-700">
                      Average Duration
                    </p>

                    <Activity
                      size={20}
                      className="text-cyan-600"
                    />

                  </div>

                  <p className="mt-4 text-3xl font-bold text-cyan-700">
                    {loading
                      ? "—"
                      : Number(
                          averageTreatmentDuration
                        ).toFixed(1)}
                    <span className="ml-1 text-sm font-medium">
                      days
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-cyan-600">
                    Average treatment duration
                  </p>

                </div>

              </div>


              {/* Outcome Distribution */}

              <div className="mt-8">

                <h3 className="text-lg font-bold text-slate-900">
                  Treatment Outcome Distribution
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Current distribution of recorded treatment
                  outcomes.
                </p>


                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-2xl border border-green-100 bg-green-50 p-5">

                    <p className="text-sm font-semibold text-green-700">
                      Favorable
                    </p>

                    <p className="mt-3 text-3xl font-bold text-green-700">
                      {loading
                        ? "—"
                        : favorableTreatments}
                    </p>

                  </div>


                  <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                    <p className="text-sm font-semibold text-red-700">
                      Unfavorable
                    </p>

                    <p className="mt-3 text-3xl font-bold text-red-700">
                      {loading
                        ? "—"
                        : unfavorableTreatments}
                    </p>

                  </div>


                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

                    <p className="text-sm font-semibold text-amber-700">
                      Ongoing
                    </p>

                    <p className="mt-3 text-3xl font-bold text-amber-700">
                      {loading
                        ? "—"
                        : ongoingTreatments}
                    </p>

                  </div>


                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                    <p className="text-sm font-semibold text-slate-600">
                      Not Recorded
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-700">
                      {loading
                        ? "—"
                        : notRecordedTreatments}
                    </p>

                  </div>

                </div>

              </div>


              {/* Treatment Performance */}

              {treatmentEffectiveness.length > 0 && (

                <div className="mt-8">

                  <h3 className="text-lg font-bold text-slate-900">
                    Treatment Performance
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Effectiveness summary by treatment type.
                  </p>


                  <div className="mt-5 space-y-3">

                    {treatmentEffectiveness.map(
                      (treatment) => (

                        <div
                          key={
                            treatment.treatment_name
                          }
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                        >

                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div>

                              <p className="font-bold text-slate-900">
                                {treatment.treatment_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {treatment.total_records} treatment{" "}
                                {treatment.total_records ===
                                1
                                  ? "record"
                                  : "records"}
                              </p>

                            </div>


                            <div className="grid grid-cols-3 gap-6">

                              <div>

                                <p className="text-xs text-slate-400">
                                  Favorable
                                </p>

                                <p className="mt-1 font-bold text-green-600">
                                  {treatment.favorable}
                                </p>

                              </div>


                              <div>

                                <p className="text-xs text-slate-400">
                                  Ongoing
                                </p>

                                <p className="mt-1 font-bold text-amber-600">
                                  {treatment.ongoing}
                                </p>

                              </div>


                              <div>

                                <p className="text-xs text-slate-400">
                                  Effectiveness
                                </p>

                                <p className="mt-1 font-bold text-cyan-600">
                                  {Number(
                                    treatment.effectiveness_rate ??
                                      0
                                  ).toFixed(1)}
                                  %
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* Medication Outcomes */}

              {medicationOutcomes.length > 0 && (

                <div className="mt-8">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-blue-50 p-3">
                      <Pill
                        size={21}
                        className="text-blue-600"
                      />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-slate-900">
                        Medication Outcomes
                      </h3>

                      <p className="text-sm text-slate-500">
                        Outcome distribution for recorded
                        medications.
                      </p>

                    </div>

                  </div>


                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    {medicationOutcomes.map(
                      (medication) => (

                        <div
                          key={medication.medication}
                          className="rounded-2xl border border-slate-200 p-5"
                        >

                          <div className="flex items-center justify-between">

                            <p className="font-bold text-slate-900">
                              {medication.medication}
                            </p>

                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                              {medication.total_records}{" "}
                              {medication.total_records ===
                              1
                                ? "record"
                                : "records"}
                            </span>

                          </div>


                          <div className="mt-5 grid grid-cols-3 gap-3">

                            <div className="rounded-xl bg-green-50 p-3 text-center">

                              <p className="text-[11px] font-medium text-green-700">
                                Favorable
                              </p>

                              <p className="mt-1 text-xl font-bold text-green-700">
                                {medication.favorable}
                              </p>

                            </div>


                            <div className="rounded-xl bg-amber-50 p-3 text-center">

                              <p className="text-[11px] font-medium text-amber-700">
                                Ongoing
                              </p>

                              <p className="mt-1 text-xl font-bold text-amber-700">
                                {medication.ongoing}
                              </p>

                            </div>


                            <div className="rounded-xl bg-red-50 p-3 text-center">

                              <p className="text-[11px] font-medium text-red-700">
                                Unfavorable
                              </p>

                              <p className="mt-1 text-xl font-bold text-red-700">
                                {medication.unfavorable}
                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              RESPONSIBLE AI
          ================================================= */}

          <section className="mt-8">

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-6 lg:p-7">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                <div className="flex items-start gap-4">

                  <div className="rounded-xl bg-white p-3 shadow-sm">

                    <ShieldCheck
                      size={23}
                      className="text-cyan-600"
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Responsible AI & Privacy
                    </h3>

                    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                      Analytics are generated from stored
                      clinical assessments and the deployed
                      readmission prediction model. Risk
                      categories are model outputs intended
                      to support clinical review and proactive
                      care planning, not replace professional
                      medical judgment.
                    </p>

                  </div>

                </div>


                <div className="flex flex-wrap gap-2 lg:justify-end">

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-cyan-700">
                    Aggregate Analytics
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-cyan-700">
                    Privacy Aware
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-cyan-700">
                    Clinical Review
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="py-8 text-center">

            <p className="text-xs text-slate-400">
              HealthForecast AI • Healthcare Analytics
              Intelligence Platform
            </p>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Analytics;