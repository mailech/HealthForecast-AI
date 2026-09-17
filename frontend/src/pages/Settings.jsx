import { useEffect, useState } from "react";
import {
  UserRound,
  Bell,
  ShieldCheck,
  Palette,
  Save,
  Mail,
  BriefcaseMedical,
  Moon,
  Sun,
  Monitor,
  Check,
  KeyRound,
  LockKeyhole,
  ChevronRight,
  Settings as SettingsIcon
} from "lucide-react";

function Settings() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState(storedUser.name || "");
  const [email, setEmail] = useState(storedUser.email || "");
  const [notifications, setNotifications] = useState(
    localStorage.getItem("hf_notifications") !== "false"
  );
  const [theme, setTheme] = useState(
    localStorage.getItem("hf_theme") || "Light"
  );
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState("Profile");

  const role = storedUser.role || "User";

  const applyTheme = selectedTheme => {
    const root = document.documentElement;

    if (selectedTheme === "Dark") {
      root.classList.add("dark");
      return;
    }

    if (selectedTheme === "Light") {
      root.classList.remove("dark");
      return;
    }

    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", dark);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "System") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => applyTheme("System");

    media.addEventListener("change", updateTheme);
    return () => media.removeEventListener("change", updateTheme);
  }, [theme]);

  const handleSave = () => {
    const updatedUser = {
      ...storedUser,
      name,
      email
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("hf_notifications", String(notifications));
    localStorage.setItem("hf_theme", theme);

    applyTheme(theme);
    setSaved(true);

    setTimeout(() => setSaved(false), 2500);
  };

  const menu = [
    { name: "Profile", icon: UserRound },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: ShieldCheck },
    { name: "Appearance", icon: Palette }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon size={19} className="text-slate-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              System Preferences
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Settings
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account, alerts, security and workspace preferences.
          </p>
        </div>

        {saved && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs">
            <Check size={14} />
            Changes saved
          </div>
        )}
      </div>

      {/* PROFILE HERO */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-6">
        <div className="absolute right-[-50px] top-[-70px] w-56 h-56 rounded-full border border-slate-800" />
        <div className="absolute right-16 bottom-[-110px] w-48 h-48 rounded-full border border-slate-800" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-300">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              HealthForecast Account
            </p>

            <h2 className="text-xl font-semibold mt-1">
              {name || "Healthcare User"}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Mail size={13} />
                {email || "No email available"}
              </span>

              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-semibold uppercase">
                {role}
              </span>
            </div>
          </div>

          <div className="hidden lg:block text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Account Status
            </p>

            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-sm text-slate-300">
                Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SETTINGS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">

        {/* MENU */}
        <aside className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 h-fit">

          <p className="px-3 pt-2 pb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Preferences
          </p>

          {menu.map(item => {
            const Icon = item.icon;
            const selected = active === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={17} />
                <span className="flex-1 text-left">
                  {item.name}
                </span>

                {selected && <ChevronRight size={14} />}
              </button>
            );
          })}
        </aside>

        {/* CONTENT */}
        <main className="space-y-5">

          {/* PROFILE */}
          {active === "Profile" && (
            <>
              <SettingsCard
                icon={UserRound}
                title="Profile Information"
                description="Your basic account information"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <InputField
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    icon={UserRound}
                  />

                  <InputField
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    type="email"
                    icon={Mail}
                  />

                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                  <ReadOnlyField
                    label="Account Role"
                    value={role}
                    icon={BriefcaseMedical}
                  />

                  <ReadOnlyField
                    label="Account Status"
                    value="Active"
                    icon={Check}
                  />

                </div>
              </SettingsCard>

              <InfoCard
                icon={BriefcaseMedical}
                title="Healthcare Workspace"
                text="Your account access is controlled by your assigned role. Available modules and actions may differ between Admin, Doctor, Staff and Researcher accounts."
              />
            </>
          )}

          {/* NOTIFICATIONS */}
          {active === "Notifications" && (
            <>
              <SettingsCard
                icon={Bell}
                title="Notification Center"
                description="Control system alerts and healthcare updates"
              >
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <Bell size={17} className="text-slate-600 dark:text-slate-300" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          Healthcare Alerts
                        </p>

                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Receive high-risk patient and new admission notifications.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative w-11 h-6 rounded-full transition ${
                        notifications ? "bg-slate-900" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                          notifications ? "left-6" : "left-1"
                        }`}
                      />
                    </button>

                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">

                  <NotificationItem
                    title="High-risk alerts"
                    text="Important patient risk notifications"
                  />

                  <NotificationItem
                    title="Admission updates"
                    text="New patient admission notifications"
                  />

                </div>
              </SettingsCard>
            </>
          )}

          {/* SECURITY */}
          {active === "Security" && (
            <>
              <SettingsCard
                icon={ShieldCheck}
                title="Security & Access"
                description="Information about your HealthForecast account security"
              >
                <div className="space-y-3">

                  <SecurityItem
                    icon={LockKeyhole}
                    title="Role-based access"
                    text="Your account only receives the permissions assigned to its role."
                  />

                  <SecurityItem
                    icon={KeyRound}
                    title="Authenticated session"
                    text="Protected application areas require an authenticated session."
                  />

                  <SecurityItem
                    icon={ShieldCheck}
                    title="Protected healthcare data"
                    text="Sensitive patient operations are restricted by backend authorization."
                  />

                </div>
              </SettingsCard>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Access level
                </p>

                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {role}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Current application role
                </p>
              </div>
            </>
          )}

          {/* APPEARANCE */}
          {active === "Appearance" && (
            <SettingsCard
              icon={Palette}
              title="Workspace Appearance"
              description="Choose how HealthForecast looks on your device"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                <ThemeOption
                  name="Light"
                  icon={Sun}
                  selected={theme === "Light"}
                  onClick={() => setTheme("Light")}
                />

                <ThemeOption
                  name="Dark"
                  icon={Moon}
                  selected={theme === "Dark"}
                  onClick={() => setTheme("Dark")}
                />

                <ThemeOption
                  name="System"
                  icon={Monitor}
                  selected={theme === "System"}
                  onClick={() => setTheme("System")}
                />

              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  Current theme
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {theme === "System"
                    ? "Automatically follows your device preference."
                    : `HealthForecast is currently using ${theme.toLowerCase()} mode.`}
                </p>
              </div>
            </SettingsCard>
          )}

          {/* SAVE BAR */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Save your preferences
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Changes are stored for this HealthForecast account.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
            >
              <Save size={16} />
              Save Changes
            </button>

          </div>

        </main>
      </div>
    </div>
  );
}


/* SETTINGS CARD */

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <Icon size={19} className="text-slate-700 dark:text-slate-200" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}


/* INPUT */

function InputField({ label, value, onChange, type = "text", icon: Icon }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
        {label}
      </label>

      <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-xl px-3 bg-white dark:bg-slate-700 focus-within:border-slate-500">

        <Icon size={16} className="text-slate-400" />

        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full py-3 bg-transparent outline-none text-sm text-slate-800 dark:text-white"
        />

      </div>
    </div>
  );
}


/* READ ONLY */

function ReadOnlyField({ label, value, icon: Icon }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
        {label}
      </label>

      <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 bg-slate-50 dark:bg-slate-700/60">
        <Icon size={16} className="text-slate-400" />

        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {value}
        </span>
      </div>
    </div>
  );
}


/* INFO */

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 text-white">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <Icon size={17} className="text-blue-300" />
        </div>

        <div>
          <h3 className="font-semibold text-sm">
            {title}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}


/* NOTIFICATION */

function NotificationItem({ title, text }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
      <p className="text-sm font-medium text-slate-800 dark:text-white">
        {title}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {text}
      </p>
    </div>
  );
}


/* SECURITY */

function SecurityItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
      <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-slate-600 dark:text-slate-300" />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-white">
          {title}
        </p>

        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}


/* THEME */

function ThemeOption({ name, icon: Icon, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border-2 transition ${
        selected
          ? "border-slate-900 bg-slate-50 dark:border-blue-300 dark:bg-slate-700"
          : "border-slate-200 dark:border-slate-600 hover:border-slate-400"
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-900 dark:bg-blue-300 flex items-center justify-center">
          <Check size={12} className="text-white dark:text-slate-900" />
        </div>
      )}

      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
        <Icon size={18} className="text-slate-700 dark:text-slate-200" />
      </div>

      <p className="text-sm font-semibold text-slate-800 dark:text-white mt-3">
        {name}
      </p>

      <p className="text-[11px] text-slate-400 mt-1">
        {name === "Light" && "Clean clinical workspace"}
        {name === "Dark" && "Low-light workspace"}
        {name === "System" && "Follow device settings"}
      </p>
    </button>
  );
}

export default Settings; 