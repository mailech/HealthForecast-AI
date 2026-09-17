import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Filter,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  Activity,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/api";

export default function ResearchCohort() {
  const [patients, setPatients] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const [filters, setFilters] = useState({
    disease: "All",
    risk: "All",
    gender: "All",
    age: "All",
  });

  const loadPatients = async () => {
    try {
      setRefreshing(true);
      setMessage("");

      const res = await api.get(
        `/patients/research/cohort?_=${Date.now()}`
      );

      const data = Array.isArray(res.data) ? res.data : [];
      setPatients(data);

      console.log("Research cohort records:", data);
    } catch (error) {
      console.error("Cohort error:", error);
      setMessage(
        error.response?.data?.detail ||
          "Unable to load research cohort data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPatients();

    const saved = localStorage.getItem("research_cohorts");

    if (saved) {
      try {
        setCohorts(JSON.parse(saved));
      } catch {
        setCohorts([]);
      }
    }
  }, []);

  const diseases = useMemo(() => {
    const list = patients
      .map(p => String(p.disease || "").trim())
      .filter(Boolean);

    return ["All", ...new Set(list)];
  }, [patients]);

  const filtered = useMemo(() => {
    return patients.filter(patient => {
      const age = Number(patient.age || 0);

      const disease = String(patient.disease || "")
        .trim()
        .toLowerCase();

      const risk = String(patient.risk || "")
        .trim()
        .toLowerCase();

      const gender = String(patient.gender || "")
        .trim()
        .toLowerCase();

      const selectedDisease = filters.disease.toLowerCase();
      const selectedRisk = filters.risk.toLowerCase();
      const selectedGender = filters.gender.toLowerCase();

      const ageMatch =
        filters.age === "All" ||
        (filters.age === "Under 30" && age < 30) ||
        (filters.age === "30-50" && age >= 30 && age <= 50) ||
        (filters.age === "51-65" && age >= 51 && age <= 65) ||
        (filters.age === "65+" && age > 65);

      return (
        (selectedDisease === "all" || disease === selectedDisease) &&
        (selectedRisk === "all" || risk === selectedRisk) &&
        (selectedGender === "all" || gender === selectedGender) &&
        ageMatch
      );
    });
  }, [patients, filters]);

  const high = filtered.filter(
    p => String(p.risk).toLowerCase() === "high"
  ).length;

  const medium = filtered.filter(
    p => String(p.risk).toLowerCase() === "medium"
  ).length;

  const low = filtered.filter(
    p => String(p.risk).toLowerCase() === "low"
  ).length;

  const averageAge = filtered.length
    ? Math.round(
        filtered.reduce(
          (sum, p) => sum + Number(p.age || 0),
          0
        ) / filtered.length
      )
    : 0;

  const riskData = [
    { name: "High", value: high },
    { name: "Medium", value: medium },
    { name: "Low", value: low },
  ];

  const changeFilter = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  const resetFilters = () => {
    setFilters({
      disease: "All",
      risk: "All",
      gender: "All",
      age: "All",
    });

    setMessage("");
  };

  const createCohort = () => {
    if (!filtered.length) {
      setMessage("No records match the selected criteria.");
      return;
    }

    const parts = [];

    if (filters.disease !== "All") {
      parts.push(filters.disease);
    }

    if (filters.risk !== "All") {
      parts.push(`${filters.risk} Risk`);
    }

    if (filters.gender !== "All") {
      parts.push(filters.gender);
    }

    if (filters.age !== "All") {
      parts.push(filters.age);
    }

    const name = parts.length
      ? `${parts.join(" ")} Cohort`
      : "All Patient Research Cohort";

    const cohort = {
      id: Date.now(),
      name,
      filters: { ...filters },
      records: filtered.length,
      high,
      medium,
      low,
      averageAge,
      createdAt: new Date().toLocaleString(),
    };

    const updated = [cohort, ...cohorts];

    setCohorts(updated);
    localStorage.setItem(
      "research_cohorts",
      JSON.stringify(updated)
    );

    setMessage(
      `"${name}" created successfully with ${filtered.length} records.`
    );
  };

  const deleteCohort = id => {
    const updated = cohorts.filter(cohort => cohort.id !== id);

    setCohorts(updated);

    localStorage.setItem(
      "research_cohorts",
      JSON.stringify(updated)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] p-6 text-slate-500">
        Loading cohort analysis...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-5 lg:p-6">

      {/* Header */}

      <div className="mb-5 rounded-2xl bg-[#0B1F33] p-6 text-white">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#E5B7A7]">
              <Users size={16} />
              RESEARCH ANALYSIS
            </div>

            <h1 className="text-2xl font-semibold">
              Cohort Analysis
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Create privacy-safe research groups from aggregate patient data.
            </p>
          </div>

          <button
            onClick={loadPatients}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#C8755B] px-4 py-2.5 text-sm font-medium transition hover:bg-[#B5654C] disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>
      </div>

      {/* Filters */}

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#C8755B]" />

            <div>
              <h2 className="font-semibold text-[#0B1F33]">
                Cohort Filters
              </h2>

              <p className="text-xs text-slate-500">
                Select criteria and create a research cohort.
              </p>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <FilterBox
            label="Disease"
            value={filters.disease}
            options={diseases}
            onChange={e =>
              changeFilter("disease", e.target.value)
            }
          />

          <FilterBox
            label="Risk Level"
            value={filters.risk}
            options={["All", "High", "Medium", "Low"]}
            onChange={e =>
              changeFilter("risk", e.target.value)
            }
          />

          <FilterBox
            label="Gender"
            value={filters.gender}
            options={["All", "Male", "Female"]}
            onChange={e =>
              changeFilter("gender", e.target.value)
            }
          />

          <FilterBox
            label="Age Group"
            value={filters.age}
            options={[
              "All",
              "Under 30",
              "30-50",
              "51-65",
              "65+",
            ]}
            onChange={e =>
              changeFilter("age", e.target.value)
            }
          />

        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-[#DFC6BD] bg-[#F4E9E5] px-4 py-3 text-sm text-[#8E4C3B]">
            {message}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#F5F7F9] p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs text-slate-500">
              Matching records
            </p>

            <p className="mt-1 text-2xl font-bold text-[#0B1F33]">
              {filtered.length}
            </p>
          </div>

          <button
            onClick={createCohort}
            disabled={!filtered.length}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#C8755B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B5654C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={17} />
            Create Cohort
          </button>

        </div>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Stat
          icon={Users}
          title="Cohort Size"
          value={filtered.length}
          text="Matching records"
        />

        <Stat
          icon={Activity}
          title="High Risk"
          value={high}
          text="High-risk patients"
          accent
        />

        <Stat
          icon={BarChart3}
          title="Average Age"
          value={`${averageAge} yrs`}
          text="Cohort average"
        />

        <Stat
          icon={Activity}
          title="High Risk Share"
          value={
            filtered.length
              ? `${Math.round((high / filtered.length) * 100)}%`
              : "0%"
          }
          text="Of selected cohort"
          accent
        />

      </div>

      {/* Chart + Selected Cohort */}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-[#0B1F33]">
                Risk Distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Risk categories within the selected cohort
              </p>
            </div>

            <div className="rounded-xl bg-[#F1E1DB] p-2.5 text-[#C8755B]">
              <BarChart3 size={18} />
            </div>

          </div>

          <div className="h-[280px]">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#C8755B"
                  radius={[7, 7, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Selected cohort */}

        <div className="rounded-2xl bg-[#12395B] p-5 text-white">

          <p className="text-xs uppercase tracking-wider text-[#E5B7A7]">
            Selected Cohort
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Research Group
          </h2>

          <div className="mt-5 space-y-3">

            <Info
              label="Disease"
              value={filters.disease}
            />

            <Info
              label="Risk"
              value={filters.risk}
            />

            <Info
              label="Gender"
              value={filters.gender}
            />

            <Info
              label="Age"
              value={filters.age}
            />

          </div>

          <div className="mt-5 rounded-xl bg-white/10 p-4">

            <p className="text-3xl font-semibold">
              {filtered.length}
            </p>

            <p className="mt-1 text-xs text-slate-300">
              aggregate records match
            </p>

          </div>

        </div>
      </div>

      {/* Created Cohorts */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

        <div className="mb-4">
          <h2 className="font-semibold text-[#0B1F33]">
            Created Research Cohorts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Saved research groups using aggregate data only.
          </p>
        </div>

        {cohorts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-[#F8FAFB] p-8 text-center">

            <Users
              size={28}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-medium text-[#0B1F33]">
              No cohorts created yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Select filters above and click Create Cohort.
            </p>

          </div>
        ) : (
          <div className="space-y-3">

            {cohorts.map(cohort => (

              <div
                key={cohort.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-[#F8FAFB] p-4 md:flex-row md:items-center md:justify-between"
              >

                <div>

                  <h3 className="text-sm font-semibold text-[#0B1F33]">
                    {cohort.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Created {cohort.createdAt}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <Tag text={`${cohort.records} records`} />

                    <Tag text={`High ${cohort.high}`} />

                    <Tag text={`Medium ${cohort.medium}`} />

                    <Tag text={`Low ${cohort.low}`} />

                    <Tag text={`Avg age ${cohort.averageAge}`} />

                  </div>

                </div>

                <button
                  onClick={() => deleteCohort(cohort.id)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* Breakdown */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

        <h2 className="font-semibold text-[#0B1F33]">
          Cohort Breakdown
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Aggregate distribution of the selected group.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">

          <RiskCard
            title="High Risk"
            value={high}
            percentage={
              filtered.length
                ? (high / filtered.length) * 100
                : 0
            }
          />

          <RiskCard
            title="Medium Risk"
            value={medium}
            percentage={
              filtered.length
                ? (medium / filtered.length) * 100
                : 0
            }
          />

          <RiskCard
            title="Low Risk"
            value={low}
            percentage={
              filtered.length
                ? (low / filtered.length) * 100
                : 0
            }
          />

        </div>

      </div>

      {/* Privacy */}

      <div className="mt-5 flex gap-3 rounded-xl border border-[#DFC6BD] bg-[#F4E9E5] p-4">

        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-[#C8755B]"
        />

        <div>

          <p className="text-sm font-semibold text-[#0B1F33]">
            Privacy-Safe Research
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Cohort analysis displays aggregate information only.
            Patient names, IDs and individual identities are never
            exposed in the Researcher workspace.
          </p>

        </div>

      </div>

    </div>
  );
}

function FilterBox({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0B1F33] outline-none focus:border-[#C8755B]"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Stat({ icon: Icon, title, value, text, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0B1F33]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {text}
          </p>
        </div>

        <div
          className={`rounded-xl p-2.5 ${
            accent
              ? "bg-[#F1E1DB] text-[#C8755B]"
              : "bg-[#E8EEF3] text-[#12395B]"
          }`}
        >
          <Icon size={19} />
        </div>

      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">

      <span className="text-xs text-slate-300">
        {label}
      </span>

      <span className="max-w-[140px] truncate text-sm font-medium text-white">
        {value}
      </span>

    </div>
  );
}

function Tag({ text }) {
  return (
    <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600">
      {text}
    </span>
  );
}

function RiskCard({ title, value, percentage }) {
  return (
    <div className="rounded-xl bg-[#F5F7F9] p-4">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-[#0B1F33]">
          {title}
        </p>

        <span className="text-lg font-semibold text-[#C8755B]">
          {value}
        </span>

      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-[#C8755B]"
          style={{
            width: `${Math.min(100, percentage)}%`,
          }}
        />

      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        {percentage.toFixed(1)}% of cohort
      </p>

    </div>
  );
} 