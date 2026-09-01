import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

import {
  FaHospital,
  FaCalendarAlt,
  FaRobot,
  FaClipboardCheck,
} from "react-icons/fa";


function Readmission() {

  // =====================================================
  // FORM DATA
  // =====================================================

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


  // =====================================================
  // PREDICTION STATE
  // =====================================================

  const [prediction, setPrediction] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // PREDICT READMISSION
  // =====================================================

  const predictReadmission = async () => {

    setLoading(true);
    setError("");
    setPrediction(null);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/predict-readmission",
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
          data.detail ||
          "Prediction failed."
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


  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = () => {

    if (!prediction) {
      return {
        text: "",
        color: "",
        bg: "",
      };
    }


    if (
      prediction.risk_level === "HIGH"
    ) {

      return {
        text: "High Chance",
        color: "text-red-600",
        bg: "bg-red-100",
      };

    }


    if (
      prediction.risk_level === "MEDIUM"
    ) {

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


  // =====================================================
  // VALIDATION
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
        Hospital Re-admission Prediction
      </h1>


      <div className="grid lg:grid-cols-2 gap-8">


        {/* =================================================
            INPUT FORM
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Patient Information
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
              onClick={predictReadmission}
              disabled={!isFormValid || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl"
            >

              {loading
                ? "Predicting..."
                : "Predict Readmission"}

            </button>


          </div>

        </div>


        {/* =================================================
            RESULT
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-xl font-bold mb-6">
            Prediction Result
          </h2>


          {!prediction ? (

            <div className="text-center py-20">

              <FaRobot className="text-6xl mx-auto text-blue-600" />

              <p className="mt-5 text-gray-500">

                Enter patient information and
                click Predict Readmission.

              </p>

            </div>

          ) : (

            <>


              {/* SCORE */}

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
                    ${getStatus().bg}
                  `}
                >

                  {prediction.readmission_probability}%

                </div>

              </div>


              {/* STATUS */}

              <h2
                className={`
                  text-center
                  text-3xl
                  font-bold
                  mt-6
                  ${getStatus().color}
                `}
              >

                {getStatus().text}

              </h2>


              {/* DETAILS */}

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

                    Suggested Follow-up:

                    <strong>

                      {prediction.risk_level === "HIGH"
                        ? " Within 3 Days"
                        : prediction.risk_level === "MEDIUM"
                        ? " Within 1 Week"
                        : " Routine Follow-up"}

                    </strong>

                  </p>

                </div>


              </div>


              {/* RECOMMENDATIONS */}

              <div className="mt-8 bg-blue-50 rounded-xl p-5">

                <div className="flex items-center gap-2 mb-4">

                  <FaClipboardCheck className="text-blue-600" />

                  <h3 className="font-bold text-blue-700">

                    Recommended Actions

                  </h3>

                </div>


                {prediction.risk_level === "HIGH" ? (

                  <ul className="list-disc pl-6 space-y-2">

                    <li>
                      Schedule an early follow-up.
                    </li>

                    <li>
                      Closely monitor patient condition.
                    </li>

                    <li>
                      Review discharge medications.
                    </li>

                    <li>
                      Consider additional post-discharge support.
                    </li>

                  </ul>

                ) : prediction.risk_level === "MEDIUM" ? (

                  <ul className="list-disc pl-6 space-y-2">

                    <li>
                      Schedule follow-up within one week.
                    </li>

                    <li>
                      Monitor medication adherence.
                    </li>

                    <li>
                      Encourage appropriate lifestyle management.
                    </li>

                  </ul>

                ) : (

                  <ul className="list-disc pl-6 space-y-2">

                    <li>
                      Continue planned treatment.
                    </li>

                    <li>
                      Follow routine follow-up schedule.
                    </li>

                    <li>
                      Maintain healthy lifestyle practices.
                    </li>

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