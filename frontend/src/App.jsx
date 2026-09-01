import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { SocketProvider } from "./context/SocketContext";
import { RoleProvider } from "./context/RoleContext";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        {/* Global Toast Notification Container (Positioned bottom-right to avoid obstructing top navbar & profile menu) */}
        <Toaster position="bottom-right" richColors closeButton duration={2500} />

        <Routes>
          {/* Unauthenticated Login & Reset Password Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Authenticated Dashboard Routes wrapped with SocketProvider */}
          <Route
            element={
              <SocketProvider>
                <MainLayout />
              </SocketProvider>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;