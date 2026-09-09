import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Default role
    const [role, setRole] = useState("doctor");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // ==========================================
    // LOGIN
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data = await login(
                email,
                password,
                role
            );


            if (data.success) {

                const userRole = String(
                    data.user?.role || role
                )
                    .trim()
                    .toLowerCase();


                // ==========================================
                // HOSPITAL ADMIN
                // ==========================================

                if (
                    userRole === "hospital_admin" ||
                    userRole === "admin"
                ) {

                    navigate("/admin-dashboard");

                }


                // ==========================================
                // DOCTOR
                // ==========================================

                else if (userRole === "doctor") {

                    navigate("/dashboard");

                }


                // ==========================================
                // RESEARCHER
                // ==========================================

                else if (userRole === "researcher") {

                    navigate("/researcher-dashboard");

                }


                // ==========================================
                // SYSTEM ADMINISTRATOR
                // ==========================================

                else if (userRole === "system_admin") {

                    // Temporary:
                    // Separate System Admin dashboard
                    // will be created next.

                    navigate("/admin-dashboard");

                }


                else {

                    setError(
                        "Your account role is not supported."
                    );

                }

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Invalid email, password or selected role"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">


            {/* ==========================================
                LEFT SECTION
            ========================================== */}

            <div className="login-left">

                <div className="brand">

                    <div className="brand-icon">
                        +
                    </div>

                    <div>

                        <h2>
                            Final Healthcare
                        </h2>

                        <span>
                            Healthcare Management Platform
                        </span>

                    </div>

                </div>


                <div className="hero-content">

                    <div className="small-badge">
                        AI-POWERED HEALTHCARE
                    </div>


                    <h1>

                        Smarter healthcare.

                        <br />

                        <span>
                            Better patient care.
                        </span>

                    </h1>


                    <p>

                        Manage patients, analyze health risks
                        and monitor healthcare activities
                        from one secure platform.

                    </p>


                    <div className="feature-list">


                        <div className="feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Patient Management
                                </strong>

                                <span>
                                    Centralized patient information
                                </span>

                            </div>

                        </div>


                        <div className="feature">

                            <div className="feature-icon">
                                ✦
                            </div>

                            <div>

                                <strong>
                                    AI Risk Prediction
                                </strong>

                                <span>
                                    Intelligent healthcare insights
                                </span>

                            </div>

                        </div>


                        <div className="feature">

                            <div className="feature-icon">
                                ◈
                            </div>

                            <div>

                                <strong>
                                    Secure Access
                                </strong>

                                <span>
                                    Role-based healthcare security
                                </span>

                            </div>

                        </div>


                    </div>

                </div>


                <div className="left-footer">

                    © 2026 Final Healthcare · Secure Healthcare Platform

                </div>

            </div>


            {/* ==========================================
                RIGHT SECTION
            ========================================== */}

            <div className="login-right">

                <div className="login-card">


                    <div className="mobile-logo">

                        <div className="brand-icon">
                            +
                        </div>

                    </div>


                    <div className="login-heading">

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to access your healthcare dashboard
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>


                        {/* ==========================================
                            ROLE
                        ========================================== */}

                        <div className="form-group">

                            <label htmlFor="role">
                                Select Role
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    👤
                                </span>


                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) =>
                                        setRole(e.target.value)
                                    }
                                    required
                                >

                                    <option value="doctor">
                                        👨‍⚕️ Doctor
                                    </option>

                                    <option value="hospital_admin">
                                        🏥 Hospital Administrator
                                    </option>

                                    <option value="researcher">
                                        🔬 Researcher
                                    </option>

                                    <option value="system_admin">
                                        ⚙️ System Administrator
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* ==========================================
                            EMAIL
                        ========================================== */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* ==========================================
                            PASSWORD
                        ========================================== */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* ==========================================
                            ERROR
                        ========================================== */}

                        {error && (

                            <div className="login-error">

                                <span>
                                    !
                                </span>

                                {error}

                            </div>

                        )}


                        {/* ==========================================
                            LOGIN BUTTON
                        ========================================== */}

                        <button
                            className="login-button"
                            type="submit"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <span className="spinner"></span>
                                    Signing in...
                                </>

                            ) : (

                                <>
                                    Sign in

                                    <span>
                                        →
                                    </span>
                                </>

                            )}

                        </button>


                    </form>


                    {/* ==========================================
                        DEMO ACCOUNTS
                    ========================================== */}

                    <div className="demo-account">

                        <div className="demo-title">

                            <span>
                                Demo Accounts
                            </span>

                        </div>


                        {/* DOCTOR */}

                        <div className="demo-role">
                            DOCTOR
                        </div>

                        <div className="demo-row">

                            <span>
                                Email
                            </span>

                            <strong>
                                doctor@gmail.com
                            </strong>

                        </div>

                        <div className="demo-row">

                            <span>
                                Password
                            </span>

                            <strong>
                                doctor123
                            </strong>

                        </div>


                        {/* ADMIN */}

                        <div className="demo-role admin-demo">
                            ADMIN
                        </div>

                        <div className="demo-row">

                            <span>
                                Email
                            </span>

                            <strong>
                                admin@gmail.com
                            </strong>

                        </div>

                        <div className="demo-row">

                            <span>
                                Password
                            </span>

                            <strong>
                                admin123
                            </strong>

                        </div>


                        {/* RESEARCHER */}

                        <div className="demo-role">
                            RESEARCHER
                        </div>

                        <div className="demo-row">

                            <span>
                                Email
                            </span>

                            <strong>
                                researcher@gmail.com
                            </strong>

                        </div>

                        <div className="demo-row">

                            <span>
                                Password
                            </span>

                            <strong>
                                researcher123
                            </strong>

                        </div>


                    </div>


                    <p className="security-note">

                        🔐 Your information is protected with
                        secure authentication.

                    </p>


                </div>

            </div>

        </div>

    );
};

export default Login;