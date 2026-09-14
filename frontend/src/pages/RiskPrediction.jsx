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

                const patientList =
                    response.data.patients || [];

                setPatients(patientList);

                const patientId =
                    searchParams.get("patient");

                if (patientId) {
                    const foundPatient =
                        patientList.find(
                            (patient) =>
                                String(patient.id) ===
                                String(patientId)
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
                console.error(
                    "Patient loading error:",
                    err
                );

                setError(
                    "Unable to load patients."
                );
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
            (p) =>
                String(p.id) ===
                String(patientId)
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
    // RUN AI PREDICTION
    // ==========================================

    const handlePredict = async (e) => {
        e.preventDefault();

        setError("");
        setSaveMessage("");
        setResult(null);

        // Validate patient
        if (!selectedPatient) {
            setError("Please select a patient.");
            return;
        }

        // Validate fields
        if (
            form.age === "" ||
            form.blood_pressure === "" ||
            form.glucose === "" ||
            form.bmi === "" ||
            form.heart_rate === ""
        ) {
            setError(
                "Please fill all health parameters."
            );
            return;
        }

        setPredicting(true);

        try {
            // ======================================
            // 1. CALL AI SERVICE DIRECTLY
            // ======================================

            const aiResponse = await fetch(
                "http://127.0.0.1:8001/predict-risk",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        age: Number(form.age),

                        blood_pressure: Number(
                            form.blood_pressure
                        ),

                        blood_sugar: Number(
                            form.glucose
                        ),

                        heart_rate: Number(
                            form.heart_rate
                        ),

                        previous_hospitalizations:
                            form.previous_hospitalization ===
                            "Yes"
                                ? 1
                                : 0,

                        // Current UI does not contain
                        // chronic disease count.
                        chronic_disease_count: 0
                    })
                }
            );

            if (!aiResponse.ok) {
                let errorMessage =
                    "AI prediction failed.";

                try {
                    const errorData =
                        await aiResponse.json();

                    errorMessage =
                        errorData.detail ||
                        errorData.message ||
                        errorMessage;
                } catch {
                    // Keep default error message
                }

                throw new Error(errorMessage);
            }

            const aiData =
                await aiResponse.json();

            console.log(
                "AI Risk Prediction Response:",
                aiData
            );

            // ======================================
            // 2. EXTRACT AI RESULT
            // ======================================

            const aiResult =
                aiData.prediction_result || {};

            const rawScore =
                aiResult.risk_score ??
                aiResult.score ??
                aiResult.probability ??
                0;

            const score = Number(rawScore);

            const riskLevel = String(
                aiResult.risk_level ??
                aiResult.riskLevel ??
                "LOW"
            ).toUpperCase();

            const predictionResult = {
                score: Number(score.toFixed(2)),
                riskLevel: riskLevel,
                contributingFactors:
                    aiResult.contributing_factors ||
                    aiResult.contributingFactors ||
                    [],
                recommendation:
                    aiResult.recommendation ||
                    "Continue regular healthcare monitoring."
            };

            // ======================================
            // 3. DISPLAY AI RESULT
            // ======================================

            setResult(predictionResult);

            setSaveMessage(
                "✓ AI prediction generated successfully."
            );

            // ======================================
            // 4. SAVE PREDICTION TO DATABASE
            // ======================================

            try {
                const saveResponse = await api.post(
                    "/predictions",
                    {
                        patient_id:
                            selectedPatient.id,

                        age: Number(form.age),

                        blood_pressure: Number(
                            form.blood_pressure
                        ),

                        glucose: Number(
                            form.glucose
                        ),

                        bmi: Number(form.bmi),

                        heart_rate: Number(
                            form.heart_rate
                        ),

                        previous_hospitalization:
                            form.previous_hospitalization,

                        risk_score:
                            predictionResult.score,

                        risk_level:
                            predictionResult.riskLevel
                    }
                );

                console.log(
                    "Prediction saved to database:",
                    saveResponse.data
                );

                setSaveMessage(
                    "✓ AI prediction generated and saved successfully."
                );
            } catch (saveError) {
                console.error(
                    "Database save error:",
                    saveError
                );

                // The AI result is still displayed even
                // if database saving fails.
                setSaveMessage(
                    "✓ AI prediction generated. Database saving was unavailable."
                );
            }
        } catch (err) {
            console.error(
                "AI Risk Prediction error:",
                err
            );

            setError(
                err.message ||
                "Unable to generate AI prediction."
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
                                    selectedPatient?.id ||
                                    ""
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
                                    min="0"
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
                                    min="0"
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
                                    min="0"
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
                                    min="0"
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
                                    min="0"
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
                                    {Number(
                                        result.score
                                    ).toFixed(2)}
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

                            {/* CONTRIBUTING FACTORS */}

                            {result.contributingFactors &&
                                result.contributingFactors.length >
                                    0 && (
                                    <div className="ai-explanation">
                                        <h3>
                                            Contributing Factors
                                        </h3>

                                        <ul>
                                            {result.contributingFactors.map(
                                                (
                                                    factor,
                                                    index
                                                ) => (
                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {factor}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}

                            {/* AI RECOMMENDATION */}

                            {result.recommendation && (
                                <div className="ai-recommendation">
                                    <h3>
                                        AI Recommendation
                                    </h3>

                                    <p>
                                        {
                                            result.recommendation
                                        }
                                    </p>
                                </div>
                            )}

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