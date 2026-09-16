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
  BrainCircuit,
  Heart,
  Activity
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const roleName = user?.role?.name;

  const navItems = [
    // Clinical Care Views (Doctor Only)
    {
      title: "Doctor Dashboard",
      path: "/doctor/dashboard",
      icon: Stethoscope,
      roles: ["Doctor"]
    },
    {
      title: "Patient Registry",
      path: "/doctor/patients",
      icon: Users,
      roles: ["Doctor"]
    },
    {
      title: "Risk Prediction / CDSS",
      path: "/doctor/predict",
      icon: BrainCircuit,
      roles: ["Doctor"]
    },
    {
      title: "Treatment Effectiveness",
      path: "/doctor/treatment-effectiveness",
      icon: FlaskConical,
      roles: ["Doctor"]
    },
    {
      title: "Patient Outcomes",
      path: "/doctor/patient-outcomes",
      icon: Heart,
      roles: ["Doctor"]
    },
    {
      title: "Healthcare Analytics",
      path: "/doctor/healthcare-analytics",
      icon: BarChart3,
      roles: ["Doctor"]
    },

    // Executive & Hospital Performance Views (Hospital Administrator)
    {
      title: "Hospital Dashboard",
      path: "/admin/dashboard",
      icon: Building2,
      roles: ["Hospital Administrator"]
    },
    {
      title: "Hospital Performance",
      path: "/admin/hospital-performance",
      icon: BarChart3,
      roles: ["Hospital Administrator"]
    },
    {
      title: "Patient Outcomes",
      path: "/admin/patient-outcomes",
      icon: Heart,
      roles: ["Hospital Administrator"]
    },
    {
      title: "Treatment Effectiveness",
      path: "/admin/treatment-effectiveness",
      icon: FlaskConical,
      roles: ["Hospital Administrator"]
    },
    {
      title: "Population Health",
      path: "/admin/population-health",
      icon: Users,
      roles: ["Hospital Administrator"]
    },
    {
      title: "Reports & Analytics",
      path: "/admin/reports",
      icon: ShieldCheck,
      roles: ["Hospital Administrator"]
    },

    // Healthcare Researcher Navigation
    {
      title: "Research Dashboard",
      path: "/researcher/dashboard",
      icon: FlaskConical,
      roles: ["Healthcare Researcher"]
    },
    {
      title: "Anonymized Patient Data",
      path: "/researcher/patients",
      icon: Users,
      roles: ["Healthcare Researcher"]
    },
    {
      title: "Treatment Analytics",
      path: "/researcher/treatment",
      icon: FlaskConical,
      roles: ["Healthcare Researcher"]
    },
    {
      title: "Readmission Trends",
      path: "/researcher/readmission-trends",
      icon: TrendingUp,
      roles: ["Healthcare Researcher"]
    },
    {
      title: "Population Health",
      path: "/researcher/population-health",
      icon: Building2,
      roles: ["Healthcare Researcher"]
    },
    {
      title: "Research Dataset",
      path: "/researcher/research-dataset",
      icon: Database,
      roles: ["Healthcare Researcher"]
    },
    {
      title: "Analytical Reports",
      path: "/researcher/reports",
      icon: ShieldCheck,
      roles: ["Healthcare Researcher"]
    },

    // System Administration
    {
      title: "User Management",
      path: "/sysadmin/users",
      icon: Settings,
      roles: ["System Administrator"]
    },
    {
      title: "Dataset Management",
      path: "/sysadmin/dataset",
      icon: Database,
      roles: ["System Administrator"]
    },
    {
      title: "Audit Logs",
      path: "/sysadmin/audit",
      icon: ShieldCheck,
      roles: ["System Administrator"]
    },
    {
      title: "System Status & Settings",
      path: "/sysadmin/status",
      icon: TrendingUp,
      roles: ["System Administrator"]
    },
    {
      title: "AI Model Management",
      path: "/sysadmin/model",
      icon: BrainCircuit,
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
