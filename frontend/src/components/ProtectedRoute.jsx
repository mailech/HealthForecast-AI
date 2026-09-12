import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User information missing
  if (!userData) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // If this route has role restrictions,
  // check the logged-in user's role.
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // User is authenticated but does not have permission.
    // Send them to their own dashboard.
    if (user.role === "Doctor") {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.role === "Hospital Administrator") {
      return <Navigate to="/hospital-dashboard" replace />;
    }

    if (user.role === "Healthcare Researcher") {
      return <Navigate to="/research-dashboard" replace />;
    }

    if (user.role === "System Administrator") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;