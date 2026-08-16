import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";
import PatientTable from "../components/PatientTable";

import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";

function Patients() {
  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Patient form
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    disease: "",
    risk: "Low",
    status: "Admitted",
  });

  // =========================
  // Fetch Patients
  // =========================

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/patients"
      );

      setPatients(response.data);
    } catch (error) {
      console.error(error);
      setError(
        "Unable to load patients. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Form Input Change
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Add Patient
  // =========================

  const handleAddPatient = async (e) => {
    e.preventDefault();

    try {
      const newPatient = {
        name: formData.name,
        age: Number(formData.age),
        disease: formData.disease,
        risk: formData.risk,
        status: formData.status,
      };

      await axios.post(
        "http://127.0.0.1:8000/api/patients",
        newPatient
      );

      // Refresh patient list
      await fetchPatients();

      // Close form
      setShowForm(false);

      // Reset form
      setFormData({
        name: "",
        age: "",
        disease: "",
        risk: "Low",
        status: "Admitted",
      });

      alert("Patient added successfully!");

    } catch (error) {
      console.error("Error adding patient:", error);

      alert("Failed to add patient.");
    }
  };

  // =========================
  // Search + Filter
  // =========================

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      patient.disease
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "All" ||
      patient.risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // =========================
  // Statistics
  // =========================

  const totalPatients = patients.length;

  const highRiskPatients = patients.filter(
    (patient) => patient.risk === "High"
  ).length;

  const mediumRiskPatients = patients.filter(
    (patient) => patient.risk === "Medium"
  ).length;

  const lowRiskPatients = patients.filter(
    (patient) => patient.risk === "Low"
  ).length;

  return (
    <DashboardLayout>

      {/* =========================
          Header
      ========================= */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Patient Management
          </h1>

          <p className="text-gray-500 mt-1">
            View, search and manage patient records.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <FaPlus />
          Add Patient
        </button>

      </div>


      {/* =========================
          Add Patient Form
      ========================= */}

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              Add New Patient
            </h2>

            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <FaTimes size={20} />
            </button>

          </div>

          <form
            onSubmit={handleAddPatient}
            className="grid md:grid-cols-2 gap-5"
          >

            {/* Name */}

            <div>
              <label className="block mb-2 font-medium">
                Patient Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient name"
                required
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            {/* Age */}

            <div>
              <label className="block mb-2 font-medium">
                Age
              </label>

              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="1"
                max="120"
                required
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            {/* Disease */}

            <div>
              <label className="block mb-2 font-medium">
                Disease
              </label>

              <input
                type="text"
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                placeholder="Enter disease"
                required
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            {/* Risk */}

            <div>
              <label className="block mb-2 font-medium">
                Risk Level
              </label>

              <select
                name="risk"
                value={formData.risk}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>


            {/* Status */}

            <div>
              <label className="block mb-2 font-medium">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Admitted">Admitted</option>
                <option value="Observation">Observation</option>
                <option value="Recovered">Recovered</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>


            {/* Buttons */}

            <div className="flex items-end gap-3">

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Save Patient
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =========================
          Search + Filter
      ========================= */}

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <div className="grid md:grid-cols-2 gap-4">

          <div className="relative">

            <FaSearch className="absolute left-4 top-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search by patient or disease..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

        </div>

      </div>


      {/* =========================
          Statistics
      ========================= */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">

        <div className="bg-blue-50 rounded-xl p-6 shadow">
          <h2 className="text-gray-500">
            Total Patients
          </h2>

          <p className="text-3xl font-bold mt-2">
            {totalPatients}
          </p>
        </div>

        <div className="bg-red-50 rounded-xl p-6 shadow">
          <h2 className="text-gray-500">
            High Risk
          </h2>

          <p className="text-3xl font-bold mt-2 text-red-600">
            {highRiskPatients}
          </p>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 shadow">
          <h2 className="text-gray-500">
            Medium Risk
          </h2>

          <p className="text-3xl font-bold mt-2 text-yellow-600">
            {mediumRiskPatients}
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 shadow">
          <h2 className="text-gray-500">
            Low Risk
          </h2>

          <p className="text-3xl font-bold mt-2 text-green-600">
            {lowRiskPatients}
          </p>
        </div>

      </div>


      {/* =========================
          Loading
      ========================= */}

      {loading && (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-gray-500">
            Loading patients...
          </p>
        </div>
      )}


      {/* =========================
          Error
      ========================= */}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">

          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={fetchPatients}
            className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            Try Again
          </button>

        </div>
      )}


      {/* =========================
          Patient Table
      ========================= */}

      {!loading && !error && filteredPatients.length > 0 && (
        <PatientTable patients={filteredPatients} />
      )}

      {!loading &&
        !error &&
        filteredPatients.length === 0 && (
          <div className="bg-white rounded-xl shadow p-10 text-center">

            <h2 className="text-xl font-semibold text-gray-700">
              No patients found
            </h2>

            <p className="text-gray-500 mt-2">
              Try changing your search or risk filter.
            </p>

          </div>
        )}

    </DashboardLayout>
  );
}

export default Patients;