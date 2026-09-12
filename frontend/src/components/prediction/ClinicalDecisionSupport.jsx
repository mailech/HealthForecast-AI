import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Pill,
  CalendarCheck,
} from "lucide-react";

function ClinicalDecisionSupport({ prediction }) {
  if (!prediction) return null;

  const { risk_level, risk_score } = prediction;

  const recommendations = {
    High: [
      "Monitor patient closely",
      "Review medication and treatment plan",
      "Arrange appropriate follow-up",
      "Strengthen discharge planning",
    ],
    Medium: [
      "Monitor patient regularly",
      "Review follow-up requirements",
      "Review medication effectiveness",
      "Plan routine post-discharge follow-up",
    ],
    Low: [
      "Continue routine monitoring",
      "Maintain current treatment plan",
      "Follow standard care instructions",
    ],
  };

  const items =
    recommendations[risk_level] ||
    recommendations.Low;

  const Icon =
    risk_level === "High"
      ? AlertTriangle
      : risk_level === "Medium"
      ? ShieldAlert
      : CheckCircle;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-6">

      <div className="flex items-center gap-3 mb-5">

        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icon className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Clinical Decision Support
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-assisted guidance based on the predicted risk
          </p>
        </div>

      </div>


      <div className="grid md:grid-cols-3 gap-4 mb-5">

        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Risk Level
          </p>

          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            {risk_level}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Probability
          </p>

          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            {Math.round(risk_score * 100)}%
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Support Areas
          </p>

          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            {items.length}
          </p>
        </div>

      </div>


      <div className="space-y-3">

        {items.map((item, index) => (

          <div
            key={index}
            className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
          >
            {index === 0 ? (
              <AlertTriangle
                size={18}
                className="text-blue-600"
              />
            ) : index === 1 ? (
              <Pill
                size={18}
                className="text-blue-600"
              />
            ) : (
              <CalendarCheck
                size={18}
                className="text-blue-600"
              />
            )}

            <span>{item}</span>

          </div>

        ))}

      </div>


      <p className="text-xs text-gray-400 mt-5">
        Decision-support information only. It does not replace
        professional clinical judgment or medical diagnosis.
      </p>

    </div>
  );
}

export default ClinicalDecisionSupport;