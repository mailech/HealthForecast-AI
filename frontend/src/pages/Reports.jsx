import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Download,
  RefreshCw,
  UserRound,
  Brain,
  Pill,
  Stethoscope,
  Activity,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X
} from "lucide-react";
import api from "../api/api";


function Info({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1">{value || "-"}</p>
    </div>
  );
}


function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon size={18} className="text-slate-700" />
        </div>
        <h2 className="font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}


function Badge({ children, type = "normal" }) {
  const styles = {
    high: "bg-red-50 text-red-700 border-red-100",
    medium: "bg-amber-50 text-amber-700 border-amber-100",
    low: "bg-slate-100 text-slate-600 border-slate-200",
    stable: "bg-slate-100 text-slate-700 border-slate-200",
    normal: "bg-blue-50 text-blue-700 border-blue-100"
  };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${styles[type] || styles.normal}`}>
      {children}
    </span>
  );
}


function Reports() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/");
      setPatients(res.data || []);
    } catch {
      try {
        const res = await api.get("/patients");
        setPatients(res.data || []);
      } catch {
        setPatients([]);
      }
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return patients.slice(0, 6);

    return patients
      .filter(p =>
        `${p.name} ${p.id} ${p.disease} ${p.status}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 6);
  }, [patients, search]);


  const loadReport = async patient => {
    setSelected(patient);
    setReport(null);
    setError("");
    setLoading(true);
    setSearch(patient.name || "");

    try {
      const res = await api.get(`/reports/patient/${patient.id}`);
      setReport(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load patient report."
      );
    } finally {
      setLoading(false);
    }
  };


  const downloadPdf = async () => {
    if (!selected) return;

    setDownloading(true);
    setError("");

    try {
      const res = await api.get(
        `/reports/patient/${selected.id}/pdf`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/pdf"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        `HealthForecast_Patient_${selected.id}_Report.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to download the report."
      );
    } finally {
      setDownloading(false);
    }
  };


  const riskType = report?.prediction?.risk_level?.toLowerCase();


  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* HEADER */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <FileText size={15} />
            Clinical Reports
          </div>

          <h1 className="text-2xl font-bold mt-2">
            Patient Report Center
          </h1>

          <p className="text-sm text-slate-300 mt-1">
            Review patient information and generate secure clinical reports.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
          <ShieldCheck size={16} />
          Authorized clinical access
        </div>
      </div>


      {/* SEARCH */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient by name, ID, disease or status..."
              className="w-full h-11 pl-11 pr-10 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm focus:border-slate-400"
            />

            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelected(null);
                  setReport(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={loadPatients}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        {results.length > 0 && (
          <div className="mt-3 grid md:grid-cols-2 lg:grid-cols-3 gap-2">

            {results.map(patient => (
              <button
                key={patient.id}
                onClick={() => loadReport(patient)}
                className={`text-left p-3 rounded-xl border transition ${
                  selected?.id === patient.id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                    {(patient.name || "P").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {patient.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      Patient #{patient.id}
                    </p>
                  </div>

                </div>
              </button>
            ))}

          </div>
        )}
      </div>


      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <AlertTriangle size={17} />
          {error}
        </div>
      )}


      {/* EMPTY */}
      {!selected && !loading && (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
            <FileText size={25} className="text-slate-500" />
          </div>

          <h2 className="font-bold text-slate-800 mt-4">
            Select a patient
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Choose a patient above to generate their clinical report.
          </p>
        </div>
      )}


      {/* LOADING */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-slate-600"
          />

          <p className="text-sm text-slate-500 mt-3">
            Loading patient report...
          </p>
        </div>
      )}


      {/* REPORT */}
      {report && !loading && (

        <div className="space-y-5">

          {/* REPORT HEADER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <UserRound size={25} />
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Patient Report
                  </p>

                  <h2 className="text-xl font-bold text-slate-900">
                    {report.patient.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Patient #{report.patient.id} · {report.patient.disease}
                  </p>
                </div>

              </div>


              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="h-11 px-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {downloading ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download size={17} />
                    Download PDF
                  </>
                )}
              </button>

            </div>
          </div>


          {/* PATIENT */}
          <Section icon={UserRound} title="Patient Information">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              <Info label="Patient ID" value={`#${report.patient.id}`} />
              <Info label="Name" value={report.patient.name} />
              <Info label="Age" value={report.patient.age} />
              <Info label="Gender" value={report.patient.gender} />
              <Info label="Disease" value={report.patient.disease} />
              <Info label="Admission Date" value={report.patient.admission_date} />
              <Info label="Risk" value={report.patient.risk} />
              <Info label="Status" value={report.patient.status} />

            </div>

            {report.patient.notes && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Clinical Notes
                </p>
                <p className="text-sm text-slate-700">
                  {report.patient.notes}
                </p>
              </div>
            )}

          </Section>


          {/* AI */}
          <Section icon={Brain} title="AI Readmission Risk">

            {report.prediction ? (

              <div className="grid lg:grid-cols-[220px_1fr] gap-5">

                <div className="bg-slate-900 rounded-2xl p-5 text-white text-center">

                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    Risk Score
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {(report.prediction.risk_score * 100).toFixed(1)}%
                  </p>

                  <div className="mt-3">
                    <Badge type={riskType}>
                      {report.prediction.risk_level}
                    </Badge>
                  </div>

                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">

                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Activity size={17} />
                    Clinical Recommendation
                  </div>

                  <p className="text-sm text-slate-600 mt-3 leading-6">
                    {report.prediction.recommendation}
                  </p>

                  <p className="text-xs text-slate-400 mt-4">
                    Prediction generated: {report.prediction.created_at || "-"}
                  </p>

                </div>

              </div>

            ) : (

              <div className="text-sm text-slate-500 flex items-center gap-2">
                <AlertTriangle size={17} />
                No ML prediction is available for this patient.
              </div>

            )}

          </Section>


          {/* TREATMENTS */}
          <Section icon={Stethoscope} title="Treatment Effectiveness">

            {report.treatments?.length ? (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Treatment</th>
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Outcome</th>
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Effectiveness</th>
                      <th className="py-3 text-xs text-slate-400 uppercase">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.treatments.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold text-slate-700">{item.name}</td>
                        <td className="py-3 pr-4 text-slate-600">{item.outcome}</td>
                        <td className="py-3 pr-4 font-semibold text-slate-700">{item.effectiveness}%</td>
                        <td className="py-3 text-slate-500">{item.date || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>

            ) : (
              <p className="text-sm text-slate-400">
                No treatment records available.
              </p>
            )}

          </Section>


          {/* MEDICATIONS */}
          <Section icon={Pill} title="Medication Effectiveness">

            {report.medications?.length ? (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Medication</th>
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Outcome</th>
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Effectiveness</th>
                      <th className="py-3 text-xs text-slate-400 uppercase">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.medications.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold text-slate-700">{item.name}</td>
                        <td className="py-3 pr-4 text-slate-600">{item.outcome}</td>
                        <td className="py-3 pr-4 font-semibold text-slate-700">{item.effectiveness}%</td>
                        <td className="py-3 text-slate-500">{item.date || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>

            ) : (
              <p className="text-sm text-slate-400">
                No medication records available.
              </p>
            )}

          </Section>


          {/* RECOVERY */}
          <Section icon={CheckCircle2} title="Recovery Analysis">

            {report.recovery?.length ? (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Stage</th>
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Score</th>
                      <th className="py-3 pr-4 text-xs text-slate-400 uppercase">Days</th>
                      <th className="py-3 text-xs text-slate-400 uppercase">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.recovery.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold text-slate-700">{item.stage}</td>
                        <td className="py-3 pr-4 text-slate-600">{item.score}%</td>
                        <td className="py-3 pr-4 text-slate-600">{item.days || "-"}</td>
                        <td className="py-3 text-slate-500">{item.date || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>

            ) : (
              <p className="text-sm text-slate-400">
                No recovery records available.
              </p>
            )}

          </Section>


          {/* FOOTER */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays size={15} />
              Report generated from HealthForecast-AI records
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} />
              Authorized access only
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default Reports;