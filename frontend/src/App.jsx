import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import RiskPrediction from "./pages/RiskPrediction";
import CareRecommendations from "./pages/CareRecommendations";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";

function decodeToken() {
  try {
    const token = localStorage.getItem("hf_token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function AdminRoute({ children }) {
  const payload = decodeToken();
  if (payload?.role !== "system_admin") {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/risk-prediction" element={<RiskPrediction />} />
        <Route path="/care-recommendations" element={<CareRecommendations />} />
        <Route path="/reports" element={<Reports />} />
        <Route
          path="/user-management"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;