import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


function Navbar() {
  const [user, setUser] = useState(null);

  const location = useLocation();


  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Unable to read logged-in user:",
          error
        );
      }
    }
  }, []);


  const getRoleLabel = (role) => {
    switch (role) {
      case "doctor":
        return "Doctor";

      case "hospital_admin":
        return "Hospital Administrator";

      case "healthcare_researcher":
        return "Healthcare Researcher";

      case "system_admin":
        return "System Administrator";

      default:
        return "User";
    }
  };


  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";

      case "/patients":
        return "Patients";

      case "/analytics":
        return "Analytics";

      case "/reports":
        return "Reports";

      case "/clinical-decision-support":
        return "Clinical Decision Support";

      default:
        return "HealthForecast AI";
    }
  };


  return (
    <nav className="flex h-20 items-center justify-between border-b bg-white px-8 shadow-sm">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-cyan-700">
          {getPageTitle()}
        </h1>
      </div>


      {/* User Information */}
      <div className="text-right">

        <p className="text-lg font-bold text-gray-900">
          Welcome, {user?.name || "User"} 👋
        </p>

        {user?.role && (
          <p className="text-sm text-gray-500">
            {getRoleLabel(user.role)}
          </p>
        )}

      </div>

    </nav>
  );
}


export default Navbar;