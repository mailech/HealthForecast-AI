import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Calendar,
  User,
  Activity,
  RefreshCw,
  Search,
  ShieldCheck,
  BedDouble
} from "lucide-react";
import api from "../api/api";

function AdmissionHistory() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role?.toLowerCase() || "patient";

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(
        (response.data || []).filter(patient => patient.admission_date)
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load admission history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return patients;

    return patients.filter(patient =>
      `${patient.name} ${patient.id} ${patient.disease} ${patient.risk} ${patient.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [patients, search]);

  const recovered = patients.filter(
    patient => patient.status === "Recovered"
  ).length;

  const highRisk = patients.filter(
    patient => patient.risk === "High"
  ).length;

  const admitted = patients.filter(
    patient => patient.status === "Admitted"
  ).length;

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
            <ClipboardList size={21} className="text-blue-300" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admission History
            </h1>
            <p className="text-sm text-slate-500">
              Patient admission records and clinical history
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdmissions}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {/* ROLE INFO */}
      <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-center gap-3 text-white">
        <ShieldCheck size={18} className="text-blue-300" />

        <div>
          <p className="text-sm font-medium">
            Admission Records
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as{" "}
            <span className="text-slate-300 font-medium">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Summary
          icon={ClipboardList}
          label="Total Admissions"
          value={patients.length}
        />

        <Summary
          icon={BedDouble}
          label="Currently Admitted"
          value={admitted}
        />

        <Summary
          icon={Activity}
          label="Recovered"
          value={recovered}
        />

        <Summary
          icon={User}
          label="High Risk"
          value={highRisk}
        />

      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-white border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* RECORDS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {/* TABLE HEADER */}
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

            <div>
              <h2 className="font-semibold text-slate-900">
                Admission Records
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Historical patient admission information
              </p>
            </div>

            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 w-full lg:w-72">
              <Search size={16} className="text-slate-400" />

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search admission..."
                className="ml-2 w-full bg-transparent outline-none text-sm text-slate-700"
              />
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>

                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                  Admission Date
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                  Condition
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                  Risk
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                  Status
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    Loading admission history...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    No admission records found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition"
                  >

                    {/* PATIENT */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-semibold">
                          {patient.name?.charAt(0).toUpperCase() || "P"}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {patient.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            Patient ID #{patient.id}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* DATE */}
                    <td className="px-5 py-4 text-center">

                      <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                        <Calendar
                          size={15}
                          className="text-slate-500"
                        />
                        {patient.admission_date}
                      </div>

                    </td>

                    {/* CONDITION */}
                    <td className="px-5 py-4 text-center text-sm text-slate-600">
                      {patient.disease || "Not specified"}
                    </td>

                    {/* RISK */}
                    <td className="px-5 py-4 text-center">

                      <StatusBadge
                        value={patient.risk || "Low"}
                        type="risk"
                      />

                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4 text-center">

                      <StatusBadge
                        value={patient.status || "Stable"}
                        type="status"
                      />

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Showing {filteredPatients.length} of {patients.length} admission records
          </p>
        </div>

      </div>

    </div>
  );
}

/* SUMMARY */
function Summary({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">

      <div className="flex items-center justify-between">

        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon size={17} className="text-slate-700" />
        </div>

        <span className="text-xl font-bold text-slate-900">
          {value}
        </span>

      </div>

      <p className="text-xs text-slate-500 mt-3">
        {label}
      </p>

    </div>
  );
}

/* STATUS BADGE */
function StatusBadge({ value, type }) {
  let style = "bg-slate-100 text-slate-600 border-slate-200";

  if (type === "risk") {
    if (value === "High") {
      style = "bg-slate-200 text-slate-800 border-slate-300";
    } else if (value === "Medium") {
      style = "bg-blue-50 text-blue-700 border-blue-100";
    } else {
      style = "bg-slate-100 text-slate-500 border-slate-200";
    }
  }

  if (type === "status") {
    if (value === "Admitted") {
      style = "bg-blue-50 text-blue-700 border-blue-100";
    } else if (value === "Recovered") {
      style = "bg-slate-100 text-slate-600 border-slate-200";
    } else if (value === "Critical") {
      style = "bg-slate-200 text-slate-800 border-slate-300";
    }
  }

  return (
    <span className={`inline-flex px-3 py-1 rounded-lg border text-xs font-medium ${style}`}>
      {value}
    </span>
  );
}

export default AdmissionHistory; 