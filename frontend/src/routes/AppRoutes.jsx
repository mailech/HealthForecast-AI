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
import ExportAnalytics from "../pages/ExportAnalytics";

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
          DOCTOR
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
          HOSPITAL ADMINISTRATOR
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
          HEALTHCARE RESEARCHER
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
          SYSTEM ADMINISTRATOR
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
          SHARED PATIENT / ANALYTICS PAGES
          
          Doctor
          Hospital Administrator
          System Administrator
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
          EXPORT ANALYTICS
          
          Hospital Administrator:
          → Hospital analytics export

          System Administrator:
          → Same export page
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Hospital Administrator",
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/export"
          element={<ExportAnalytics />}
        />

      </Route>


      {/* =====================================================
          READMISSION
          
          Doctor:
          → Patient readmission prediction

          Hospital Administrator:
          → Hospital-wide readmission statistics

          System Administrator:
          → Same readmission prediction page as Doctor
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
          path="/readmission"
          element={<Readmission />}
        />

      </Route>


      {/* =====================================================
          AI RISK PREDICTION + TREATMENT
          
          Doctor:
          → Allowed

          System Administrator:
          → Allowed

          Hospital Administrator:
          → NOT allowed
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
          path="/treatment"
          element={<Treatment />}
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;