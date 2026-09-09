import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Users = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get("/users");

            setUsers(response.data.users || []);
        } catch (err) {
            console.error("Users loading error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading users...
            </div>
        );
    }

    return (
        <div className="analytics-page">

            {/* HEADER */}

            <div className="analytics-header">

                <button
                    className="analytics-back"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ← Dashboard
                </button>

                <h1>
                    User Management
                </h1>

                <p>
                    Manage doctors, administrators and
                    researchers in the healthcare system.
                </p>

            </div>

            {/* USER STATISTICS */}

            <div className="analytics-stats">

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon">
                        👥
                    </div>

                    <div>
                        <span>Total Users</span>
                        <strong>
                            {users.length}
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon">
                        👨‍⚕️
                    </div>

                    <div>
                        <span>Doctors</span>
                        <strong>
                            {
                                users.filter(
                                    (u) =>
                                        u.role ===
                                        "doctor"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon">
                        🛡️
                    </div>

                    <div>
                        <span>Administrators</span>
                        <strong>
                            {
                                users.filter(
                                    (u) =>
                                        u.role ===
                                            "admin" ||
                                        u.role ===
                                            "hospital_admin" ||
                                        u.role ===
                                            "system_admin"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon">
                        🔬
                    </div>

                    <div>
                        <span>Researchers</span>
                        <strong>
                            {
                                users.filter(
                                    (u) =>
                                        u.role ===
                                        "researcher"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

            </div>

            {/* USER TABLE */}

            <div className="analytics-card analytics-table-card">

                <div className="analytics-card-header">

                    <div>
                        <h2>
                            System Users
                        </h2>

                        <p>
                            Registered healthcare system
                            accounts
                        </p>
                    </div>

                </div>

                {users.length === 0 ? (

                    <div className="analytics-empty">
                        No users found.
                    </div>

                ) : (

                    <div className="analytics-table-wrapper">

                        <table className="analytics-table">

                            <thead>

                                <tr>
                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {users.map((user) => (

                                    <tr
                                        key={user.id}
                                    >

                                        <td>
                                            #{user.id}
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    user.name
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                user.email
                                            }
                                        </td>

                                        <td>

                                            <span
                                                className="analytics-risk-badge low"
                                            >
                                                {user.role}
                                            </span>

                                        </td>

                                        <td>

                                            <span
                                                className="report-status"
                                            >
                                                Active
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};

export default Users;