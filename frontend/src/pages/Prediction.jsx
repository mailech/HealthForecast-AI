import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/api";
import ClinicalDecisionSupport from "../components/prediction/ClinicalDecisionSupport";
import {
  Brain,
  User,
  AlertTriangle,
  HeartPulse,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

function Prediction() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data || []);

      if (res.data?.length === 1) {
        setPatientId(String(res.data[0].id));
        loadHistory(res.data[0].id);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id) => {
    if (!id) return;

    try {
      const res = await api.get(
        `/prediction/patient/${id}`
      );
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  const handlePatientChange = async (e) => {
    const id = e.target.value;

    setPatientId(id);
    setPrediction(null);
    setError("");

    if (id) {
      await loadHistory(id);
    } else {
      setHistory([]);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!patientId) {
      setError("Please select a patient.");
      return;
    }

    try {
      setPredicting(true);
      setError("");

      const res = await api.post("/prediction", {
        patient_id: Number(patientId),
      });

      setPrediction(res.data);
      await loadHistory(patientId);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Prediction failed."
      );
    } finally {
      setPredicting(false);
    }
  };

  const selectedPatient = patients.find(
    (p) => p.id === Number(patientId)
  );

  const riskStyle = {
    High: {
      box: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600",
      icon: <AlertTriangle size={42} />,
    },
    Medium: {
      box: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-600",
      icon: <HeartPulse size={42} />,
    },
    Low: {
      box: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600",
      icon: <CheckCircle size={42} />,
    },
  };

  return (
    <MainLayout>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Health Risk Prediction
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          AI-powered readmission risk prediction
        </p>
      </div>

      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        This prediction uses the trained Diabetes
        130-US Hospitals dataset model.
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* PATIENT */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <User className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                Select Patient
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a patient for prediction
              </p>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">

            <select
              value={patientId}
              onChange={handlePatientChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
            >
              <option value="">
                {loading
                  ? "Loading patients..."
                  : "Select a patient"}
              </option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} — Age {patient.age} —{" "}
                  {patient.disease}
                </option>
              ))}
            </select>

            {selectedPatient && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-700 rounded-xl p-5">
                <Info label="Name" value={selectedPatient.name} />
                <Info label="Age" value={selectedPatient.age} />
                <Info label="Gender" value={selectedPatient.gender} />
                <Info label="Disease" value={selectedPatient.disease} />
                <Info label="Risk" value={selectedPatient.risk} />
                <Info label="Status" value={selectedPatient.status} />
              </div>
            )}

            <button
              type="submit"
              disabled={!patientId || predicting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 ml-auto"
            >
              {predicting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain size={18} />
                  Predict Risk
                </>
              )}
            </button>

          </form>
        </div>

        {/* RESULT */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Prediction Result
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
            AI-assisted readmission assessment
          </p>

          {!prediction ? (
            <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-400">
              <Brain
                size={44}
                className="mx-auto mb-3"
              />
              Select a patient and predict risk.
            </div>
          ) : (
            <div className="space-y-5">

              <div
                className={`rounded-xl p-6 text-center ${
                  riskStyle[prediction.risk_level]?.box
                }`}
              >
                <div
                  className={`mx-auto w-fit mb-2 ${
                    riskStyle[prediction.risk_level]?.text
                  }`}
                >
                  {riskStyle[prediction.risk_level]?.icon}
                </div>

                <p className="text-sm text-gray-500">
                  Predicted Risk
                </p>

                <h3
                  className={`text-3xl font-bold ${
                    riskStyle[prediction.risk_level]?.text
                  }`}
                >
                  {prediction.risk_level}
                </h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    Risk Probability
                  </span>
                  <b className="dark:text-white">
                    {Math.round(
                      prediction.risk_score * 100
                    )}%
                  </b>
                </div>

                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded-full">
                  <div
                    className="h-3 rounded-full bg-blue-600"
                    style={{
                      width: `${prediction.risk_score * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="border rounded-xl p-5">
                <h3 className="font-semibold dark:text-white mb-2">
                  Recommendation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                  {prediction.recommendation}
                </p>
              </div>

              <p className="text-xs text-gray-400">
                This result is for decision-support and
                demonstration purposes only, not a diagnosis.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* CLINICAL DECISION SUPPORT */}
      <ClinicalDecisionSupport prediction={prediction} />

      {/* HISTORY */}
      {patientId && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow mt-6 overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold dark:text-white">
              Prediction History
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Previous predictions for this patient
            </p>
          </div>

          {history.length === 0 ? (
            <p className="p-6 text-gray-500">
              No previous predictions.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4">Risk</th>
                    <th className="p-4">Probability</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t"
                    >
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString()
                          : "—"}
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs bg-slate-100">
                          {item.risk_level}
                        </span>
                      </td>

                      <td className="p-4 text-center dark:text-white">
                        {Math.round(
                          item.risk_score * 100
                        )}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </MainLayout>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>
      <p className="font-medium text-slate-800 dark:text-white mt-1">
        {value}
      </p>
    </div>
  );
}

export default Prediction; 