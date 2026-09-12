import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import {
  FaHeartbeat,
  FaUserInjured,
  FaNotesMedical,
} from "react-icons/fa";

function CareRecommendations() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/patients");

      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to access care recommendations."
        );
      } else if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to load patient information."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = (patient) => {
    const risk = String(
      patient.risk || ""
    ).toLowerCase();

    const status = String(
      patient.status || ""
    ).toLowerCase();

    if (risk === "high") {
      return {
        title: "High-Risk Care",
        recommendation:
          "Prioritize close clinical monitoring, review the patient's current treatment plan, and assess readmission risk before discharge.",
      };
    }

    if (risk === "medium") {
      return {
        title: "Moderate-Risk Care",
        recommendation:
          "Continue regular monitoring, review treatment response, and provide appropriate patient education before discharge.",
      };
    }

    if (
      status === "recovered" ||
      status === "discharged"
    ) {
      return {
        title: "Recovery & Discharge Care",
        recommendation:
          "Continue post-discharge guidance, medication adherence support, and appropriate follow-up planning.",
      };
    }

    return {
      title: "Routine Care",
      recommendation:
        "Continue routine monitoring and evaluate the patient's progress according to the current care plan.",
    };
  };

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Care Recommendations
        </h1>

        <p className="text-gray-500 mt-2">
          Generate patient care recommendations based on
          current risk and clinical status.
        </p>
      </div>


      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      )}


      {/* LOADING */}
      {loading && (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-gray-500">
            Loading patient information...
          </p>
        </div>
      )}


      {/* PATIENTS */}
      {!loading &&
        !error &&
        patients.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">

            {patients.map((patient, index) => {
              const recommendation =
                getRecommendation(patient);

              return (
                <div
                  key={
                    patient.id ||
                    patient._id ||
                    index
                  }
                  className="bg-white rounded-xl shadow-md p-6"
                >

                  {/* PATIENT HEADER */}
                  <div className="flex items-center gap-4 mb-5">

                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                      <FaUserInjured size={24} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {patient.name || "Unknown Patient"}
                      </h2>

                      <p className="text-sm text-gray-500">
                        Age: {patient.age ?? "—"}
                      </p>
                    </div>

                  </div>


                  {/* PATIENT INFORMATION */}
                  <div className="grid grid-cols-2 gap-4 mb-5">

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">
                        Disease
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {patient.disease || "—"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">
                        Current Status
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {patient.status || "—"}
                      </p>
                    </div>

                  </div>


                  {/* RISK */}
                  <div className="flex items-center gap-3 mb-5">

                    <FaHeartbeat className="text-red-500" />

                    <span className="text-gray-600">
                      Risk Level:
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        String(patient.risk).toLowerCase() ===
                        "high"
                          ? "bg-red-100 text-red-600"
                          : String(patient.risk).toLowerCase() ===
                            "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {patient.risk || "Unknown"}
                    </span>

                  </div>


                  {/* RECOMMENDATION */}
                  <div className="border border-blue-100 bg-blue-50 rounded-xl p-5">

                    <div className="flex items-center gap-3 mb-3">

                      <FaNotesMedical className="text-blue-600" />

                      <h3 className="font-bold text-blue-800">
                        {recommendation.title}
                      </h3>

                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {recommendation.recommendation}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>
        )}


      {/* NO PATIENTS */}
      {!loading &&
        !error &&
        patients.length === 0 && (
          <div className="bg-white rounded-xl shadow p-10 text-center">

            <FaUserInjured
              className="mx-auto text-gray-300 mb-4"
              size={45}
            />

            <h2 className="text-xl font-semibold text-gray-700">
              No Assigned Patients
            </h2>

            <p className="text-gray-500 mt-2">
              You currently have no patients assigned to you.
            </p>

          </div>
        )}

    </DashboardLayout>
  );
}

export default CareRecommendations;