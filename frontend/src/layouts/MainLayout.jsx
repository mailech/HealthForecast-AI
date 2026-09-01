import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Brain,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from "lucide-react";
import Header from "../components/Header";
import { useRole } from "../context/RoleContext";

function MainLayout() {
  const location = useLocation();
  const { role, user } = useRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeRole = user?.role || role;

  // Dynamic navigation items filtered per active role
  const getNavItems = () => {
    switch (activeRole) {
      case "DOCTOR":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Patients", path: "/patients", icon: Users },
          { label: "Prediction", path: "/prediction", icon: Brain },
          { label: "Analytics", path: "/analytics", icon: BarChart3 },
          { label: "Reports", path: "/reports", icon: FileText },
          { label: "Alerts", path: "/alerts", icon: Bell },
        ];
      case "HOSPITAL_ADMIN":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Patients (View Only)", path: "/patients", icon: Users },
          { label: "Analytics", path: "/analytics", icon: BarChart3 },
          { label: "Reports", path: "/reports", icon: FileText },
          { label: "Alerts", path: "/alerts", icon: Bell },
        ];
      case "RESEARCHER":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Patients (Anonymized)", path: "/patients", icon: Users },
          { label: "Analytics", path: "/analytics", icon: BarChart3 },
          { label: "Reports (Anonymized)", path: "/reports", icon: FileText },
          { label: "Alerts", path: "/alerts", icon: Bell },
        ];
      case "SYS_ADMIN":
      default:
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Patients", path: "/patients", icon: Users },
          { label: "Prediction", path: "/prediction", icon: Brain },
          { label: "Analytics", path: "/analytics", icon: BarChart3 },
          { label: "Reports", path: "/reports", icon: FileText },
          { label: "Alerts", path: "/alerts", icon: Bell },
          { label: "User Matrix", path: "/users", icon: ShieldCheck },
          { label: "Settings", path: "/settings", icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#090D16] font-sans antialiased text-slate-100 relative">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Constant & Stationary Left Sidebar */}
      <aside
        className={`h-full bg-slate-950/90 backdrop-blur-2xl text-white flex flex-col shrink-0 border-r border-slate-800/80 shadow-2xl z-50 transition-all duration-300 ${
          // Desktop width
          isCollapsed ? "lg:w-20" : "lg:w-72"
        } ${
          // Mobile sizing & fixed slide-over
          isMobileOpen
            ? "fixed inset-y-0 left-0 w-72 translate-x-0"
            : "fixed inset-y-0 left-0 w-72 -translate-x-full lg:relative lg:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className={`p-6 border-b border-slate-800/80 border-t border-white/5 flex items-center justify-between ${isCollapsed ? "lg:px-4 lg:justify-center" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Activity size={24} />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div>
                <h1 className="font-bold tracking-tight text-lg text-white flex items-center gap-1.5">
                  HealthForecast <span className="text-emerald-400">AI</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Clinical Suite
                </p>
              </div>
            )}
          </div>

          {/* Close Mobile Drawer Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Active Role Indicator Badge */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="mx-4 mt-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Active Role:</span>
            <span
              className={`font-extrabold px-2 py-0.5 rounded-md text-[10px] ${
                role === "SYS_ADMIN"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : role === "HOSPITAL_ADMIN"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : role === "RESEARCHER"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {role}
            </span>
          </div>
        )}

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : ""}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 font-semibold border-l-4 border-emerald-400 rounded-r-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-100"
                } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <IconComponent
                  size={20}
                  className={`shrink-0 ${isActive ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-slate-400"}`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="text-sm tracking-wide">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex p-4 border-t border-slate-800/80">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/80 rounded-xl transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Collapse Navigation</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area (Independent Pane) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#090D16]">
        {/* Top Navbar */}
        <Header
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          isMobileOpen={isMobileOpen}
        />
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#090D16]">
          <Outlet />
        </main>
      </div>

    </div>
  );

}

export default MainLayout;