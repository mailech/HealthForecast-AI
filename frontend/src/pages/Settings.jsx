import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  User,
  Bell,
  Lock,
  Palette,
  Save,
} from "lucide-react";

function Settings() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [name, setName] = useState(
    storedUser.name || ""
  );

  const [email, setEmail] = useState(
    storedUser.email || ""
  );

  const [notifications, setNotifications] =
    useState(
      localStorage.getItem("hf_notifications") !==
        "false"
    );

  const [theme, setTheme] = useState(
    localStorage.getItem("hf_theme") || "Light"
  );


  // ==========================================================
  // APPLY THEME
  // ==========================================================

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;

    if (selectedTheme === "Dark") {

      root.classList.add("dark");

    } else if (selectedTheme === "Light") {

      root.classList.remove("dark");

    } else {

      const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

    }
  };


  // ==========================================================
  // LOAD SAVED THEME
  // ==========================================================

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);


  // ==========================================================
  // SYSTEM THEME LISTENER
  // ==========================================================

  useEffect(() => {

    if (theme !== "System") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemTheme = () => {
      applyTheme("System");
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemTheme
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemTheme
      );
    };

  }, [theme]);


  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = () => {

    const updatedUser = {
      ...storedUser,
      name,
      email,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem(
      "hf_notifications",
      String(notifications)
    );

    localStorage.setItem(
      "hf_theme",
      theme
    );

    applyTheme(theme);

    alert(
      "Settings saved successfully!"
    );
  };


  return (
    <MainLayout>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Settings
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and application preferences
        </p>

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* ====================================================
            LEFT MENU
        ==================================================== */}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 h-fit">

          <button
            type="button"
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              rounded-lg
              bg-blue-50
              dark:bg-blue-900/30
              text-blue-600
              dark:text-blue-400
              font-medium
            "
          >

            <User size={19} />

            Profile

          </button>


          <button
            type="button"
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              rounded-lg
              text-gray-600
              dark:text-gray-300
              hover:bg-gray-50
              dark:hover:bg-slate-700
            "
          >

            <Bell size={19} />

            Notifications

          </button>


          <button
            type="button"
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              rounded-lg
              text-gray-600
              dark:text-gray-300
              hover:bg-gray-50
              dark:hover:bg-slate-700
            "
          >

            <Lock size={19} />

            Security

          </button>


          <button
            type="button"
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              rounded-lg
              text-gray-600
              dark:text-gray-300
              hover:bg-gray-50
              dark:hover:bg-slate-700
            "
          >

            <Palette size={19} />

            Appearance

          </button>

        </div>


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="lg:col-span-2 space-y-6">


          {/* ==================================================
              PROFILE
          ================================================== */}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">

                <User className="text-blue-600 dark:text-blue-400" />

              </div>

              <div>

                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Profile Information
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update your personal information
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="
                    w-full
                    border border-gray-300
                    dark:border-slate-600
                    bg-white dark:bg-slate-700
                    text-slate-800 dark:text-white
                    rounded-lg
                    px-4 py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  type="email"
                  className="
                    w-full
                    border border-gray-300
                    dark:border-slate-600
                    bg-white dark:bg-slate-700
                    text-slate-800 dark:text-white
                    rounded-lg
                    px-4 py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">

                <Bell className="text-yellow-600 dark:text-yellow-400" />

              </div>

              <div>

                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Notifications
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Control important healthcare alerts
                </p>

              </div>

            </div>


            <label className="flex items-center justify-between cursor-pointer">

              <div>

                <p className="font-medium text-slate-800 dark:text-white">
                  Healthcare Alerts
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive high-risk patient and new admission notifications
                </p>

              </div>

              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) =>
                  setNotifications(
                    e.target.checked
                  )
                }
                className="w-5 h-5"
              />

            </label>

          </div>


          {/* ==================================================
              APPEARANCE
          ================================================== */}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">

                <Palette className="text-purple-600 dark:text-purple-400" />

              </div>

              <div>

                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Appearance
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customize the application appearance
                </p>

              </div>

            </div>


            <div>

              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-2">
                Theme
              </label>

              <select
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value)
                }
                className="
                  w-full
                  border border-gray-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-800 dark:text-white
                  rounded-lg
                  px-4 py-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              >

                <option value="Light">
                  Light
                </option>

                <option value="Dark">
                  Dark
                </option>

                <option value="System">
                  System Default
                </option>

              </select>

            </div>

          </div>


          {/* ==================================================
              SAVE
          ================================================== */}

          <div className="flex justify-end">

            <button
              onClick={handleSave}
              className="
                flex items-center gap-2
                bg-blue-600
                text-white
                px-6 py-3
                rounded-lg
                hover:bg-blue-700
                transition
              "
            >

              <Save size={18} />

              Save Changes

            </button>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Settings; 