import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  BrainCircuit,
  Activity,
  FlaskConical,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { name: "Doctor", value: "doctor" },
    { name: "Staff", value: "staff" },
    { name: "Researcher", value: "researcher" },
    { name: "Admin", value: "admin" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // Role is compulsory
    if (!selectedRole) {
      setError("Please select your role before logging in.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      const user = response.data.user;

      // Check selected role with actual account role
      if (user.role !== selectedRole) {
        setError(
          `This account is registered as ${user.role}. Please select the correct role.`
        );
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "hf_token",
        response.data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white">
      <div className="h-full flex">

        {/* Left side */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#071a33] text-white">
          <div className="flex flex-col justify-center px-12 xl:px-16">

            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
                <HeartPulse size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  HealthForecast AI
                </h1>

                <p className="text-sm text-blue-200">
                  Healthcare Risk Management System
                </p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Predict. Prevent.
              <br />
              Improve.
            </h2>

            <p className="mt-4 max-w-lg text-slate-300 leading-relaxed">
              AI-powered healthcare insights that help medical
              teams identify patient risks early and make better
              informed decisions.
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <BrainCircuit size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    AI Risk Prediction
                  </p>

                  <p className="text-sm text-slate-400">
                    Identify high-risk patients early
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Activity size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Clinical Analytics
                  </p>

                  <p className="text-sm text-slate-400">
                    Understand healthcare data easily
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <FlaskConical size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Research Insights
                  </p>

                  <p className="text-sm text-slate-400">
                    Access secure research analytics
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-6">
          <div className="w-full max-w-md">

            <div className="mb-5">
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to HealthForecast AI
              </p>
            </div>

            {/* Role selection */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Your Role
              </label>

              <div className="grid grid-cols-4 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.value);
                      setError("");
                    }}
                    className={`py-3 rounded-lg border text-sm font-medium transition ${
                      selectedRole === role.value
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-slate-200 text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

            </form>

            <p className="text-center text-xs text-slate-400 mt-5">
              Secure role-based access
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login; 