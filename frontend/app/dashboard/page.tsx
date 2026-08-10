"use client";

import { useEffect, useState } from "react";
import { useAuth, ROLE_LABELS } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { TiltCard } from "@/components/TiltCard";
import { SectionHeader } from "@/components/SectionHeader";
import { HealthForecastMark3D } from "@/components/HealthForecastMark3D";

interface PatientRow {
  id: string;
  full_name?: string;
  age_band?: string;
  gender: string;
  mrn?: string;
  hospital_id: string | null;
}

export default function OverviewPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api
      .get<PatientRow[]>("/patients")
      .then(setPatients)
      .catch((err) => setFetchError(err.message))
      .finally(() => setFetching(false));
  }, []);

  if (!user) return null;
  const isAnonymized = user.role === "researcher";

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <SectionHeader
            title="Overview"
            subtitle={`Signed in as ${user.full_name} · ${ROLE_LABELS[user.role]}`}
            accent="teal"
          />
        </div>
        <div className="hidden xl:block shrink-0 -mt-2">
          <HealthForecastMark3D size={140} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <TiltCard>
          <StatCard
            label={isAnonymized ? "Patients (anonymized)" : "Patients"}
            value={fetching ? "…" : String(patients.length)}
            sublabel={isAnonymized ? "aggregated, no PII" : "in your scope"}
            accent="teal"
          />
        </TiltCard>
        <TiltCard>
          <StatCard label="High-Risk Flags" value="—" sublabel="run predictions to populate" accent="rose" />
        </TiltCard>
        <TiltCard>
          <StatCard label="Avg. Readmission Risk" value="—" sublabel="run predictions to populate" accent="amber" />
        </TiltCard>
        <TiltCard>
          <StatCard label="Active Care Plans" value="—" sublabel="clinical decision support" accent="violet" />
        </TiltCard>
      </div>

      <div className="bg-card border border-line rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-display text-base text-navy">
            {isAnonymized ? "Patient population (anonymized)" : "Recent patients"}
          </h2>
          <span className="text-xs text-muted font-mono">{patients.length} records</span>
        </div>

        {fetchError && <div className="px-5 py-4 text-sm text-risk-high bg-risk-high-bg">{fetchError}</div>}

        {!fetchError && !fetching && patients.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted">
            No patients in scope yet.{" "}
            {(user.role === "hospital_admin" || user.role === "system_admin") && (
              <>Go to <span className="text-teal font-medium">Patients</span> to add one.</>
            )}
          </div>
        )}

        {patients.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
                {isAnonymized ? (
                  <>
                    <th className="px-5 py-2.5 font-medium">ID</th>
                    <th className="px-5 py-2.5 font-medium">Age band</th>
                    <th className="px-5 py-2.5 font-medium">Gender</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-2.5 font-medium">Name</th>
                    <th className="px-5 py-2.5 font-medium">MRN</th>
                    <th className="px-5 py-2.5 font-medium">Gender</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper/60 transition">
                  {isAnonymized ? (
                    <>
                      <td className="px-5 py-3 font-mono text-xs text-muted">{p.id.slice(0, 8)}</td>
                      <td className="px-5 py-3">{p.age_band}</td>
                      <td className="px-5 py-3">{p.gender}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 text-navy font-medium">{p.full_name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted">{p.mrn}</td>
                      <td className="px-5 py-3">{p.gender}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
