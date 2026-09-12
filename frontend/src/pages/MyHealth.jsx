import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/api";
import {
  HeartPulse,
  User,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

function MyHealth() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyHealth();
  }, []);

  const fetchMyHealth = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      const data = response.data;

      setPatient(data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error("MY HEALTH ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load your health record."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">
            Loading your health record...
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <HeartPulse
              size={26}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              My Health
            </h1>

            <p className="text-gray-500 mt-1">
              View your personal health record
            </p>
          </div>

        </div>
      </div>


      {/* ERROR */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
          {error}
        </div>
      )}


      {/* NO RECORD */}
      {!error && !patient && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">

          <User
            size={48}
            className="mx-auto text-gray-300 mb-4"
          />

          <h2 className="text-xl font-semibold text-slate-800">
            No Health Record Found
          </h2>

          <p className="text-gray-500 mt-2">
            Your patient record has not been linked to your account yet.
          </p>

        </div>
      )}


      {/* PATIENT RECORD */}
      {patient && (

        <div className="space-y-6">

          {/* BASIC INFORMATION */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-3 rounded-lg bg-blue-50">
                <User
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Personal Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your registered patient details
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {patient.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Age
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {patient.age}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Gender
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {patient.gender}
                </p>
              </div>

            </div>

          </div>


          {/* HEALTH STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Activity
                    size={21}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Disease
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {patient.disease}
                  </p>
                </div>

              </div>

            </div>


            <div className="bg-white rounded-2xl shadow-sm p-6">

              <div className="flex items-center gap-3">

                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                    patient.risk === "High"
                      ? "bg-red-100"
                      : patient.risk === "Medium"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  <AlertTriangle
                    size={21}
                    className={
                      patient.risk === "High"
                        ? "text-red-600"
                        : patient.risk === "Medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Current Risk
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {patient.risk}
                  </p>
                </div>

              </div>

            </div>


            <div className="bg-white rounded-2xl shadow-sm p-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle
                    size={21}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Status
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {patient.status}
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* ADMISSION */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Admission Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your latest admission record
                </p>
              </div>

            </div>

            <p className="text-gray-700">
              <span className="font-medium">
                Admission Date:
              </span>{" "}
              {patient.admission_date || "Not available"}
            </p>

            {patient.notes && (
              <p className="text-gray-700 mt-4">
                <span className="font-medium">
                  Notes:
                </span>{" "}
                {patient.notes}
              </p>
            )}

          </div>

        </div>
      )}

    </MainLayout>
  );
}

export default MyHealth;