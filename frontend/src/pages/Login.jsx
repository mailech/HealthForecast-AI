import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserMd, FaShieldAlt } from "react-icons/fa";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Doctor",
  });

  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminToggle = () => {
    setIsSystemAdmin((previous) => !previous);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const loginData = {
        email: formData.email,
        password: formData.password,
        is_system_admin: isSystemAdmin,
      };

      // Send selected role only for normal users
      if (!isSystemAdmin) {
        loginData.role = formData.role;
      }

      const response = await api.post(
        "/api/login",
        loginData
      );

      // Store JWT
      localStorage.setItem(
        "token",
        response.data.token
      );

      // Store user information
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Get actual role returned by backend
      const userRole = response.data.user?.role;

      // Role-based navigation
      if (userRole === "System Administrator") {
        navigate("/admin");
      } else if (userRole === "Doctor") {
        navigate("/dashboard");
      } else if (userRole === "Hospital Administrator") {
        navigate("/hospital-dashboard");
      } else if (userRole === "Healthcare Researcher") {
        navigate("/research-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-cyan-50 to-white flex items-center justify-center">

      <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8">

        <div className="flex flex-col items-center mb-6">

          <div
            className={`${
              isSystemAdmin
                ? "bg-slate-700"
                : "bg-blue-600"
            } text-white p-4 rounded-full`}
          >
            {isSystemAdmin ? (
              <FaShieldAlt size={35} />
            ) : (
              <FaUserMd size={35} />
            )}
          </div>

          <h2 className="text-3xl font-bold mt-4 text-slate-800">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2 text-center">
            Login to HealthForecast AI
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <input
            type="email"
            name="email"
            placeholder={
              isSystemAdmin
                ? "System Administrator Email"
                : "Email Address"
            }
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {!isSystemAdmin && (
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Doctor">
                Doctor
              </option>

              <option value="Hospital Administrator">
                Hospital Administrator
              </option>

              <option value="Healthcare Researcher">
                Healthcare Researcher
              </option>
            </select>
          )}

          {/* System Administrator Toggle */}
          <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-gray-50">

            <div>
              <p className="text-sm font-semibold text-gray-700">
                System Administrator Access
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Use configured administrator credentials
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdminToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isSystemAdmin
                  ? "bg-slate-700"
                  : "bg-gray-300"
              }`}
              aria-label="Toggle System Administrator Access"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  isSystemAdmin
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>

          </div>

          {isSystemAdmin && (
            <div className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-lg p-3">
              <strong>System Administrator Mode</strong>
              <br />
              Login using the System Administrator credentials
              configured in the backend environment.
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              isSystemAdmin
                ? "bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            } text-white py-3 rounded-lg font-semibold transition duration-300`}
          >
            {loading
              ? "Logging in..."
              : isSystemAdmin
                ? "Login as System Administrator"
                : "Login"}
          </button>

          {!isSystemAdmin && (
            <p className="text-center text-gray-500 mt-6">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}

        </form>

      </div>

    </div>
  );
}

export default Login;