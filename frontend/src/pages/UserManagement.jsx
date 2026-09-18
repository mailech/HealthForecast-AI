import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { UserPlus } from "lucide-react";
import { getUsers, createUser } from "../api/client";

const ROLES = ["doctor", "hospital_administrator", "healthcare_researcher", "system_admin"];

function roleLabel(role) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadUsers() {
    getUsers()
      .then(setUsers)
      .catch((err) => setLoadError(err.message));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      await createUser(fullName, email, password, role);
      setSuccessMsg(`User ${email} created successfully.`);
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("doctor");
      loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex bg-pista-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header title="User Management" subtitle="Add and manage platform users" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-pista-100 p-6 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-5">
              <UserPlus size={18} className="text-pista-600" />
              <h2 className="text-base font-semibold text-slate-800">Add New User</h2>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">
                {formError}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-3 py-2 mb-4">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pista-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pista-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pista-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pista-400"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{roleLabel(r)}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-pista-500 hover:bg-pista-600 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition"
              >
                {submitting ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-pista-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-pista-100">
              <h2 className="text-base font-semibold text-slate-800">All Users ({users.length})</h2>
            </div>
            {loadError && (
              <div className="p-6 text-rose-600 text-sm">{loadError}</div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-pista-50">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-pista-50 last:border-0">
                    <td className="px-6 py-3 text-slate-800 font-medium">{u.full_name}</td>
                    <td className="px-6 py-3 text-slate-600">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-semibold bg-pista-50 text-pista-800 px-2.5 py-1 rounded-full">
                        {roleLabel(u.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserManagement;