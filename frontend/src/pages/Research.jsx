import { useEffect, useState } from "react";
import {
  Users,
  AlertTriangle,
  BrainCircuit,
  Activity,
  ShieldCheck,
  Lock,
  BarChart3,
  Database,
  Download,
  Target,
  TrendingUp,
  FileText,
} from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../api/api";

function Research() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        const response = await api.get("/research/summary");
        setData(response.data);
      } catch (err) {
        console.error("Research data error:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load research data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResearchData();
  }, []);

  const exportSummary = () => {
    if (!data) return;

    const csv = [
      "HealthForecast AI - Research Summary",
      "",
      "Metric,Value",
      `Total Patients,${data.total_patients ?? 0}`,
      `High Risk Patients,${data.high_risk_patients ?? 0}`,
      `Total Predictions,${data.total_predictions ?? 0}`,
      `Average Risk Score,${data.average_risk_score ?? 0}`,
      "",
      "ML Model",
      "Model,Logistic Regression",
      "Recall,88.11%",
      "ROC-AUC,64.62%",
      "Accuracy,32.56%",
      "False Negatives,270",
      "True Positives,2001",
      "",
      "Dataset",
      "Dataset,Diabetes 130-US Hospitals",
      "Records,101766",
      "Features,50",
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "HealthForecast_Research_Summary.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <BrainCircuit
            size={35}
            className="text-blue-600 mx-auto mb-3"
          />

          <p className="text-gray-500">
            Loading research analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="font-semibold text-red-700">
            Unable to load research data
          </h2>

          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const totalPatients = data?.total_patients ?? 0;
  const highRiskPatients = data?.high_risk_patients ?? 0;
  const totalPredictions = data?.total_predictions ?? 0;
  const averageRisk = data?.average_risk_score ?? 0;

  const riskChartData = [
    {
      name: "Patients",
      value: totalPatients,
    },
    {
      name: "High Risk",
      value: highRiskPatients,
    },
    {
      name: "Predictions",
      value: totalPredictions,
    },
  ];

  const cards = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "High Risk Patients",
      value: highRiskPatients,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
      valueColor: "text-red-600",
    },
    {
      title: "Total Predictions",
      value: totalPredictions,
      icon: Activity,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
    {
      title: "Average Risk Score",
      value: averageRisk.toFixed(4),
      icon: BarChart3,
      bg: "bg-green-100",
      color: "text-green-600",
      valueColor: "text-blue-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <BrainCircuit
              size={26}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Research & Analytics
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Privacy-safe healthcare research workspace
            </p>
          </div>

        </div>

        <button
          onClick={exportSummary}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          <Download size={18} />
          Export Research Summary
        </button>

      </div>


      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h2
                    className={`text-2xl font-bold mt-2 ${
                      card.valueColor ||
                      "text-slate-900"
                    }`}
                  >
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`w-11 h-11 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <Icon
                    size={22}
                    className={card.color}
                  />
                </div>

              </div>

              <p className="text-xs text-gray-400 mt-3">
                Aggregate research data
              </p>

            </div>
          );
        })}

      </div>


      {/* CHART + READMISSION ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* RISK DISTRIBUTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3
                size={21}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Research Overview
              </h2>

              <p className="text-sm text-gray-500">
                Aggregate healthcare activity
              </p>
            </div>

          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart
              data={riskChartData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: "#64748b",
                }}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>

        </div>


        {/* READMISSION ANALYSIS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp
                size={21}
                className="text-purple-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Readmission Analysis
              </h2>

              <p className="text-sm text-gray-500">
                Current aggregate prediction activity
              </p>
            </div>

          </div>

          <div className="space-y-4">

            <AnalysisRow
              label="Patients Analyzed"
              value={totalPatients}
            />

            <AnalysisRow
              label="Predictions Generated"
              value={totalPredictions}
            />

            <AnalysisRow
              label="High-Risk Patients"
              value={highRiskPatients}
            />

            <AnalysisRow
              label="Average Risk Score"
              value={averageRisk.toFixed(4)}
            />

          </div>

        </div>

      </div>


      {/* ML PERFORMANCE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Target
              size={21}
              className="text-green-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              ML Model Performance
            </h2>

            <p className="text-sm text-gray-500">
              Readmission prediction evaluation metrics
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          <MetricCard
            title="Recall"
            value="88.11%"
            description="High-risk detection"
          />

          <MetricCard
            title="ROC-AUC"
            value="64.62%"
            description="Ranking performance"
          />

          <MetricCard
            title="Accuracy"
            value="32.56%"
            description="Overall predictions"
          />

          <MetricCard
            title="False Negatives"
            value="270"
            description="Missed positive cases"
          />

          <MetricCard
            title="True Positives"
            value="2,001"
            description="Correct positive cases"
          />

          <MetricCard
            title="Model"
            value="LR"
            description="Logistic Regression"
          />

        </div>

      </div>


      {/* DATASET + INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* DATASET */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Database
                size={21}
                className="text-indigo-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Dataset Information
              </h2>

              <p className="text-sm text-gray-500">
                Training dataset used by HealthForecast AI
              </p>
            </div>

          </div>

          <div className="space-y-4">

            <InfoRow
              label="Dataset"
              value="Diabetes 130-US Hospitals"
            />

            <InfoRow
              label="Records"
              value="101,766"
            />

            <InfoRow
              label="Features"
              value="50"
            />

            <InfoRow
              label="Prediction Target"
              value="Readmission"
            />

            <InfoRow
              label="Model"
              value="Logistic Regression"
            />

          </div>

        </div>


        {/* INSIGHTS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <FileText
                size={21}
                className="text-yellow-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Research Insights
              </h2>

              <p className="text-sm text-gray-500">
                Aggregate observations from the system
              </p>
            </div>

          </div>

          <div className="space-y-4">

            <Insight
              text={`${totalPatients} patients are currently represented in the research summary.`}
            />

            <Insight
              text={`${highRiskPatients} patient(s) are currently classified as high risk in the aggregate data.`}
            />

            <Insight
              text={`${totalPredictions} readmission prediction(s) have been generated.`}
            />

            <Insight
              text="The model evaluation prioritizes recall to reduce missed high-risk cases."
            />

          </div>

        </div>

      </div>


      {/* PRIVACY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ALLOWED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ShieldCheck
                size={21}
                className="text-green-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Research Data Access
              </h2>

              <p className="text-sm text-gray-500">
                Information available to researchers
              </p>
            </div>

          </div>

          <div className="space-y-4">

            <AccessItem
              title="Aggregated healthcare data"
              description="Population-level statistics only"
            />

            <AccessItem
              title="Anonymized research insights"
              description="Individual identities are not exposed"
            />

            <AccessItem
              title="Research analytics"
              description="Aggregate healthcare analysis"
            />

            <AccessItem
              title="Model performance"
              description="Evaluation metrics and aggregate results"
            />

          </div>

        </div>


        {/* RESTRICTED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Lock
                size={21}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Protected Information
              </h2>

              <p className="text-sm text-gray-500">
                Restricted from research access
              </p>
            </div>

          </div>

          <div className="space-y-4">

            <RestrictedItem text="Patient names" />

            <RestrictedItem text="Email and contact information" />

            <RestrictedItem text="Individual patient records" />

            <RestrictedItem text="Direct clinical decision-making" />

          </div>

        </div>

      </div>


      {/* PRIVACY NOTICE */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

        <div className="flex gap-3">

          <ShieldCheck
            size={22}
            className="text-blue-600 mt-0.5 flex-shrink-0"
          />

          <div>

            <h3 className="font-semibold text-blue-900">
              Data Privacy Protection
            </h3>

            <p className="text-sm text-blue-800 mt-1 leading-relaxed">
              Research access is limited to aggregated and
              privacy-safe healthcare information. Personally
              identifiable patient information is not returned
              by the research API.
            </p>

          </div>

        </div>

      </div>


      {/* EXPORT FOOTER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Download
              size={20}
              className="text-gray-600"
            />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Research Report
            </h3>

            <p className="text-sm text-gray-500">
              Export aggregate research metrics as CSV
            </p>
          </div>

        </div>

        <button
          onClick={exportSummary}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-blue-200 text-blue-600 font-medium text-sm hover:bg-blue-50 transition"
        >
          <Download size={17} />
          Export Summary
        </button>

      </div>

    </div>
  );
}


/* ============================================================
   ANALYSIS ROW
============================================================ */

function AnalysisRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  title,
  value,
  description,
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="text-xl font-bold text-blue-600 mt-2">
        {value}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-sm font-medium text-slate-900">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   INSIGHT
============================================================ */

function Insight({ text }) {
  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">

      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Activity
          size={14}
          className="text-blue-600"
        />
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {text}
      </p>

    </div>
  );
}


/* ============================================================
   ACCESS ITEM
============================================================ */

function AccessItem({
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">

        <ShieldCheck
          size={16}
          className="text-green-600"
        />

      </div>

      <div>

        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-0.5">
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   RESTRICTED ITEM
============================================================ */

function RestrictedItem({ text }) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">

        <Lock
          size={14}
          className="text-red-600"
        />

      </div>

      <span className="text-sm text-gray-700">
        {text}
      </span>

    </div>
  );
}


export default Research; 