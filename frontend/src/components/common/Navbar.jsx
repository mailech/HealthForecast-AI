import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  LogOut,
  AlertTriangle,
  Hospital,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [notifications, setNotifications] =
    useState([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await api.get(
        "/notifications/"
      );

      setNotifications(
        response.data?.notifications || []
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(
      fetchNotifications,
      30000
    );

    return () => clearInterval(interval);
  }, []);

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
  // NOTIFICATION ICON
  // ==========================================================

  const getNotificationIcon = (type) => {
    if (type === "high_risk") {
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle
            size={18}
            className="text-red-600 dark:text-red-400"
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <Hospital
          size={18}
          className="text-blue-600 dark:text-blue-400"
        />
      </div>
    );
  };

  return (
    <div className="relative bg-white dark:bg-slate-800 h-20 shadow flex items-center justify-between px-8 border-b border-slate-100 dark:border-slate-700">

      {/* ====================================================
          SEARCH
      ==================================================== */}

      <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 w-80">

        <Search
          size={18}
          className="text-gray-500 dark:text-gray-400"
        />

        <input
          type="text"
          placeholder="Search patients..."
          className="bg-transparent outline-none ml-3 w-full text-slate-800 dark:text-white placeholder:text-gray-400"
        />

      </div>


      {/* ====================================================
          RIGHT SIDE
      ==================================================== */}

      <div className="flex items-center gap-5">

        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="relative">

          <button
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Notifications"
          >

            <Bell
              size={22}
              className="text-slate-700 dark:text-gray-200"
            />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications.length > 9
                  ? "9+"
                  : notifications.length}
              </span>
            )}

          </button>


          {/* ==================================================
              NOTIFICATION DROPDOWN
          ================================================== */}

          {showNotifications && (

            <div className="absolute right-0 top-14 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">

              {/* HEADER */}

              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">

                <div>

                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Notifications
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {notifications.length} alert
                    {notifications.length !== 1
                      ? "s"
                      : ""}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X
                    size={18}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </button>

              </div>


              {/* BODY */}

              <div className="max-h-[420px] overflow-y-auto">

                {loadingNotifications && (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading notifications...
                  </div>
                )}


                {!loadingNotifications &&
                  notifications.length === 0 && (

                    <div className="p-8 text-center">

                      <Bell
                        size={35}
                        className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                      />

                      <p className="font-medium text-gray-600 dark:text-gray-300">
                        No notifications
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        You're all caught up.
                      </p>

                    </div>

                  )}


                {!loadingNotifications &&
                  notifications.map(
                    (notification) => (

                      <button
                        key={notification.id}
                        onClick={() => {
                          if (
                            notification.patient_id
                          ) {
                            navigate(
                              `/patients/${notification.patient_id}`
                            );
                            setShowNotifications(
                              false
                            );
                          }
                        }}
                        className="w-full text-left px-5 py-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                      >

                        <div className="flex gap-3">

                          {getNotificationIcon(
                            notification.type
                          )}

                          <div className="flex-1 min-w-0">

                            <div className="flex items-center justify-between gap-2">

                              <p className="font-semibold text-sm text-slate-800 dark:text-white">
                                {notification.title}
                              </p>

                              {notification.type ===
                                "high_risk" && (
                                <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                                  HIGH RISK
                                </span>
                              )}

                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-5">
                              {notification.message}
                            </p>

                          </div>

                        </div>

                      </button>

                    )
                  )}

              </div>

            </div>

          )}

        </div>


        {/* ==================================================
            USER
        ================================================== */}

        <div className="text-right">

          <h3 className="font-semibold text-slate-800 dark:text-white">
            {user.name || "Test User"}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {user.role || "Patient"}
          </p>

        </div>


        {/* ==================================================
            PROFILE
        ================================================== */}

        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold">

          {(user.name || "T")
            .charAt(0)
            .toUpperCase()}

        </div>


        {/* ==================================================
            LOGOUT
        ================================================== */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          title="Logout"
        >

          <LogOut size={19} />

          <span className="hidden lg:inline">
            Logout
          </span>

        </button>

      </div>

    </div>
  );
}

export default Navbar; 