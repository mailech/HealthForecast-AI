import { useEffect, useState } from "react";
import {
  FaFlask,
  FaDatabase,
  FaChartBar,
  FaHeartbeat,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function ResearchDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResearchAnalytics = async () => {
      try {
        const response = await api.get(
          "/api/research/analytics"
        );

        setAnalytics(response.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
          "Unable to load research analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResearchAnalytics();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Research Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Healthcare analytics, population health and clinical outcome research.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">
            Loading research analytics...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Research Records
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {analytics?.total_records ?? 0}
                    </h2>
                  </div>

                  <FaDatabase className="text-blue-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Population Groups
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {Object.keys(
                        analytics?.age_distribution || {}
                      ).length}
                    </h2>
                  </div>

                  <FaFlask className="text-purple-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Risk Categories
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {Object.keys(
                        analytics?.risk_distribution || {}
                      ).length}
                    </h2>
                  </div>

                  <FaHeartbeat className="text-red-500 text-3xl" />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-5">
                  Population Age Distribution
                </h2>

                {Object.entries(
                  analytics?.age_distribution || {}
                ).map(([group, count]) => (
                  <div
                    key={group}
                    className="flex justify-between py-3 border-b"
                  >
                    <span>{group}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-5">
                  Risk Distribution
                </h2>

                {Object.entries(
                  analytics?.risk_distribution || {}
                ).map(([risk, count]) => (
                  <div
                    key={risk}
                    className="flex justify-between py-3 border-b"
                  >
                    <span>{risk}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>

            </div>

            <div className="bg-white rounded-xl shadow p-6 mt-8">
              <div className="flex items-center gap-3 mb-3">
                <FaChartBar className="text-blue-500 text-xl" />

                <h2 className="text-xl font-semibold text-slate-800">
                  Research Access
                </h2>
              </div>

              <p className="text-gray-500">
                Research data is provided through anonymized datasets
                and aggregated healthcare analytics. Personally
                identifiable patient information is not exposed.
              </p>
            </div>

          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default ResearchDashboard;