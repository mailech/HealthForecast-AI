import { useEffect, useState } from 'react';
import { patientsAPI, predictionsAPI } from '../services/api';
import { TrendingUp, FileText, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { patientLabel } from '../utils/patients';

export default function Forecasting() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [periodDays, setPeriodDays] = useState(30);
  const [forecast, setForecast] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    patientsAPI.list(0, 100).then((res) => setPatients(res.data)).catch(console.error);
  }, []);

  const generateForecast = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await predictionsAPI.forecast(parseInt(selectedId), periodDays);
      setForecast(res.data);
      const hist = await predictionsAPI.getForecasts(parseInt(selectedId));
      setForecasts(hist.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Forecast failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!forecast) return;
    const blob = new Blob([forecast.forecast_report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readmission_forecast_${(forecast.patient_name || forecast.patient_code || forecast.patient_id).toString().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const probColor = (prob) => {
    if (prob >= 0.7) return 'text-red-600';
    if (prob >= 0.4) return 'text-amber-600';
    return 'text-green-600';
  };

  const trendData = forecasts.map((f, i) => ({
    name: `#${i + 1}`,
    probability: (f.readmission_probability * 100).toFixed(1),
    confidence: (f.confidence_score * 100).toFixed(1),
  })).reverse();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Readmission Forecasting</h1>
        <p className="text-gray-500">Predict hospital readmissions and generate forecasting reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Generate Forecast
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Patient</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Choose patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{patientLabel(p)} — {p.age}, {p.gender}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Forecast Period (days)</label>
              <select
                value={periodDays}
                onChange={(e) => setPeriodDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
            <button onClick={generateForecast} disabled={loading || !selectedId} className="w-full btn-primary disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Forecast Report'}
            </button>
          </div>
        </div>

        {forecast && (
          <div className="card lg:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Forecast Report
                </h3>
                {(forecast.patient_name || forecast.patient_code) && (
                  <p className="text-sm text-gray-500 mt-1">{patientLabel(forecast)}</p>
                )}
              </div>
              <button onClick={downloadReport} className="flex items-center gap-1 btn-secondary text-sm">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Readmission Probability</p>
                <p className={`text-3xl font-bold ${probColor(forecast.readmission_probability)}`}>
                  {(forecast.readmission_probability * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Confidence Score</p>
                <p className="text-3xl font-bold text-primary-600">
                  {(forecast.confidence_score * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Forecast Period</p>
                <p className="text-3xl font-bold">{forecast.forecast_period_days} days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
                <ul className="space-y-1">
                  {forecast.risk_factors.map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-red-500">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {forecast.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-green-500">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <pre className="bg-gray-50 p-4 rounded-lg text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-48">
              {forecast.forecast_report}
            </pre>
          </div>
        )}
      </div>

      {trendData.length > 1 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Forecast Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="probability" stroke="#ef4444" name="Readmission %" strokeWidth={2} />
              <Line type="monotone" dataKey="confidence" stroke="#3b82f6" name="Confidence %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
