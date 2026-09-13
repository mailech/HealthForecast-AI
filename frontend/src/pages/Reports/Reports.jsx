import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Download,
  FileBarChart,
  FileText,
  HeartPulse,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Users,
  AlertTriangle,
  Pill,
} from "lucide-react";

import {
  getPredictionAnalytics,
  getTreatmentEffectiveness,
} from "../../services/api";


function Reports() {
  const [predictionAnalytics, setPredictionAnalytics] = useState(null);
  const [treatmentAnalytics, setTreatmentAnalytics] = useState(null);

  const [selectedReport, setSelectedReport] = useState(
    "Patient Population Report"
  );

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD REPORT DATA
  // ==========================================================

  useEffect(() => {
    const loadReportData = async () => {
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

        setPredictionAnalytics(
          predictionData || null
        );

        setTreatmentAnalytics(
          treatmentData || null
        );
      } catch (err) {
        console.error(
          "Unable to load report data:",
          err
        );

        setError(
          err.message ||
          "Unable to load report data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  // ==========================================================
  // SAFE ANALYTICS VALUES
  // ==========================================================

  const totalPatients =
    predictionAnalytics?.total_patients ?? 0;

  const assessedPatients =
    predictionAnalytics?.assessed_patients ?? 0;

  const scoredPatients =
    predictionAnalytics?.scored_patients ?? 0;

  const averageRisk =
    predictionAnalytics?.average_readmission_probability ?? 0;

  const decisionThreshold =
    predictionAnalytics?.decision_threshold ?? 0;

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

  const treatmentEffectivenessRate =
    treatmentAnalytics?.effectiveness_rate ?? 0;

  const averageTreatmentDuration =
    treatmentAnalytics?.average_treatment_duration_days ?? 0;

  const treatmentOutcomeDistribution =
    treatmentAnalytics?.outcome_distribution || {};

  const favorableTreatments =
    treatmentOutcomeDistribution.favorable ?? 0;

  const unfavorableTreatments =
    treatmentOutcomeDistribution.unfavorable ?? 0;

  const ongoingTreatments =
    treatmentOutcomeDistribution.ongoing ?? 0;

  const notRecordedTreatments =
    treatmentOutcomeDistribution.not_recorded ?? 0;

  const treatmentEffectiveness =
    treatmentAnalytics?.treatment_effectiveness || [];

  const medicationOutcomes =
    treatmentAnalytics?.medication_outcomes || [];

  // ==========================================================
  // REPORT DEFINITIONS
  // ==========================================================

  const reports = [
    {
      title: "Patient Population Report",
      description:
        "Overview of patient coverage, clinical assessments, and AI scoring activity.",
      icon: Users,
      accent: "cyan",
    },
    {
      title: "Readmission Risk Report",
      description:
        "AI-powered analysis of predicted readmission risk and outcome distribution.",
      icon: Brain,
      accent: "purple",
    },
    {
      title: "Healthcare Analytics Report",
      description:
        "Combined view of readmission intelligence and treatment effectiveness.",
      icon: BarChart3,
      accent: "blue",
    },
  ];

  // ==========================================================
  // REPORT SUMMARY
  // ==========================================================

  const reportSummary = useMemo(() => {
    switch (selectedReport) {
      case "Patient Population Report":
        return {
          label: "Population Coverage",
          value: totalPatients,
          description:
            "Patients represented in the current analytics scope.",
        };

      case "Readmission Risk Report":
        return {
          label: "Average AI Risk",
          value: `${(averageRisk * 100).toFixed(1)}%`,
          description:
            "Average predicted readmission probability.",
        };

      case "Healthcare Analytics Report":
        return {
          label: "Treatment Effectiveness",
          value: `${treatmentEffectivenessRate.toFixed(1)}%`,
          description:
            "Favorable outcomes among classified treatment outcomes.",
        };

      default:
        return {
          label: "Patients",
          value: totalPatients,
          description:
            "Patients represented in the current analytics scope.",
        };
    }
  }, [
    selectedReport,
    totalPatients,
    averageRisk,
    treatmentEffectivenessRate,
  ]);

  // ==========================================================
  // REPORT GENERATION
  // ==========================================================

  const generateReport = async () => {
    try {
      setGenerating(true);
      setError("");

      let reportText = "";

      const timestamp = new Date().toLocaleString();

      // ------------------------------------------------------
      // Patient Population Report
      // ------------------------------------------------------

      if (
        selectedReport ===
        "Patient Population Report"
      ) {
        reportText = `
HEALTHFORECAST AI
PATIENT POPULATION REPORT
========================================

Generated: ${timestamp}

PATIENT COVERAGE
----------------------------------------
Total Patients: ${totalPatients}
Assessed Patients: ${assessedPatients}
AI Scored Patients: ${scoredPatients}

ASSESSMENT COVERAGE
----------------------------------------
Clinical Assessment Coverage: ${
          totalPatients > 0
            ? (
                (assessedPatients / totalPatients) *
                100
              ).toFixed(1)
            : "0.0"
        }%

AI Scoring Coverage: ${
          totalPatients > 0
            ? (
                (scoredPatients / totalPatients) *
                100
              ).toFixed(1)
            : "0.0"
        }%

MODEL INFORMATION
----------------------------------------
Model: ${
          predictionAnalytics?.model ||
          "Readmission Prediction Model"
        }
Decision Threshold: ${(
          decisionThreshold * 100
        ).toFixed(1)}%

========================================
HealthForecast AI
Healthcare analytics report
        `.trim();
      }

      // ------------------------------------------------------
      // Readmission Risk Report
      // ------------------------------------------------------

      else if (
        selectedReport ===
        "Readmission Risk Report"
      ) {
        reportText = `
HEALTHFORECAST AI
READMISSION RISK REPORT
========================================

Generated: ${timestamp}

READMISSION INTELLIGENCE
----------------------------------------
Patients Scored: ${scoredPatients}
Average Readmission Probability: ${(
          averageRisk * 100
        ).toFixed(1)}%
Decision Threshold: ${(
          decisionThreshold * 100
        ).toFixed(1)}%

RISK DISTRIBUTION
----------------------------------------
High Risk: ${highRisk}
Moderate Risk: ${moderateRisk}
Low Risk: ${lowRisk}

PREDICTED OUTCOMES
----------------------------------------
Predicted Readmitted: ${predictedReadmitted}
Predicted Not Readmitted: ${predictedNotReadmitted}

MODEL
----------------------------------------
${
  predictionAnalytics?.model ||
  "Readmission Prediction Model"
}

========================================
This report is intended to support
clinical review and healthcare analytics.
        `.trim();
      }

      // ------------------------------------------------------
      // Healthcare Analytics Report
      // ------------------------------------------------------

      else {
        reportText = `
HEALTHFORECAST AI
HEALTHCARE ANALYTICS REPORT
========================================

Generated: ${timestamp}

PATIENT ANALYTICS
----------------------------------------
Total Patients: ${totalPatients}
Assessed Patients: ${assessedPatients}
AI Scored Patients: ${scoredPatients}

READMISSION ANALYTICS
----------------------------------------
Average Readmission Probability: ${(
          averageRisk * 100
        ).toFixed(1)}%
Decision Threshold: ${(
          decisionThreshold * 100
        ).toFixed(1)}%

High Risk: ${highRisk}
Moderate Risk: ${moderateRisk}
Low Risk: ${lowRisk}

Predicted Readmitted: ${predictedReadmitted}
Predicted Not Readmitted: ${predictedNotReadmitted}

TREATMENT ANALYTICS
----------------------------------------
Total Treatments: ${totalTreatments}
Treatment Effectiveness Rate: ${treatmentEffectivenessRate.toFixed(
          1
        )}%
Average Treatment Duration: ${averageTreatmentDuration.toFixed(
          1
        )} days

Favorable: ${favorableTreatments}
Unfavorable: ${unfavorableTreatments}
Ongoing: ${ongoingTreatments}
Not Recorded: ${notRecordedTreatments}

TREATMENT PERFORMANCE
----------------------------------------
${treatmentEffectiveness.length > 0
  ? treatmentEffectiveness
      .map(
        (treatment) =>
          `${treatment.treatment_name}: ${
            treatment.effectiveness_rate ?? 0
          }% effectiveness`
      )
      .join("\n")
  : "No treatment performance records available."}

MEDICATION OUTCOMES
----------------------------------------
${medicationOutcomes.length > 0
  ? medicationOutcomes
      .map(
        (medication) =>
          `${medication.medication}: ${
            medication.outcome_rate ?? 0
          }% favorable classified outcomes`
      )
      .join("\n")
  : "No medication outcome records available."}

MODEL
----------------------------------------
${
  predictionAnalytics?.model ||
  "Readmission Prediction Model"
}

========================================
This report is intended to support
healthcare analytics and clinical review.
        `.trim();
      }

      const blob = new Blob(
        [reportText],
        {
          type: "text/plain;charset=utf-8",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${selectedReport
          .toLowerCase()
          .replace(/\s+/g, "-")}.txt`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Report generation error:",
        err
      );

      setError(
        "Unable to generate the selected report."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <div className="min-w-0 flex-1">

        <Navbar />

        <div className="min-h-[calc(100vh-5rem)] bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-cyan-50 p-2">
                  <FileBarChart
                    size={20}
                    className="text-cyan-600"
                  />
                </div>

                <span className="text-sm font-semibold tracking-wide text-cyan-600">
                  HEALTHFORECAST AI
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Reports & Intelligence
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Generate structured healthcare intelligence
                reports from your current patient, readmission,
                and treatment analytics.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-4">
              <ShieldCheck
                size={22}
                className="text-cyan-600"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Privacy-aware reporting
                </p>

                <p className="text-xs text-slate-500">
                  Aggregate analytics only
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>


      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle
              size={20}
              className="mt-0.5 text-red-500"
            />

            <div>
              <p className="font-semibold text-red-700">
                Unable to load reports
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}


        {/* ===================================================
            REPORT TYPES
        ==================================================== */}

        <section>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Report Center
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose the type of healthcare intelligence you
              want to generate.
            </p>
          </div>


          <div className="grid gap-5 lg:grid-cols-3">

            {reports.map((report) => {
              const Icon = report.icon;

              const isSelected =
                selectedReport === report.title;

              return (
                <button
                  key={report.title}
                  type="button"
                  onClick={() =>
                    setSelectedReport(
                      report.title
                    )
                  }
                  className={`group rounded-2xl border bg-white p-6 text-left transition duration-200 ${
                    isSelected
                      ? "border-cyan-400 ring-2 ring-cyan-100 shadow-md"
                      : "border-slate-200 shadow-sm hover:-translate-y-1 hover:border-cyan-200 hover:shadow-md"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div
                      className={`rounded-xl p-3 ${
                        isSelected
                          ? "bg-cyan-100"
                          : "bg-slate-100"
                      }`}
                    >
                      <Icon
                        size={25}
                        className={
                          isSelected
                            ? "text-cyan-600"
                            : "text-slate-600"
                        }
                      />
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        <CheckCircle2 size={14} />
                        Selected
                      </div>
                    )}

                  </div>


                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {report.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {report.description}
                  </p>


                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-600">
                    <span>
                      {isSelected
                        ? "Ready to generate"
                        : "Select report"}
                    </span>

                    <TrendingUp
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>

                </button>
              );
            })}

          </div>

        </section>


        {/* ===================================================
            SELECTED REPORT SUMMARY
        ==================================================== */}

        <section className="mt-8">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6 text-white lg:px-8">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-white/10 p-3">
                    <FileText size={26} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      Selected Report
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {selectedReport}
                    </h2>
                  </div>

                </div>


                <button
                  type="button"
                  onClick={generateReport}
                  disabled={
                    loading || generating
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={18} />
                  )}

                  {generating
                    ? "Generating..."
                    : "Generate & Download"}
                </button>

              </div>

            </div>


            <div className="p-6 lg:p-8">

              {/* Summary hero */}

              <div className="grid gap-5 md:grid-cols-3">

                <div className="rounded-2xl bg-cyan-50 p-5">
                  <p className="text-sm font-medium text-cyan-700">
                    {reportSummary.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : reportSummary.value}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {reportSummary.description}
                  </p>
                </div>


                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Clinical Assessments
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : assessedPatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Patients with assessment data
                  </p>
                </div>


                <div className="rounded-2xl bg-purple-50 p-5">
                  <p className="text-sm font-medium text-purple-700">
                    AI Scored
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading
                      ? "—"
                      : scoredPatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Patients with generated AI risk scores
                  </p>
                </div>

              </div>


              {/* =================================================
                  PATIENT POPULATION
              ================================================== */}

              {selectedReport ===
                "Patient Population Report" && (

                <div className="mt-8">

                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-50 p-3">
                      <Users
                        size={22}
                        className="text-cyan-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Population Coverage
                      </h3>

                      <p className="text-sm text-slate-500">
                        Current analytics and AI coverage
                      </p>
                    </div>
                  </div>


                  <div className="grid gap-5 md:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 p-5">

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Assessment Coverage
                        </span>

                        <Activity
                          size={18}
                          className="text-cyan-600"
                        />
                      </div>

                      <p className="mt-3 text-2xl font-bold text-slate-900">
                        {totalPatients > 0
                          ? `${(
                              (assessedPatients /
                                totalPatients) *
                              100
                            ).toFixed(1)}%`
                          : "0.0%"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {assessedPatients} of{" "}
                        {totalPatients} patients assessed
                      </p>

                    </div>


                    <div className="rounded-2xl border border-slate-200 p-5">

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          AI Scoring Coverage
                        </span>

                        <Brain
                          size={18}
                          className="text-purple-600"
                        />
                      </div>

                      <p className="mt-3 text-2xl font-bold text-slate-900">
                        {totalPatients > 0
                          ? `${(
                              (scoredPatients /
                                totalPatients) *
                              100
                            ).toFixed(1)}%`
                          : "0.0%"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {scoredPatients} of{" "}
                        {totalPatients} patients scored
                      </p>

                    </div>

                  </div>

                </div>
              )}


              {/* =================================================
                  READMISSION RISK
              ================================================== */}

              {selectedReport ===
                "Readmission Risk Report" && (

                <div className="mt-8">

                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-purple-50 p-3">
                      <Brain
                        size={22}
                        className="text-purple-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        AI Readmission Intelligence
                      </h3>

                      <p className="text-sm text-slate-500">
                        Current risk and predicted outcome distribution
                      </p>
                    </div>
                  </div>


                  <div className="grid gap-5 md:grid-cols-3">

                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                      <p className="text-sm font-medium text-red-600">
                        High Risk
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {highRisk}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Above model risk threshold
                      </p>
                    </div>


                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                      <p className="text-sm font-medium text-amber-600">
                        Moderate Risk
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {moderateRisk}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Intermediate risk band
                      </p>
                    </div>


                    <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                      <p className="text-sm font-medium text-green-600">
                        Low Risk
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {lowRisk}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Below moderate-risk band
                      </p>
                    </div>

                  </div>


                  <div className="mt-5 grid gap-5 md:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 p-5">

                      <div className="flex items-center gap-3">
                        <HeartPulse
                          size={20}
                          className="text-cyan-600"
                        />

                        <p className="font-semibold text-slate-800">
                          Predicted Readmitted
                        </p>
                      </div>

                      <p className="mt-3 text-3xl font-bold text-slate-900">
                        {predictedReadmitted}
                      </p>

                    </div>


                    <div className="rounded-2xl border border-slate-200 p-5">

                      <div className="flex items-center gap-3">
                        <CheckCircle2
                          size={20}
                          className="text-green-600"
                        />

                        <p className="font-semibold text-slate-800">
                          Predicted Not Readmitted
                        </p>
                      </div>

                      <p className="mt-3 text-3xl font-bold text-slate-900">
                        {predictedNotReadmitted}
                      </p>

                    </div>

                  </div>


                  <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                    <div className="flex items-center gap-3">
                      <TrendingUp
                        size={20}
                        className="text-cyan-600"
                      />

                      <p className="font-semibold text-slate-800">
                        Model Intelligence
                      </p>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">

                      <div>
                        <p className="text-xs text-slate-500">
                          Average Risk
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {(averageRisk * 100).toFixed(1)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Decision Threshold
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {(decisionThreshold * 100).toFixed(1)}%
                        </p>
                      </div>

                    </div>

                  </div>

                </div>
              )}


              {/* =================================================
                  HEALTHCARE ANALYTICS
              ================================================== */}

              {selectedReport ===
                "Healthcare Analytics Report" && (

                <div className="mt-8">

                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <BarChart3
                        size={22}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Healthcare Performance
                      </h3>

                      <p className="text-sm text-slate-500">
                        Combined readmission and treatment intelligence
                      </p>
                    </div>
                  </div>


                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <Pill
                        size={20}
                        className="text-cyan-600"
                      />

                      <p className="mt-4 text-xs text-slate-500">
                        Total Treatments
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {totalTreatments}
                      </p>
                    </div>


                    <div className="rounded-2xl border border-slate-200 p-5">
                      <CheckCircle2
                        size={20}
                        className="text-green-600"
                      />

                      <p className="mt-4 text-xs text-slate-500">
                        Effectiveness
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {treatmentEffectivenessRate.toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>


                    <div className="rounded-2xl border border-slate-200 p-5">
                      <Activity
                        size={20}
                        className="text-blue-600"
                      />

                      <p className="mt-4 text-xs text-slate-500">
                        Avg. Duration
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {averageTreatmentDuration.toFixed(
                          1
                        )}
                        <span className="ml-1 text-sm font-medium text-slate-400">
                          days
                        </span>
                      </p>
                    </div>


                    <div className="rounded-2xl border border-slate-200 p-5">
                      <HeartPulse
                        size={20}
                        className="text-purple-600"
                      />

                      <p className="mt-4 text-xs text-slate-500">
                        Avg. Readmission Risk
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {(averageRisk * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>

                  </div>


                  <div className="mt-6 grid gap-6 lg:grid-cols-2">

                    {/* Treatment outcomes */}

                    <div className="rounded-2xl border border-slate-200 p-6">

                      <h4 className="font-bold text-slate-900">
                        Treatment Outcomes
                      </h4>

                      <div className="mt-5 space-y-4">

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Favorable
                          </span>

                          <span className="font-bold text-green-600">
                            {favorableTreatments}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Unfavorable
                          </span>

                          <span className="font-bold text-red-600">
                            {unfavorableTreatments}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Ongoing
                          </span>

                          <span className="font-bold text-blue-600">
                            {ongoingTreatments}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Not Recorded
                          </span>

                          <span className="font-bold text-slate-600">
                            {notRecordedTreatments}
                          </span>
                        </div>

                      </div>

                    </div>


                    {/* Model summary */}

                    <div className="rounded-2xl border border-slate-200 p-6">

                      <h4 className="font-bold text-slate-900">
                        AI Model Summary
                      </h4>

                      <div className="mt-5 space-y-4">

                        <div>
                          <p className="text-xs text-slate-500">
                            Model
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {predictionAnalytics?.model ||
                              "Readmission Prediction Model"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Decision Threshold
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {(decisionThreshold * 100).toFixed(
                              1
                            )}
                            %
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Average Predicted Risk
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {(averageRisk * 100).toFixed(
                              1
                            )}
                            %
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </section>


        {/* ===================================================
            PRIVACY / SAFETY
        ==================================================== */}

        <section className="mt-8">

          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-white p-3 shadow-sm">
                <ShieldCheck
                  size={22}
                  className="text-cyan-600"
                />
              </div>

              <div>

                <h3 className="font-bold text-slate-900">
                  Responsible AI & Privacy
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Reports use aggregate healthcare analytics
                  and are intended to support clinical review.
                  AI predictions and recommendations should not
                  replace professional medical judgment.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                    Aggregate Analytics
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                    Privacy Aware
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                    Clinical Review
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

        </div>
      </div>
    </div>
  );
}

export default Reports;