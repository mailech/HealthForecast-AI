import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CalendarClock, ShieldAlert, ClipboardCheck } from "lucide-react";

const recommendations = [
  { patient: "Vikram Rao", type: "Discharge Support", icon: ShieldAlert, color: "bg-rose-100 text-rose-700", note: "High readmission risk — arrange home care nurse visit within 48 hours of discharge." },
  { patient: "Ramesh Gupta", type: "Follow-up Planning", icon: CalendarClock, color: "bg-amber-100 text-amber-700", note: "Schedule follow-up appointment within 7 days; monitor HbA1c levels closely." },
  { patient: "Farhan Ali", type: "Risk Mitigation", icon: ShieldAlert, color: "bg-amber-100 text-amber-700", note: "Adjust diet plan and recheck glucose levels in 10 days to reduce readmission risk." },
  { patient: "Anita Sharma", type: "Care Recommendation", icon: ClipboardCheck, color: "bg-pista-100 text-pista-800", note: "Continue current medication; routine review in 2 weeks is sufficient." },
  { patient: "Sunita Desai", type: "Follow-up Planning", icon: CalendarClock, color: "bg-pista-100 text-pista-800", note: "Stable condition — standard 3-month check-up recommended." },
];

function CareRecommendations() {
  return (
    <div className="flex bg-pista-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header title="Care Recommendations" subtitle="AI-generated discharge & follow-up guidance" />

        <div className="space-y-4">
          {recommendations.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-pista-100 shadow-sm p-5 flex gap-4">
              <div className={`${r.color} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                <r.icon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-800">{r.patient}</p>
                  <span className="text-xs text-slate-400">• {r.type}</span>
                </div>
                <p className="text-sm text-slate-600">{r.note}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default CareRecommendations;