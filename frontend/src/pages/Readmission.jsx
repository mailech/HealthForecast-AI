import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  FaHospital,
  FaCalendarAlt,
  FaRobot,
  FaClipboardCheck,
  FaChartLine,
  FaUserInjured,
  FaExclamationTriangle,
} from "react-icons/fa";

function Readmission() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const role = user?.role;
  const [readmissionStats, setReadmissionStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    // Only Hospital Administrator needs hospital-wide statistics
    if (role !== "Hospital Administrator") {
      return;
    }

    const fetchReadmissionStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          "http://127.0.0.1:8000/api/analytics/hospital/readmission",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          throw new Error(
            "Session expired. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to load readmission statistics."
          );
        }

        setReadmissionStats(data);
      } catch (err) {
        console.error(err);

        setStatsError(
          err.message ||
            "Unable to connect to backend."
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchReadmissionStats();
  }, [role]);

  // =========================================================
  // DOCTOR READMISSION PREDICTION
  // =========================================================

  const [formData, setFormData] = useState({
    number_inpatient: "0",
    number_emergency: "0",
    number_outpatient: "0",

    time_in_hospital: "3",
    num_procedures: "1",
    num_lab_procedures: "40",
    num_medications: "10",

    number_diagnoses: "5",

    diabetesmed: "Yes",
    insulin: "No",
    change: "No",

    max_glu_serum: "None",
    a1cresult: "None",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const predictReadmission = async () => {
    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const payload = {
        number_inpatient: Number(
          formData.number_inpatient
        ),

        number_emergency: Number(
          formData.number_emergency
        ),

        number_outpatient: Number(
          formData.number_outpatient
        ),

        time_in_hospital: Number(
          formData.time_in_hospital
        ),

        num_procedures: Number(
          formData.num_procedures
        ),

        num_lab_procedures: Number(
          formData.num_lab_procedures
        ),

        num_medications: Number(
          formData.num_medications
        ),

        number_diagnoses: Number(
          formData.number_diagnoses
        ),

        diabetesmed: formData.diabetesmed,

        insulin: formData.insulin,

        change: formData.change,

        max_glu_serum: formData.max_glu_serum,

        a1cresult: formData.a1cresult,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/predict-readmission",
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

        throw new Error(
          "Session expired. Please log in again."
        );
      }

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(
            data.detail.map((x) => x.msg).join(", ")
          );
        }

        throw new Error(
          data.detail ||
            "Readmission prediction failed."
        );
      }

      setPrediction(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DOCTOR PREDICTION STATUS
  // =========================================================

  const getStatus = () => {
    const level = String(
      prediction?.risk_level || ""
    ).toUpperCase();

    if (level === "HIGH") {
      return {
        text: "High Chance",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    }

    if (level === "MEDIUM") {
      return {
        text: "Moderate Chance",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    }

    return {
      text: "Low Chance",
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  const status = getStatus();

  // =========================================================
  // HOSPITAL ADMINISTRATOR VIEW
  // =========================================================

  if (role === "Hospital Administrator") {
    return (
      <DashboardLayout>
        <div className="p-6">

          {/* HEADER */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Hospital Readmission Statistics
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor overall hospital readmission
              statistics and patient outcomes.
            </p>
          </div>

          {/* ERROR */}

          {statsError && (
            <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {statsError}
            </div>
          )}

          {/* LOADING */}

          {statsLoading ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <p className="text-gray-500">
                Loading hospital readmission statistics...
              </p>
            </div>
          ) : readmissionStats ? (
            <>
              {/* =================================================
                  SUMMARY CARDS
              ================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* TOTAL PATIENTS */}

                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-gray-500">
                        Total Patients
                      </p>

                      <h2 className="text-3xl font-bold text-slate-800 mt-2">
                        {readmissionStats.total_patients ?? 0}
                      </h2>
                    </div>

                    <FaUserInjured className="text-blue-500 text-3xl" />

                  </div>
                </div>

                {/* READMITTED */}

                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-gray-500">
                        Readmitted Patients
                      </p>

                      <h2 className="text-3xl font-bold text-slate-800 mt-2">
                        {readmissionStats.readmitted_patients ?? 0}
                      </h2>
                    </div>

                    <FaHospital className="text-red-500 text-3xl" />

                  </div>
                </div>

                {/* READMISSION RATE */}

                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-gray-500">
                        Readmission Rate
                      </p>

                      <h2 className="text-3xl font-bold text-slate-800 mt-2">
                        {readmissionStats.readmission_rate ?? 0}%
                      </h2>
                    </div>

                    <FaChartLine className="text-purple-500 text-3xl" />

                  </div>
                </div>

                {/* 30 DAY */}

                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-gray-500">
                        30-Day Readmissions
                      </p>

                      <h2 className="text-3xl font-bold text-slate-800 mt-2">
                        {readmissionStats.readmitted_within_30_days ?? 0}
                      </h2>
                    </div>

                    <FaCalendarAlt className="text-orange-500 text-3xl" />

                  </div>
                </div>

              </div>

              {/* =================================================
                  READMISSION OVERVIEW
              ================================================= */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                <div className="bg-white rounded-xl shadow p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <FaHospital className="text-blue-600 text-xl" />

                    <h2 className="text-xl font-bold text-slate-800">
                      Overall Readmission Overview
                    </h2>

                  </div>

                  <div className="space-y-5">

                    <div className="flex justify-between items-center border-b pb-4">
                      <span className="text-gray-600">
                        Total Admissions
                      </span>

                      <strong className="text-slate-800">
                        {readmissionStats.total_admissions ?? 0}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center border-b pb-4">
                      <span className="text-gray-600">
                        Readmitted Patients
                      </span>

                      <strong className="text-red-600">
                        {readmissionStats.readmitted_patients ?? 0}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center border-b pb-4">
                      <span className="text-gray-600">
                        Not Readmitted
                      </span>

                      <strong className="text-green-600">
                        {readmissionStats.not_readmitted_patients ?? 0}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        30-Day Readmissions
                      </span>

                      <strong className="text-orange-600">
                        {readmissionStats.readmitted_within_30_days ?? 0}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* =================================================
                    RISK DISTRIBUTION
                ================================================= */}

                <div className="bg-white rounded-xl shadow p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <FaExclamationTriangle className="text-red-500 text-xl" />

                    <h2 className="text-xl font-bold text-slate-800">
                      Patient Risk Distribution
                    </h2>

                  </div>

                  <div className="space-y-5">

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        High Risk
                      </span>

                      <strong className="text-red-600">
                        {readmissionStats.high_risk ?? 0}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Medium Risk
                      </span>

                      <strong className="text-yellow-600">
                        {readmissionStats.medium_risk ?? 0}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Low Risk
                      </span>

                      <strong className="text-green-600">
                        {readmissionStats.low_risk ?? 0}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  READMISSION BY CATEGORY
              ================================================= */}

              <div className="bg-white rounded-xl shadow p-6 mt-8">

                <div className="flex items-center gap-3 mb-6">

                  <FaChartLine className="text-blue-600 text-xl" />

                  <h2 className="text-xl font-bold text-slate-800">
                    Readmission Statistics
                  </h2>

                </div>

                {readmissionStats.readmission_distribution &&
                Object.keys(
                  readmissionStats.readmission_distribution
                ).length > 0 ? (

                  <div className="space-y-3">

                    {Object.entries(
                      readmissionStats.readmission_distribution
                    ).map(([category, count]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center border-b py-3"
                      >
                        <span className="text-gray-600">
                          {category}
                        </span>

                        <strong className="text-slate-800">
                          {count}
                        </strong>
                      </div>
                    ))}

                  </div>

                ) : (

                  <p className="text-gray-500">
                    No readmission distribution data available.
                  </p>

                )}

              </div>

              {/* INFORMATION */}

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">

                <div className="flex items-start gap-3">

                  <FaClipboardCheck className="text-blue-600 mt-1" />

                  <div>

                    <h3 className="font-semibold text-blue-700">
                      Hospital Monitoring
                    </h3>

                    <p className="text-sm text-gray-600 mt-1">
                      These statistics provide an overall
                      hospital-level view of readmission
                      patterns for administrative monitoring
                      and healthcare performance analysis.
                    </p>

                  </div>

                </div>

              </div>

            </>
          ) : (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
              No readmission statistics available.
            </div>
          )}

        </div>
      </DashboardLayout>
    );
  }

  // =========================================================
  // DOCTOR VIEW
  // EXISTING READMISSION PREDICTION
  // =========================================================

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-2">
        Hospital Re-admission Prediction
      </h1>

      <p className="text-gray-500 mb-6">
        Estimate the probability of a patient being
        readmitted within 30 days based on hospitalization
        and previous hospital utilization.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* =====================================================
            INPUT
        ===================================================== */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-6">
            Hospitalization Information
          </h2>

          <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">
            Previous Hospital Utilization
          </h3>

          <div className="grid grid-cols-3 gap-3">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Inpatient Visits
              </label>

              <input
                type="number"
                name="number_inpatient"
                value={formData.number_inpatient}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Emergency Visits
              </label>

              <input
                type="number"
                name="number_emergency"
                value={formData.number_emergency}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Outpatient Visits
              </label>

              <input
                type="number"
                name="number_outpatient"
                value={formData.number_outpatient}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

          </div>

          <h3 className="font-semibold text-gray-700 border-b pb-2 mt-6 mb-4">
            Current Hospitalization
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hospital Stay (Days)
              </label>

              <input
                type="number"
                name="time_in_hospital"
                value={formData.time_in_hospital}
                onChange={handleChange}
                min="1"
                max="14"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Medications
              </label>

              <input
                type="number"
                name="num_medications"
                value={formData.num_medications}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Lab Procedures
              </label>

              <input
                type="number"
                name="num_lab_procedures"
                value={formData.num_lab_procedures}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Procedures
              </label>

              <input
                type="number"
                name="num_procedures"
                value={formData.num_procedures}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

          </div>

          <h3 className="font-semibold text-gray-700 border-b pb-2 mt-6 mb-4">
            Patient Complexity
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Number of Diagnoses
              </label>

              <input
                type="number"
                name="number_diagnoses"
                value={formData.number_diagnoses}
                onChange={handleChange}
                min="1"
                max="16"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Diabetes Medication
              </label>

              <select
                name="diabetesmed"
                value={formData.diabetesmed}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Insulin Status
              </label>

              <select
                name="insulin"
                value={formData.insulin}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="No">No</option>
                <option value="Steady">Steady</option>
                <option value="Up">Increased</option>
                <option value="Down">Decreased</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Medication Changed
              </label>

              <select
                name="change"
                value={formData.change}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="No">No</option>
                <option value="Ch">Yes</option>
              </select>
            </div>

          </div>

          <h3 className="font-semibold text-gray-700 border-b pb-2 mt-6 mb-4">
            Clinical Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Maximum Glucose
              </label>

              <select
                name="max_glu_serum"
                value={formData.max_glu_serum}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="None">
                  Not Tested
                </option>

                <option value="Norm">
                  Normal
                </option>

                <option value=">200">
                  &gt;200
                </option>

                <option value=">300">
                  &gt;300
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                HbA1c
              </label>

              <select
                name="a1cresult"
                value={formData.a1cresult}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="None">
                  Not Tested
                </option>

                <option value="Norm">
                  Normal
                </option>

                <option value=">7">
                  &gt;7
                </option>

                <option value=">8">
                  &gt;8
                </option>
              </select>
            </div>

          </div>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={predictReadmission}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
          >
            {loading
              ? "Predicting..."
              : "Predict Readmission"}
          </button>

        </div>

        {/* =====================================================
            DOCTOR RESULT
        ===================================================== */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-6">
            Readmission Prediction
          </h2>

          {!prediction ? (

            <div className="text-center py-20">

              <FaRobot className="text-6xl mx-auto text-blue-600" />

              <p className="mt-6 text-gray-500">
                Enter hospitalization information
                <br />
                and click{" "}
                <strong>Predict Readmission</strong>.
              </p>

            </div>

          ) : (

            <>

              <div className="flex justify-center">

                <div
                  className={`w-44 h-44 rounded-full flex items-center justify-center text-4xl font-bold ${status.bg}`}
                >
                  {prediction.readmission_probability}%
                </div>

              </div>

              <h2
                className={`text-center text-3xl font-bold mt-6 ${status.color}`}
              >
                {status.text}
              </h2>

              <p className="text-center text-gray-500 mt-2">
                Estimated 30-day readmission probability
              </p>

              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">

                  <FaHospital className="text-red-500" />

                  <p>
                    Readmission Probability:
                    <strong>
                      {" "}
                      {prediction.readmission_probability}%
                    </strong>
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <FaRobot className="text-blue-500" />

                  <p>
                    Prediction:
                    <strong>
                      {" "}
                      {prediction.prediction}
                    </strong>
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <FaCalendarAlt className="text-blue-500" />

                  <p>
                    Follow-up:
                    <strong>
                      {String(
                        prediction.risk_level
                      ).toUpperCase() === "HIGH"
                        ? " Within 3 Days"
                        : String(
                            prediction.risk_level
                          ).toUpperCase() === "MEDIUM"
                        ? " Within 1 Week"
                        : " Routine Follow-up"}
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
                  prediction.risk_level
                ).toUpperCase() === "HIGH" ? (

                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      Arrange early post-discharge follow-up.
                    </li>
                    <li>
                      Review medications and discharge plan.
                    </li>
                    <li>
                      Closely monitor high-risk factors.
                    </li>
                  </ul>

                ) : String(
                    prediction.risk_level
                  ).toUpperCase() === "MEDIUM" ? (

                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      Schedule follow-up within one week.
                    </li>
                    <li>
                      Monitor medication adherence.
                    </li>
                    <li>
                      Continue appropriate care planning.
                    </li>
                  </ul>

                ) : (

                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      Continue the planned discharge care.
                    </li>
                    <li>
                      Follow the routine healthcare schedule.
                    </li>
                    <li>
                      Maintain appropriate monitoring.
                    </li>
                  </ul>

                )}

              </div>

              <p className="text-xs text-gray-400 text-center mt-6">
                Powered by the trained Diabetes 130-US
                Hospitals Random Forest readmission model.
              </p>

            </>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Readmission;