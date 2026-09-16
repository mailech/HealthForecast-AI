import { useState } from 'react'
import { Sparkles, CheckCircle2, ShieldAlert, Heart, Activity, ArrowRight, X, UserCheck, Plus } from 'lucide-react'

export default function CareRecommendations() {
  const [patientTier, setPatientTier] = useState('High Risk')
  const [appliedProtocols, setAppliedProtocols] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState('Patient PAT001 (Robert Chen)')
  const [toastMessage, setToastMessage] = useState('')

  const allRecommendations = {
    'High Risk': [
      {
        id: 'rec-1',
        category: 'Medication Reconciliation',
        title: 'Optimize ARNI & SGLT2 Dual Therapy',
        description: 'Patient exhibits elevated BNP levels. Switch from oral ACE inhibitor to Sacubitril/Valsartan 49/51mg BID.',
        priority: 'Urgent',
        evidence: 'Level A - ACC/AHA Guidelines 2026',
      },
      {
        id: 'rec-2',
        category: 'Post-Discharge Monitoring',
        title: 'Schedule Tele-Health Follow-up within 72 Hours',
        description: 'Automated remote weight monitoring alert if body weight increases by >2kg over 48 hours.',
        priority: 'Urgent',
        evidence: 'Hospital Readmission Prevention Protocol',
      },
      {
        id: 'rec-3',
        category: 'Dietary & Lifestyle',
        title: 'Sodium Restricted Diet (<2,000mg/day)',
        description: 'Provide personalized meal planner & assign dedicated clinical nutritionist follow-up.',
        priority: 'High',
        evidence: 'Clinical Consensus Standard',
      },
      {
        id: 'rec-4',
        category: 'Diagnostic Testing',
        title: 'Repeat Serum Potassium & Creatinine at Day 7',
        description: 'Ensure renal safety parameters remain within acceptable margins post medication adjustment.',
        priority: 'High',
        evidence: 'FDA Safety Guideline',
      },
    ],
    'Moderate Risk': [
      {
        id: 'rec-5',
        category: 'Outpatient Follow-up',
        title: 'Bi-Weekly Clinic Visit',
        description: 'Routine blood pressure monitoring and symptom evaluation within 14 days.',
        priority: 'Medium',
        evidence: 'Standard Clinical Guideline',
      },
      {
        id: 'rec-6',
        category: 'Medication Management',
        title: 'Diuretic Dosage Adjustment',
        description: 'Adjust Furosemide dosage based on daily weight log evaluation.',
        priority: 'Medium',
        evidence: 'Heart Failure Care Plan',
      },
    ],
    'Low Risk': [
      {
        id: 'rec-7',
        category: 'Patient Education',
        title: 'Self-Management Care Package',
        description: 'Provide digital booklet on dietary guidelines and symptom tracking mobile app.',
        priority: 'Low',
        evidence: 'Preventive Health Standard',
      },
    ],
  }

  const recommendations = allRecommendations[patientTier] || []

  const handleApplyClick = (rec) => {
    setActiveModal(rec)
  }

  const confirmApplyProtocol = () => {
    if (!activeModal) return
    setAppliedProtocols(prev => ({ ...prev, [activeModal.id]: true }))
    setToastMessage(`Protocol "${activeModal.title}" applied to ${selectedPatient}!`)
    setActiveModal(null)
    setTimeout(() => setToastMessage(''), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 transition-all animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">AI Clinical Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Personalized Care Recommendations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Machine Learning generated protocol optimization for high-risk readmission patients</p>
        </div>

        <div className="flex items-center space-x-2">
          {['High Risk', 'Moderate Risk', 'Low Risk'].map(t => (
            <button
              key={t}
              onClick={() => setPatientTier(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                patientTier === t
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t} ({allRecommendations[t]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => {
          const isApplied = appliedProtocols[rec.id]
          return (
            <div key={rec.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                  {rec.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  rec.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{rec.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                <span>{rec.evidence}</span>
                {isApplied ? (
                  <span className="flex items-center font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Protocol Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyClick(rec)}
                    className="flex items-center font-bold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Apply Protocol <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal for applying protocol */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Apply Care Protocol</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-gray-400">Protocol Details</p>
              <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                <p className="font-bold text-gray-900 text-base">{activeModal.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{activeModal.description}</p>
                <span className="inline-block text-[11px] font-semibold text-primary-600 mt-2">
                  Evidence: {activeModal.evidence}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Assign to Patient</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="Patient PAT001 (Robert Chen)">Patient PAT001 - Robert Chen (High Risk)</option>
                <option value="Patient PAT002 (Maria Garcia)">Patient PAT002 - Maria Garcia (High Risk)</option>
                <option value="Patient PAT003 (James Wilson)">Patient PAT003 - James Wilson (Medium Risk)</option>
                <option value="Patient PAT004 (Eleanor Vance)">Patient PAT004 - Eleanor Vance (High Risk)</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApplyProtocol}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> Confirm & Apply Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
