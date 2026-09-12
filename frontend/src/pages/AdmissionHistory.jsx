import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/api";

import {
  ClipboardList,
  Calendar,
  User,
  Activity,
} from "lucide-react";

function AdmissionHistory() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role || "patient";

  // ==========================================================
  // FETCH ADMISSION HISTORY
  // ==========================================================

  const fetchAdmissionHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      const patientData = response.data || [];

      // Only patients with admission dates
      const admissions = patientData.filter(
        (patient) =>
          patient.admission_date
      );

      setPatients(admissions);
    } catch (err) {
      console.error(
        "Failed to load admission history:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load admission history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissionHistory();
  }, []);

  return (
    <MainLayout>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">

            <ClipboardList
              size={26}
              className="text-blue-600 dark:text-blue-400"
            />

          </div>

          <div>

            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Admission History
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View patient admission records and history
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          ROLE INFO
      ====================================================== */}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-5 py-3 mb-6">

        <p className="text-sm text-blue-700 dark:text-blue-300">

          Logged in as{" "}

          <span className="font-semibold">
            {role.charAt(0).toUpperCase() +
              role.slice(1)}
          </span>

          {role === "patient"
            ? " — Showing your admission history."
            : " — Showing available patient admission records."}

        </p>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">

              <ClipboardList
                size={21}
                className="text-blue-600 dark:text-blue-400"
              />

            </div>

            <div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Admissions
              </p>

              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? "..." : patients.length}
              </h2>

            </div>

          </div>

        </div>


        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">

              <Activity
                size={21}
                className="text-green-600 dark:text-green-400"
              />

            </div>

            <div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recovered
              </p>

              <h2 className="text-2xl font-bold text-green-600">
                {loading
                  ? "..."
                  : patients.filter(
                      (p) =>
                        p.status ===
                        "Recovered"
                    ).length}
              </h2>

            </div>

          </div>

        </div>


        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">

              <User
                size={21}
                className="text-red-600 dark:text-red-400"
              />

            </div>

            <div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                High Risk
              </p>

              <h2 className="text-2xl font-bold text-red-600">
                {loading
                  ? "..."
                  : patients.filter(
                      (p) =>
                        p.risk === "High"
                    ).length}
              </h2>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-5 py-4">
          {error}
        </div>

      )}


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">

          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Admission Records
          </h2>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="bg-slate-50 dark:bg-slate-700">

              <tr>

                <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Patient
                </th>

                <th className="text-center p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Admission Date
                </th>

                <th className="text-center p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Disease
                </th>

                <th className="text-center p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Risk
                </th>

                <th className="text-center p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {loading && (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    Loading admission history...
                  </td>

                </tr>

              )}


              {!loading &&
                !error &&
                patients.length === 0 && (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-12 text-gray-500 dark:text-gray-400"
                    >
                      No admission records found.
                    </td>

                  </tr>

                )}


              {!loading &&
                patients.map((patient) => (

                  <tr
                    key={patient.id}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">

                          {patient.name
                            ?.charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <p className="font-medium text-slate-800 dark:text-white">
                            {patient.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            Patient #{patient.id}
                          </p>

                        </div>

                      </div>

                    </td>


                    <td className="text-center text-gray-600 dark:text-gray-300">

                      <div className="flex items-center justify-center gap-2">

                        <Calendar
                          size={16}
                          className="text-blue-500"
                        />

                        {patient.admission_date}

                      </div>

                    </td>


                    <td className="text-center text-gray-600 dark:text-gray-300">
                      {patient.disease}
                    </td>


                    <td className="text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          patient.status ===
                          "Critical"
                            ? "bg-red-100 text-red-600"
                            : patient.status ===
                              "Recovered"
                            ? "bg-green-100 text-green-600"
                            : patient.status ===
                              "Stable"
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

    </MainLayout>
  );
}

export default AdmissionHistory;