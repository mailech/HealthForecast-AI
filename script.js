// ============================================================
// HealthForecast-AI - Frontend JavaScript
// ============================================================

// Your current FastAPI public URL
const API_URL = "https://retired-undercut-hedging.ngrok-free.dev";


// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(pageId, clickedElement = null) {

    // Hide all pages
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.style.display = "none";
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.style.display = "block";
    }

    // Update active navigation item
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    if (clickedElement) {
        clickedElement.classList.add("active");
    }

    // Load data when required
    if (pageId === "history") {
        loadHistory();
    }

    if (pageId === "analytics") {
        loadStats();
    }

    if (pageId === "model") {
        loadModelInfo();
    }
}


// ============================================================
// SIDEBAR
// ============================================================

function toggleSidebar() {

    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}


// ============================================================
// DEMO PATIENT
// ============================================================

function loadDemoPatient() {

    const age = document.getElementById("age");
    const gender = document.getElementById("gender");
    const race = document.getElementById("race");
    const diagnoses = document.getElementById("diagnoses");
    const stay = document.getElementById("stay");
    const emergency = document.getElementById("emergency");
    const inpatient = document.getElementById("inpatient");
    const outpatient = document.getElementById("outpatient");
    const diabetesMed = document.getElementById("diabetesMed");
    const insulin = document.getElementById("insulin");
    const a1c = document.getElementById("a1c");
    const glucose = document.getElementById("glucose");

    if (age) age.value = 65;
    if (gender) gender.value = "Female";
    if (race) race.value = "Caucasian";
    if (diagnoses) diagnoses.value = 7;
    if (stay) stay.value = 5;
    if (emergency) emergency.value = 2;
    if (inpatient) inpatient.value = 1;
    if (outpatient) outpatient.value = 1;
    if (diabetesMed) diabetesMed.value = "Yes";
    if (insulin) insulin.value = "No";
    if (a1c) a1c.value = "NotMeasured";
    if (glucose) glucose.value = "NotMeasured";

    console.log("Demo patient loaded.");
}


// ============================================================
// VALUE CONVERSION
// ============================================================

function convertGlucose(value) {

    if (!value || value === "NotMeasured") {
        return "None";
    }

    if (value === "Normal") {
        return "Norm";
    }

    return value;
}


function convertA1C(value) {

    if (!value || value === "NotMeasured") {
        return "None";
    }

    if (value === "Normal") {
        return "Norm";
    }

    return value;
}


// ============================================================
// GET PATIENT DATA FROM FORM
// ============================================================

function getPatientData() {

    return {

        race:
            document.getElementById("race")?.value || "Caucasian",

        gender:
            document.getElementById("gender")?.value || "Female",

        age:
            Number(document.getElementById("age")?.value || 0),

        // These fields are not currently visible in your frontend.
        // We use sensible dataset-compatible defaults.
        admission_type_id: 1,

        discharge_disposition_id: 1,

        admission_source_id: 7,

        time_in_hospital:
            Number(document.getElementById("stay")?.value || 1),

        num_lab_procedures: 40,

        num_procedures: 1,

        num_medications: 10,

        number_outpatient:
            Number(document.getElementById("outpatient")?.value || 0),

        number_emergency:
            Number(document.getElementById("emergency")?.value || 0),

        number_inpatient:
            Number(document.getElementById("inpatient")?.value || 0),

        // Dataset-compatible diagnosis defaults
        diag_1: "250.00",

        diag_2: "401.9",

        diag_3: "250.00",

        number_diagnoses:
            Number(document.getElementById("diagnoses")?.value || 5),

        max_glu_serum:
            convertGlucose(
                document.getElementById("glucose")?.value
            ),

        A1Cresult:
            convertA1C(
                document.getElementById("a1c")?.value
            ),

        insulin:
            document.getElementById("insulin")?.value || "No",

        change: "No",

        diabetesMed:
            document.getElementById("diabetesMed")?.value || "Yes"
    };
}


