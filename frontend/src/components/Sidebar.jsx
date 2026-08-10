import { HeartPulse, LayoutDashboard, Users, Activity, FileBarChart, ClipboardList, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("hf_role") || "Doctor";

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: Activity, label: "Risk Prediction", path: "/risk-prediction", badge: 2 },
    { icon: ClipboardList, label: "Care Recommendations", path: "/care-recommendations" },
    { icon: FileBarChart, label: "Reports", path: "/reports" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-pista-100 h-screen flex flex-col sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-pista-100">
        <div className="bg-pista-500 p-2 rounded-lg">
          <HeartPulse className="text-white" size={20} />
        </div>
        <span className="font-bold text-slate-800 text-lg">HealthForecast</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active ? "bg-pista-100 text-pista-800" : "text-slate-600 hover:bg-pista-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </span>
              {item.badge && (
                <span className="bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-pista-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-semibold text-slate-700">{role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;