import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Analytics = () => {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [treatments, setTreatments] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                // Patients
                const patientResponse =
                    await api.get("/patients");

                setPatients(
                    patientResponse.data.patients || []
                );

                // Predictions
                let predictionData = [];

                for (
                    const patient of
                    patientResponse.data.patients || []
                ) {
                    try {
                        const response =
                            await api.get(
                                `/predictions/${patient.id}`
                            );

                        predictionData = [
                            ...predictionData,
                            ...(response.data.predictions ||
                                [])
                        ];
                    } catch (err) {
                        console.log(
                            `No predictions for patient ${patient.id}`
                        );
                    }
                }

                setPredictions(predictionData);

                // Treatments
                let treatmentData = [];

                for (
                    const patient of
                    patientResponse.data.patients || []
                ) {
                    try {
                        const response =
                            await api.get(
                                `/treatments/${patient.id}`
                            );

                        treatmentData = [
                            ...treatmentData,
                            ...(response.data.treatments ||
                                [])
                        ];
                    } catch (err) {
                        console.log(
                            `No treatments for patient ${patient.id}`
                        );
                    }
                }

                setTreatments(treatmentData);

            } catch (err) {
                console.error(
                    "Analytics loading error:",
                    err
                );
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    // ==========================================
    // STATISTICS
    // ==========================================

    const highRisk = predictions.filter(
        (p) => p.risk_level === "HIGH"
    ).length;

    const mediumRisk = predictions.filter(
        (p) => p.risk_level === "MEDIUM"
    ).length;

    const lowRisk = predictions.filter(
        (p) => p.risk_level === "LOW"
    ).length;

    const ongoingTreatments = treatments.filter(
        (t) => t.status === "Ongoing"
    ).length;

    const completedTreatments = treatments.filter(
        (t) => t.status === "Completed"
    ).length;

    if (loading) {
        return (
            <div className="page-loading">
                Loading analytics...
            </div>
        );
    }

    return (
        <div className="analytics-page">

            {/* HEADER */}

            <div className="analytics-header">

                <div>

                    <button
                        className="analytics-back"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        Healthcare Analytics
                    </h1>

                    <p>
                        Overview of patients, AI predictions
                        and treatment activity.
                    </p>

                </div>

            </div>

            {/* ==================================
                STAT CARDS
            ================================== */}

            <div className="analytics-stats">

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">
                        👥
                    </div>

                    <div>
                        <span>
                            Total Patients
                        </span>

                        <strong>
                            {patients.length}
                        </strong>
                    </div>

                </div>

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">
                        🧠
                    </div>

                    <div>
                        <span>
                            AI Predictions
                        </span>

                        <strong>
                            {predictions.length}
                        </strong>
                    </div>

                </div>

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">
                        ⚠️
                    </div>

                    <div>
                        <span>
                            High Risk
                        </span>

                        <strong>
                            {highRisk}
                        </strong>
                    </div>

                </div>

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">
                        💊
                    </div>

                    <div>
                        <span>
                            Treatments
                        </span>

                        <strong>
                            {treatments.length}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ==================================
                ANALYTICS GRID
            ================================== */}

            <div className="analytics-grid">

                {/* RISK DISTRIBUTION */}

                <div className="analytics-card">

                    <div className="analytics-card-header">

                        <div>
                            <h2>
                                Risk Distribution
                            </h2>

                            <p>
                                AI prediction overview
                            </p>
                        </div>

                        <span className="analytics-icon">
                            🧠
                        </span>

                    </div>

                    <div className="risk-bars">

                        <div className="risk-bar-row">

                            <div className="risk-bar-label">
                                <span>High Risk</span>
                                <strong>
                                    {highRisk}
                                </strong>
                            </div>

                            <div className="risk-bar">
                                <div
                                    className="risk-bar-high"
                                    style={{
                                        width:
                                            predictions.length
                                                ? `${(
                                                      (highRisk /
                                                          predictions.length) *
                                                      100
                                                  ).toFixed(
                                                      0
                                                  )}%`
                                                : "0%"
                                    }}
                                />
                            </div>

                        </div>

                        <div className="risk-bar-row">

                            <div className="risk-bar-label">
                                <span>Medium Risk</span>
                                <strong>
                                    {mediumRisk}
                                </strong>
                            </div>

                            <div className="risk-bar">
                                <div
                                    className="risk-bar-medium"
                                    style={{
                                        width:
                                            predictions.length
                                                ? `${(
                                                      (mediumRisk /
                                                          predictions.length) *
                                                      100
                                                  ).toFixed(
                                                      0
                                                  )}%`
                                                : "0%"
                                    }}
                                />
                            </div>

                        </div>

                        <div className="risk-bar-row">

                            <div className="risk-bar-label">
                                <span>Low Risk</span>
                                <strong>
                                    {lowRisk}
                                </strong>
                            </div>

                            <div className="risk-bar">
                                <div
                                    className="risk-bar-low"
                                    style={{
                                        width:
                                            predictions.length
                                                ? `${(
                                                      (lowRisk /
                                                          predictions.length) *
                                                      100
                                                  ).toFixed(
                                                      0
                                                  )}%`
                                                : "0%"
                                    }}
                                />
                            </div>

                        </div>

                    </div>

                </div>

                {/* TREATMENT STATUS */}

                <div className="analytics-card">

                    <div className="analytics-card-header">

                        <div>
                            <h2>
                                Treatment Status
                            </h2>

                            <p>
                                Current treatment activity
                            </p>
                        </div>

                        <span className="analytics-icon">
                            💊
                        </span>

                    </div>

                    <div className="treatment-summary">

                        <div className="treatment-circle">

                            <strong>
                                {treatments.length}
                            </strong>

                            <span>
                                Total
                            </span>

                        </div>

                        <div className="treatment-items">

                            <div>
                                <span className="status-dot ongoing" />
                                Ongoing
                                <strong>
                                    {ongoingTreatments}
                                </strong>
                            </div>

                            <div>
                                <span className="status-dot completed" />
                                Completed
                                <strong>
                                    {completedTreatments}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==================================
                RECENT PREDICTIONS
            ================================== */}

            <div className="analytics-card analytics-table-card">

                <div className="analytics-card-header">

                    <div>
                        <h2>
                            Recent AI Predictions
                        </h2>

                        <p>
                            Latest patient risk assessments
                        </p>
                    </div>

                    <button
                        className="analytics-action"
                        onClick={() =>
                            navigate(
                                "/risk-prediction"
                            )
                        }
                    >
                        New Prediction →
                    </button>

                </div>

                {predictions.length === 0 ? (

                    <div className="analytics-empty">
                        No predictions available yet.
                    </div>

                ) : (

                    <div className="analytics-table-wrapper">

                        <table className="analytics-table">

                            <thead>
                                <tr>
                                    <th>
                                        Patient ID
                                    </th>

                                    <th>
                                        Prediction
                                    </th>

                                    <th>
                                        Risk Level
                                    </th>

                                    <th>
                                        Score
                                    </th>

                                    <th>
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {predictions
                                    .slice(0, 8)
                                    .map(
                                        (
                                            prediction
                                        ) => {

                                            const patient =
                                                patients.find(
                                                    (p) =>
                                                        String(
                                                            p.id
                                                        ) ===
                                                        String(
                                                            prediction.patient_id
                                                        )
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        prediction.id
                                                    }
                                                >

                                                    <td>
                                                        <strong>
                                                            {patient?.patient_id ||
                                                                `#${prediction.patient_id}`}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {prediction.prediction_type ||
                                                            "Health Risk Prediction"}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`analytics-risk-badge ${prediction.risk_level?.toLowerCase()}`}
                                                        >
                                                            {
                                                                prediction.risk_level
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>
                                                        {
                                                            prediction.risk_score
                                                        }
                                                        /100
                                                    </td>

                                                    <td>
                                                        {prediction.created_at
                                                            ? new Date(
                                                                  prediction.created_at
                                                              ).toLocaleDateString()
                                                            : "-"}
                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};

export default Analytics;