// ============================================================
// RISK CLASS
// ============================================================

function getRiskClass(riskLevel) {

    if (!riskLevel) {
        return "";
    }

    return riskLevel.toLowerCase();
}


// ============================================================
// DISPLAY PREDICTION RESULT
// ============================================================

function displayPredictionResult(data) {

    const placeholder =
        document.getElementById("resultPlaceholder");

    const result =
        document.getElementById("predictionResult");

    const riskBadge =
        document.getElementById("resultRiskBadge");

    const probability =
        document.getElementById("probability");

    const riskTitle =
        document.getElementById("riskTitle");

    const riskMessage =
        document.getElementById("riskMessage");

    const factorList =
        document.getElementById("factorList");

    const recommendationList =
        document.getElementById("recommendationList");


    // Hide placeholder
    if (placeholder) {
        placeholder.style.display = "none";
    }

    // Show result
    if (result) {
        result.style.display = "block";
    }


    // --------------------------------------------------------
    // Risk level
    // --------------------------------------------------------

    const risk =
        data.risk_level || "UNKNOWN";

    const formattedRisk =
        risk.charAt(0) +
        risk.slice(1).toLowerCase();


    if (riskBadge) {

        riskBadge.textContent = formattedRisk;

        riskBadge.classList.remove(
            "high",
            "moderate",
            "low"
        );

        riskBadge.classList.add(
            getRiskClass(risk)
        );
    }


    // --------------------------------------------------------
    // Probability
    // --------------------------------------------------------

    if (probability) {

        const probabilityValue =
            Number(data.readmission_probability || 0);

        probability.textContent =
            probabilityValue.toFixed(2) + "%";
    }


    // --------------------------------------------------------
    // Risk title
    // --------------------------------------------------------

    if (riskTitle) {

        riskTitle.textContent =
            formattedRisk + " Risk";
    }


    // --------------------------------------------------------
    // Message
    // --------------------------------------------------------

    if (riskMessage) {

        riskMessage.textContent =
            data.message ||
            "Prediction generated successfully.";
    }


    // --------------------------------------------------------
    // Risk factors
    // --------------------------------------------------------

    if (factorList) {

        factorList.innerHTML = "";

        const factors =
            data.risk_factors || [];

        if (factors.length === 0) {

            factorList.innerHTML =
                "<li>No major risk factors identified by the model.</li>";

        } else {

            factors.forEach(factor => {

                const li =
                    document.createElement("li");

                li.textContent = factor;

                factorList.appendChild(li);
            });
        }
    }


    // --------------------------------------------------------
    // Recommendations
    // --------------------------------------------------------

    if (recommendationList) {

        recommendationList.innerHTML = "";

        let recommendations = [];

        if (risk === "HIGH") {

            recommendations = [
                "Review the patient's previous admission history.",
                "Consider appropriate follow-up planning.",
                "Monitor the patient according to clinical judgement."
            ];

        } else if (risk === "MODERATE") {

            recommendations = [
                "Review previous emergency and inpatient visits.",
                "Consider appropriate follow-up after discharge.",
                "Continue monitoring based on clinical judgement."
            ];

        } else {

            recommendations = [
                "Continue standard follow-up.",
                "Review patient history as appropriate.",
                "Use clinical judgement for final decisions."
            ];
        }


        recommendations.forEach(item => {

            const li =
                document.createElement("li");

            li.textContent = item;

            recommendationList.appendChild(li);
        });
    }


    // Scroll to result
    if (result) {

        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ============================================================
// PREDICT RISK
// ============================================================

async function predictRisk() {

    const form =
        document.getElementById("predictionForm");

    if (form && !form.checkValidity()) {

        form.reportValidity();

        return;
    }


    const button =
        form?.querySelector(
            'button[type="submit"]'
        );


    const originalButtonText =
        button ? button.innerHTML : "";


    // Loading state
    if (button) {

        button.disabled = true;

        button.innerHTML =
            "Analyzing... ⏳";
    }


    try {

        const patientData =
            getPatientData();


        console.log(
            "Sending patient data:",
            patientData
        );


        const response =
            await fetch(
                API_URL + "/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(patientData)
                }
            );


        if (!response.ok) {

            let errorMessage =
                "Prediction request failed.";

            try {

                const errorData =
                    await response.json();

                console.error(
                    "Backend error:",
                    errorData
                );

                if (errorData.detail) {

                    errorMessage =
                        typeof errorData.detail === "string"
                            ? errorData.detail
                            : JSON.stringify(errorData.detail);
                }

            } catch (e) {
                // Ignore JSON parsing error
            }

            throw new Error(errorMessage);
        }


        const data =
            await response.json();


        console.log(
            "Prediction received:",
            data
        );


        // Display result
        displayPredictionResult(data);


        // Refresh history/stats
        loadHistory();
        loadStats();


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );


        const placeholder =
            document.getElementById("resultPlaceholder");

        const result =
            document.getElementById("predictionResult");

        const riskTitle =
            document.getElementById("riskTitle");

        const riskMessage =
            document.getElementById("riskMessage");


        if (placeholder) {
            placeholder.style.display = "none";
        }

        if (result) {
            result.style.display = "block";
        }

        const riskBadge =
            document.getElementById("resultRiskBadge");

        if (riskBadge) {

            riskBadge.textContent =
                "ERROR";

            riskBadge.classList.remove(
                "high",
                "moderate",
                "low"
            );
        }

        const probability =
            document.getElementById("probability");

        if (probability) {
            probability.textContent = "--";
        }

        if (riskTitle) {
            riskTitle.textContent =
                "Prediction Unavailable";
        }

        if (riskMessage) {

            riskMessage.textContent =
                "Unable to connect to the prediction server. Please make sure the FastAPI backend is running.";
        }

        const factorList =
            document.getElementById("factorList");

        if (factorList) {

            factorList.innerHTML =
                "<li>Backend connection could not be established.</li>";
        }

        const recommendationList =
            document.getElementById("recommendationList");

        if (recommendationList) {

            recommendationList.innerHTML =
                "<li>Check that the API server is running and try again.</li>";
        }

    } finally {

        // Restore button
        if (button) {

            button.disabled = false;

            button.innerHTML =
                originalButtonText;
        }
    }
}


