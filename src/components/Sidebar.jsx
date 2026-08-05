import { Link, useLocation } from "react-router-dom";

import {
    FaChartLine,
    FaUserInjured,
    FaUserMd,
    FaFileMedical,
    FaUser,
    FaSignOutAlt,
    FaBrain
} from "react-icons/fa";

function Sidebar({ role }) {

    const location = useLocation();

    const adminMenu = [

        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: <FaChartLine />
        },

        {
            name: "Patients",
            path: "/admin/patients",
            icon: <FaUserInjured />
        },

        {
            name: "Doctors",
            path: "/admin/doctors",
            icon: <FaUserMd />
        },

        {
            name: "Reports",
            path: "/admin/reports",
            icon: <FaFileMedical />
        },

        {
            name: "Profile",
            path: "/admin/profile",
            icon: <FaUser />
        }

    ];

    const doctorMenu = [

        {
            name: "Dashboard",
            path: "/doctor/dashboard",
            icon: <FaChartLine />
        },

        {
            name: "Patients",
            path: "/doctor/patients",
            icon: <FaUserInjured />
        },

        {
            name: "Risk Prediction",
            path: "/doctor/prediction",
            icon: <FaBrain />
        },

        {
            name: "Profile",
            path: "/doctor/profile",
            icon: <FaUser />
        }

    ];

    const menu = role === "admin"
        ? adminMenu
        : doctorMenu;

    return (

        <aside className="sidebar">

            <div className="sidebar-logo">

                🏥

                <h2>

                    HealthForecast AI

                </h2>

            </div>

            <ul className="sidebar-menu">
                                {

                    menu.map((item) => (

                        <li
                            key={item.path}
                            className={
                                location.pathname === item.path
                                    ? "active"
                                    : ""
                            }
                        >

                            <Link to={item.path}>

                                {item.icon}

                                <span>

                                    {item.name}

                                </span>

                            </Link>

                        </li>

                    ))

                }

            </ul>

            <div className="sidebar-footer">

                <Link to="/">

                    <FaSignOutAlt />

                    <span>

                        Logout

                    </span>

                </Link>

            </div>

        </aside>

    );

}

export default Sidebar;