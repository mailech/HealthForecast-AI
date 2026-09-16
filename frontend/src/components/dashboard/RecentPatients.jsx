import { useEffect, useState } from "react";
import api from "../../api/api";

function RecentPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged-in user
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  const role = user?.role?.toLowerCase();

  // ============================================================
  // RESEARCHER VIEW
  // ============================================================

  if (role === "researcher") {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Research Insights
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Privacy-safe healthcare analytics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-blue-50 rounded-lg p-5">
            <p className="text-sm text-blue-600 font-medium">
              Data Access
            </p>

            <p className="text-lg font-semibold text-slate-900 mt-1">
              Anonymized
            </p>

            <p className="text-xs text-gray-500 mt-1">
              No personally identifiable information
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-5">
            <p className="text-sm text-slate-600 font-medium">
              Research Scope
            </p>

            <p className="text-lg font-semibold text-slate-900 mt-1">
              Aggregated Data
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Population-level healthcare insights
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-5">
            <p className="text-sm text-green-600 font-medium">
              Privacy Status
            </p>

            <p className="text-lg font-semibold text-slate-900 mt-1">
              Protected
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Patient identity is not exposed
            </p>
          </div>

        </div>

      </div>
    );
  }

  // ============================================================
  // FETCH PATIENTS
  // ============================================================

  const fetchRecentPatients = async () => {
    try {
      const response = await api.get("/patients");

      // Show the latest 5 patients
      setPatients(response.data.slice(0, 5));

    } catch (error) {
      console.error(
        "Failed to fetch recent patients:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Researcher must never request patient records.
    if (role !== "researcher") {
      fetchRecentPatients();
    } else {
      setLoading(false);
    }
  }, [role]);

  // ============================================================
  // NORMAL PATIENT VIEW
  // ============================================================

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold">
            Recent Patients
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Latest patient records
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="border-b text-gray-500 text-sm">

              <th className="text-left py-3">
                Name
              </th>

              <th className="text-center">
                Age
              </th>

              <th className="text-center">
                Disease
              </th>

              <th className="text-center">
                Risk
              </th>

              <th className="text-center">
                Status
              </th>

            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500"
                >
                  Loading patients...
                </td>
              </tr>
            )}

            {!loading && patients.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500"
                >
                  No patients found.
                </td>
              </tr>
            )}

            {!loading &&
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b hover:bg-slate-50 transition"
                >

                  <td className="py-4 font-medium">
                    {patient.name}
                  </td>

                  <td className="text-center">
                    {patient.age}
                  </td>

                  <td className="text-center">
                    {patient.disease}
                  </td>

                  <td className="text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        patient.risk === "High"
                          ? "bg-red-100 text-red-600"
                          : patient.risk === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {patient.risk}
                    </span>

                  </td>

                  <td className="text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        patient.status === "Critical"
                          ? "bg-red-100 text-red-600"
                          : patient.status === "Recovered"
                          ? "bg-green-100 text-green-600"
                          : patient.status === "Stable"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {patient.status}
                    </span>

                  </td>

                </tr>
              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default RecentPatients; 