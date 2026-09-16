import { useState } from 'react'
import { Lock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'

export default function PermissionManagement() {
  const permissionsMatrix = [
    { module: 'Patient Medical Records', Doctor: true, HospitalAdmin: true, Researcher: false, SystemAdmin: true },
    { module: 'AI Risk Predictions', Doctor: true, HospitalAdmin: true, Researcher: true, SystemAdmin: true },
    { module: 'Anonymized Datasets', Doctor: false, HospitalAdmin: false, Researcher: true, SystemAdmin: true },
    { module: 'Hospital Financial Analytics', Doctor: false, HospitalAdmin: true, Researcher: false, SystemAdmin: true },
    { module: 'User Account Creation', Doctor: false, HospitalAdmin: false, Researcher: false, SystemAdmin: true },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">
              <Lock className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">System Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Control Matrix</h1>
          <p className="text-sm text-gray-500 mt-0.5">Granular RBAC access rules per system module</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">RBAC Access Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                <th className="py-3 px-4">System Module / Resource</th>
                <th className="py-3 px-4 text-center">Doctor</th>
                <th className="py-3 px-4 text-center">Hospital Admin</th>
                <th className="py-3 px-4 text-center">Researcher</th>
                <th className="py-3 px-4 text-center">System Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900">{row.module}</td>
                  <td className="py-4 px-4 text-center">
                    {row.Doctor ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {row.HospitalAdmin ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {row.Researcher ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {row.SystemAdmin ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
