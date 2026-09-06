import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CalendarClock, ShieldAlert, ClipboardCheck } from "lucide-react";
import { getPatientRecommendations } from "../api/client";

const riskStyles = {
  High: { icon: ShieldAlert, color: "bg-rose-100 text-rose-700" },
  Medium: { icon: CalendarClock, color: "bg-amber-100 text-amber-700" },
  Low: { icon: ClipboardCheck, color: "bg-pista-100 text-pista-800" },
};

function CareRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientRecommendations()
      .then((data) => setRecommendations(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-pista-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header title="Care Recommendations" subtitle="AI-generated discharge & follow-up guidance" />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading && <p className="text-slate-500 text-sm">Loading recommendations...</p>}

        <div className="space-y-4">
          {recommendations.map((r) => {
            const style = riskStyles[r.risk_category] || riskStyles.Medium;
            return (
              <div key={r.patient_id} className="bg-white rounded-xl border border-pista-100 shadow-sm p-5 flex gap-4">
                <div className={`${style.color} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                  <style.icon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800">{r.patient_name}</p>
                    <span className="text-xs text-slate-400">• {r.risk_category} Risk</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{r.care_recommendation}</p>
                  <p className="text-xs text-slate-500">Follow-up: {r.follow_up_plan}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default CareRecommendations;