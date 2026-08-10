"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RiskIndicator } from "@/components/RiskIndicator";
import { SectionHeader } from "@/components/SectionHeader";

interface Profile {
  full_name: string;
  mrn: string;
  gender: string;
  date_of_birth: string;
}

interface Admission {
  id: string;
  admitted_on: string;
  discharged_on: string | null;
  primary_diagnosis: string | null;
  time_in_hospital: number | null;
}

interface RiskScore {
  admission_id: string;
  readmission_probability: number;
  risk_category: string;
  generated_at: string;
}

interface Bill {
  id: string;
  admission_id: string;
  total_amount: number;
  patient_responsibility: number;
  insurance_covered: number;
  status: string;
  issued_on: string;
  due_on: string | null;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function MyRecordsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Profile>("/me/profile"),
      api.get<Admission[]>("/me/admissions"),
      api.get<RiskScore[]>("/me/risk-status"),
      api.get<Bill[]>("/me/bills"),
    ])
      .then(([p, a, r, b]) => {
        setProfile(p);
        setAdmissions(a);
        setRiskScores(r);
        setBills(b);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const latestRisk = riskScores[0];
  const outstandingTotal = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + b.patient_responsibility, 0);

  if (loading) return <div className="text-sm text-muted">Loading your records…</div>;
  if (error) return <div className="text-sm text-risk-high bg-risk-high-bg rounded-lg p-4">{error}</div>;

  return (
    <>
      <SectionHeader
        title={`Welcome, ${profile?.full_name?.split(" ")[0] || user?.full_name}`}
        subtitle="Your admissions, current risk status, and hospital bills."
        accent="teal"
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-line rounded-xl p-5 shadow-card">
          <div className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Current status</div>
          {latestRisk ? (
            <RiskIndicator probability={latestRisk.readmission_probability} />
          ) : (
            <span className="text-sm text-muted">No assessment yet</span>
          )}
          <div className="text-xs text-muted mt-2">Readmission risk, most recent assessment</div>
        </div>

        <div className="bg-card border border-line rounded-xl p-5 shadow-card">
          <div className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Outstanding balance</div>
          <div className={`font-mono text-2xl font-semibold ${outstandingTotal > 0 ? "text-risk-high" : "text-risk-low"}`}>
            {formatCurrency(outstandingTotal)}
          </div>
          <div className="text-xs text-muted mt-2">Across {bills.filter((b) => b.status !== "paid").length} unpaid bill(s)</div>
        </div>

        <div className="bg-card border border-line rounded-xl p-5 shadow-card">
          <div className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Total admissions</div>
          <div className="font-mono text-2xl font-semibold text-navy">{admissions.length}</div>
          <div className="text-xs text-muted mt-2">On record</div>
        </div>
      </div>

      <h2 className="font-display text-base text-navy mb-3">Admission history</h2>
      <div className="bg-card border border-line rounded-xl shadow-card overflow-hidden mb-8">
        {admissions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">No admissions on record.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
                <th className="px-5 py-2.5 font-medium">Admitted</th>
                <th className="px-5 py-2.5 font-medium">Diagnosis</th>
                <th className="px-5 py-2.5 font-medium">Days</th>
                <th className="px-5 py-2.5 font-medium">Risk at discharge</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((a) => {
                const score = riskScores.find((r) => r.admission_id === a.id);
                return (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-muted">{a.admitted_on}</td>
                    <td className="px-5 py-3">{a.primary_diagnosis || "—"}</td>
                    <td className="px-5 py-3">{a.time_in_hospital ?? "—"}</td>
                    <td className="px-5 py-3">
                      {score ? <RiskIndicator probability={score.readmission_probability} /> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="font-display text-base text-navy mb-3">Bills</h2>
      <div className="bg-card border border-line rounded-xl shadow-card overflow-hidden">
        {bills.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">No bills on record.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
                <th className="px-5 py-2.5 font-medium">Issued</th>
                <th className="px-5 py-2.5 font-medium">Total</th>
                <th className="px-5 py-2.5 font-medium">Insurance covered</th>
                <th className="px-5 py-2.5 font-medium">You owe</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-muted">{b.issued_on}</td>
                  <td className="px-5 py-3 font-mono">{formatCurrency(b.total_amount)}</td>
                  <td className="px-5 py-3 font-mono text-muted">{formatCurrency(b.insurance_covered)}</td>
                  <td className="px-5 py-3 font-mono font-medium text-navy">{formatCurrency(b.patient_responsibility)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        b.status === "paid"
                          ? "bg-risk-low-bg text-risk-low"
                          : b.status === "overdue"
                          ? "bg-risk-high-bg text-risk-high"
                          : "bg-amber-light text-amber"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
