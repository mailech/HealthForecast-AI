import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

import {
  FaArrowLeft,
  FaUser,
  FaHeartbeat,
  FaNotesMedical,
  FaFileMedical,
} from "react-icons/fa";

function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userRole = user?.role;

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/patients/${id}`
      );

      setPatient(response.data);
    } catch (error) {
      console.error(
        "Error fetching patient:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        setError(
          "You do not have permission to view this patient."
        );
      } else if (error.response?.status === 404) {
        setError("Patient not found.");
      } else {
        setError(
          "Unable to load patient details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-gray-500">
            Loading patient details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Unable to Load Patient
          </h1>

          <p className="text-gray-500 mt-3">
            {error}
          </p>

          <Link
            to="/patients"
            className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            <FaArrowLeft />
            Back to Patients
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-red-600">
          Patient Not Found
        </h1>
      </DashboardLayout>
    );
  }

  const patientId =
    patient.id || patient._id;

  return (
    <DashboardLayout>

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <Link
            to="/patients"
            className="flex items-center gap-2 text-blue-600 mb-4"
          >
            <FaArrowLeft />
            Back to Patients
          </Link>

          <h1 className="text-3xl font-bold">
            Patient Details
          </h1>

          <p className="text-gray-500 mt-1">
            {userRole === "Doctor"
              ? "Assigned patient information"
              : "Patient information"}
          </p>

        </div>

      </div>

      {/* Profile Card */}

      <div className="bg-white rounded-xl shadow p-8">

        <div className="flex items-center gap-6">

          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">

            <FaUser className="text-5xl text-blue-600" />

          </div>

          <div>

            <h2 className="text-3xl font-bold">
              {patient.name}
            </h2>

            <p className="text-gray-500">
              Patient ID : {patientId}
            </p>

          </div>

        </div>

      </div>

      {/* Basic Information */}

      <div className="grid lg:grid-cols-2 gap-8 mt-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-5">
            Basic Information
          </h2>

          <div className="space-y-3">

            <p>
              <strong>Age :</strong>{" "}
              {patient.age ?? "Not available"}
            </p>

            <p>
              <strong>Disease :</strong>{" "}
              {patient.disease ?? "Not available"}
            </p>

            <p>
              <strong>Status :</strong>{" "}
              {patient.status ?? "Not available"}
            </p>

            <p>
              <strong>Risk Level :</strong>{" "}
              {patient.risk ?? "Not available"}
            </p>

            <p>
              <strong>Gender :</strong>{" "}
              {patient.gender ?? "Not available"}
            </p>

            <p>
              <strong>Blood Pressure :</strong>{" "}
              {patient.blood_pressure ??
                "Not available"}
            </p>

            <p>
              <strong>Cholesterol :</strong>{" "}
              {patient.cholesterol ??
                "Not available"}
            </p>

            <p>
              <strong>BMI :</strong>{" "}
              {patient.bmi ?? "Not available"}
            </p>

          </div>

        </div>

        {/* Clinical Information */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex items-center gap-3 mb-5">

            <FaHeartbeat className="text-red-500 text-2xl" />

            <h2 className="text-xl font-bold">
              Clinical Information
            </h2>

          </div>

          <div className="space-y-3">

            <p>
              <strong>Diabetes :</strong>{" "}
              {patient.diabetes ??
                "Not available"}
            </p>

            <p>
              <strong>Hypertension :</strong>{" "}
              {patient.hypertension ??
                "Not available"}
            </p>

            <p>
              <strong>Medication Count :</strong>{" "}
              {patient.medication_count ??
                "Not available"}
            </p>

            <p>
              <strong>Length of Stay :</strong>{" "}
              {patient.length_of_stay ??
                "Not available"}
            </p>

            <p>
              <strong>Discharge Destination :</strong>{" "}
              {patient.discharge_destination ??
                "Not available"}
            </p>

          </div>

        </div>

      </div>

      {/* Medical History */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <div className="flex items-center gap-3 mb-5">

          <FaNotesMedical className="text-blue-600 text-2xl" />

          <h2 className="text-xl font-bold">
            Medical History
          </h2>

        </div>

        <p className="text-gray-600">
          Medical history details are displayed
          when available in the patient's record.
        </p>

        {patient.medical_history ? (
          <p className="mt-4">
            {patient.medical_history}
          </p>
        ) : (
          <p className="mt-4 text-gray-500">
            No medical history recorded.
          </p>
        )}

      </div>

      {/* AI Prediction */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <div className="flex items-center gap-3 mb-5">

          <FaFileMedical className="text-green-600 text-2xl" />

          <h2 className="text-xl font-bold">
            AI Prediction Report
          </h2>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-blue-50 rounded-xl p-5">

            <h3 className="font-bold">
              Readmission Risk
            </h3>

            <p className="text-2xl font-bold mt-3">
              {patient.readmission_probability !==
              undefined
                ? `${(
                    patient.readmission_probability *
                    100
                  ).toFixed(1)}%`
                : patient.risk ||
                  "Not available"}
            </p>

          </div>

          <div className="bg-yellow-50 rounded-xl p-5">

            <h3 className="font-bold">
              Prediction Status
            </h3>

            <p className="text-2xl font-bold mt-3">
              {patient.prediction ??
                "Not available"}
            </p>

          </div>

          <div className="bg-green-50 rounded-xl p-5">

            <h3 className="font-bold">
              Risk Category
            </h3>

            <p className="text-2xl font-bold mt-3">
              {patient.risk ||
                "Not available"}
            </p>

          </div>

        </div>

      </div>

      {/* Reports */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <h2 className="text-xl font-bold mb-5">
          Recent Reports
        </h2>

        {patient.reports &&
        patient.reports.length > 0 ? (

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-3 text-left">
                  Date
                </th>

                <th className="p-3 text-left">
                  Report
                </th>

                <th className="p-3 text-left">
                  Doctor
                </th>

              </tr>

            </thead>

            <tbody>

              {patient.reports.map(
                (report, index) => (

                  <tr
                    key={report.id || index}
                    className="border-b"
                  >

                    <td className="p-3">
                      {report.date ||
                        "Not available"}
                    </td>

                    <td className="p-3">
                      {report.report ||
                        report.type ||
                        "Report"}
                    </td>

                    <td className="p-3">
                      {report.doctor ||
                        "Not available"}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        ) : (

          <p className="text-gray-500">
            No reports available for this patient.
          </p>

        )}

      </div>

    </DashboardLayout>
  );
}

export default PatientDetails;