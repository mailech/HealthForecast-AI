import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  Database,
  BarChart3,
  FlaskConical,
  Settings,
  LogOut,
  UserCog,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {}

  const role = user.role?.toLowerCase();

  const menus = {
    researcher: [
      { name: "Overview", path: "/research", icon: LayoutDashboard },
      { name: "Cohort Analysis", path: "/research/cohort", icon: Users },
      { name: "AI Insights", path: "/research/insights", icon: BrainCircuit },
      { name: "Dataset Profile", path: "/research/dataset", icon: Database },
      { name: "ML Performance", path: "/research/ml-performance", icon: BarChart3 },
      { name: "Research", path: "/research/observations", icon: FlaskConical },
      { name: "Settings", path: "/settings", icon: Settings },
    ],

    doctor: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Patients", path: "/patients", icon: Users },
      { name: "Prediction", path: "/prediction", icon: BrainCircuit },
      { name: "Clinical Decision & Support", path: "/clinical-analytics", icon: FlaskConical },
      { name: "Reports", path: "/reports", icon: Database },
      { name: "Admission History", path: "/admission-history", icon: BarChart3 },
      { name: "Research", path: "/research", icon: FlaskConical },
      { name: "Settings", path: "/settings", icon: Settings },
    ],

    admin: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "User Management", path: "/users", icon: UserCog },
      { name: "Patients", path: "/patients", icon: Users },
      { name: "Prediction", path: "/prediction", icon: BrainCircuit },
      { name: "Admission History", path: "/admission-history", icon: BarChart3 },
      { name: "Clinical Decision & Support", path: "/clinical-analytics", icon: FlaskConical },
      { name: "Reports", path: "/reports", icon: Database },
      { name: "Research", path: "/research", icon: FlaskConical },
      { name: "Optimization", path: "/optimization", icon: BrainCircuit },
      { name: "Settings", path: "/settings", icon: Settings },
    ],

    staff: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Patients", path: "/patients", icon: Users },
      { name: "Admission History", path: "/admission-history", icon: BarChart3 },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
  };

  const themes = {
    admin: {
      accent: "#5F8064",
      hover: "hover:bg-[#5F8064]/10",
      label: "Administration",
    },
    doctor: {
      accent: "#3B82B6",
      hover: "hover:bg-[#3B82B6]/10",
      label: "Clinical Workspace",
    },
    staff: {
      accent: "#668A78",
      hover: "hover:bg-[#668A78]/10",
      label: "Operations Workspace",
    },
    researcher: {
      accent: "#C8755B",
      hover: "hover:bg-[#C8755B]/10",
      label: "Research Workspace",
    },
  };

  const theme = themes[role] || themes.admin;
  const items = menus[role] || menus.admin;

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("hf_token");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[245px] flex-col bg-[#0B1F33] text-white">

      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: theme.accent }}
          >
            <BrainCircuit size={21} />
          </div>

          <div>
            <h1 className="text-[16px] font-semibold">
              HealthForecast
            </h1>

            <p className="text-[10px] tracking-wide text-slate-400">
              AI HEALTHCARE PLATFORM
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          {theme.label}
        </p>

        <nav className="space-y-1">
          {items.map(item => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/research"}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${
                    isActive
                      ? "text-white shadow-lg shadow-black/10"
                      : `text-slate-300 ${theme.hover} hover:text-white`
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: theme.accent }
                    : {}
                }
              >
                <Icon size={17} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

    </aside>
  );
} 