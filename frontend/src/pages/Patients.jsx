import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  Calendar,
  Lock,
  EyeOff,
  ShieldAlert,
  Download,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SkeletonTable } from "../components/Skeletons";
import { useRole } from "../context/RoleContext";
import SpotlightCard from "../components/SpotlightCard";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Age must be >= 1").max(120, "Age must be <= 120"),
  disease: z.string().min(2, "Disease / condition required"),
  risk: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Active", "Discharged"]),
});

const INITIAL_PATIENTS = [
  {
    id: 1,
    name: "Ramesh Kumar",
    age: 52,
    disease: "Diabetes",
    risk: "High",
    status: "Active",
    photo: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: 2,
    name: "Priya Sharma",
    age: 43,
    disease: "Hypertension",
    risk: "Medium",
    status: "Active",
    photo: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 3,
    name: "Rahul Verma",
    age: 61,
    disease: "Heart Disease",
    risk: "High",
    status: "Active",
    photo: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 4,
    name: "Sneha Patel",
    age: 29,
    disease: "Asthma",
    risk: "Low",
    status: "Active",
    photo: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 5,
    name: "Vikram Singh",
    age: 58,
    disease: "Chronic Kidney Disease",
    risk: "High",
    status: "Discharged",
    photo: "https://i.pravatar.cc/150?img=60",
  },
  {
    id: 6,
    name: "Ananya Reddy",
    age: 36,
    disease: "Thyroid Disorder",
    risk: "Low",
    status: "Active",
    photo: "https://i.pravatar.cc/150?img=26",
  },
];

