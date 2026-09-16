import React, { useState, useEffect } from 'react';
import {
  Building2, TrendingDown, DollarSign, Activity, Users,
  CheckCircle, Download, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import HospitalWard3D from '../three/HospitalWard3D';
import { sound } from '../../utils/audio';

export default function AdminView({ currentUser, onSelectPatientFromWard }) {
  const [overview, setOverview] = useState(null);
  const [wardBeds, setWardBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resOverview, resBeds] = await Promise.all([
        fetch('/api/analytics/hospital-overview'),
        fetch('/api/analytics/ward-occupancy')
      ]);
      const dataOverview = await resOverview.json();
      const dataBeds = await resBeds.json();
      setOverview(dataOverview);
      setWardBeds(dataBeds);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    sound.playSuccess();
    const jsonStr = JSON.stringify(overview, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hospital_Operations_Readmission_Report_2026.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold text-lg">
            {currentUser?.avatar_initials || 'MS'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {currentUser?.full_name || 'Marcus Sterling, MHA'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/20 border border-purple-500/40 text-purple-300">
                HOSPITAL ADMINISTRATOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Operations Oversight • 30-Day Readmission Reduction Platform • Metro General Hospital
            </p>
          </div>
        </div>

        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs transition-all shadow-glow-cyan"
        >
          <Download className="w-4 h-4" />
          Export Executive Analytics (JSON)
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readmission Rate */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase">30-Day Readmit Rate</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">
            {overview?.readmission_rate_30d || '11.4'}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-mono">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-6.4% vs National Avg (17.8%)</span>
          </div>
        </div>

        {/* Metric 2: Avoidable Readmissions Prevented */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase">Avoidable Readmits Prevented</span>
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono mt-2">
            {overview?.avoidable_readmissions_prevented || '42'} Patients
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            Target: 45 this quarter
          </div>
        </div>

        {/* Metric 3: Cost Savings */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase">Medicare Penalty Savings</span>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-2">
            {overview?.projected_cost_savings || '$630,000'}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            HRRP Penalties avoided
          </div>
        </div>

        {/* Metric 4: Bed Occupancy */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase">Active Bed Occupancy</span>
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-300 font-mono mt-2">
            {overview?.bed_occupancy_rate || '78.4'}%
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            {overview?.active_admissions || '14'} / {overview?.total_census || '16'} Smart Beds Active
          </div>
        </div>
      </div>

      {/* 3D Hospital Smart Ward Facility Twin */}
      <HospitalWard3D
        beds={wardBeds}
        onSelectBed={(bed) => {
          if (onSelectPatientFromWard) onSelectPatientFromWard(bed);
        }}
      />

      {/* Department Breakdown & Monthly Readmission Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown Table */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Clinical Department Risk & Performance Breakdown
          </h3>
          <div className="space-y-2">
            {(overview?.departments || []).map((dept, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{dept.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Active: {dept.active_patients} beds • Avg Inpatient Stay: {dept.avg_stay} days
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">30d Readmit Rate</div>
                  <div className={`text-base font-bold ${
                    dept.readmit_rate > 20 ? 'text-red-400' :
                    dept.readmit_rate > 13 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {dept.readmit_rate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Analytics */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            6-Month Readmission Reduction Trajectory
          </h3>
          <div className="space-y-3 pt-2">
            {(overview?.monthly_trend || []).map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{m.month} 2026</span>
                  <span className="text-cyan-400 font-bold">{m.rate}% Readmit ({m.prevented} avoided)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden flex border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(m.rate / 25) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 font-mono pt-2">
            * Consistent 30.5% readmission decline achieved via proactive AI risk scoring & post-discharge transition protocols.
          </p>
        </div>
      </div>
    </div>
  );
}
