import { useEffect, useState } from "react";
import { FaHospital, FaUserInjured, FaHeartbeat, FaChartBar } from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function HospitalDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/api/analytics/hospital");
        setAnalytics(response.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
          "Unable to load hospital analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Hospital Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Monitor hospital performance, patient outcomes and healthcare analytics.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">
            Loading hospital analytics...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Total Patients
                    </p>
                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {analytics?.total_patients ?? 0}
                    </h2>
                  </div>

                  <FaUserInjured className="text-blue-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      High Risk
                    </p>
                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {analytics?.high_risk ?? 0}
                    </h2>
                  </div>

                  <FaHeartbeat className="text-red-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Medium Risk
                    </p>
                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {analytics?.medium_risk ?? 0}
                    </h2>
                  </div>

                  <FaHeartbeat className="text-yellow-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Low Risk
                    </p>
                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {analytics?.low_risk ?? 0}
                    </h2>
                  </div>

                  <FaChartBar className="text-green-500 text-3xl" />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-5">
                  Patient Risk Distribution
                </h2>

                <div className="space-y-4">

                  <div className="flex justify-between">
                    <span>High Risk</span>
                    <strong>
                      {analytics?.high_risk ?? 0}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Medium Risk</span>
                    <strong>
                      {analytics?.medium_risk ?? 0}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Low Risk</span>
                    <strong>
                      {analytics?.low_risk ?? 0}
                    </strong>
                  </div>

                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-5">
                  Patient Status
                </h2>

                {Object.entries(
                  analytics?.status_distribution || {}
                ).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between py-2 border-b"
                  >
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>
                ))}

                {Object.keys(
                  analytics?.status_distribution || {}
                ).length === 0 && (
                  <p className="text-gray-500">
                    No status data available.
                  </p>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default HospitalDashboard;