import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BrainCircuit,
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  Users,
  FlaskConical,
  UserCog,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "doctor",
      name: "Doctor",
      icon: Stethoscope,
      color: "#3B82B6",
      text: "Clinical care & AI prediction",
    },
    {
      id: "staff",
      name: "Staff",
      icon: Users,
      color: "#668A78",
      text: "Hospital operations",
    },
    {
      id: "researcher",
      name: "Researcher",
      icon: FlaskConical,
      color: "#C8755B",
      text: "Research & AI insights",
    },
    {
      id: "admin",
      name: "Admin",
      icon: UserCog,
      color: "#5F8064",
      text: "System administration",
    },
  ];

  const selectedRole = roles.find(item => item.id === role);

  const handleLogin = async e => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      const user = response.data.user || response.data;
      const token = response.data.access_token;

      if (!token) {
        throw new Error("Login token was not received.");
      }

      const userRole = user.role?.toLowerCase();

      if (userRole !== role) {
        setError(`This account is registered as ${user.role}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      localStorage.setItem("hf_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex overflow-hidden">

      {/* LEFT SIDE */}

      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-[#0B1F33] text-white">

        <div className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#3B82B6]/20 blur-[100px]" />
          <div className="absolute right-[-120px] bottom-[-100px] h-[450px] w-[450px] rounded-full bg-[#C8755B]/15 blur-[110px]" />
          <div className="absolute left-[35%] top-[30%] h-[280px] w-[280px] rounded-full bg-[#5F8064]/10 blur-[100px]" />
        </div>

        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute left-[15%] top-[20%] h-px w-[70%] bg-white" />
          <div className="absolute left-[20%] top-[45%] h-px w-[65%] bg-white rotate-[18deg]" />
          <div className="absolute left-[10%] top-[70%] h-px w-[80%] bg-white rotate-[-12deg]" />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-between p-12">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/10 backdrop-blur">
                <BrainCircuit size={25} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  HealthForecast
                </h1>
                <p className="text-[10px] tracking-[0.25em] text-slate-400">
                  AI HEALTHCARE PLATFORM
                </p>
              </div>
            </div>
          </div>

          <div className="relative max-w-xl">

            <div className="mb-8 relative h-64">

              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 animate-[spin_18s_linear_infinite]" />

              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3B82B6]/30 animate-[spin_12s_linear_infinite_reverse]" />

              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#12395B] shadow-[0_0_70px_rgba(59,130,182,0.35)]">

                <div className="absolute inset-2 rounded-full border border-[#3B82B6]/50" />

                <Activity
                  size={38}
                  className="text-[#8CC8FF] relative z-10"
                />
              </div>

              <div className="absolute left-[15%] top-[30%] flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 backdrop-blur">
                <ShieldCheck size={18} className="text-[#8CC8FF]" />
              </div>

              <div className="absolute right-[15%] top-[18%] flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 backdrop-blur">
                <Sparkles size={18} className="text-[#D7A08C]" />
              </div>

              <div className="absolute bottom-[15%] left-[22%] h-2 w-2 rounded-full bg-[#8CC8FF] shadow-[0_0_15px_#8CC8FF]" />
              <div className="absolute bottom-[25%] right-[25%] h-2 w-2 rounded-full bg-[#D7A08C] shadow-[0_0_15px_#D7A08C]" />
            </div>

            <p className="mb-3 text-sm font-medium tracking-widest text-[#8CC8FF] uppercase">
              Intelligent Healthcare
            </p>

            <h2 className="text-4xl font-semibold leading-tight">
              Predict risk.
              <br />
              Understand patients.
              <br />
              <span className="text-slate-400">
                Improve healthcare decisions.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-6 text-slate-400">
              An AI-powered healthcare platform designed to support
              clinical decisions, patient analytics and healthcare research.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#5F8064]" />
              AI Prediction
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3B82B6]" />
              Clinical Analytics
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C8755B]" />
              Research
            </span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-[470px]">

          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F33] text-white">
              <BrainCircuit size={22} />
            </div>

            <div>
              <h1 className="font-bold text-[#0B1F33]">
                HealthForecast
              </h1>
              <p className="text-[9px] tracking-widest text-slate-400">
                AI HEALTHCARE PLATFORM
              </p>
            </div>
          </div>

          <div className="mb-7">
            <p className="text-sm font-medium text-slate-400">
              Welcome back
            </p>

            <h2 className="mt-1 text-3xl font-bold text-[#0B1F33]">
              Sign in to your workspace
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select your role and continue to HealthForecast.
            </p>
          </div>

          {/* ROLE SELECTOR */}

          <div className="mb-7">

            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Login as
              </p>

              <span
                className="text-xs font-medium"
                style={{ color: selectedRole.color }}
              >
                {selectedRole.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">

              {roles.map(item => {
                const Icon = item.icon;
                const active = role === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className="group rounded-2xl border p-4 text-left transition-all duration-300"
                    style={{
                      borderColor: active ? item.color : "#E2E8F0",
                      backgroundColor: active ? `${item.color}12` : "#FFFFFF",
                      boxShadow: active
                        ? `0 8px 25px ${item.color}18`
                        : "none",
                    }}
                  >

                    <div className="flex items-center justify-between">

                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: active
                            ? item.color
                            : "#F1F5F9",
                          color: active ? "#FFFFFF" : "#64748B",
                        }}
                      >
                        <Icon size={18} />
                      </div>

                      {active && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}

                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#0B1F33]">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                      {item.text}
                    </p>

                  </button>
                );
              })}

            </div>
          </div>

          {/* LOGIN FORM */}

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#3B82B6] focus:ring-4 focus:ring-[#3B82B6]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-[#3B82B6] focus:ring-4 focus:ring-[#3B82B6]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                backgroundColor: selectedRole.color,
                boxShadow: `0 10px 25px ${selectedRole.color}30`,
              }}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue as {selectedRole.name}
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

          </form>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            Secure role-based healthcare access
          </div>

        </div>
      </div>
    </div>
  );
} 