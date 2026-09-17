import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserCog,
  MoreVertical,
  X,
  CheckCircle2,
} from "lucide-react";
import api from "../api/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users/");
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    doctors: users.filter(u => u.role === "doctor").length,
    staff: users.filter(u => u.role === "staff").length,
    researchers: users.filter(u => u.role === "researcher").length,
  }), [users]);

  const filteredUsers = users.filter(user => {
    const text = `${user.name || ""} ${user.email || ""}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/users/admin/create", form);

      setMessage(`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} account created successfully.`);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "doctor",
      });

      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create user.");
    }
  };

  const roleStyle = role => {
    if (role === "admin") return "bg-slate-100 text-[#0B1F33]";
    if (role === "doctor") return "bg-[#E1ECE3] text-[#4F7055]";
    if (role === "staff") return "bg-[#EEF3EE] text-[#657C68]";
    return "bg-[#E7EEE8] text-[#56705A]";
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-5 md:p-6">

      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#5F8064]">
            Administration
          </p>
          <h1 className="text-2xl font-bold text-[#0B1F33]">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage healthcare platform users and access roles.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#0B1F33] hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => {
              setMessage("");
              setError("");
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#5F8064] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#506F56]"
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#C9DCCB] bg-[#EAF2EB] px-4 py-3 text-sm text-[#4F7055]">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat title="Total Users" value={stats.total} icon={Users} />
        <Stat title="Admins" value={stats.admins} icon={ShieldCheck} />
        <Stat title="Doctors" value={stats.doctors} icon={Stethoscope} />
        <Stat title="Staff" value={stats.staff} icon={UserCog} />
        <Stat title="Researchers" value={stats.researchers} icon={Users} />
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* SEARCH */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-[#0B1F33]">Platform Users</h2>
            <p className="text-xs text-slate-500">
              {filteredUsers.length} users displayed
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-52 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#5F8064]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-[#5F8064]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="staff">Staff</option>
              <option value="researcher">Researcher</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 text-slate-300" size={35} />
            <p className="font-medium text-slate-600">No users found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#F7F9F7]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 hover:bg-[#FAFCFA]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1ECE3] text-sm font-bold text-[#4F7055]">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F33]">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5F8064]">
                        <span className="h-2 w-2 rounded-full bg-[#5F8064]" />
                        Active
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0B1F33]">
                        <MoreVertical size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F33]/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-semibold text-[#0B1F33]">
                  Create New User
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add a user to the healthcare platform.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 p-6">

              <Field
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />

              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />

              <Field
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create password"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#5F8064]"
                >
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#5F8064] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#506F56]"
                >
                  Create Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}


function Stat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E1ECE3] text-[#5F8064]">
        <Icon size={18} />
      </div>
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-[#0B1F33]">{value}</p>
    </div>
  );
}


function Field({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={type === "password" ? 6 : undefined}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#5F8064] focus:ring-1 focus:ring-[#5F8064]"
      />
    </div>
  );
} 