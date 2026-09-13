import { useEffect, useState } from "react";

import {
  BarChart3,
  Users,
  Activity,
  Brain,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Target,
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

      const [
        predictionData,
        treatmentData,
      ] = await Promise.all([
        getPredictionAnalytics(),
        getTreatmentEffectiveness(),
      ]);

      setAnalytics(predictionData);
      setTreatmentAnalytics(treatmentData);
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


  /* --------------------------------------------------------
     Safe values
  -------------------------------------------------------- */

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
    analytics?.outcome_distribution?.predicted_readmitted ?? 0;

  const predictedNotReadmitted =
    analytics?.outcome_distribution?.predicted_not_readmitted ?? 0;

  const averageProbability =
    analytics?.average_readmission_probability ?? 0;

  const decisionThreshold =
    analytics?.decision_threshold ?? 0;

  const model =
    analytics?.model || "HistGradientBoosting";


    /* --------------------------------------------------------
   Treatment Effectiveness
-------------------------------------------------------- */

const totalTreatments =
  treatmentAnalytics?.total_treatments ?? 0;

const treatmentEffectivenessRate =
  treatmentAnalytics?.effectiveness_rate ?? 0;

const averageTreatmentDuration =
  treatmentAnalytics?.average_treatment_duration_days ?? 0;

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


  /* --------------------------------------------------------
     Risk distribution percentage
  -------------------------------------------------------- */

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


  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ----------------------------------------------------
          Sidebar
      ---------------------------------------------------- */}

      <Sidebar />


      <div className="flex-1">

        {/* --------------------------------------------------
            Navbar
        -------------------------------------------------- */}

        <Navbar />


        <main className="p-8">

          {/* ------------------------------------------------
              Header
          ------------------------------------------------ */}

          <div className="mb-8">

            <p className="text-sm font-semibold text-cyan-600">
              HealthForecast AI
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Healthcare Analytics
            </h1>

            <p className="mt-2 max-w-3xl text-gray-500">
              Monitor patient population, readmission risk,
              and AI-generated healthcare intelligence.
            </p>

          </div>


          {/* ------------------------------------------------
              Error
          ------------------------------------------------ */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4">

              <p className="font-semibold text-red-700">
                Unable to load analytics
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

            </div>
          )}


          {/* ------------------------------------------------
              KPI Cards
          ------------------------------------------------ */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">


            {/* Total Patients */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Total Patients
                  </p>

                  <p className="mt-3 text-4xl font-bold text-slate-900">
                    {loading ? "—" : totalPatients}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Patients available to your role
                  </p>

                </div>

                <div className="rounded-xl bg-cyan-50 p-4">
                  <Users
                    className="text-cyan-600"
                    size={26}
                  />
                </div>

              </div>

            </div>


            {/* Assessed Patients */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Assessed Patients
                  </p>

                  <p className="mt-3 text-4xl font-bold text-slate-900">
                    {loading ? "—" : assessedPatients}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Patients with clinical assessments
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <Activity
                    className="text-blue-600"
                    size={26}
                  />
                </div>

              </div>

            </div>


            {/* Scored Patients */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    AI Scored
                  </p>

                  <p className="mt-3 text-4xl font-bold text-cyan-600">
                    {loading ? "—" : scoredPatients}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Patients evaluated by the model
                  </p>

                </div>

                <div className="rounded-xl bg-cyan-50 p-4">
                  <Brain
                    className="text-cyan-600"
                    size={26}
                  />
                </div>

              </div>

            </div>


            {/* Average Probability */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Average Readmission Risk
                  </p>

                  <p className="mt-3 text-4xl font-bold text-purple-600">
                    {loading
                      ? "—"
                      : `${(averageProbability * 100).toFixed(1)}%`}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Across scored patients
                  </p>

                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <TrendingUp
                    className="text-purple-600"
                    size={26}
                  />
                </div>

              </div>

            </div>

          </div>


          {/* ------------------------------------------------
              Risk Distribution + Outcome Distribution
          ------------------------------------------------ */}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">


            {/* Risk Distribution */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-red-50 p-3">
                  <AlertTriangle
                    className="text-red-600"
                    size={24}
                  />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Readmission Risk Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    AI-assigned risk categories
                  </p>

                </div>

              </div>


              <div className="mt-8 space-y-6">


                {/* High */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="h-3 w-3 rounded-full bg-red-500" />

                      <span className="text-sm font-medium text-gray-700">
                        High Risk
                      </span>

                    </div>

                    <span className="text-sm font-semibold text-gray-900">
                      {highRisk}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${highRiskPercentage}%`,
                      }}
                    />

                  </div>

                </div>


                {/* Moderate */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="h-3 w-3 rounded-full bg-yellow-500" />

                      <span className="text-sm font-medium text-gray-700">
                        Moderate Risk
                      </span>

                    </div>

                    <span className="text-sm font-semibold text-gray-900">
                      {moderateRisk}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                    <div
                      className="h-full rounded-full bg-yellow-500"
                      style={{
                        width: `${moderateRiskPercentage}%`,
                      }}
                    />

                  </div>

                </div>


                {/* Low */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="h-3 w-3 rounded-full bg-green-500" />

                      <span className="text-sm font-medium text-gray-700">
                        Low Risk
                      </span>

                    </div>

                    <span className="text-sm font-semibold text-gray-900">
                      {lowRisk}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${lowRiskPercentage}%`,
                      }}
                    />

                  </div>

                </div>


              </div>


              <div className="mt-8 rounded-xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Total scored patients
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "—" : totalScored}
                </p>

              </div>

            </div>


            {/* Outcome Distribution */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-3">
                  <BarChart3
                    className="text-blue-600"
                    size={24}
                  />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Predicted Outcomes
                  </h2>

                  <p className="text-sm text-gray-500">
                    Model prediction distribution
                  </p>

                </div>

              </div>


              <div className="mt-8 grid gap-5 sm:grid-cols-2">


                {/* Readmitted */}

                <div className="rounded-xl border border-red-100 bg-red-50 p-5">

                  <p className="text-sm font-medium text-red-700">
                    Predicted Readmitted
                  </p>

                  <p className="mt-3 text-3xl font-bold text-red-700">
                    {loading ? "—" : predictedReadmitted}
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    Model predicts readmission
                  </p>

                </div>


                {/* Not Readmitted */}

                <div className="rounded-xl border border-green-100 bg-green-50 p-5">

                  <p className="text-sm font-medium text-green-700">
                    Predicted Not Readmitted
                  </p>

                  <p className="mt-3 text-3xl font-bold text-green-700">
                    {loading ? "—" : predictedNotReadmitted}
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    Model predicts no readmission
                  </p>

                </div>


              </div>


              {/* Outcome total */}

              <div className="mt-6 rounded-xl bg-gray-50 p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Model Decision Threshold
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {loading
                        ? "—"
                        : `${(decisionThreshold * 100).toFixed(1)}%`}
                    </p>

                  </div>

                  <Target
                    className="text-purple-600"
                    size={30}
                  />

                </div>

              </div>

            </div>

          </div>


          {/* ------------------------------------------------
              AI Model Information
          ------------------------------------------------ */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-purple-50 p-3">
                <Brain
                  className="text-purple-600"
                  size={24}
                />
              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  AI Model Intelligence
                </h2>

                <p className="text-sm text-gray-500">
                  Current readmission prediction engine
                </p>

              </div>

            </div>


            <div className="mt-6 grid gap-5 md:grid-cols-3">


              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Model
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {model}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Machine learning classifier
                </p>

              </div>


              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Decision Threshold
                </p>

                <p className="mt-2 text-xl font-bold text-cyan-600">
                  {loading
                    ? "—"
                    : `${(decisionThreshold * 100).toFixed(1)}%`}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Optimized prediction threshold
                </p>

              </div>


              <div className="rounded-xl bg-gray-50 p-5">

                <div className="flex items-center gap-2">

                  <ShieldCheck
                    className="text-green-600"
                    size={20}
                  />

                  <p className="text-sm text-gray-500">
                    Privacy
                  </p>

                </div>

                <p className="mt-2 text-xl font-bold text-green-600">
                  Aggregate Only
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  No identifiable patient information returned
                </p>

              </div>


            </div>

          </div>


          {/* ------------------------------------------------
              Data Coverage
          ------------------------------------------------ */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Analytics Coverage
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Clinical assessment and prediction coverage
                </p>

              </div>

              <TrendingUp
                className="text-cyan-600"
                size={26}
              />

            </div>


            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-medium text-gray-600">
                  Patients with completed assessments
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {totalPatients > 0
                    ? `${(
                        (assessedPatients / totalPatients) *
                        100
                      ).toFixed(1)}%`
                    : "0.0%"}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{
                    width: `${
                      totalPatients > 0
                        ? Math.min(
                            (assessedPatients /
                              totalPatients) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>


            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Total Patients
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "—" : totalPatients}
                </p>

              </div>


              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Assessed
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {loading ? "—" : assessedPatients}
                </p>

              </div>


              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  AI Scored
                </p>

                <p className="mt-1 text-2xl font-bold text-cyan-600">
                  {loading ? "—" : scoredPatients}
                </p>

              </div>

            </div>

          </div>


          {/* ------------------------------------------------
    Treatment Effectiveness
------------------------------------------------ */}

<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

  <div className="flex items-center gap-3">

    <div className="rounded-xl bg-green-50 p-3">
      <Activity
        className="text-green-600"
        size={24}
      />
    </div>

    <div>
      <h2 className="text-xl font-bold text-slate-900">
        Treatment Effectiveness
      </h2>

      <p className="text-sm text-gray-500">
        Treatment outcomes and medication effectiveness indicators
      </p>
    </div>

  </div>


  {/* Treatment KPIs */}

  <div className="mt-6 grid gap-5 md:grid-cols-3">

    <div className="rounded-xl bg-gray-50 p-5">

      <p className="text-sm text-gray-500">
        Total Treatments
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {loading ? "—" : totalTreatments}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Recorded treatment plans
      </p>

    </div>


    <div className="rounded-xl bg-gray-50 p-5">

      <p className="text-sm text-gray-500">
        Effectiveness Rate
      </p>

      <p className="mt-2 text-3xl font-bold text-green-600">
        {loading
          ? "—"
          : `${(treatmentEffectivenessRate * 100).toFixed(1)}%`}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Based on completed outcomes
      </p>

    </div>


    <div className="rounded-xl bg-gray-50 p-5">

      <p className="text-sm text-gray-500">
        Average Duration
      </p>

      <p className="mt-2 text-3xl font-bold text-cyan-600">
        {loading
          ? "—"
          : `${averageTreatmentDuration} days`}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Average treatment duration
      </p>

    </div>

  </div>


  {/* Outcome Distribution */}

  <div className="mt-8">

    <h3 className="text-lg font-bold text-slate-900">
      Treatment Outcome Distribution
    </h3>

    <p className="mt-1 text-sm text-gray-500">
      Current distribution of recorded treatment outcomes.
    </p>


    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-xl border border-green-100 bg-green-50 p-5">

        <p className="text-sm font-medium text-green-700">
          Favorable
        </p>

        <p className="mt-2 text-3xl font-bold text-green-700">
          {loading ? "—" : favorableTreatments}
        </p>

      </div>


      <div className="rounded-xl border border-red-100 bg-red-50 p-5">

        <p className="text-sm font-medium text-red-700">
          Unfavorable
        </p>

        <p className="mt-2 text-3xl font-bold text-red-700">
          {loading ? "—" : unfavorableTreatments}
        </p>

      </div>


      <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5">

        <p className="text-sm font-medium text-yellow-700">
          Ongoing
        </p>

        <p className="mt-2 text-3xl font-bold text-yellow-700">
          {loading ? "—" : ongoingTreatments}
        </p>

      </div>


      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

        <p className="text-sm font-medium text-gray-600">
          Not Recorded
        </p>

        <p className="mt-2 text-3xl font-bold text-gray-700">
          {loading ? "—" : notRecordedTreatments}
        </p>

      </div>

    </div>

  </div>


  {/* Treatment Details */}

  {treatmentEffectiveness.length > 0 && (

    <div className="mt-8">

      <h3 className="text-lg font-bold text-slate-900">
        Treatment Performance
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Effectiveness summary by treatment type.
      </p>


      <div className="mt-4 space-y-3">

        {treatmentEffectiveness.map((treatment) => (

          <div
            key={treatment.treatment_name}
            className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >

            <div>

              <p className="font-semibold text-slate-900">
                {treatment.treatment_name}
              </p>

              <p className="text-sm text-gray-500">
                {treatment.total_records} treatment record
                {treatment.total_records === 1 ? "" : "s"}
              </p>

            </div>


            <div className="flex items-center gap-6 text-sm">

              <div>
                <span className="text-gray-500">
                  Favorable
                </span>

                <p className="font-bold text-green-600">
                  {treatment.favorable}
                </p>
              </div>


              <div>
                <span className="text-gray-500">
                  Ongoing
                </span>

                <p className="font-bold text-yellow-600">
                  {treatment.ongoing}
                </p>
              </div>


              <div>
                <span className="text-gray-500">
                  Effectiveness
                </span>

                <p className="font-bold text-cyan-600">
                  {(
                    (treatment.effectiveness_rate ?? 0) * 100
                  ).toFixed(1)}%
                </p>
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  )}


  {/* Medication Outcomes */}

  {medicationOutcomes.length > 0 && (

    <div className="mt-8">

      <h3 className="text-lg font-bold text-slate-900">
        Medication Outcomes
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Outcome distribution for recorded medications.
      </p>


      <div className="mt-4 grid gap-4 md:grid-cols-2">

        {medicationOutcomes.map((medication) => (

          <div
            key={medication.medication}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >

            <div className="flex items-center justify-between">

              <p className="font-semibold text-slate-900">
                {medication.medication}
              </p>

              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                {medication.total_records} record
                {medication.total_records === 1 ? "" : "s"}
              </span>

            </div>


            <div className="mt-4 grid grid-cols-3 gap-3 text-center">

              <div className="rounded-lg bg-green-50 p-3">

                <p className="text-xs text-green-700">
                  Favorable
                </p>

                <p className="mt-1 text-xl font-bold text-green-700">
                  {medication.favorable}
                </p>

              </div>


              <div className="rounded-lg bg-yellow-50 p-3">

                <p className="text-xs text-yellow-700">
                  Ongoing
                </p>

                <p className="mt-1 text-xl font-bold text-yellow-700">
                  {medication.ongoing}
                </p>

              </div>


              <div className="rounded-lg bg-red-50 p-3">

                <p className="text-xs text-red-700">
                  Unfavorable
                </p>

                <p className="mt-1 text-xl font-bold text-red-700">
                  {medication.unfavorable}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  )}

</div>


          {/* ------------------------------------------------
              Footer Note
          ------------------------------------------------ */}

          <div className="mt-8 rounded-xl border border-cyan-100 bg-cyan-50 p-5">

            <p className="text-sm font-semibold text-cyan-800">
              HealthForecast AI Analytics
            </p>

            <p className="mt-1 text-sm leading-6 text-cyan-700">
              Analytics are generated from the application's
              stored clinical assessments and the deployed
              readmission prediction model. Risk categories
              are model outputs and should support, not replace,
              professional clinical judgment.
            </p>

          </div>

        </main>

      </div>

    </div>
  );
}


export default Analytics;