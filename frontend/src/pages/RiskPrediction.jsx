import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const RiskPrediction = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [form, setForm] = useState({
        age: "",
        blood_pressure: "",
        glucose: "",
        bmi: "",
        heart_rate: "",
        previous_hospitalization: "No"
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predicting, setPredicting] = useState(false);
    const [error, setError] = useState("");
    const [saveMessage, setSaveMessage] = useState("");

    // ==========================================
    // LOAD PATIENTS
    // ==========================================

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const response = await api.get("/patients");

                const patientList = response.data.patients || [];

                setPatients(patientList);

                const patientId = searchParams.get("patient");

                if (patientId) {
                    const foundPatient = patientList.find(
                        (patient) =>
                            String(patient.id) === String(patientId)
                    );

                    if (foundPatient) {
                        setSelectedPatient(foundPatient);

                        setForm((previous) => ({
                            ...previous,
                            age: foundPatient.age || ""
                        }));
                    }
                }
            } catch (err) {
                console.error("Patient loading error:", err);
                setError("Unable to load patients.");
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, [searchParams]);

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // SELECT PATIENT
    // ==========================================

    const handlePatientChange = (e) => {
        const patientId = e.target.value;

        const patient = patients.find(
            (p) => String(p.id) === String(patientId)
        );

        setSelectedPatient(patient || null);

        if (patient) {
            setForm((previous) => ({
                ...previous,
                age: patient.age || ""
            }));
        }
    };

    // ==========================================
    // CALCULATE RISK
    // ==========================================

    const calculateRisk = () => {
        let score = 0;

        const age = Number(form.age);
        const bloodPressure = Number(form.blood_pressure);
        const glucose = Number(form.glucose);
        const bmi = Number(form.bmi);
        const heartRate = Number(form.heart_rate);

        // Age
        if (age >= 60) {
            score += 20;
        } else if (age >= 45) {
            score += 10;
        }

        // Blood Pressure
        if (bloodPressure >= 160) {
            score += 25;
        } else if (bloodPressure >= 140) {
            score += 15;
        }

        // Glucose
        if (glucose >= 180) {
            score += 20;
        } else if (glucose >= 140) {
            score += 10;
        }

        // BMI
        if (bmi >= 30) {
            score += 15;
        } else if (bmi >= 25) {
            score += 8;
        }

        // Heart Rate
        if (heartRate >= 100) {
            score += 10;
        }

        // Previous Hospitalization
        if (form.previous_hospitalization === "Yes") {
            score += 10;
        }

        score = Math.min(score, 100);

        let riskLevel = "LOW";

        if (score >= 60) {
            riskLevel = "HIGH";
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
        }

        return {
            score,
            riskLevel
        };
    };

    // ==========================================
    // RUN PREDICTION
    // ==========================================

    const handlePredict = async (e) => {
        e.preventDefault();

        setError("");
        setSaveMessage("");
        setResult(null);

        // Check patient
        if (!selectedPatient) {
            setError("Please select a patient.");
            return;
        }

        // Check inputs
        if (
            !form.age ||
            !form.blood_pressure ||
            !form.glucose ||
            !form.bmi ||
            !form.heart_rate
        ) {
            setError("Please fill all health parameters.");
            return;
        }

        setPredicting(true);

        try {
            // ------------------------------------------
            // 1. CALCULATE PREDICTION
            // ------------------------------------------

            const prediction = calculateRisk();

            // ------------------------------------------
            // 2. SHOW RESULT IMMEDIATELY
            // ------------------------------------------

            setResult(prediction);

            // ------------------------------------------
            // 3. SAVE PREDICTION TO DATABASE
            // ------------------------------------------

            try {
                const response = await api.post(
                    "/predictions",
                    {
                        patient_id: selectedPatient.id,
                        age: Number(form.age),
                        blood_pressure: Number(
                            form.blood_pressure
                        ),
                        glucose: Number(form.glucose),
                        bmi: Number(form.bmi),
                        heart_rate: Number(
                            form.heart_rate
                        ),
                        previous_hospitalization:
                            form.previous_hospitalization,
                        risk_score: prediction.score,
                        risk_level: prediction.riskLevel
                    }
                );

                console.log(
                    "Prediction saved:",
                    response.data
                );

                setSaveMessage(
                    "✓ Prediction saved successfully."
                );
            } catch (saveError) {
                console.error(
                    "Prediction database error:",
                    saveError
                );

                setSaveMessage(
                    "Prediction generated, but database saving failed."
                );
            }
        } catch (err) {
            console.error(
                "Prediction error:",
                err
            );

            setError(
                "Unable to generate prediction."
            );
        } finally {
            setPredicting(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="page-loading">
                Loading patients...
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="risk-page">

            {/* HEADER */}

            <div className="risk-header">

                <div>

                    <button
                        className="back-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        AI Risk Prediction
                    </h1>

                    <p>
                        Analyze patient health parameters
                        and estimate clinical risk.
                    </p>

                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="risk-error">
                    ⚠️ {error}
                </div>
            )}

            {/* MAIN */}

            <div className="risk-layout">

                {/* ==================================
                    ASSESSMENT CARD
                ================================== */}

                <div className="risk-card">

                    <div className="card-title">

                        <div className="title-icon">
                            🧠
                        </div>

                        <div>
                            <h2>
                                Patient Assessment
                            </h2>

                            <p>
                                Enter the patient's current
                                health information.
                            </p>
                        </div>

                    </div>

                    <form onSubmit={handlePredict}>

                        {/* PATIENT */}

                        <div className="form-group">

                            <label>
                                Select Patient
                            </label>

                            <select
                                value={
                                    selectedPatient?.id || ""
                                }
                                onChange={
                                    handlePatientChange
                                }
                            >

                                <option value="">
                                    Choose a patient
                                </option>

                                {patients.map(
                                    (patient) => (
                                        <option
                                            key={
                                                patient.id
                                            }
                                            value={
                                                patient.id
                                            }
                                        >
                                            {
                                                patient.patient_id
                                            }{" "}
                                            -{" "}
                                            {patient.name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {/* INPUT GRID */}

                        <div className="form-grid">

                            {/* AGE */}

                            <div className="form-group">

                                <label>
                                    Age
                                </label>

                                <input
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 62"
                                />

                            </div>

                            {/* BLOOD PRESSURE */}

                            <div className="form-group">

                                <label>
                                    Blood Pressure
                                </label>

                                <input
                                    type="number"
                                    name="blood_pressure"
                                    value={
                                        form.blood_pressure
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Systolic e.g. 140"
                                />

                            </div>

                            {/* GLUCOSE */}

                            <div className="form-group">

                                <label>
                                    Glucose Level
                                </label>

                                <input
                                    type="number"
                                    name="glucose"
                                    value={form.glucose}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="mg/dL"
                                />

                            </div>

                            {/* BMI */}

                            <div className="form-group">

                                <label>
                                    BMI
                                </label>

                                <input
                                    type="number"
                                    step="0.1"
                                    name="bmi"
                                    value={form.bmi}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 24.5"
                                />

                            </div>

                            {/* HEART RATE */}

                            <div className="form-group">

                                <label>
                                    Heart Rate
                                </label>

                                <input
                                    type="number"
                                    name="heart_rate"
                                    value={
                                        form.heart_rate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="BPM"
                                />

                            </div>

                            {/* HOSPITALIZATION */}

                            <div className="form-group">

                                <label>
                                    Previous Hospitalization
                                </label>

                                <select
                                    name="previous_hospitalization"
                                    value={
                                        form.previous_hospitalization
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="No">
                                        No
                                    </option>

                                    <option value="Yes">
                                        Yes
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="predict-btn"
                            disabled={predicting}
                        >
                            {predicting
                                ? "Analyzing..."
                                : "🧠 Run AI Risk Analysis"}
                        </button>

                    </form>

                </div>

                {/* ==================================
                    RESULT CARD
                ================================== */}

                <div className="risk-result-card">

                    {!result ? (

                        <div className="empty-result">

                            <div className="empty-icon">
                                🩺
                            </div>

                            <h2>
                                Prediction Result
                            </h2>

                            <p>
                                Complete the assessment
                                to generate the patient's
                                risk prediction.
                            </p>

                        </div>

                    ) : (

                        <div className="prediction-result">

                            <div className="result-icon">

                                {result.riskLevel ===
                                "HIGH"
                                    ? "⚠️"
                                    : result.riskLevel ===
                                      "MEDIUM"
                                    ? "⚡"
                                    : "✓"}

                            </div>

                            <p className="result-label">
                                RISK LEVEL
                            </p>

                            <h2
                                className={`risk-level ${result.riskLevel.toLowerCase()}`}
                            >
                                {result.riskLevel}
                            </h2>

                            {/* SCORE */}

                            <div className="score-circle">

                                <strong>
                                    {result.score}
                                </strong>

                                <span>
                                    / 100
                                </span>

                            </div>

                            {/* PATIENT */}

                            <p className="result-patient">
                                Patient:{" "}
                                <strong>
                                    {selectedPatient?.name}
                                </strong>
                            </p>

                            {/* MESSAGE */}

                            <div className="result-message">

                                {result.riskLevel ===
                                    "HIGH" && (
                                    <>
                                        The patient shows
                                        several high-risk
                                        indicators and may
                                        require closer
                                        clinical monitoring.
                                    </>
                                )}

                                {result.riskLevel ===
                                    "MEDIUM" && (
                                    <>
                                        The patient has
                                        moderate risk
                                        indicators.
                                        Consider regular
                                        monitoring and
                                        preventive care.
                                    </>
                                )}

                                {result.riskLevel ===
                                    "LOW" && (
                                    <>
                                        The patient currently
                                        shows relatively
                                        low-risk indicators.
                                    </>
                                )}

                            </div>

                            {/* SAVE STATUS */}

                            {saveMessage && (
                                <div
                                    style={{
                                        marginBottom:
                                            "16px",
                                        fontSize:
                                            "13px",
                                        color:
                                            saveMessage.includes(
                                                "successfully"
                                            )
                                                ? "#16805c"
                                                : "#b7791f"
                                    }}
                                >
                                    {saveMessage}
                                </div>
                            )}

                            {/* VIEW PATIENT */}

                            <button
                                className="view-patient-btn"
                                onClick={() =>
                                    navigate(
                                        `/patients/${selectedPatient.id}`
                                    )
                                }
                            >
                                View Patient →
                            </button>

                        </div>

                    )}

                </div>

            </div>

            {/* DISCLAIMER */}

            <div className="prediction-disclaimer">

                <strong>
                    Academic AI Demonstration:
                </strong>{" "}
                This prediction is for demonstration
                purposes and is not a substitute for
                professional medical diagnosis or clinical
                decision-making.

            </div>

        </div>
    );
};

export default RiskPrediction;