"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { RiskIndicator } from "@/components/RiskIndicator";

interface Patient {
  id: string;
  full_name: string;
  mrn: string;
  gender: string;
  date_of_birth: string;
}

interface Admission {
  id: string;
  admitted_on: string;
  time_in_hospital: number | null;
  num_medications: number | null;
  number_inpatient: number | null;
  number_emergency: number | null;
  primary_diagnosis: string | null;
}

interface RiskScore {
  admission_id: string;
  readmission_probability: number;
  risk_category: string;
  model_version: string;
  generated_at: string;
}

interface Bill {
  id: string;
  admission_id: string;
  room_charges: number;
  procedure_charges: number;
  medication_charges: number;
  lab_charges: number;
  other_charges: number;
  insurance_covered: number;
  total_amount: number;
  patient_responsibility: number;
  status: string;
  issued_on: string;
}

const emptyAdmissionForm = {
  admitted_on: new Date().toISOString().slice(0, 10),
  time_in_hospital: 3,
  num_medications: 5,
  number_outpatient: 0,
  number_emergency: 0,
  number_inpatient: 0,
  number_diagnoses: 3,
  primary_diagnosis: "",
};

const emptyBillForm = {
  room_charges: 0,
  procedure_charges: 0,
  medication_charges: 0,
  lab_charges: 0,
  other_charges: 0,
  insurance_covered: 0,
  status: "pending",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [riskScores, setRiskScores] = useState<Record<string, RiskScore>>({});
  const [bills, setBills] = useState<Record<string, Bill>>({});
  const [billFormFor, setBillFormFor] = useState<string | null>(null);
  const [billForm, setBillForm] = useState(emptyBillForm);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAdmissionForm);
  const [error, setError] = useState<string | null>(null);
  const [predicting, setPredicting] = useState<string | null>(null);

  function loadAll() {
    api.get<Patient>(`/patients/${id}`).then(setPatient).catch((e) => setError(e.message));
    api
      .get<Admission[]>(`/admissions/patient/${id}`)
      .then((rows) => {
        setAdmissions(rows);
        api.get<RiskScore[]>(`/risk/patient/${id}`).then((scores) => {
          const map: Record<string, RiskScore> = {};
          scores.forEach((s) => (map[s.admission_id] = s));
          setRiskScores(map);
        });
        api.get<Bill[]>(`/billing/patient/${id}`).then((rows) => {
          const map: Record<string, Bill> = {};
          rows.forEach((b) => (map[b.admission_id] = b));
          setBills(map);
        });
      })
      .catch((e) => setError(e.message));
  }

  useEffect(loadAll, [id]);

  async function handleCreateAdmission(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/admissions", { patient_id: id, ...form });
      setShowForm(false);
      setForm(emptyAdmissionForm);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admission");
    }
  }

  async function handlePredict(admissionId: string) {
    setPredicting(admissionId);
    try {
      const score = await api.post<RiskScore>(`/risk/predict/${admissionId}`);
      setRiskScores((prev) => ({ ...prev, [admissionId]: score }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setPredicting(null);
    }
  }

  async function handleCreateBill(e: React.FormEvent, admissionId: string) {
    e.preventDefault();
    try {
      const bill = await api.post<Bill>("/billing", {
        admission_id: admissionId,
        issued_on: new Date().toISOString().slice(0, 10),
        ...billForm,
      });
      setBills((prev) => ({ ...prev, [admissionId]: bill }));
      setBillFormFor(null);
      setBillForm(emptyBillForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bill");
    }
  }

  if (error) return <div className="text-sm text-risk-high bg-risk-high-bg rounded-lg p-4">{error}</div>;
  if (!patient) return <div className="text-sm text-muted">Loading…</div>;

  return (
    <>
      <header className="mb-6">
        <div className="text-xs text-muted mb-1 font-mono">{patient.mrn}</div>
        <h1 className="font-display text-2xl text-navy">{patient.full_name}</h1>
        <p className="text-sm text-muted mt-1">
          {patient.gender} · DOB {patient.date_of_birth}
        </p>
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base text-navy">Admissions</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-3.5 py-1.5 rounded-lg bg-teal text-white text-xs font-medium hover:bg-teal-dark transition"
        >
          {showForm ? "Cancel" : "+ New admission"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateAdmission} className="bg-card border border-line rounded-xl p-5 mb-6 shadow-card">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Admitted on</label>
              <input
                type="date"
                required
                value={form.admitted_on}
                onChange={(e) => setForm({ ...form, admitted_on: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Diagnosis</label>
              <input
                value={form.primary_diagnosis}
                onChange={(e) => setForm({ ...form, primary_diagnosis: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
                placeholder="e.g. Type 2 diabetes"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Days in hospital</label>
              <input
                type="number"
                min={0}
                value={form.time_in_hospital}
                onChange={(e) => setForm({ ...form, time_in_hospital: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Medications</label>
              <input
                type="number"
                min={0}
                value={form.num_medications}
                onChange={(e) => setForm({ ...form, num_medications: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Prior emergency visits</label>
              <input
                type="number"
                min={0}
                value={form.number_emergency}
                onChange={(e) => setForm({ ...form, number_emergency: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Prior inpatient stays</label>
              <input
                type="number"
                min={0}
                value={form.number_inpatient}
                onChange={(e) => setForm({ ...form, number_inpatient: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition">
            Save admission
          </button>
        </form>
      )}

      <div className="bg-card border border-line rounded-xl shadow-card overflow-hidden">
        {admissions.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted">No admissions recorded yet.</div>
        )}
        {admissions.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
                <th className="px-5 py-2.5 font-medium">Admitted</th>
                <th className="px-5 py-2.5 font-medium">Diagnosis</th>
                <th className="px-5 py-2.5 font-medium">Days</th>
                <th className="px-5 py-2.5 font-medium">Readmission risk</th>
                <th className="px-5 py-2.5 font-medium">Bill</th>
                <th className="px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((a) => {
                const score = riskScores[a.id];
                const bill = bills[a.id];
                return (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-muted">{a.admitted_on}</td>
                    <td className="px-5 py-3">{a.primary_diagnosis || "—"}</td>
                    <td className="px-5 py-3">{a.time_in_hospital ?? "—"}</td>
                    <td className="px-5 py-3">
                      {score ? (
                        <RiskIndicator probability={score.readmission_probability} />
                      ) : (
                        <span className="text-xs text-muted">Not yet assessed</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {bill ? (
                        <div>
                          <div className="font-mono text-sm text-navy font-medium">{formatCurrency(bill.total_amount)}</div>
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                              bill.status === "paid"
                                ? "bg-risk-low-bg text-risk-low"
                                : bill.status === "overdue"
                                ? "bg-risk-high-bg text-risk-high"
                                : "bg-amber-light text-amber"
                            }`}
                          >
                            {bill.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">No bill yet</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handlePredict(a.id)}
                        disabled={predicting === a.id}
                        className="text-xs font-medium text-teal hover:underline disabled:opacity-50"
                      >
                        {predicting === a.id ? "Running…" : score ? "Re-run" : "Predict risk"}
                      </button>
                      <button
                        onClick={() => {
                          setBillFormFor(billFormFor === a.id ? null : a.id);
                          setBillForm(bill ? { ...bill, status: bill.status } : emptyBillForm);
                        }}
                        className="text-xs font-medium text-indigo hover:underline"
                      >
                        {bill ? "Edit bill" : "Generate bill"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {billFormFor && (
        <form
          onSubmit={(e) => handleCreateBill(e, billFormFor)}
          className="bg-card border border-line rounded-xl p-5 mt-4 shadow-card"
        >
          <h3 className="font-display text-base text-navy mb-4">Hospital bill</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {(
              [
                ["room_charges", "Room charges"],
                ["procedure_charges", "Procedure charges"],
                ["medication_charges", "Medication charges"],
                ["lab_charges", "Lab charges"],
                ["other_charges", "Other charges"],
                ["insurance_covered", "Insurance covered"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-navy mb-1.5">{label} (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={billForm[field]}
                  onChange={(e) => setBillForm({ ...billForm, [field]: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-line text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">Status</label>
              <select
                value={billForm.status}
                onChange={(e) => setBillForm({ ...billForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition">
              Save bill
            </button>
            <button
              type="button"
              onClick={() => setBillFormFor(null)}
              className="px-4 py-2 rounded-lg text-sm text-muted hover:text-navy transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}
