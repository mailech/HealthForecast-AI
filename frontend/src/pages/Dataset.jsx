import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Database, Download, Upload, CheckCircle2,
  AlertTriangle, FileText, Info, RefreshCw, Lock
} from 'lucide-react'

const datasets = [
  {
    id: 'diabetes-130',
    name: 'Diabetes 130-US Hospitals',
    description: 'Clinical care data for diabetic patients across 130 US hospitals from 1999–2008. Contains 101,766 patient records with 50 features including demographics, diagnoses, medications and readmission outcomes.',
    records: '101,766',
    features: '50',
    year: '1999–2008',
    source: 'UCI Machine Learning Repository',
    tags: ['Diabetes', 'Readmission', 'Clinical'],
    color: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'readmission-risk',
    name: 'Readmission Risk Factors',
    description: 'Curated dataset of readmission risk factors derived from hospital EHR systems. Includes comorbidities, medication adherence and discharge planning indicators.',
    records: '45,230',
    features: '32',
    year: '2015–2023',
    source: 'Internal — HealthForecast AI',
    tags: ['Risk Scoring', 'EHR', 'Readmission'],
    color: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
  {
    id: 'patient-outcomes',
    name: 'Patient Outcomes Dataset',
    description: 'Longitudinal patient outcomes data tracking post-discharge recovery, readmissions and mortality across multiple hospital departments.',
    records: '28,450',
    features: '28',
    year: '2018–2023',
    source: 'Internal — HealthForecast AI',
    tags: ['Outcomes', 'Longitudinal', 'Mortality'],
    color: 'border-purple-200 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
]

const Dataset = () => {
  const { user } = useAuth()
  const isAdmin = user?.role?.name === 'System Administrator'
  const [integrating, setIntegrating] = useState(false)
  const [result, setResult] = useState(null) // { success, message }
  const [showUpload, setShowUpload] = useState(false)
  const [datasetPath, setDatasetPath] = useState('')

  const handleIntegrate = async () => {
    setIntegrating(true)
    setResult(null)
    try {
      const params = datasetPath ? `?dataset_path=${encodeURIComponent(datasetPath)}` : ''
      await api.post(`/dataset/integrate${params}`)
      setResult({ success: true, message: 'Dataset integrated successfully! Patient records are now available.' })
      setShowUpload(false)
      setDatasetPath('')
    } catch (err) {
      const detail = err.response?.data?.detail || 'Integration failed. Please check the file path and try again.'
      setResult({ success: false, message: detail })
    } finally {
      setIntegrating(false)
    }
  }

  const exportSample = (name) => {
    const headers = ['patient_id', 'age', 'gender', 'diagnosis', 'readmitted', 'length_of_stay']
    const rows = Array.from({ length: 5 }, (_, i) => [
      `P${1000 + i}`, `[${50 + i * 5}-${55 + i * 5})`, i % 2 === 0 ? 'Male' : 'Female',
      '250.01', i % 3 === 0 ? 'YES' : 'NO', Math.floor(Math.random() * 10) + 1
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/\s+/g, '_').toLowerCase()}_sample.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 uppercase tracking-wide">Data Management</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-500 text-sm mt-1">Available datasets for analysis and integration.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowUpload(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" /> Integrate Dataset
          </button>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div className={`flex items-start space-x-3 p-4 rounded-xl border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {result.success
            ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.message}</p>
          </div>
          <button onClick={() => setResult(null)} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          All datasets are anonymised and comply with HIPAA data privacy standards.
          {!isAdmin && ' Contact a System Administrator to integrate new datasets.'}
        </p>
      </div>

      {/* Dataset cards */}
      <div className="space-y-4">
        {datasets.map((ds) => (
          <div key={ds.id} className={`border-2 rounded-xl p-6 ${ds.color}`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <Database className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <h3 className="text-lg font-bold text-gray-900">{ds.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{ds.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {ds.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 text-xs font-medium rounded-full ${ds.badge}`}>{tag}</span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Records', value: ds.records },
                    { label: 'Features', value: ds.features },
                    { label: 'Period', value: ds.year },
                    { label: 'Source', value: ds.source },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/70 rounded-lg p-2.5">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 flex-shrink-0">
                <button onClick={() => exportSample(ds.name)}
                  className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <Download className="w-4 h-4 mr-2 text-gray-500" /> Sample CSV
                </button>
                <button
                  onClick={() => { if (isAdmin) { setShowUpload(true) } }}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                    isAdmin
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!isAdmin ? 'Admin access required' : 'Integrate this dataset'}
                >
                  {isAdmin
                    ? <><Upload className="w-4 h-4 mr-2" /> Integrate</>
                    : <><Lock className="w-4 h-4 mr-2" /> Admin Only</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schema reference */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-600" /> Integration Schema Reference
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['Field', 'Type', 'Description', 'Required'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['patient_id', 'String', 'Unique patient identifier', 'Yes'],
                ['age', 'String', 'Age range bracket e.g. [50-60)', 'Yes'],
                ['gender', 'String', 'Male / Female / Unknown/Invalid', 'Yes'],
                ['diagnosis_1', 'String', 'ICD-9 primary diagnosis code', 'Yes'],
                ['readmitted', 'String', '<30 / >30 / NO', 'Yes'],
                ['time_in_hospital', 'Integer', 'Number of days in hospital', 'No'],
                ['num_medications', 'Integer', 'Number of distinct medications', 'No'],
                ['num_procedures', 'Integer', 'Number of procedures performed', 'No'],
              ].map(([field, type, desc, req]) => (
                <tr key={field} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-primary-700 text-xs">{field}</td>
                  <td className="px-4 py-2.5 text-gray-600">{type}</td>
                  <td className="px-4 py-2.5 text-gray-600">{desc}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${req === 'Yes' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{req}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrate modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-600" /> Integrate Dataset
              </h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Optionally provide the path to a custom CSV file. Leave blank to use the built-in Diabetes 130-US dataset.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dataset File Path <span className="text-gray-400">(optional)</span></label>
              <input type="text" value={datasetPath} onChange={e => setDatasetPath(e.target.value)}
                placeholder="e.g. C:\data\diabetic_data.csv"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleIntegrate} disabled={integrating}
                className="flex items-center px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                <RefreshCw className={`w-4 h-4 mr-2 ${integrating ? 'animate-spin' : ''}`} />
                {integrating ? 'Integrating…' : 'Run Integration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dataset
