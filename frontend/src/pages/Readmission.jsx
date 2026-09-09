import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const Readmission = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [form, setForm] = useState({
        previous_admissions: "",
        length_of_stay: "",
        chronic_conditions: "",
        age: ""
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    // Load patients
    useEffect(() => {
        const loadPatients = async () => {
            try {
                const response = await api.get("/patients");

                const list = response.data.patients || [];

                setPatients(list);

                const patientId = searchParams.get("patient");

                if (patientId) {
                    const patient = list.find(
                        (p) => String(p.id) === String(patientId)
                    );

                    if (patient) {
                        setSelectedPatient(patient);

                        setForm((prev) => ({
                            ...prev,
                            age: patient.age || ""
                        }));
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Unable to load patients.");
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, [searchParams]);

    const handlePatientChange = (e) => {
        const id = e.target.value;

        const patient = patients.find(
            (p) => String(p.id) === String(id)
        );

        setSelectedPatient(patient || null);

        if (patient) {
            setForm((prev) => ({
                ...prev,
                age: patient.age || ""
            }));
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const analyzeReadmission = (e) => {
        e.preventDefault();

        setError("");
        setResult(null);

        if (!selectedPatient) {
            setError("Please select a patient.");
            return;
        }

        if (
            !form.age ||
            !form.previous_admissions ||
            !form.length_of_stay ||
            !form.chronic_conditions
        ) {
            setError("Please fill all fields.");
            return;
        }

        setAnalyzing(true);

        let score = 0;

        const age = Number(form.age);
        const admissions = Number(form.previous_admissions);
        const stay = Number(form.length_of_stay);
        const conditions = Number(form.chronic_conditions);

        if (age >= 65) {
            score += 25;
        } else if (age >= 50) {
            score += 15;
        }

        if (admissions >= 3) {
            score += 30;
        } else if (admissions >= 1) {
            score += 15;
        }

        if (stay >= 10) {
            score += 25;
        } else if (stay >= 5) {
            score += 15;
        }

        if (conditions >= 3) {
            score += 20;
        } else if (conditions >= 1) {
            score += 10;
        }

        score = Math.min(score, 100);

        let level = "LOW";

        if (score >= 60) {
            level = "HIGH";
        } else if (score >= 30) {
            level = "MEDIUM";
        }

        setTimeout(() => {
            setResult({
                score,
                level
            });

            setAnalyzing(false);
        }, 700);
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading patients...
            </div>
        );
    }

    return (
        <div className="risk-page">

            <div className="risk-header">
                <div>
                    <button
                        className="back-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                    <h1>Readmission Risk</h1>

                    <p>
                        Identify patients who may be at risk of
                        hospital readmission.
                    </p>
                </div>
            </div>

            {error && (
                <div className="risk-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="risk-layout">

                {/* INPUT */}

                <div className="risk-card">

                    <div className="card-title">
                        <div className="title-icon">
                            🏥
                        </div>

                        <div>
                            <h2>Readmission Assessment</h2>
                            <p>
                                Enter previous hospitalization
                                information.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={analyzeReadmission}>

                        <div className="form-group">
                            <label>Select Patient</label>

                            <select
                                value={selectedPatient?.id || ""}
                                onChange={handlePatientChange}
                            >
                                <option value="">
                                    Choose a patient
                                </option>

                                {patients.map((patient) => (
                                    <option
                                        key={patient.id}
                                        value={patient.id}
                                    >
                                        {patient.patient_id} -{" "}
                                        {patient.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-grid">

                            <div className="form-group">
                                <label>Age</label>

                                <input
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={handleChange}
                                    placeholder="Age"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Previous Admissions
                                </label>

                                <input
                                    type="number"
                                    name="previous_admissions"
                                    value={
                                        form.previous_admissions
                                    }
                                    onChange={handleChange}
                                    placeholder="Number of admissions"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Length of Stay
                                </label>

                                <input
                                    type="number"
                                    name="length_of_stay"
                                    value={form.length_of_stay}
                                    onChange={handleChange}
                                    placeholder="Days"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Chronic Conditions
                                </label>

                                <input
                                    type="number"
                                    name="chronic_conditions"
                                    value={
                                        form.chronic_conditions
                                    }
                                    onChange={handleChange}
                                    placeholder="Number of conditions"
                                    min="0"
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="predict-btn"
                            disabled={analyzing}
                        >
                            {analyzing
                                ? "Analyzing..."
                                : "🏥 Analyze Readmission Risk"}
                        </button>

                    </form>
                </div>

                {/* RESULT */}

                <div className="risk-result-card">

                    {!result ? (
                        <div className="empty-result">

                            <div className="empty-icon">
                                🏥
                            </div>

                            <h2>
                                Readmission Result
                            </h2>

                            <p>
                                Complete the assessment to
                                estimate readmission risk.
                            </p>

                        </div>
                    ) : (
                        <div className="prediction-result">

                            <div className="result-icon">
                                {result.level === "HIGH"
                                    ? "⚠️"
                                    : result.level === "MEDIUM"
                                    ? "⚡"
                                    : "✓"}
                            </div>

                            <p className="result-label">
                                READMISSION RISK
                            </p>

                            <h2
                                className={`risk-level ${result.level.toLowerCase()}`}
                            >
                                {result.level}
                            </h2>

                            <div className="score-circle">
                                <strong>
                                    {result.score}
                                </strong>

                                <span>/ 100</span>
                            </div>

                            <p className="result-patient">
                                Patient:{" "}
                                <strong>
                                    {selectedPatient?.name}
                                </strong>
                            </p>

                            <div className="result-message">
                                {result.level === "HIGH" &&
                                    "The patient has several factors associated with increased readmission risk. Close follow-up may be appropriate."}

                                {result.level === "MEDIUM" &&
                                    "The patient has moderate readmission risk factors. Continued monitoring is recommended."}

                                {result.level === "LOW" &&
                                    "The patient currently shows relatively low readmission risk based on the entered factors."}
                            </div>

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

            <div className="prediction-disclaimer">
                <strong>Academic AI Demonstration:</strong>{" "}
                This assessment is for demonstration purposes
                and is not a substitute for professional medical
                diagnosis or clinical decision-making.
            </div>

        </div>
    );
};

export default Readmission;