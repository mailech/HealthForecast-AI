import React, { useState, useEffect } from 'react'
import api from '../services/api'
import {
  AlertTriangle, TrendingUp, Sparkles, RefreshCw,
  Search, LineChart, ShieldAlert, ArrowUpRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import RiskPredictorModal from '../components/RiskPredictorModal'

export default function RiskPredictionDashboard() {
  const [highRiskList, setHighRiskList] = useState([])
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [batchScoring, setBatchScoring] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [listRes, forecastRes] = await Promise.all([
        api.get('/predictions/high-risk-list?limit=50'),
        api.get('/predictions/forecasting-trends')
      ])
      setHighRiskList(listRes.data)
      setForecast(forecastRes.data)
    } catch (err) {
      console.error('Failed to load risk prediction dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBatchPredict = async () => {
    setBatchScoring(true)
    try {
      await api.post('/predictions/batch-predict')
      await fetchData()
    } catch (err) {
      console.error('Failed batch scoring:', err)
    } finally {
      setBatchScoring(false)
    }
  }

  const openCalculator = (patient = null) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  const filteredPatients = highRiskList.filter(p => {
    const matchesSearch = p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
                          p.patient_nbr.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = filterLevel === 'ALL' || p.risk_level.toUpperCase() === filterLevel
    return matchesSearch && matchesLevel
  })

  const highCount = highRiskList.filter(p => p.risk_level === 'High').length
  const medCount = highRiskList.filter(p => p.risk_level === 'Medium').length
  const lowCount = highRiskList.filter(p => p.risk_level === 'Low').length
  const totalCount = highRiskList.length || 1

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">Loading Risk Intelligence & Forecasting Workflows...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Readmission Forecasting Engine
            </span>
            <span className="text-xs text-slate-400">ML Predictive Stratification</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Patient Risk Prediction & Readmission Forecast</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ML risk stratification, 30-day readmission trend forecasting, and clinical decision support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchPredict}
            disabled={batchScoring}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${batchScoring ? 'animate-spin' : ''}`} />
            {batchScoring ? 'Scoring Database...' : 'Run Batch Risk Scoring'}
          </button>

          <button
            onClick={() => openCalculator()}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs"
          >
            <Sparkles className="w-4 h-4" /> AI Risk Calculator
          </button>
        </div>
      </div>

      {/* Risk Stratification Pyramid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Active Cohort</div>
          <div className="text-3xl font-extrabold text-white mt-2">{highRiskList.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Evaluated across hospital wards</div>
        </div>

        <div className="bg-rose-950/30 p-5 rounded-2xl border border-rose-500/30">
          <div className="flex justify-between items-center">
            <span className="text-xs text-rose-300 font-semibold uppercase tracking-wider">High Risk Cohort</span>
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">Score ≥ 60</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2">{highCount}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">{((highCount / totalCount) * 100).toFixed(1)}% of total cohort</div>
        </div>

        <div className="bg-amber-950/30 p-5 rounded-2xl border border-amber-500/30">
          <div className="flex justify-between items-center">
            <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Medium Risk Cohort</span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full">Score 35-59</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{medCount}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">{((medCount / totalCount) * 100).toFixed(1)}% of total cohort</div>
        </div>

        <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Low Risk Cohort</span>
            <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full">Score &lt; 35</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{lowCount}</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">{((lowCount / totalCount) * 100).toFixed(1)}% of total cohort</div>
        </div>
      </div>

      {/* 30-Day Readmission Time-Series Forecast Chart */}
      {forecast && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" /> 30-Day Readmission Rate Forecasting
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Historical readmission trends vs ML intervention projected reduction (-{forecast.expected_rate_reduction_pct}%)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                <span className="text-slate-300">Baseline Rate ({forecast.baseline_readmission_rate}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-400"></span>
                <span className="text-teal-300 font-semibold">Projected Post-Intervention ({forecast.projected_readmission_rate}%)</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.monthly_trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="actual_rate" stroke="#64748b" fillOpacity={1} fill="url(#colorActual)" name="Actual Rate" />
                <Area type="monotone" dataKey="forecasted_rate" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" name="Projected Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Patient Risk Queue Table */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Patient Readmission Risk Queue</h3>
            <p className="text-xs text-slate-400">Searchable patient cohort with calculated risk scores and contributing clinical factors</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 w-60"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterLevel === lvl
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Patient</th>
                <th className="p-3">Patient ID</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Readmit Prob</th>
                <th className="p-3">Primary Risk Factor</th>
                <th className="p-3 text-right">Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPatients.map(p => (
                <tr key={p.patient_id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-semibold text-white">{p.patient_name}</td>
                  <td className="p-3 font-mono text-xs text-teal-400">{p.patient_nbr}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.risk_level === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                      p.risk_level === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {p.risk_level} Risk
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-white">{p.risk_score} / 100</td>
                  <td className="p-3 text-xs text-slate-300">{(p.readmission_probability * 100).toFixed(1)}%</td>
                  <td className="p-3 text-xs text-slate-400 max-w-xs truncate">
                    {p.risk_factors[0]?.factor || 'Prior Admission / Length of Stay'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openCalculator(p)}
                      className="text-xs bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/40 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ml-auto"
                    >
                      <Sparkles className="w-3 h-3" /> Simulate
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 text-xs">
                    No patients matching the specified criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RiskPredictorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
      />
    </div>
  )
}
