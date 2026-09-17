import {
  BrainCircuit,
  RefreshCw,
  Target,
  Activity,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ResearchMLPerformance() {
  const refresh = () => window.location.reload();

  const metrics = [
    {
      icon: Target,
      title: "ROC-AUC",
      value: "0.6462",
      text: "Class separation",
      accent: true,
    },
    {
      icon: Activity,
      title: "Accuracy",
      value: "32.56%",
      text: "At threshold 0.40",
    },
    {
      icon: BarChart3,
      title: "Recall",
      value: "88.11%",
      text: "High-risk detection",
      accent: true,
    },
    {
      icon: BrainCircuit,
      title: "Threshold",
      value: "0.40",
      text: "Production threshold",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-5 lg:p-6">

      {/* Header */}
      <div className="mb-5 rounded-2xl bg-[#0B1F33] p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#E5B7A7]">
              <BrainCircuit size={16} />
              MACHINE LEARNING ANALYSIS
            </div>

            <h1 className="text-2xl font-semibold">
              ML Performance
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Evaluation results for the readmission-risk prediction model.
            </p>
          </div>

          <button
            onClick={refresh}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#C8755B] px-4 py-2.5 text-sm font-medium hover:bg-[#B5654C]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {metrics.map(item => (
          <Metric key={item.title} {...item} />
        ))}

      </div>

      {/* Main */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">

        {/* Model overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-[#F1E1DB] p-3 text-[#C8755B]">
              <BrainCircuit size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#0B1F33]">
                Model Evaluation
              </h2>

              <p className="text-xs text-slate-500">
                Readmission prediction model performance
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <Info title="Algorithm" value="Logistic Regression" />
            <Info title="Dataset" value="Diabetes 130-US Hospitals" />
            <Info title="Train / Test Split" value="80% / 20%" />
            <Info title="Random State" value="42" />
            <Info title="Class Handling" value="Balanced Weights" />
            <Info title="Decision Threshold" value="0.40" />

          </div>

        </div>

        {/* Performance status */}
        <div className="rounded-2xl bg-[#12395B] p-5 text-white">

          <div className="flex items-center gap-2 text-[#E5B7A7]">
            <CheckCircle2 size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">
              Model Status
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            Model Active
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            The trained model is loaded by the ML service and used by the
            protected prediction API.
          </p>

          <div className="mt-5 rounded-xl bg-white/10 p-4">

            <p className="text-3xl font-semibold">
              0.6462
            </p>

            <p className="mt-1 text-xs text-slate-400">
              ROC-AUC score
            </p>

          </div>

        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

        <h2 className="font-semibold text-[#0B1F33]">
          Performance Breakdown
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Evaluation metrics at the deployed threshold.
        </p>

        <div className="mt-5 space-y-4">

          <PerformanceBar
            title="ROC-AUC"
            value={64.62}
            display="0.6462"
          />

          <PerformanceBar
            title="Accuracy"
            value={32.56}
            display="32.56%"
          />

          <PerformanceBar
            title="Recall"
            value={88.11}
            display="88.11%"
          />

          <PerformanceBar
            title="Precision"
            value={12.94}
            display="12.94%"
          />

        </div>
      </div>

      {/* Confusion matrix */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <h2 className="font-semibold text-[#0B1F33]">
            Confusion Matrix
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Results using threshold 0.40.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 text-center">

            <MatrixBox
              title="True Negative"
              value="4,626"
            />

            <MatrixBox
              title="False Positive"
              value="13,457"
            />

            <MatrixBox
              title="False Negative"
              value="270"
            />

            <MatrixBox
              title="True Positive"
              value="2,001"
              accent
            />

          </div>
        </div>

        {/* Interpretation */}
        <div className="rounded-2xl bg-[#12395B] p-5 text-white">

          <div className="flex items-center gap-2 text-[#E5B7A7]">
            <Activity size={18} />

            <span className="text-xs font-medium uppercase tracking-wider">
              Research Interpretation
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            High Recall Strategy
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            The deployed threshold of 0.40 prioritizes identifying patients
            with potential readmission risk. This produces high recall while
            also increasing false-positive predictions.
          </p>

          <div className="mt-5 rounded-xl bg-white/10 p-4">

            <p className="text-2xl font-semibold">
              88.11%
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Recall at deployed threshold
            </p>

          </div>

        </div>

      </div>

      {/* ROC explanation */}
      <div className="mt-5 rounded-2xl border border-[#DFC6BD] bg-[#F4E9E5] p-5">

        <div className="flex gap-3">

          <Target
            size={20}
            className="mt-0.5 shrink-0 text-[#C8755B]"
          />

          <div>
            <h2 className="font-semibold text-[#0B1F33]">
              What does ROC-AUC mean?
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              ROC-AUC measures how well the model separates patients who are
              likely to be readmitted from those who are not. A value of 0.5
              represents random separation, while 1.0 represents perfect
              separation. The model achieved an ROC-AUC of 0.6462.
            </p>
          </div>

        </div>
      </div>

      {/* Privacy */}
      <div className="mt-4 flex gap-3 rounded-xl border border-slate-200 bg-white p-4">

        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-[#C8755B]"
        />

        <div>
          <p className="text-sm font-semibold text-[#0B1F33]">
            Research Access
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Model performance information is presented at an aggregate level
            and does not expose individual patient information.
          </p>
        </div>

      </div>

    </div>
  );
}

function Metric({ icon: Icon, title, value, text, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0B1F33]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {text}
          </p>
        </div>

        <div
          className={`rounded-xl p-2.5 ${
            accent
              ? "bg-[#F1E1DB] text-[#C8755B]"
              : "bg-[#E8EEF3] text-[#12395B]"
          }`}
        >
          <Icon size={19} />
        </div>

      </div>
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div className="rounded-xl bg-[#F5F7F9] p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-[#0B1F33]">
        {value}
      </p>
    </div>
  );
}

function PerformanceBar({ title, value, display }) {
  return (
    <div>

      <div className="mb-1.5 flex justify-between">
        <span className="text-xs font-medium text-slate-600">
          {title}
        </span>

        <span className="text-xs font-semibold text-[#0B1F33]">
          {display}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#C8755B]"
          style={{ width: `${value}%` }}
        />
      </div>

    </div>
  );
}

function MatrixBox({ title, value, accent }) {
  return (
    <div
      className={`rounded-xl p-5 ${
        accent
          ? "bg-[#F1E1DB]"
          : "bg-[#F5F7F9]"
      }`}
    >
      <p className="text-[11px] text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${
          accent ? "text-[#C8755B]" : "text-[#0B1F33]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}