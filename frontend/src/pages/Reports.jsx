import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  FaFileMedical,
  FaDownload,
  FaPrint,
  FaSearch,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

function Reports() {
  const [reports, setReports] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // Fetch Reports
  // =====================================================

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/reports"
      );

      setReports(response.data);

    } catch (error) {
      console.error("Reports error:", error);

      setError(
        "Unable to load reports. Please make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // Search
  // =====================================================

  const filteredReports = reports.filter((report) =>
    report.patient_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );


  // =====================================================
  // Delete Report
  // =====================================================

  const handleDelete = async (id) => {

    try {

      await axios.delete(
        `http://127.0.0.1:8000/api/reports/${id}`
      );

      setReports(
        reports.filter(
          (report) => report._id !== id
        )
      );

    } catch (error) {

      console.error("Delete report error:", error);

      setError(
        "Unable to delete the report."
      );
    }
  };


  // =====================================================
  // Download
  // =====================================================

  const handleDownload = (report) => {

    const content = `
HealthForecast AI
Medical Report

Patient: ${report.patient_name}
Report Type: ${report.type}
Status: ${report.status}
Date: ${formatDate(report.created_at)}
`;

    const blob = new Blob(
      [content],
      {
        type: "text/plain",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `${report.patient_name}-${report.type}.txt`;

    link.click();

    URL.revokeObjectURL(url);
  };


  // =====================================================
  // Print
  // =====================================================

  const handlePrint = (report) => {

    const printWindow = window.open(
      "",
      "_blank"
    );

    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
            }

            h1 {
              color: #2563eb;
            }

            .field {
              margin: 15px 0;
            }

            .label {
              font-weight: bold;
            }
          </style>
        </head>

        <body>

          <h1>HealthForecast AI</h1>

          <h2>Medical Report</h2>

          <div class="field">
            <span class="label">Patient:</span>
            ${report.patient_name}
          </div>

          <div class="field">
            <span class="label">Report Type:</span>
            ${report.type}
          </div>

          <div class="field">
            <span class="label">Status:</span>
            ${report.status}
          </div>

          <div class="field">
            <span class="label">Date:</span>
            ${formatDate(report.created_at)}
          </div>

        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.print();
  };


  // =====================================================
  // Date
  // =====================================================

  const formatDate = (date) => {

    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };


  // =====================================================
  // Statistics
  // =====================================================

  const totalReports = reports.length;

  const completedReports = reports.filter(
    (report) =>
      report.status === "Completed"
  ).length;

  const pendingReports = reports.filter(
    (report) =>
      report.status === "Pending"
  ).length;


  return (
    <DashboardLayout>

      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Medical Reports
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage patient reports.
          </p>

        </div>


        <button
          onClick={fetchReports}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <FaPlus />

          Refresh Reports
        </button>

      </div>


      {/* =================================================
          Search
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <div className="relative">

          <FaSearch
            className="absolute left-4 top-4 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search patient..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full border rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>


      {/* =================================================
          Error
      ================================================= */}

      {error && (

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">

          {error}

        </div>

      )}


      {/* =================================================
          Loading
      ================================================= */}

      {loading ? (

        <div className="bg-white rounded-xl shadow p-10 text-center">

          <p className="text-gray-500">
            Loading reports...
          </p>

        </div>

      ) : (

        <>


          {/* =================================================
              Report Table
          ================================================= */}

          <div className="bg-white rounded-xl shadow overflow-x-auto">

            <table className="w-full">

              <thead className="bg-blue-600 text-white">

                <tr>

                  <th className="p-4 text-left">
                    ID
                  </th>

                  <th className="p-4 text-left">
                    Patient
                  </th>

                  <th className="p-4 text-left">
                    Report
                  </th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-center">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredReports.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="p-10 text-center text-gray-500"
                    >

                      <FaFileMedical
                        className="mx-auto text-4xl mb-3 text-gray-300"
                      />

                      No reports found.

                    </td>

                  </tr>

                ) : (

                  filteredReports.map(
                    (report, index) => (

                      <tr
                        key={report._id}
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4">
                          {index + 1}
                        </td>


                        <td className="p-4 font-semibold">
                          {report.patient_name}
                        </td>


                        <td className="p-4">
                          {report.type}
                        </td>


                        <td className="p-4">
                          {formatDate(
                            report.created_at
                          )}
                        </td>


                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold
                            ${
                              report.status ===
                              "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >

                            {report.status}

                          </span>

                        </td>


                        {/* Actions */}

                        <td className="p-4">

                          <div className="flex justify-center gap-4">

                            {/* View */}

                            <button
                              onClick={() =>
                                handlePrint(
                                  report
                                )
                              }
                              title="View Report"
                              className="text-blue-600 hover:text-blue-800"
                            >

                              <FaFileMedical
                                size={18}
                              />

                            </button>


                            {/* Download */}

                            <button
                              onClick={() =>
                                handleDownload(
                                  report
                                )
                              }
                              title="Download"
                              className="text-green-600 hover:text-green-800"
                            >

                              <FaDownload
                                size={18}
                              />

                            </button>


                            {/* Print */}

                            <button
                              onClick={() =>
                                handlePrint(
                                  report
                                )
                              }
                              title="Print"
                              className="text-purple-600 hover:text-purple-800"
                            >

                              <FaPrint
                                size={18}
                              />

                            </button>


                            {/* Delete */}

                            <button
                              onClick={() =>
                                handleDelete(
                                  report._id
                                )
                              }
                              title="Delete"
                              className="text-red-600 hover:text-red-800"
                            >

                              <FaTrash
                                size={18}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* =================================================
              Summary
          ================================================= */}

          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div className="bg-green-50 rounded-xl p-6 shadow">

              <h2 className="text-lg font-semibold">
                Total Reports
              </h2>

              <p className="text-4xl font-bold mt-3">
                {totalReports}
              </p>

            </div>


            <div className="bg-blue-50 rounded-xl p-6 shadow">

              <h2 className="text-lg font-semibold">
                Completed
              </h2>

              <p className="text-4xl font-bold mt-3">
                {completedReports}
              </p>

            </div>


            <div className="bg-yellow-50 rounded-xl p-6 shadow">

              <h2 className="text-lg font-semibold">
                Pending
              </h2>

              <p className="text-4xl font-bold mt-3">
                {pendingReports}
              </p>

            </div>

          </div>

        </>

      )}

    </DashboardLayout>
  );
}

export default Reports;