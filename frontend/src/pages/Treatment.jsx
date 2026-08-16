import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  FaPills,
  FaUserMd,
  FaCalendarCheck,
  FaNotesMedical,
  FaCheckCircle,
} from "react-icons/fa";

function Treatment() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-8">
        Treatment Management
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Treatment Form */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Treatment Plan
          </h2>

          <div className="space-y-5">

            <input
              type="text"
              placeholder="Patient Name"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="Diagnosis"
              className="w-full border rounded-lg p-3"
            />

            <textarea
              rows="4"
              placeholder="Prescribed Medicines"
              className="w-full border rounded-lg p-3"
            />

            <textarea
              rows="4"
              placeholder="Doctor Recommendations"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="date"
              className="w-full border rounded-lg p-3"
            />

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              Save Treatment Plan
            </button>

          </div>

          {saved && (
            <div className="mt-5 bg-green-100 text-green-700 rounded-lg p-3 flex items-center gap-2">
              <FaCheckCircle />
              Treatment plan saved successfully.
            </div>
          )}

        </div>

        {/* Summary */}

        <div className="space-y-6">

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3">

              <FaPills className="text-blue-600 text-2xl" />

              <h2 className="text-xl font-bold">
                Medication
              </h2>

            </div>

            <ul className="list-disc pl-6 mt-4 space-y-2">

              <li>Metformin 500 mg</li>
              <li>Aspirin 75 mg</li>
              <li>Vitamin D Supplement</li>

            </ul>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3">

              <FaUserMd className="text-green-600 text-2xl" />

              <h2 className="text-xl font-bold">
                Doctor Advice
              </h2>

            </div>

            <ul className="list-disc pl-6 mt-4 space-y-2">

              <li>Maintain healthy diet.</li>
              <li>Exercise 30 minutes daily.</li>
              <li>Monitor blood pressure regularly.</li>

            </ul>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3">

              <FaCalendarCheck className="text-orange-500 text-2xl" />

              <h2 className="text-xl font-bold">
                Follow-up
              </h2>

            </div>

            <p className="mt-4 text-gray-600">
              Next appointment scheduled after
              <strong> 7 days.</strong>
            </p>

          </div>

        </div>

      </div>

      {/* Recovery Tracker */}

      <div className="bg-white rounded-xl shadow p-8 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <FaNotesMedical className="text-red-500 text-2xl" />

          <h2 className="text-xl font-bold">
            Recovery Progress
          </h2>

        </div>

        <div className="space-y-6">

          <div>

            <div className="flex justify-between mb-2">
              <span>Overall Recovery</span>
              <span>80%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: "80%" }}
              />

            </div>

          </div>

          <div>

            <div className="flex justify-between mb-2">
              <span>Medication Compliance</span>
              <span>92%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: "92%" }}
              />

            </div>

          </div>

          <div>

            <div className="flex justify-between mb-2">
              <span>Vital Stability</span>
              <span>75%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-yellow-500 h-4 rounded-full"
                style={{ width: "75%" }}
              />

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Treatment;