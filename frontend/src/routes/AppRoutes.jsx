import { Routes, Route } from "react-router-dom";

// Public Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

// Protected Pages
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import PatientDetails from "../pages/PatientDetails";
import RiskPrediction from "../pages/RiskPrediction";
import Readmission from "../pages/Readmission";
import Treatment from "../pages/Treatment";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />


      {/* =========================
          PROTECTED ROUTES
      ========================= */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/patients/:id"
          element={<PatientDetails />}
        />

        <Route
          path="/risk-prediction"
          element={<RiskPrediction />}
        />

        <Route
          path="/readmission"
          element={<Readmission />}
        />

        <Route
          path="/treatment"
          element={<Treatment />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;