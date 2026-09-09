import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [users, setUsers] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [usersResponse, patientsResponse] =
                await Promise.all([
                    api.get("/users"),
                    api.get("/patients")
                ]);

            setUsers(usersResponse.data.users || []);
            setPatients(patientsResponse.data.patients || []);
        } catch (error) {
            console.error(
                "Admin dashboard loading error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const doctorCount = users.filter(
        (u) => u.role === "doctor"
    ).length;

    const adminCount = users.filter(
        (u) =>
            u.role === "admin" ||
            u.role === "hospital_admin" ||
            u.role === "system_admin"
    ).length;

    const researcherCount = users.filter(
        (u) => u.role === "researcher"
    ).length;

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner"></div>
                <p>Loading administration dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="admin-sidebar">

                {/* BRAND */}

                <div className="admin-brand">

                    <div className="admin-brand-icon">
                        +
                    </div>

                    <div>
                        <h2>Final Healthcare</h2>
                        <span>
                            Administration Portal
                        </span>
                    </div>

                </div>


                {/* NAVIGATION */}

                <div className="admin-nav-section">

                    <p className="admin-nav-title">
                        ADMINISTRATION
                    </p>


                    <button
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        <span className="admin-nav-icon">
                            ▣
                        </span>

                        <span>
                            Dashboard
                        </span>
                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/users")
                        }
                    >
                        <span className="admin-nav-icon">
                            👥
                        </span>

                        <span>
                            User Management
                        </span>
                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/users")
                        }
                    >
                        <span className="admin-nav-icon">
                            👨‍⚕️
                        </span>

                        <span>
                            Doctors
                        </span>
                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/add-doctor")
                        }
                    >
                        <span className="admin-nav-icon">
                            ＋
                        </span>

                        <span>
                            Add Doctor
                        </span>
                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/patients")
                        }
                    >
                        <span className="admin-nav-icon">
                            🧑‍🤝‍🧑
                        </span>

                        <span>
                            Patients
                        </span>
                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >
                        <span className="admin-nav-icon">
                            📊
                        </span>

                        <span>
                            Analytics
                        </span>
                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/reports")
                        }
                    >
                        <span className="admin-nav-icon">
                            📄
                        </span>

                        <span>
                            Reports
                        </span>
                    </button>

                </div>


                {/* SIDEBAR BOTTOM */}

                <div className="admin-sidebar-bottom">

                    <div className="admin-user-box">

                        <div className="admin-avatar">
                            {user?.name
                                ? user.name
                                      .charAt(0)
                                      .toUpperCase()
                                : "A"}
                        </div>

                        <div className="admin-user-info">

                            <strong>
                                {user?.name ||
                                    "Hospital Administrator"}
                            </strong>

                            <span>
                                Hospital Administrator
                            </span>

                        </div>

                    </div>


                    <button
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="admin-main">

                {/* HEADER */}

                <div className="admin-page-header">

                    <div>

                        <span className="admin-eyebrow">
                            ADMINISTRATION
                        </span>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Monitor and manage the
                            healthcare system from one
                            centralized dashboard.
                        </p>

                    </div>

                </div>


                {/* =========================
                    STATISTICS
                ========================= */}

                <section className="admin-stats">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            👥
                        </div>

                        <div>
                            <span>
                                Total Users
                            </span>

                            <strong>
                                {users.length}
                            </strong>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            👨‍⚕️
                        </div>

                        <div>
                            <span>
                                Doctors
                            </span>

                            <strong>
                                {doctorCount}
                            </strong>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🧑‍🤝‍🧑
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


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🔬
                        </div>

                        <div>
                            <span>
                                Researchers
                            </span>

                            <strong>
                                {researcherCount}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =========================
                    SYSTEM MANAGEMENT
                ========================= */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <h2>
                            System Management
                        </h2>

                        <p>
                            Manage healthcare resources
                            and system information.
                        </p>

                    </div>


                    <div className="admin-management-grid">


                        {/* USER MANAGEMENT */}

                        <button
                            className="admin-management-card"
                            onClick={() =>
                                navigate("/users")
                            }
                        >

                            <div className="admin-card-icon">
                                👥
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    User Management
                                </h3>

                                <p>
                                    Manage doctors,
                                    administrators and
                                    researchers.
                                </p>

                            </div>

                            <span className="admin-card-arrow">
                                →
                            </span>

                        </button>


                        {/* DOCTORS */}

                        <button
                            className="admin-management-card"
                            onClick={() =>
                                navigate("/users")
                            }
                        >

                            <div className="admin-card-icon">
                                👨‍⚕️
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Doctors
                                </h3>

                                <p>
                                    View and manage
                                    registered doctors.
                                </p>

                            </div>

                            <span className="admin-card-arrow">
                                →
                            </span>

                        </button>


                        {/* ADD DOCTOR */}

                        <button
                            className="admin-management-card"
                            onClick={() =>
                                navigate("/add-doctor")
                            }
                        >

                            <div className="admin-card-icon">
                                ＋
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Add Doctor
                                </h3>

                                <p>
                                    Create a new doctor
                                    account securely.
                                </p>

                            </div>

                            <span className="admin-card-arrow">
                                →
                            </span>

                        </button>


                        {/* PATIENTS */}

                        <button
                            className="admin-management-card"
                            onClick={() =>
                                navigate("/patients")
                            }
                        >

                            <div className="admin-card-icon">
                                🧑‍🤝‍🧑
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Patient Management
                                </h3>

                                <p>
                                    View and manage
                                    registered patients.
                                </p>

                            </div>

                            <span className="admin-card-arrow">
                                →
                            </span>

                        </button>


                        {/* ANALYTICS */}

                        <button
                            className="admin-management-card"
                            onClick={() =>
                                navigate("/analytics")
                            }
                        >

                            <div className="admin-card-icon">
                                📊
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    System Analytics
                                </h3>

                                <p>
                                    Analyze healthcare
                                    statistics and trends.
                                </p>

                            </div>

                            <span className="admin-card-arrow">
                                →
                            </span>

                        </button>


                        {/* REPORTS */}

                        <button
                            className="admin-management-card"
                            onClick={() =>
                                navigate("/reports")
                            }
                        >

                            <div className="admin-card-icon">
                                📄
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Reports
                                </h3>

                                <p>
                                    Generate healthcare
                                    system reports.
                                </p>

                            </div>

                            <span className="admin-card-arrow">
                                →
                            </span>

                        </button>

                    </div>

                </section>


                {/* =========================
                    USER SUMMARY
                ========================= */}

                <section className="admin-summary-section">

                    <div className="admin-section-heading">

                        <div>

                            <h2>
                                User Summary
                            </h2>

                            <p>
                                Current system account
                                distribution.
                            </p>

                        </div>

                        <button
                            className="admin-summary-button"
                            onClick={() =>
                                navigate("/users")
                            }
                        >
                            Manage Users →
                        </button>

                    </div>


                    <div className="admin-summary-grid">

                        <div className="admin-summary-card">
                            <span>Doctors</span>
                            <strong>
                                {doctorCount}
                            </strong>
                        </div>

                        <div className="admin-summary-card">
                            <span>
                                Administrators
                            </span>
                            <strong>
                                {adminCount}
                            </strong>
                        </div>

                        <div className="admin-summary-card">
                            <span>
                                Researchers
                            </span>
                            <strong>
                                {researcherCount}
                            </strong>
                        </div>

                        <div className="admin-summary-card">
                            <span>
                                Total Patients
                            </span>
                            <strong>
                                {patients.length}
                            </strong>
                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default AdminDashboard;