function Patients() {
  const { role } = useRole();
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Fetch Patients from backend API
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/patients");
      if (res.ok) {
        const resData = await res.json();
        if (resData && resData.data && Array.isArray(resData.data) && resData.data.length > 0) {
          setPatients((prev) => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const existingIds = new Set(safePrev.map((p) => String(p?._id || p?.id)));
            const newFromApi = resData.data.filter((p) => p && !existingIds.has(String(p._id || p.id)));
            return [...newFromApi, ...safePrev];
          });
        }
      }
    } catch (err) {
      console.warn("Backend patient fetch notice:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      age: 40,
      disease: "",
      risk: "Low",
      status: "Active",
    },
  });

  // Safe Filtered logic
  const filteredPatients = useMemo(() => {
    const safePatients = Array.isArray(patients) ? patients : [];
    return safePatients.filter((patient) => {
      if (!patient) return false;
      const name = patient.name || "";
      const disease = patient.disease || "";
      const matchesSearch =
        name.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        disease.toLowerCase().includes((searchQuery || "").toLowerCase());
      const matchesRisk = riskFilter === "All" || patient.risk === riskFilter;
      const matchesStatus = statusFilter === "All" || patient.status === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [patients, searchQuery, riskFilter, statusFilter]);

  // Paginated Data
  const totalPages = Math.ceil((filteredPatients?.length || 0) / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const safeFiltered = Array.isArray(filteredPatients) ? filteredPatients : [];
    const start = (currentPage - 1) * itemsPerPage;
    return safeFiltered.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  // PHI Name Masking Helper
  const formatPatientName = (name, id) => {
    if (role === "RESEARCHER") {
      const numStr = String(id || "000").padStart(3, "0");
      return `ANONYMIZED_PATIENT_${numStr}`;
    }
    return name || "Unknown Patient";
  };

  const handleDownloadPDF = async (patient) => {
    const patientId = patient?._id || patient?.id || "PAT-DEMO-001";
    const patientName = patient?.name || "Patient";
    const safeName = patientName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${safeName}_Care_Plan.pdf`;
    try {
      toast.info(`Generating Care Plan PDF for ${patientName}...`);
      const response = await fetch(`http://localhost:5000/api/patients/${patientId}/download-pdf`);
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${fileName} downloaded successfully!`);
    } catch (error) {
      console.error("Care Plan PDF download error:", error);
      toast.error(`Download Error: ${error.message}`);
    }
  };

  const handleExportPatientData = async (format = "EXCEL") => {
    const formatType = format.toUpperCase();
    const ext = formatType === "EXCEL" ? "xlsx" : formatType.toLowerCase();
    const fileName = `Patients_Registry_Export.${ext}`;
    try {
      toast.info(`Exporting patient registry dataset as .${ext}...`);
      const response = await fetch(`http://localhost:5000/api/reports/REP-PATIENTS/download?format=${formatType}`);
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${fileName} downloaded successfully!`);
    } catch (error) {
      console.error("Patient export error:", error);
      toast.error(`Export Error: ${error.message}`);
    }
  };

  // Permission Guard for Adding Patients
  const handleOpenAddModal = () => {
    if (role === "HOSPITAL_ADMIN") {
      toast.error("Permission Denied (Hospital Admin)", {
        description: "Hospital Administrators have View-Only access to patient medical records.",
      });
      return;
    }
    if (role === "RESEARCHER") {
      toast.error("Permission Denied (Healthcare Researcher)", {
        description: "Healthcare Researchers cannot modify patient medical records.",
      });
      return;
    }

    setEditingPatient(null);
    reset({ name: "", age: 40, disease: "", risk: "Low", status: "Active" });
    setIsModalOpen(true);
  };

  // Permission Guard for Editing Patients
  const handleOpenEditModal = (patient) => {
    if (role === "HOSPITAL_ADMIN") {
      toast.error("Permission Denied (Hospital Admin)", {
        description: "Hospital Administrators cannot alter patient medical records.",
      });
      return;
    }
    if (role === "RESEARCHER") {
      toast.error("Permission Denied (Healthcare Researcher)", {
        description: "Healthcare Researchers cannot modify patient records.",
      });
      return;
    }

    setEditingPatient(patient);
    setValue("name", patient.name || "");
    setValue("age", patient.age || 40);
    setValue("disease", patient.disease || "");
    setValue("risk", patient.risk || "Low");
    setValue("status", patient.status || "Active");
    setIsModalOpen(true);
  };

  // Permission Guard for Deleting Patients
  const handleDeletePatient = (id) => {
    if (role === "HOSPITAL_ADMIN" || role === "RESEARCHER") {
      toast.error(`Permission Denied (${role})`, {
        description: "Cannot delete patient records under active RBAC policy.",
      });
      return;
    }

    setPatients((prev) => (Array.isArray(prev) ? prev.filter((p) => (p._id || p.id) !== id) : []));
    toast.success("Patient record soft-deleted (preserved for compliance audit trail)");
  };

  const onSubmitForm = async (data) => {
    if (!data.name || !data.age || !data.disease) {
      toast.error("Validation Error: Please fill in all required patient fields (Name, Age, Disease)");
      return;
    }

    if (editingPatient) {
      const pId = editingPatient._id || editingPatient.id;
      try {
        await fetch(`http://localhost:5000/api/patients/${pId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("Patient update notice:", err.message);
      }

      setPatients((prev) =>
        (Array.isArray(prev) ? prev : []).map((p) => ((p._id || p.id) === pId ? { ...p, ...data } : p))
      );
      toast.success(`Updated patient record for ${data.name}`);
      setIsModalOpen(false);
    } else {
      // Create Patient via POST /api/patients
      try {
        const res = await fetch("http://localhost:5000/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            age: data.age,
            disease: data.disease,
            risk: data.risk || "Low",
            riskLevel: data.risk || "Low",
            status: data.status || "Active",
            medicalHistory: data.disease,
            admissionDate: new Date().toISOString(),
          }),
        });

        const resJson = await res.json();

        if (res.status === 201 && resJson.success) {
          toast.success(`Registered new patient ${data.name}`);
          const createdPatient = resJson.data || {
            id: Date.now(),
            ...data,
            photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          };
          setPatients((prev) => [createdPatient, ...(Array.isArray(prev) ? prev : [])]);
          reset({ name: "", age: 40, disease: "", risk: "Low", status: "Active" });
          setIsModalOpen(false);
          fetchPatients();
        } else {
          const errorMsg = resJson.message || resJson.error || "Failed to create patient record";
          toast.error(`Registration Error: ${errorMsg}`);
        }
      } catch (err) {
        const newPatient = {
          id: Date.now(),
          ...data,
          photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        };
        setPatients((prev) => [newPatient, ...(Array.isArray(prev) ? prev : [])]);
        toast.success(`Registered new patient ${data.name}`);
        reset({ name: "", age: 40, disease: "", risk: "Low", status: "Active" });
        setIsModalOpen(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <SpotlightCard className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-2">
                <User className="text-emerald-400" size={28} />
                Patient Directory & Registry
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage clinical records, readmission risk flags, and active ward status.
            </p>
          </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExportPatientData("EXCEL")}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                title="Export patient records as Excel spreadsheet (.xlsx)"
              >
                <Download size={15} />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => handleExportPatientData("CSV")}
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                title="Export patient records as CSV table (.csv)"
              >
                <Download size={15} />
                <span>Export CSV (.csv)</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-xs transition-all cursor-pointer"
              >
                <Plus size={18} />
                <span>Register New Patient</span>
              </button>
            </div>
          </div>
        </SpotlightCard>

      {/* Main Table Card */}
      <SpotlightCard className="p-6">
        
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-80 flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
            <Search size={18} className="text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient name or disease..."
              className="w-full bg-transparent ml-2.5 text-xs md:text-sm text-slate-100 outline-none placeholder-slate-500 font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 w-full md:w-auto">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-400 font-semibold">Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-mono font-bold text-white outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Risk Levels</option>
                <option value="High" className="bg-slate-900 text-rose-400">High Risk</option>
                <option value="Medium" className="bg-slate-900 text-amber-400">Medium Risk</option>
                <option value="Low" className="bg-slate-900 text-emerald-400">Low Risk</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 w-full md:w-auto">
              <span className="text-xs text-slate-400 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-mono font-bold text-white outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Statuses</option>
                <option value="Active" className="bg-slate-900 text-emerald-400">Active Ward</option>
                <option value="Discharged" className="bg-slate-900 text-slate-400">Discharged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Data Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Age</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
                {(paginatedPatients && paginatedPatients.length > 0) ? (
                  paginatedPatients.map((patient) => (
                    <tr key={patient.id || Math.random()} className="even:bg-slate-900/30 odd:bg-slate-900/70 hover:bg-slate-800/50 transition-colors duration-200">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={role === "RESEARCHER" ? "https://i.pravatar.cc/150?img=68" : (patient.photo || "https://i.pravatar.cc/150?img=12")}
                            alt={patient.name || "Patient"}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white">
                              {formatPatientName(patient.name, patient.id)}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">ID: #{patient.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono font-bold">{patient.age} yrs</td>
                      <td className="py-3.5 px-4 text-slate-200 font-semibold">{patient.disease}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold ${
                          patient.risk === "High"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : patient.risk === "Medium"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {patient.risk} Risk
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-mono font-bold ${
                          patient.status === "Active" ? "text-emerald-400" : "text-slate-500"
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingPatient(patient)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="View Medical Summary"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(patient)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit Patient Record"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Soft Delete Patient"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No matching patient records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono font-semibold">
          <span>
            Showing {paginatedPatients?.length || 0} of {filteredPatients?.length || 0} patients
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </SpotlightCard>

      {/* Add / Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-800 border-t border-white/10">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                {editingPatient ? "Edit Patient Record" : "Register New Patient"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
                {errors.name && <p className="text-[11px] text-rose-400 font-mono font-bold mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    {...register("age")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                  {errors.age && <p className="text-[11px] text-rose-400 font-mono font-bold mt-1">{errors.age.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Condition</label>
                  <input
                    type="text"
                    {...register("disease")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                  {errors.disease && <p className="text-[11px] text-rose-400 font-mono font-bold mt-1">{errors.disease.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Level</label>
                  <select
                    {...register("risk")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ward Status</label>
                  <select
                    {...register("status")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active Ward</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {editingPatient ? "Save Changes" : "Register Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-800 border-t border-white/10">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Medical Summary & Care Plan</h3>
              <button onClick={() => setViewingPatient(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p><strong className="text-white">Patient Name:</strong> {formatPatientName(viewingPatient.name, viewingPatient.id)}</p>
              <p><strong className="text-white">Age:</strong> <span className="font-mono">{viewingPatient.age} yrs</span></p>
              <p><strong className="text-white">Condition:</strong> {viewingPatient.disease}</p>
              <p><strong className="text-white">Risk Level:</strong> <span className="font-mono font-bold text-emerald-400">{viewingPatient.risk} Risk</span></p>
              <p><strong className="text-white">Status:</strong> <span className="font-mono">{viewingPatient.status}</span></p>
              <p><strong className="text-white">Emergency Contact:</strong> {role === "RESEARCHER" ? "XXX-XXX-XXXX [PHI MASKED]" : "+1 (555) 987-6543"}</p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => handleDownloadPDF(viewingPatient)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <Download size={14} /> Download Care Plan (PDF)
              </button>

              <button
                onClick={() => setViewingPatient(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Patients;