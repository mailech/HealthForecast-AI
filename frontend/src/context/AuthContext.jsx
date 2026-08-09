import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const AuthContext = createContext();

export const ROLES = {
  DOCTOR: "Doctor",
  ADMINISTRATOR: "Hospital Administrator",
  RESEARCHER: "Healthcare Researcher",
  SYSTEM_ADMIN: "System Administrator",
};

// Access Matrix Permissions mapping (matching PDF Page 6)
const PERMISSIONS = {
  [ROLES.DOCTOR]: {
    patientScope: "Assigned Patients Only",
    canViewPatientRecords: true,
    canViewMedicalHistory: true,
    canViewRiskPrediction: true,
    canAccessReadmissionForecast: true,
    canViewTreatmentEffectiveness: true,
    hospitalAnalyticsAccess: "Limited",
    canViewPopulationHealth: false,
    canExportResearchData: false,
    canManageUsers: false,
    canManageAIModel: false,
  },
  [ROLES.ADMINISTRATOR]: {
    patientScope: "View Only (Hospital-wide)",
    canViewPatientRecords: true,
    canViewMedicalHistory: true,
    canViewRiskPrediction: true,
    canAccessReadmissionForecast: true,
    canViewTreatmentEffectiveness: true,
    hospitalAnalyticsAccess: "Full Access",
    canViewPopulationHealth: true,
    canExportResearchData: false,
    canManageUsers: false,
    canManageAIModel: false,
  },
  [ROLES.RESEARCHER]: {
    patientScope: "Anonymized Only",
    canViewPatientRecords: true,
    canViewMedicalHistory: true,
    canViewRiskPrediction: true, // Aggregated
    canAccessReadmissionForecast: true, // Aggregated
    canViewTreatmentEffectiveness: true,
    hospitalAnalyticsAccess: "Aggregated Only",
    canViewPopulationHealth: true,
    canExportResearchData: true,
    canManageUsers: false,
    canManageAIModel: false,
  },
  [ROLES.SYSTEM_ADMIN]: {
    patientScope: "Full System Access",
    canViewPatientRecords: true,
    canViewMedicalHistory: true,
    canViewRiskPrediction: true,
    canAccessReadmissionForecast: true,
    canViewTreatmentEffectiveness: true,
    hospitalAnalyticsAccess: "Full Access",
    canViewPopulationHealth: true,
    canExportResearchData: true,
    canManageUsers: true,
    canManageAIModel: true,
  },
};

export function AuthProvider({ children }) {
  // Default active role: Doctor
  const [currentRole, setCurrentRole] = useState(ROLES.DOCTOR);

  const switchRole = (newRole) => {
    if (Object.values(ROLES).includes(newRole)) {
      setCurrentRole(newRole);
      toast.success(`Switched RBAC Role to "${newRole}"`, {
        description: `Permissions updated per PDF Page 6 Access Matrix (${PERMISSIONS[newRole].hospitalAnalyticsAccess}).`,
      });
    }
  };

  const userPermissions = PERMISSIONS[currentRole];

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        switchRole,
        userPermissions,
        ROLES,
        PERMISSIONS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
