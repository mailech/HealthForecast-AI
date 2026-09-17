import { useEffect, useMemo, useState } from "react";
import {
  Brain, User, Search, RefreshCw, AlertTriangle, HeartPulse,
  CheckCircle, Activity, Database, Clock
} from "lucide-react";
import api from "../api/api";
import ClinicalDecisionSupport from "../components/prediction/ClinicalDecisionSupport";

function Prediction() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [search, setSearch] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patients");
      setPatients(res.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return patients.slice(0, 6);
    return patients.filter(p =>
      `${p.name} ${p.id} ${p.disease}`.toLowerCase().includes(q)
    );
  }, [patients, search]);

  const selectPatient = async patient => {
    setPatientId(String(patient.id));
    setSearch(patient.name || "");
    setShowList(false);
    setPrediction(null);
    setError("");

    try {
      const res = await api.get(`/prediction/patient/${patient.id}`);
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    }
  };

  const handlePredict = async () => {
    if (!patientId) {
      setError("Please select a patient first.");
      return;
    }

    try {
      setPredicting(true);
      setPrediction(null);
      setError("");

      const res = await api.post("/prediction", {
        patient_id: Number(patientId)
      });

      setPrediction(res.data);

      const historyRes = await api.get(`/prediction/patient/${patientId}`);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.response?.data?.detail || "Prediction failed.");
    } finally {
      setPredicting(false);
    }
  };

  const patient = patients.find(p => p.id === Number(patientId));
  const score = prediction ? Math.round(prediction.risk_score * 100) : 0;

  const riskStyles = {
    High: {
      color: "text-red-400",
      border: "border-red-500",
      bg: "bg-red-500",
      glow: "shadow-[0_0_70px_rgba(239,68,68,0.4)]",
      icon: AlertTriangle
    },
    Medium: {
      color: "text-amber-400",
      border: "border-amber-400",
      bg: "bg-amber-400",
      glow: "shadow-[0_0_70px_rgba(245,158,11,0.35)]",
      icon: HeartPulse
    },
    Low: {
      color: "text-emerald-400",
      border: "border-emerald-400",
      bg: "bg-emerald-400",
      glow: "shadow-[0_0_70px_rgba(16,185,129,0.35)]",
      icon: CheckCircle
    }
  };

  const risk = riskStyles[prediction?.risk_level] || riskStyles.Low;
  const RiskIcon = risk.icon;

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Brain size={21} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Health Risk Prediction</h1>
            <p className="text-sm text-slate-500">AI-powered readmission risk assessment</p>
          </div>
        </div>

        <button
          onClick={loadPatients}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* MODEL INFO */}
      <div className="bg-slate-950 rounded-2xl p-4 text-white border border-slate-800">
        <div className="grid md:grid-cols-3 gap-4">
          <ModelInfo icon={Database} label="Dataset" value="Diabetes 130-US Hospitals" />
          <ModelInfo icon={Brain} label="ML Algorithm" value="Logistic Regression" />
          <ModelInfo icon={Activity} label="ROC-AUC" value="0.6462" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">

        {/* PATIENT ASSESSMENT */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <User size={18} className="text-blue-700" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Patient Assessment</h2>
              <p className="text-xs text-slate-400">Select a patient to run AI analysis</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={search}
                disabled={loading}
                onFocus={() => setShowList(true)}
                onChange={e => {
                  setSearch(e.target.value);
                  setPatientId("");
                  setPrediction(null);
                  setShowList(true);
                }}
                placeholder={
                  loading
                    ? "Loading patients..."
                    : "Search patient by name, ID or disease..."
                }
                className="ml-3 w-full bg-transparent outline-none text-sm"
              />
            </div>

            {showList && !loading && (
              <div className="absolute z-30 w-full mt-2 bg-white border rounded-xl shadow-xl overflow-hidden">
                {results.length ? (
                  results.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 border-b last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                        {p.name?.[0]?.toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          ID #{p.id} • {p.disease || "No disease"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-sm text-slate-400">No patient found.</p>
                )}
              </div>
            )}
          </div>

          {patient ? (
            <div className="mt-5">

              <div className="bg-slate-50 border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                    {patient.name?.[0]?.toUpperCase()}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                    <p className="text-xs text-slate-400">Patient ID #{patient.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Info label="Age" value={patient.age} />
                  <Info label="Gender" value={patient.gender} />
                  <Info label="Disease" value={patient.disease} />
                  <Info label="Risk" value={patient.risk} />
                  <Info label="Status" value={patient.status} />
                  <Info label="Predictions" value={history.length} />
                </div>
              </div>

              <button
                onClick={handlePredict}
                disabled={predicting}
                className="mt-4 w-full py-3.5 rounded-xl bg-slate-950 border border-blue-500/40 text-white font-semibold shadow-lg hover:border-blue-400 hover:shadow-blue-500/20 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  {predicting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin text-blue-400" />
                      AI SCANNING...
                    </>
                  ) : (
                    <>
                      <Brain size={19} className="text-blue-400" />
                      START AI RISK SCAN
                    </>
                  )}
                </span>
              </button>
            </div>
          ) : (
            <div className="mt-5 py-12 border border-dashed rounded-xl text-center">
              <User size={35} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">Select a patient</p>
              <p className="text-xs text-slate-400">Search above to begin.</p>
            </div>
          )}
        </div>

        {/* AI PREDICTION */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white overflow-hidden">

          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-semibold">AI Prediction</h2>
              <p className="text-xs text-slate-500">Neural risk assessment engine</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              AI ONLINE
            </div>
          </div>

          {predicting ? (

            <div className="h-[350px] flex flex-col items-center justify-center">

              <div className="relative w-56 h-56">
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-spin" />
                <div className="absolute inset-3 rounded-full border border-blue-400/20 animate-[spin_4s_linear_infinite_reverse]" />
                <div className="absolute inset-7 rounded-full border border-dashed border-blue-400/30 animate-spin" />
                <div className="absolute inset-12 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />

                <div className="absolute inset-14 rounded-full bg-gradient-to-br from-blue-500 via-blue-700 to-slate-950 shadow-[0_0_50px_rgba(59,130,246,0.6)] flex items-center justify-center">
                  <Brain size={42} className="text-white animate-pulse" />
                </div>

                <div className="absolute left-8 right-8 top-1/2 h-px bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] animate-pulse" />
              </div>

              <p className="mt-6 text-sm font-semibold">ANALYZING PATIENT</p>
              <p className="text-xs text-slate-500 mt-1">
                Running machine learning assessment...
              </p>
            </div>

          ) : !prediction ? (

            <div className="h-[350px] flex flex-col items-center justify-center">

              <div className="relative w-56 h-56">
                <div className="absolute inset-0 rounded-full border border-slate-700" />
                <div className="absolute inset-4 rounded-full border border-slate-800" />
                <div className="absolute inset-9 rounded-full border border-dashed border-slate-700 animate-spin" />

                <div className="absolute inset-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <Brain size={42} className="text-slate-600" />
                </div>
              </div>

              <p className="text-sm font-medium text-slate-400">AI scanner ready</p>
              <p className="text-xs text-slate-600 mt-1">
                Waiting for patient assessment
              </p>
            </div>

          ) : (

            <div className="space-y-4">

              <div className="relative h-[280px] flex items-center justify-center">

                <div className={`absolute w-44 h-44 rounded-full blur-3xl ${risk.bg} opacity-20 animate-pulse`} />

                <div className={`absolute w-56 h-56 rounded-full border ${risk.border} opacity-30 animate-[spin_10s_linear_infinite]`} />

                <div className={`absolute w-48 h-48 rounded-full border border-dashed ${risk.border} opacity-40 animate-[spin_6s_linear_infinite_reverse]`} />

                <div className="absolute w-56 h-56 animate-[spin_5s_linear_infinite]">
                  <div className={`absolute -top-1 left-1/2 w-3 h-3 rounded-full ${risk.bg}`} />
                </div>

                <div className={`relative w-36 h-36 rounded-full bg-slate-900 border-2 ${risk.border} ${risk.glow} flex flex-col items-center justify-center`}>
                  <RiskIcon size={22} className={`${risk.color} mb-1 animate-pulse`} />

                  <span className={`text-4xl font-bold ${risk.color}`}>
                    {score}%
                  </span>

                  <span className={`text-[10px] font-bold tracking-[0.2em] ${risk.color}`}>
                    {prediction.risk_level.toUpperCase()}
                  </span>
                </div>

                <div className={`absolute w-40 h-px ${risk.bg} opacity-40 animate-pulse`} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat label="PROBABILITY" value={`${score}%`} />
                <Stat label="RISK LEVEL" value={prediction.risk_level} />
                <Stat label="MODEL" value="ML" />
              </div>

              <div className="border border-slate-800 bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-blue-400" />
                  <h3 className="text-sm font-semibold">AI Recommendation</h3>
                </div>

                <p className="text-xs text-slate-400 leading-5">
                  {prediction.recommendation}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <Clock size={12} />
                Prediction generated successfully
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CLINICAL SUPPORT */}
      {prediction && <ClinicalDecisionSupport prediction={prediction} />}

      {/* HISTORY */}
      {patientId && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-white">

          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-white">Prediction History</h2>
              <p className="text-xs text-slate-400 mt-1">
                Previous AI assessments for this patient
              </p>
            </div>

            <span className="text-xs bg-slate-800 text-blue-300 px-3 py-1.5 rounded-lg border border-slate-700">
              {history.length} Records
            </span>
          </div>

          {history.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">
              No previous predictions.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-slate-900">
                  <tr>
                    <th className="p-4 text-left text-xs font-medium text-blue-300">
                      Date
                    </th>
                    <th className="p-4 text-center text-xs font-medium text-blue-300">
                      Risk
                    </th>
                    <th className="p-4 text-center text-xs font-medium text-blue-300">
                      Probability
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {history.map(item => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-800 hover:bg-slate-900/70 transition"
                    >
                      <td className="p-4 text-sm text-slate-300">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "—"}
                      </td>

                      <td className="text-center">
                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-blue-950 text-blue-300 border border-blue-900">
                          {item.risk_level}
                        </span>
                      </td>

                      <td className="text-center text-sm font-semibold text-blue-300">
                        {Math.round(item.risk_score * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-xs text-slate-400 py-2">
        AI predictions are intended for clinical decision support and project demonstration only.
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700 mt-1">
        {value || "—"}
      </p>
    </div>
  );
}

function ModelInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-blue-300" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-900 rounded-lg p-2 text-center">
      <p className="text-[9px] text-slate-500">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

export default Prediction; 