import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/");

      setUsers(response.data);
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await api.post("/users/admin/create", form);

      setMessage(
        `${form.role === "doctor" ? "Doctor" : "Staff"} account created successfully.`
      );

      setForm({
        name: "",
        email: "",
        password: "",
        role: "doctor",
      });

      loadUsers();
    } catch (err) {
      console.error("CREATE USER ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to create user."
      );
    }
  };

  return (
    <MainLayout>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          User Management
        </h1>

        <p className="text-gray-500 mt-2">
          Manage Doctors and Staff accounts.
        </p>
      </div>


      {/* CREATE USER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">

        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Create Account
        </h2>

        {message && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create password"
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          {/* ROLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="doctor">
                Doctor
              </option>

              <option value="staff">
                Staff
              </option>

              <option value="researcher">Researcher</option>
            </select>
          </div>


          {/* BUTTON */}
          <div className="md:col-span-2">

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Account
            </button>

          </div>

        </form>

      </div>


      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            All Users
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-gray-500">
            No users found.
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    ID
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Name
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Role
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="border-t border-slate-100"
                  >

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.id}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "doctor"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "staff"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </MainLayout>
  );
}

export default UserManagement;