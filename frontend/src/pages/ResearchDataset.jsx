import { useEffect, useState } from "react";
import api from "../api/api";
import {
  Database,
  BrainCircuit,
  Activity,
  Users,
  Stethoscope,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  Target,
  CheckCircle2,
  Layers3,
  BarChart3
} from "lucide-react";

export default function ResearchDataset() {
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/research/summary")
      .then(res => setSummary(res.data))
      .catch(() => {});
  }, []);

  const features = [
    ["encounter_id", "Identifier", "Reference"],
    ["patient_nbr", "Identifier", "Reference"],
    ["race", "Demographic", "Categorical"],
    ["gender", "Demographic", "Categorical"],
    ["age", "Demographic", "Categorical"],
    ["weight", "Demographic", "Clinical"],
    ["admission_type_id", "Admission", "Categorical"],
    ["discharge_disposition_id", "Admission", "Categorical"],
    ["admission_source_id", "Admission", "Categorical"],
    ["time_in_hospital", "Clinical", "Numeric"],
    ["num_lab_procedures", "Clinical", "Numeric"],
    ["num_procedures", "Clinical", "Numeric"],
    ["num_medications", "Clinical", "Numeric"],
    ["number_outpatient", "Clinical", "Numeric"],
    ["number_emergency", "Clinical", "Numeric"],
    ["number_inpatient", "Clinical", "Numeric"],
    ["number_diagnoses", "Clinical", "Numeric"],
    ["max_glu_serum", "Laboratory", "Categorical"],
    ["A1Cresult", "Laboratory", "Categorical"],
    ["insulin", "Medication", "Categorical"],
    ["change", "Medication", "Categorical"],
    ["diabetesMed", "Medication", "Categorical"],
    ["readmitted", "Target", "Prediction Target"]
  ];

  const filteredFeatures = features.filter(item =>
    item[0].toLowerCase().includes(search.toLowerCase()) ||
    item[1].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-6 text-[#0B1F33]">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#C8755B]">
            <Database size={17} />
            Researcher Workspace
          </div>

          <h1 className="text-2xl font-semibold">Dataset Profile</h1>

          <p className="mt-1 text-sm text-slate-500">
            Structured overview of the dataset powering HealthForecast AI.
          </p>
        </div>

        <div className="rounded-xl border border-[#C8755B]/20 bg-[#F1E1DB] px-4 py-2 text-sm font-medium text-[#9F513D]">
          Research Safe
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl bg-[#0B1F33] text-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-[#C8755B] p-3">
                <FileSpreadsheet size={24} />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Diabetes 130-US Hospitals
                </h2>

                <p className="text-sm text-slate-400">
                  Clinical dataset for readmission-risk research
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Historical hospital encounters containing demographic,
              admission, clinical, medication and readmission information.
            </p>
          </div>

          <div className="hidden text-right md:block">
            <div className="text-4xl font-semibold">101,766</div>
            <div className="text-sm text-slate-400">
              Patient encounters
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Database size={20} />}
          label="Total Records"
          value="101,766"
          text="Hospital encounters"
        />

        <StatCard
          icon={<Layers3 size={20} />}
          label="Features"
          value="50"
          text="Dataset variables"
        />

        <StatCard
          icon={<Target size={20} />}
          label="Prediction Target"
          value="Readmission"
          text="Clinical outcome"
        />

        <StatCard
          icon={<BrainCircuit size={20} />}
          label="ML Application"
          value="Risk Prediction"
          text="Readmission analysis"
        />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Dataset Structure</h2>
          <p className="text-sm text-slate-500">
            Major information groups represented in the dataset.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoBlock
            icon={<Users size={22} />}
            title="Demographics"
            text="Patient characteristics and demographic information."
            items={["age", "gender", "race", "weight"]}
          />

          <InfoBlock
            icon={<Stethoscope size={22} />}
            title="Clinical Data"
            text="Hospital stay, diagnoses, procedures and laboratory activity."
            items={[
              "time_in_hospital",
              "num_lab_procedures",
              "num_procedures",
              "number_diagnoses"
            ]}
          />

          <InfoBlock
            icon={<Activity size={22} />}
            title="Readmission"
            text="Historical readmission outcome used as the prediction target."
            items={[
              "readmitted",
              "number_inpatient",
              "number_emergency",
              "number_outpatient"
            ]}
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-[#F1E1DB] p-2.5 text-[#C8755B]">
              <BrainCircuit size={21} />
            </div>

            <div>
              <h2 className="font-semibold">Dataset → ML Pipeline</h2>
              <p className="text-xs text-slate-500">
                How the dataset supports prediction
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Pipeline number="01" title="Raw Hospital Data" text="Historical patient encounters" />
            <Pipeline number="02" title="Data Preparation" text="Cleaning and feature preparation" />
            <Pipeline number="03" title="Feature Input" text="Clinical and admission variables" />
            <Pipeline number="04" title="ML Model" text="Logistic Regression" />
            <Pipeline number="05" title="Prediction" text="Readmission risk score" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-[#E4EEE7] p-2.5 text-[#52705F]">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <h2 className="font-semibold">Dataset Characteristics</h2>
              <p className="text-xs text-slate-500">
                Key properties used in the research workflow
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Quality label="Records" value="101,766" />
            <Quality label="Features" value="50" />
            <Quality label="Target" value="Readmission" />
            <Quality label="Domain" value="Healthcare" />
            <Quality label="Data Type" value="Clinical" />
            <Quality label="ML Ready" value="Yes" />
          </div>

          <div className="mt-5 rounded-xl bg-[#F5F7F9] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={17} className="text-[#52705F]" />
              Research Privacy
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Researcher views show aggregate dataset information and do not
              display patient names or individual identifiers.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Feature Explorer</h2>
              <p className="text-sm text-slate-500">
                Important variables used by the research and ML workflow.
              </p>
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-slate-400"
              />

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search features..."
                className="w-52 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C8755B]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFB] text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Feature</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Type</th>
              </tr>
            </thead>

            <tbody>
              {filteredFeatures.map(feature => (
                <tr
                  key={feature[0]}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-medium">
                    {feature[0]}
                  </td>

                  <td className="px-5 py-3 text-slate-600">
                    {feature[1]}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        feature[1] === "Target"
                          ? "bg-[#F1E1DB] text-[#9F513D]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {feature[2]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-[#C8755B]/15 bg-[#F1E1DB]/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-[#C8755B]" />

          <div>
            <p className="text-sm font-medium">
              Dataset ready for research analysis
            </p>

            <p className="text-xs text-slate-500">
              Aggregate information only • No patient identifiers displayed
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-[#52705F]">
          RESEARCH MODE
        </span>
      </div>
    </div>
  );
}


function StatCard({ icon, label, value, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1E1DB] text-[#C8755B]">
        {icon}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <h3 className="mt-1 text-xl font-semibold text-[#0B1F33]">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-500">{text}</p>
    </div>
  );
}


function InfoBlock({ icon, title, text, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-[#F1E1DB] p-2 text-[#C8755B]">
          {icon}
        </div>

        <h3 className="font-semibold">{title}</h3>
      </div>

      <p className="mb-3 text-xs leading-5 text-slate-500">
        {text}
      </p>

      <div className="space-y-1.5">
        {items.map(item => (
          <div
            key={item}
            className="rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-600"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}


function Pipeline({ number, title, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#FAFBFC] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F33] text-xs font-semibold text-white">
        {number}
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}


function Quality({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F8FAFB] p-3">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-[#0B1F33]">
        {value}
      </p>
    </div>
  );
} 