import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  FaHeartbeat,
  FaRobot,
  FaChartLine,
} from "react-icons/fa";

function RiskPrediction() {
  const [risk, setRisk] = useState(null);

  const predictRisk = () => {
    // Dummy Prediction (Backend integration later)
    const score = Math.floor(Math.random() * 100);
    setRisk(score);
  };

  const getRiskLevel = () => {
    if (risk >= 70)
      return {
        text: "High Risk",
        color: "text-red-600",
        bg: "bg-red-100",
      };

    if (risk >= 40)
      return {
        text: "Medium Risk",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };

    return {
      text: "Low Risk",
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-8">
        Patient Risk Prediction
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Prediction Form */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Enter Patient Details
          </h2>

          <div className="space-y-5">

            <input
              type="number"
              placeholder="Age"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Blood Pressure"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Heart Rate"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Glucose Level"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="BMI"
              className="w-full border rounded-lg p-3"
            />

            <select className="w-full border rounded-lg p-3">
              <option>Diabetes</option>
              <option>Heart Disease</option>
              <option>Asthma</option>
              <option>Hypertension</option>
            </select>

            <button
              onClick={predictRisk}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              Predict Risk
            </button>

          </div>

        </div>

        {/* Result */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            AI Prediction
          </h2>

          {!risk ? (

            <div className="text-center py-20">

              <FaRobot className="text-6xl mx-auto text-blue-600" />

              <p className="mt-6 text-gray-500">
                Prediction result will appear here.
              </p>

            </div>

          ) : (

            <>

              <div className="flex justify-center">

                <div
                  className={`w-44 h-44 rounded-full flex items-center justify-center text-4xl font-bold ${getRiskLevel().bg}`}
                >
                  {risk}%
                </div>

              </div>

              <div className="text-center mt-6">

                <h2
                  className={`text-3xl font-bold ${getRiskLevel().color}`}
                >
                  {getRiskLevel().text}
                </h2>

              </div>

              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">

                  <FaHeartbeat className="text-red-500" />

                  <p>
                    Readmission Probability :
                    <strong> {risk}%</strong>
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <FaChartLine className="text-green-600" />

                  <p>
                    Recovery Chance :
                    <strong> {100 - risk}%</strong>
                  </p>

                </div>

              </div>

              <div className="mt-8 bg-blue-50 rounded-xl p-5">

                <h3 className="font-bold text-blue-700 mb-3">
                  AI Recommendation
                </h3>

                {risk >= 70 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Immediate medical supervision.</li>
                    <li>Schedule follow-up within 3 days.</li>
                    <li>Monitor vitals daily.</li>
                    <li>Review medication plan.</li>
                  </ul>
                ) : risk >= 40 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Regular health monitoring.</li>
                    <li>Weekly follow-up.</li>
                    <li>Maintain healthy lifestyle.</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Continue current treatment.</li>
                    <li>Routine monthly check-up.</li>
                    <li>Maintain balanced diet.</li>
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

export default RiskPrediction;