import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  Sparkles,
  ChevronDown,
  Settings,
  LogOut,
  X,
  AlertTriangle,
  Menu,
  Wifi,
  WifiOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "../context/SocketContext";
import { useRole } from "../context/RoleContext";

export default function Header({ onMobileMenuToggle, isMobileOpen }) {
  const { isConnected, liveAlerts, unreadCount, resetUnreadCount } = useSocket();
  const { role, user, logout } = useRole();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationsToggle = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      resetUnreadCount();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}"...`);
      navigate(`/patients?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const defaultNotifications = [
    {
      id: "1",
      title: "High Risk Alert",
      message: "Patient Rahul Verma flagged with 91% readmission risk.",
      time: "10m ago",
      unread: true,
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50",
    },
    {
      id: "2",
      title: "ML Model Updated",
      message: "Cardiovascular readmission algorithm updated to v2.4.",
      time: "1h ago",
      unread: true,
      icon: Sparkles,
      color: "text-blue-600 bg-blue-50",
    },
  ];

  const displayNotifications =
    liveAlerts.length > 0
      ? liveAlerts.map((a) => ({
          id: a.id || Math.random().toString(),
          title: `${a.severity} Breach Alert`,
          message: `${a.patient}: ${a.message}`,
          time: a.time || "Just now",
          unread: true,
          icon: a.severity === "Critical" ? AlertTriangle : Sparkles,
          color:
            a.severity === "Critical"
              ? "text-rose-600 bg-rose-50"
              : "text-amber-600 bg-amber-50",
        }))
      : defaultNotifications;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md relative flex items-center"
        >
          <div className="relative w-full flex items-center bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 rounded-xl transition-all duration-200 px-3 py-2 sm:px-3.5">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, metrics, predictions..."
              className="w-full bg-transparent ml-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
            />
            <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs shrink-0">
              <span>⌘K</span>
            </div>
          </div>
        </form>

        {/* Right Section: Status, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* HIPAA Compliant Security Shield Badge */}
          <div className="hidden xl:flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/80 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>HIPAA AES-256</span>
          </div>

          {/* Live WebSocket Connection Status Badge */}
          <div
            className={`hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              isConnected
                ? "bg-emerald-50 border-emerald-200/60 text-emerald-700"
                : "bg-amber-50 border-amber-200/60 text-amber-700"
            }`}
          >
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="flex items-center gap-1">
                  <Wifi size={13} /> WebSocket Active
                </span>
              </>
            ) : (
              <>
                <WifiOff size={13} className="text-amber-600" />
                <span>Connecting...</span>
              </>
            )}
          </div>

          {/* Notifications Center Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotificationsToggle}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-600 transition-colors border border-slate-200/60 cursor-pointer"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full ring-2 ring-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Real-Time Alerts</h3>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      LIVE SOCKET
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                  {displayNotifications.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl transition-colors flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${
                          item.unread ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${item.color} shrink-0 mt-0.5`}>
                          <IconComp size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400">{item.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <Link
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View All Real-Time Activity Alerts →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Shortcut Dropdown (Displays Name & Role on the far right) */}
          <div className="relative border-l border-slate-200 pl-2 sm:pl-4" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  {user?.name || "Dr. John Smith"}
                </p>
                <p className="text-[11px] text-indigo-600 font-bold leading-tight">
                  {user?.name === "Super Admin" ? "Super Admin • SYS_ADMIN" : `${role} • ${user?.department || "Clinical Care"}`}
                </p>
              </div>

              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  {user?.department && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{user.department}</p>
                  )}
                  <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-100">
                    Role: {role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <User size={15} className="text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Settings size={15} className="text-slate-400" />
                    Account Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={15} className="text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
