"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";

interface PatientRow {
  id: string;
  full_name?: string;
  age_band?: string;
  mrn?: string;
  gender: string;
  date_of_birth?: string;
}

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mrn: "", full_name: "", date_of_birth: "", gender: "F", phone_number: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canCreate = user?.role === "hospital_admin" || user?.role === "system_admin";
  const isAnonymized = user?.role === "researcher";

  function refresh() {
    setLoading(true);
    api
      .get<PatientRow[]>("/patients")
      .then(setPatients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await api.post("/patients", { ...form, phone_number: form.phone_number.trim() || null });
      setShowForm(false);
      setForm({ mrn: "", full_name: "", date_of_birth: "", gender: "F", phone_number: "" });
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create patient");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SectionHeader
        title="Patients"
        subtitle={isAnonymized ? "Anonymized patient population." : "Patient records in your scope."}
        accent="indigo"
        action={
          canCreate && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal-dark transition shrink-0"
            >
              {showForm ? "Cancel" : "+ Add Patient"}
            </button>
          )
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-line rounded-xl p-5 mb-6 shadow-card">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">MRN</label>
              <input
                required
                value={form.mrn}
                onChange={(e) => setForm({ ...form, mrn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Full name</label>
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Date of birth</label>
              <input
                required
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">
                Mobile number <span className="text-muted font-normal">(lets them sign up for the portal)</span>
              </label>
              <input
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
          </div>
          {formError && <div className="text-sm text-risk-high mb-3">{formError}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save patient"}
          </button>
        </form>
      )}

      <div className="bg-card border border-line rounded-xl shadow-card overflow-hidden">
        {error && <div className="px-5 py-4 text-sm text-risk-high bg-risk-high-bg">{error}</div>}
        {!error && loading && <div className="px-5 py-10 text-center text-sm text-muted">Loading…</div>}
        {!error && !loading && patients.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted">No patients yet.</div>
        )}
        {patients.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
                <th className="px-5 py-2.5 font-medium">{isAnonymized ? "ID" : "Name"}</th>
                <th className="px-5 py-2.5 font-medium">{isAnonymized ? "Age band" : "MRN"}</th>
                <th className="px-5 py-2.5 font-medium">Gender</th>
                {!isAnonymized && <th className="px-5 py-2.5 font-medium"></th>}
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper/60 transition">
                  <td className="px-5 py-3 text-navy font-medium">
                    {isAnonymized ? <span className="font-mono text-xs text-muted">{p.id.slice(0, 8)}</span> : p.full_name}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{isAnonymized ? p.age_band : p.mrn}</td>
                  <td className="px-5 py-3">{p.gender}</td>
                  {!isAnonymized && (
                    <td className="px-5 py-3 text-right">
                      <Link href={`/dashboard/patients/${p.id}`} className="text-teal text-xs font-medium hover:underline">
                        View →
                      </Link>
                    </td>
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