// ============================================================
// FORM SUBMISSION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById("predictionForm");


        if (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    // VERY IMPORTANT:
                    // Prevent normal page refresh
                    event.preventDefault();

                    predictRisk();
                }
            );
        }


        // Load dashboard information
        loadStats();

        console.log(
            "HealthForecast-AI frontend initialized."
        );
    }
);


// ============================================================
// HISTORY
// ============================================================

async function loadHistory() {

    try {

        const response =
            await fetch(
                API_URL + "/history"
            );


        if (!response.ok) {
            throw new Error(
                "Unable to load history"
            );
        }


        const data =
            await response.json();


        console.log(
            "History:",
            data
        );


        /*
         * Backend may return either:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * or
         *
         * {
         *   history: [...]
         * }
         */

        const history =
            Array.isArray(data)
                ? data
                : (data.history || []);


        updateHistoryTable(history);

    } catch (error) {

        console.warn(
            "History unavailable:",
            error
        );
    }
}


// ============================================================
// UPDATE HISTORY TABLE
// ============================================================

function updateHistoryTable(history) {

    // Try common table/container IDs
    const tableBody =
        document.querySelector(
            "#historyTable tbody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    history.forEach(item => {

        const row =
            document.createElement("tr");


        const date =
            item.created_at ||
            item.date ||
            "--";


        const prediction =
            item.prediction ||
            "--";


        const risk =
            item.risk_level ||
            "--";


        const probability =
            item.readmission_probability;


        row.innerHTML = `
            <td>${date}</td>
            <td>${prediction}</td>
            <td>${risk}</td>
            <td>
                ${
                    probability !== undefined
                        ? Number(probability).toFixed(2) + "%"
                        : "--"
                }
            </td>
        `;


        tableBody.appendChild(row);
    });
}


