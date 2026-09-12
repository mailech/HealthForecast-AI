import { useEffect, useState } from "react";
import {
  FaDownload,
  FaFilePdf,
  FaSearch,
  FaUserInjured,
  FaHeartbeat,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function ExportAnalytics() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/analytics/hospital/export"
        );

        setPatients(response.data.records || []);
      } catch (err) {
        console.error("Error loading hospital analytics:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load hospital analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);


  const downloadPatientReport = async (patientId, patientName) => {
    try {
      setDownloading(patientId);
      setError("");

      const response = await api.get(
        `/api/analytics/patient/${patientId}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `patient_${patientName || patientId}_report.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to download patient report."
      );
    } finally {
      setDownloading("");
    }
  };
  const filteredPatients = patients.filter((patient) => {
    const searchText = search.toLowerCase();

    return (
      String(patient.patient_id || "")
        .toLowerCase()
        .includes(searchText) ||
      String(patient.patient_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(patient.disease || "")
        .toLowerCase()
        .includes(searchText) ||
      String(patient.risk || "")
        .toLowerCase()
        .includes(searchText) ||
      String(patient.status || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  // =========================================================
  // EXPORT ALL ANALYTICS
  // =========================================================

  const exportAllAnalytics = () => {
    if (!patients.length) {
      setError("No hospital analytics data available to export.");
      return;
    }

    const headers = [
      "Patient ID",
      "Patient Name",
      "Age",
      "Disease",
      "Risk",
      "Status",
      "Diagnosis",
      "Medicines",
      "Doctor Recommendations",
      "Follow-up Date",
      "Doctor Name",
      "Treatment Updated At",
    ];

    const rows = patients.map((patient) => [
      patient.patient_id || "",
      patient.patient_name || "",
      patient.patient_age || "",
      patient.disease || "",
      patient.risk || "",
      patient.status || "",
      patient.diagnosis || "",
      patient.medicines || "",
      patient.doctor_recommendations || "",
      patient.follow_up_date || "",
      patient.doctor_name || "",
      patient.treatment_updated_at || "",
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "hospital_analytics_report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  // =========================================================
  // RISK BADGE
  // =========================================================

  const getRiskClass = (risk) => {
    switch (String(risk || "").toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-700";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";

      case "LOW":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Export Hospital Analytics
            </h1>

            <p className="text-gray-500 mt-2">
              View hospital-wide patient analytics and download
              patient health reports.
            </p>
          </div>

          <button
            type="button"
            onClick={exportAllAnalytics}
            disabled={loading || patients.length === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-medium transition"
          >
            <FaDownload />
            Export All Analytics
          </button>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    Total Patients
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">
                    {patients.length}
                  </h2>
                </div>

                <FaUserInjured className="text-blue-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    High Risk Patients
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">
                    {
                      patients.filter(
                        (patient) =>
                          String(patient.risk).toUpperCase() ===
                          "HIGH"
                      ).length
                    }
                  </h2>
                </div>

                <FaHeartbeat className="text-red-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    Reports Available
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">
                    {patients.length}
                  </h2>
                </div>

                <FaFilePdf className="text-purple-500 text-3xl" />
              </div>
            </div>

          </div>
        )}

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <div className="relative">

            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by patient name, ID, disease, risk or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* =====================================================
            PATIENT TABLE
        ===================================================== */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="p-6 border-b">

            <h2 className="text-xl font-semibold text-slate-800">
              Hospital Patient Reports
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              {filteredPatients.length} patient
              {filteredPatients.length !== 1 ? "s" : ""} found
            </p>

          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading hospital patient analytics...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No patients found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                      Patient
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                      Age
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                      Disease
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                      Risk
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="text-center px-5 py-4 text-sm font-semibold text-slate-600">
                      Report
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredPatients.map((patient, index) => (

                    <tr
                      key={
                        patient.patient_id ||
                        `patient-${index}`
                      }
                      className="border-t hover:bg-slate-50"
                    >

                      {/* PATIENT */}

                      <td className="px-5 py-4">

                        <div className="font-medium text-slate-800">
                          {patient.patient_name ||
                            "Unknown Patient"}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          ID: {patient.patient_id || "N/A"}
                        </div>

                      </td>

                      {/* AGE */}

                      <td className="px-5 py-4 text-gray-700">
                        {patient.patient_age || "N/A"}
                      </td>

                      {/* DISEASE */}

                      <td className="px-5 py-4 text-gray-700">
                        {patient.disease || "N/A"}
                      </td>

                      {/* RISK */}

                      <td className="px-5 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskClass(
                            patient.risk
                          )}`}
                        >
                          {patient.risk || "UNKNOWN"}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4 text-gray-700">
                        {patient.status || "Unknown"}
                      </td>

                      {/* PDF */}

                      <td className="px-5 py-4 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            downloadPatientReport(
                              patient.patient_id,
                              patient.patient_name
                            )
                          }
                          disabled={
                            downloading === patient.patient_id
                          }
                          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >

                          <FaFilePdf />

                          {downloading === patient.patient_id
                            ? "Downloading..."
                            : "Download Report"}

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}

export default ExportAnalytics;