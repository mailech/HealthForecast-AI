"use client";

import { useRef, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { HealthForecastMark } from "@/components/HealthForecastMark";
import { HealthForecastMark3D } from "@/components/HealthForecastMark3D";
import { HealthForecastScene3D } from "@/components/HealthForecastScene3D";

type Mode = "staff" | "patient-signin" | "patient-signup";

function LoginForm() {
  const { login, patientLogin, patientSignup } = useAuth();
  const [mode, setMode] = useState<Mode>("staff");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Mouse-driven 3D tilt on the auth card — subtle, capped, resets on leave.
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "staff") await login(email, password);
      else if (mode === "patient-signin") await patientLogin(phone, password);
      else await patientSignup(phone, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
  }

  return (
    <div className="relative min-h-screen bg-navy overflow-hidden flex items-center justify-center px-6 py-12">
      <HealthForecastScene3D />

      {/* vignette so the card stays legible over the busy scene */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(15,27,45,0.55)_70%,rgba(15,27,45,0.92)_100%)]" />

      {/* top brand row */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-20">
        <HealthForecastMark size={26} />
        <span className="font-display text-white text-base tracking-tight">HealthForecast AI</span>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.05fr_1fr] items-center gap-12">
        {/* Left: headline + rotating 3D mark, floating in the scene */}
        <div className="hidden lg:flex flex-col items-start">
          <h1 className="font-display text-4xl xl:text-[2.75rem] leading-[1.12] text-white max-w-md">
            Predict readmissions
            <br />
            before they happen.
          </h1>
          <p className="text-white/50 max-w-sm leading-relaxed mt-5">
            Risk intelligence, treatment effectiveness, and hospital performance —
            in one platform built for clinical teams.
          </p>

          <div className="mt-10 -ml-6">
            <HealthForecastMark3D size={260} />
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-md pt-8 mt-4 border-t border-white/10">
            <div>
              <div className="font-mono text-2xl text-teal">30d</div>
              <div className="text-xs text-white/40 mt-1">readmission window</div>
            </div>
            <div>
              <div className="font-mono text-2xl text-amber">4</div>
              <div className="text-xs text-white/40 mt-1">role-based views</div>
            </div>
            <div>
              <div className="font-mono text-2xl text-violet">AI</div>
              <div className="text-xs text-white/40 mt-1">risk scoring engine</div>
            </div>
          </div>
        </div>

        {/* Right: floating glass auth card with mouse-parallax 3D tilt */}
        <div style={{ perspective: "1200px" }}>
          <div
            ref={cardRef}
            onMouseMove={handlePointerMove}
            onMouseLeave={resetTilt}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 300ms ease-out",
            }}
            className="w-full max-w-sm mx-auto rounded-2xl border border-white/10 bg-white/[0.06]
                       backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-8"
          >
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <HealthForecastMark size={24} />
              <span className="font-display text-white text-base">HealthForecast AI</span>
            </div>

            {/* Staff vs Patient toggle */}
            <div className="flex gap-1 p-1 bg-white/[0.06] border border-white/10 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => switchMode("staff")}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
                  mode === "staff" ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"
                }`}
              >
                Hospital Staff
              </button>
              <button
                type="button"
                onClick={() => switchMode("patient-signin")}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
                  mode !== "staff" ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"
                }`}
              >
                Patient
              </button>
            </div>

            {mode === "staff" && (
              <>
                <h2 className="font-display text-2xl text-white mb-1">Sign in</h2>
                <p className="text-white/45 text-sm mb-6">Enter your credentials to access your dashboard.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5" htmlFor="email">
                      Work email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@hospital.org"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm
                                 placeholder:text-white/30
                                 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm
                                 placeholder:text-white/30
                                 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal/60 transition"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/30 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-lg bg-teal text-white text-sm font-medium
                               hover:bg-teal-dark transition disabled:opacity-50
                               shadow-[0_0_24px_rgba(30,138,130,0.45)]"
                  >
                    {submitting ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <p className="text-xs text-white/35 mt-8">
                  Access is provisioned by your System Administrator. Contact your admin if you don&apos;t have credentials.
                </p>
              </>
            )}

            {mode !== "staff" && (
              <>
                <h2 className="font-display text-2xl text-white mb-1">
                  {mode === "patient-signin" ? "Patient sign in" : "Create your account"}
                </h2>
                <p className="text-white/45 text-sm mb-6">
                  {mode === "patient-signin"
                    ? "Just your mobile number and password."
                    : "Use the mobile number on file with the hospital."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5" htmlFor="phone">
                      Mobile number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm
                                 placeholder:text-white/30
                                 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5" htmlFor="ppassword">
                      Password
                    </label>
                    <input
                      id="ppassword"
                      type="password"
                      required
                      minLength={mode === "patient-signup" ? 8 : undefined}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "patient-signup" ? "At least 8 characters" : "••••••••"}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm
                                 placeholder:text-white/30
                                 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal/60 transition"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/30 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-lg bg-teal text-white text-sm font-medium
                               hover:bg-teal-dark transition disabled:opacity-50
                               shadow-[0_0_24px_rgba(30,138,130,0.45)]"
                  >
                    {submitting
                      ? "Please wait…"
                      : mode === "patient-signin"
                      ? "Sign in"
                      : "Create account"}
                  </button>
                </form>

                <p className="text-xs text-white/40 mt-6 text-center">
                  {mode === "patient-signin" ? (
                    <>
                      New here?{" "}
                      <button onClick={() => switchMode("patient-signup")} className="text-teal font-medium hover:underline">
                        Create an account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button onClick={() => switchMode("patient-signin")} className="text-teal font-medium hover:underline">
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
