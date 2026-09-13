import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Building2,
  FlaskConical,
  Settings2,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("doctor");

  const [email, setEmail] = useState("doctor@test.com");
  const [password, setPassword] = useState("password123");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: "doctor",
      title: "Doctor",
      description: "Clinical workspace",
      email: "doctor@test.com",
      icon: Stethoscope,
    },
    {
      id: "hospital_admin",
      title: "Hospital Admin",
      description: "Hospital operations",
      email: "hospitaladmin@test.com",
      icon: Building2,
    },
    {
      id: "healthcare_researcher",
      title: "Researcher",
      description: "Research & analytics",
      email: "researcher@test.com",
      icon: FlaskConical,
    },
    {
      id: "system_admin",
      title: "System Admin",
      description: "Platform management",
      email: "admin@healthforecast.com",
      icon: Settings2,
    },
  ];

  const getRoleLabel = (role) => {
    switch (role) {
      case "doctor":
        return "Doctor";
      case "hospital_admin":
        return "Hospital Administrator";
      case "healthcare_researcher":
        return "Healthcare Researcher";
      case "system_admin":
        return "System Administrator";
      default:
        return "User";
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");

    /*
     * Keep the existing demo Doctor credentials when Doctor
     * is selected. For the other roles, clear the fields so
     * credentials are entered explicitly.
     */
    const selectedWorkspace = roles.find((item) => item.id === role);

    setEmail(selectedWorkspace?.email || "");

    if (role === "doctor") {
      setPassword("password123");
    } else {
      setPassword("");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password"
        );
      }

      /*
       * IMPORTANT:
       * The backend/JWT remains the source of truth.
       * The selected role is only the workspace the user
       * says they intend to enter.
       *
       * Never trust the role selected in the frontend
       * for authorization.
       */
      const authenticatedRole = data.user?.role;

      if (authenticatedRole !== selectedRole) {
        throw new Error(
          `These credentials belong to ${getRoleLabel(
            authenticatedRole
          )}. Please select the correct workspace.`
        );
      }

      // Store authentication information
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "token_type",
        data.token_type
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      /*
       * If authentication succeeded but the selected role
       * did not match, make sure no partial login state remains.
       */
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("user");

      setError(
        err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/5" />

        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/5" />
      </div>

      <div className="relative min-h-screen lg:grid lg:grid-cols-2">

        {/* =========================================================
            LEFT — PRODUCT BRANDING
        ========================================================= */}
        <section className="hidden min-h-screen flex-col justify-between border-r border-white/10 bg-slate-950 px-12 py-10 lg:flex xl:px-20">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Activity
                  size={27}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight text-white">
                  HealthForecast
                </p>

                <p className="text-xl font-bold leading-none text-cyan-400">
                  AI
                </p>
              </div>

            </div>
          </div>

          {/* Main branding content */}
          <div className="max-w-xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">

              <Sparkles
                size={16}
                className="text-cyan-400"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                AI-Powered Healthcare Intelligence
              </span>

            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
              Smarter insights.
              <span className="block text-cyan-400">
                Better patient care.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
              HealthForecast AI combines clinical data,
              predictive intelligence, and healthcare
              analytics to support proactive patient care
              and post-discharge readmission assessment.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Brain
                    size={21}
                    className="text-cyan-400"
                  />
                </div>

                <p className="text-sm font-semibold text-white">
                  AI Risk
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Readmission prediction
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                  <HeartPulse
                    size={21}
                    className="text-blue-400"
                  />
                </div>

                <p className="text-sm font-semibold text-white">
                  Clinical
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Patient intelligence
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
                  <Activity
                    size={21}
                    className="text-purple-400"
                  />
                </div>

                <p className="text-sm font-semibold text-white">
                  Analytics
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Healthcare performance
                </p>

              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                HEALTHFORECAST AI
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Healthcare Analytics Intelligence Platform
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck
                size={15}
                className="text-cyan-500"
              />

              Privacy-aware platform
            </div>

          </div>

        </section>

        {/* =========================================================
            RIGHT — LOGIN
        ========================================================= */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <Activity
                  size={24}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  HealthForecast
                  <span className="ml-1 text-cyan-400">
                    AI
                  </span>
                </p>
              </div>

            </div>

            {/* Login card */}
            <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">

              {/* Card header */}
              <div className="mb-7">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50">
                  <Stethoscope
                    size={27}
                    className="text-cyan-600"
                  />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
                  Secure Access
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Select your workspace and sign in to
                  access your HealthForecast AI environment.
                </p>

              </div>

              {/* =====================================================
                  ROLE SELECTOR
              ===================================================== */}
              <div className="mb-7">

                <div className="mb-3 flex items-center justify-between">

                  <label className="block text-sm font-semibold text-slate-800">
                    Select workspace
                  </label>

                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    4 roles
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected =
                      selectedRole === role.id;

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() =>
                          handleRoleChange(role.id)
                        }
                        aria-pressed={isSelected}
                        aria-label={`Select ${role.title} workspace`}
                        className={`group relative rounded-2xl border p-3.5 text-left transition duration-200 ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-50 shadow-sm shadow-cyan-100"
                            : "border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50/50"
                        }`}
                      >

                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <CheckCircle2
                              size={16}
                              className="text-cyan-600"
                            />
                          </div>
                        )}

                        <div
                          className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
                            isSelected
                              ? "bg-cyan-100"
                              : "bg-white"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={
                              isSelected
                                ? "text-cyan-600"
                                : "text-slate-500"
                            }
                          />
                        </div>

                        <p
                          className={`text-xs font-bold ${
                            isSelected
                              ? "text-cyan-800"
                              : "text-slate-800"
                          }`}
                        >
                          {role.title}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          {role.description}
                        </p>

                      </button>
                    );
                  })}

                </div>

              </div>

              {/* Selected workspace status */}
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                  <ShieldCheck
                    size={19}
                    className="text-cyan-600"
                  />
                </div>

                <div className="flex-1">

                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                    {getRoleLabel(selectedRole)} Workspace
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Role-based secure access enabled
                  </p>

                </div>

                <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />

              </div>

              {/* =====================================================
                  LOGIN FORM
              ===================================================== */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-cyan-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                    <div className="flex items-start gap-3">

                      <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

                      <p className="text-sm font-medium leading-5 text-red-700">
                        {error}
                      </p>

                    </div>

                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition duration-200 hover:bg-cyan-700 hover:shadow-xl hover:shadow-cyan-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to {getRoleLabel(selectedRole)}

                      <ArrowRight
                        size={18}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>

              {/* Workspace credential status */}
              <div
                className={`mt-7 rounded-2xl border p-4 ${
                  selectedRole === "doctor"
                    ? "border-slate-200 bg-slate-50"
                    : "border-amber-100 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                    {selectedRole === "doctor" ? (
                      <Stethoscope
                        size={18}
                        className="text-cyan-600"
                      />
                    ) : (
                      <LockKeyhole
                        size={17}
                        className="text-amber-600"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800">
                      {selectedRole === "doctor"
                        ? "Demo Doctor Account"
                        : `${getRoleLabel(selectedRole)} access`}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {selectedRole === "doctor"
                        ? "Doctor demo credentials are pre-filled for local demonstration."
                        : "Use credentials belonging to an account assigned to this workspace."}
                    </p>

                    <p className="mt-2 truncate text-[11px] font-semibold text-slate-400">
                      Workspace email: {roles.find((item) => item.id === selectedRole)?.email}
                    </p>
                  </div>

                  {selectedRole === "doctor" && (
                    <CheckCircle2
                      size={18}
                      className="mt-1 shrink-0 text-green-500"
                    />
                  )}

                </div>
              </div>

              {/* Security note */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">

                <LockKeyhole size={13} />

                <span>
                  Secure role-based authentication
                </span>

              </div>

            </div>

            {/* Bottom disclaimer */}
            <p className="mt-6 text-center text-xs leading-5 text-slate-500">
              HealthForecast AI is a decision-support platform.
              AI-generated predictions are intended to support
              professional clinical review.
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Login;