import { useState, useEffect } from "react";
import { X, Calendar, Stethoscope, Pill, Download } from "lucide-react";
import { getTreatments, downloadPatientReport } from "../api/client";

function PatientModal({ patient, onClose }) {
  const [treatments, setTreatments] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (!patient) return;
    getTreatments()
      .then((data) => {
        const patientTreatments = data.filter((t) => t.patient_id === patient.id);
        setTreatments(patientTreatments);
      })
      .catch(() => setTreatments([]));
  }, [patient]);

  if (!patient) return null;

  async function handleDownload() {
    setDownloadError("");
    setDownloading(true);
    try {
      await downloadPatientReport(patient.id);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.full_name}</h2>
            <p className="text-slate-500 text-sm">DOB: {patient.date_of_birth}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Stethoscope size={16} />
            <span>{patient.diagnosis}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={16} />
            <span>Admitted: {patient.admission_date}</span>
          </div>
        </div>

        {downloadError && (
          <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg px-3 py-2">
            {downloadError}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-pista-500 hover:bg-pista-600 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg transition"
        >
          <Download size={16} />
          {downloading ? "Preparing report..." : "Download Health Report"}
        </button>

        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-700 mb-2">Treatment History</p>
          {treatments.length === 0 && (
            <p className="text-sm text-slate-400">No treatments recorded yet.</p>
          )}
          {treatments.map((t) => (
            <div key={t.id} className="bg-pista-50 border border-pista-100 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Pill size={14} />
                {t.treatment_name}
              </div>
              <p className="text-xs text-slate-600 mt-1">Medication: {t.medication || "—"}</p>
              <p className="text-xs text-slate-600">Outcome: {t.outcome || "Pending"}</p>
              {t.notes && <p className="text-xs text-slate-500 mt-1">{t.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PatientModal;