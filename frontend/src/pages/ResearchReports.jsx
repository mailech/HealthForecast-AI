import { useState } from 'react'
import { FileSpreadsheet, Download, FileText, CheckCircle2, Sparkles, Eye, X, Filter, Plus, BookOpen } from 'lucide-react'
import api from '../services/api'

export default function ResearchReports() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showGeneratorModal, setShowGeneratorModal] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const reports = [
    {
      id: 1,
      title: '30-Day Readmission Risk Predictors in Heart Failure',
      date: 'Sep 12, 2026',
      author: 'Dr. Sarah Jenkins',
      status: 'Published',
      type: 'Clinical Study',
      abstract: 'Multivariate logistic regression & Random Forest model analysis of 1,240 Heart Failure patients. Elevated BNP, sodium restriction adherence, and 72-hour follow-up compliance were identified as primary predictors of 30-day readmission.',
      metrics: { roc_auc: '0.942', sample_size: '1,240 Patients', f1_score: '0.91' }
    },
    {
      id: 2,
      title: 'Efficacy Analysis of SGLT2 Inhibitors Post-Discharge',
      date: 'Aug 28, 2026',
      author: 'Research Team A',
      status: 'Peer Reviewed',
      type: 'Pharmacotherapy Study',
      abstract: 'Comparative study evaluating post-discharge readmission rates among patients prescribed SGLT2 inhibitors (Dapagliflozin/Empagliflozin) vs standard glycemic therapy. SGLT2 therapy achieved a 51% reduction in heart failure readmissions.',
      metrics: { roc_auc: '0.925', sample_size: '890 Patients', f1_score: '0.89' }
    },
    {
      id: 3,
      title: 'Machine Learning Model Performance & ROC-AUC Benchmark Report',
      date: 'Aug 15, 2026',
      author: 'System AI Engine',
      status: 'Automated',
      type: 'Model Validation',
      abstract: 'Systematic model validation report evaluating Gradient Boosting, Random Forest, and Logistic Regression algorithms trained on the UCI Diabetes dataset. Random Forest achieved optimal ROC-AUC score of 0.971.',
      metrics: { roc_auc: '0.971', sample_size: '10,000 Dataset Samples', f1_score: '0.96' }
    },
    {
      id: 4,
      title: 'Impact of Polypharmacy on Readmission Probability in Elderly Cohorts',
      date: 'Jul 30, 2026',
      author: 'Dr. Emily Davis',
      status: 'Published',
      type: 'Population Health',
      abstract: 'Longitudinal population analysis investigating patients prescribed >10 active medications upon discharge. Findings indicate a 2.4x increased risk of 30-day readmission due to drug-drug interaction & adherence complexity.',
      metrics: { roc_auc: '0.895', sample_size: '2,150 Patients', f1_score: '0.87' }
    },
  ]

  const filteredReports = reports.filter(r => {
    if (activeFilter === 'Peer Reviewed') return r.status === 'Peer Reviewed'
    if (activeFilter === 'Published') return r.status === 'Published'
    if (activeFilter === 'Automated') return r.status === 'Automated'
    return true
  })

  const handleDownloadPDF = async (report) => {
    setDownloadingId(report.id)
    try {
      // Attempt backend PDF download if available, else generate client PDF/text file download
      try {
        const res = await api.get('/predictions/reports/pdf', { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (backendErr) {
        // Client-side fallback PDF/text summary export
        const content = `HEALTHFORECAST AI - RESEARCH REPORT
==================================================
Title: ${report.title}
Date: ${report.date}
Author: ${report.author}
Status: ${report.status}
Study Type: ${report.type}

ABSTRACT & FINDINGS:
${report.abstract}

STATISTICAL EVALUATION:
- ROC-AUC Benchmark: ${report.metrics.roc_auc}
- Cohort Sample Size: ${report.metrics.sample_size}
- F1-Score: ${report.metrics.f1_score}

CONFIDENTIAL HEALTHCARE RESEARCH DOCUMENT
HealthForecast AI Engine v1.0
`
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_Research_Report.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      setToastMessage(`Downloaded report: "${report.title}"`)
      setTimeout(() => setToastMessage(''), 4000)
    } catch (err) {
      console.error('Download report failed:', err)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 transition-all animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Researcher Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Research Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Automated population study papers, statistical reports & evidence summaries</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Generate Custom Report
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
        {['All', 'Published', 'Peer Reviewed', 'Automated'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === f
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'All' ? 'All Reports' : f}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((r) => (
          <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  r.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  r.status === 'Peer Reviewed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {r.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base leading-snug">{r.title}</h3>
              <p className="text-xs text-gray-400 font-medium">{r.date} • {r.author}</p>
              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {r.abstract}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-semibold text-purple-700">ROC-AUC: {r.metrics.roc_auc}</span>
                <span>{r.metrics.sample_size}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedReport(r)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-gray-500" /> Preview
                </button>

                <button
                  onClick={() => handleDownloadPDF(r)}
                  disabled={downloadingId === r.id}
                  className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloadingId === r.id ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Research Paper Summary</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedReport.title}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Author: <strong>{selectedReport.author}</strong> • Published: {selectedReport.date} • Type: <strong>{selectedReport.type}</strong>
                </p>
              </div>

              <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-100 space-y-2">
                <h4 className="text-xs font-bold text-purple-900 uppercase">Abstract & Research Findings</h4>
                <p className="text-xs text-purple-950 leading-relaxed">{selectedReport.abstract}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">ROC-AUC Score</p>
                  <p className="text-lg font-extrabold text-purple-700 mt-0.5">{selectedReport.metrics.roc_auc}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Cohort Size</p>
                  <p className="text-lg font-extrabold text-gray-900 mt-0.5">{selectedReport.metrics.sample_size}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">F1-Score</p>
                  <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{selectedReport.metrics.f1_score}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const r = selectedReport
                  setSelectedReport(null)
                  handleDownloadPDF(r)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Report File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Generate Custom Clinical Study</h3>
              </div>
              <button onClick={() => setShowGeneratorModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowGeneratorModal(false)
                setToastMessage('Custom research report generated & added to dashboard!')
                setTimeout(() => setToastMessage(''), 4000)
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Research Topic Focus</label>
                <select className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="Heart Failure">30-Day Readmission Drivers in Congestive Heart Failure</option>
                  <option value="Diabetes">Glycemic Control & Readmission Risk Correlation</option>
                  <option value="COPD">COPD Exacerbation & Bronchodilator Efficacy</option>
                  <option value="ML Benchmark">Predictive ML Architecture Benchmark & ROC Evaluation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Target Patient Cohort</label>
                <select className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="All">All Active Patients (N=1,240)</option>
                  <option value="HighRisk">High-Risk Stratified Patients (Score &ge; 60)</option>
                  <option value="Elderly">Geriatric Cohort (Age &ge; 65)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Generate Report Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
