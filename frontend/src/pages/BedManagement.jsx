import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiCheckCircle,
  FiAlertTriangle,
  FiUserPlus,
  FiUserCheck,
  FiXCircle,
  FiFilter,
  FiRefreshCw,
  FiShield,
  FiActivity,
  FiX,
  FiTool,
  FiChevronRight,
  FiLayers,
} from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import { bedService } from '../services/bedService';
import { patientService } from '../services/patientService';
import { getPatientLabel, getPatientFullName, getPatientMRN } from '../utils/patientUtils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: 'easeOut' },
});

export default function BedManagement() {
  const { user } = useAuth();
  const isHospitalAdmin = user?.role?.toString().toLowerCase().replace(/\s+/g, '_') === 'hospital_admin';

  const [summary, setSummary] = useState(null);
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [filterWard, setFilterWard] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Assignment Modal state
  const [assignModalBed, setAssignModalBed] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, wardsRes, bedsRes, patientsRes] = await Promise.all([
        bedService.getSummary(),
        bedService.getWards(),
        bedService.getBeds(),
        patientService.getAll().catch(() => []),
      ]);

      setSummary(sumRes);
      setWards(wardsRes);
      setBeds(bedsRes);
      setPatients(patientsRes);
    } catch (err) {
      console.error('Error loading bed management data:', err);
      setError('Unable to load bed and ward management data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered beds logic
  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      if (filterWard !== 'all' && String(bed.ward_id) !== String(filterWard)) return false;
      if (filterDept !== 'all' && bed.department.toLowerCase() !== filterDept.toLowerCase()) return false;
      if (filterStatus !== 'all' && bed.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      return true;
    });
  }, [beds, filterWard, filterDept, filterStatus]);

  // Unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(wards.map((w) => w.department));
    return Array.from(depts);
  }, [wards]);

  // Handle Assign Bed Action
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalBed || !selectedPatientId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedBed = await bedService.assignBed(assignModalBed.id, selectedPatientId);
      setSuccess(`Successfully assigned Bed '${updatedBed.bed_number}' to ${updatedBed.patient_name}.`);
      setAssignModalBed(null);
      setSelectedPatientId('');
      await loadData();
    } catch (err) {
      console.error('Assign Bed Error:', err);
      setError(err.response?.data?.detail || 'Failed to assign bed. Please verify patient eligibility.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Release Bed Action
  const handleRelease = async (bed) => {
    if (!window.confirm(`Are you sure you want to release Bed '${bed.bed_number}'?`)) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await bedService.releaseBed(bed.id);
      setSuccess(`Bed '${bed.bed_number}' has been released and is now Available.`);
      await loadData();
    } catch (err) {
      console.error('Release Bed Error:', err);
      setError(err.response?.data?.detail || 'Failed to release bed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Update Status Action (Maintenance / Available)
  const handleStatusChange = async (bed, newStatus) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await bedService.updateBedStatus(bed.id, newStatus);
      setSuccess(`Bed '${bed.bed_number}' status updated to '${newStatus}'.`);
      await loadData();
    } catch (err) {
      console.error('Update Bed Status Error:', err);
      setError(err.response?.data?.detail || 'Failed to update bed status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeStyle = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'occupied':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'reserved':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'maintenance':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getWardStatusBadge = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'available':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'partially occupied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'full':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Bed & Ward Management' }]} />

      {/* ══════════════════════════════════════
          HEADER TITLE & REFRESH BUTTON
      ══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FiLayers className="text-blue-600 dark:text-blue-400" />
            Bed & Ward Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time hospital bed allocation, ward occupancy monitoring, and patient placement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading || actionLoading}
            className="btn-secondary py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ALERT NOTIFICATIONS */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
        >
          <FiAlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Attention Required</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200">
            <FiX size={15} />
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5"
        >
          <FiCheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="flex-1">
            <p className="font-bold">Success</p>
            <p className="mt-0.5">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-200">
            <FiX size={15} />
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          1. DASHBOARD SUMMARY CARDS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { title: 'Total Beds', val: summary?.total_beds, icon: FiGrid, color: 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-300' },
          { title: 'Available Beds', val: summary?.available_beds, icon: FiCheckCircle, color: 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300' },
          { title: 'Occupied Beds', val: summary?.occupied_beds, icon: FiUserCheck, color: 'border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-300' },
          { title: 'Reserved Beds', val: summary?.reserved_beds, icon: FiShield, color: 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-300' },
          { title: 'Maintenance Beds', val: summary?.maintenance_beds, icon: FiTool, color: 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            {...fadeUp(idx * 0.05)}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.color}`}>
                <card.icon size={17} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
              {loading ? '—' : card.val ?? 0}
            </p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-2">
              {card.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════
          2. WARD OVERVIEW SECTION
      ══════════════════════════════════════ */}
      <motion.section {...fadeUp(0.15)} className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FiActivity className="text-blue-600 dark:text-blue-400" />
              Ward Overview & Occupancy
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Departmental ward capacity and status indicators calculated from live database records.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Ward Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Total Beds</th>
                  <th className="py-3.5 px-4 text-center">Available</th>
                  <th className="py-3.5 px-4 text-center">Occupied</th>
                  <th className="py-3.5 px-4 text-center">Reserved</th>
                  <th className="py-3.5 px-4 text-center">Maintenance</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Occupancy Rate</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {wards.map((ward) => (
                  <tr key={ward.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      {ward.name}
                    </td>
                    <td className="py-3.5 px-4 font-medium">{ward.department}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">{ward.total_beds}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">{ward.available_beds}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-blue-600 dark:text-blue-400">{ward.occupied_beds}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-amber-600 dark:text-amber-400">{ward.reserved_beds}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-rose-600 dark:text-rose-400">{ward.maintenance_beds}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              ward.occupancy_percentage > 85
                                ? 'bg-rose-500'
                                : ward.occupancy_percentage > 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(ward.occupancy_percentage, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 w-10 text-right">
                          {ward.occupancy_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getWardStatusBadge(ward.status)}`}>
                        {ward.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════
          3. BED OVERVIEW & FILTERS
      ══════════════════════════════════════ */}
      <motion.section {...fadeUp(0.25)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FiGrid className="text-blue-600 dark:text-blue-400" />
              Bed Overview & Allocation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage individual bed statuses, patient bed assignments, and releases.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-semibold">
            Showing {filteredBeds.length} of {beds.length} total beds
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Ward
            </label>
            <select
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              className="input-field text-xs w-full"
            >
              <option value="all">All Wards ({beds.length})</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Department
            </label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="input-field text-xs w-full"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field text-xs w-full"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* BEDS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Bed ID</th>
                  <th className="py-3.5 px-4">Ward</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Assigned Patient</th>
                  <th className="py-3.5 px-4 text-center">Bed Status</th>
                  <th className="py-3.5 px-4">Assignment Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredBeds.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 italic">
                      No beds match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredBeds.map((bed) => {
                    const isAvailable = bed.status.toLowerCase() === 'available';
                    const isOccupied = bed.status.toLowerCase() === 'occupied';
                    const isMaintenance = bed.status.toLowerCase() === 'maintenance';

                    return (
                      <tr key={bed.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {bed.bed_number}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {bed.ward_name}
                        </td>
                        <td className="py-3.5 px-4">{bed.department}</td>
                        <td className="py-3.5 px-4">
                          {bed.patient_name ? (
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{bed.patient_name}</p>
                              <p className="text-[10px] text-slate-400">{bed.patient_mrn || `#${bed.patient_id}`}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeStyle(bed.status)}`}>
                            {bed.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {bed.assigned_at ? new Date(bed.assigned_at).toLocaleString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Hospital Admin Exclusive Controls */}
                            {isHospitalAdmin ? (
                              <>
                                {isAvailable && (
                                  <button
                                    onClick={() => {
                                      setAssignModalBed(bed);
                                      setSelectedPatientId('');
                                    }}
                                    disabled={actionLoading}
                                    className="btn-primary py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <FiUserPlus size={13} />
                                    <span>Assign</span>
                                  </button>
                                )}

                                {isOccupied && (
                                  <button
                                    onClick={() => handleRelease(bed)}
                                    disabled={actionLoading}
                                    className="py-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <FiXCircle size={13} />
                                    <span>Release</span>
                                  </button>
                                )}

                                {!isMaintenance ? (
                                  <button
                                    onClick={() => handleStatusChange(bed, 'Maintenance')}
                                    disabled={actionLoading}
                                    className="py-1.5 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[11px] font-semibold transition-colors"
                                    title="Mark for Maintenance"
                                  >
                                    <FiTool size={13} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(bed, 'Available')}
                                    disabled={actionLoading}
                                    className="py-1.5 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <FiCheckCircle size={13} />
                                    <span>Make Available</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">View Only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════
          PATIENT-BED ASSIGNMENT MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {assignModalBed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center">
                    <FiUserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Assign Patient to Bed
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bed: <span className="font-bold text-blue-600 dark:text-blue-400">{assignModalBed.bed_number}</span> ({assignModalBed.ward_name})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignModalBed(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Select Patient
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    className="input-field text-sm w-full"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {getPatientLabel(p)}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select an existing patient from the database.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">Bed Assignment Details:</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    • <span className="font-semibold">Bed Number:</span> {assignModalBed.bed_number}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    • <span className="font-semibold">Ward:</span> {assignModalBed.ward_name} ({assignModalBed.department})
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAssignModalBed(null)}
                    className="btn-secondary text-xs py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !selectedPatientId}
                    className="btn-primary text-xs py-2.5 px-5 font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
