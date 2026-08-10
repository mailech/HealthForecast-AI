import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Users, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getPatients } from "../api/client";

const trendData = [
  { month: "Jan", readmissions: 42 },
  { month: "Feb", readmissions: 38 },
  { month: "Mar", readmissions: 45 },
  { month: "Apr", readmissions: 33 },
  { month: "May", readmissions: 29 },
  { month: "Jun", readmissions: 25 },
];

function Dashboard() {
  const [totalPatients, setTotalPatients] = useState(null);

  useEffect(() => {
    getPatients()
      .then((data) => setTotalPatients(data.length))
      .catch(() => setTotalPatients(null));
  }, []);

  const stats = [
    { label: "Total Patients", value: totalPatients !== null ? totalPatients : "...", icon: Users, gradient: "from-pista-500 to-pista-600" },
    { label: "High-Risk Patients", value: "87", icon: AlertTriangle, gradient: "from-amber-500 to-orange-500" },
    { label: "Readmission Rate", value: "12.4%", icon: TrendingUp, gradient: "from-rose-500 to-pink-600" },
    { label: "Model Accuracy", value: "89%", icon: Activity, gradient: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="flex bg-pista-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header title="Dashboard Overview" subtitle="Hospital-wide patient risk & readmission summary" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className={"bg-gradient-to-br " + stat.gradient + " rounded-2xl p-5 shadow-lg shadow-slate-900/5 text-white relative overflow-hidden"}>
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10"></div>
              <div className="bg-white/20 w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative z-10">
                <stat.icon className="text-white" size={22} />
              </div>
              <p className="text-3xl font-bold relative z-10">{stat.value}</p>
              <p className="text-sm text-white/85 mt-1 relative z-10">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-pista-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Readmission Trend</h2>
              <p className="text-sm text-slate-400">Last 6 months, hospital-wide</p>
            </div>
            <span className="text-xs font-medium text-pista-700 bg-pista-50 px-3 py-1.5 rounded-full border border-pista-100">
              Down 40% vs. Jan
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f7e9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e6f3d9" }} />
              <Line type="monotone" dataKey="readmissions" stroke="#5f9530" strokeWidth={3} dot={{ r: 4, fill: "#5f9530", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;