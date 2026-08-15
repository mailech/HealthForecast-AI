import { useState } from "react";
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
    storedUser.name || "Test User"
  );

  const [email, setEmail] = useState(
    storedUser.email || ""
  );

  const [notifications, setNotifications] =
    useState(true);

  const [emailAlerts, setEmailAlerts] =
    useState(true);

  const [theme, setTheme] = useState("Light");

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

    alert("Settings saved successfully!");
  };

  return (
    <MainLayout>

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Settings
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your account and application preferences
        </p>

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT MENU */}

        <div className="bg-white rounded-xl shadow p-4 h-fit">

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
            <User size={19} />
            Profile
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Bell size={19} />
            Notifications
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Lock size={19} />
            Security
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Palette size={19} />
            Appearance
          </button>

        </div>


        {/* SETTINGS CONTENT */}

        <div className="lg:col-span-2 space-y-6">

          {/* PROFILE */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Profile Information
                </h2>

                <p className="text-sm text-gray-500">
                  Update your personal information
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  type="email"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

          </div>


          {/* NOTIFICATIONS */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-3 bg-yellow-100 rounded-lg">
                <Bell className="text-yellow-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Notifications
                </h2>

                <p className="text-sm text-gray-500">
                  Control how you receive notifications
                </p>
              </div>

            </div>


            <div className="space-y-5">

              <label className="flex items-center justify-between cursor-pointer">

                <div>
                  <p className="font-medium">
                    Dashboard Notifications
                  </p>

                  <p className="text-sm text-gray-500">
                    Receive important patient alerts
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


              <label className="flex items-center justify-between cursor-pointer">

                <div>
                  <p className="font-medium">
                    Email Alerts
                  </p>

                  <p className="text-sm text-gray-500">
                    Receive important updates by email
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) =>
                    setEmailAlerts(
                      e.target.checked
                    )
                  }
                  className="w-5 h-5"
                />

              </label>

            </div>

          </div>


          {/* APPEARANCE */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-3 bg-purple-100 rounded-lg">
                <Palette className="text-purple-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Appearance
                </h2>

                <p className="text-sm text-gray-500">
                  Customize the application appearance
                </p>
              </div>

            </div>


            <div>

              <label className="block text-sm font-medium mb-2">
                Theme
              </label>

              <select
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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


          {/* SAVE */}

          <div className="flex justify-end">

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
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