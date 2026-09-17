import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Patients from "./pages/Patients";
import Prediction from "./pages/Prediction";
import Settings from "./pages/Settings";
import AdmissionHistory from "./pages/AdmissionHistory";
import ClinicalAnalytics from "./pages/ClinicalAnalytics";
import Research from "./pages/Research";
import Reports from "./pages/Reports";
import Optimization from "./pages/Optimization";

import ResearchCohort from "./pages/ResearchCohort";
import ResearchInsights from "./pages/ResearchInsights";
import ResearchDataset from "./pages/ResearchDataset";
import ResearchMLPerformance from "./pages/ResearchMLPerformance";
import ResearchObservations from "./pages/ResearchObservations";

import MainLayout from "./layouts/MainLayout";


function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("hf_token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


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

  if (!allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}


function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />


      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />


      <Route
        path="/patients"
        element={
          <RoleRoute allowedRoles={["admin", "doctor", "staff"]}>
            <MainLayout>
              <Patients />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/prediction"
        element={
          <RoleRoute allowedRoles={["admin", "doctor"]}>
            <MainLayout>
              <Prediction />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/admission-history"
        element={
          <AppLayout>
            <AdmissionHistory />
          </AppLayout>
        }
      />


      <Route
        path="/clinical-analytics"
        element={
          <AppLayout>
            <ClinicalAnalytics />
          </AppLayout>
        }
      />


      <Route
        path="/reports"
        element={
          <RoleRoute allowedRoles={["admin", "doctor"]}>
            <MainLayout>
              <Reports />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/research"
        element={
          <RoleRoute allowedRoles={["admin", "doctor", "researcher"]}>
            <MainLayout>
              <Research />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/research/cohort"
        element={
          <RoleRoute allowedRoles={["researcher"]}>
            <MainLayout>
              <ResearchCohort />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/research/insights"
        element={
          <RoleRoute allowedRoles={["researcher"]}>
            <MainLayout>
              <ResearchInsights />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/research/dataset"
        element={
          <RoleRoute allowedRoles={["researcher"]}>
            <MainLayout>
              <ResearchDataset />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/research/ml-performance"
        element={
          <RoleRoute allowedRoles={["researcher"]}>
            <MainLayout>
              <ResearchMLPerformance />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/research/observations"
        element={
          <RoleRoute allowedRoles={["researcher"]}>
            <MainLayout>
              <ResearchObservations />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/optimization"
        element={
          <AppLayout>
            <Optimization />
          </AppLayout>
        }
      />


      <Route
        path="/users"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <MainLayout>
              <UserManagement />
            </MainLayout>
          </RoleRoute>
        }
      />


      <Route
        path="/settings"
        element={
          <AppLayout>
            <Settings />
          </AppLayout>
        }
      />


      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />

    </Routes>
  );
}

export default App; 