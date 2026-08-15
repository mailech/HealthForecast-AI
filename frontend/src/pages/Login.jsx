import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Verify it was saved
      console.log(
        "SAVED USER:",
        localStorage.getItem("user")
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (err) {

      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-blue-600">
              HealthForecast AI
            </h1>

            <p className="text-gray-500 mt-2">
              Healthcare Risk Management System
            </p>

          </div>


          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}


          <form onSubmit={handleLogin}>

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            <div className="mb-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

          </form>

        </div>


        <p className="text-center text-gray-400 text-sm mt-6">
          © 2026 HealthForecast AI
        </p>

      </div>

    </div>
  );
}

export default Login; 