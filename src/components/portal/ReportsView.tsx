import React, { useState } from 'react';
import { MOCK_REPORTS } from '../../data/mockData';
import { Report } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  Shield,
  FileCheck,
  Plus
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { isAnonymizedView, currentUser, role } = useAuth();
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [reportType, setReportType] = useState<string>(
    role === 'HEALTHCARE_RESEARCHER' ? 'Research Dataset Export (Safe-Harbor CSV)' : 'Patient Risk Summary Report'
  );
  const [department, setDepartment] = useState<string>(
    role === 'DOCTOR' ? (currentUser.department || 'Endocrinology') : 'All Departments'
  );
  const [format, setFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [dateRange, setDateRange] = useState<string>('September 2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Template options with role permission checks according to Page 6 Access Matrix:
  // Population Health Reports: Doctor No, Admin Yes, Researcher Yes, SysAdmin Yes
  // Research Dataset Export: Doctor No, Admin No, Researcher Yes, SysAdmin Yes
  const allTemplates = [
    {
      id: 'Patient Risk Summary Report',
      name: role === 'HEALTHCARE_RESEARCHER' ? 'Aggregated Risk Summary Report' : 'Patient Risk Summary Report',
      allowedRoles: ['DOCTOR', 'HOSPITAL_ADMIN', 'HEALTHCARE_RESEARCHER', 'SYSTEM_ADMIN'],
      desc: 'Risk score distribution, primary risk factors, and intervention targets.'
    },
    {
      id: 'Readmission Forecast Report',
      name: role === 'HEALTHCARE_RESEARCHER' ? 'Aggregated Readmission Forecast' : 'Readmission Forecast Report',
      allowedRoles: ['DOCTOR', 'HOSPITAL_ADMIN', 'HEALTHCARE_RESEARCHER', 'SYSTEM_ADMIN'],
      desc: '30-day readmission hazard curves and trajectory modeling.'
    },
    {
      id: 'Treatment Effectiveness Report',
      name: 'Treatment Effectiveness Report',
      allowedRoles: ['DOCTOR', 'HOSPITAL_ADMIN', 'HEALTHCARE_RESEARCHER', 'SYSTEM_ADMIN'],
      desc: 'Comparative efficacy of treatment regimens and patient recovery scores.'
    },
    {
      id: 'Population Health Report',
      name: 'Population Health Report',
      allowedRoles: ['HOSPITAL_ADMIN', 'HEALTHCARE_RESEARCHER', 'SYSTEM_ADMIN'],
      restrictedRoles: ['DOCTOR'],
      desc: 'Macro health trends, chronic disease prevalence, and cohort risk stratification.'
    },
    {
      id: 'Hospital Performance Report',
      name: 'Hospital Performance Report',
      allowedRoles: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN'],
      restrictedRoles: ['DOCTOR', 'HEALTHCARE_RESEARCHER'],
      desc: 'Department benchmarks, ALOS metrics, and CMS HRRP penalty exposure.'
    },
    {
      id: 'Department Comparison Report',
      name: 'Department Comparison Report',
      allowedRoles: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN'],
      restrictedRoles: ['DOCTOR', 'HEALTHCARE_RESEARCHER'],
      desc: 'Cross-specialty clinical quality and readmission rate benchmarking.'
    },
    {
      id: 'High-Risk Patient Action List',
      name: 'High-Risk Patient Action List',
      allowedRoles: ['DOCTOR', 'SYSTEM_ADMIN'],
      restrictedRoles: ['HOSPITAL_ADMIN', 'HEALTHCARE_RESEARCHER'],
      desc: 'Prioritized daily rounding checklist for patients with risk score ≥ 70.'
    },
    {
      id: 'Research Dataset Export (Safe-Harbor CSV)',
      name: 'Research Dataset Export (Safe-Harbor CSV/JSON)',
      allowedRoles: ['HEALTHCARE_RESEARCHER', 'SYSTEM_ADMIN'],
      restrictedRoles: ['DOCTOR', 'HOSPITAL_ADMIN'],
      desc: '47-feature de-identified clinical extraction for statistical modeling.'
    }
  ];

  const isCurrentTemplateAllowed = () => {
    const t = allTemplates.find(tpl => tpl.id === reportType);
    return t ? t.allowedRoles.includes(role) : true;
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentTemplateAllowed()) {
      setDownloadSuccessToast('Access Denied: Your current role does not have permission to generate this report type under the RBAC policy.');
      setTimeout(() => setDownloadSuccessToast(null), 4000);
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const isResearchExport = reportType.includes('Research Dataset');
      const newReport: Report = {
        id: `RPT-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: isResearchExport ? 'Diabetes_130US_Research_Cohort_SafeHarbor.csv' : `${reportType} (${department})`,
        type: reportType,
        generatedDate: new Date().toISOString().split('T')[0],
        generatedBy: currentUser.name,
        department,
        format: isResearchExport ? 'CSV' : format,
        fileSize: format === 'PDF' ? '2.8 MB' : '1.4 MB',
        status: 'Completed',
        downloadUrl: '#'
      };
      setReports([newReport, ...reports]);
      setIsGenerating(false);
      setDownloadSuccessToast(`Report "${newReport.title}" generated successfully.`);
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    }, 1200);
  };

  const handleDownload = (rpt: Report) => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (rpt.type.includes('Research Dataset') || rpt.format === 'CSV') {
      // Generate realistic Diabetes 130-US Hospitals de-identified data extract
      content = [
        'encounter_id,patient_nbr_anon,age,gender,admission_type,time_in_hospital,num_lab_procedures,num_procedures,num_medications,number_outpatient,number_emergency,number_inpatient,number_diagnoses,max_glu_serum,A1Cresult,metformin,insulin,change,diabetesMed,readmitted_30d',
        'ENC-849102,PT-ANON-8491,[70-80),Female,Emergency,6,54,1,18,0,1,2,9,None,>8,Up,Steady,Ch,Yes,1',
        'ENC-849103,PT-ANON-8492,[60-70),Male,Urgent,4,42,0,14,1,0,0,7,None,Norm,Steady,No,No,Yes,0',
        'ENC-849104,PT-ANON-8493,[70-80),Male,Emergency,8,68,2,24,0,2,3,9,>200,>8,No,Up,Ch,Yes,1',
        'ENC-849105,PT-ANON-8494,[50-60),Female,Elective,3,31,0,9,0,0,0,5,None,None,Steady,No,No,Yes,0',
        'ENC-849106,PT-ANON-8495,[80-90),Female,Emergency,9,72,1,26,2,1,2,9,None,>7,No,Down,Ch,Yes,1',
        'ENC-849107,PT-ANON-8496,[60-70),Male,Urgent,5,49,1,16,0,0,1,8,None,>8,Up,Steady,Ch,Yes,1'
      ].join('\n');
      filename = `${rpt.title.replace(/\s+/g, '_')}_${rpt.generatedDate}.csv`;
      mimeType = 'text/csv';
    } else {
      content = `HealthForecast AI - Clinical Intelligence Dossier\n==================================================\nTitle: ${rpt.title}\nReport Type: ${rpt.type}\nGenerated Date: ${rpt.generatedDate}\nGenerated By: ${rpt.generatedBy} (${role})\nScope: ${rpt.department}\nCompliance: HIPAA Safe-Harbor Verified\nCMS HRRP Assessment: Passed\nModel Engine: XGBoost v2.4 (ROC-AUC 0.842)\n==================================================\nConfidential Quality Assurance Document.`;
      filename = `${rpt.title.replace(/\s+/g, '_')}_${rpt.generatedDate}.${rpt.format.toLowerCase() === 'excel' ? 'csv' : 'txt'}`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccessToast(`Downloaded ${rpt.title}`);
    setTimeout(() => setDownloadSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reports & Regulatory Export Engine
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              CMS Compliance Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal hospital readmission dossiers, risk stratification exports, and research extracts.
          </p>
        </div>
      </div>

      <DisclaimerBanner type={isAnonymizedView() ? 'research' : 'demo'} />

      {downloadSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Report Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Configure New Clinical Dossier
          </h3>
          <p className="text-xs text-slate-500">
            Specify report parameters, target departments, and export format
          </p>
        </div>

        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Report Template *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-hidden"
            >
              {allTemplates.map((tpl) => {
                const isAllowed = tpl.allowedRoles.includes(role);
                return (
                  <option
                    key={tpl.id}
                    value={tpl.id}
                    disabled={!isAllowed}
                  >
                    {tpl.name} {!isAllowed ? `(Restricted for ${role.replace('_', ' ')})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="All Departments">All Departments (Institutional)</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Geriatrics">Geriatrics</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Date Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="September 2026">Current Month (September 2026)</option>
              <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
              <option value="Year-to-Date 2026">Year-to-Date 2026</option>
              <option value="Past 12 Months">Past 12 Months Rolling</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Export Format</label>
            <div className="flex items-center gap-1.5 pt-0.5">
              {(['PDF', 'Excel', 'CSV'] as const).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    format === fmt
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              * Output complies with HIPAA Safe-Harbor guidelines for medical exports.
            </span>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-xl font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isGenerating ? 'Compiling Report...' : 'Generate Clinical Dossier'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Reports History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Generated Reports Repository
          </h3>
          <span className="text-xs text-slate-500">{reports.length} archived reports</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Report Title</th>
                <th className="p-3">Department</th>
                <th className="p-3">Generated Date</th>
                <th className="p-3">Author</th>
                <th className="p-3">Format & Size</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((rpt) => (
                <tr key={rpt.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{rpt.title}</span>
                  </td>
                  <td className="p-3 text-slate-600">{rpt.department}</td>
                  <td className="p-3 text-slate-600">{rpt.generatedDate}</td>
                  <td className="p-3 text-slate-700 font-medium">{rpt.generatedBy}</td>
                  <td className="p-3">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                      {rpt.format} • {rpt.fileSize}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      <CheckCircle className="w-3 h-3" /> {rpt.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDownload(rpt)}
                      className="px-3 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
