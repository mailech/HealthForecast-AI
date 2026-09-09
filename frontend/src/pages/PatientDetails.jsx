import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const PatientDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPatient = async () => {
            try {
                const response = await api.get(`/patients/${id}`);

                if (response.data.success) {
                    setPatient(
                        response.data.patient ||
                        response.data.data
                    );
                } else {
                    setError("Patient not found");
                }
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load patient"
                );
            } finally {
                setLoading(false);
            }
        };

        loadPatient();
    }, [id]);

    if (loading) {
        return (
            <div className="dashboard-page">
                <main className="dashboard-main">
                    <div className="empty-state">
                        Loading patient information...
                    </div>
                </main>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="dashboard-page">
                <main className="dashboard-main">

                    <button
                        className="back-button"
                        onClick={() => navigate("/patients")}
                    >
                        ← Back to Patients
                    </button>

                    <div className="empty-state">
                        <div className="empty-icon">!</div>
                        <h4>{error || "Patient not found"}</h4>
                    </div>

                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* SIDEBAR */}

            <aside className="dashboard-sidebar">

                <div className="dashboard-brand">

                    <div className="dashboard-brand-icon">
                        +
                    </div>

                    <div>
                        <h2>Final Healthcare</h2>
                        <span>Healthcare Platform</span>
                    </div>

                </div>


                <nav className="dashboard-nav">

                    <button
                        className="nav-item"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button
                        className="nav-item active"
                        onClick={() => navigate("/patients")}
                    >
                        <span>♙</span>
                        Patients
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/risk-prediction")}
                    >
                        <span>✦</span>
                        AI Risk Analysis
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/readmission")}
                    >
                        <span>↗</span>
                        Readmission
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/treatment")}
                    >
                        <span>✚</span>
                        Treatment
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/analytics")}
                    >
                        <span>◫</span>
                        Analytics
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/reports")}
                    >
                        <span>▤</span>
                        Reports
                    </button>

                </nav>

            </aside>


            {/* MAIN */}

            <main className="dashboard-main">

                {/* BACK */}

                <button
                    className="back-button"
                    onClick={() => navigate("/patients")}
                >
                    ← Back to Patients
                </button>


                {/* PATIENT HEADER */}

                <section className="patient-profile-header">

                    <div className="patient-profile-main">

                        <div className="large-patient-avatar">
                            {patient.name?.charAt(0)}
                        </div>

                        <div>

                            <p className="dashboard-label">
                                PATIENT PROFILE
                            </p>

                            <h1>{patient.name}</h1>

                            <p className="patient-id-text">
                                Patient ID: {patient.patient_id}
                            </p>

                        </div>

                    </div>


                    <div className="patient-header-actions">

                        <button
                            className="secondary-action-button"
                            onClick={() =>
                                navigate(
                                    `/treatment?patient=${patient.id}`
                                )
                            }
                        >
                            + Treatment
                        </button>

                        <button
                            className="ai-action-button"
                            onClick={() =>
                                navigate(
                                    `/risk-prediction?patient=${patient.id}`
                                )
                            }
                        >
                            ✦ AI Risk Analysis
                        </button>

                    </div>

                </section>


                {/* BASIC INFORMATION */}

                <section className="dashboard-panel patient-info-panel">

                    <div className="panel-header">

                        <div>
                            <h3>Basic Information</h3>

                            <p>
                                Patient demographic information
                            </p>
                        </div>

                    </div>


                    <div className="patient-info-grid">

                        <div className="info-item">
                            <span>Full Name</span>
                            <strong>{patient.name}</strong>
                        </div>

                        <div className="info-item">
                            <span>Patient ID</span>
                            <strong>{patient.patient_id}</strong>
                        </div>

                        <div className="info-item">
                            <span>Age</span>
                            <strong>{patient.age} years</strong>
                        </div>

                        <div className="info-item">
                            <span>Gender</span>
                            <strong>{patient.gender}</strong>
                        </div>

                        <div className="info-item">
                            <span>Contact</span>
                            <strong>
                                {patient.contact || "Not available"}
                            </strong>
                        </div>

                        <div className="info-item">
                            <span>Blood Group</span>
                            <strong>
                                {patient.blood_group || "Not available"}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* MEDICAL INFORMATION */}

                <div className="patient-details-grid">

                    <section className="dashboard-panel">

                        <div className="panel-header">

                            <div>
                                <h3>Medical History</h3>
                                <p>Previous medical information</p>
                            </div>

                        </div>

                        <div className="medical-text-box">

                            {patient.medical_history ? (
                                patient.medical_history
                            ) : (
                                "No medical history recorded."
                            )}

                        </div>

                    </section>


                    <section className="dashboard-panel">

                        <div className="panel-header">

                            <div>
                                <h3>Existing Diseases</h3>
                                <p>Known health conditions</p>
                            </div>

                        </div>

                        <div className="medical-text-box">

                            {patient.existing_diseases ? (
                                patient.existing_diseases
                            ) : (
                                "No existing diseases recorded."
                            )}

                        </div>

                    </section>

                </div>


                {/* HEALTH SUMMARY */}

                <section className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h3>Health Assessment</h3>

                            <p>
                                AI-powered patient assessment
                            </p>
                        </div>

                        <span className="assessment-badge">
                            AI READY
                        </span>

                    </div>


                    <div className="assessment-grid">

                        <div className="assessment-card">

                            <div className="assessment-icon">
                                ✦
                            </div>

                            <div>
                                <strong>Risk Prediction</strong>

                                <span>
                                    Analyze patient's health risk
                                </span>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/risk-prediction?patient=${patient.id}`
                                    )
                                }
                            >
                                Analyze →
                            </button>

                        </div>


                        <div className="assessment-card">

                            <div className="assessment-icon readmission">
                                ↗
                            </div>

                            <div>
                                <strong>Readmission Risk</strong>

                                <span>
                                    Estimate readmission probability
                                </span>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/readmission?patient=${patient.id}`
                                    )
                                }
                            >
                                Check →
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default PatientDetails;