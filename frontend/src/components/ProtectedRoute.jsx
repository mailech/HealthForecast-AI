import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // =========================================================
  // USER DATA MISSING
  // =========================================================

  if (!userData) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // =========================================================
  // READ USER DATA
  // =========================================================

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // =========================================================
  // USER ROLE MISSING
  // =========================================================

  if (!user?.role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // =========================================================
  // ROLE-BASED ACCESS CONTROL
  // =========================================================

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // -------------------------------------------------------
    // REDIRECT USER TO THEIR OWN DASHBOARD
    // -------------------------------------------------------

    const dashboardByRole = {
      Doctor: "/dashboard",
      "Hospital Administrator": "/hospital-dashboard",
      "Healthcare Researcher": "/research-dashboard",
      "System Administrator": "/admin",
    };

    const dashboard = dashboardByRole[user.role];

    if (dashboard) {
      return <Navigate to={dashboard} replace />;
    }

    // Unknown role
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;