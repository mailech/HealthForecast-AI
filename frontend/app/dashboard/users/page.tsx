"use client";

import { useEffect, useState } from "react";
import { useAuth, ROLE_LABELS } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface PatientOption {
  id: string;
  full_name: string;
  mrn: string;
}

const emptyForm = { email: "", password: "", full_name: "", role: "doctor", patient_id: "" };

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    setLoading(true);
    api
      .get<UserRow[]>("/users")
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    api.get<PatientOption[]>("/patients").then(setPatients).catch(() => {});
  }

  useEffect(refresh, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: form.role,
        ...(form.role === "patient" && form.patient_id ? { patient_id: form.patient_id } : {}),
      };
      await api.post("/users", payload);
      setShowForm(false);
      setForm(emptyForm);
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await api.patch(`/users/${id}/deactivate`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate user");
    }
  }

  if (user?.role !== "system_admin") {
    return <div className="text-sm text-muted">User management is only available to System Administrators.</div>;
  }

  return (
    <>
      <SectionHeader
        title="User Management"
        subtitle="Create and manage accounts for your hospital's staff."
        accent="violet"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal-dark transition shrink-0"
          >
            {showForm ? "Cancel" : "+ Add User"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-line rounded-xl p-5 mb-6 shadow-card">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Full name</label>
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Temporary password</label>
              <input
                required
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
                placeholder="e.g. Welcome123!"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, patient_id: "" })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              >
                <option value="doctor">Doctor</option>
                <option value="hospital_admin">Hospital Administrator</option>
                <option value="researcher">Healthcare Researcher</option>
                <option value="system_admin">System Administrator</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            {form.role === "patient" && (
              <div>
                <label className="block text-xs font-medium text-navy mb-1.5">Linked patient record</label>
                <select
                  required
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-line text-sm"
                >
                  <option value="">Select a patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {formError && <div className="text-sm text-risk-high mb-3">{formError}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create user"}
          </button>
        </form>
      )}

      <div className="bg-card border border-line rounded-xl shadow-card overflow-hidden">
        {error && <div className="px-5 py-4 text-sm text-risk-high bg-risk-high-bg">{error}</div>}
        {!error && loading && <div className="px-5 py-10 text-center text-sm text-muted">Loading…</div>}
        {users.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Email</th>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-navy font-medium">{u.full_name}</td>
                  <td className="px-5 py-3 text-xs text-muted">{u.email}</td>
                  <td className="px-5 py-3">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        u.is_active ? "bg-risk-low-bg text-risk-low" : "bg-line text-muted"
                      }`}
                    >
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.is_active && u.id !== user.id && (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="text-xs font-medium text-risk-high hover:underline"
                      >
                        Deactivate
                      </button>
                    )}
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
