import React, { useState } from 'react'
import api from '../services/api'

export default function RiskPredictorModal({ isOpen, onClose, patient = null, onPredictionSaved }) {
  const [formData, setFormData] = useState({
    age: patient?.age || 65,
    time_in_hospital: 5,
    num_lab_procedures: 48,
    num_procedures: 2,
    num_medications: 14,
    number_inpatient: patient?.readmission_flag === 'Yes' ? 1 : 0,
    number_emergency: 0,
    a1c_result: '>7',
    max_glu_serum: 'Norm',
    diabetes_med: 'Yes'
  })

  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['age', 'time_in_hospital', 'num_lab_procedures', 'num_procedures', 'num_medications', 'number_inpatient', 'number_emergency'].includes(name)
        ? parseInt(value) || 0
        : value
    }))
  }

  const handleCalculate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/predictions/predict-interactive', {
        ...formData,
        patient_id: patient?.id || 1
      })
      setPrediction(response.data)
      if (onPredictionSaved) onPredictionSaved(response.data)
    } catch (err) {
      console.error('Failed to calculate risk:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/60 text-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-900/60 via-slate-800 to-indigo-900/60 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-lg">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Clinical Risk Intelligence Calculator</h2>
              <p className="text-xs text-slate-400">Real-time readmission risk scoring & clinical recommendation engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <form onSubmit={handleCalculate} className="lg:col-span-6 space-y-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-3">
              <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Patient Demographics & Stay</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    min="1" max="120"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Length of Stay (Days)</label>
                  <input
                    type="number"
                    name="time_in_hospital"
                    value={formData.time_in_hospital}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    min="1" max="60"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-3">
              <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Prior Hospital Utilization</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Prior Inpatient Admissions</label>
                  <input
                    type="number"
                    name="number_inpatient"
                    value={formData.number_inpatient}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    min="0" max="20"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Prior ER Visits</label>
                  <input
                    type="number"
                    name="number_emergency"
                    value={formData.number_emergency}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    min="0" max="20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-3">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Clinical Biomarkers & Meds</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">HbA1c Result</label>
                  <select
                    name="a1c_result"
                    value={formData.a1c_result}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="None">None / Not Tested</option>
                    <option value="Norm">Normal</option>
                    <option value=">7">&gt; 7%</option>
                    <option value=">8">&gt; 8% (High)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Prescribed Meds Count</label>
                  <input
                    type="number"
                    name="num_medications"
                    value={formData.num_medications}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    min="1" max="50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Calculating Risk Intelligence...
                </>
              ) : (
                'Run Risk Simulation'
              )}
            </button>
          </form>

          {/* Results Output Column */}
          <div className="lg:col-span-6 bg-slate-800/40 rounded-xl p-5 border border-slate-700/60 flex flex-col justify-between">
            {prediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <div className="text-xs text-slate-400">Assessed Model</div>
                    <div className="text-sm font-semibold text-slate-200">{prediction.model_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Confidence</div>
                    <div className="text-sm font-bold text-teal-400">{prediction.confidence_score}%</div>
                  </div>
                </div>

                {/* Score badge */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  prediction.risk_level === 'High' 
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    : prediction.risk_level === 'Medium'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                }`}>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide">30-Day Readmission Risk</div>
                    <div className="text-3xl font-extrabold">{prediction.risk_score} / 100</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      prediction.risk_level === 'High' ? 'bg-rose-500 text-white' :
                      prediction.risk_level === 'Medium' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {prediction.risk_level} Risk
                    </span>
                    <div className="text-xs mt-1 text-slate-300">
                      Probability: {(prediction.readmission_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Key Contributing Factors */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Risk Factors</h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {prediction.risk_factors.map((rf, idx) => (
                      <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold text-slate-200">{rf.factor}</div>
                          <div className="text-slate-400">{rf.description}</div>
                        </div>
                        <span className="text-rose-400 font-bold text-xs bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                          +{rf.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Recommendations */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Actionable Recommendations</h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {prediction.clinical_recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-teal-300">{rec.category}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                            {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-slate-300">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl">
                  📊
                </div>
                <h4 className="text-slate-200 font-medium">Ready for Simulation</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Adjust patient clinical parameters on the left and click "Run Risk Simulation" to generate ML risk scores and evidence-based recommendations.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
