import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

function Analytics() {
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // Fetch patients from MongoDB
  // =====================================================

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/patients"
      );

      setPatients(response.data);
    } catch (error) {
      console.error("Analytics error:", error);

      setError(
        "Unable to load analytics data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // KPI Calculations
  // =====================================================

  const totalPatients = patients.length;

  const highRisk = patients.filter(
    (patient) => patient.risk === "High"
  ).length;

  const mediumRisk = patients.filter(
    (patient) => patient.risk === "Medium"
  ).length;

  const lowRisk = patients.filter(
    (patient) => patient.risk === "Low"
  ).length;

  const readmissions = patients.filter(
    (patient) =>
      patient.status?.toLowerCase() === "readmission" ||
      patient.status?.toLowerCase() === "readmitted"
  ).length;

  const recoveredPatients = patients.filter(
    (patient) =>
      patient.status?.toLowerCase() === "recovered"
  ).length;

  const recoveryRate =
    totalPatients > 0
      ? Math.round(
          (recoveredPatients / totalPatients) * 100
        )
      : 0;

  // =====================================================
  // Risk Distribution
  // =====================================================

  const riskDistribution = useMemo(() => {
    return [
      {
        name: "High",
        value: highRisk,
      },
      {
        name: "Medium",
        value: mediumRisk,
      },
      {
        name: "Low",
        value: lowRisk,
      },
    ];
  }, [highRisk, mediumRisk, lowRisk]);

  // =====================================================
  // Convert MongoDB ObjectId to creation date
  // =====================================================

  const getPatientDate = (patient) => {
    try {
      if (!patient._id) {
        return null;
      }

      // MongoDB ObjectId first 8 characters contain timestamp
      const timestamp = parseInt(
        patient._id.substring(0, 8),
        16
      );

      return new Date(timestamp * 1000);
    } catch {
      return null;
    }
  };

  // =====================================================
  // Monthly Patient Admissions / Records
  // =====================================================

  const monthlyAdmissions = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = new Date().getFullYear();

    const monthCounts = Array(12).fill(0);

    patients.forEach((patient) => {
      const date = getPatientDate(patient);

      if (
        date &&
        date.getFullYear() === currentYear
      ) {
        monthCounts[date.getMonth()]++;
      }
    });

    return months.map((month, index) => ({
      month,
      patients: monthCounts[index],
    }));
  }, [patients]);

  // =====================================================
  // Recovered Patients by Week
  // =====================================================

  const recoveryTrend = useMemo(() => {
    const weeks = [
      {
        week: "W1",
        value: 0,
      },
      {
        week: "W2",
        value: 0,
      },
      {
        week: "W3",
        value: 0,
      },
      {
        week: "W4",
        value: 0,
      },
    ];

    const now = new Date();

    patients.forEach((patient) => {
      if (
        patient.status?.toLowerCase() !==
        "recovered"
      ) {
        return;
      }

      const date = getPatientDate(patient);

      if (!date) {
        return;
      }

      const difference =
        Math.floor(
          (now - date) /
            (1000 * 60 * 60 * 24)
        );

      if (difference >= 0 && difference < 28) {
        const weekIndex =
          Math.floor(difference / 7);

        if (weekIndex < 4) {
          weeks[3 - weekIndex].value++;
        }
      }
    });

    return weeks;
  }, [patients]);

  // =====================================================
  // Insights
  // =====================================================

  const highRiskPercentage =
    totalPatients > 0
      ? Math.round(
          (highRisk / totalPatients) * 100
        )
      : 0;

  const readmissionRate =
    totalPatients > 0
      ? Math.round(
          (readmissions / totalPatients) * 100
        )
      : 0;

  return (
    <DashboardLayout>

      {/* =================================================
          Header
      ================================================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Healthcare Analytics
        </h1>

        <p className="text-gray-500 mt-1">
          Real-time insights based on patient records.
        </p>

      </div>


      {/* =================================================
          Loading
      ================================================= */}

      {loading && (
        <div className="bg-white rounded-xl shadow p-10 text-center">

          <p className="text-gray-500">
            Loading analytics...
          </p>

        </div>
      )}


      {/* =================================================
          Error
      ================================================= */}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">

          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={fetchPatients}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
          >
            Try Again
          </button>

        </div>
      )}


      {!loading && !error && (
        <>

          {/* =================================================
              KPI Cards
          ================================================= */}

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

            {/* Total */}

            <div className="bg-white shadow rounded-xl p-6">

              <h3 className="text-gray-500">
                Total Patients
              </h3>

              <p className="text-3xl font-bold mt-2">
                {totalPatients}
              </p>

            </div>


            {/* Readmissions */}

            <div className="bg-white shadow rounded-xl p-6">

              <h3 className="text-gray-500">
                Readmissions
              </h3>

              <p className="text-3xl font-bold mt-2 text-red-600">
                {readmissions}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                {readmissionRate}% of patients
              </p>

            </div>


            {/* Recovery */}

            <div className="bg-white shadow rounded-xl p-6">

              <h3 className="text-gray-500">
                Recovery Rate
              </h3>

              <p className="text-3xl font-bold mt-2 text-green-600">
                {recoveryRate}%
              </p>

              <p className="text-sm text-gray-400 mt-1">
                {recoveredPatients} recovered
              </p>

            </div>


            {/* High Risk */}

            <div className="bg-white shadow rounded-xl p-6">

              <h3 className="text-gray-500">
                High Risk
              </h3>

              <p className="text-3xl font-bold mt-2 text-orange-600">
                {highRisk}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                {highRiskPercentage}% of patients
              </p>

            </div>

          </div>


          {/* =================================================
              Charts
          ================================================= */}

          <div className="grid lg:grid-cols-2 gap-8 mt-8">


            {/* Monthly Admissions */}

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-bold mb-2">
                Monthly Patient Records
              </h2>

              <p className="text-sm text-gray-400 mb-5">
                Based on patient record creation dates.
              </p>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={monthlyAdmissions}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="month" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="patients"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/* Risk Distribution */}

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-bold mb-2">
                Risk Distribution
              </h2>

              <p className="text-sm text-gray-400 mb-5">
                Current patient risk levels.
              </p>

              {totalPatients > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={riskDistribution}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label
                    >

                      {riskDistribution.map(
                        (item, index) => (

                          <Cell
                            key={item.name}
                            fill={COLORS[index]}
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              ) : (

                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No patient data available
                </div>

              )}

            </div>

          </div>


          {/* =================================================
              Recovery Trend
          ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h2 className="text-xl font-bold mb-2">
              Recent Recovery Trend
            </h2>

            <p className="text-sm text-gray-400 mb-5">
              Number of patients marked as recovered
              during the recent weeks.
            </p>

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <LineChart
                data={recoveryTrend}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="week" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>


          {/* =================================================
              Real Summary Insights
          ================================================= */}

          <div className="bg-blue-50 rounded-xl p-6 mt-8">

            <h2 className="text-xl font-bold text-blue-700 mb-4">
              Summary Insights
            </h2>

            {totalPatients === 0 ? (

              <p className="text-gray-700">
                No patient records are currently available
                to generate insights.
              </p>

            ) : (

              <ul className="list-disc pl-6 space-y-2 text-gray-700">

                <li>
                  The system currently contains{" "}
                  <strong>
                    {totalPatients}
                  </strong>{" "}
                  patient records.
                </li>

                <li>
                  <strong>
                    {highRisk}
                  </strong>{" "}
                  patients are currently classified
                  as high risk.
                </li>

                <li>
                  <strong>
                    {mediumRisk}
                  </strong>{" "}
                  patients are classified as medium
                  risk.
                </li>

                <li>
                  <strong>
                    {lowRisk}
                  </strong>{" "}
                  patients are classified as low risk.
                </li>

                <li>
                  Current recovery rate is{" "}
                  <strong>
                    {recoveryRate}%
                  </strong>.
                </li>

                <li>
                  There are{" "}
                  <strong>
                    {readmissions}
                  </strong>{" "}
                  recorded readmission cases.
                </li>

              </ul>

            )}

          </div>

        </>
      )}

    </DashboardLayout>
  );
}

export default Analytics;