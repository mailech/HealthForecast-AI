/* =========================================================
   HEALTHFORECAST AI
   FRONTEND APPLICATION
   ========================================================= */


/* ================= APPLICATION STATE ================= */

let predictions = JSON.parse(
    localStorage.getItem("healthForecastPredictions") || "[]"
);


/* ================= PAGE NAVIGATION ================= */

function showPage(pageId, clickedButton = null) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.remove("active");
    });

    if (clickedButton) {

        clickedButton.classList.add("active");

    } else {

        document.querySelectorAll(".nav-item").forEach(button => {

            if (
                button.innerText
                    .toLowerCase()
                    .includes(pageId.toLowerCase())
            ) {
                button.classList.add("active");
            }

        });

    }

    const titles = {

        dashboard: "Clinical Dashboard",

        prediction: "Risk Prediction",

        history: "Prediction History",

        analytics: "Clinical Analytics",

        model: "AI Model Information"

    };

    const titleElement =
        document.getElementById("currentSection");

    if (titleElement) {
        titleElement.innerText =
            titles[pageId] || "HealthForecast AI";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (window.innerWidth <= 800) {
        document
            .getElementById("sidebar")
            .classList.remove("open");
    }

    if (pageId === "history") {
        renderHistory();
    }

    if (pageId === "analytics") {
        updateAnalytics();
    }
}


/* ================= SIDEBAR ================= */

function toggleSidebar() {

    document
        .getElementById("sidebar")
        .classList.toggle("open");

}


/* ================= DEMO PATIENT ================= */

function loadDemoPatient() {

    document.getElementById("age").value = 68;

    document.getElementById("gender").value = "Male";

    document.getElementById("race").value = "Caucasian";

    document.getElementById("diagnoses").value = 8;

    document.getElementById("stay").value = 9;

    document.getElementById("emergency").value = 3;

    document.getElementById("inpatient").value = 2;

    document.getElementById("outpatient").value = 4;

    document.getElementById("diabetesMed").value = "Yes";

    document.getElementById("insulin").value = "Steady";

    document.getElementById("a1c").value = ">8";

    document.getElementById("glucose").value = ">200";

    showToast(
        "Demo Patient Loaded",
        "Sample clinical information has been filled."
    );
}


/* ================= FORM SUBMISSION ================= */

document
    .getElementById("predictionForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        generatePrediction();

    });


/* ================= PREDICTION ENGINE ================= */

/*
    IMPORTANT:

    This is a FRONTEND DEMONSTRATION calculation.

    In the final version, this function will be replaced by:

        fetch("/predict", {
            method: "POST",
            body: JSON.stringify(patientData)
        })

    The FastAPI backend will then return the
    actual trained ML model prediction.
*/

