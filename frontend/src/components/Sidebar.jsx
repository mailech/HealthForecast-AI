import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaUserInjured,
  FaHeartbeat,
  FaHospital,
  FaPills,
  FaChartBar,
  FaFileMedical,
  FaUserCircle,
  FaSignOutAlt,
  FaUsers,
  FaDatabase,
  FaRobot,
  FaClipboardList,
  FaCog,
  FaFlask,
  FaDownload,
  FaChartLine,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();

  // Get logged-in user
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const role = user?.role;
  // --------------------------------------------------
// DOCTOR MENU
// --------------------------------------------------

const doctorMenus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaChartPie />,
  },
  {
    name: "My Patients",
    path: "/patients",
    icon: <FaUserInjured />,
  },
  {
    name: "Risk Prediction",
    path: "/risk-prediction",
    icon: <FaHeartbeat />,
  },
  {
    name: "Re-admission",
    path: "/readmission",
    icon: <FaHospital />,
  },
  {
    name: "Treatment Effectiveness",
    path: "/treatment",
    icon: <FaPills />,
  },
  {
    name: "Care Recommendations",
    path: "/care-recommendations",
    icon: <FaHeartbeat />,
  },
  {
    name: "Follow-up Planning",
    path: "/follow-up-planning",
    icon: <FaClipboardList />,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <FaChartBar />,
  },
  {
    name: "Patient Outcome Reports",
    path: "/reports",
    icon: <FaFileMedical />,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: <FaUserCircle />,
  },
];

  // --------------------------------------------------
  // HOSPITAL ADMINISTRATOR MENU
  // --------------------------------------------------

  const hospitalAdminMenus = [
    {
      name: "Hospital Dashboard",
      path: "/hospital-dashboard",
      icon: <FaChartPie />,
    },
    {
      name: "Patients",
      path: "/patients",
      icon: <FaUserInjured />,
    },
    {
      name: "Hospital Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },
    {
      name: "Readmission Statistics",
      path: "/readmission",
      icon: <FaHospital />,
    },
    {
      name: "Treatment Effectiveness",
      path: "/treatment",
      icon: <FaPills />,
    },
    {
      name: "Department Performance",
      path: "/department-performance",
      icon: <FaChartLine />,
    },
    {
      name: "Operational Reports",
      path: "/reports",
      icon: <FaFileMedical />,
    },
    {
      name: "Export Analytics",
      path: "/export",
      icon: <FaDownload />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <FaUserCircle />,
    },
  ];

  // --------------------------------------------------
  // HEALTHCARE RESEARCHER MENU
  // --------------------------------------------------

  const researcherMenus = [
    {
      name: "Research Dashboard",
      path: "/research-dashboard",
      icon: <FaChartPie />,
    },
    {
      name: "Population Analytics",
      path: "/research/analytics",
      icon: <FaChartBar />,
    },
    {
      name: "Readmission Trends",
      path: "/research/readmission-trends",
      icon: <FaChartLine />,
    },
    {
      name: "Treatment Effectiveness",
      path: "/research/treatment-effectiveness",
      icon: <FaPills />,
    },
    {
      name: "Research Dataset",
      path: "/research/dataset",
      icon: <FaDatabase />,
    },
    {
      name: "Population Health",
      path: "/research/population-health",
      icon: <FaFlask />,
    },
    {
      name: "Analytical Reports",
      path: "/research/reports",
      icon: <FaFileMedical />,
    },
    {
      name: "Export Dataset",
      path: "/research/dataset/export",
      icon: <FaDownload />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <FaUserCircle />,
    },
  ];

// --------------------------------------------------
// SYSTEM ADMINISTRATOR MENU
// --------------------------------------------------

const systemAdminMenus = [
  {
    name: "System Dashboard",
    path: "/admin",
    icon: <FaChartPie />,
  },
  {
    name: "All Patients",
    path: "/patients",
    icon: <FaUserInjured />,
  },
  {
    name: "Hospital Analytics",
    path: "/analytics",
    icon: <FaChartBar />,
  },
  {
    name: "Reports",
    path: "/export",
    icon: <FaFileMedical />,
  },
  {
    name: "Users & Roles",
    path: "/admin/users",
    icon: <FaUsers />,
  },
  {
    name: "Datasets",
    path: "/admin/datasets",
    icon: <FaDatabase />,
  },
  {
    name: "AI Model",
    path: "/readmission",
    icon: <FaRobot />,
  },
  {
    name: "Audit Logs",
    path: "/admin/audit-logs",
    icon: <FaClipboardList />,
  },
  {
    name: "System Settings",
    path: "/admin/settings",
    icon: <FaCog />,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: <FaUserCircle />,
  },
];
  // --------------------------------------------------
  // SELECT MENU BASED ON ROLE
  // --------------------------------------------------

  let menus = [];

  if (role === "Doctor") {
    menus = doctorMenus;
  } else if (role === "Hospital Administrator") {
    menus = hospitalAdminMenus;
  } else if (role === "Healthcare Researcher") {
    menus = researcherMenus;
  } else if (role === "System Administrator") {
    menus = systemAdminMenus;
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <aside className="w-72 min-h-screen bg-slate-900 text-white p-6">

      <h1 className="text-3xl font-bold text-center mb-10 text-blue-400">
        HealthForecast AI
      </h1>

      <ul className="space-y-3">

        {menus.map((menu) => (
          <li key={menu.name}>
            <NavLink
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-4 p-4 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              <span className="text-lg">
                {menu.icon}
              </span>

              <span>{menu.name}</span>
            </NavLink>
          </li>
        ))}

        {/* Logout */}
        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition hover:bg-slate-800 text-left"
          >
            <span className="text-lg">
              <FaSignOutAlt />
            </span>

            <span>Logout</span>
          </button>
        </li>

      </ul>

    </aside>
  );
}

export default Sidebar;