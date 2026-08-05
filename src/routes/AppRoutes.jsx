import { BrowserRouter, Routes, Route } from "react-router-dom";

// Authentication
import Login from "../pages/auth/Login";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminPatient from "../pages/admin/AdminPatient";
import AdminDoctors from "../pages/admin/AdminDoctors";
import AdminReports from "../pages/admin/AdminReports";
import AdminProfile from "../pages/admin/AdminProfile";

// Doctor Pages
import Dashboard from "../pages/doctor/Dashboard";
import Patients from "../pages/doctor/Patients";
import PatientDetails from "../pages/doctor/PatientDetails";
import Prediction from "../pages/doctor/Prediction";
import Profile from "../pages/doctor/Profile";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Login */}
                <Route path="/" element={<Login />} />

                {/* Admin */}
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/patients"
                    element={<AdminPatient />}
                />

                <Route
                    path="/admin/doctors"
                    element={<AdminDoctors />}
                />

                <Route
                    path="/admin/reports"
                    element={<AdminReports />}
                />

                <Route
                    path="/admin/profile"
                    element={<AdminProfile />}
                />

                {/* Doctor */}
                <Route
                    path="/doctor/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/doctor/patients"
                    element={<Patients />}
                />

                <Route
                    path="/doctor/patient-details"
                    element={<PatientDetails />}
                />

                <Route
                    path="/doctor/prediction"
                    element={<Prediction />}
                />

                <Route
                    path="/doctor/profile"
                    element={<Profile />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default AppRoutes;