import { useEffect, useState } from "react";
import api from "../../api/api";

function RecentPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchRecentPatients();
  }, []);

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