import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Reports = () => {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [treatments, setTreatments] = useState([]);

    const [selectedPatient, setSelectedPatient] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const patientResponse = await api.get("/patients");

                const patientList =
                    patientResponse.data.patients || [];

                setPatients(patientList);

                let predictionList = [];
                let treatmentList = [];

                for (const patient of patientList) {
                    try {
                        const predictionResponse =
                            await api.get(
                                `/predictions/${patient.id}`
                            );

                        predictionList = [
                            ...predictionList,
                            ...(predictionResponse.data.predictions || [])
                        ];
                    } catch (err) {
                        console.log("Prediction fetch skipped");
                    }

                    try {
                        const treatmentResponse =
                            await api.get(
                                `/treatments/${patient.id}`
                            );

                        treatmentList = [
                            ...treatmentList,
                            ...(treatmentResponse.data.treatments || [])
                        ];
                    } catch (err) {
                        console.log("Treatment fetch skipped");
                    }
                }

                setPredictions(predictionList);
                setTreatments(treatmentList);
            } catch (err) {
                console.error("Report loading error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const selectedPatientData = patients.find(
        (patient) =>
            String(patient.id) === String(selectedPatient)
    );

    const patientPredictions = predictions.filter(
        (prediction) =>
            String(prediction.patient_id) ===
            String(selectedPatient)
    );

    const patientTreatments = treatments.filter(
        (treatment) =>
            String(treatment.patient_id) ===
            String(selectedPatient)
    );

    const latestPrediction = patientPredictions[0];

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading reports...
            </div>
        );
    }

    return (
        <div className="reports-page">

            {/* HEADER */}

            <div className="reports-header">

                <div>
                    <button
                        className="reports-back"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1>Healthcare Reports</h1>

                    <p>
                        Generate a consolidated report for
                        patient health, risk and treatment.
                    </p>
                </div>

                <button
                    className="print-report-btn"
                    onClick={handlePrint}
                    disabled={!selectedPatientData}
                >
                    🖨️ Print Report
                </button>

            </div>

            {/* PATIENT SELECT */}

            <div className="report-select-card">

                <label>Select Patient</label>

                <select
                    value={selectedPatient}
                    onChange={(e) =>
                        setSelectedPatient(e.target.value)
                    }
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

            {!selectedPatientData ? (

                <div className="report-empty">

                    <div className="report-empty-icon">
                        📄
                    </div>

                    <h2>
                        Patient Report
                    </h2>

                    <p>
                        Select a patient to generate their
                        healthcare report.
                    </p>

                </div>

            ) : (

                <div className="report-document">

                    {/* REPORT TITLE */}

                    <div className="report-title">

                        <div>
                            <span>
                                FINAL HEALTHCARE
                            </span>

                            <h2>
                                Patient Health Report
                            </h2>
                        </div>

                        <div className="report-date">
                            Generated:{" "}
                            {new Date().toLocaleDateString()}
                        </div>

                    </div>

                    {/* PATIENT INFORMATION */}

                    <section className="report-section">

                        <div className="report-section-title">
                            <span>👤</span>
                            Patient Information
                        </div>

                        <div className="report-info-grid">

                            <div>
                                <label>Patient ID</label>
                                <strong>
                                    {
                                        selectedPatientData.patient_id
                                    }
                                </strong>
                            </div>

                            <div>
                                <label>Name</label>
                                <strong>
                                    {
                                        selectedPatientData.name
                                    }
                                </strong>
                            </div>

                            <div>
                                <label>Age</label>
                                <strong>
                                    {
                                        selectedPatientData.age ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                            <div>
                                <label>Gender</label>
                                <strong>
                                    {
                                        selectedPatientData.gender ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                            <div>
                                <label>Blood Group</label>
                                <strong>
                                    {
                                        selectedPatientData.blood_group ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                            <div>
                                <label>Contact</label>
                                <strong>
                                    {
                                        selectedPatientData.contact ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                        </div>

                    </section>

                    {/* MEDICAL INFORMATION */}

                    <section className="report-section">

                        <div className="report-section-title">
                            <span>🩺</span>
                            Medical Information
                        </div>

                        <div className="report-medical-box">

                            <div>
                                <label>
                                    Medical History
                                </label>

                                <p>
                                    {
                                        selectedPatientData.medical_history ||
                                        "No medical history recorded."
                                    }
                                </p>
                            </div>

                            <div>
                                <label>
                                    Existing Diseases
                                </label>

                                <p>
                                    {
                                        selectedPatientData.existing_diseases ||
                                        "No existing diseases recorded."
                                    }
                                </p>
                            </div>

                        </div>

                    </section>

                    {/* AI RISK */}

                    <section className="report-section">

                        <div className="report-section-title">
                            <span>🧠</span>
                            AI Risk Assessment
                        </div>

                        {latestPrediction ? (

                            <div className="report-risk-box">

                                <div>
                                    <label>
                                        Risk Level
                                    </label>

                                    <span
                                        className={`report-risk-badge ${latestPrediction.risk_level?.toLowerCase()}`}
                                    >
                                        {
                                            latestPrediction.risk_level
                                        }
                                    </span>
                                </div>

                                <div>
                                    <label>
                                        Risk Score
                                    </label>

                                    <strong className="report-score">
                                        {
                                            latestPrediction.risk_score
                                        }
                                        /100
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Prediction Type
                                    </label>

                                    <strong>
                                        {
                                            latestPrediction.prediction_type ||
                                            "Health Risk Prediction"
                                        }
                                    </strong>
                                </div>

                            </div>

                        ) : (

                            <div className="report-no-data">
                                No AI risk prediction available
                                for this patient.
                            </div>

                        )}

                    </section>

                    {/* TREATMENTS */}

                    <section className="report-section">

                        <div className="report-section-title">
                            <span>💊</span>
                            Treatment History
                        </div>

                        {patientTreatments.length === 0 ? (

                            <div className="report-no-data">
                                No treatment records available.
                            </div>

                        ) : (

                            <div className="report-treatment-list">

                                {patientTreatments
                                    .slice(0, 5)
                                    .map((treatment) => (

                                        <div
                                            className="report-treatment"
                                            key={treatment.id}
                                        >

                                            <div>
                                                <label>
                                                    Diagnosis
                                                </label>

                                                <strong>
                                                    {
                                                        treatment.diagnosis
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <label>
                                                    Treatment Plan
                                                </label>

                                                <strong>
                                                    {
                                                        treatment.treatment_plan
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <label>
                                                    Medication
                                                </label>

                                                <strong>
                                                    {
                                                        treatment.medication ||
                                                        "N/A"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <label>
                                                    Status
                                                </label>

                                                <span
                                                    className="report-status"
                                                >
                                                    {
                                                        treatment.status
                                                    }
                                                </span>
                                            </div>

                                        </div>

                                    ))}

                            </div>

                        )}

                    </section>

                    {/* FOOTER */}

                    <div className="report-footer">
                        <strong>
                            Final Healthcare System
                        </strong>

                        <span>
                            Confidential Patient Report
                        </span>
                    </div>

                </div>
            )}

        </div>
    );
};

export default Reports;