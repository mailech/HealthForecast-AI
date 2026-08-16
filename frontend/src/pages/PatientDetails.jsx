import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { patients } from "../data/dummyData";
import {
  FaArrowLeft,
  FaUser,
  FaHeartbeat,
  FaNotesMedical,
  FaFileMedical,
} from "react-icons/fa";

function PatientDetails() {
  const { id } = useParams();

  const patient = patients.find((p) => p.id === Number(id));

  if (!patient) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-red-600">
          Patient Not Found
        </h1>
      </DashboardLayout>
    );
  }

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
              Patient ID : {patient.id}
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

            <p><strong>Age :</strong> {patient.age}</p>

            <p><strong>Disease :</strong> {patient.disease}</p>

            <p><strong>Status :</strong> {patient.status}</p>

            <p><strong>Risk Level :</strong> {patient.risk}</p>

            <p><strong>Gender :</strong> Male</p>

            <p><strong>Blood Group :</strong> O+</p>

          </div>

        </div>

        {/* Vital Signs */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex items-center gap-3 mb-5">

            <FaHeartbeat className="text-red-500 text-2xl" />

            <h2 className="text-xl font-bold">
              Vital Signs
            </h2>

          </div>

          <div className="space-y-3">

            <p>❤️ Heart Rate : 82 bpm</p>

            <p>🩸 Blood Pressure : 120 / 80</p>

            <p>🌡 Temperature : 98.6°F</p>

            <p>🫁 Oxygen Level : 98%</p>

            <p>⚖ Weight : 68 kg</p>

            <p>📏 Height : 170 cm</p>

          </div>

        </div>

      </div>

      {/* Medical History */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <div className="flex items-center gap-3 mb-5">

          <FaNotesMedical className="text-blue-600 text-2xl"/>

          <h2 className="text-xl font-bold">
            Medical History
          </h2>

        </div>

        <ul className="list-disc pl-6 space-y-2">

          <li>Hypertension since 2018</li>

          <li>Diabetes Mellitus Type-II</li>

          <li>No previous surgeries</li>

          <li>Allergy to Penicillin</li>

        </ul>

      </div>

      {/* AI Prediction */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <div className="flex items-center gap-3 mb-5">

          <FaFileMedical className="text-green-600 text-2xl"/>

          <h2 className="text-xl font-bold">
            AI Prediction Report
          </h2>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-red-50 rounded-xl p-5">

            <h3 className="font-bold">
              Readmission Risk
            </h3>

            <p className="text-3xl text-red-600 font-bold mt-3">
              82%
            </p>

          </div>

          <div className="bg-yellow-50 rounded-xl p-5">

            <h3 className="font-bold">
              Recovery Chance
            </h3>

            <p className="text-3xl text-yellow-600 font-bold mt-3">
              70%
            </p>

          </div>

          <div className="bg-green-50 rounded-xl p-5">

            <h3 className="font-bold">
              Overall Health
            </h3>

            <p className="text-3xl text-green-600 font-bold mt-3">
              Stable
            </p>

          </div>

        </div>

      </div>

      {/* Recent Reports */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <h2 className="text-xl font-bold mb-5">
          Recent Reports
        </h2>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Date</th>

              <th className="p-3 text-left">Report</th>

              <th className="p-3 text-left">Doctor</th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-b">

              <td className="p-3">12-07-2026</td>

              <td className="p-3">Blood Test</td>

              <td className="p-3">Dr. Kumar</td>

            </tr>

            <tr className="border-b">

              <td className="p-3">15-07-2026</td>

              <td className="p-3">ECG</td>

              <td className="p-3">Dr. Reddy</td>

            </tr>

            <tr>

              <td className="p-3">18-07-2026</td>

              <td className="p-3">Chest X-Ray</td>

              <td className="p-3">Dr. Sharma</td>

            </tr>

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}

export default PatientDetails;