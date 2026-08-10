import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, ShieldCheck, Activity, Users } from "lucide-react";
import { login } from "../api/client";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Doctor");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      localStorage.setItem("hf_token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pista-600 via-pista-500 to-emerald-600 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col md:flex-row">

        <div className="md:w-5/12 bg-gradient-to-br from-pista-600 to-emerald-700 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10"></div>
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <HeartPulse size={28} />
            </div>
            <h1 className="text-3xl font-bold leading-tight">HealthForecast AI</h1>
            <p className="text-white/80 text-sm mt-2">Patient Risk Intelligence System</p>
          </div>

          <div className="relative z-10 space-y-4 mt-10">
            <div className="flex items-center gap-3 text-sm">
              <Activity size={18} className="text-white/80" />
              <span className="text-white/90">AI-powered readmission risk prediction</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users size={18} className="text-white/80" />
              <span className="text-white/90">Role-based access for care teams</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck size={18} className="text-white/80" />
              <span className="text-white/90">Secure, HIPAA-conscious design</span>
            </div>
          </div>
        </div>

        <div className="md:w-7/12 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pista-400 transition"
                placeholder="you@hospital.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pista-400 transition"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Login as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pista-400 transition"
              >
                <option>Doctor</option>
                <option>Hospital Administrator</option>
                <option>Healthcare Researcher</option>
                <option>System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pista-500 to-emerald-600 hover:from-pista-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-pista-500/30"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;