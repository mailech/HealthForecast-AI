import { NavLink } from "react-router-dom";
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
} from "react-icons/fa";

const menus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaChartPie />,
  },
  {
    name: "Patients",
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
    name: "Treatment",
    path: "/treatment",
    icon: <FaPills />,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <FaChartBar />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FaFileMedical />,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: <FaUserCircle />,
  },
  {
    name: "Logout",
    path: "/",
    icon: <FaSignOutAlt />,
  },
];

function Sidebar() {
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
              <span className="text-lg">{menu.icon}</span>
              <span>{menu.name}</span>
            </NavLink>
          </li>
        ))}

      </ul>

    </aside>
  );
}

export default Sidebar;