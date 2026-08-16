import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserMd } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Doctor",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        formData
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

      navigate("/dashboard");

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

          <div className="bg-blue-600 text-white p-4 rounded-full">
            <FaUserMd size={35} />
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
            placeholder="Email Address"
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

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
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
        </form>

      </div>

    </div>
  );
}

export default Login;