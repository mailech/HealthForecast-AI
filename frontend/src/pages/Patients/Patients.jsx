import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Droplets,
  HeartPulse,
  Loader2,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import {
  getPatients,
  createPatient,
  predictPatientReadmission,
} from "../../services/api";


function Patients() {
  /* ======================================================
     PATIENT STATE
  ====================================================== */

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] =
    useState(null);

  /* ======================================================
     PREDICTION STATE
  ====================================================== */

  const [prediction, setPrediction] =
    useState(null);

  const [predicting, setPredicting] =
    useState(false);

  /* ======================================================
     PAGE STATE
  ====================================================== */

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ======================================================
     CREATE PATIENT FORM
  ====================================================== */

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    blood_group: "",
  });

  /* ======================================================
     LOAD PATIENTS
  ====================================================== */

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPatients();

      const patientList = Array.isArray(data)
        ? data
        : data?.patients ||
          data?.data ||
          [];

      setPatients(patientList);

    } catch (err) {
      console.error(
        "Unable to load patients:",
        err
      );

      setError(
        err.message ||
          "Unable to load patient records."
      );

    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     CREATE PATIENT
  ====================================================== */

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreatePatient = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const patientData = {
        name: formData.name.trim(),
        date_of_birth:
          formData.date_of_birth || null,
        gender:
          formData.gender || null,
        phone:
          formData.phone.trim() || null,
        address:
          formData.address.trim() || null,
        blood_group:
          formData.blood_group || null,
      };

      const createdPatient =
        await createPatient(patientData);

      setSuccess(
        "Patient created successfully."
      );

      setFormData({
        name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        address: "",
        blood_group: "",
      });

      setShowCreateForm(false);

      await loadPatients();

      if (createdPatient) {
        setSelectedPatient(
          createdPatient.patient ||
            createdPatient
        );
      }

    } catch (err) {
      console.error(
        "Unable to create patient:",
        err
      );

      setError(
        err.message ||
          "Unable to create patient."
      );

    } finally {
      setCreating(false);
    }
  };

  /* ======================================================
     SELECT PATIENT
  ====================================================== */

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPrediction(null);
    setError("");
    setSuccess("");
  };

  /* ======================================================
     DISPLAY PATIENT NUMBER
  ====================================================== */

  // Patient numbers are presentation-only.
  // Keep the real database ID unchanged for API/backend operations.
  const getPatientNumber = (patient) =>
    patients.findIndex(
      (item) => String(item.id) === String(patient.id)
    ) + 1;

  /* ======================================================
     AGE CALCULATION
  ====================================================== */

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return 65;
    }

    const birthDate =
      new Date(dateOfBirth);

    if (
      Number.isNaN(
        birthDate.getTime()
      )
    ) {
      return 65;
    }

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() <
          birthDate.getDate()
      )
    ) {
      age--;
    }

    return Math.max(age, 0);
  };

  /* ======================================================
     READMISSION PREDICTION
  ====================================================== */

  const handlePrediction = async () => {
    if (!selectedPatient) {
      return;
    }

    try {
      setPredicting(true);
      setPrediction(null);
      setError("");
      setSuccess("");

      /*
       * Patient-specific prediction.
       *
       * Only the selected patient ID is sent.
       *
       * The backend retrieves the patient's
       * demographic and clinical assessment
       * information and prepares the ML features.
       */

      const result =
        await predictPatientReadmission(
          selectedPatient.id
        );

      setPrediction(result);

    } catch (err) {
      console.error(
        "Readmission prediction error:",
        err
      );

      setError(
        err.message ||
          "Unable to generate readmission prediction."
      );

    } finally {
      setPredicting(false);
    }
  };

  /* ======================================================
     RISK HELPERS
  ====================================================== */

  const getRiskConfig = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return {
          label: "High Risk",
          text: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          iconBg: "bg-red-100",
          icon: "text-red-600",
          bar: "bg-red-500",
        };

      case "Moderate":
        return {
          label: "Moderate Risk",
          text: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          iconBg: "bg-amber-100",
          icon: "text-amber-600",
          bar: "bg-amber-500",
        };

      case "Low":
      default:
        return {
          label: "Low Risk",
          text: "text-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          iconBg: "bg-green-100",
          icon: "text-green-600",
          bar: "bg-green-500",
        };
    }
  };

  const formatRisk = (value) => {
    return `${(
      (value ?? 0) * 100
    ).toFixed(1)}%`;
  };

  /* ======================================================
     DERIVED DATA
  ====================================================== */

  const activePatients =
    patients.filter(
      (patient) =>
        patient.is_active !== false
    ).length;

  const malePatients =
    patients.filter(
      (patient) =>
        String(
          patient.gender || ""
        ).toLowerCase() === "male"
    ).length;

  const femalePatients =
    patients.filter(
      (patient) =>
        String(
          patient.gender || ""
        ).toLowerCase() === "female"
    ).length;

  const selectedRiskConfig =
    prediction
      ? getRiskConfig(
          prediction.risk_level
        )
      : null;

  /* ======================================================
     LOADING STATE
  ====================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Navbar />

          <main className="p-6 lg:p-8">
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50">
                  <Loader2
                    size={28}
                    className="animate-spin text-cyan-600"
                  />
                </div>

                <h2 className="mt-4 font-bold text-slate-800">
                  Loading patient records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Preparing your patient workspace...
                </p>

              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ======================================================
     MAIN UI
  ====================================================== */

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <div className="min-w-0 flex-1">

        <Navbar />

        <main className="mx-auto max-w-[1600px] p-5 sm:p-6 lg:p-8">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="mb-7">

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div className="rounded-lg bg-cyan-50 p-2">
                    <Users
                      size={18}
                      className="text-cyan-600"
                    />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                    Patient Intelligence
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Patient Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Manage patient records, review
                  clinical information, and evaluate
                  AI-powered readmission risk.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(
                    (previous) =>
                      !previous
                  );

                  setError("");
                  setSuccess("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700"
              >
                {showCreateForm ? (
                  <>
                    <X size={18} />
                    Close Form
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Patient
                  </>
                )}
              </button>

            </div>

          </section>

          {/* ==================================================
              ALERTS
          ================================================== */}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">

              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle2
                  size={18}
                  className="text-green-600"
                />
              </div>

              <p className="text-sm font-semibold text-green-700">
                {success}
              </p>

            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

              <div className="rounded-lg bg-red-100 p-2">
                <AlertCircle
                  size={18}
                  className="text-red-600"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-red-700">
                  Unable to complete request
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* ==================================================
              PATIENT SUMMARY
          ================================================== */}

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Patients
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {patients.length}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Records in your access scope
                  </p>
                </div>

                <div className="rounded-xl bg-cyan-50 p-3">
                  <Users
                    size={21}
                    className="text-cyan-600"
                  />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Patients
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {activePatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Currently active records
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3">
                  <HeartPulse
                    size={21}
                    className="text-green-600"
                  />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Male Patients
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {malePatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Based on recorded demographics
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-3">
                  <Users
                    size={21}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Female Patients
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {femalePatients}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Based on recorded demographics
                  </p>
                </div>

                <div className="rounded-xl bg-purple-50 p-3">
                  <Users
                    size={21}
                    className="text-purple-600"
                  />
                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              CREATE PATIENT
          ================================================== */}

          {showCreateForm && (
            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-cyan-100 p-3">
                    <UserPlus
                      size={21}
                      className="text-cyan-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Add New Patient
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Create a new patient demographic record.
                    </p>
                  </div>

                </div>

              </div>

              <form
                onSubmit={
                  handleCreatePatient
                }
                className="p-6"
              >

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                  {/* Name */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={
                        handleFormChange
                      }
                      required
                      minLength={2}
                      placeholder="Enter patient name"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                    />
                  </div>

                  {/* DOB */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Date of Birth
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        name="date_of_birth"
                        value={
                          formData.date_of_birth
                        }
                        onChange={
                          handleFormChange
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                      />
                    </div>
                  </div>

                  {/* Gender */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={
                        formData.gender
                      }
                      onChange={
                        handleFormChange
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                    >
                      <option value="">
                        Select gender
                      </option>
                      <option value="Male">
                        Male
                      </option>
                      <option value="Female">
                        Female
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {/* Blood Group */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Blood Group
                    </label>

                    <div className="relative">
                      <Droplets
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-red-400"
                      />

                      <select
                        name="blood_group"
                        value={
                          formData.blood_group
                        }
                        onChange={
                          handleFormChange
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                      >
                        <option value="">
                          Select blood group
                        </option>
                        <option value="A+">
                          A+
                        </option>
                        <option value="A-">
                          A-
                        </option>
                        <option value="B+">
                          B+
                        </option>
                        <option value="B-">
                          B-
                        </option>
                        <option value="AB+">
                          AB+
                        </option>
                        <option value="AB-">
                          AB-
                        </option>
                        <option value="O+">
                          O+
                        </option>
                        <option value="O-">
                          O-
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Phone */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone
                    </label>

                    <div className="relative">
                      <Phone
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Enter phone number"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                      />
                    </div>
                  </div>

                  {/* Address */}

                  <div className="md:col-span-2 xl:col-span-1">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Address
                    </label>

                    <div className="relative">
                      <MapPin
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="address"
                        value={
                          formData.address
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Enter address"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                      />
                    </div>
                  </div>

                </div>

                <div className="mt-6 flex justify-end">

                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creating ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus size={17} />
                        Create Patient
                      </>
                    )}
                  </button>

                </div>

              </form>

            </section>
          )}

          {/* ==================================================
              PATIENT WORKSPACE
          ================================================== */}

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">

            {/* =================================================
                PATIENT LIST
            ================================================= */}

            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-cyan-50 p-3">
                      <Users
                        size={21}
                        className="text-cyan-600"
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Patient Records
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Select a patient to view
                        details and AI assessment.
                      </p>
                    </div>

                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    {patients.length}{" "}
                    {patients.length === 1
                      ? "Patient"
                      : "Patients"}
                  </span>

                </div>

              </div>

              {patients.length === 0 ? (

                <div className="px-6 py-16 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <Users
                      size={28}
                      className="text-slate-400"
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-800">
                    No patients found
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Create your first patient
                    record to begin using
                    HealthForecast AI.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(
                        true
                      );
                      setError("");
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
                  >
                    <Plus size={17} />
                    Add First Patient
                  </button>

                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {patients.map(
                    (patient) => {

                      const isSelected =
                        selectedPatient?.id ===
                        patient.id;

                      const initials =
                        (
                          patient.name ||
                          "U"
                        )
                          .split(" ")
                          .map(
                            (part) =>
                              part.charAt(0)
                          )
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                      return (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() =>
                            handleSelectPatient(
                              patient
                            )
                          }
                          className={`group w-full border-l-4 px-6 py-5 text-left transition ${
                            isSelected
                              ? "border-cyan-500 bg-cyan-50/70"
                              : "border-transparent hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex items-center gap-4">

                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                isSelected
                                  ? "bg-cyan-100 text-cyan-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {initials}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                  <h3 className="truncate font-bold text-slate-900">
                                    {patient.name ||
                                      "Unknown Patient"}
                                  </h3>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    Patient Number: #
                                    {getPatientNumber(patient)}
                                  </p>
                                </div>

                                <ChevronRight
                                  size={18}
                                  className={`hidden shrink-0 transition sm:block ${
                                    isSelected
                                      ? "text-cyan-600"
                                      : "text-slate-300 group-hover:translate-x-1 group-hover:text-cyan-500"
                                  }`}
                                />

                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">

                                <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                                  {patient.gender ||
                                    "Gender N/A"}
                                </span>

                                <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                                  {patient.blood_group ||
                                    "Blood N/A"}
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                  {patient.is_active ===
                                  false
                                    ? "Inactive"
                                    : "Active"}
                                </span>

                              </div>

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              )}

            </div>

            {/* =================================================
                PATIENT DETAILS
            ================================================= */}

            <div className="min-w-0">

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6 text-white">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-white/10 p-3">
                      <Stethoscope
                        size={22}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Clinical Workspace
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        Patient Details
                      </h2>
                    </div>

                  </div>

                </div>

                {!selectedPatient ? (

                  <div className="px-6 py-16 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                      <UserPlus
                        size={27}
                        className="text-slate-400"
                      />
                    </div>

                    <h3 className="mt-5 font-bold text-slate-800">
                      Select a patient
                    </h3>

                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      Choose a patient from the
                      records list to view their
                      clinical information and
                      run an AI assessment.
                    </p>

                  </div>

                ) : (

                  <div className="p-6">

                    {/* Patient identity */}

                    <div className="rounded-2xl bg-slate-50 p-5">

                      <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-lg font-bold text-cyan-700">
                          {(
                            selectedPatient.name ||
                            "U"
                          )
                            .split(" ")
                            .map(
                              (part) =>
                                part.charAt(0)
                            )
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-slate-900">
                            {selectedPatient.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Patient #
                            {getPatientNumber(selectedPatient)}
                          </p>
                        </div>

                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs text-slate-400">
                            Age
                          </p>

                          <p className="mt-1 font-bold text-slate-800">
                            {calculateAge(
                              selectedPatient.date_of_birth
                            )}{" "}
                            yrs
                          </p>

                        </div>

                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs text-slate-400">
                            Gender
                          </p>

                          <p className="mt-1 font-bold capitalize text-slate-800">
                            {selectedPatient.gender ||
                              "N/A"}
                          </p>

                        </div>

                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs text-slate-400">
                            Blood Group
                          </p>

                          <p className="mt-1 font-bold text-slate-800">
                            {selectedPatient.blood_group ||
                              "N/A"}
                          </p>

                        </div>

                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs text-slate-400">
                            Doctor ID
                          </p>

                          <p className="mt-1 font-bold text-slate-800">
                            {selectedPatient.assigned_doctor_id ||
                              "N/A"}
                          </p>

                        </div>

                      </div>

                      <div className="mt-3 space-y-2">

                        {selectedPatient.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone
                              size={14}
                              className="text-cyan-600"
                            />
                            {selectedPatient.phone}
                          </div>
                        )}

                        {selectedPatient.address && (
                          <div className="flex items-start gap-2 text-xs text-slate-500">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-cyan-600"
                            />
                            <span>
                              {selectedPatient.address}
                            </span>
                          </div>
                        )}

                      </div>

                    </div>

                    {/* AI assessment */}

                    <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-100">

                      <div className="bg-cyan-50 px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-white p-2.5 shadow-sm">
                            <Brain
                              size={20}
                              className="text-cyan-600"
                            />
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900">
                              AI Readmission Assessment
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500">
                              HistGradientBoosting model
                            </p>
                          </div>

                        </div>

                      </div>

                      <div className="p-5">

                        {!prediction ? (

                          <div>

                            <p className="text-sm leading-6 text-slate-500">
                              Generate an AI-powered
                              readmission risk assessment
                              using this patient's
                              clinical and utilization
                              information.
                            </p>

                            <button
                              type="button"
                              onClick={
                                handlePrediction
                              }
                              disabled={predicting}
                              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {predicting ? (
                                <>
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                  Analyzing Risk...
                                </>
                              ) : (
                                <>
                                  <Sparkles
                                    size={17}
                                  />
                                  Predict Readmission Risk
                                </>
                              )}
                            </button>

                          </div>

                        ) : (

                          <div>

                            {/* Risk summary */}

                            <div
                              className={`rounded-2xl border p-5 ${selectedRiskConfig.bg} ${selectedRiskConfig.border}`}
                            >

                              <div className="flex items-start justify-between gap-4">

                                <div>

                                  <p
                                    className={`text-xs font-bold uppercase tracking-wider ${selectedRiskConfig.text}`}
                                  >
                                    Predicted Readmission Risk
                                  </p>

                                  <p className="mt-2 text-4xl font-bold text-slate-900">
                                    {formatRisk(
                                      prediction.readmission_probability
                                    )}
                                  </p>

                                </div>

                                <div
                                  className={`rounded-xl p-3 ${selectedRiskConfig.iconBg}`}
                                >
                                  {prediction.risk_level ===
                                  "High" ? (
                                    <AlertCircle
                                      size={22}
                                      className={
                                        selectedRiskConfig.icon
                                      }
                                    />
                                  ) : (
                                    <CheckCircle2
                                      size={22}
                                      className={
                                        selectedRiskConfig.icon
                                      }
                                    />
                                  )}
                                </div>

                              </div>

                              <div className="mt-4 flex items-center justify-between">

                                <span
                                  className={`rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm ${selectedRiskConfig.text}`}
                                >
                                  {
                                    selectedRiskConfig.label
                                  }
                                </span>

                                <span className="text-xs font-medium text-slate-500">
                                  Threshold{" "}
                                  {formatRisk(
                                    prediction.decision_threshold
                                  )}
                                </span>

                              </div>

                              <div className="mt-5">

                                <div className="h-2 overflow-hidden rounded-full bg-white/80">

                                  <div
                                    className={`h-full rounded-full transition-all ${selectedRiskConfig.bar}`}
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          (
                                            prediction.readmission_probability ||
                                            0
                                          ) * 100,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </div>

                            {/* Prediction */}

                            <div className="mt-4 rounded-xl border border-slate-200 p-4">

                              <div className="flex items-center gap-2">
                                <Activity
                                  size={17}
                                  className="text-cyan-600"
                                />

                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Prediction
                                </p>
                              </div>

                              <p className="mt-2 font-bold text-slate-800">
                                {
                                  prediction.predicted_outcome
                                }
                              </p>

                            </div>

                            {/* Interpretation */}

                            <div className="mt-4 rounded-xl border border-slate-200 p-4">

                              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Clinical Interpretation
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {
                                  prediction.clinical_interpretation
                                }
                              </p>

                            </div>

                            {/* Action */}

                            <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-4">

                              <div className="flex items-center gap-2">
                                <Stethoscope
                                  size={17}
                                  className="text-cyan-600"
                                />

                                <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">
                                  Recommended Action
                                </p>
                              </div>

                              <p className="mt-2 text-sm leading-6 text-slate-700">
                                {
                                  prediction.recommended_action
                                }
                              </p>

                            </div>

                            {/* Actions */}

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                              <button
                                type="button"
                                onClick={
                                  handlePrediction
                                }
                                disabled={
                                  predicting
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-60"
                              >
                                {predicting ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Activity
                                    size={16}
                                  />
                                )}
                                Recalculate
                              </button>

                              <Link
                                to="/clinical-decision-support"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
                              >
                                Open CDS
                                <ArrowRight
                                  size={16}
                                />
                              </Link>

                            </div>

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </section>

          {/* ==================================================
              PRIVACY
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <ShieldCheck
                  size={22}
                  className="text-cyan-600"
                />
              </div>

              <div>

                <h3 className="font-bold text-slate-900">
                  Responsible AI & Patient Privacy
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Patient information is protected through
                  role-based access controls. AI-generated
                  predictions are intended to support clinical
                  review and should not replace professional
                  medical judgment.
                </p>

              </div>

            </div>

          </section>

          <div className="h-4" />

        </main>

      </div>

    </div>
  );
}

export default Patients;