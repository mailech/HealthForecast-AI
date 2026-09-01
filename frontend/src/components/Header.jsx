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
    <header className="sticky top-0 z-30 bg-[#090D16]/80 backdrop-blur-xl border-b border-slate-800/80 border-t border-white/10 px-4 sm:px-6 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md relative flex items-center"
        >
          <div className="relative w-full flex items-center bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 focus-within:border-emerald-500/60 focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-xl transition-all duration-200 px-3 py-2 sm:px-3.5">
            <Search size={18} className="text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, metrics, predictions..."
              className="w-full bg-transparent ml-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
            />
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs shrink-0">
              <span>⌘K</span>
            </div>
          </div>
        </form>

        {/* Right Section: Status, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* HIPAA Compliant Security Shield Badge */}
          <div className="hidden xl:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>HIPAA AES-256</span>
          </div>

          {/* Live WebSocket Connection Status Badge */}
          <div
            className={`hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="flex items-center gap-1">
                  <Wifi size={13} /> WebSocket Active
                </span>
              </>
            ) : (
              <>
                <WifiOff size={13} className="text-amber-400" />
                <span>Connecting...</span>
              </>
            )}
          </div>

          {/* Notifications Center Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotificationsToggle}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors border border-slate-800/80 cursor-pointer"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-mono font-extrabold rounded-full ring-2 ring-slate-950 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800 border-t border-white/10 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">Real-Time Alerts</h3>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      LIVE SOCKET
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto my-2">
                  {displayNotifications.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl transition-colors flex items-start gap-3 hover:bg-slate-800/50 cursor-pointer ${
                          item.unread ? "bg-emerald-950/20" : ""
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${item.color.includes("rose") ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"} shrink-0 mt-0.5`}>
                          <IconComp size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-200 truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-center">
                  <Link
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    View All Real-Time Activity Alerts →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Shortcut Dropdown (Displays Name & Role on the far right) */}
          <div className="relative border-l border-slate-800/80 pl-2 sm:pl-4" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-800"
            >
              <div className="relative">
                <img
                  src={
                    user?.photo ||
                    user?.avatarUrl ||
                    (role === "HOSPITAL_ADMIN"
                      ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                      : role === "RESEARCHER"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      : role === "SYS_ADMIN"
                      ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80")
                  }
                  alt={user?.name || "Profile Photo"}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/30 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
              </div>

              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-100 leading-tight flex items-center gap-1">
                  {user?.name || "Dr. John Smith"}
                </p>
                <p className="text-[11px] text-emerald-400 font-bold leading-tight">
                  {user?.name === "Super Admin" ? "Super Admin • SYS_ADMIN" : `${role} • ${user?.department || "Clinical Care"}`}
                </p>
              </div>

              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800 border-t border-white/10 p-2 z-50">
                <div className="px-3 py-2.5 border-b border-slate-800/80">
                  <p className="text-xs font-bold text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  {user?.department && (
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{user.department}</p>
                  )}
                  <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Role: {role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    <User size={15} className="text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    <Settings size={15} className="text-slate-400" />
                    Account Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={15} className="text-rose-400" />
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

