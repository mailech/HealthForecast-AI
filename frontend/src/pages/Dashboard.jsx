import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";
import PatientTable from "../components/PatientTable";
import ChartCard from "../components/ChartCard";

import {
  FaUserInjured,
  FaHeartbeat,
  FaHospital,
  FaSmile,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const icons = [
  <FaUserInjured />,
  <FaHeartbeat />,
  <FaHospital />,
  <FaSmile />,
];

const colors = [
  "bg-blue-100 text-blue-600",
  "bg-red-100 text-red-600",
  "bg-orange-100 text-orange-600",
  "bg-green-100 text-green-600",
];

// Temporary chart data.
// Later we can make this dynamic using admissionDate.
const lineData = [
  { month: "Jan", patients: 40 },
  { month: "Feb", patients: 55 },
  { month: "Mar", patients: 60 },
  { month: "Apr", patients: 75 },
  { month: "May", patients: 90 },
  { month: "Jun", patients: 120 },
];

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

function Dashboard() {

  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // Fetch Patients
  // =========================

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

      console.error("Error fetching patients:", error);

      setError(
        "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // Dynamic Statistics
  // =========================

  const totalPatients = patients.length;

  const highRisk = patients.filter(
    (patient) => patient.risk === "High"
  ).length;

  const readmissions = patients.filter(
    (patient) => patient.status === "Readmission"
  ).length;

  const recovered = patients.filter(
    (patient) => patient.status === "Recovered"
  ).length;


  const recoveryRate =
    totalPatients > 0
      ? Math.round(
          (recovered / totalPatients) * 100
        )
      : 0;


  // =========================
  // Dashboard Cards
  // =========================

  const dashboardStats = [
    {
      id: 1,
      title: "Total Patients",
      value: totalPatients,
    },
    {
      id: 2,
      title: "High Risk",
      value: highRisk,
    },
    {
      id: 3,
      title: "Readmissions",
      value: readmissions,
    },
    {
      id: 4,
      title: "Recovery Rate",
      value: `${recoveryRate}%`,
    },
  ];


  // =========================
  // Risk Distribution
  // =========================

  const riskData = [
    {
      name: "High",
      value: highRisk,
    },
    {
      name: "Medium",
      value: patients.filter(
        (patient) => patient.risk === "Medium"
      ).length,
    },
    {
      name: "Low",
      value: patients.filter(
        (patient) => patient.risk === "Low"
      ).length,
    },
  ];


  // =========================
  // Recent Patients
  // =========================

  const recentPatients = [...patients]
    .reverse()
    .slice(0, 5);


  return (

    <DashboardLayout>

      {/* =========================
          Header
      ========================= */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Doctor Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome back 👋
          </p>

        </div>

      </div>


      {/* =========================
          Loading
      ========================= */}

      {loading && (

        <div className="bg-white rounded-xl shadow p-6 mb-8 text-center">

          <p className="text-gray-500">
            Loading dashboard...
          </p>

        </div>

      )}


      {/* =========================
          Error
      ========================= */}

      {!loading && error && (

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">

          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={fetchPatients}
            className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            Try Again
          </button>

        </div>

      )}


      {!loading && !error && (

        <>

          {/* =========================
              Cards
          ========================= */}

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

            {dashboardStats.map(
              (item, index) => (

                <DashboardCard
                  key={item.id}
                  title={item.title}
                  value={item.value}
                  icon={icons[index]}
                  color={colors[index]}
                />

              )
            )}

          </div>


          {/* =========================
              Charts
          ========================= */}

          <div className="grid lg:grid-cols-2 gap-8 mt-10">


            {/* Monthly Admissions */}

            <ChartCard title="Monthly Admissions">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <LineChart data={lineData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>

            </ChartCard>


            {/* Risk Distribution */}

            <ChartCard title="Risk Distribution">

              {totalPatients > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={riskData}
                      dataKey="value"
                      outerRadius={100}
                      label
                    >

                      {riskData.map(
                        (entry, index) => (

                          <Cell
                            key={entry.name}
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

            </ChartCard>

          </div>


          {/* =========================
              Recent Patients
          ========================= */}

          <div className="mt-10">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold">
                Recent Patients
              </h2>

              <span className="text-gray-500 text-sm">
                Showing latest {recentPatients.length}
              </span>

            </div>

            {recentPatients.length > 0 ? (

              <PatientTable
                patients={recentPatients}
              />

            ) : (

              <div className="bg-white rounded-xl shadow p-10 text-center">

                <p className="text-gray-500">
                  No patients available.
                </p>

              </div>

            )}

          </div>


          {/* =========================
              Alerts
          ========================= */}

          <div className="grid lg:grid-cols-3 gap-6 mt-10">


            {/* High Risk */}

            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-5">

              <h2 className="font-bold text-red-700">
                High Risk Alert
              </h2>

              <p className="mt-2 text-gray-600">

                {highRisk === 0
                  ? "No high-risk patients currently."
                  : `${highRisk} ${
                      highRisk === 1
                        ? "patient requires"
                        : "patients require"
                    } immediate follow-up.`}

              </p>

            </div>


            {/* Readmissions */}

            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-5">

              <h2 className="font-bold text-yellow-700">
                Readmissions
              </h2>

              <p className="mt-2 text-gray-600">

                {readmissions === 0
                  ? "No readmissions recorded."
                  : `${readmissions} ${
                      readmissions === 1
                        ? "readmission"
                        : "readmissions"
                    } recorded.`}

              </p>

            </div>


            {/* Recovery */}

            <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5">

              <h2 className="font-bold text-green-700">
                Recovery Rate
              </h2>

              <p className="mt-2 text-gray-600">

                Current recovery rate is{" "}
                <strong>
                  {recoveryRate}%
                </strong>

              </p>

            </div>

          </div>

        </>

      )}

    </DashboardLayout>
  );
}

export default Dashboard;