import { useEffect, useMemo, useState } from "react";
import {
  Users, Search, RefreshCw, UserPlus, Edit3, Trash2,
  Activity, ShieldCheck, UserCheck, BedDouble, X
} from "lucide-react";
import api from "../api/api";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "", age: "", gender: "Female", disease: "", risk: "Low", status: "Stable"
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role?.toLowerCase();

  const canEdit = ["admin", "doctor", "staff"].includes(role);
  const canDelete = ["admin", "staff"].includes(role);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patients");
      setPatients(res.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();

    return patients.filter(p => {
      const matchesSearch =
        !q ||
        `${p.name} ${p.id} ${p.disease} ${p.gender} ${p.status}`
          .toLowerCase()
          .includes(q);

      const matchesRisk =
        riskFilter === "All" || p.risk === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [patients, search, riskFilter]);

  const stats = {
    total: patients.length,
    high: patients.filter(p => p.risk === "High").length,
    admitted: patients.filter(p => p.status === "Admitted").length,
    stable: patients.filter(p => p.status === "Stable").length
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "", age: "", gender: "Female",
      disease: "", risk: "Low", status: "Stable"
    });
    setShowModal(true);
  };

  const openEdit = patient => {
    setEditing(patient);
    setForm({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "Female",
      disease: patient.disease || "",
      risk: patient.risk || "Low",
      status: patient.status || "Stable"
    });
    setShowModal(true);
  };

  const savePatient = async e => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/patients/${editing.id}`, form);
      } else {
        await api.post("/patients", {
          ...form,
          age: Number(form.age)
        });
      }

      setShowModal(false);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save patient.");
    }
  };

  const deletePatient = async id => {
    if (!window.confirm("Delete this patient record?")) return;

    try {
      await api.delete(`/patients/${id}`);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete patient.");
    }
  };

  const riskStyle = risk => {
    if (risk === "High") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (risk === "Medium") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }

    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const statusStyle = status => {
    if (status === "Admitted") {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }

    if (status === "Recovered") {
      return "bg-slate-100 text-slate-600 border-slate-200";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
            <Users size={21} className="text-blue-300" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
            <p className="text-sm text-slate-500">
              Patient records and clinical monitoring
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadPatients}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {canEdit && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 shadow-sm"
            >
              <UserPlus size={16} />
              Add Patient
            </button>
          )}
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold">Patient Overview</p>
            <p className="text-xs text-slate-400 mt-1">
              Current clinical record summary
            </p>
          </div>

          <Activity size={20} className="text-blue-300" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <OverviewCard icon={Users} label="Total Patients" value={stats.total} />
          <OverviewCard icon={Activity} label="High Risk" value={stats.high} />
          <OverviewCard icon={BedDouble} label="Admitted" value={stats.admitted} />
          <OverviewCard icon={UserCheck} label="Stable" value={stats.stable} />
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* PATIENT RECORDS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h2 className="font-semibold text-slate-900">Patient Records</h2>
              <p className="text-xs text-slate-400 mt-1">
                Search and manage registered patients
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 w-full sm:w-72">
                <Search size={17} className="text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search patient..."
                  className="ml-2 w-full bg-transparent outline-none text-sm text-slate-700"
                />
              </div>

              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 outline-none"
              >
                <option>All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                  Patient
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                  Age / Gender
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                  Condition
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                  Risk
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                  Status
                </th>
                {canEdit && (
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-slate-400">
                    Loading patient records...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-slate-400">
                    No patient records found.
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
                          {patient.name?.[0]?.toUpperCase() || "P"}
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

                    {/* AGE / GENDER */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {patient.age || "—"} years
                      </p>
                      <p className="text-xs text-slate-400">
                        {patient.gender || "—"}
                      </p>
                    </td>

                    {/* CONDITION */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700">
                        {patient.disease || "Not specified"}
                      </span>
                    </td>

                    {/* RISK */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-lg border text-xs font-medium ${riskStyle(patient.risk)}`}>
                        {patient.risk || "Low"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-lg border text-xs font-medium ${statusStyle(patient.status)}`}>
                        {patient.status || "Stable"}
                      </span>
                    </td>

                    {/* ACTION */}
                    {canEdit && (
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-1">

                          <button
                            onClick={() => openEdit(patient)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => deletePatient(patient.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                        </div>
                      </td>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Showing {filteredPatients.length} of {patients.length} patient records
          </p>
        </div>
      </div>

      {/* ACCESS INFO */}
      <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-3 text-white">
        <ShieldCheck size={20} className="text-blue-300" />
        <div>
          <p className="text-sm font-medium">Role-based patient access</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Your current access level: {role || "User"}
          </p>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="font-semibold">
                  {editing ? "Edit Patient" : "Add Patient"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Patient clinical information
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={savePatient} className="p-5 space-y-4">

              <div>
                <label className="text-xs font-medium text-slate-600">Patient Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Age</label>
                  <input
                    required
                    type="number"
                    value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                    className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Disease / Condition</label>
                <input
                  required
                  value={form.disease}
                  onChange={e => setForm({ ...form, disease: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Risk Level</label>
                  <select
                    value={form.risk}
                    onChange={e => setForm({ ...form, risk: e.target.value })}
                    className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option>Stable</option>
                    <option>Admitted</option>
                    <option>Recovered</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                >
                  {editing ? "Update Patient" : "Add Patient"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function OverviewCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-blue-300" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-slate-400 mt-3">{label}</p>
    </div>
  );
}

export default Patients; 