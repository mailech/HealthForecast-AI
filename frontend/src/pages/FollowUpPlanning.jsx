import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import {
  FaCalendarCheck,
  FaUserInjured,
  FaHeartbeat,
} from "react-icons/fa";

function FollowUpPlanning() {
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
      console.error(
        "Error fetching patients:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to access follow-up planning."
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

  const getFollowUpPlan = (patient) => {
    const risk = String(
      patient.risk || ""
    ).toLowerCase();

    const status = String(
      patient.status || ""
    ).toLowerCase();

    if (risk === "high") {
      return {
        priority: "High Priority",
        timing: "Within 7 days",
        recommendation:
          "Schedule an early follow-up review and closely monitor the patient's recovery and readmission risk.",
      };
    }

    if (risk === "medium") {
      return {
        priority: "Moderate Priority",
        timing: "Within 14 days",
        recommendation:
          "Schedule a follow-up consultation to evaluate treatment response and recovery progress.",
      };
    }

    if (
      status === "discharged" ||
      status === "recovered"
    ) {
      return {
        priority: "Routine Follow-up",
        timing: "Within 30 days",
        recommendation:
          "Continue routine post-discharge follow-up and assess recovery progress.",
      };
    }

    return {
      priority: "Standard Monitoring",
      timing: "As clinically appropriate",
      recommendation:
        "Continue monitoring and schedule follow-up based on the patient's clinical progress.",
    };
  };

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Follow-up Planning
        </h1>

        <p className="text-gray-500 mt-2">
          Review follow-up planning suggestions for your
          assigned patients.
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
            Loading follow-up information...
          </p>
        </div>
      )}


      {/* PATIENT CARDS */}
      {!loading &&
        !error &&
        patients.length > 0 && (
          <div className="space-y-5">

            {patients.map((patient, index) => {

              const plan =
                getFollowUpPlan(patient);

              return (
                <div
                  key={
                    patient.id ||
                    patient._id ||
                    index
                  }
                  className="bg-white rounded-xl shadow-md p-6"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    {/* PATIENT */}
                    <div className="flex items-center gap-4">

                      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                        <FaUserInjured size={24} />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          {patient.name || "Unknown Patient"}
                        </h2>

                        <p className="text-sm text-gray-500">
                          {patient.disease || "No disease recorded"}
                          {" • "}
                          Age {patient.age ?? "—"}
                        </p>
                      </div>

                    </div>


                    {/* RISK */}
                    <div className="flex items-center gap-2">

                      <FaHeartbeat className="text-red-500" />

                      <span className="text-gray-600">
                        Risk:
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

                  </div>


                  {/* PLAN */}
                  <div className="grid md:grid-cols-3 gap-4 mt-6">

                    <div className="bg-blue-50 rounded-lg p-4">

                      <p className="text-sm text-gray-500">
                        Follow-up Priority
                      </p>

                      <p className="font-bold text-blue-700 mt-1">
                        {plan.priority}
                      </p>

                    </div>


                    <div className="bg-green-50 rounded-lg p-4">

                      <p className="text-sm text-gray-500">
                        Suggested Timing
                      </p>

                      <p className="font-bold text-green-700 mt-1">
                        {plan.timing}
                      </p>

                    </div>


                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-sm text-gray-500">
                        Current Status
                      </p>

                      <p className="font-bold text-gray-700 mt-1">
                        {patient.status || "—"}
                      </p>

                    </div>

                  </div>


                  {/* RECOMMENDATION */}
                  <div className="mt-5 border border-blue-100 bg-blue-50 rounded-xl p-5">

                    <div className="flex items-center gap-3 mb-2">

                      <FaCalendarCheck className="text-blue-600" />

                      <h3 className="font-bold text-blue-800">
                        Follow-up Suggestion
                      </h3>

                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {plan.recommendation}
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

            <FaCalendarCheck
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

export default FollowUpPlanning;