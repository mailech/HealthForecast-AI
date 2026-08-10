import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AlertTriangle, Sparkles } from "lucide-react";
import { predictRisk, getRecommendation } from "../api/client";

function RiskPrediction() {
  const [form, setForm] = useState({
    time_in_hospital: 5,
    num_lab_procedures: 45,
    num_procedures: 1,
    num_medications: 15,
    number_outpatient: 0,
    number_emergency: 0,
    number_inpatient: 1,
    number_diagnoses: 9,
    age: "[70-80)",
    admission_type_id: 1,
    change: "Ch",
    diabetesMed: "Yes",
  });
  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setRecommendation(null);
    setLoading(true);
    try {
      const numericForm = {
        ...form,
        time_in_hospital: Number(form.time_in_hospital),
        num_lab_procedures: Number(form.num_lab_procedures),
        num_procedures: Number(form.num_procedures),
        num_medications: Number(form.num_medications),
        number_outpatient: Number(form.number_outpatient),
        number_emergency: Number(form.number_emergency),
        number_inpatient: Number(form.number_inpatient),
        number_diagnoses: Number(form.number_diagnoses),
        admission_type_id: Number(form.admission_type_id),
      };
      const data = await predictRisk(numericForm);
      setResult(data);
      const rec = await getRecommendation(data.risk_category, "General condition");
      setRecommendation(rec);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const riskColor =
    result?.risk_category === "High" ? "from-rose-500 to-red-600" :
    result?.risk_category === "Medium" ? "from-amber-500 to-orange-500" :
    "from-emerald-500 to-teal-600";

  return (
    <div className="flex bg-pista-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header title="Readmission Risk Prediction" subtitle="AI-generated risk score for a patient" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-pista-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-pista-600" />
              <h2 className="text-base font-semibold text-slate-800">Patient Clinical Data</h2>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <label className="text-sm text-slate-600">
                Time in hospital (days)
                <input name="time_in_hospital" type="number" value={form.time_in_hospital} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Lab procedures
                <input name="num_lab_procedures" type="number" value={form.num_lab_procedures} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Procedures
                <input name="num_procedures" type="number" value={form.num_procedures} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Medications
                <input name="num_medications" type="number" value={form.num_medications} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Outpatient visits
                <input name="number_outpatient" type="number" value={form.number_outpatient} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Emergency visits
                <input name="number_emergency" type="number" value={form.number_emergency} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Inpatient visits
                <input name="number_inpatient" type="number" value={form.number_inpatient} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Diagnoses count
                <input name="number_diagnoses" type="number" value={form.number_diagnoses} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Age bracket
                <select name="age" value={form.age} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400">
                  <option>[0-10)</option>
                  <option>[10-20)</option>
                  <option>[20-30)</option>
                  <option>[30-40)</option>
                  <option>[40-50)</option>
                  <option>[50-60)</option>
                  <option>[60-70)</option>
                  <option>[70-80)</option>
                  <option>[80-90)</option>
                  <option>[90-100)</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">
                Admission type ID
                <input name="admission_type_id" type="number" value={form.admission_type_id} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400" />
              </label>
              <label className="text-sm text-slate-600">
                Medication changed?
                <select name="change" value={form.change} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400">
                  <option value="Ch">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">
                On diabetes medication?
                <select name="diabetesMed" value={form.diabetesMed} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pista-400">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>

              <button type="submit" disabled={loading} className="col-span-2 bg-gradient-to-r from-pista-500 to-emerald-600 hover:from-pista-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition mt-2 shadow-lg shadow-pista-500/25">
                {loading ? "Predicting..." : "Predict Readmission Risk"}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {result ? (
              <div className={"bg-gradient-to-br " + riskColor + " rounded-2xl p-6 text-white shadow-lg"}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-medium text-white/90">Risk Assessment</span>
                </div>
                <p className="text-4xl font-bold">{(result.readmission_probability * 100).toFixed(1)}%</p>
                <p className="text-white/90 text-sm mt-1">{result.risk_category} Risk of Readmission</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-pista-100 border-dashed p-6 text-center text-slate-400 text-sm">
                Fill in the form and click predict to see the AI risk score.
              </div>
            )}

            {recommendation && (
              <div className="bg-white rounded-2xl border border-pista-100 shadow-sm p-6 text-sm space-y-3">
                <h3 className="text-base font-semibold text-slate-800 mb-2">Care Plan</h3>
                <div>
                  <p className="text-xs font-semibold text-pista-700 uppercase tracking-wide mb-1">Care Recommendation</p>
                  <p className="text-slate-600">{recommendation.care_recommendation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-pista-700 uppercase tracking-wide mb-1">Follow-up Plan</p>
                  <p className="text-slate-600">{recommendation.follow_up_plan}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-pista-700 uppercase tracking-wide mb-1">Risk Mitigation</p>
                  <p className="text-slate-600">{recommendation.risk_mitigation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-pista-700 uppercase tracking-wide mb-1">Discharge Support</p>
                  <p className="text-slate-600">{recommendation.discharge_support}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RiskPrediction;