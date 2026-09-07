const API_URL = "https://retired-undercut-hedging.ngrok-free.dev";

async function predictRisk() {

    const resultBox = document.getElementById("result");
    const riskLevel = document.getElementById("riskLevel");
    const probability = document.getElementById("probability");
    const message = document.getElementById("message");

    // Show loading state
    resultBox.style.display = "block";
    riskLevel.textContent = "Analyzing...";
    probability.textContent = "Please wait";
    message.textContent = "Connecting to HealthForecast AI model...";

    // Collect patient data
    const patientData = {
        race: "Caucasian",
        gender: document.getElementById("gender").value,
        age: Number(document.getElementById("age").value),

        admission_type_id: 1,
        discharge_disposition_id: 1,
        admission_source_id: 7,

        time_in_hospital: Number(document.getElementById("stay").value),

        num_lab_procedures: 40,
        num_procedures: 1,
        num_medications: 10,

        number_outpatient: 0,
        number_emergency: Number(document.getElementById("emergency").value),
        number_inpatient: Number(document.getElementById("admissions").value),

        diag_1: "250.00",
        diag_2: "401.9",
        diag_3: "250.00",

        number_diagnoses: 5,

        max_glu_serum: "None",
        A1Cresult: "None",
        insulin: "No",
        change: "No",
        diabetesMed: "Yes"
    };

    try {

        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(patientData)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Display prediction
        riskLevel.textContent = data.risk_level;

        probability.textContent =
            `${data.readmission_probability}%`;

        message.textContent = data.message;

        // Display risk factors if the element exists
        const factors = document.getElementById("riskFactors");

        if (factors) {

            factors.innerHTML = "";

            if (data.risk_factors && data.risk_factors.length > 0) {

                data.risk_factors.forEach(factor => {

                    const item = document.createElement("li");
                    item.textContent = factor;

                    factors.appendChild(item);
                });

            } else {

                const item = document.createElement("li");
                item.textContent = "No major risk factors identified.";

                factors.appendChild(item);
            }
        }

    } catch (error) {

        console.error("Prediction error:", error);

        riskLevel.textContent = "Connection Error";

        probability.textContent = "--";

        message.textContent =
            "Unable to connect to the HealthForecast AI backend. Please try again.";

    }
}
