import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);

  // Get logged-in user
  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="h-20 bg-white shadow flex items-center justify-between px-8">

      {/* Logo */}

      <h1 className="text-2xl font-bold text-slate-700">
        HealthForecast AI
      </h1>


      {/* Right Side */}

      <div className="flex items-center gap-6">

        {/* Notification */}

        <button
          className="relative text-gray-600 hover:text-blue-600 transition"
        >
          <FaBell className="text-2xl cursor-pointer" />

          {/* Notification dot */}

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full">
          </span>
        </button>


        {/* User */}

        <div className="relative">

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-2 py-1 transition"
          >

            <FaUserCircle className="text-4xl text-blue-600" />

            {user && (
              <div className="hidden md:block text-left">

                <p className="font-semibold text-slate-700">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.role}
                </p>

              </div>
            )}

          </button>


          {/* Dropdown */}

          {showMenu && (

            <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">

              {/* User Info */}

              {user && (
                <div className="px-4 py-3 border-b">

                  <p className="font-semibold text-slate-700">
                    {user.name}
                  </p>

                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>

                </div>
              )}


              {/* Profile */}

              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 transition"
              >

                <FaUser className="text-blue-600" />

                <span>
                  Profile
                </span>

              </button>


              {/* Logout */}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition"
              >

                <FaSignOutAlt />

                <span>
                  Logout
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;