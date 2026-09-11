import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Stethoscope, Activity, AlertTriangle, Search, ChevronRight, Clock } from 'lucide-react';

export const DoctorDashboard = () => {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState({ total: 0, highRisk: 0, recentInpatient: 0 });

  useEffect(() => {
    fetchEncounters();
  }, []);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/encounters?limit=20');
      const items = res.data.items || [];
      setEncounters(items);
      
      const highRiskCount = items.filter(e => e.actual_readmitted === '<30' || e.number_inpatient > 1).length;
      const recentInpatientCount = items.filter(e => e.number_inpatient > 0).length;
      setMetrics({
        total: res.data.total || items.length,
        highRisk: highRiskCount,
        recentInpatient: recentInpatientCount
      });
    } catch (err) {
      console.error("Failed to load encounters", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEncounters = React.useMemo(() => {
    return encounters.filter(e => 
      e.patient_nbr?.toLowerCase().includes(search.toLowerCase()) ||
      e.medical_specialty?.toLowerCase().includes(search.toLowerCase()) ||
      e.diag_1?.toLowerCase().includes(search.toLowerCase())
    );
  }, [encounters, search]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-cyan-400" /> Doctor Clinical Care Workstation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Patient Intelligence & Decision-Support System • Diabetes 130-US Hospitals Cohort
          </p>
        </div>
        <Link
          to="/doctor/patients"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Users className="h-4 w-4" />
          <span>Patient Registry</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Ingested Encounters</span>
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics.total.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active hospital admission records</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Readmission Risk Cases</span>
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{metrics.highRisk}</div>
          <div className="text-[11px] text-slate-400 mt-1">Patients with prior readmissions or inpatient stays</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prior Inpatient Admissions</span>
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400">{metrics.recentInpatient}</div>
          <div className="text-[11px] text-slate-400 mt-1">Encounters with prior 12-month inpatient history</div>
        </div>
      </div>

      {/* Encounters List */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-white">Recent Clinical Encounters</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search patient ID, specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-10 bg-slate-800/40 animate-pulse rounded-xl w-full"></div>
            ))}
          </div>
        ) : filteredEncounters.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No clinical encounters match search query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Number</th>
                  <th className="py-3 px-4">Gender & Age</th>
                  <th className="py-3 px-4">Medical Specialty</th>
                  <th className="py-3 px-4">Length of Stay</th>
                  <th className="py-3 px-4">Lab & Med Count</th>
                  <th className="py-3 px-4">Primary Diagnosis</th>
                  <th className="py-3 px-4">Readmission Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEncounters.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-cyan-400">
                      #{e.patient_nbr}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {e.gender} • <span className="text-slate-400">{e.age_group}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {e.medical_specialty && e.medical_specialty !== '?' ? e.medical_specialty : 'Internal Medicine'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">
                      {e.time_in_hospital} days
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {e.num_lab_procedures} labs / {e.num_medications} meds
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {e.diag_1 || '250.00'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        e.actual_readmitted === '<30'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : e.actual_readmitted === '>30'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {e.actual_readmitted === '<30' ? 'Early Readmission (<30d)' : e.actual_readmitted === '>30' ? 'Late Readmission (>30d)' : 'No Readmission'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/doctor/encounters/${e.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-colors"
                      >
                        <span>Evaluate</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
