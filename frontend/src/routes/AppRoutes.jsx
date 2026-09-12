import { Routes, Route } from "react-router-dom";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";


// =========================================================
// EXISTING PAGES
// =========================================================

import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import PatientDetails from "../pages/PatientDetails";
import RiskPrediction from "../pages/RiskPrediction";
import Readmission from "../pages/Readmission";
import Treatment from "../pages/Treatment";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";


// =========================================================
// DOCTOR-SPECIFIC PAGES
// =========================================================

import CareRecommendations from "../pages/CareRecommendations";
import FollowUpPlanning from "../pages/FollowUpPlanning";


// =========================================================
// ROLE-SPECIFIC DASHBOARDS
// =========================================================

import HospitalDashboard from "../pages/HospitalDashboard";
import ResearchDashboard from "../pages/ResearchDashboard";
import SystemAdminDashboard from "../pages/SystemAdminDashboard";


// =========================================================
// PROTECTED ROUTE
// =========================================================

import ProtectedRoute from "../components/ProtectedRoute";


function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* =====================================================
          PROFILE
          ALL AUTHENTICATED USERS
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "Hospital Administrator",
              "Healthcare Researcher",
              "System Administrator",
            ]}
          />
        }
      >
        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>


      {/* =====================================================
          DOCTOR DASHBOARD
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["Doctor"]}
          />
        }
      >

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/care-recommendations"
          element={<CareRecommendations />}
        />

        <Route
          path="/follow-up-planning"
          element={<FollowUpPlanning />}
        />

      </Route>


      {/* =====================================================
          HOSPITAL ADMINISTRATOR DASHBOARD
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["Hospital Administrator"]}
          />
        }
      >

        <Route
          path="/hospital-dashboard"
          element={<HospitalDashboard />}
        />

      </Route>


      {/* =====================================================
          HEALTHCARE RESEARCHER DASHBOARD
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["Healthcare Researcher"]}
          />
        }
      >

        <Route
          path="/research-dashboard"
          element={<ResearchDashboard />}
        />

      </Route>


      {/* =====================================================
          SYSTEM ADMINISTRATOR DASHBOARD
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["System Administrator"]}
          />
        }
      >

        <Route
          path="/admin"
          element={<SystemAdminDashboard />}
        />

      </Route>


      {/* =====================================================
          SHARED AUTHENTICATED PAGES
          Backend still enforces detailed permissions.
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "Hospital Administrator",
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/patients/:id"
          element={<PatientDetails />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

      </Route>


      {/* =====================================================
          DOCTOR + SYSTEM ADMIN
          AI PREDICTION FEATURES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "System Administrator",
            ]}
          />
        }
      >

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

      </Route>

    </Routes>
  );
}

export default AppRoutes;