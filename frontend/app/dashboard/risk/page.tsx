"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { RiskIndicator } from "@/components/RiskIndicator";
import { SectionHeader } from "@/components/SectionHeader";

interface RiskOverviewRow {
  admission_id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  readmission_probability: number;
  risk_category: string;
  generated_at: string;
}

export default function RiskPredictionsPage() {
  const [rows, setRows] = useState<RiskOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<RiskOverviewRow[]>("/risk/overview")
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const highRiskCount = rows.filter((r) => r.risk_category === "high").length;

  return (
    <>
      <SectionHeader
        title="Risk Predictions"
        subtitle="Readmission probability across all assessed admissions, highest risk first."
        accent="rose"
      />

      {rows.length > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="px-4 py-2 rounded-lg bg-risk-high-bg text-risk-high text-sm font-medium">
            {highRiskCount} high-risk
          </div>
          <div className="px-4 py-2 rounded-lg bg-line/50 text-muted text-sm">{rows.length} total assessed</div>
        </div>
      )}

      <div className="bg-card border border-line rounded-xl shadow-card overflow-hidden">
        {error && <div className="px-5 py-4 text-sm text-risk-high bg-risk-high-bg">{error}</div>}
        {!error && loading && <div className="px-5 py-10 text-center text-sm text-muted">Loading…</div>}
        {!error && !loading && rows.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted">
            No predictions yet. Open a patient and run &ldquo;Predict risk&rdquo; on one of their admissions.
          </div>
        )}
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
                <th className="px-5 py-2.5 font-medium">Patient</th>
                <th className="px-5 py-2.5 font-medium">MRN</th>
                <th className="px-5 py-2.5 font-medium">Readmission risk</th>
                <th className="px-5 py-2.5 font-medium">Assessed</th>
                <th className="px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.admission_id} className="border-b border-line last:border-0 hover:bg-paper/60 transition">
                  <td className="px-5 py-3 text-navy font-medium">{r.patient_name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{r.patient_mrn}</td>
                  <td className="px-5 py-3">
                    <RiskIndicator probability={r.readmission_probability} />
                  </td>
                  <td className="px-5 py-3 text-xs text-muted">{new Date(r.generated_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/dashboard/patients/${r.patient_id}`} className="text-teal text-xs font-medium hover:underline">
                      View patient →
                    </Link>
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
