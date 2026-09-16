import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Brain,
  Settings,
  LogOut,
  Activity,
  ClipboardList,
  BarChart3,
  FlaskConical,
  Zap,
  UserCog,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role || "staff";

  // ==========================================================
  // MENU ITEMS
  // ==========================================================

  const allMenuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      roles: [
        "admin",
        "doctor",
        "staff",
        "researcher",
      ],
    },

    {
      name: "Patients",
      path: "/patients",
      icon: <Users size={20} />,
      roles: [
        "admin",
        "doctor",
        "staff",
      ],
    },

    {
      name: "Prediction",
      path: "/prediction",
      icon: <Brain size={20} />,
      roles: [
        "admin",
        "doctor",
      ],
    },

    {
      name: "Admission History",
      path: "/admission-history",
      icon: <ClipboardList size={20} />,
      roles: [
        "admin",
        "doctor",
        "staff",
      ],
    },

    {
      name: "Clinical Analytics",
      path: "/clinical-analytics",
      icon: <BarChart3 size={20} />,
      roles: [
        "admin",
        "doctor",
        "staff",
        "researcher",
      ],
    },

    {
      name: "User Management",
      path: "/users",
      icon: <UserCog size={20} />,
      roles: [
        "admin",
      ],
    },

    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
      roles: [
        "admin",
        "doctor",
        "staff",
        "researcher",
      ],
    },

    {
      name: "Research",
      path: "/research",
      icon: <FlaskConical size={20} />,
      roles: [
        "admin",
        "doctor",
        "researcher",
      ],
    },

    {
      name: "Optimization",
      path: "/optimization",
      icon: <Zap size={20} />,
      roles: [
        "admin",
        "doctor",
        "staff",
      ],
    },
  ];

  // ==========================================================
  // ROLE FILTER
  // ==========================================================

  const menuItems = allMenuItems.filter(
    (item) => item.roles.includes(role)
  );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("hf_token");

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <aside
      className="
        w-64
        bg-white
        dark:bg-slate-800
        shadow-lg
        min-h-screen
        flex flex-col
        border-r
        border-slate-100
        dark:border-slate-700
      "
    >

      {/* ====================================================
          LOGO
      ==================================================== */}

      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-700">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">

            <Activity
              size={22}
              className="text-white"
            />

          </div>

          <div>

            <h1 className="text-lg font-bold text-slate-800 dark:text-white">
              HealthForecast
            </h1>

            <p className="text-xs text-blue-600 font-medium">
              AI Healthcare
            </p>

          </div>

        </div>

      </div>


      {/* ====================================================
          NAVIGATION
      ==================================================== */}

      <nav className="flex-1 px-4 py-6">

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>

        <div className="space-y-2">

          {menuItems.map((item) => (

            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                }`
              }
            >

              {item.icon}

              <span className="font-medium">
                {item.name}
              </span>

            </NavLink>

          ))}

        </div>

      </nav>


      {/* ====================================================
          BOTTOM SECTION
      ==================================================== */}

      <div className="px-4 pb-5">

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          className="
            w-full
            flex items-center gap-3
            px-4 py-3
            rounded-xl
            text-red-600
            hover:bg-red-50
            dark:hover:bg-red-900/20
            transition-all duration-200
          "
        >

          <LogOut size={20} />

          <span className="font-medium">
            Logout
          </span>

        </button>


        {/* VERSION */}

        <div className="mt-5 px-4 pt-4 border-t border-slate-100 dark:border-slate-700">

          <p className="text-xs text-gray-400">
            HealthForecast AI
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Version 1.0.0
          </p>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar; 