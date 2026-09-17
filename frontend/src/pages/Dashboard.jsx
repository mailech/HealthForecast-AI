import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  AlertTriangle,
  BrainCircuit,
  Activity,
  RefreshCw,
  CalendarDays,
  UserPlus,
  Stethoscope,
  FileText,
  Bell,
  ArrowRight,
  Search,
  X,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../api/api";


function Dashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [research, setResearch] = useState(null);
  const [optimization, setOptimization] = useState(null);

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const doctorName =
    user?.name ||
    user?.full_name ||
    user?.username ||
    "Doctor";


  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setRefreshing(true);

      const results = await Promise.allSettled([
        api.get("/patients/"),
        api.get("/notifications/"),
        api.get("/research/summary"),
        api.get("/optimization/"),
      ]);

      if (results[0].status === "fulfilled") {
        setPatients(results[0].value.data || []);
      }

      if (results[1].status === "fulfilled") {
        setNotifications(results[1].value.data || []);
      }

      if (results[2].status === "fulfilled") {
        setResearch(results[2].value.data || null);
      }

      if (results[3].status === "fulfilled") {
        setOptimization(
          results[3].value.data || null
        );
      }
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  // Get risk
  const getRisk = (patient) => {
    const value = String(
      patient?.risk_level ||
      patient?.risk ||
      patient?.status ||
      ""
    ).toLowerCase();

    if (value.includes("high")) {
      return "High";
    }

    if (value.includes("medium")) {
      return "Medium";
    }

    return "Low";
  };


  const highRisk = useMemo(() => {
    return patients.filter(
      (patient) =>
        getRisk(patient) === "High"
    );
  }, [patients]);


  const mediumRisk = useMemo(() => {
    return patients.filter(
      (patient) =>
        getRisk(patient) === "Medium"
    );
  }, [patients]);


  const lowRisk = useMemo(() => {
    return patients.filter(
      (patient) =>
        getRisk(patient) === "Low"
    );
  }, [patients]);


  /*
    SEARCH RESULTS

    Searches:
    - Patient name
    - Patient ID
    - Condition
    - Diagnosis
    - Disease
  */

  const searchResults = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return [];
    }

    return patients.filter((patient) => {
      const name =
        patient?.name ||
        patient?.full_name ||
        "";

      const id =
        patient?.id ||
        "";

      const condition =
        patient?.condition ||
        patient?.diagnosis ||
        patient?.disease ||
        "";

      return (
        String(name)
          .toLowerCase()
          .includes(value) ||

        String(id)
          .toLowerCase()
          .includes(value) ||

        String(condition)
          .toLowerCase()
          .includes(value)
      );
    });
  }, [patients, search]);


  // Chart
  const riskData = [
    {
      name: "High Risk",
      patients: highRisk.length,
    },
    {
      name: "Medium",
      patients: mediumRisk.length,
    },
    {
      name: "Low Risk",
      patients: lowRisk.length,
    },
  ];


  const totalPredictions =
    research?.total_predictions ||
    research?.predictions ||
    0;


  // Recovery rate
  const recoveryRate =
    patients.length > 0
      ? Math.round(
          (
            patients.filter((patient) => {
              const status = String(
                patient?.status || ""
              ).toLowerCase();

              return (
                status.includes("recover") ||
                status.includes("stable")
              );
            }).length / patients.length
          ) * 100
        )
      : 0;


  // Show searched patients in table
  const recentPatients = search.trim()
    ? searchResults.slice(0, 5)
    : patients.slice(0, 5);


  // Open patient page
  const openPatients = () => {
    setShowResults(false);
    navigate("/patients");
  };


  return (
    <div
      className="min-h-screen bg-[#eaf0f6] text-[#10233f]"
      onClick={() => setShowResults(false)}
    >

      {/* HEADER */}

      <div className="mb-5 overflow-hidden rounded-2xl bg-[#102a43] shadow-lg">

        <div className="px-6 py-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-blue-200">
                Healthcare Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-semibold text-white">
                Good Morning, {doctorName}
              </h1>

              <p className="mt-1 text-sm text-blue-100">
                Manage patients, predictions and clinical insights.
              </p>

            </div>


            <div className="flex items-center gap-2">

              {/* SEARCH */}

              <div
                className="relative hidden md:block"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                    setShowResults(true);
                  }}
                  onFocus={() =>
                    setShowResults(true)
                  }
                  placeholder="Search patient..."
                  className="w-56 rounded-lg border border-[#31506b] bg-[#173957] py-2 pl-9 pr-9 text-sm text-white placeholder-blue-200 outline-none focus:border-blue-300"
                />


                {/* CLEAR SEARCH */}

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setShowResults(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}


                {/* SEARCH RESULTS */}

                {showResults &&
                  search.trim() && (
                    <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                      <div className="border-b border-slate-100 px-4 py-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Search Results
                        </p>

                      </div>


                      {searchResults.length > 0 ? (

                        <div className="max-h-72 overflow-y-auto">

                          {searchResults
                            .slice(0, 6)
                            .map(
                              (
                                patient,
                                index
                              ) => (

                                <button
                                  key={
                                    patient.id ||
                                    index
                                  }
                                  type="button"
                                  onClick={() =>
                                    openPatients()
                                  }
                                  className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-[#edf3f8]"
                                >

                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dce7f1] text-[#173957]">
                                    <Users
                                      size={17}
                                    />
                                  </div>


                                  <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-semibold text-[#102a43]">

                                      {patient.name ||
                                        patient.full_name ||
                                        `Patient ${
                                          patient.id ||
                                          index +
                                            1
                                        }`}

                                    </p>

                                    <p className="truncate text-xs text-slate-500">

                                      P-
                                      {patient.id ||
                                        index +
                                          1}

                                      {" • "}

                                      {patient.condition ||
                                        patient.diagnosis ||
                                        patient.disease ||
                                        "No condition"}

                                    </p>

                                  </div>


                                  <ArrowRight
                                    size={15}
                                    className="text-[#24557d]"
                                  />

                                </button>

                              )
                            )}

                        </div>

                      ) : (

                        <div className="px-4 py-6 text-center">

                          <Search
                            size={22}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-2 text-sm font-medium text-slate-600">
                            No patient found
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Try another name, ID or condition.
                          </p>

                        </div>

                      )}


                      {searchResults.length > 6 && (

                        <button
                          type="button"
                          onClick={openPatients}
                          className="w-full border-t border-slate-100 bg-[#f7f9fb] px-4 py-3 text-center text-xs font-semibold text-[#24557d] hover:bg-[#edf3f8]"
                        >
                          View all matching patients
                        </button>

                      )}

                    </div>
                  )}

              </div>


              {/* DATE */}

              <div className="hidden items-center gap-2 rounded-lg bg-[#173957] px-3 py-2 text-sm text-blue-100 lg:flex">

                <CalendarDays size={16} />

                {new Date().toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}

              </div>


              {/* REFRESH */}

              <button
                type="button"
                onClick={loadDashboard}
                className="flex items-center gap-2 rounded-lg bg-[#dbeafe] px-3 py-2 text-sm font-medium text-[#12365a] transition hover:bg-white"
              >

                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </div>


          {/* MOBILE SEARCH */}

          <div
            className="relative mt-4 md:hidden"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
                setShowResults(true);
              }}
              onFocus={() =>
                setShowResults(true)
              }
              placeholder="Search patient..."
              className="w-full rounded-lg border border-[#31506b] bg-[#173957] py-2 pl-9 pr-3 text-sm text-white placeholder-blue-200 outline-none"
            />


            {showResults &&
              search.trim() && (
                <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl bg-white shadow-xl">

                  {searchResults.length > 0 ? (

                    searchResults
                      .slice(0, 5)
                      .map(
                        (
                          patient,
                          index
                        ) => (

                          <button
                            key={
                              patient.id ||
                              index
                            }
                            type="button"
                            onClick={
                              openPatients
                            }
                            className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-[#edf3f8]"
                          >

                            <Users
                              size={17}
                              className="text-[#24557d]"
                            />

                            <div>

                              <p className="text-sm font-semibold text-[#102a43]">
                                {patient.name ||
                                  patient.full_name ||
                                  `Patient ${
                                    patient.id ||
                                    index +
                                      1
                                  }`}
                              </p>

                              <p className="text-xs text-slate-500">
                                P-
                                {patient.id ||
                                  index +
                                    1}
                              </p>

                            </div>

                          </button>

                        )
                      )

                  ) : (

                    <p className="px-4 py-5 text-center text-sm text-slate-500">
                      No patient found.
                    </p>

                  )}

                </div>
              )}

          </div>


          {/* STATISTICS */}

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <StatCard
              title="Total Patients"
              value={patients.length}
              icon={<Users size={19} />}
              shade="bg-[#173957]"
            />

            <StatCard
              title="High Risk"
              value={highRisk.length}
              icon={
                <AlertTriangle size={19} />
              }
              shade="bg-[#1d4568]"
            />

            <StatCard
              title="Predictions"
              value={totalPredictions}
              icon={
                <BrainCircuit size={19} />
              }
              shade="bg-[#235278]"
            />

            <StatCard
              title="Recovery Rate"
              value={`${recoveryRate}%`}
              icon={<Activity size={19} />}
              shade="bg-[#286086]"
            />

          </div>

        </div>

      </div>


      {/* CHART + INSIGHTS */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* CHART */}

        <div className="rounded-2xl border border-[#d4dee9] bg-white shadow-sm lg:col-span-2">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>

              <h2 className="font-semibold text-[#102a43]">
                Patient Risk Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current distribution of patient risk
              </p>

            </div>

            <span className="rounded-full bg-[#e6eef7] px-3 py-1 text-xs font-medium text-[#24557d]">
              Live Data
            </span>

          </div>


          <div className="h-[270px] px-3 pb-3 pt-2">

            {loading ? (

              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Loading...
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={riskData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -15,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#dce5ee"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#52677d",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#52677d",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: "#eef4f9",
                    }}
                    contentStyle={{
                      borderRadius: "10px",
                      border:
                        "1px solid #d6e0ea",
                    }}
                  />

                  <Bar
                    dataKey="patients"
                    fill="#24557d"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    maxBarSize={65}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* AI INSIGHTS */}

        <div className="rounded-2xl bg-[#173957] p-5 text-white shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-semibold">
                AI Clinical Insights
              </h2>

              <p className="mt-1 text-xs text-blue-200">
                Current patient overview
              </p>

            </div>

            <BrainCircuit
              size={22}
              className="text-blue-200"
            />

          </div>


          <div className="mt-4 space-y-2">

            <Insight
              title="High-risk patients"
              value={highRisk.length}
              text="Need closer monitoring"
            />

            <Insight
              title="Total patients"
              value={patients.length}
              text="Patient records available"
            />

            <Insight
              title="Predictions"
              value={totalPredictions}
              text="AI assessments generated"
            />

            <Insight
              title="Recovery"
              value={`${recoveryRate}%`}
              text="Current estimated recovery"
            />

          </div>

        </div>

      </div>


      {/* HIGH RISK + QUICK ACTIONS */}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* HIGH RISK */}

        <div className="overflow-hidden rounded-2xl border border-[#d4dee9] bg-white shadow-sm lg:col-span-2">

          <div className="flex items-center justify-between bg-[#edf3f8] px-5 py-4">

            <div>

              <h2 className="font-semibold text-[#102a43]">
                High-Risk Patients
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Patients requiring attention
              </p>

            </div>

            <span className="rounded-full bg-[#173957] px-3 py-1 text-xs font-medium text-white">
              {highRisk.length}
            </span>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-[#f7f9fb] text-xs text-slate-500">

                <tr>

                  <th className="px-5 py-3">
                    Patient
                  </th>

                  <th className="px-5 py-3">
                    Condition
                  </th>

                  <th className="px-5 py-3">
                    Risk
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {highRisk
                  .slice(0, 5)
                  .map(
                    (patient, index) => (

                      <tr
                        key={
                          patient.id ||
                          index
                        }
                        onClick={() =>
                          navigate(
                            "/patients"
                          )
                        }
                        className="cursor-pointer border-t border-slate-100 hover:bg-[#f6f9fc]"
                      >

                        <td className="px-5 py-3">

                          <p className="font-medium text-[#203b56]">
                            {patient.name ||
                              patient.full_name ||
                              `Patient ${
                                patient.id ||
                                index +
                                  1
                              }`}
                          </p>

                          <p className="text-xs text-slate-400">
                            P-
                            {patient.id ||
                              index + 1}
                          </p>

                        </td>


                        <td className="px-5 py-3 text-slate-600">
                          {patient.condition ||
                            patient.diagnosis ||
                            patient.disease ||
                            "—"}
                        </td>


                        <td className="px-5 py-3">

                          <span className="rounded-full bg-[#dce9f4] px-2.5 py-1 text-xs font-semibold text-[#173957]">
                            High
                          </span>

                        </td>


                        <td className="px-5 py-3 text-slate-600">
                          {patient.status ||
                            "Active"}
                        </td>

                      </tr>

                    )
                  )}


                {highRisk.length === 0 && (

                  <tr>

                    <td
                      colSpan="4"
                      className="px-5 py-8 text-center text-sm text-slate-400"
                    >
                      No high-risk patients found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div className="rounded-2xl bg-[#12365a] p-5 text-white shadow-sm">

          <h2 className="font-semibold">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-blue-200">
            Frequently used options
          </p>


          <div className="mt-4 space-y-2">

            <Action
              icon={<UserPlus size={18} />}
              title="Add Patient"
              text="Create a patient record"
              onClick={() =>
                navigate("/patients")
              }
            />

            <Action
              icon={
                <BrainCircuit size={18} />
              }
              title="Run Prediction"
              text="Check readmission risk"
              onClick={() =>
                navigate("/prediction")
              }
            />

            <Action
              icon={<FileText size={18} />}
              title="View Reports"
              text="Open healthcare reports"
              onClick={() =>
                navigate("/reports")
              }
            />

            <Action
              icon={
                <Stethoscope size={18} />
              }
              title="Clinical Support"
              text="View AI recommendations"
              onClick={() =>
                navigate(
                  "/clinical-analytics"
                )
              }
            />

          </div>

        </div>

      </div>


      {/* RECENT PATIENTS */}

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#d4dee9] bg-white shadow-sm">

        <div className="flex items-center justify-between bg-[#edf3f8] px-5 py-4">

          <div>

            <h2 className="font-semibold text-[#102a43]">
              {search.trim()
                ? "Search Results"
                : "Recent Patients"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">

              {search.trim()
                ? `${searchResults.length} patient(s) found`
                : "Latest patient records"}

            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate("/patients")
            }
            className="flex items-center gap-1 text-sm font-medium text-[#24557d] hover:text-[#102a43]"
          >

            View All

            <ArrowRight size={16} />

          </button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-[#f7f9fb] text-xs text-slate-500">

              <tr>

                <th className="px-5 py-3">
                  ID
                </th>

                <th className="px-5 py-3">
                  Patient
                </th>

                <th className="px-5 py-3">
                  Condition
                </th>

                <th className="px-5 py-3">
                  Risk
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {recentPatients.map(
                (patient, index) => {

                  const risk =
                    getRisk(patient);

                  return (

                    <tr
                      key={
                        patient.id ||
                        index
                      }
                      onClick={() =>
                        navigate(
                          "/patients"
                        )
                      }
                      className="cursor-pointer border-t border-slate-100 hover:bg-[#f6f9fc]"
                    >

                      <td className="px-5 py-3 font-medium text-[#24557d]">
                        P-
                        {patient.id ||
                          index + 1}
                      </td>

                      <td className="px-5 py-3 font-medium text-slate-700">
                        {patient.name ||
                          patient.full_name ||
                          "Unknown Patient"}
                      </td>

                      <td className="px-5 py-3 text-slate-500">
                        {patient.condition ||
                          patient.diagnosis ||
                          patient.disease ||
                          "—"}
                      </td>

                      <td className="px-5 py-3">

                        <span className="rounded-full bg-[#e8eef4] px-2.5 py-1 text-xs font-medium text-[#36546d]">
                          {risk}
                        </span>

                      </td>

                      <td className="px-5 py-3 text-slate-500">
                        {patient.status ||
                          "Active"}
                      </td>

                    </tr>

                  );
                }
              )}


              {recentPatients.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >

                    {search
                      ? "No matching patients found."
                      : "No patient records available."}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* BOTTOM SUMMARY */}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <BottomCard
          icon={<Users size={18} />}
          title="Research"
          value={
            research?.total_patients ??
            patients.length
          }
          text="Patients in analysis"
          shade="bg-[#dce7f1]"
          onClick={() =>
            navigate("/research")
          }
        />

        <BottomCard
          icon={<Activity size={18} />}
          title="Optimization"
          value={
            optimization?.high_risk ??
            highRisk.length
          }
          text="High-risk records"
          shade="bg-[#cbdbea]"
          onClick={() =>
            navigate("/optimization")
          }
        />

        <BottomCard
          icon={<Bell size={18} />}
          title="Notifications"
          value={notifications.length}
          text="System alerts"
          shade="bg-[#b9cedf]"
          onClick={() =>
            navigate("/notifications")
          }
        />

      </div>

    </div>
  );
}


/* STAT CARD */

function StatCard({
  title,
  value,
  icon,
  shade,
}) {
  return (
    <div
      className={`rounded-xl ${shade} px-4 py-3`}
    >

      <div className="flex items-center justify-between">

        <p className="text-xs text-blue-100">
          {title}
        </p>

        <span className="text-blue-100">
          {icon}
        </span>

      </div>

      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
      </p>

    </div>
  );
}


/* AI INSIGHT */

function Insight({
  title,
  value,
  text,
}) {
  return (
    <div className="rounded-xl bg-[#234866] px-4 py-3">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium">
          {title}
        </p>

        <span className="text-lg font-semibold">
          {value}
        </span>

      </div>

      <p className="mt-1 text-xs text-blue-100">
        {text}
      </p>

    </div>
  );
}


/* QUICK ACTION */

function Action({
  icon,
  title,
  text,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-[#1b4567] p-3 text-left transition hover:bg-[#24557d]"
    >

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2a5d82] text-blue-100">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="text-xs text-blue-100">
          {text}
        </p>

      </div>

      <ArrowRight
        size={15}
        className="text-blue-200"
      />

    </button>
  );
}


/* BOTTOM CARD */

function BottomCard({
  icon,
  title,
  value,
  text,
  shade,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-[#d4dee9] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#b8c9d9] hover:bg-[#f8fafc]"
    >

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${shade} text-[#173957]`}
      >
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p className="text-lg font-semibold text-[#102a43]">
          {value}
        </p>

        <p className="text-xs text-slate-400">
          {text}
        </p>

      </div>

    </button>
  );
}


export default Dashboard; 