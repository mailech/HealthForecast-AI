import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
  ShieldCheck,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function Navbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const name = user.name || "Healthcare User";
  const role = user.role || "User";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await api.get("/patients");
        setPatients(res.data || []);
      } catch {
        setPatients([]);
      }
    };

    loadPatients();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        const data = res.data || [];

        setNotifications(Array.isArray(data) ? data.length : 0);
      } catch {
        setNotifications(0);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const closeMenu = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const results = patients.filter(patient => {
    const q = search.toLowerCase().trim();

    if (!q) return false;

    return `${patient.name} ${patient.id} ${patient.disease}`
      .toLowerCase()
      .includes(q);
  }).slice(0, 5);

  const logout = () => {
    localStorage.removeItem("hf_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="h-[72px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 flex items-center justify-between gap-5 sticky top-0 z-40">

      {/* SEARCH */}
      <div className="relative flex-1 max-w-xl">
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition ${
            showResults
              ? "border-slate-400 bg-white dark:bg-slate-800"
              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          }`}
        >
          <Search size={17} className="text-slate-400 shrink-0" />

          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => search && setShowResults(true)}
            placeholder="Search patients, ID or condition..."
            className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setShowResults(false);
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          )}

          <span className="hidden md:block text-[10px] text-slate-400 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1">
            Search
          </span>
        </div>

        {/* SEARCH RESULTS */}
        {showResults && search && (
          <div className="absolute top-[52px] left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">

            {results.length > 0 ? (
              <>
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Patient Records
                  </p>
                </div>

                {results.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setShowResults(false);
                      setSearch("");
                      navigate("/patients");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-200">
                      {patient.name?.charAt(0).toUpperCase() || "P"}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {patient.name}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        ID #{patient.id} · {patient.disease || "No condition"}
                      </p>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-7 text-center">
                <Search size={20} className="text-slate-300 mx-auto mb-2" />

                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No patients found
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Try a different name, ID or condition.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        {/* NOTIFICATION */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Notifications"
        >
          <Bell size={18} />

          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900">
              {notifications > 9 ? "9+" : notifications}
            </span>
          )}
        </button>

        {/* DIVIDER */}
        <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700" />

        {/* USER */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
              {initial}
            </div>

            <div className="hidden md:block text-left max-w-[150px]">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {name}
              </p>

              <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                {role}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden sm:block text-slate-400 transition ${
                showMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* PROFILE MENU */}
          {showMenu && (
            <div className="absolute right-0 top-14 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">

              <div className="p-4 bg-slate-950 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-semibold text-blue-300">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {name}
                    </p>

                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                      {role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-400">
                  <ShieldCheck size={12} className="text-blue-300" />
                  Secure healthcare account
                </div>
              </div>

              <div className="p-2">

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <UserRound size={16} />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Settings size={16} />
                  Settings
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <LogOut size={16} />
                  Sign out
                </button>

              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar; 