function generatePrediction() {

    const age =
        Number(document.getElementById("age").value);

    const stay =
        Number(document.getElementById("stay").value);

    const emergency =
        Number(document.getElementById("emergency").value);

    const inpatient =
        Number(document.getElementById("inpatient").value);

    const outpatient =
        Number(document.getElementById("outpatient").value || 0);

    const diagnoses =
        Number(document.getElementById("diagnoses").value || 0);

    const diabetesMed =
        document.getElementById("diabetesMed").value;

    const insulin =
        document.getElementById("insulin").value;

    const a1c =
        document.getElementById("a1c").value;

    const glucose =
        document.getElementById("glucose").value;


    if (
        !age ||
        !stay ||
        isNaN(emergency) ||
        isNaN(inpatient)
    ) {

        showToast(
            "Missing Information",
            "Please complete the required patient fields."
        );

        return;
    }


    /* DEMO SCORE */

    let score = 15;

    const factors = [];


    /* AGE */

    if (age >= 75) {

        score += 18;

        factors.push({
            name: "Advanced age",
            value: 85
        });

    } else if (age >= 60) {

        score += 12;

        factors.push({
            name: "Age",
            value: 65
        });

    }


    /* HOSPITAL STAY */

    if (stay >= 10) {

        score += 18;

        factors.push({
            name: "Long hospital stay",
            value: 90
        });

    } else if (stay >= 7) {

        score += 12;

        factors.push({
            name: "Hospital stay",
            value: 70
        });

    }


    /* EMERGENCY */

    if (emergency >= 4) {

        score += 18;

        factors.push({
            name: "Emergency utilization",
            value: 90
        });

    } else if (emergency >= 2) {

        score += 10;

        factors.push({
            name: "Emergency visits",
            value: 65
        });

    }


    /* INPATIENT */

    if (inpatient >= 3) {

        score += 20;

        factors.push({
            name: "Previous inpatient visits",
            value: 95
        });

    } else if (inpatient >= 1) {

        score += 12;

        factors.push({
            name: "Previous inpatient visits",
            value: 70
        });

    }


    /* OUTPATIENT */

    if (outpatient >= 5) {

        score += 8;

        factors.push({
            name: "Outpatient utilization",
            value: 55
        });

    }


    /* DIAGNOSES */

    if (diagnoses >= 8) {

        score += 10;

        factors.push({
            name: "Multiple diagnoses",
            value: 70
        });

    }


    /* DIABETES MEDICATION */

    if (diabetesMed === "Yes") {

        score += 5;

        factors.push({
            name: "Diabetes medication",
            value: 40
        });

    }


    /* INSULIN */

    if (
        insulin === "Up" ||
        insulin === "Steady"
    ) {

        score += 7;

        factors.push({
            name: "Insulin treatment",
            value: 50
        });

    }


    /* A1C */

    if (a1c === ">8") {

        score += 10;

        factors.push({
            name: "Elevated HbA1c",
            value: 75
        });

    }


    /* GLUCOSE */

    if (
        glucose === ">200" ||
        glucose === ">300"
    ) {

        score += 8;

        factors.push({
            name: "Elevated glucose",
            value: 65
        });

    }


    /* LIMIT SCORE */

    score = Math.min(
        Math.max(score, 5),
        95
    );


    /* RISK CLASSIFICATION */

    let risk;
    let message;
    let recommendations;


    if (score >= 65) {

        risk = "HIGH";

        message =
            "The patient shows multiple factors associated with elevated readmission risk.";

        recommendations = [

            "Consider closer post-discharge follow-up.",

            "Review medication adherence and reconciliation.",

            "Monitor chronic disease management.",

            "Consider follow-up within 7 days."

        ];

    } else if (score >= 40) {

        risk = "MODERATE";

        message =
            "The patient shows several factors that may be associated with increased readmission risk.";

        recommendations = [

            "Continue appropriate discharge planning.",

            "Review medications and follow-up requirements.",

            "Monitor relevant chronic conditions."

        ];

    } else {

        risk = "LOW";

        message =
            "The patient currently shows fewer factors associated with hospital readmission.";

        recommendations = [

            "Continue standard discharge planning.",

            "Provide routine follow-up instructions."

        ];

    }


    displayPrediction(
        score,
        risk,
        message,
        factors,
        recommendations
    );


    savePrediction(
        score,
        risk
    );

}


/* ================= DISPLAY RESULT ================= */

function displayPrediction(
    score,
    risk,
    message,
    factors,
    recommendations
) {

    document
        .getElementById("resultPlaceholder")
        .style.display = "none";


    document
        .getElementById("predictionResult")
        .style.display = "block";


    document
        .getElementById("probability")
        .innerText = score + "%";


    document
        .getElementById("riskTitle")
        .innerText =
        risk.charAt(0) +
        risk.slice(1).toLowerCase() +
        " Risk";


    document
        .getElementById("riskMessage")
        .innerText = message;


    /* RISK BADGE */

    const badge =
        document.getElementById("resultRiskBadge");

    badge.innerText = risk;

    badge.className =
        "risk-badge " +
        risk.toLowerCase();


    /* SCORE CIRCLE */

    const degrees =
        (score / 100) * 360;

    let scoreColor;

    if (risk === "HIGH") {
        scoreColor = "#dc2626";
    } else if (risk === "MODERATE") {
        scoreColor = "#f59e0b";
    } else {
        scoreColor = "#16a34a";
    }

    document
        .getElementById("scoreCircle")
        .style.background =
        `conic-gradient(
            ${scoreColor} ${degrees}deg,
            #f1f5f9 ${degrees}deg
        )`;


    /* FACTORS */

    const factorList =
        document.getElementById("factorList");

    factorList.innerHTML = "";


    factors
        .slice(0, 6)
        .forEach(factor => {

            const element =
                document.createElement("div");

            element.className = "factor";

            element.innerHTML = `

                <span class="factor-name">
                    ${factor.name}
                </span>

                <div class="factor-bar">
                    <div style="width:${factor.value}%"></div>
                </div>

            `;

            factorList.appendChild(element);

        });


    /* RECOMMENDATIONS */

    const recommendationList =
        document.getElementById(
            "recommendationList"
        );

    recommendationList.innerHTML = "";


    recommendations.forEach(item => {

        const li =
            document.createElement("li");

        li.innerText = item;

        recommendationList.appendChild(li);

    });


    showToast(
        "Prediction Generated",
        `${risk} risk • ${score}% estimated probability`
    );

}


/* ================= SAVE PREDICTION ================= */

