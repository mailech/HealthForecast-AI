import React from 'react';
import { Shield, Check, X, Lock, Info, CheckCircle2 } from 'lucide-react';

export const AdminRolesView: React.FC = () => {
  // Official Access Matrix directly matching Page 6 of HealthForecast AI specification
  const officialAccessMatrix = [
    {
      feature: 'Patient Records',
      doctor: 'Assigned Patients Only',
      admin: 'View Only',
      researcher: 'Anonymized Only',
      sysadmin: 'Yes'
    },
    {
      feature: 'Medical History',
      doctor: 'Assigned Patients Only',
      admin: 'View Only',
      researcher: 'Anonymized Only',
      sysadmin: 'Yes'
    },
    {
      feature: 'Risk Prediction Reports',
      doctor: 'Yes',
      admin: 'Yes',
      researcher: 'Aggregated Only',
      sysadmin: 'Yes'
    },
    {
      feature: 'Readmission Forecasts',
      doctor: 'Yes',
      admin: 'Yes',
      researcher: 'Aggregated Only',
      sysadmin: 'Yes'
    },
    {
      feature: 'Treatment Effectiveness Reports',
      doctor: 'Yes',
      admin: 'Yes',
      researcher: 'Yes',
      sysadmin: 'Yes'
    },
    {
      feature: 'Hospital Analytics Dashboard',
      doctor: 'Limited',
      admin: 'Full Access',
      researcher: 'Aggregated Only',
      sysadmin: 'Full Access'
    },
    {
      feature: 'Population Health Reports',
      doctor: 'No',
      admin: 'Yes',
      researcher: 'Yes',
      sysadmin: 'Yes'
    },
    {
      feature: 'Research Dataset Export',
      doctor: 'No',
      admin: 'No',
      researcher: 'Yes',
      sysadmin: 'Yes'
    },
    {
      feature: 'User Management',
      doctor: 'No',
      admin: 'No',
      researcher: 'No',
      sysadmin: 'Yes'
    },
    {
      feature: 'Model Management',
      doctor: 'No',
      admin: 'No',
      researcher: 'No',
      sysadmin: 'Yes'
    }
  ];

  const getBadgeClass = (val: string) => {
    if (val === 'Yes' || val === 'Full Access') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
    }
    if (val === 'No') {
      return 'bg-slate-100 text-slate-400 border border-slate-200 font-semibold';
    }
    if (val.includes('Assigned') || val.includes('Limited')) {
      return 'bg-sky-50 text-sky-700 border border-sky-200 font-medium';
    }
    if (val.includes('Anonymized') || val.includes('Aggregated')) {
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium';
    }
    if (val.includes('View Only')) {
      return 'bg-amber-50 text-amber-800 border border-amber-200 font-medium';
    }
    return 'bg-slate-50 text-slate-700 border border-slate-200 font-medium';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Role-Based Access Control (RBAC) Matrix
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              HIPAA Privacy & Security Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official system authorization specification governing access across the 3 operational roles and 1 administrative role.
          </p>
        </div>
      </div>

      {/* Role Descriptions Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900">Doctor</h4>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            Monitors assigned patient health risks, reviews readmission predictions, evaluates treatments, and coordinates discharge care plans.
          </p>
          <div className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
            <strong>Restrictions:</strong> Cannot access patients outside assigned scope, manage users, or alter AI models.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h4 className="text-sm font-bold text-slate-900">Hospital Administrator</h4>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            Hospital performance monitoring, resource utilization oversight, CMS HRRP penalty exposure, and department analytics.
          </p>
          <div className="text-[11px] text-amber-800 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
            <strong>Restrictions:</strong> View-only patient records (cannot modify medical charts) and cannot alter AI models.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h4 className="text-sm font-bold text-slate-900">Healthcare Researcher</h4>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            Epidemiological research, clinical outcome analysis, population health studies, and research dataset export.
          </p>
          <div className="text-[11px] text-indigo-700 font-medium bg-indigo-50 p-2 rounded-lg border border-indigo-100">
            <strong>Restrictions:</strong> Cannot access PII (Safe-Harbor de-identified only), cannot modify records or approve decisions.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h4 className="text-sm font-bold text-slate-900">System Administrator</h4>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            Platform administration, clinician user provisioning, AI model deployment/retraining, dataset ingestion, and HIPAA audit trails.
          </p>
          <div className="text-[11px] text-purple-700 font-medium bg-purple-50 p-2 rounded-lg border border-purple-100">
            <strong>Permissions:</strong> Full governance access across all dashboards, models, logs, and user directories.
          </div>
        </div>
      </div>

      {/* Official Access Matrix Table (10 Features from PDF Page 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs overflow-hidden">
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Official Access Matrix (Specification Page 6)
            </h3>
            <p className="text-xs text-slate-500">
              Exact feature permissions mapped across Doctor, Hospital Administrator, Healthcare Researcher, and System Administrator.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            10 Controlled Modules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 max-w-sm">Feature</th>
                <th className="p-3.5 text-center bg-emerald-50/70 text-emerald-800">Doctor</th>
                <th className="p-3.5 text-center bg-blue-50/70 text-blue-800">Hospital Administrator</th>
                <th className="p-3.5 text-center bg-indigo-50/70 text-indigo-800">Healthcare Researcher</th>
                <th className="p-3.5 text-center bg-purple-50/70 text-purple-800">System Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officialAccessMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    {item.feature}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] ${getBadgeClass(item.doctor)}`}>
                      {item.doctor}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] ${getBadgeClass(item.admin)}`}>
                      {item.admin}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] ${getBadgeClass(item.researcher)}`}>
                      {item.researcher}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] ${getBadgeClass(item.sysadmin)}`}>
                      {item.sysadmin}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
