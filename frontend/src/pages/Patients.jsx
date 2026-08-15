import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import AddPatientModal from "../components/patient/AddPatientModal";
import EditPatientModal from "../components/patient/EditPatientModal";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import api from "../api/api";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [loading, setLoading] = useState(true);


  // =========================
  // FETCH PATIENTS
  // =========================

  const fetchPatients = async () => {
    try {
      setLoading(true);

      const response = await api.get("/patients");

      setPatients(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch patients:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPatients();
  }, []);


  // =========================
  // ADD PATIENT
  // =========================

  const handleAddPatient = async (patient) => {
    try {
      const response = await api.post(
        "/patients",
        patient
      );

      setPatients((prev) => [
        response.data,
        ...prev,
      ]);

      setIsAddOpen(false);

    } catch (error) {
      console.error(
        "Failed to add patient:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to add patient"
      );

      throw error;
    }
  };


  // =========================
  // EDIT PATIENT
  // =========================

  const handleEditPatient = async (
    patientId,
    updatedPatient
  ) => {
    try {
      const response = await api.put(
        `/patients/${patientId}`,
        updatedPatient
      );

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === patientId
            ? response.data
            : patient
        )
      );

      setIsEditOpen(false);
      setSelectedPatient(null);

    } catch (error) {
      console.error(
        "Failed to update patient:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to update patient"
      );

      throw error;
    }
  };


  // =========================
  // DELETE PATIENT
  // =========================

  const handleDeletePatient = async (
    patientId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/patients/${patientId}`
      );

      setPatients((prev) =>
        prev.filter(
          (patient) =>
            patient.id !== patientId
        )
      );

    } catch (error) {
      console.error(
        "Failed to delete patient:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete patient"
      );
    }
  };


  // =========================
  // SEARCH
  // =========================

  const filteredPatients = patients.filter(
    (patient) => {

      const query =
        search.toLowerCase();

      return (
        patient.name
          ?.toLowerCase()
          .includes(query) ||

        patient.disease
          ?.toLowerCase()
          .includes(query) ||

        patient.risk
          ?.toLowerCase()
          .includes(query) ||

        patient.status
          ?.toLowerCase()
          .includes(query)
      );
    }
  );


  // =========================
  // OPEN EDIT
  // =========================

  const openEdit = (patient) => {
    setSelectedPatient(patient);
    setIsEditOpen(true);
  };


  return (
    <MainLayout>

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Patients
          </h1>

          <p className="text-gray-500 mt-1">
            Manage and monitor patient records
          </p>

        </div>


        <button
          onClick={() =>
            setIsAddOpen(true)
          }
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm"
        >

          <Plus size={19} />

          Add Patient

        </button>

      </div>


      {/* =========================
          SUMMARY
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-xl shadow-sm p-5">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users
                size={21}
                className="text-blue-600"
              />
            </div>

            <div>

              <p className="text-sm text-gray-500">
                Total Patients
              </p>

              <h2 className="text-2xl font-bold text-slate-800">
                {patients.length}
              </h2>

            </div>

          </div>

        </div>


        <div className="bg-white rounded-xl shadow-sm p-5">

          <p className="text-sm text-gray-500">
            High Risk
          </p>

          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {
              patients.filter(
                (p) => p.risk === "High"
              ).length
            }
          </h2>

        </div>


        <div className="bg-white rounded-xl shadow-sm p-5">

          <p className="text-sm text-gray-500">
            Stable
          </p>

          <h2 className="text-2xl font-bold text-green-600 mt-1">
            {
              patients.filter(
                (p) => p.status === "Stable"
              ).length
            }
          </h2>

        </div>

      </div>


      {/* =========================
          SEARCH
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">

        <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3">

          <Search
            size={19}
            className="text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by name, disease, risk or status..."
            className="ml-3 bg-transparent outline-none w-full text-sm"
          />

        </div>

      </div>


      {/* =========================
          TABLE
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="bg-slate-50 border-b">

              <tr>

                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Patient
                </th>

                <th className="text-center text-sm font-semibold text-gray-600">
                  Age
                </th>

                <th className="text-center text-sm font-semibold text-gray-600">
                  Gender
                </th>

                <th className="text-center text-sm font-semibold text-gray-600">
                  Disease
                </th>

                <th className="text-center text-sm font-semibold text-gray-600">
                  Risk
                </th>

                <th className="text-center text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="text-center text-sm font-semibold text-gray-600">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {loading && (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >
                    Loading patients...
                  </td>

                </tr>

              )}


              {!loading &&
                filteredPatients.length === 0 && (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-12"
                    >

                      <div className="flex flex-col items-center">

                        <Users
                          size={40}
                          className="text-gray-300 mb-3"
                        />

                        <p className="font-medium text-gray-600">
                          No patients found
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          Try another search or add a new patient.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}


              {!loading &&
                filteredPatients.map(
                  (patient) => (

                    <tr
                      key={patient.id}
                      className="border-b last:border-b-0 hover:bg-slate-50 transition"
                    >

                      {/* PATIENT */}

                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {patient.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-medium text-slate-800">
                              {patient.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID #{patient.id}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* AGE */}

                      <td className="text-center text-gray-600">
                        {patient.age}
                      </td>


                      {/* GENDER */}

                      <td className="text-center text-gray-600">
                        {patient.gender}
                      </td>


                      {/* DISEASE */}

                      <td className="text-center text-gray-600">
                        {patient.disease}
                      </td>


                      {/* RISK */}

                      <td className="text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            patient.risk ===
                            "High"
                              ? "bg-red-100 text-red-600"
                              : patient.risk ===
                                "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {patient.risk}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td className="text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            patient.status ===
                            "Critical"
                              ? "bg-red-100 text-red-600"
                              : patient.status ===
                                "Recovered"
                              ? "bg-green-100 text-green-600"
                              : patient.status ===
                                "Stable"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {patient.status}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="flex justify-center gap-2">

                          <button
                            title="View patient"
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Eye size={17} />
                          </button>


                          <button
                            title="Edit patient"
                            onClick={() =>
                              openEdit(patient)
                            }
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                          >
                            <Pencil size={17} />
                          </button>


                          <button
                            title="Delete patient"
                            onClick={() =>
                              handleDeletePatient(
                                patient.id
                              )
                            }
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================
          ADD MODAL
      ========================= */}

      <AddPatientModal
        isOpen={isAddOpen}
        onClose={() =>
          setIsAddOpen(false)
        }
        onAddPatient={
          handleAddPatient
        }
      />


      {/* =========================
          EDIT MODAL
      ========================= */}

      <EditPatientModal
        isOpen={isEditOpen}
        patient={selectedPatient}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPatient(null);
        }}
        onUpdatePatient={
          handleEditPatient
        }
      />

    </MainLayout>
  );
}

export default Patients; 