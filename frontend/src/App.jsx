import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Patients from "./pages/Patients";
import Prediction from "./pages/Prediction";
import MyHealth from "./pages/MyHealth";
import Settings from "./pages/Settings";
import AdmissionHistory from "./pages/AdmissionHistory";
import ClinicalAnalytics from "./pages/ClinicalAnalytics";
import Research from "./pages/Research";
import Optimization from "./pages/Optimization";


// ============================================================
// BASIC PROTECTED ROUTE
// ============================================================

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("hf_token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ============================================================
// ROLE PROTECTED ROUTE
// ============================================================

function RoleRoute({ allowedRoles, children }) {
  const userData = localStorage.getItem("user");
  const token = localStorage.getItem("hf_token");

  if (!userData || !token) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("hf_token");

    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


// ============================================================
// APP
// ============================================================

function App() {
  return (
    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* SIGNUP */}

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* DASHBOARD - ALL LOGGED-IN USERS */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* PATIENTS - ADMIN, DOCTOR, STAFF */}

      <Route
        path="/patients"
        element={
          <RoleRoute
            allowedRoles={[
              "admin",
              "doctor",
              "staff",
            ]}
          >
            <Patients />
          </RoleRoute>
        }
      />

      {/* PREDICTION - ADMIN, DOCTOR */}

      <Route
        path="/prediction"
        element={
          <RoleRoute
            allowedRoles={[
              "admin",
              "doctor",
            ]}
          >
            <Prediction />
          </RoleRoute>
        }
      />

      {/* ADMISSION HISTORY */}

      <Route
        path="/admission-history"
        element={
          <ProtectedRoute>
            <AdmissionHistory />
          </ProtectedRoute>
        }
      />

      {/* CLINICAL ANALYTICS */}

      <Route
        path="/clinical-analytics"
        element={
          <ProtectedRoute>
            <ClinicalAnalytics />
          </ProtectedRoute>
        }
      />

      {/* RESEARCH - ADMIN, DOCTOR, RESEARCHER */}

      <Route
        path="/research"
        element={
          <RoleRoute
            allowedRoles={[
              "admin",
              "doctor",
              "researcher",
            ]}
          >
            <Research />
          </RoleRoute>
        }
      />

      {/* OPTIMIZATION */}

      <Route
        path="/optimization"
        element={
          <ProtectedRoute>
            <Optimization />
          </ProtectedRoute>
        }
      />

      {/* USER MANAGEMENT - ADMIN ONLY */}

      <Route
        path="/users"
        element={
          <RoleRoute
            allowedRoles={[
              "admin",
            ]}
          >
            <UserManagement />
          </RoleRoute>
        }
      />

      {/* MY HEALTH - PATIENT */}

      <Route
        path="/my-health"
        element={
          <RoleRoute
            allowedRoles={[
              "patient",
            ]}
          >
            <MyHealth />
          </RoleRoute>
        }
      />

      {/* SETTINGS */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* DEFAULT */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App; 