import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Brain,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Unable to read logged-in user:", error);
      }
    }
  }, []);

  const role = user?.role || "doctor";

  const roleDetails = {
    doctor: {
      label: "Doctor",
      description: "Clinical workspace",
      icon: Stethoscope,
    },
    hospital_admin: {
      label: "Hospital Administrator",
      description: "Hospital operations",
      icon: ShieldCheck,
    },
    healthcare_researcher: {
      label: "Healthcare Researcher",
      description: "Research workspace",
      icon: BarChart3,
    },
    system_admin: {
      label: "System Administrator",
      description: "Platform administration",
      icon: ShieldCheck,
    },
  };

  const currentRole = roleDetails[role] || roleDetails.doctor;
  const RoleIcon = currentRole.icon;

  const commonNavigation = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Analytics",
      to: "/analytics",
      icon: BarChart3,
    },
    {
      label: "Reports",
      to: "/reports",
      icon: FileText,
    },
  ];

  const roleNavigation = {
    doctor: [
      {
        label: "Patients",
        to: "/patients",
        icon: Users,
      },
      {
        label: "Clinical Decision Support",
        to: "/clinical-decision-support",
        icon: Brain,
      },
    ],
    hospital_admin: [],
    healthcare_researcher: [],
    system_admin: [
      {
        label: "Patients",
        to: "/patients",
        icon: Users,
      },
    ],
  };

  const navigation = [
    commonNavigation[0],
    ...(roleNavigation[role] || []),
    commonNavigation[1],
    commonNavigation[2],
  ];

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col bg-slate-950 text-white">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 shadow-lg shadow-cyan-500/20">
            <HeartPulse size={24} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight">
              HealthForecast
            </p>
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300">
              AI PLATFORM
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span className="text-xs font-semibold text-emerald-300">
            AI Platform Online
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.4 : 2}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-500 transition group-hover:text-cyan-300"
                      }
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Role information */}
        <div className="mt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Access
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <RoleIcon size={19} className="text-cyan-300" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {currentRole.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {currentRole.description}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span className="text-[11px] font-medium text-slate-400">
                Role-based access enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User / Sign out */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-cyan-300 ring-1 ring-white/10">
            {getInitials(user?.name)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {currentRole.label}
            </p>
          </div>

          <UserRound size={16} className="shrink-0 text-slate-600" />
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut
            size={18}
            className="text-slate-500 transition group-hover:text-red-300"
          />
          Sign out
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-600">
          <Activity size={11} />
          Secure healthcare workspace
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
