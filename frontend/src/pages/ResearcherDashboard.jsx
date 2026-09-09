import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ResearcherDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get("/predictions/1");

            setPredictions(
                response.data.predictions || []
            );
        } catch (error) {
            console.error("Failed to fetch research data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="researcher-layout">

            {/* Sidebar */}

            <aside className="researcher-sidebar">

                <div className="researcher-brand">
                    <div className="researcher-logo">
                        AI
                    </div>

                    <div>
                        <strong>HealthAI</strong>
                        <span>Research Portal</span>
                    </div>
                </div>


                <div className="researcher-nav">

                    <p className="researcher-nav-title">
                        RESEARCH
                    </p>

                    <button
                        className="researcher-nav-item active"
                        onClick={() =>
                            navigate("/researcher-dashboard")
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button
                        className="researcher-nav-item"
                        onClick={() =>
                            navigate("/risk-prediction")
                        }
                    >
                        <span>◉</span>
                        AI Predictions
                    </button>

                    <button
                        className="researcher-nav-item"
                        onClick={() =>
                            navigate("/readmission")
                        }
                    >
                        <span>↻</span>
                        Readmission
                    </button>

                    <button
                        className="researcher-nav-item"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >
                        <span>▥</span>
                        Analytics
                    </button>

                    <button
                        className="researcher-nav-item"
                        onClick={() =>
                            navigate("/reports")
                        }
                    >
                        <span>▤</span>
                        Reports
                    </button>

                </div>


                {/* Bottom */}

                <div className="researcher-sidebar-bottom">

                    <div className="researcher-user">

                        <div className="researcher-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "R"}
                        </div>

                        <div>
                            <strong>
                                {user?.name || "Researcher"}
                            </strong>

                            <span>
                                Researcher
                            </span>
                        </div>

                    </div>

                    <button
                        className="researcher-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* Main Content */}

            <main className="researcher-main">

                <div className="researcher-header">

                    <div>
                        <p className="researcher-eyebrow">
                            RESEARCH & AI
                        </p>

                        <h1>
                            Research Dashboard
                        </h1>

                        <p>
                            Monitor AI predictions, readmission
                            patterns and healthcare analytics.
                        </p>
                    </div>

                </div>


                {/* Stats */}

                <div className="researcher-stats">

                    <div className="researcher-stat-card">
                        <div className="researcher-stat-icon">
                            ◉
                        </div>

                        <div>
                            <span>AI Predictions</span>
                            <strong>
                                {loading ? "..." : predictions.length}
                            </strong>
                        </div>
                    </div>


                    <div className="researcher-stat-card">
                        <div className="researcher-stat-icon">
                            ⚕
                        </div>

                        <div>
                            <span>Research Data</span>
                            <strong>Available</strong>
                        </div>
                    </div>


                    <div className="researcher-stat-card">
                        <div className="researcher-stat-icon">
                            ▥
                        </div>

                        <div>
                            <span>Analytics</span>
                            <strong>Active</strong>
                        </div>
                    </div>

                </div>


                {/* Modules */}

                <section className="researcher-section">

                    <div className="researcher-section-heading">
                        <div>
                            <h2>Research Modules</h2>

                            <p>
                                Access healthcare AI and analytical tools.
                            </p>
                        </div>
                    </div>


                    <div className="researcher-module-grid">

                        <button
                            className="researcher-module-card"
                            onClick={() =>
                                navigate("/risk-prediction")
                            }
                        >
                            <div className="researcher-module-icon">
                                ◉
                            </div>

                            <div>
                                <h3>AI Risk Prediction</h3>

                                <p>
                                    Review patient risk prediction
                                    results and contributing factors.
                                </p>
                            </div>

                            <span>→</span>
                        </button>


                        <button
                            className="researcher-module-card"
                            onClick={() =>
                                navigate("/readmission")
                            }
                        >
                            <div className="researcher-module-icon">
                                ↻
                            </div>

                            <div>
                                <h3>Readmission Analysis</h3>

                                <p>
                                    Analyze hospital readmission
                                    information and trends.
                                </p>
                            </div>

                            <span>→</span>
                        </button>


                        <button
                            className="researcher-module-card"
                            onClick={() =>
                                navigate("/analytics")
                            }
                        >
                            <div className="researcher-module-icon">
                                ▥
                            </div>

                            <div>
                                <h3>Healthcare Analytics</h3>

                                <p>
                                    Explore healthcare statistics
                                    and system-level insights.
                                </p>
                            </div>

                            <span>→</span>
                        </button>


                        <button
                            className="researcher-module-card"
                            onClick={() =>
                                navigate("/reports")
                            }
                        >
                            <div className="researcher-module-icon">
                                ▤
                            </div>

                            <div>
                                <h3>Research Reports</h3>

                                <p>
                                    Generate and view healthcare
                                    research reports.
                                </p>
                            </div>

                            <span>→</span>
                        </button>

                    </div>

                </section>


                {/* Recent Predictions */}

                <section className="researcher-section">

                    <div className="researcher-section-heading">

                        <div>
                            <h2>Recent AI Predictions</h2>

                            <p>
                                Latest prediction records available
                                for research.
                            </p>
                        </div>

                    </div>


                    <div className="researcher-table-card">

                        {loading ? (

                            <div className="researcher-loading">
                                Loading research data...
                            </div>

                        ) : predictions.length === 0 ? (

                            <div className="researcher-empty">
                                No prediction records available yet.
                            </div>

                        ) : (

                            <table className="researcher-table">

                                <thead>
                                    <tr>
                                        <th>Patient ID</th>
                                        <th>Prediction</th>
                                        <th>Risk Level</th>
                                        <th>Risk Score</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {predictions.slice(0, 5).map(
                                        (prediction) => (

                                            <tr key={prediction.id}>

                                                <td>
                                                    {prediction.patient_id}
                                                </td>

                                                <td>
                                                    {prediction.prediction_type}
                                                </td>

                                                <td>
                                                    {prediction.risk_level}
                                                </td>

                                                <td>
                                                    {prediction.risk_score}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
};

export default ResearcherDashboard;