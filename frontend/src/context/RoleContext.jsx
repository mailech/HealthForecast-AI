import React, { createContext, useContext, useState } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user") || localStorage.getItem("userData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved user from localStorage:", e);
      }
    }
    return {
      name: "Dr. John Smith",
      email: "john.smith@healthforecast.ai",
      role: "DOCTOR",
      department: "Cardiology & ICU",
    };
  });

  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem("role") || localStorage.getItem("userRole");
    if (savedRole) return savedRole;
    const savedUser = localStorage.getItem("user") || localStorage.getItem("userData");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return parsed.role;
      } catch (e) {}
    }
    return "DOCTOR";
  });

  // Role Switcher for Testing / Live Evaluation
  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userRole", newRole);

    // Update user profile details to match role
    let updatedUser = { ...user, role: newRole };
    if (newRole === "DOCTOR") {
      updatedUser = {
        name: "Dr. John Smith",
        email: "john.smith@healthforecast.ai",
        role: "DOCTOR",
        department: "Cardiology & ICU",
      };
    } else if (newRole === "HOSPITAL_ADMIN") {
      updatedUser = {
        name: "Admin Sarah Jenkins",
        email: "admin@healthforecast.ai",
        role: "HOSPITAL_ADMIN",
        department: "Hospital Administration",
      };
    } else if (newRole === "RESEARCHER") {
      updatedUser = {
        name: "Dr. Alan Turing",
        email: "researcher@healthforecast.ai",
        role: "RESEARCHER",
        department: "Population Health & Research",
      };
    } else if (newRole === "SYS_ADMIN") {
      updatedUser = {
        name: "Super Admin",
        email: "sysadmin@healthforecast.ai",
        role: "SYS_ADMIN",
        department: "IT & Platform Governance",
      };
    }

    setUser(updatedUser);
    localStorage.setItem("userName", updatedUser.name);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  const login = (userData, token) => {
    const userRole = userData.role || "DOCTOR";
    setRole(userRole);
    setUser(userData);
    localStorage.setItem("token", token || "mock_jwt_token_2026");
    localStorage.setItem("role", userRole);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userName", userData.name || "");
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  return (
    <RoleContext.Provider value={{ role, setRole: switchRole, user, setUser, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
