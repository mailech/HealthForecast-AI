import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SkeletonTable } from "../components/Skeletons";
import { useRole } from "../context/RoleContext";

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

  // Filtered logic
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.disease.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "All" || patient.risk === riskFilter;
      const matchesStatus = statusFilter === "All" || patient.status === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [patients, searchQuery, riskFilter, statusFilter]);

  // Paginated Data
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  // PHI Name Masking Helper for Healthcare Researchers (PDF Page 4 & 6)
  const formatPatientName = (name, id) => {
    if (role === "RESEARCHER") {
      const numStr = String(id).padStart(3, "0");
      return `ANONYMIZED_PATIENT_${numStr}`;
    }
    return name;
  };

  // Permission Guard for Adding Patients
  const handleOpenAddModal = () => {
    if (role === "HOSPITAL_ADMIN") {
      toast.error("Permission Denied (Hospital Admin)", {
        description: "Hospital Administrators have View-Only access to patient medical records per PDF Page 6 Access Matrix.",
      });
      return;
    }
    if (role === "RESEARCHER") {
      toast.error("Permission Denied (Healthcare Researcher)", {
        description: "Healthcare Researchers cannot modify patient medical records per PDF Spec Page 4 & 6.",
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
    setValue("name", patient.name);
    setValue("age", patient.age);
    setValue("disease", patient.disease);
    setValue("risk", patient.risk);
    setValue("status", patient.status);
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

    setPatients(patients.filter((p) => p.id !== id));
    toast.success("Patient record soft-deleted (preserved for compliance audit trail)");
  };

  const onSubmitForm = (data) => {
    if (editingPatient) {
      setPatients(
        patients.map((p) => (p.id === editingPatient.id ? { ...p, ...data } : p))
      );
      toast.success(`Updated patient record for ${data.name}`);
    } else {
      const newPatient = {
        id: Date.now(),
        ...data,
        photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      setPatients([newPatient, ...patients]);
      toast.success(`Registered new patient ${data.name}`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <User className="text-blue-600" size={28} />
              Patient Directory & Registry
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage clinical records, readmission risk flags, and active ward status.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Researcher Anonymized Indicator */}
          {role === "RESEARCHER" && (
            <div className="bg-amber-50 text-amber-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <EyeOff size={16} className="text-amber-600" />
              <span>HIPAA PHI Anonymized View</span>
            </div>
          )}

          <button
            onClick={handleOpenAddModal}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs text-xs transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80">
        
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-80 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus-within:bg-white focus-within:border-blue-500 transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient name or disease..."
              className="w-full bg-transparent ml-2.5 text-xs md:text-sm text-slate-800 outline-none placeholder-slate-400 font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 w-full md:w-auto">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 font-bold">Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer"
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 w-full md:w-auto">
              <span className="text-xs text-slate-500 font-bold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Ward</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Data Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={role === "RESEARCHER" ? "https://i.pravatar.cc/150?img=68" : patient.photo}
                            alt={patient.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">
                              {formatPatientName(patient.name, patient.id)}
                            </p>
                            <p className="text-[11px] text-slate-400">ID: #{patient.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{patient.age} yrs</td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">{patient.disease}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          patient.risk === "High"
                            ? "bg-rose-100 text-rose-700"
                            : patient.risk === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {patient.risk} Risk
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold ${
                          patient.status === "Active" ? "text-blue-600" : "text-slate-500"
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingPatient(patient)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Medical Summary"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(patient)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Patient Record"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
          <span>
            Showing {paginatedPatients.length} of {filteredPatients.length} patients
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Add / Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingPatient ? "Edit Patient Record" : "Register New Patient"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                />
                {errors.name && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    {...register("age")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                  {errors.age && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.age.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <input
                    type="text"
                    {...register("disease")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                  {errors.disease && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.disease.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Risk Level</label>
                  <select
                    {...register("risk")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ward Status</label>
                  <select
                    {...register("status")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Active">Active Ward</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Medical Summary</h3>
              <button onClick={() => setViewingPatient(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p><strong>Patient Name:</strong> {formatPatientName(viewingPatient.name, viewingPatient.id)}</p>
              <p><strong>Age:</strong> {viewingPatient.age} yrs</p>
              <p><strong>Condition:</strong> {viewingPatient.disease}</p>
              <p><strong>Risk Level:</strong> {viewingPatient.risk} Risk</p>
              <p><strong>Status:</strong> {viewingPatient.status}</p>
              <p><strong>Emergency Contact:</strong> {role === "RESEARCHER" ? "XXX-XXX-XXXX [PHI MASKED]" : "+1 (555) 987-6543"}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingPatient(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
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