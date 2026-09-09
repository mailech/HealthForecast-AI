import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const response = await api.get("/patients");

                if (response.data.success) {
                    setPatients(response.data.patients || []);
                }
            } catch (error) {
                console.error("Failed to load patients:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-page">

            {/* SIDEBAR */}
            <aside className="dashboard-sidebar">

                <div className="dashboard-brand">
                    <div className="dashboard-brand-icon">+</div>

                    <div>
                        <h2>Final Healthcare</h2>
                        <span>Healthcare Platform</span>
                    </div>
                </div>

                <nav className="dashboard-nav">

                    <button className="nav-item active">
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button
                        className="nav-item"
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

                <div className="sidebar-bottom">

                    <div className="doctor-mini">

                        <div className="doctor-avatar">
                            {user?.name?.charAt(0) || "D"}
                        </div>

                        <div>
                            <strong>{user?.name || "Doctor"}</strong>
                            <span>Doctor</span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        ⇥ &nbsp; Logout
                    </button>

                </div>

            </aside>


            {/* MAIN CONTENT */}
            <main className="dashboard-main">

                {/* TOP BAR */}
                <header className="dashboard-header">

                    <div>
                        <p className="dashboard-label">
                            OVERVIEW
                        </p>

                        <h1>Good evening, Dr. {user?.name?.replace(/^Dr\.\s*/i, "") || "Doctor"}</h1>

                        <p className="dashboard-subtitle">
                            Here's what's happening with your patients today.
                        </p>
                    </div>

                    <div className="header-actions">

                        <button className="notification-button">
                            ♢
                            <span></span>
                        </button>

                        <div className="header-profile">
                            <div className="header-avatar">
                                {user?.name?.charAt(0) || "D"}
                            </div>

                            <div>
                                <strong>{user?.name || "Doctor"}</strong>
                                <small>Doctor</small>
                            </div>
                        </div>

                    </div>

                </header>


                {/* STAT CARDS */}
                <section className="stat-grid">

                    <div className="dashboard-stat">
                        <div className="stat-top">
                            <div className="stat-icon patients-icon">
                                ♙
                            </div>

                            <span className="stat-change">
                                +12%
                            </span>
                        </div>

                        <p>Total Patients</p>

                        <h2>
                            {loading ? "..." : patients.length}
                        </h2>

                        <span className="stat-description">
                            Patients under care
                        </span>
                    </div>


                    <div className="dashboard-stat">
                        <div className="stat-top">
                            <div className="stat-icon risk-icon">
                                !
                            </div>

                            <span className="risk-label">
                                Attention
                            </span>
                        </div>

                        <p>High-Risk Patients</p>

                        <h2>0</h2>

                        <span className="stat-description">
                            Require closer monitoring
                        </span>
                    </div>


                    <div className="dashboard-stat">
                        <div className="stat-top">
                            <div className="stat-icon ai-icon">
                                ✦
                            </div>

                            <span className="ai-label">
                                AI
                            </span>
                        </div>

                        <p>AI Predictions</p>

                        <h2>0</h2>

                        <span className="stat-description">
                            Risk assessments
                        </span>
                    </div>


                    <div className="dashboard-stat">
                        <div className="stat-top">
                            <div className="stat-icon admission-icon">
                                ↗
                            </div>

                            <span className="stat-change">
                                This month
                            </span>
                        </div>

                        <p>Readmissions</p>

                        <h2>0</h2>

                        <span className="stat-description">
                            Readmission cases
                        </span>
                    </div>

                </section>


                {/* CONTENT GRID */}
                <section className="dashboard-content-grid">

                    {/* RISK OVERVIEW */}
                    <div className="dashboard-panel risk-panel">

                        <div className="panel-header">

                            <div>
                                <h3>Patient Risk Overview</h3>

                                <p>
                                    Current risk distribution
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate("/risk-prediction")
                                }
                            >
                                View analysis →
                            </button>

                        </div>

                        <div className="risk-overview">

                            <div className="risk-circle">

                                <div>
                                    <strong>0%</strong>
                                    <span>High Risk</span>
                                </div>

                            </div>

                            <div className="risk-legend">

                                <div>
                                    <span className="legend-dot low"></span>

                                    <div>
                                        <strong>Low Risk</strong>
                                        <small>0 patients</small>
                                    </div>
                                </div>

                                <div>
                                    <span className="legend-dot medium"></span>

                                    <div>
                                        <strong>Medium Risk</strong>
                                        <small>0 patients</small>
                                    </div>
                                </div>

                                <div>
                                    <span className="legend-dot high"></span>

                                    <div>
                                        <strong>High Risk</strong>
                                        <small>0 patients</small>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* QUICK ACTIONS */}
                    <div className="dashboard-panel">

                        <div className="panel-header">

                            <div>
                                <h3>Quick Actions</h3>

                                <p>
                                    Commonly used tools
                                </p>
                            </div>

                        </div>

                        <div className="quick-actions">

                            <button
                                onClick={() =>
                                    navigate("/patients")
                                }
                            >
                                <span>♙</span>

                                <div>
                                    <strong>View Patients</strong>
                                    <small>Manage patient records</small>
                                </div>

                                <b>→</b>
                            </button>


                            <button
                                onClick={() =>
                                    navigate("/risk-prediction")
                                }
                            >
                                <span>✦</span>

                                <div>
                                    <strong>AI Risk Analysis</strong>
                                    <small>Analyze patient health risk</small>
                                </div>

                                <b>→</b>
                            </button>


                            <button
                                onClick={() =>
                                    navigate("/reports")
                                }
                            >
                                <span>▤</span>

                                <div>
                                    <strong>Generate Report</strong>
                                    <small>Create healthcare report</small>
                                </div>

                                <b>→</b>
                            </button>

                        </div>

                    </div>

                </section>


                {/* RECENT PATIENTS */}
                <section className="dashboard-panel patients-panel">

                    <div className="panel-header">

                        <div>
                            <h3>Recent Patients</h3>

                            <p>
                                Latest patient records
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/patients")
                            }
                        >
                            View all →
                        </button>

                    </div>


                    {loading ? (

                        <div className="empty-state">
                            Loading patients...
                        </div>

                    ) : patients.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ♙
                            </div>

                            <h4>No patients yet</h4>

                            <p>
                                Patient records will appear here.
                            </p>

                            <button
                                className="primary-small-button"
                                onClick={() =>
                                    navigate("/patients")
                                }
                            >
                                Add Patient
                            </button>

                        </div>

                    ) : (

                        <div className="patient-table">

                            <div className="patient-table-header">
                                <span>Patient</span>
                                <span>Age</span>
                                <span>Gender</span>
                                <span>Blood Group</span>
                                <span>Status</span>
                            </div>

                            {patients.slice(0, 5).map((patient) => (

                                <div
                                    className="patient-row"
                                    key={patient.id}
                                >

                                    <div className="patient-name">

                                        <div className="patient-avatar">
                                            {patient.name?.charAt(0)}
                                        </div>

                                        <div>
                                            <strong>
                                                {patient.name}
                                            </strong>

                                            <small>
                                                {patient.patient_id}
                                            </small>
                                        </div>

                                    </div>

                                    <span>
                                        {patient.age}
                                    </span>

                                    <span>
                                        {patient.gender}
                                    </span>

                                    <span>
                                        {patient.blood_group || "—"}
                                    </span>

                                    <span className="status-badge">
                                        Active
                                    </span>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};

export default Dashboard;