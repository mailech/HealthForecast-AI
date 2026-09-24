import React, { useEffect, useState } from 'react';
import {
  FiActivity,
  FiFileText,
  FiCheckCircle,
  FiCalendar,
  FiUser,
  FiClock,
  FiCpu,
  FiAlertCircle,
} from 'react-icons/fi';
import RiskBadge from '../common/RiskBadge';
import { patientService } from '../../services/patientService';

export default function PatientClinicalActivityTimeline({ patientId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      loadTimeline(patientId);
    }
  }, [patientId]);

  const loadTimeline = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await patientService.getTimeline(id);
      setEvents(data || []);
    } catch {
      setEvents([]);
      setError('Unable to load clinical timeline.');
    } finally {
      setLoading(false);
    }
  };

  const renderEventIcon = (type) => {
    switch (type) {
      case 'risk_prediction_generated':
        return <FiActivity className="text-blue-600 dark:text-blue-400" size={15} />;
      case 'medical_report_uploaded':
        return <FiFileText className="text-indigo-600 dark:text-indigo-400" size={15} />;
      case 'clinical_info_extracted':
        return <FiCpu className="text-teal-600 dark:text-teal-400" size={15} />;
      case 'appointment_completed':
        return <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={15} />;
      case 'appointment_scheduled':
        return <FiCalendar className="text-purple-600 dark:text-purple-400" size={15} />;
      case 'patient_registered':
        return <FiUser className="text-slate-600 dark:text-slate-400" size={15} />;
      default:
        return <FiClock className="text-zinc-500" size={15} />;
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Date N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' • ' + d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-xs text-zinc-400">Loading clinical activity timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
        <FiAlertCircle size={15} />
        <span>{error}</span>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
        <div className="w-8 h-8 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-2">
          <FiClock size={16} />
        </div>
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          No clinical activity recorded for this patient yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <FiClock className="text-blue-600 dark:text-blue-400" size={15} />
          Patient Clinical Activity Timeline ({events.length})
        </h3>
        <span className="text-[11px] text-zinc-400">Chronological Events</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
        {events.map((ev) => (
          <div key={ev.id} className="relative group">
            {/* TIMELINE NODE ICON DOT */}
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shadow-xs z-10">
              {renderEventIcon(ev.event_type)}
            </div>

            {/* EVENT CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-900 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  {ev.title}
                </h4>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  {formatDate(ev.timestamp)}
                </span>
              </div>

              {ev.description && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {ev.description}
                </p>
              )}

              {/* EVENT DETAILS */}
              {ev.details && Object.keys(ev.details).length > 0 && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-2 text-[11px] space-y-1">
                  {ev.event_type === 'risk_prediction_generated' && (
                    <div className="flex items-center gap-2">
                      <RiskBadge
                        level={(ev.details.risk_category || 'low').toLowerCase()}
                        score={ev.details.risk_score}
                      />
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {ev.details.risk_score}% Readmission Risk
                      </span>
                    </div>
                  )}

                  {ev.event_type === 'medical_report_uploaded' && (
                    <div className="flex flex-wrap gap-x-3 text-zinc-600 dark:text-zinc-400">
                      <span>File: <strong className="text-zinc-800 dark:text-zinc-200">{ev.details.file_name}</strong></span>
                      <span>Size: <strong>{ev.details.file_size}</strong></span>
                      {ev.details.uploaded_by && (
                        <span>By: <strong>{ev.details.uploaded_by}</strong></span>
                      )}
                    </div>
                  )}

                  {ev.event_type === 'clinical_info_extracted' && (
                    <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      {ev.details.prior_admissions !== null && ev.details.prior_admissions !== undefined && (
                        <div>
                          <span>Prior Admissions: </span>
                          <strong className="text-blue-600 dark:text-blue-400">{ev.details.prior_admissions}</strong>
                        </div>
                      )}
                      {ev.details.length_of_stay !== null && ev.details.length_of_stay !== undefined && (
                        <div>
                          <span>Length of Stay: </span>
                          <strong className="text-blue-600 dark:text-blue-400">{ev.details.length_of_stay} days</strong>
                        </div>
                      )}
                      {ev.details.diagnosis && (
                        <div className="col-span-2">
                          <span>Diagnosis: </span>
                          <strong className="text-zinc-800 dark:text-zinc-200">{ev.details.diagnosis}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {(ev.event_type === 'appointment_scheduled' || ev.event_type === 'appointment_completed') && (
                    <div className="flex flex-wrap gap-x-3 text-zinc-600 dark:text-zinc-400">
                      <span>Doctor: <strong className="text-zinc-800 dark:text-zinc-200">{ev.details.doctor_name}</strong></span>
                      <span>Status: <strong className="text-blue-600 dark:text-blue-400">{ev.details.status}</strong></span>
                    </div>
                  )}

                  {ev.event_type === 'patient_registered' && (
                    <div className="flex flex-wrap gap-x-3 text-zinc-600 dark:text-zinc-400">
                      <span>MRN: <strong className="text-zinc-800 dark:text-zinc-200">{ev.details.mrn}</strong></span>
                      <span>Dept: <strong>{ev.details.department}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