function savePrediction(score, risk) {

    const patientId =
        "HF-" +
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    const patient = {

        id: patientId,

        age:
            Number(
                document.getElementById("age").value
            ),

        stay:
            Number(
                document.getElementById("stay").value
            ),

        emergency:
            Number(
                document.getElementById("emergency").value
            ),

        inpatient:
            Number(
                document.getElementById("inpatient").value
            ),

        risk: risk,

        probability: score,

        date:
            new Date().toLocaleDateString()

    };


    predictions.unshift(patient);

    if (predictions.length > 100) {
        predictions = predictions.slice(0, 100);
    }


    localStorage.setItem(
        "healthForecastPredictions",
        JSON.stringify(predictions)
    );


    updateDashboardStats();

}


/* ================= HISTORY ================= */

function renderHistory(data = predictions) {

    const table =
        document.getElementById("historyTable");

    table.innerHTML = "";


    if (data.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="8"
                    style="text-align:center;padding:30px">

                    No prediction records found.

                </td>

            </tr>

        `;

        return;
    }


    data.forEach(patient => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${patient.id}</strong>
            </td>

            <td>
                ${patient.age}
            </td>

            <td>
                ${patient.stay} days
            </td>

            <td>
                ${patient.emergency}
            </td>

            <td>
                ${patient.inpatient}
            </td>

            <td>

                <span class="risk-badge ${patient.risk.toLowerCase()}">

                    ${patient.risk}

                </span>

            </td>

            <td>
                <strong>
                    ${patient.probability}%
                </strong>
            </td>

            <td>
                ${patient.date}
            </td>

        `;


        table.appendChild(row);

    });

}


/* ================= SEARCH ================= */

function searchHistory() {

    const query =
        document
            .getElementById("historySearch")
            .value
            .toLowerCase();


    const filtered =
        predictions.filter(patient =>
            patient.id
                .toLowerCase()
                .includes(query)
        );


    renderHistory(filtered);

}


/* ================= FILTER ================= */

function filterHistory() {

    const filter =
        document
            .getElementById("riskFilter")
            .value;


    if (filter === "all") {

        renderHistory(predictions);

        return;
    }


    const filtered =
        predictions.filter(
            patient =>
                patient.risk.toLowerCase() === filter
        );


    renderHistory(filtered);

}


/* ================= DASHBOARD STATS ================= */

function updateDashboardStats() {

    const total =
        predictions.length;

    const high =
        predictions.filter(
            p => p.risk === "HIGH"
        ).length;

    const moderate =
        predictions.filter(
            p => p.risk === "MODERATE"
        ).length;

    const low =
        predictions.filter(
            p => p.risk === "LOW"
        ).length;


    if (total === 0) {
        return;
    }


    document
        .getElementById("totalPredictions")
        .innerText =
        1248 + total;


    document
        .getElementById("highRiskCount")
        .innerText =
        182 + high;


    document
        .getElementById("moderateRiskCount")
        .innerText =
        421 + moderate;


    document
        .getElementById("lowRiskCount")
        .innerText =
        645 + low;

}


/* ================= ANALYTICS ================= */

function updateAnalytics() {

    const datasetCanvas =
        document.getElementById("datasetChart");

    if (!datasetCanvas) {
        return;
    }


    if (
        window.datasetChartInstance
    ) {
        window.datasetChartInstance.destroy();
    }


    window.datasetChartInstance =
        new Chart(
            datasetCanvas,
            {

                type: "doughnut",

                data: {

                    labels: [

                        "Not Readmitted",

                        "Readmitted >30 Days",

                        "Readmitted <30 Days"

                    ],

                    datasets: [

                        {

                            data: [

                                54864,

                                35545,

                                11357

                            ]

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                font: {
                                    size: 10
                                }

                            }

                        }

                    }

                }

            }
        );

}


/* ================= DASHBOARD CHART ================= */

function createRiskChart() {

    const canvas =
        document.getElementById("riskChart");

    if (!canvas) {
        return;
    }


    window.riskChartInstance =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: [

                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"

                    ],

                    datasets: [

                        {

                            label: "High Risk",

                            data: [
                                14,
                                18,
                                15,
                                22,
                                19,
                                25,
                                21
                            ],

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 3

                        },

                        {

                            label: "Moderate Risk",

                            data: [
                                31,
                                35,
                                29,
                                38,
                                34,
                                42,
                                39
                            ],

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 3

                        },

                        {

                            label: "Low Risk",

                            data: [
                                48,
                                55,
                                51,
                                59,
                                54,
                                61,
                                57
                            ],

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                font: {
                                    size: 9
                                }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );

}


/* ================= TOAST ================= */

function showToast(title, message) {

    const toast =
        document.getElementById("toast");


    document
        .getElementById("toastTitle")
        .innerText = title;


    document
        .getElementById("toastMessage")
        .innerText = message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}


/* ================= INITIALIZE ================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        createRiskChart();

        updateDashboardStats();

    }
);
