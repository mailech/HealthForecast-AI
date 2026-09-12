import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  FaHeartbeat,
  FaRobot,
  FaClipboardCheck,
} from "react-icons/fa";

function RiskPrediction() {
  const [formData, setFormData] = useState({
    age: "[60-70)",
    gender: "Male",
    number_diagnoses: "5",
    diabetesmed: "Yes",
    insulin: "No",
    max_glu_serum: "None",
    a1cresult: "None",
    change: "No",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const predictRisk = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const payload = {
        age: formData.age,
        gender: formData.gender,
        number_diagnoses: Number(formData.number_diagnoses),
        diabetesmed: formData.diabetesmed,
        insulin: formData.insulin,
        max_glu_serum: formData.max_glu_serum,
        a1cresult: formData.a1cresult,
        change: formData.change,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/predict-risk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(
            data.detail.map((x) => x.msg).join(", ")
          );
        }

        throw new Error(
          data.detail || "Risk prediction failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskStyle = () => {
    const level = String(
      result?.risk_level || ""
    ).toUpperCase();

    if (level === "HIGH") {
      return {
        title: "High Risk",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    }

    if (level === "MEDIUM") {
      return {
        title: "Medium Risk",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    }

    return {
      title: "Low Risk",
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  const style = getRiskStyle();

  const inputClass =
    "w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  const labelClass =
    "block text-sm font-medium text-gray-600 mb-1";

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-2">
        Patient Risk Prediction
      </h1>

      <p className="text-gray-500 mb-6">
        Evaluate the patient's current condition and
        estimate their readmission risk.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* INPUT */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-6">
            Current Patient Condition
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className={labelClass}>
                Age Group
              </label>

              <select
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="[0-10)">0–10</option>
                <option value="[10-20)">10–20</option>
                <option value="[20-30)">20–30</option>
                <option value="[30-40)">30–40</option>
                <option value="[40-50)">40–50</option>
                <option value="[50-60)">50–60</option>
                <option value="[60-70)">60–70</option>
                <option value="[70-80)">70–80</option>
                <option value="[80-90)">80–90</option>
                <option value="[90-100)">90–100</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Number of Diagnoses
              </label>

              <input
                type="number"
                name="number_diagnoses"
                value={formData.number_diagnoses}
                onChange={handleChange}
                min="1"
                max="16"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Diabetes Medication
              </label>

              <select
                name="diabetesmed"
                value={formData.diabetesmed}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Insulin Status
              </label>

              <select
                name="insulin"
                value={formData.insulin}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="No">No</option>
                <option value="Steady">Steady</option>
                <option value="Up">Increased</option>
                <option value="Down">Decreased</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Maximum Glucose
              </label>

              <select
                name="max_glu_serum"
                value={formData.max_glu_serum}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="None">Not Tested</option>
                <option value="Norm">Normal</option>
                <option value=">200">&gt;200</option>
                <option value=">300">&gt;300</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                HbA1c
              </label>

              <select
                name="a1cresult"
                value={formData.a1cresult}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="None">Not Tested</option>
                <option value="Norm">Normal</option>
                <option value=">7">&gt;7</option>
                <option value=">8">&gt;8</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Medication Changed
              </label>

              <select
                name="change"
                value={formData.change}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="No">No</option>
                <option value="Ch">Yes</option>
              </select>
            </div>

          </div>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={predictRisk}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
          >
            {loading
              ? "Analyzing Patient..."
              : "Predict Risk"}
          </button>

        </div>

        {/* RESULT */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-6">
            AI Risk Assessment
          </h2>

          {!result ? (

            <div className="text-center py-20">

              <FaRobot className="text-6xl mx-auto text-blue-600" />

              <p className="mt-6 text-gray-500">
                Enter the patient's current condition
                <br />
                and click <strong>Predict Risk</strong>.
              </p>

            </div>

          ) : (

            <>
              <div className="flex justify-center">

                <div
                  className={`w-44 h-44 rounded-full flex items-center justify-center text-4xl font-bold ${style.bg}`}
                >
                  {result.risk_score}%
                </div>

              </div>

              <h2
                className={`text-center text-3xl font-bold mt-6 ${style.color}`}
              >
                {style.title}
              </h2>

              <p className="text-center text-gray-500 mt-2">
                Patient Risk Score
              </p>

              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">
                  <FaHeartbeat className="text-red-500" />

                  <p>
                    Risk Score:
                    <strong>
                      {" "}
                      {result.risk_score}%
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <FaRobot className="text-blue-500" />

                  <p>
                    Assessment:
                    <strong>
                      {" "}
                      {result.prediction}
                    </strong>
                  </p>
                </div>

              </div>

              <div className="mt-8 bg-blue-50 rounded-xl p-5">

                <div className="flex items-center gap-2 mb-4">

                  <FaClipboardCheck className="text-blue-600" />

                  <h3 className="font-bold text-blue-700">
                    Recommended Actions
                  </h3>

                </div>

                {String(
                  result.risk_level
                ).toUpperCase() === "HIGH" ? (

                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      Closely monitor the patient.
                    </li>
                    <li>
                      Review current treatment and medications.
                    </li>
                    <li>
                      Consider early follow-up planning.
                    </li>
                  </ul>

                ) : String(
                    result.risk_level
                  ).toUpperCase() === "MEDIUM" ? (

                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      Continue monitoring the patient.
                    </li>
                    <li>
                      Review medication adherence.
                    </li>
                    <li>
                      Plan regular follow-up.
                    </li>
                  </ul>

                ) : (

                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      Continue the planned treatment.
                    </li>
                    <li>
                      Maintain routine monitoring.
                    </li>
                    <li>
                      Follow the regular healthcare schedule.
                    </li>
                  </ul>

                )}

              </div>

              <p className="text-xs text-gray-400 text-center mt-6">
                Powered by the trained Diabetes 130-US
                Hospitals Random Forest model.
              </p>

            </>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}

export default RiskPrediction;