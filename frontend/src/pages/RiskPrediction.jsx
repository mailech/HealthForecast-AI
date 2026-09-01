import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  FaHeartbeat,
  FaRobot,
  FaChartLine,
  FaClipboardCheck,
} from "react-icons/fa";

function RiskPrediction() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "Male",
    blood_pressure: "Normal",
    cholesterol: "",
    bmi: "",
    diabetes: "No",
    hypertension: "No",
    medication_count: "",
    length_of_stay: "",
    discharge_destination: "Home",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // HANDLE FORM INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // PREDICT RISK
  // =====================================================

  const predictRisk = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/predict-risk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age: Number(formData.age),

            gender: formData.gender,

            blood_pressure:
              formData.blood_pressure,

            cholesterol:
              Number(formData.cholesterol),

            bmi:
              Number(formData.bmi),

            diabetes:
              formData.diabetes,

            hypertension:
              formData.hypertension,

            medication_count:
              Number(formData.medication_count),

            length_of_stay:
              Number(formData.length_of_stay),

            discharge_destination:
              formData.discharge_destination,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Risk prediction failed."
        );
      }

      setResult(data);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to the backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RISK LEVEL
  // =====================================================

  const getRiskLevel = () => {
    if (!result) {
      return {
        text: "",
        color: "",
        bg: "",
      };
    }

    if (result.risk_level === "HIGH") {
      return {
        text: "High Risk",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    }

    if (result.risk_level === "MEDIUM") {
      return {
        text: "Medium Risk",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    }

    return {
      text: "Low Risk",
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const isFormValid =
    formData.age &&
    formData.cholesterol &&
    formData.bmi &&
    formData.medication_count &&
    formData.length_of_stay;

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-8">
        Patient Risk Prediction
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* =================================================
            PREDICTION FORM
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Enter Patient Details
          </h2>

          <div className="space-y-4">

            {/* AGE */}

            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              min="1"
              max="120"
              className="w-full border rounded-lg p-3"
            />

            {/* GENDER */}

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>
            </select>

            {/* BLOOD PRESSURE */}

            <select
              name="blood_pressure"
              value={formData.blood_pressure}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="Normal">
                Normal Blood Pressure
              </option>

              <option value="High">
                High Blood Pressure
              </option>

              <option value="Low">
                Low Blood Pressure
              </option>
            </select>

            {/* CHOLESTEROL */}

            <input
              type="number"
              name="cholesterol"
              value={formData.cholesterol}
              onChange={handleChange}
              placeholder="Cholesterol"
              min="0"
              className="w-full border rounded-lg p-3"
            />

            {/* BMI */}

            <input
              type="number"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              placeholder="BMI"
              min="0"
              step="0.1"
              className="w-full border rounded-lg p-3"
            />

            {/* DIABETES */}

            <select
              name="diabetes"
              value={formData.diabetes}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="No">
                Diabetes: No
              </option>

              <option value="Yes">
                Diabetes: Yes
              </option>
            </select>

            {/* HYPERTENSION */}

            <select
              name="hypertension"
              value={formData.hypertension}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="No">
                Hypertension: No
              </option>

              <option value="Yes">
                Hypertension: Yes
              </option>
            </select>

            {/* MEDICATION COUNT */}

            <input
              type="number"
              name="medication_count"
              value={formData.medication_count}
              onChange={handleChange}
              placeholder="Number of Medications"
              min="0"
              className="w-full border rounded-lg p-3"
            />

            {/* LENGTH OF STAY */}

            <input
              type="number"
              name="length_of_stay"
              value={formData.length_of_stay}
              onChange={handleChange}
              placeholder="Length of Hospital Stay (Days)"
              min="1"
              className="w-full border rounded-lg p-3"
            />

            {/* DISCHARGE DESTINATION */}

            <select
              name="discharge_destination"
              value={
                formData.discharge_destination
              }
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="Home">
                Home
              </option>

              <option value="Home Health">
                Home Health
              </option>

              <option value="Skilled Nursing Facility">
                Skilled Nursing Facility
              </option>

              <option value="Rehabilitation">
                Rehabilitation
              </option>
            </select>

            {/* ERROR */}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              onClick={predictRisk}
              disabled={!isFormValid || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl"
            >
              {loading
                ? "Analyzing Patient..."
                : "Predict Risk"}
            </button>

          </div>
        </div>


        {/* =================================================
            RESULT
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            AI Risk Prediction
          </h2>

          {!result ? (

            <div className="text-center py-20">

              <FaRobot className="text-6xl mx-auto text-blue-600" />

              <p className="mt-6 text-gray-500">
                Enter patient information and
                click Predict Risk.
              </p>

            </div>

          ) : (

            <>

              {/* RISK SCORE */}

              <div className="flex justify-center">

                <div
                  className={`
                    w-44
                    h-44
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-4xl
                    font-bold
                    ${getRiskLevel().bg}
                  `}
                >
                  {result.risk_score}%
                </div>

              </div>


              {/* RISK LEVEL */}

              <div className="text-center mt-6">

                <h2
                  className={`
                    text-3xl
                    font-bold
                    ${getRiskLevel().color}
                  `}
                >
                  {getRiskLevel().text}
                </h2>

              </div>


              {/* DETAILS */}

              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">

                  <FaHeartbeat className="text-red-500" />

                  <p>
                    Readmission Risk:
                    <strong>
                      {" "}
                      {result.risk_score}%
                    </strong>
                  </p>

                </div>


                <div className="flex items-center gap-3">

                  <FaChartLine className="text-green-600" />

                  <p>
                    Prediction:
                    <strong>
                      {" "}
                      {result.prediction}
                    </strong>
                  </p>

                </div>

              </div>


              {/* AI RECOMMENDATION */}

              <div className="mt-8 bg-blue-50 rounded-xl p-5">

                <div className="flex items-center gap-2 mb-4">

                  <FaClipboardCheck className="text-blue-600" />

                  <h3 className="font-bold text-blue-700">
                    AI Recommendation
                  </h3>

                </div>


                {result.risk_level === "HIGH" ? (

                  <ul className="list-disc pl-5 space-y-2">

                    <li>
                      Schedule an early follow-up.
                    </li>

                    <li>
                      Closely monitor the patient.
                    </li>

                    <li>
                      Review medication adherence.
                    </li>

                    <li>
                      Consider additional post-discharge support.
                    </li>

                  </ul>

                ) : result.risk_level === "MEDIUM" ? (

                  <ul className="list-disc pl-5 space-y-2">

                    <li>
                      Schedule regular follow-up.
                    </li>

                    <li>
                      Monitor medication adherence.
                    </li>

                    <li>
                      Continue appropriate lifestyle management.
                    </li>

                  </ul>

                ) : (

                  <ul className="list-disc pl-5 space-y-2">

                    <li>
                      Continue the planned treatment.
                    </li>

                    <li>
                      Follow the routine healthcare schedule.
                    </li>

                    <li>
                      Maintain healthy lifestyle practices.
                    </li>

                  </ul>

                )}

              </div>


              {/* MODEL INFORMATION */}

              <div className="mt-6 text-xs text-gray-400 text-center">

                Risk score generated using the
                trained hospital readmission ML model.

              </div>

            </>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}

export default RiskPrediction;