// ============================================================
// HISTORY SEARCH
// ============================================================

function searchHistory() {

    const input =
        document.getElementById(
            "historySearch"
        );


    if (!input) {
        return;
    }


    const searchText =
        input.value.toLowerCase();


    const rows =
        document.querySelectorAll(
            "#historyTable tbody tr"
        );


    rows.forEach(row => {

        const text =
            row.textContent.toLowerCase();


        row.style.display =
            text.includes(searchText)
                ? ""
                : "none";
    });
}


// ============================================================
// HISTORY FILTER
// ============================================================

function filterHistory() {

    const filter =
        document.getElementById(
            "riskFilter"
        );


    if (!filter) {
        return;
    }


    const selectedRisk =
        filter.value.toLowerCase();


    const rows =
        document.querySelectorAll(
            "#historyTable tbody tr"
        );


    rows.forEach(row => {

        if (!selectedRisk) {

            row.style.display = "";

            return;
        }


        const text =
            row.textContent.toLowerCase();


        row.style.display =
            text.includes(selectedRisk)
                ? ""
                : "none";
    });
}


// ============================================================
// STATISTICS
// ============================================================

async function loadStats() {

    try {

        const response =
            await fetch(
                API_URL + "/stats"
            );


        if (!response.ok) {
            throw new Error(
                "Unable to load statistics"
            );
        }


        const data =
            await response.json();


        console.log(
            "Statistics:",
            data
        );


        /*
         * Statistics are loaded from the backend.
         * We don't force specific IDs here because
         * your current HTML already contains dashboard values.
         */

    } catch (error) {

        console.warn(
            "Statistics unavailable:",
            error
        );
    }
}


// ============================================================
// MODEL INFORMATION
// ============================================================

async function loadModelInfo() {

    try {

        const response =
            await fetch(
                API_URL + "/model-info"
            );


        if (!response.ok) {
            throw new Error(
                "Unable to load model information"
            );
        }


        const data =
            await response.json();


        console.log(
            "Model information:",
            data
        );


    } catch (error) {

        console.warn(
            "Model information unavailable:",
            error
        );
    }
}


// ============================================================
// CHARTS
// ============================================================

function initializeCharts() {

    // Make sure Chart.js exists
    if (typeof Chart === "undefined") {

        console.warn(
            "Chart.js is not loaded."
        );

        return;
    }


    // --------------------------------------------------------
    // Risk Chart
    // --------------------------------------------------------

    const riskCanvas =
        document.getElementById(
            "riskChart"
        );


    if (
        riskCanvas &&
        !riskCanvas.chartInstance
    ) {

        riskCanvas.chartInstance =
            new Chart(
                riskCanvas,
                {
                    type: "doughnut",

                    data: {
                        labels: [
                            "Low Risk",
                            "Moderate Risk",
                            "High Risk"
                        ],

                        datasets: [
                            {
                                data: [
                                    40,
                                    35,
                                    25
                                ]
                            }
                        ]
                    },

                    options: {
                        responsive: true,

                        plugins: {
                            legend: {
                                position: "bottom"
                            }
                        }
                    }
                }
            );
    }


    // --------------------------------------------------------
    // Dataset Chart
    // --------------------------------------------------------

    const datasetCanvas =
        document.getElementById(
            "datasetChart"
        );


    if (
        datasetCanvas &&
        !datasetCanvas.chartInstance
    ) {

        datasetCanvas.chartInstance =
            new Chart(
                datasetCanvas,
                {
                    type: "bar",

                    data: {
                        labels: [
                            "<30",
                            ">30",
                            "NO"
                        ],

                        datasets: [
                            {
                                label:
                                    "Patients",

                                data: [
                                    11357,
                                    35545,
                                    54864
                                ]
                            }
                        ]
                    },

                    options: {
                        responsive: true,

                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                }
            );
    }
}


// Initialize charts after page loads
document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeCharts();
    }
);
