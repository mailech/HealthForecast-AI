import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Patients from "./pages/Patients/Patients";
import Analytics from "./pages/Analytics/Analytics";
import Reports from "./pages/Reports/Reports";
import ClinicalDecisionSupport from "./pages/ClinicalDecisionSupport/ClinicalDecisionSupport.jsx";


// ---------------------------------------------------------
// Get logged-in user
// ---------------------------------------------------------
function getStoredUser() {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Unable to read logged-in user:", error);
    return null;
  }
}


// ---------------------------------------------------------
// Basic Protected Route
// ---------------------------------------------------------
function ProtectedRoute({ children }) {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}


// ---------------------------------------------------------
// Role Protected Route
// ---------------------------------------------------------
function RoleProtectedRoute({ children, allowedRoles }) {
  const accessToken = localStorage.getItem("access_token");
  const user = getStoredUser();
  const location = useLocation();

  // -------------------------------------------------------
  // Not authenticated
  // -------------------------------------------------------
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  // -------------------------------------------------------
  // Invalid/missing user information
  // -------------------------------------------------------
  if (!user || !user.role) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }

  // -------------------------------------------------------
  // Role does not have permission
  // -------------------------------------------------------
  if (!allowedRoles.includes(user.role)) {
    return (
      <AccessRestricted
        userRole={user.role}
        requestedPath={location.pathname}
      />
    );
  }

  return children;
}


// ---------------------------------------------------------
// Access Restricted Page
// ---------------------------------------------------------
function AccessRestricted({ userRole, requestedPath }) {
  const roleLabels = {
    doctor: "Doctor",
    hospital_admin: "Hospital Administrator",
    healthcare_researcher: "Healthcare Researcher",
    system_admin: "System Administrator",
  };

  const roleLabel = roleLabels[userRole] || "User";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">

      <div className="w-full max-w-lg">

        <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl sm:p-10">

          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
            </svg>

          </div>


          {/* Heading */}
          <div className="mt-6 text-center">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
              HealthForecast AI
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Access Restricted
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Your current workspace does not have permission to access this
              section of the healthcare platform.
            </p>

          </div>


          {/* Current workspace */}
          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <div className="flex items-start gap-3">

              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-600"
                >
                  <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>

              </div>


              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Current workspace
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {roleLabel}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Role-based access control is active.
                </p>

              </div>

            </div>

          </div>


          {/* Requested resource */}
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">

            <p className="text-xs font-semibold text-red-500">
              Requested resource
            </p>

            <p className="mt-1 break-all text-sm font-medium text-red-700">
              {requestedPath}
            </p>

          </div>


          {/* Return to dashboard */}
          <div className="mt-7">

            <a
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700"
            >
              Return to Dashboard

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>

            </a>

          </div>


          {/* Security note */}
          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
            HealthForecast AI protects clinical and research information using
            role-based access controls.
          </p>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// Application Routes
// =========================================================
function AppRoutes() {

  /*
   * IMPORTANT:
   *
   * useLocation() makes this component re-render whenever
   * React Router navigation occurs.
   *
   * This means after Sidebar removes the token and navigates
   * to "/", the latest localStorage value is read again.
   */
  useLocation();

  const accessToken = localStorage.getItem("access_token");

  return (
    <Routes>

      {/* =================================================
          Authentication
      ================================================= */}
      <Route
        path="/"
        element={
          accessToken ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />


      {/* =================================================
          Dashboard
          All authenticated roles
      ================================================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          Patients
          Doctor + System Administrator
      ================================================= */}
      <Route
        path="/patients"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              "doctor",
              "system_admin",
            ]}
          >
            <Patients />
          </RoleProtectedRoute>
        }
      />


      {/* =================================================
          Analytics
          All authenticated roles
      ================================================= */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          Reports
          All authenticated roles
      ================================================= */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          Clinical Decision Support
          Doctor only
      ================================================= */}
      <Route
        path="/clinical-decision-support"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              "doctor",
            ]}
          >
            <ClinicalDecisionSupport />
          </RoleProtectedRoute>
        }
      />


      {/* =================================================
          Unknown Route
      ================================================= */}
      <Route
        path="*"
        element={
          <Navigate
            to={accessToken ? "/dashboard" : "/"}
            replace
          />
        }
      />

    </Routes>
  );
}


// =========================================================
// Root Application
// =========================================================
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}


export default App;