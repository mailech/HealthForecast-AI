import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PatientModal from "../components/PatientModal";
import AddPatientModal from "../components/AddPatientModal";
import { Search, User, Plus } from "lucide-react";
import { getPatients } from "../api/client";

function decodeToken() {
  try {
    const token = localStorage.getItem("hf_token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function Patients() {
  const [selected, setSelected] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const payload = decodeToken();
  const canAddPatient = payload?.role === "hospital_administrator" || payload?.role === "system_admin";

  function loadPatients() {
    setLoading(true);
    getPatients()
      .then((data) => setPatients(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-pista-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-0">
          <Header title="Patient Records" subtitle="Assigned patients under your care" />
        </div>

        {canAddPatient && (
          <div className="flex justify-end mb-4 -mt-4">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 bg-pista-500 hover:bg-pista-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus size={16} />
              Add Patient
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-pista-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-pista-100 bg-pista-50/40">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="flex-1 text-sm outline-none placeholder:text-slate-400 bg-transparent"
            />
            <span className="text-xs font-medium text-pista-700 bg-pista-100 px-2.5 py-1 rounded-full">
              {filtered.length} patients
            </span>
          </div>

          {loading && <p className="p-8 text-center text-slate-500">Loading patients...</p>}
          {error && <p className="p-8 text-center text-rose-600">{error}</p>}

          {!loading && !error && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-pista-50/60 border-b border-pista-100">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Date of Birth</th>
                  <th className="px-5 py-3 font-medium">Diagnosis</th>
                  <th className="px-5 py-3 font-medium">MRN</th>
                  <th className="px-5 py-3 font-medium">Admission Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="border-t border-pista-50 hover:bg-pista-50/50 cursor-pointer transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pista-400 to-pista-600 flex items-center justify-center text-white">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-slate-800">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{p.date_of_birth}</td>
                    <td className="px-5 py-4 text-slate-600">{p.diagnosis}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {p.medical_record_number}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{p.admission_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <PatientModal patient={selected} onClose={() => setSelected(null)} />
        <AddPatientModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={loadPatients}
        />
      </main>
    </div>
  );
}

export default Patients;