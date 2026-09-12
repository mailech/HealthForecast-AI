import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/api";
import { AlertTriangle, CheckCircle, Activity, RefreshCw } from "lucide-react";

function Optimization() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOptimization = async () => {
    try {
      setLoading(true);
      const res = await api.get("/optimization/");
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load optimization data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptimization();
  }, []);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Optimization Workflow
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">
          AI-assisted patient prioritization and monitoring recommendations.
        </p>
      </div>

      {loading && (
        <div className="text-slate-500 dark:text-slate-400">
          Loading optimization data...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <Card
              icon={<Activity />}
              title="Total Patients"
              value={data.total_patients}
            />
            <Card
              icon={<AlertTriangle />}
              title="High Risk"
              value={data.high_risk}
            />
            <Card
              icon={<Activity />}
              title="Medium Risk"
              value={data.medium_risk}
            />
            <Card
              icon={
                data.priority === "High" ? (
                  <AlertTriangle />
                ) : (
                  <CheckCircle />
                )
              }
              title="Priority"
              value={data.priority}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Recommended Actions
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Suggested actions based on current patient risk levels.
                </p>
              </div>

              <button
                onClick={loadOptimization}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            </div>

            <div className="space-y-3">
              {data.actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700"
                >
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-slate-700 dark:text-slate-200">
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-3 text-blue-600">
        {icon}
        <span className="text-sm text-gray-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-3">
        {value}
      </p>
    </div>
  );
}

export default Optimization;