import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Stethoscope,
  BarChart3,
  FlaskConical,
  Settings,
  Database,
  TrendingUp,
  ShieldCheck,
  Building2,
  BrainCircuit
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const roleName = user?.role?.name;

  const navItems = [
    // Clinical Care Views
    {
      title: "Doctor Dashboard",
      path: "/doctor/dashboard",
      icon: Stethoscope,
      roles: ["Doctor"]
    },
    {
      title: "Risk Forecast (CDSS)",
      path: "/doctor/predict",
      icon: BrainCircuit,
      roles: ["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]
    },
    {
      title: "Patient Registry",
      path: "/doctor/patients",
      icon: Users,
      roles: ["Doctor", "Hospital Administrator", "Healthcare Researcher"]
    },

    // Hospital Performance Analytics
    {
      title: "Hospital Performance",
      path: "/admin/dashboard",
      icon: Building2,
      roles: ["Hospital Administrator", "Doctor", "Healthcare Researcher", "System Administrator"]
    },

    // Treatment & Outcome Analytics
    {
      title: "Treatment Analytics",
      path: "/researcher/dashboard",
      icon: FlaskConical,
      roles: ["Healthcare Researcher", "Doctor", "Hospital Administrator", "System Administrator"]
    },

    // System Administration
    {
      title: "User Management",
      path: "/sysadmin/users",
      icon: Settings,
      roles: ["System Administrator"]
    },
    {
      title: "Dataset Ingestion",
      path: "/sysadmin/dataset",
      icon: Database,
      roles: ["System Administrator"]
    },
    {
      title: "Audit Trail Logs",
      path: "/sysadmin/audit",
      icon: ShieldCheck,
      roles: ["System Administrator"]
    }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(roleName));

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {roleName || "Navigation"}
        </div>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300">Dataset Status</div>
        <div className="text-emerald-400 flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          Diabetes 130-US Hospitals
        </div>
        <div className="text-[11px] text-slate-500">101,766 Clinical Encounter Records</div>
      </div>
    </aside>
  );
};

export default Sidebar;
