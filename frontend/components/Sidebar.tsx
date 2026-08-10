"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, ROLE_LABELS } from "@/lib/auth-context";
import { HealthForecastMark } from "./HealthForecastMark";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "◱", roles: ["doctor", "hospital_admin", "researcher", "system_admin"] },
  { label: "My Records", href: "/dashboard/my-records", icon: "◍", roles: ["patient"] },
  { label: "Patients", href: "/dashboard/patients", icon: "◍", roles: ["doctor", "hospital_admin", "system_admin"] },
  { label: "Risk Predictions", href: "/dashboard/risk", icon: "△", roles: ["doctor", "hospital_admin", "system_admin"] },
  { label: "Treatment Effectiveness", href: "/dashboard/treatment", icon: "◇", roles: ["doctor", "hospital_admin", "researcher", "system_admin"] },
  { label: "Hospital Analytics", href: "/dashboard/analytics", icon: "▤", roles: ["hospital_admin", "researcher", "system_admin"] },
  { label: "Research Datasets", href: "/dashboard/research", icon: "▥", roles: ["researcher", "system_admin"] },
  { label: "User Management", href: "/dashboard/users", icon: "◈", roles: ["system_admin"] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-60 shrink-0 bg-navy text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="w-7 h-7 flex items-center justify-center">
          <HealthForecastMark size={26} />
        </div>
        <span className="font-display text-[15px] tracking-tight">HealthForecast AI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition
                ${
                  isActive
                    ? "bg-teal/15 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              <span className="text-base w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-sm font-medium truncate">{user.full_name}</div>
        <div className="text-xs text-white/50 mb-3">{ROLE_LABELS[user.role]}</div>
        <button onClick={logout} className="text-xs text-white/50 hover:text-white transition">
          Sign out
        </button>
      </div>
    </aside>
  );
}
