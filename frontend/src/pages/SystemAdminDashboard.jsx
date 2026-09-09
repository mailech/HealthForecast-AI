import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SystemAdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [users, setUsers] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSystemData();
    }, []);

    const loadSystemData = async () => {
        try {
            const [usersResponse, patientsResponse] =
                await Promise.all([
                    api.get("/users"),
                    api.get("/patients")
                ]);

            setUsers(usersResponse.data.users || []);
            setPatients(
                patientsResponse.data.patients || []
            );

        } catch (error) {
            console.error("System admin error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="system-admin-loading">
                Loading System Administration...
            </div>
        );
    }

    const doctors = users.filter(
        (u) => u.role === "doctor"
    ).length;

    const researchers = users.filter(
        (u) => u.role === "researcher"
    ).length;

    const administrators = users.filter(
        (u) =>
            u.role === "hospital_admin" ||
            u.role === "admin" ||
            u.role === "system_admin"
    ).length;

    return (
        <div className="system-admin-layout">

            {/* SIDEBAR */}

            <aside className="system-admin-sidebar">

                <div className="system-admin-brand">

                    <div className="system-admin-logo">
                        +
                    </div>

                    <div>
                        <strong>Final Healthcare</strong>
                        <span>System Administration</span>
                    </div>

                </div>


                <div className="system-admin-nav">

                    <p>SYSTEM</p>

                    <button
                        className="system-admin-nav-item active"
                        onClick={() =>
                            navigate("/system-admin-dashboard")
                        }
                    >
                        ▦ &nbsp; Dashboard
                    </button>

                    <button
                        className="system-admin-nav-item"
                        onClick={() =>
                            navigate("/users")
                        }
                    >
                        👥 &nbsp; User Management
                    </button>

                    <button
                        className="system-admin-nav-item"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >
                        ▥ &nbsp; System Analytics
                    </button>

                    <button
                        className="system-admin-nav-item"
                        onClick={() =>
                            navigate("/reports")
                        }
                    >
                        ▤ &nbsp; Reports
                    </button>

                </div>


                <div className="system-admin-bottom">

                    <div className="system-admin-user">

                        <div className="system-admin-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>

                        <div>
                            <strong>
                                {user?.name || "System Administrator"}
                            </strong>

                            <span>
                                System Administrator
                            </span>
                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="system-admin-logout"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* MAIN */}

            <main className="system-admin-main">

                <div className="system-admin-header">

                    <p>SYSTEM ADMINISTRATION</p>

                    <h1>System Administrator</h1>

                    <span>
                        Monitor users, patients and overall
                        healthcare system activity.
                    </span>

                </div>


                {/* STATS */}

                <div className="system-admin-stats">

                    <div className="system-admin-card">
                        <div>👥</div>
                        <span>Total Users</span>
                        <strong>{users.length}</strong>
                    </div>

                    <div className="system-admin-card">
                        <div>👨‍⚕️</div>
                        <span>Doctors</span>
                        <strong>{doctors}</strong>
                    </div>

                    <div className="system-admin-card">
                        <div>🔬</div>
                        <span>Researchers</span>
                        <strong>{researchers}</strong>
                    </div>

                    <div className="system-admin-card">
                        <div>🏥</div>
                        <span>Patients</span>
                        <strong>{patients.length}</strong>
                    </div>

                </div>


                {/* SYSTEM OVERVIEW */}

                <section className="system-admin-section">

                    <h2>System Overview</h2>

                    <p>
                        Current healthcare platform users and resources.
                    </p>

                    <div className="system-admin-overview">

                        <div>
                            <span>Doctors</span>
                            <strong>{doctors}</strong>
                        </div>

                        <div>
                            <span>Researchers</span>
                            <strong>{researchers}</strong>
                        </div>

                        <div>
                            <span>Administrators</span>
                            <strong>{administrators}</strong>
                        </div>

                        <div>
                            <span>Patients</span>
                            <strong>{patients.length}</strong>
                        </div>

                    </div>

                </section>


                {/* QUICK ACCESS */}

                <section className="system-admin-section">

                    <h2>Quick Access</h2>

                    <div className="system-admin-actions">

                        <button
                            onClick={() =>
                                navigate("/users")
                            }
                        >
                            <strong>User Management</strong>
                            <span>
                                Manage system users →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                navigate("/analytics")
                            }
                        >
                            <strong>System Analytics</strong>
                            <span>
                                View platform analytics →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                navigate("/reports")
                            }
                        >
                            <strong>Reports</strong>
                            <span>
                                View healthcare reports →
                            </span>
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default SystemAdminDashboard;