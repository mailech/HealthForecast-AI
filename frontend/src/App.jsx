import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import RiskPrediction from "./pages/RiskPrediction";
import Readmission from "./pages/Readmission";
import Treatment from "./pages/Treatment";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import AdminDashboard from "./pages/AdminDashboard";
import AddDoctor from "./pages/AddDoctor";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";


// ==========================================
// PROTECTED ROUTE
// ==========================================

const ProtectedRoute = ({ children, allowedRoles }) => {

    const { user } = useAuth();

    const token = localStorage.getItem("token");

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const role = String(user.role || "")
        .trim()
        .toLowerCase();

    if (
        allowedRoles &&
        !allowedRoles.includes(role)
    ) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    return children;
};


// ==========================================
// UNAUTHORIZED
// ==========================================

const Unauthorized = () => {

    const { user } = useAuth();

    const role = user?.role || "Unknown";

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "12px",
                fontFamily: "Arial, sans-serif"
            }}
        >

            <h1 style={{ fontSize: "64px", margin: 0 }}>
                403
            </h1>

            <h2>
                Access Denied
            </h2>

            <p>
                Your role does not have permission
                to access this page.
            </p>

            <strong>
                Current role: {role}
            </strong>

            <button
                onClick={() => window.history.back()}
                style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                }}
            >
                Go Back
            </button>

        </div>
    );
};


// ==========================================
// APP
// ==========================================

function App() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* ==========================
                        LOGIN
                    ========================== */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />


                    {/* ==========================
                        ROOT → LOGIN
                    ========================== */}

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />


                    {/* ==========================
                        DOCTOR DASHBOARD
                    ========================== */}

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor"
                                ]}
                            >
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        RESEARCHER DASHBOARD
                    ========================== */}

                    <Route
                        path="/researcher-dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "researcher"
                                ]}
                            >
                                <ResearcherDashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        SYSTEM ADMIN DASHBOARD
                    ========================== */}

                    <Route
                        path="/system-admin-dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "system_admin"
                                ]}
                            >
                                <SystemAdminDashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        PATIENTS
                        Doctor + Admin
                    ========================== */}

                    <Route
                        path="/patients"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor",
                                    "hospital_admin",
                                    "admin",
                                    "system_admin"
                                ]}
                            >
                                <Patients />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        PATIENT DETAILS
                    ========================== */}

                    <Route
                        path="/patients/:id"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor",
                                    "hospital_admin",
                                    "admin",
                                    "system_admin"
                                ]}
                            >
                                <PatientDetails />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        AI RISK PREDICTION
                        Doctor + Researcher
                    ========================== */}

                    <Route
                        path="/risk-prediction"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor",
                                    "researcher"
                                ]}
                            >
                                <RiskPrediction />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        READMISSION
                        Doctor + Admin + Researcher
                    ========================== */}

                    <Route
                        path="/readmission"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor",
                                    "hospital_admin",
                                    "admin",
                                    "researcher",
                                    "system_admin"
                                ]}
                            >
                                <Readmission />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        TREATMENT
                        Doctor only
                    ========================== */}

                    <Route
                        path="/treatment"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor"
                                ]}
                            >
                                <Treatment />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        ANALYTICS
                        Doctor + Admin + Researcher
                    ========================== */}

                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor",
                                    "hospital_admin",
                                    "admin",
                                    "researcher",
                                    "system_admin"
                                ]}
                            >
                                <Analytics />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        REPORTS
                        Doctor + Admin + Researcher
                    ========================== */}

                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "doctor",
                                    "hospital_admin",
                                    "admin",
                                    "researcher",
                                    "system_admin"
                                ]}
                            >
                                <Reports />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        USERS
                        ADMIN ONLY
                    ========================== */}

                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "hospital_admin",
                                    "admin",
                                    "system_admin"
                                ]}
                            >
                                <Users />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        ADD DOCTOR
                        ADMIN ONLY
                    ========================== */}

                    <Route
                        path="/add-doctor"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "hospital_admin",
                                    "admin",
                                    "system_admin"
                                ]}
                            >
                                <AddDoctor />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        ADMIN DASHBOARD
                    ========================== */}

                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "hospital_admin",
                                    "admin",
                                    "system_admin"
                                ]}
                            >
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* ==========================
                        UNAUTHORIZED
                    ========================== */}

                    <Route
                        path="/unauthorized"
                        element={<Unauthorized />}
                    />


                    {/* ==========================
                        UNKNOWN URL
                    ========================== */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;