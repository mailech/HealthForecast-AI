import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  FaHospital,
  FaCalendarAlt,
  FaRobot,
  FaClipboardCheck,
} from "react-icons/fa";

function Readmission() {
  const [probability, setProbability] = useState(null);

  const predictReadmission = () => {
    // Dummy prediction (replace with backend API later)
    const score = Math.floor(Math.random() * 100);
    setProbability(score);
  };

  const getStatus = () => {
    if (probability >= 70)
      return {
        text: "High Chance",
        color: "text-red-600",
        bg: "bg-red-100",
      };

    if (probability >= 40)
      return {
        text: "Moderate Chance",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };

    return {
      text: "Low Chance",
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-8">
        Hospital Readmission Prediction
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Input Form */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Patient Information
          </h2>

          <div className="space-y-5">

            <input
              type="text"
              placeholder="Patient Name"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Age"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Days Since Discharge"
              className="w-full border rounded-lg p-3"
            />

            <select className="w-full border rounded-lg p-3">
              <option>Heart Disease</option>
              <option>Diabetes</option>
              <option>Asthma</option>
              <option>Hypertension</option>
            </select>

            <select className="w-full border rounded-lg p-3">
              <option>Recovered</option>
              <option>Stable</option>
              <option>Critical</option>
            </select>

            <button
              onClick={predictReadmission}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              Predict Readmission
            </button>

          </div>

        </div>

        {/* Prediction Result */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Prediction Result
          </h2>

          {!probability ? (

            <div className="text-center py-20">

              <FaRobot className="text-6xl mx-auto text-blue-600" />

              <p className="mt-5 text-gray-500">
                Prediction result will appear here.
              </p>

            </div>

          ) : (

            <>

              <div className="flex justify-center">

                <div
                  className={`w-44 h-44 rounded-full flex items-center justify-center text-4xl font-bold ${getStatus().bg}`}
                >
                  {probability}%
                </div>

              </div>

              <h2
                className={`text-center text-3xl font-bold mt-6 ${getStatus().color}`}
              >
                {getStatus().text}
              </h2>

              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">
                  <FaHospital className="text-red-500" />
                  <p>
                    Readmission Probability:
                    <strong> {probability}%</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-500" />
                  <p>
                    Suggested Follow-up:
                    <strong>
                      {probability >= 70
                        ? " Within 3 Days"
                        : probability >= 40
                        ? " Within 1 Week"
                        : " Monthly"}
                    </strong>
                  </p>
                </div>

              </div>

              {/* Recommendation */}

              <div className="mt-8 bg-blue-50 rounded-xl p-5">

                <div className="flex items-center gap-2 mb-4">

                  <FaClipboardCheck className="text-blue-600" />

                  <h3 className="font-bold text-blue-700">
                    Recommended Actions
                  </h3>

                </div>

                {probability >= 70 ? (
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Schedule immediate follow-up.</li>
                    <li>Monitor vitals every day.</li>
                    <li>Review discharge medication.</li>
                    <li>Provide home healthcare support.</li>
                  </ul>
                ) : probability >= 40 ? (
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Weekly follow-up visit.</li>
                    <li>Diet and exercise monitoring.</li>
                    <li>Medication adherence check.</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Continue current treatment.</li>
                    <li>Routine monthly health check.</li>
                    <li>Maintain healthy lifestyle.</li>
                  </ul>
                )}

              </div>

            </>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Readmission;