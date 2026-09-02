function predictRisk() {

    const age = Number(document.getElementById("age").value);
    const diabetes = document.getElementById("diabetes").value;
    const hypertension = document.getElementById("hypertension").value;
    const heartDisease = document.getElementById("heartDisease").value;
    const admissions = Number(document.getElementById("admissions").value);
    const stay = Number(document.getElementById("stay").value);
    const emergency = Number(document.getElementById("emergency").value);

    // Check whether all required fields are filled
    if (
        !age ||
        !diabetes ||
        !hypertension ||
        !heartDisease ||
        isNaN(admissions) ||
        isNaN(stay) ||
        isNaN(emergency)
    ) {
        alert("Please fill in all patient information.");
        return;
    }

    /*
     * DEMO LOGIC
     * This is NOT the actual ML model.
     * Later, this function will send the patient
     * information to the FastAPI backend.
     */

    let score = 10;

    if (age >= 60) {
        score += 20;
    }

    if (age >= 75) {
        score += 10;
    }

    if (diabetes === "yes") {
        score += 15;
    }

    if (hypertension === "yes") {
        score += 10;
    }

    if (heartDisease === "yes") {
        score += 15;
    }

    score += admissions * 5;
    score += emergency * 3;

    if (stay >= 7) {
        score += 10;
    }

    // Maximum demo score
    if (score > 95) {
        score = 95;
    }

    let risk;
    let message;

    if (score >= 60) {

        risk = "HIGH RISK";

        message =
            "The patient shows several factors associated with higher readmission risk. Further clinical evaluation may be required.";

    } else if (score >= 35) {

        risk = "MODERATE RISK";

        message =
            "The patient shows some factors associated with readmission risk. Continued monitoring may be appropriate.";

    } else {

        risk = "LOW RISK";

        message =
            "The patient currently shows fewer factors associated with hospital readmission.";
    }

    // Display result
    document.getElementById("riskLevel").innerText = risk;

    document.getElementById("probability").innerText =
        score + "%";

    document.getElementById("message").innerText =
        message;

    document.getElementById("result").style.display =
        "block";

    document.getElementById("result").scrollIntoView({
        behavior: "smooth"
    });
        }
